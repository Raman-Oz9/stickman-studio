#!/usr/bin/env python3
"""AI-illustrated film: one Gemini keyframe per scene in the reference stickman style, animated with a continuous
cinematic virtual camera (sub-pixel crops, ease in/out), captions, crossfades, then muxed with the narration mix.
usage: ai_film.py plan.json durs.json mix.wav out.mp4 [W H]"""
import base64, io, json, os, subprocess, sys, time, glob
import numpy as np, requests, cv2
from PIL import Image, ImageDraw, ImageFont

PLAN, DURS, MIX, OUT = sys.argv[1:5]
W = int(sys.argv[5]) if len(sys.argv) > 5 else 720
H = int(sys.argv[6]) if len(sys.argv) > 6 else 1280
FPS = 30
KEY = os.environ.get("GEMINI_API_KEY", "").strip()
MODELS = os.environ.get("IMAGE_GEMINI_MODELS", "gemini-2.5-flash-image,gemini-3.1-flash-image-preview").split(",")
REFDIR = os.path.join(os.path.dirname(__file__), "..", "docs", "style_refs")
CACHE = os.environ.get("AI_CACHE", "ai_cache"); os.makedirs(CACHE, exist_ok=True)

STYLE = ("Cinematic 2D stickman storytelling illustration, EXACTLY in the art style of the attached reference images: "
         "hand-inked thick black outlines, characters are stickmen with a large round white head, big expressive eyes with small pupils, "
         "expressive eyebrows and mouth, thin long black stick limbs with simple hands, clothes drawn as simple flat shapes with one strong accent colour. "
         "Backgrounds are detailed, desaturated greyscale painterly scenes with ink hatching, soft shading, atmospheric depth and cinematic lighting; "
         "only the characters' key clothing and key story objects use colour. Props are drawn with real-world proportions and rich detail "
         "(cars as big as in real life, buildings tall, furniture normal size relative to the stickman). "
         "Vertical 9:16 composition, the main action large and clear in the centre, space at the bottom for captions. "
         "No text, no letters, no captions, no watermark, no border.")
OUTFIT = {"tycoon": "a sharp pinstripe suit, tie and gold ring", "builder": "an orange hard hat, hi-vis vest and work boots",
          "surgeon": "green scrubs, cap and mask", "doctor": "a white coat with stethoscope", "scientist": "a lab coat and goggles",
          "firefighter": "a red firefighter coat and helmet", "police": "a police cap and uniform", "pilot": "a pilot cap and uniform",
          "chef": "a chef toque and white apron", "mechanic": "blue overalls and a wrench", "miner": "a headlamp helmet and dirty overalls",
          "farmer": "a straw hat and dungarees", "athlete": "a sports jersey", "pirate": "a tricorn hat and red sash", "monk": "a simple brown robe",
          "soldier": "an olive helmet and uniform", "knight": "plate armour and a plumed helmet", "viking": "a horned helmet and fur cloak",
          "racer": "a racing helmet and fireproof suit", "skydiver": "a jumpsuit, goggles and parachute pack", "scuba": "a wetsuit, mask and air tank"}
ERA_OUT = {"ancient": "an ancient Greek warrior look: crested bronze helmet, red cloak, round shield, spear (for Alexander)",
           "space": "a white astronaut suit with orange stripes and round glass helmet", "ocean": "a modern scuba wetsuit with mask and tank",
           "medieval": "medieval armour", "modern": "an orange t-shirt and brown fedora with a leather satchel"}

