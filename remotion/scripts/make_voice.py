#!/usr/bin/env python3
"""board.json -> narration.wav + board with scene durations fitted to the spoken lines.
usage (repo root): PYTHONPATH=. python3 remotion/scripts/make_voice.py board.json outdir"""
import json, os, sys
import numpy as np
import soundfile as sf
from stickman_studio import voice

PAD = 0.10   # silence after each line, seconds (continuous narration: tight)
LEAD = 0.0   # silence before each line
GAP_SILENT = 0.7  # scenes with no narration (fly passes) stay short
SR = 24000

def main(board_path, out):
    os.makedirs(out, exist_ok=True)
    b = json.load(open(board_path))
    parts = []
    for i, s in enumerate(b["scenes"]):
        text = (s.get("narration") or s.get("caption") or "").strip()
        if not text:
            d0 = round(min(float(s["dur"]), GAP_SILENT) * 30) / 30; s["dur"] = d0
            parts.append(np.zeros(int(SR * d0), dtype="float32")); continue
        wav = os.path.join(out, f"s{i}.wav")
        _, secs = voice.synth(text, wav)
        a, sr = sf.read(wav, dtype="float32")
        if a.ndim > 1: a = a.mean(axis=1)
        if sr != SR:
            idx = np.linspace(0, len(a) - 1, int(len(a) * SR / sr)); a = np.interp(idx, np.arange(len(a)), a).astype("float32")
        nz = np.where(np.abs(a) > 0.012)[0]          # trim the TTS clip's own leading/trailing silence
        if len(nz): a = a[max(0, nz[0] - int(0.02 * SR)): nz[-1] + int(0.04 * SR)]
        a = a * np.minimum(1, np.arange(len(a)) / (0.01 * SR))   # tiny fade-in: no click
        dur = max(1.0, len(a) / SR + LEAD + PAD)     # scene length follows the voice, never longer
        dur = round(dur * 30) / 30  # whole frames
        s["dur"] = dur
        buf = np.zeros(int(round(dur * SR)), dtype="float32")
        buf[int(LEAD * SR): int(LEAD * SR) + len(a)] = a
        parts.append(buf)
        print(f"scene {i}: {len(a)/SR:.2f}s speech -> {dur:.2f}s | {text[:50]}")
    full = np.concatenate(parts)
    sf.write(os.path.join(out, "raw.wav"), full, SR)
    voice.master(os.path.join(out, "raw.wav"), os.path.join(out, "narration.wav"))
    json.dump(b, open(os.path.join(out, "board.json"), "w"))
    print("total", round(sum(s["dur"] for s in b["scenes"]), 1), "s")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
