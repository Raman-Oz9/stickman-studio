import asyncio, subprocess
from pathlib import Path
def make_voice(text, output_path, voice="en-US-AriaNeural"):
    """Optional Edge TTS voice generation; requires network access."""
    try: import edge_tts
    except ImportError as exc: raise RuntimeError("Install edge-tts first: pip install edge-tts") from exc
    async def _run():
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))
    asyncio.run(_run())
def join_voice_clips(clips, output_path):
    if not clips: return False
    listing = Path(output_path).with_suffix(".txt")
    listing.write_text("".join(f"file '{Path(p).resolve().as_posix()}'\n" for p in clips), encoding="utf-8")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listing), "-c:a", "libmp3lame", str(output_path)], check=True)
    return True