def refs():
    out = []
    for f in sorted(glob.glob(os.path.join(REFDIR, "*.jpg")))[:4]:
        out.append({"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(open(f, "rb").read()).decode()}})
    return out

def prompt_for(p, i):
    who = []
    for r in (p.get("role"), p.get("role2")):
        if r and r in OUTFIT: who.append(f"a stickman wearing {OUTFIT[r]}")
    if not who: who.append("the stickman hero wearing " + ERA_OUT.get(p.get("era"), ERA_OUT["modern"]))
    extra = ""
    if p.get("quote"): extra = f" The character is speaking, mouth open, expressive face, close medium shot. Spoken line (do not write it): {p['quote']}"
    return (f"{STYLE}\nScene {i+1}. Illustrate this narration sentence literally: \"{p['text']}\"\n"
            f"Setting: {p.get('location','')} at {p.get('tod','day')}, weather {p.get('weather','none')}, mood {p.get('mood','calm')}, era {p.get('era','')}.\n"
            f"Characters: {' and '.join(who)}. Every person and noun in the sentence must be visible, and the stickman must be physically PERFORMING the action of the sentence with hands touching the key objects.{extra}")

def gen_or(prompt):
    k = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not k: return None
    for model in ["google/gemini-2.5-flash-image", "google/gemini-3.1-flash-image-preview"]:
        try:
            content = [{"type": "text", "text": prompt}]
            for f in sorted(glob.glob(os.path.join(REFDIR, "*.jpg")))[:3]:
                content.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(open(f, "rb").read()).decode()}})
            r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers={"Authorization": "Bearer " + k},
                              json={"model": model, "modalities": ["image", "text"], "messages": [{"role": "user", "content": content}]}, timeout=240)
            if r.status_code != 200: print("  openrouter", model, r.status_code, r.text[:120]); continue
            for im in r.json()["choices"][0]["message"].get("images", []):
                u = im["image_url"]["url"]; return Image.open(io.BytesIO(base64.b64decode(u.split(",", 1)[1]))).convert("RGB")
        except Exception as e: print("  openrouter err", e)
    return None

def gen_cf(prompt):
    tok, acc = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip(), os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
    if not tok or not acc: return None
    short = prompt.split("Scene")[0][-400:] + prompt[prompt.index("Illustrate"):][:700]
    for model in ["@cf/black-forest-labs/flux-1-schnell"]:
        try:
            r = requests.post(f"https://api.cloudflare.com/client/v4/accounts/{acc}/ai/run/{model}", headers={"Authorization": "Bearer " + tok},
                              json={"prompt": short[:2000], "steps": 6}, timeout=240)
            if r.status_code != 200: print("  cloudflare", r.status_code, r.text[:120]); continue
            im = Image.open(io.BytesIO(base64.b64decode(r.json()["result"]["image"]))).convert("RGB")
            return im.resize((768, 1344), Image.LANCZOS) if im.width > im.height * 0.8 else im
        except Exception as e: print("  cloudflare err", e)
    return None

def gen(prompt, extra_ref=None):
    for k in [os.environ.get("GEMINI_API_KEY", ""), os.environ.get("GEMINI_API_KEY_2", "")]:
        if k.strip():
            global KEY; KEY = k.strip(); im = gen_g(prompt, extra_ref)
            if im is not None: return im
    im = gen_or(prompt)
    if im is not None: return im
    return gen_cf(prompt)

