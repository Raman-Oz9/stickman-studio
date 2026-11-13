"""Narration. Kokoro-82M (Apache-2.0, runs on the CPU runner) with Edge TTS as a fallback.

Default narrator: am_michael, a calm, warm young male voice. Override with NARRATOR_VOICE.
Other good young male options: am_puck (lighter, playful), am_eric, am_liam, bm_lewis (British).
"""
import asyncio
import os
import subprocess
from pathlib import Path

VOICE = os.environ.get("NARRATOR_VOICE", "am_michael")
SPEED = float(os.environ.get("NARRATOR_SPEED", "0.98"))
EDGE_VOICE = os.environ.get("EDGE_VOICE", "en-US-BrianNeural")
SAMPLE_VOICES = ["am_michael", "am_puck", "am_eric", "am_liam", "bm_lewis"]
_pipes = {}


def _kokoro(text, dest, voice):
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline
    lang = "b" if voice.startswith("b") else "a"
    pipe = _pipes.setdefault(lang, KPipeline(lang_code=lang))
    chunks = []
    for result in pipe(text, voice=voice, speed=SPEED, split_pattern=r"\n+"):
        audio = result.audio
        if audio is None:
            continue
        audio = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        chunks.append(audio)
        chunks.append(np.zeros(int(24000 * 0.12), dtype=audio.dtype))  # small breath between sentences
    if not chunks:
        raise RuntimeError("Kokoro produced no audio")
    sf.write(str(dest), np.concatenate(chunks), 24000)


def _edge(text, dest):
    import edge_tts
    mp3 = Path(dest).with_suffix(".mp3")

    async def run():
        await edge_tts.Communicate(text, EDGE_VOICE, rate="-4%", pitch="-2Hz").save(str(mp3))
    asyncio.run(run())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), "-ar", "24000", "-ac", "1", str(dest)], check=True)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


def synth(text, dest, voice=None):
    """Write narration to dest (wav). Returns (path, seconds)."""
    voice = voice or VOICE
    try:
        _kokoro(text, dest, voice)
        print(f"  voice: Kokoro {voice}")
    except Exception as exc:
        print(f"  Kokoro unavailable ({exc}); falling back to Edge {EDGE_VOICE}")
        _edge(text, dest)
    return dest, duration(dest)


def master(src, dest):
    """Light vocal polish: remove rumble, gentle compression, broadcast loudness."""
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af",
                    "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,"
                    "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", "44100", str(dest)], check=True)
