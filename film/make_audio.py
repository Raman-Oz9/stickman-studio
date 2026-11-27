# texts.json -> per-scene narration (Kokoro), durations.json, mix.wav (narration + mood music + sfx)
import re, json, os, sys, subprocess
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..")); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "remotion", "scripts"))
from stickman_studio import voice
SR = 24000
rng = np.random.default_rng(42)

def synth(text, i, tag, v=None):
    w = f"/tmp/film_{i}_{tag}.wav"; voice.synth(text, w, v)
    a, sr = sf.read(w, dtype="float32"); a = a.mean(axis=1) if a.ndim > 1 else a
    if sr != SR: a = np.interp(np.linspace(0, len(a) - 1, int(len(a) * SR / sr)), np.arange(len(a)), a).astype("float32")
    nz = np.where(np.abs(a) > 0.01)[0]
    return a[max(0, nz[0] - 300): nz[-1] + 1500] if len(nz) else a

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

def env(n, a=0.01, r=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))

def pad(ms, dur, vel=1.0):
    n = int(SR * dur); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * hz(m) * t + i * 0.5) + 0.3 * np.sin(2 * np.pi * hz(m) * 2.002 * t) for i, m in enumerate(ms))
    fade = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.5)
    return x * fade * vel / len(ms)

def string_pad(ms, dur, vel=1.0):
    n = int(SR * dur); t = np.arange(n) / SR
    vibrato = np.sin(2 * np.pi * 5.5 * t) * 0.015
    x = sum(np.sin(2 * np.pi * hz(m) * (1 + vibrato) * t + i * 0.7) + 
            0.5 * np.sin(2 * np.pi * hz(m) * 2.001 * t) +
            0.25 * np.sin(2 * np.pi * hz(m) * 3.003 * t) for i, m in enumerate(ms))
    env_str = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8)
    return lowpass(x * env_str * vel / len(ms), 2800)

def pulse_synth(m, dur, vel=1.0):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    x = sum((1.0 / k) * np.sin(2 * np.pi * f * k * t) for k in range(1, 8, 2))
    return x * env(n, 0.01, dur * 0.6) * vel

def pluck(m, dur, vel=1.0):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    x = sum(np.sin(2 * np.pi * f * k * t) / (k ** 1.5) for k in (1, 2, 3, 4)) * env(n, 0.002, dur * 0.4)
    return x * vel

def kick(vel=1.0):
    n = int(SR * 0.2); t = np.arange(n) / SR
    f = 110 * np.exp(-t * 25) + 40
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 15) * vel

def shaker(vel=1.0):
    n = int(SR * 0.06); x = rng.standard_normal(n)
    x = np.diff(x, prepend=0) * env(n, 0.001, 0.03)
    return x * vel * 0.35

def snare(vel=1.0):
    n = int(SR * 0.15); t = np.arange(n) / SR
    return (rng.standard_normal(n) * np.exp(-t * 30) * 0.6 + np.sin(2 * np.pi * 200 * t) * np.exp(-t * 35)) * vel * vel

def lowpass(x, fc=2000):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))

MOOD_PROGS = {
    "calm": ([57, 60, 64], 33, 100),
    "epic": [([55, 59, 62], 31, 116), ([53, 57, 60], 29, 116)],
    "tense": [([50, 53, 57], 26, 120), ([51, 54, 58], 27, 120)],
    "mystery": [([52, 56, 59], 28, 92), ([55, 58, 62], 31, 92)],
    "wonder": [([60, 64, 67], 36, 104), ([53, 57, 60], 29, 104)],
    "sad": [([57, 60, 64], 33, 84), ([52, 55, 59], 28, 84)]
}

