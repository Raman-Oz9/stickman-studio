"""Still-scene storytelling renderer with cinematic Ken Burns camera moves.

Each scene is illustrated once. The character does not walk-cycle or lip-sync;
camera pans, pushes, pulls and reframes the artwork to create a deliberate
storytelling video. Captions are baked into the illustrations and optional
free Edge TTS narration is mixed to the full runtime.
"""
import argparse
import json
import math
import subprocess
import tempfile
from pathlib import Path

from PIL import Image
from .cinematic import render_frame
from .audio import make_voice
from .captions import write_srt
from .thumbnail import make_thumbnail

W, H = 720, 1280
FPS = 24


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def camera_frame(still, camera, progress):
    """Crop a still illustration using a smooth camera move; never animate the character."""
    camera = camera or {}
    z0 = float(camera.get("from", 1.04))
    z1 = float(camera.get("to", 1.18))
    zoom = z0 + (z1 - z0) * smooth(progress)
    fx0 = float(camera.get("focus_x", 0.50))
    fy0 = float(camera.get("focus_y", 0.54))
    fx1 = float(camera.get("end_x", fx0))
    fy1 = float(camera.get("end_y", fy0))
    fx = fx0 + (fx1 - fx0) * smooth(progress)
    fy = fy0 + (fy1 - fy0) * smooth(progress)
    cw, ch = max(2, int(W / zoom)), max(2, int(H / zoom))
    cx, cy = fx * W, fy * H
    left = max(0, min(W - cw, int(cx - cw / 2)))
    top = max(0, min(H - ch, int(cy - ch / 2)))
    return still.crop((left, top, left + cw, top + ch)).resize((W, H), Image.Resampling.LANCZOS)


def render_static(data, fmt="short", outdir="output", with_voice=True):
    check = subprocess.run(["ffmpeg", "-version"], capture_output=True)
    if check.returncode:
        raise RuntimeError("FFmpeg is required and must be available on PATH.")
    scenes = data.get("scenes", [])
    if not scenes:
        raise ValueError("Story JSON must contain at least one scene.")
    if fmt != "short":
        raise ValueError("The first static-camera proof is vertical Shorts format only.")
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        temp = Path(td)
        frame_dir = temp / "frames"
        audio_dir = temp / "audio"
        frame_dir.mkdir()
        audio_dir.mkdir()
        voice_list = []
        frame_index = 0
        for si, scene in enumerate(scenes):
            duration = float(scene.get("duration", 5))
            # Render one single illustration at the scene midpoint so all
            # caption/fade elements are fully visible, then move only the camera.
            still = render_frame(scene, duration * 0.5, si, 0.0, fmt, (W, H), si * 101 + 9)
            still = still.convert("RGB")
            total_frames = max(1, int(duration * FPS))
            for fi in range(total_frames):
                progress = fi / max(1, total_frames - 1)
                frame = camera_frame(still, scene.get("camera", {}), progress)
                frame.save(frame_dir / f"frame_{frame_index:06d}.jpg", quality=95, subsampling=0)
                frame_index += 1
            if with_voice and scene.get("narration", "").strip():
                raw = audio_dir / f"voice_{si:03d}_raw.mp3"
                padded = audio_dir / f"voice_{si:03d}.mp3"
                make_voice(scene["narration"], raw)
                subprocess.run([
                    "ffmpeg", "-y", "-i", str(raw), "-af", "apad",
                    "-t", f"{duration:.3f}", "-c:a", "libmp3lame", "-b:a", "128k", str(padded)
                ], check=True, capture_output=True)
                voice_list.append(padded)

        silent = out / "static_camera_silent.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(frame_dir / "frame_%06d.jpg"),
            "-c:v", "libx264", "-preset", "medium", "-crf", "19",
            "-pix_fmt", "yuv420p", "-r", str(FPS), "-movflags", "+faststart", str(silent)
        ], check=True)
        final = out / f"static_camera_{fmt}.mp4"
        if voice_list:
            listing = temp / "audio_concat.txt"
            listing.write_text("".join(f"file '{p.as_posix()}'\\n" for p in voice_list), encoding="utf-8")
            narration = temp / "narration.mp3"
            subprocess.run([
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
                "-c:a", "libmp3lame", "-b:a", "160k", str(narration)
            ], check=True)
            subprocess.run([
                "ffmpeg", "-y", "-i", str(silent), "-i", str(narration),
                "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(final)
            ], check=True)
            silent.unlink(missing_ok=True)
        else:
            silent.replace(final)
    write_srt(scenes, out / "static_camera_captions.srt")
    make_thumbnail(out / "static_camera_thumbnail.png", data.get("title", "Small Steps, Big Change"))
    return final


def main():
    parser = argparse.ArgumentParser(description="Render a still-illustration story with cinematic camera moves.")
    parser.add_argument("script")
    parser.add_argument("--format", choices=["short"], default="short")
    parser.add_argument("--outdir", default="output")
    parser.add_argument("--no-voice", action="store_true")
    args = parser.parse_args()
    result = render_static(json.loads(Path(args.script).read_text(encoding="utf-8")),
                           args.format, args.outdir, not args.no_voice)
    print(f"Rendered static-camera story: {result}")


if __name__ == "__main__":
    main()
