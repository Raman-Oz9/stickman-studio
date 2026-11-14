#!/usr/bin/env python3
"""Music bed + SFX for a story board, mixed under the narration.
usage: story_audio.py board.json narration.wav out_mix.wav
Music and SFX are synthesised here (numpy only). Levels follow the cartoon-short rule: music = 50 % of the voice level
(-6 dB gated RMS), SFX = 50 % or less with peaks capped below the voice peak, then one linear gain + peak limiter."""
import json, subprocess, sys
import numpy as np

SR = 44100
rng = np.random.default_rng(7)
FPS = 30

def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

def pluck(m, dur, vel=1.0):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    x = sum(np.sin(2 * np.pi * f * k * t) / (k ** 1.6) for k in (1, 2, 3, 4)) * env(n, 0.003, dur * 0.35)
    return x * vel

def pad(ms, dur, vel=1.0):
    n = int(SR * dur); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * hz(m) * t + i) + 0.4 * np.sin(2 * np.pi * hz(m) * 2.003 * t) for i, m in enumerate(ms))
    fade = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.5)
    return x * fade * vel / len(ms)

def kick(vel=1.0):
    n = int(SR * 0.22); t = np.arange(n) / SR
    f = 120 * np.exp(-t * 22) + 42
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * vel

def shaker(vel=1.0):
    n = int(SR * 0.07); x = rng.standard_normal(n)
    x = np.diff(x, prepend=0) * env(n, 0.001, 0.03)
    return x * vel * 0.5

def put(buf, x, t):
    i = int(t * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x)); buf[i:j] += x[: j - i]

# ---------------- music ----------------
PROG_DAY = [([60, 64, 67], 36), ([57, 60, 64], 33), ([53, 57, 60], 29), ([55, 59, 62], 31)]   # C Am F G
PROG_GOLD = [([53, 57, 60], 29), ([55, 59, 62], 31), ([57, 60, 64], 33), ([60, 64, 67], 36)]  # F G Am C
SCALE = [0, 2, 4, 7, 9]

def music(total, golden_from):
    buf = np.zeros(int(total * SR)); bpm = 96; beat = 60 / bpm; bar = beat * 4
    nb = int(total / bar) + 1
    for b in range(nb):
        t0 = b * bar
        prog = PROG_GOLD if golden_from is not None and t0 >= golden_from else PROG_DAY
        ch, root = prog[b % 4]
        put(buf, pad(ch, bar + 0.3, 0.55), t0)
        for k in range(4):                                     # soft kick on 1 and 3, shaker off-beats
            if k in (0, 2): put(buf, kick(0.5), t0 + k * beat)
            put(buf, shaker(0.5), t0 + k * beat + beat / 2)
        for k, off in enumerate([0, 7, 12, 7, 0, 7, 12, 16]):  # plucked bass arpeggio, eighth notes
            put(buf, pluck(root + off - 12 + 12, beat * 0.9, 0.5), t0 + k * beat / 2)
        r2 = np.random.default_rng(b)                          # a sparse pentatonic top line
        for k in range(8):
            if r2.random() < 0.45:
                put(buf, pluck(72 + int(r2.choice(SCALE)) + 12 * int(r2.random() < 0.3), beat * 1.2, 0.35), t0 + k * beat / 2)
    return buf[: int(total * SR)]

# ---------------- sfx ----------------
def whoosh(dur=0.45, peak=1.0):
    n = int(SR * dur); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    lo = np.convolve(x, np.ones(40) / 40, "same")
    sweep = np.sin(2 * np.pi * np.cumsum(300 + 2600 * (t / dur) ** 2) / SR)
    x = (0.6 * lo + 0.25 * sweep * lo) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return x * peak

def hit(vel=1.0):          # low impact for shocks
    n = int(SR * 0.9); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 4) + 38) / SR) * np.exp(-t * 4.5)
    x += 0.4 * rng.standard_normal(n) * np.exp(-t * 30)
    return x * vel

def ting(vel=1.0):         # bright reveal
    n = int(SR * 0.9); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * t) * a for f, a in ((1568, 1), (2349, .5), (3136, .3))) * np.exp(-t * 6) * vel * 0.5