def generate_scene_music(dur, mood="calm"):
    entry = MOOD_PROGS.get(mood, MOOD_PROGS["calm"])
    if isinstance(entry[0], list) and isinstance(entry[0][0], int):
        chords = [entry]
    else:
        chords = entry
    bpm = chords[0][2] if len(chords) > 0 and len(chords[0]) > 2 else 104
    beat = 60 / bpm; bar = beat * 4
    n = int(dur * SR)
    buf = np.zeros(n)
    nb = int(dur / bar) + 1
    for b in range(nb):
        t0 = b * bar
        if t0 >= dur: break
        chord_info = chords[b % len(chords)]
        ch, root = chord_info[0], chord_info[1]
        p_dur = min(bar + 0.5, dur - t0)
        p = string_pad([m - 12 for m in ch] + [ch[0]], p_dur, 0.8)
        put_buf(buf, p, t0)
        if mood in ("calm", "wonder", "mystery"):
            for q in range(4):
                put_buf(buf, kick(0.35 if q == 0 else 0.18), t0 + q * beat)
            for q in range(8):
                put_buf(buf, shaker(0.4), t0 + q * beat / 2)
            for k, off in enumerate([0, 7, 12, 7]):
                put_buf(buf, pulse_synth(root + off - 12, beat * 0.8, 0.25), t0 + k * beat / 2)
        elif mood in ("epic", "tense"):
            for q in range(4):
                put_buf(buf, kick(0.7), t0 + q * beat)
                put_buf(buf, snare(0.6), t0 + (q + 0.5) * beat)
            for q in range(8):
                put_buf(buf, shaker(0.6), t0 + q * beat / 2)
            for k, off in enumerate([0, 3, 7, 10, 12, 7, 3, 0]):
                put_buf(buf, pulse_synth(root + off - 12, beat * 0.7, 0.35), t0 + k * beat / 4)
        else:
            for q in range(2):
                put_buf(buf, kick(0.3), t0 + q * bar / 2)
            for k, off in enumerate([0, 5, 7, 5]):
                put_buf(buf, pulse_synth(root + off - 12, beat * 1.2, 0.25), t0 + k * beat)
    return lowpass(buf, 3800)

def put_buf(buf, x, t):
    i = int(t * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x)); buf[i:j] += x[: j - i]

def sfx_whoosh(dur=0.4, peak=0.7):
    n = int(SR * dur); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    lo = np.convolve(x, np.ones(30) / 30, "same")
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 2200 * (t / dur) ** 2) / SR)
    x = (0.7 * lo + 0.3 * sweep * lo) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return x * peak

def sfx_clash(dur=0.6):
    n = int(SR * dur); t = np.arange(n) / SR
    freqs = [800, 1200, 1850, 2400, 3100]
    metal = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (6 + i)) for i, f in enumerate(freqs))
    noise = rng.standard_normal(n) * np.exp(-t * 15)
    return (metal * 0.8 + noise * 0.5) * np.exp(-t * 8) * 0.75

def sfx_footstep(vel=1.0):
    n = int(SR * 0.12); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * 90 * t) * np.exp(-t * 30)
    noise = (rng.standard_normal(n) * np.exp(-t * 40)) * 0.4
    return (thud + noise) * vel * 0.5

def sfx_coin(vel=1.0):
    n = int(SR * 0.35); t = np.arange(n) / SR
    chime = np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 12) + np.sin(2 * np.pi * 2637 * t) * np.exp(-t * 15)
    return chime * vel * 0.6

def sfx_rain(dur):
    n = int(SR * dur); x = rng.standard_normal(n)
    return lowpass(x - lowpass(x, 400), 5000) * 0.2 * np.minimum(1, np.arange(n) / (SR * 0.2))

def sfx_waves(dur):
    n = int(SR * dur); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    envelope = 0.5 * (1 + np.sin(2 * np.pi * 0.25 * t))
    return lowpass(x, 1500) * envelope * 0.25

def sfx_fire(dur):
    n = int(SR * dur); t = np.arange(n) / SR
    rumble = lowpass(rng.standard_normal(n), 150) * 0.3
    crackle = np.zeros(n)
    num_pops = int(dur * 8)
    for _ in range(num_pops):
        pos = rng.integers(0, max(1, n - 200))
        p_len = rng.integers(50, 200)
        p = rng.standard_normal(p_len) * np.exp(-np.linspace(0, 5, p_len)) * 0.6
        crackle[pos:pos+p_len] += p
    return (rumble + crackle) * np.minimum(1, t / 0.1)

