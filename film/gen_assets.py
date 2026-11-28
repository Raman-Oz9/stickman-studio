#!/usr/bin/env python3
"""Generate props / textures / backgrounds for the 2D engine with Cloudflare Workers AI (flux-1-schnell).
usage: gen_assets.py [only_substring ...]   (env CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID). Skips existing files."""
import base64, io, json, os, sys, time
import numpy as np, requests
from PIL import Image
M = json.load(open(os.path.join(os.path.dirname(__file__), "assets_manifest.json")))
OUT = os.path.join(os.path.dirname(__file__), "assets"); os.makedirs(OUT, exist_ok=True)
tok, acc = os.environ["CLOUDFLARE_API_TOKEN"], os.environ["CLOUDFLARE_ACCOUNT_ID"]
only = sys.argv[1:]

def gen(prompt, seed):
    for att in range(4):
        r = requests.post(f"https://api.cloudflare.com/client/v4/accounts/{acc}/ai/run/@cf/black-forest-labs/flux-1-schnell",
                          headers={"Authorization": "Bearer " + tok}, json={"prompt": prompt[:1900], "steps": 8, "seed": seed}, timeout=240)
        if r.status_code == 200:
            return Image.open(io.BytesIO(base64.b64decode(r.json()["result"]["image"]))).convert("RGB")
        print("  http", r.status_code, r.text[:100]); time.sleep(6 * (att + 1))
    return None

def cutout(im, thr=28):
    """remove the plain white background by flood-filling from the borders, then trim"""
    a = np.array(im).astype(np.int16); h, w = a.shape[:2]
    white = (a.min(axis=2) > 255 - thr)
    mask = np.zeros((h, w), bool); st = [(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)]
    st = [p for p in st if white[p]]
    while st:
        y, x = st.pop()
        if mask[y, x] or not white[y, x]: continue
        mask[y, x] = True
        if y > 0: st.append((y - 1, x))
        if y < h - 1: st.append((y + 1, x))
        if x > 0: st.append((y, x - 1))
        if x < w - 1: st.append((y, x + 1))
    alpha = np.where(mask, 0, 255).astype(np.uint8)
    # feather 1px
    from PIL import ImageFilter
    al = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8))
    rgba = im.convert("RGBA"); rgba.putalpha(al)
    bb = al.point(lambda v: 255 if v > 20 else 0).getbbox()
    if bb: rgba = rgba.crop(bb)
    rgba.thumbnail((640, 640), Image.LANCZOS); return rgba

def seamless(im):
    a = np.array(im).astype(np.float32); h, w = a.shape[:2]
    rolled = np.roll(np.roll(a, h // 2, 0), w // 2, 1)
    y = np.abs(np.linspace(-1, 1, h))[:, None]; x = np.abs(np.linspace(-1, 1, w))[None, :]
    wgt = np.clip(1 - np.maximum(x, y) ** 2 * 1.0, 0, 1)[..., None]
    wgt = np.clip((1 - np.maximum(x, y)) * 2.2, 0, 1)[..., None]
    out = (a * wgt + rolled * (1 - wgt)).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out).resize((512, 512), Image.LANCZOS)

jobs = []
for k, v in M["props"].items(): jobs.append(("prop", k, f"{v}. {M['style_prop']}"))
for k, v in M["textures"].items(): jobs.append(("tex", k, f"{v}. {M['style_tex']}"))
for k, v in M["backgrounds"].items(): jobs.append(("bg", k, f"{v}. {M['style_bg']}"))
ok = fail = 0
for kind, k, prompt in jobs:
    name = f"{kind}_{k}.png"; fp = os.path.join(OUT, name)
    if os.path.exists(fp) or (only and not any(o in name for o in only)): continue
    im = gen(prompt, abs(hash(k)) % 100000)
    if im is None: fail += 1; print("FAIL", name); continue
    if kind == "prop": im = cutout(im)
    elif kind == "tex": im = seamless(im)
    else:
        im = im.resize((768, 1344), Image.LANCZOS) if im.height > im.width else im
        im.thumbnail((1024, 1024), Image.LANCZOS)
    im.save(fp, optimize=True); ok += 1; print("ok", name, im.size)
print("done", ok, "fail", fail)