def gen_g(prompt, extra_ref=None):
    parts = [{"text": prompt}] + refs()
    if extra_ref: parts.append({"text": "Keep the main stickman character design consistent with this previous frame:"}); parts.append(extra_ref)
    for model in [m.strip() for m in MODELS if m.strip()]:
        for att in range(3):
            try:
                r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", headers={"x-goog-api-key": KEY},
                                  json={"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "9:16"}}}, timeout=240)
            except Exception as e:
                print("  err", model, e); time.sleep(4); continue
            if r.status_code in (400, 403, 404): print("  ", model, r.status_code, r.text[:160]); break
            if r.status_code != 200: print("  ", model, r.status_code); time.sleep(8 * (att + 1)); continue
            try:
                for pt in r.json()["candidates"][0]["content"]["parts"]:
                    d = pt.get("inlineData") or pt.get("inline_data")
                    if d: return Image.open(io.BytesIO(base64.b64decode(d["data"]))).convert("RGB")
            except Exception as e: print("  bad", e)
            break
    return None

# ---- camera: continuous path through shot targets (zoom, cx, cy as fractions of the image) ----
TARGET = {"wide": (1.04, .5, .5), "crane": (1.12, .5, .42), "establishing": (1.04, .5, .5), "side": (1.28, .36, .55), "pan": (1.28, .64, .55),
          "closeup": (1.75, .5, .36), "face": (1.9, .5, .3), "extreme": (2.3, .5, .3), "medium": (1.4, .5, .5), "over": (1.3, .6, .45),
          "low": (1.3, .5, .62), "reaction": (1.9, .5, .32), "detail": (2.0, .5, .55), "follow": (1.35, .55, .55), "dolly": (1.3, .5, .5), "orbit": (1.3, .4, .5)}
def ease(x): x = min(1, max(0, x)); return x * x * x * (x * (6 * x - 15) + 10)
def path(shots, i):
    ts = [TARGET.get(s, (1.25, .5, .5)) for s in (shots or ["wide", "medium", "closeup"])]
    if i % 2: ts = ts[::-1] if len(ts) > 2 else ts          # vary direction between scenes
    return ts
def cam_at(ts, u):
    n = len(ts)
    if n == 1: return ts[0]
    f = u * (n - 1); k = min(int(f), n - 2); e = ease(f - k)
    a, b = ts[k], ts[k + 1]
    return tuple(a[j] + (b[j] - a[j]) * e for j in range(3))
def crop(img, z, cx, cy):
    h, w = img.shape[:2]; ow, oh = w / z, h / z
    x0 = min(max(cx * w - ow / 2, 0), w - ow); y0 = min(max(cy * h - oh / 2, 0), h - oh)
    M = np.float32([[W / ow, 0, -x0 * W / ow], [0, H / oh, -y0 * H / oh]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

FONT = None
for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"]:
    if os.path.exists(f): FONT = ImageFont.truetype(f, int(H * 0.030)); break
def caption(frame, text):
    if not text or FONT is None: return frame
    im = Image.fromarray(frame); d = ImageDraw.Draw(im, "RGBA")
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=FONT) > W * 0.86 and cur: lines.append(cur); cur = w_
        else: cur = t
    lines.append(cur); lh = int(H * 0.040); y = int(H * 0.83) - lh * (len(lines) - 1)
    d.rectangle([0, y - 14, W, y + lh * len(lines) + 6], fill=(0, 0, 0, 90))
    for ln in lines:
        x = (W - d.textlength(ln, font=FONT)) / 2; d.text((x + 2, y + 2), ln, font=FONT, fill=(0, 0, 0, 220)); d.text((x, y), ln, font=FONT, fill=(255, 255, 255, 255)); y += lh
    return np.array(im)

plan = json.load(open(PLAN)); durs = json.load(open(DURS)); n = min(len(plan), len(durs))
imgs, prev_ref, fails = [], None, 0
for i in range(n):
    fp = os.path.join(CACHE, f"s{i}.png")
    if os.path.exists(fp): im = Image.open(fp).convert("RGB")
    else:
        print("scene", i, plan[i]["text"][:60]); im = gen(prompt_for(plan[i], i), prev_ref)
        if im is None and imgs: print("  FAILED, reusing previous"); fails += 1; im = Image.fromarray(imgs[-1][:, :, ::-1])
        elif im is None: print("  FAILED and nothing to reuse"); sys.exit(2)
        else: im.save(fp)
    ref_buf = io.BytesIO(); t = im.copy(); t.thumbnail((512, 512)); t.save(ref_buf, "JPEG", quality=85)
    if prev_ref is None: prev_ref = {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(ref_buf.getvalue()).decode()}}
    big = np.array(im.resize((max(im.width, int(W * 2)), max(im.height, int(H * 2))), Image.LANCZOS))
    imgs.append(big[:, :, ::-1].copy())   # BGR for cv2 warp, converted back below
    time.sleep(1)
if fails > n // 2: print("too many failures"); sys.exit(3)

XF = 0.45
tmp = OUT + ".raw.mp4"
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-pix_fmt", "yuv420p", tmp], stdin=subprocess.PIPE)
tails = None
for i in range(n):
    nf = max(1, int(round(durs[i] * FPS))); ts = path(plan[i].get("shots"), i); txt = plan[i]["text"] if not plan[i].get("quote") else (plan[i].get("quote") or plan[i]["text"])
    cap = plan[i]["text"]
    for f in range(nf):
        u = f / max(1, nf - 1); z, cx, cy = cam_at(ts, u)
        fr = crop(imgs[i], z, cx, cy)[:, :, ::-1]
        # soft vignette
        fr = fr.astype(np.float32)
        yy, xx = np.ogrid[:H, :W]; v = 1 - 0.28 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 2; fr = (fr * v[..., None]).clip(0, 255).astype(np.uint8)
        if tails is not None and f < int(XF * FPS):
            a = 1 - f / (XF * FPS); fr = (fr * (1 - a) + tails * a).astype(np.uint8)
        fr = caption(fr, cap)
        ff.stdin.write(fr.tobytes())
    z, cx, cy = cam_at(ts, 1.0); tails = np.array(crop(imgs[i], z, cx, cy)[:, :, ::-1])
ff.stdin.close(); ff.wait()
subprocess.check_call(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-i", MIX, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", OUT])
print("done", OUT)