def pop(vel=1.0):          # punch-in / laugh accent
    n = int(SR * 0.18); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(500 * np.exp(-t * 30) + 180) / SR) * np.exp(-t * 22) * vel

def beats(board):
    """(time, kind) events from the board: cuts, reaction punch-ins, shock hits. Mirrors camera.ts segsOf."""
    ev, t = [], 0.0
    for i, s in enumerate(board["scenes"]):
        d = float(s["dur"])
        ev.append((t, "scene"))
        react = next((c for c in s["cast"] if c.get("at2") is not None and c.get("expr2")), None)
        if react and d > 1.8:
            cut = min(0.75, max(0.3, react["at2"])); ev.append((t + cut * d, "punch"))
            if react["expr2"] in ("shock", "pained"): ev.append((t + cut * d, "hit"))
            if react["expr2"] in ("laugh", "grin"): ev.append((t + cut * d + 0.05, "pop"))
        else:
            n = max(1, round(d / 2.4))
            for k in range(1, n): ev.append((t + d * k / n, "cut"))
        if any(c.get("expr") == "shock" for c in s["cast"]) and not react: ev.append((t + 0.15, "hit"))
        if any(c.get("expr") in ("laugh", "grin") for c in s["cast"]) and not react: ev.append((t + 0.3, "pop"))
        t += d
    return ev, t

def gated_rms(x, sr=SR, win=0.4):
    n = int(win * sr); fr = x[: len(x) // n * n].reshape(-1, n); r = np.sqrt((fr ** 2).mean(axis=1))
    keep = r > r.max() * 0.1
    return float(np.sqrt((r[keep] ** 2).mean())) if keep.any() else 1e-6

def main(board_p, voice_p, out_p):
    board = json.load(open(board_p))
    v = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", voice_p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    ev, total = beats(board)
    total = max(total, len(v) / SR) + 1.2
    gold = next((sum(float(x["dur"]) for x in board["scenes"][:i]) for i, s in enumerate(board["scenes"]) if s.get("light") == "golden"), None)
    n = int(total * SR)
    m = music(total, gold)[:n]
    s = np.zeros(n)
    for t, kind in ev:
        if kind == "scene": put(s, whoosh(0.5, 0.8), max(0, t - 0.22))
        elif kind == "cut": put(s, whoosh(0.3, 0.45), max(0, t - 0.12))
        elif kind == "punch": put(s, whoosh(0.35, 0.7), max(0, t - 0.15)); put(s, ting(0.4), t)
        elif kind == "hit": put(s, hit(0.9), t)
        elif kind == "pop": put(s, pop(0.6), t)
    vv = np.zeros(n); vv[: len(v)] = v[:n]
    vr, vp = gated_rms(vv), np.abs(vv).max()
    m *= 0.5 * vr / gated_rms(m)                      # music = 50 % of the voice level (-6 dB, gated RMS)
    nz = s[np.abs(s) > 1e-4]; sr_ = float(np.sqrt((nz ** 2).mean())) if len(nz) else 1.0
    s *= 0.5 * vr / sr_                                # sfx rms = 50 % of voice; peaks capped below
    cap = 0.7 * vp
    if np.abs(s).max() > cap: s *= cap / np.abs(s).max()
    fade = np.minimum(1, (total - np.arange(n) / SR) / 1.0)
    m *= fade
    mix = vv + m + s
    raw = np.stack([mix, mix], axis=1).astype(np.float32).tobytes()
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af",
                    "loudnorm=I=-14:TP=-1.0:LRA=8,alimiter=limit=0.89", "-ar", str(SR), out_p], input=raw, check=True)
    print(f"music {20*np.log10(gated_rms(m)/vr):.1f} dB vs voice (gated RMS), sfx rms {20*np.log10(float(np.sqrt((nz**2).mean()))*0.5*vr/sr_/vr) if len(nz) else 0:.1f} dB, {len(ev)} events, {total:.1f}s -> {out_p}")

if __name__ == "__main__":
    main(*sys.argv[1:4])