def gated_rms(x, sr=SR, win=0.4):
    n = int(win * sr)
    if len(x) < n: return float(np.sqrt((x ** 2).mean())) if len(x) > 0 else 1e-6
    fr = x[: len(x) // n * n].reshape(-1, n); r = np.sqrt((fr ** 2).mean(axis=1))
    keep = r > max(1e-6, r.max() * 0.1)
    return float(np.sqrt((r[keep] ** 2).mean())) if keep.any() else 1e-6

def main():
    texts_file = sys.argv[1]
    out_dir = sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    texts = json.load(open(texts_file))
    
    parts, durs, scene_meta = [], [], []
    for i, t in enumerate(texts):
        txt = t["text"] if isinstance(t, dict) else t
        quote = t.get("quote") if isinstance(t, dict) else None
        mood = t.get("mood") if isinstance(t, dict) and t.get("mood") else None
        location = t.get("location") if isinstance(t, dict) and t.get("location") else None
        weather = t.get("weather") if isinstance(t, dict) and t.get("weather") else None
        tod = t.get("tod") if isinstance(t, dict) and t.get("tod") else None
        
        low = txt.lower()
        if not mood:
            if any(k in low for k in ("clash", "fight", "battle", "war", "attack")): mood = "tense"
            elif any(k in low for k in ("died", "lost", "alone", "sad")): mood = "sad"
            elif any(k in low for k in ("stars", "giant", "glowing", "wonder")): mood = "wonder"
            elif any(k in low for k in ("secret", "mystery", "shadow")): mood = "mystery"
            elif any(k in low for k in ("triumph", "march", "army", "empire", "epic")): mood = "epic"
            else: mood = "calm"
        if not location:
            if any(k in low for k in ("sea", "ocean", "ship", "fleet", "waves")): location = "ocean"
            elif any(k in low for k in ("snow", "blizzard")): location = "snow"
            else: location = "plain"
        if not weather:
            if any(k in low for k in ("rain", "storm", "lightning", "thunder")): weather = "rain"
            else: weather = "none"
        if not tod:
            if any(k in low for k in ("night", "dark", "midnight")): tod = "night"
            else: tod = "day"
            
        a = synth(txt, i, "n")
        if quote:
            q_voice = os.environ.get("QUOTE_VOICE", "af_heart") if re.search(r"queen|she|woman|lady", str(texts[i].get("speaker") or ""), re.I) else os.environ.get("MALE_QUOTE_VOICE", "bm_lewis")
            a = np.concatenate([a, np.zeros(int(0.12 * SR), "float32"), synth(quote, i, "q", q_voice)])
        d = len(a) / SR + 0.14
        parts.append(a)
        durs.append(round(d, 3))
        scene_meta.append({"mood": mood, "location": location, "weather": weather, "tod": tod, "dur": d})
        
    total = sum(durs) + 1.2
    n_total = int(total * SR)
    nar = np.zeros(n_total, "float32")
    music_bed = np.zeros(n_total, "float32")
    sfx_buf = np.zeros(n_total, "float32")
    
    t0 = 0.0
    for i, (a, meta, d) in enumerate(zip(parts, scene_meta, durs)):
        s_idx = int((t0 + 0.12) * SR)
        e_idx = s_idx + len(a)
        if e_idx <= n_total:
            nar[s_idx:e_idx] += a
        
        m_scene = generate_scene_music(d + 0.5, meta["mood"])
        m_len = min(len(m_scene), n_total - int(t0 * SR))
        if m_len > 0:
            start_i = int(t0 * SR)
            fade_len = int(SR * 0.3)
            if i > 0 and fade_len < m_len:
                m_scene[:fade_len] *= np.linspace(0, 1, fade_len)
            music_bed[start_i:start_i + m_len] += m_scene[:m_len]
            
        if i > 0:
            put_buf(sfx_buf, sfx_whoosh(0.35, 0.6), t0)
            
        txt_low = texts[i]["text"].lower() if isinstance(texts[i], dict) else texts[i].lower()
        shots = texts[i].get("shots", []) if isinstance(texts[i], dict) else []
        for s_idx, sh in enumerate(shots):
            if isinstance(sh, dict) and "a" in sh:
                shot_t = t0 + sh["a"] * d
                if s_idx > 0 or shot_t > t0 + 0.05:
                    put_buf(sfx_buf, sfx_whoosh(0.32, 0.55), shot_t)
            elif isinstance(sh, (int, float)) and sh > 0:
                put_buf(sfx_buf, sfx_whoosh(0.32, 0.55), t0 + sh * d)

        if any(k in txt_low for k in ("walk", "march", "stepped", "crossed", "drove", "run")):
            step_interval = 0.38
            num_steps = int(d / step_interval)
            for st_i in range(num_steps):
                put_buf(sfx_buf, sfx_footstep(0.65), t0 + 0.15 + st_i * step_interval)

        if any(k in txt_low for k in ("coin", "gold", "bank", "rent", "money", "save", "count", "rich", "assets", "salary")):
            put_buf(sfx_buf, sfx_coin(0.75), t0 + 0.3 * d)
            put_buf(sfx_buf, sfx_coin(0.65), t0 + 0.65 * d)

        if any(k in txt_low for k in ("clash", "fight", "battle", "war", "attack", "struck", "hammer", "lever", "build", "impact", "hit")) or meta["mood"] == "tense":
            put_buf(sfx_buf, sfx_clash(0.75), t0 + 0.25 * d)
            if "battle" in txt_low or "clash" in txt_low or "fight" in txt_low:
                put_buf(sfx_buf, sfx_clash(0.65), t0 + 0.65 * d)
                
        if meta["weather"] in ("rain", "storm") or any(k in txt_low for k in ("rain", "storm", "thunder")):
            put_buf(sfx_buf, sfx_rain(d), t0)
            
        if meta["location"] in ("ocean", "sea", "beach") or any(k in txt_low for k in ("sea", "ocean", "waves", "shore")):
            put_buf(sfx_buf, sfx_waves(d), t0)
            
        if meta["tod"] == "night" or any(k in txt_low for k in ("night", "fire", "camp")):
            put_buf(sfx_buf, sfx_fire(d), t0)
            
        t0 += d

    vr = gated_rms(nar)
    if vr < 1e-5: vr = 0.05
    
    mr = gated_rms(music_bed)
    if mr > 1e-6:
        target_m_rms = vr * 10 ** (-16 / 20)
        music_bed *= target_m_rms / mr
    else:
        music_bed = np.zeros_like(nar)
        
    sr_sfx = gated_rms(sfx_buf)
    if sr_sfx > 1e-6:
        target_sfx_rms = vr * 0.4
        sfx_buf *= target_sfx_rms / sr_sfx

    # Proper ducking under narration (-14 dB)
    win_n = int(0.2 * SR)
    nar_sq = nar ** 2
    if len(nar_sq) >= win_n:
        nar_env = np.sqrt(np.convolve(nar_sq, np.ones(win_n)/win_n, mode='same'))
    else:
        nar_env = np.abs(nar)
    
    duck_factor = 10.0 ** (-14 / 20)
    duck_mask = np.where(nar_env > 0.015, duck_factor, 1.0)
    music_bed *= duck_mask
    sfx_buf *= np.where(nar_env > 0.015, 0.6, 1.0)
    
    vp = np.abs(nar).max()
    cap = 0.5 * max(vp, 0.1)
    if np.abs(sfx_buf).max() > cap:
        sfx_buf *= cap / np.abs(sfx_buf).max()
        
    fade_n = int(SR * 1.0)
    if len(music_bed) > fade_n:
        music_bed[-fade_n:] *= np.linspace(1, 0, fade_n)
        
    mix = nar + music_bed + sfx_buf
    mix = np.clip(mix, -1, 1)
    
    raw = np.stack([mix, mix], axis=1).astype(np.float32).tobytes()
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
        "-af", "loudnorm=I=-14:TP=-1.0:LRA=8,alimiter=limit=0.89", "-ar", str(SR), os.path.join(out_dir, "mix.wav")
    ], input=raw, check=True)
    
    json.dump(durs, open(os.path.join(out_dir, "durs.json"), "w"))
    print("durations", durs, "total", total)

if __name__ == "__main__":
    main()
