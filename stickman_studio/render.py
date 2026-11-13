import json, subprocess, tempfile
from pathlib import Path
import cairosvg
from .animation import stickman_svg
from .captions import write_srt
from .thumbnail import make_thumbnail
from .audio import make_voice, join_voice_clips
def _check_ffmpeg():
    try: subprocess.run(["ffmpeg","-version"],capture_output=True,check=True)
    except Exception as exc: raise RuntimeError("FFmpeg is required and must be on PATH.") from exc
def render_project(script_path,fmt="short",with_voice=False,outdir="output",fps=24):
    _check_ffmpeg()
    data=json.loads(Path(script_path).read_text(encoding="utf-8")); scenes=data.get("scenes",[])
    if not scenes: raise ValueError("The script must contain at least one scene.")
    out=Path(outdir); out.mkdir(parents=True,exist_ok=True)
    width,height=(720,1280) if fmt=="short" else (1280,720)
    with tempfile.TemporaryDirectory() as td:
        temp=Path(td); frames_dir=temp/"frames"; frames_dir.mkdir(); frame_index=0; voice_clips=[]
        for si,scene in enumerate(scenes):
            duration=float(scene.get("duration",4)); action=scene.get("action","idle"); bg=scene.get("background","#F4F7FB"); caption=scene.get("visual","")
            for j in range(max(1,int(duration*fps))):
                svg=stickman_svg(j/fps,action,bg,caption)
                png=frames_dir/f"frame_{frame_index:06d}.png"
                cairosvg.svg2png(bytestring=svg.encode(),write_to=str(png),output_width=width,output_height=height); frame_index+=1
            if with_voice:
                clip=temp/f"voice_{si:03d}.mp3"; make_voice(scene.get("narration",""),clip); voice_clips.append(clip)
        silent=out/f"video_{fmt}_silent.mp4"
        subprocess.run(["ffmpeg","-y","-framerate",str(fps),"-i",str(frames_dir/"frame_%06d.png"),"-c:v","libx264","-pix_fmt","yuv420p","-r",str(fps),str(silent)],check=True)
        final=out/f"video_{fmt}.mp4"
        if with_voice and voice_clips:
            voice=temp/"voice.mp3"; join_voice_clips(voice_clips,voice)
            subprocess.run(["ffmpeg","-y","-i",str(silent),"-i",str(voice),"-map","0:v:0","-map","1:a:0","-c:v","copy","-shortest","-c:a","aac","-b:a","192k",str(final)],check=True); silent.unlink(missing_ok=True)
        else: silent.replace(final)
    write_srt(scenes,out/"captions.srt"); make_thumbnail(out/"thumbnail.png",data.get("title","Stickman Story"))
    return final
