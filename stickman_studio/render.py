import json, subprocess, tempfile
from pathlib import Path
from PIL import Image, ImageFilter
from .cinematic import render_frame
from .captions import write_srt
from .thumbnail import make_thumbnail
from .audio import make_voice, join_voice_clips

def _check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    except Exception as exc:
        raise RuntimeError("FFmpeg is required and must be on PATH.") from exc

def render_project(script_path, fmt="short", with_voice=False, outdir="output", fps=24):
    _check_ffmpeg()
    data = json.loads(Path(script_path).read_text(encoding="utf-8"))
    scenes = data.get("scenes", [])
    if not scenes:
        raise ValueError("The script must contain at least one scene.")
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    width, height = (720, 1280)
    with tempfile.TemporaryDirectory() as td:
        temp = Path(td)
        frames_dir = temp / "frames"
        frames_dir.mkdir()
        frame_index = 0
        voice_clips = []
        elapsed = 0.0
        for si, scene in enumerate(scenes):
            duration = float(scene.get("duration", 4))
            for j in range(max(1, int(duration * fps))):
                frame = render_frame(scene, j / fps, si, elapsed + j / fps,
                                     "short", (width, height), si * 101 + 9)
                if fmt == "long":
                    # Landscape version: cinematic blurred side-fill, with the
                    # complete vertical composition retained in the middle.
                    backdrop = frame.resize((1280, 720), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(28))
                    foreground = frame.resize((405, 720), Image.Resampling.LANCZOS)
                    backdrop.paste(foreground, ((1280 - 405)//2, 0))
                    frame = backdrop
                frame.save(frames_dir / f"frame_{frame_index:06d}.jpg", quality=94, subsampling=0)
                frame_index += 1
            elapsed += duration
            if with_voice and scene.get("narration", "").strip():
                clip = temp / f"voice_{si:03d}.mp3"
                make_voice(scene["narration"], clip)
                voice_clips.append(clip)
        silent = out / f"video_{fmt}_silent.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-framerate", str(fps),
            "-i", str(frames_dir / "frame_%06d.jpg"),
            "-c:v", "libx264", "-preset", "medium", "-crf", "19",
            "-pix_fmt", "yuv420p", "-r", str(fps), "-movflags", "+faststart",
            str(silent),
        ], check=True)
        final = out / f"video_{fmt}.mp4"
        if with_voice and voice_clips:
            voice = temp / "voice.mp3"
            join_voice_clips(voice_clips, voice)
            subprocess.run([
                "ffmpeg", "-y", "-i", str(silent), "-i", str(voice),
                "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
                "-shortest", "-c:a", "aac", "-b:a", "192k", str(final),
            ], check=True)
            silent.unlink(missing_ok=True)
        else:
            silent.replace(final)
    write_srt(scenes, out / "captions.srt")
    make_thumbnail(out / "thumbnail.png", data.get("title", "Stickman Story"))
    return final
