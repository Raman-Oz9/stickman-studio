#!/usr/bin/env python3
"""board.json -> narration.wav + board with scene durations fitted to the spoken lines.
Narration is synthesised per SENTENCE (scenes that are fragments of one sentence are joined) so prosody never breaks,
then the audio is cut back into the scenes at the quietest point nearest the proportional word boundary.
usage (repo root): PYTHONPATH=. python3 remotion/scripts/make_voice.py board.json outdir"""
import json, os, re, sys
import numpy as np
import soundfile as sf
from stickman_studio import voice

SR = 24000
FPS = 30
SILENT_CHARS = 10   # weight of a narration-less scene (fly pass) inside a sentence group
END = re.compile(r"[.!?…][\"')\]]*\s*$")

def load(path, i, out, text):
    wav = os.path.join(out, f"g{i}.wav")
    voice.synth(text, wav)
    a, sr = sf.read(wav, dtype="float32")
    if a.ndim > 1: a = a.mean(axis=1)
    if sr != SR:
        idx = np.linspace(0, len(a) - 1, int(len(a) * SR / sr)); a = np.interp(idx, np.arange(len(a)), a).astype("float32")
    nz = np.where(np.abs(a) > 0.01)[0]
    if len(nz): a = a[max(0, nz[0] - int(0.015 * SR)): nz[-1] + int(0.09 * SR)]
    return a

def quiet_cut(a, target, win=0.18):
    """sample index of the lowest-energy point within +-win s of target"""
    lo, hi = max(1, int(target - win * SR)), min(len(a) - 1, int(target + win * SR))
    if hi <= lo: return int(target)
    seg = np.abs(a[lo:hi]); k = int(0.02 * SR)
    sm = np.convolve(seg, np.ones(k) / k, "same")
    return lo + int(np.argmin(sm))

def main(board_path, out):
    os.makedirs(out, exist_ok=True)
    b = json.load(open(board_path)); sc = b["scenes"]
    texts = [(s.get("narration") or s.get("caption") or "").strip() for s in sc]
    # group scenes into sentences
    groups, cur = [], []
    for i, t in enumerate(texts):
        cur.append(i)
        if t and END.search(t): groups.append(cur); cur = []
    if cur: groups.append(cur)
    parts = []
    for gi, g in enumerate(groups):
        text = " ".join(texts[i] for i in g if texts[i]).strip()
        if not text:
            for i in g:
                d = round(min(float(sc[i]["dur"]), 0.5) * FPS) / FPS; sc[i]["dur"] = d; parts.append(np.zeros(int(round(d * SR)), dtype="float32"))
            continue
        a = load(None, gi, out, text)
        a = a * np.minimum(1, np.arange(len(a)) / (0.01 * SR))
        w = np.array([max(len(texts[i]), 1) if texts[i] else SILENT_CHARS for i in g], dtype=float)
        edges = [0] + [quiet_cut(a, len(a) * float(w[:k + 1].sum() / w.sum())) for k in range(len(g) - 1)] + [len(a)]
        for k, i in enumerate(g):
            seg = a[edges[k]: edges[k + 1]]
            dur = max(0.6, len(seg) / SR + (0.12 if k == len(g) - 1 else 0.0))   # breath only at sentence end
            dur = round(dur * FPS) / FPS
            sc[i]["dur"] = dur
            buf = np.zeros(int(round(dur * SR)), dtype="float32"); buf[: min(len(buf), len(seg))] = seg[: len(buf)]
            parts.append(buf)
            print(f"scene {i}: {dur:.2f}s | {texts[i][:50]}")
    full = np.concatenate(parts)
    sf.write(os.path.join(out, "raw.wav"), full, SR)
    voice.master(os.path.join(out, "raw.wav"), os.path.join(out, "narration.wav"))
    json.dump(b, open(os.path.join(out, "board.json"), "w"))
    print("total", round(sum(s["dur"] for s in b["scenes"]), 1), "s")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
