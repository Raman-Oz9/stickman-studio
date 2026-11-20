#!/usr/bin/env python3
"""Music bed + SFX for a story board, mixed under the narration.
usage: story_audio.py board.json narration.wav out_mix.wav
Music and SFX are synthesised here (numpy only). Levels follow the cartoon-short rule: music = 50 % of the voice level
(-6 dB gated RMS), SFX = 50 % or less with peaks capped below the voice peak, then one linear gain + peak limiter."""
import json, re, subprocess, sys
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
    return x * vel * 0.4

def snare(vel=1.0):
    n = int(SR * 0.16); t = np.arange(n) / SR
    return (rng.standard_normal(n) * np.exp(-t * 28) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)) * vel

def put(buf, x, t):
    i = int(t * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x)); buf[i:j] += x[: j - i]

# ---------------- music ----------------
PROG_DAY = [([57, 60, 64], 33), ([53, 57, 60], 29), ([60, 64, 67], 36), ([55, 59, 62], 31)]   # Am F C G: warm, cinematic, all-ages
PROG_GOLD = [([53, 57, 60], 29), ([60, 64, 67], 36), ([55, 59, 62], 31), ([57, 60, 64], 33)]  # F C G Am

def lowpass(x, fc=1800):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))      # smooth 2nd-order roll-off

def music(total, golden_from):
    """calm lo-fi cinematic bed: slow warm pads + soft low pluck arpeggio + muted heartbeat kick; no bright top line, no shaker"""
    buf = np.zeros(int(total * SR)); bpm = 104; beat = 60 / bpm; bar = beat * 4
    nb = int(total / bar) + 1
    for b in range(nb):
        t0 = b * bar
        prog = PROG_GOLD if golden_from is not None and t0 >= golden_from else PROG_DAY
        ch, root = prog[b % 4]
        put(buf, pad([m - 12 for m in ch] + [ch[0]], bar + 0.6, 0.9), t0)
        for q in range(4): put(buf, kick(0.5 if q % 2 == 0 else 0.0), t0 + q * beat)            # steady pulse
        for q in (1, 3): put(buf, snare(0.45), t0 + q * beat)                                    # backbeat
        for q in range(8): put(buf, shaker(0.9), t0 + q * beat / 2)                              # driving hats
        for k, off in enumerate([0, 7, 12, 7, 0, 7, 12, 7]):                    # mellow low arpeggio
            put(buf, pluck(root + off - 12, beat * 0.95, 0.32 if k % 2 == 0 else 0.2), t0 + k * beat / 2)
    return lowpass(buf[: int(total * SR)], 4200)

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
    return sum(np.sin(2 * np.pi * f * t) * a for f, a in ((784, 1), (1175, .35))) * np.exp(-t * 6) * vel * 0.4

def pop(vel=1.0):          # punch-in / laugh accent
    n = int(SR * 0.18); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(500 * np.exp(-t * 30) + 180) / SR) * np.exp(-t * 22) * vel

def _lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))

def thunder(vel=1.0):      # crack then long low rumble
    n = int(SR * 3.2); t = np.arange(n) / SR; x = rng.standard_normal(n)
    crack = x * np.exp(-t * 28) * 0.9
    rumble = _lp(x, 110) * (np.exp(-t * 0.9) * (1 + 0.5 * np.sin(2 * np.pi * 3.1 * t)).clip(0.4, 1.5)) * 5
    return (crack + rumble) * vel * 0.55

def boom(vel=1.0):         # explosion: sub drop + noise burst
    n = int(SR * 2.4); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t * 3.2) + 28) / SR) * np.exp(-t * 1.7)
    burst = _lp(rng.standard_normal(n), 900) * np.exp(-t * 4.5) * 2.2
    return (sub * 1.4 + burst) * vel * 0.6

def rain_bed(dur):         # soft hiss, no melody
    n = int(SR * dur); x = rng.standard_normal(n); x = x - _lp(x, 700)
    return _lp(x, 6500) * 0.16 * np.minimum(1, np.minimum(np.arange(n) / (SR * 0.4), (n - np.arange(n)) / (SR * 0.4)))

def gun(vel=1.0):          # crack + thump
    n = int(SR * 0.5); t = np.arange(n) / SR
    crack = rng.standard_normal(n) * np.exp(-t * 55); thump = np.sin(2 * np.pi * np.cumsum(180 * np.exp(-t * 18) + 45) / SR) * np.exp(-t * 14)
    return (crack * 0.9 + thump * 1.1) * vel * 0.7

def beats(board):
    """(time, kind) events from the board: cuts, reaction punch-ins, shock hits. Mirrors camera.ts segsOf."""
    ev, t = [], 0.0
    for i, s in enumerate(board["scenes"]):
        d = float(s["dur"])
        ev.append((t, "scene"))
        react = next((c for c in s["cast"] if c.get("at2") is not None and c.get("expr2")), None)
        if react and d > 1.8:
            cut = min(0.72, max(0.3, react["at2"])); ev.append((t + cut * d, "punch"))
            if react["expr2"] in ("shock", "pained"): ev.append((t + cut * d, "hit"))
            if react["expr2"] in ("laugh", "grin"): ev.append((t + cut * d + 0.05, "pop"))
        else:
            if s.get("move") in (None, "push", "pull", "reveal", "pan", "descend", "orbit", "hold") and not any(c.get("to") for c in s["cast"]):
                n = max(1, min(6, round(d / 2.0)))                                  # mirrors camera.ts actionSegs / nSub
                for k in range(1, n): ev.append((t + d * k / n, "cut"))
            elif d > 4.6 and not s.get("move"): ev.append((t + d * 0.56, "cut"))
        for e in s.get("fx") or []:
            if e.get("type") == "lightning": ev.append((t + float(e.get("at", 0.3)) * d + 0.25, "thunder"))
            if e.get("type") == "explosion": ev.append((t + float(e.get("at", 0.3)) * d, "boom"))
        for c in s["cast"]:
            if c.get("act") == "shoot":
                tt = 0.1 * d
                while tt < d - 0.3: ev.append((t + tt, "gun")); tt += 0.4
            elif c.get("act") in ("swing", "stab"):
                per = 0.9 if c["act"] == "swing" else 0.7; tt = 0.1 * d
                while tt < d - 0.4: ev.append((t + tt, "swish")); tt += per
        if set(s.get("env") or []) & {"rain", "storm"}: ev.append((t, "rain:%.2f" % d))
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
        if kind in ("scene", "cut"): pass                      # owner: no zoom/whoosh on every cut
        elif kind == "punch": put(s, ting(0.3), t)
        elif kind == "hit": put(s, hit(0.9), t)
        elif kind == "pop": put(s, pop(0.6), t)
        elif kind == "gun": put(s, gun(1.0), t)
        elif kind == "swish": put(s, whoosh(0.28, 0.5), t)
        elif kind == "thunder": put(s, thunder(1.0), t)
        elif kind == "boom": put(s, boom(1.0), t)
        elif kind.startswith("rain:"): put(s, rain_bed(float(kind[5:])), t)
    vv = np.zeros(n); vv[: len(v)] = v[:n]
    vr, vp = gated_rms(vv), np.abs(vv).max()
    m *= 0.30 * vr / gated_rms(m)                     # music = 25 % of the voice level (about -12 dB, gated RMS): a bed, never competes
    nz = s[np.abs(s) > 1e-4]; sr_ = float(np.sqrt((nz ** 2).mean())) if len(nz) else 1.0
    s *= 0.35 * vr / sr_                                # sfx rms = 50 % of voice; peaks capped below
    cap = 0.5 * vp
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
