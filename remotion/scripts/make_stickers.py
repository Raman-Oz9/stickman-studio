#!/usr/bin/env python3
"""Generate cartoon object stickers for every noun a storyboard uses (props + held items).
usage: make_stickers.py board.json out_dir   -> out_dir/<slug>.png (transparent) and board['stickers'] = {name: 'prep/stickers/<slug>.png'}
Gemini image model on a solid green background, then chroma-key. Cached by name so repeats are free."""
import base64, io, json, os, re, sys, time, urllib.request
import numpy as np
from PIL import Image

STYLE = ("A single cartoon {name}, drawn as a clean game sticker: thick dark plum-black outline, flat bright saturated colours with simple "
         "soft shading, charming and readable, centered, full object visible with small margin. Plain solid pure green (#00FF00) background, "
         "no ground, no shadow, no text, no extra objects.")
MODELS = os.environ.get("STICKER_MODELS", "gemini-2.5-flash-image,gemini-3.1-flash-image-preview").split(",")

def slug(n): return re.sub(r"[^a-z0-9]+", "-", n.lower()).strip("-") or "x"

def gen(name):
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key: return None
    for m in MODELS:
        for attempt in range(3):
            try:
                body = {"contents": [{"parts": [{"text": STYLE.format(name=name)}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1"}}}
                r = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{m.strip()}:generateContent", json.dumps(body).encode(),
                                           {"Content-Type": "application/json", "x-goog-api-key": key})
                j = json.load(urllib.request.urlopen(r, timeout=120))
                for part in j["candidates"][0]["content"]["parts"]:
                    d = part.get("inlineData") or part.get("inline_data")
                    if d: return Image.open(io.BytesIO(base64.b64decode(d["data"]))).convert("RGB")
            except Exception as e:
                print(f"  {name} [{m}] try {attempt}: {e}", file=sys.stderr); time.sleep(4)
    return None

def key_out(im):
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = np.clip((g - np.maximum(r, b) - 25) / 60, 0, 1)         # how "background green" each pixel is
    alpha = 1 - green
    # despill: pull green out of edge pixels
    spill = np.maximum(0, g - np.maximum(r, b)) * (alpha < 1)
    a[..., 1] = np.minimum(g, np.maximum(r, b) + 10 * (1 - alpha) + 0)
    out = np.dstack([a[..., :3], alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    # keep the largest connected-ish region: crop to the bounding box of opaque pixels
    bb = img.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
    if bb:
        pad = 6; bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(img.width, bb[2] + pad), min(img.height, bb[3] + pad)); img = img.crop(bb)
    return img.resize((int(img.width * 512 / max(img.size)), int(img.height * 512 / max(img.size))), Image.LANCZOS)

def fallback(name):
    from PIL import ImageDraw
    im = Image.new("RGBA", (512, 512), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse((40, 40, 472, 472), fill=(255, 214, 90, 255), outline=(40, 20, 50, 255), width=14)
    d.text((256, 256), name[:14], fill=(40, 20, 50, 255), anchor="mm")
    return im

def names_of(b):
    out = []
    for s in b["scenes"]:
        for p in s.get("props", []) or []: out.append(p["name"])
        for c in s["cast"]:
            if c.get("hold"): out.append(c["hold"])
    return list(dict.fromkeys(n.strip().lower() for n in out if n))

def main(board_p, outdir):
    b = json.load(open(board_p)); os.makedirs(outdir, exist_ok=True)
    st = {}
    for n in names_of(b):
        path = os.path.join(outdir, slug(n) + ".png")
        if not os.path.exists(path):
            im = gen(n)
            if im is None: print("  fallback for", n); out = fallback(n)
            else: out = key_out(im)
            out.save(path)
        st[n] = "prep/stickers/" + slug(n) + ".png"
        print("sticker", n, "->", path)
    for s in b["scenes"]:                                   # normalise names used on the board
        for p in s.get("props", []) or []: p["name"] = p["name"].strip().lower()
        for c in s["cast"]:
            if c.get("hold"): c["hold"] = c["hold"].strip().lower()
    b["stickers"] = st
    json.dump(b, open(board_p, "w"))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
