# texts.json -> per-scene narration (Kokoro), durations.json, mix.wav (narration + quiet music bed)
import json, os, sys
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..")); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "remotion", "scripts"))
from stickman_studio import voice
SR = 24000
def synth(text, i, tag, v=None):
    w = f"/tmp/film_{i}_{tag}.wav"; voice.synth(text, w, v)
    a, sr = sf.read(w, dtype="float32"); a = a.mean(axis=1) if a.ndim > 1 else a
    if sr != SR: a = np.interp(np.linspace(0, len(a) - 1, int(len(a) * SR / sr)), np.arange(len(a)), a).astype("float32")
    nz = np.where(np.abs(a) > 0.01)[0]
    return a[max(0, nz[0] - 300): nz[-1] + 1500] if len(nz) else a
texts = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
parts, durs = [], []
for i, t in enumerate(texts):
    a = synth(t["text"], i, "n")
    if t["quote"]: a = np.concatenate([a, np.zeros(int(0.3 * SR), "float32"), synth(t["quote"], i, "q", os.environ.get("QUOTE_VOICE", "af_heart"))])
    d = max(5.0, len(a) / SR + 1.1); parts.append(a); durs.append(round(d, 3))
total = sum(durs) + 1.5; nar = np.zeros(int(total * SR), "float32"); t0 = 0.0
for a, d in zip(parts, durs): s = int((t0 + 0.35) * SR); nar[s:s + len(a)] += a; t0 += d
try:
    import story_audio; m = story_audio.music(total, None)[: len(nar)]
    if getattr(story_audio, "SR", SR) != SR: m = np.interp(np.linspace(0, len(m) - 1, len(nar)), np.arange(len(m)), m)
    m = np.pad(m, (0, len(nar) - len(m))).astype("float32"); m = m / (np.abs(m).max() + 1e-6) * 0.12
except Exception as e:
    print("music skipped", e); m = np.zeros_like(nar)
mix = nar / (np.abs(nar).max() + 1e-6) * 0.9 + m; mix = np.clip(mix, -1, 1)
sf.write(os.path.join(out, "mix.wav"), mix, SR); json.dump(durs, open(os.path.join(out, "durs.json"), "w")); print("durations", durs, "total", total)
