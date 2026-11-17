#!/usr/bin/env python3
"""Generate cartoon object stickers for every noun a storyboard uses (props + held items).
usage: make_stickers.py board.json out_dir   -> out_dir/<slug>.png (transparent) and board['stickers'] = {name: 'prep/stickers/<slug>.png'}
Gemini text model writes each object as a bold cartoon SVG (free tier). Learned objects are cached in remotion/stickers/."""
import re, base64, io, json, os, re, sys, time, urllib.request

STYLE = ("A single cartoon {name}, drawn as a clean game sticker: thick dark plum-black outline, flat bright saturated colours with simple "
         "soft shading, charming and readable, centered, full object visible with small margin. Plain solid pure green (#00FF00) background, "
         "no ground, no shadow, no text, no extra objects.")
MODELS = os.environ.get("STICKER_MODELS", "gemini-2.5-flash-image,gemini-3.1-flash-image-preview").split(",")

def slug(n): return re.sub(r"[^a-z0-9]+", "-", n.lower()).strip("-") or "x"

SVG_PROMPT = ("Write ONE SVG illustration of: {name}.\n"
  "Style: bold cartoon sticker, like a polished mobile-game icon. Canvas viewBox=\"0 0 512 512\" width=\"512\" height=\"512\", transparent background (no background rect). "
  "The subject is centred and fills about 85% of the canvas. EVERY shape has a thick dark outline: stroke=\"#2a1830\" stroke-width=\"12\" stroke-linejoin=\"round\" stroke-linecap=\"round\". "
  "Flat saturated fill colours, plus one lighter highlight shape and one darker shade shape on the main volumes. Make it instantly recognisable with its typical features "
  "(an animal has eyes, beak/ears/legs; a tree has trunk and leafy crown; money has a coin face/symbol; a person-held item shows its characteristic shape). "
  "Rules: only svg, path, circle, ellipse, rect, polygon, g elements; no text, no images, no gradients, no filters, no script, at most 60 shapes. "
  "Reply with the SVG markup only, nothing else.")
SVG_MODELS = os.environ.get("STICKER_TEXT_MODELS", "gemini-flash-latest,gemini-3.5-flash,gemini-2.5-flash").split(",")
LIB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "stickers")

def clean_svg(txt):
    import xml.etree.ElementTree as ET
    m = re.search(r"<svg.*</svg>", txt, re.S)
    if not m: return None
    svg = m.group(0)
    if re.search(r"<script|<image|onload|href=\"http", svg, re.I): return None
    try: ET.fromstring(svg)
    except Exception: return None
    if "xmlns=" not in svg.split(">")[0]: svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    if not re.search(r"<svg[^>]*width=", svg): svg = svg.replace("<svg", '<svg width="512" height="512"', 1)
    return svg

T0 = time.time(); BUDGET = float(os.environ.get('STICKER_BUDGET', '240'))

def gen(name):
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key: return None
    for m in SVG_MODELS:
        for attempt in range(2):
            if time.time() - T0 > BUDGET: return None
            try:
                body = {"contents": [{"parts": [{"text": SVG_PROMPT.format(name=name)}]}], "generationConfig": {"temperature": 0.7}}
                r = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{m.strip()}:generateContent", json.dumps(body).encode(),
                                           {"Content-Type": "application/json", "x-goog-api-key": key})
                j = json.load(urllib.request.urlopen(r, timeout=40))
                svg = clean_svg(j["candidates"][0]["content"]["parts"][0]["text"])
                if svg: return svg
                print(f"  {name} [{m}]: invalid svg, retry", file=sys.stderr)
            except Exception as e:
                print(f"  {name} [{m}] try {attempt}: {e}", file=sys.stderr); time.sleep(3)
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
    t = re.sub(r"[^A-Za-z0-9 ]", "", name)[:12]
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><circle cx="256" cy="256" r="220" fill="#ffd45a" stroke="#2a1830" stroke-width="14"/>'
            f'<text x="256" y="276" font-size="48" text-anchor="middle" font-family="Arial" font-weight="bold" fill="#2a1830">{t}</text></svg>')

def _known3d():
    """every noun the 3D engine can already build (procedural models, Kenney GLBs, aliases, saved recipes): no sticker needed for those"""
    import re
    base = os.path.dirname(os.path.abspath(__file__)); toks = set()
    try:
        for ln in open(os.path.join(base, "..", "src", "videos", "story", "props3d.ts")).read().split("\n"):
            if re.match(r"\s*(const PROC\b|const ALIAS\b|const KEN\b|const DEFAULT_H|export const DEFAULT_H|Object\.assign\((PROC|ALIAS|DEFAULT_H))", ln) or ln.startswith("const PROC"):
                toks |= {t.lower() for t in re.findall(r"[A-Za-z][A-Za-z0-9]*", ln)}
                toks |= {t.lower() for t in re.findall(r"\"([a-z ]+)\"\s*:", ln)}
    except Exception: pass
    try: toks |= {k.replace(" ", "") for k in json.load(open(os.path.join(base, "..", "library", "models.json")))}
    except Exception: pass
    return toks

def has3d(n, toks):
    n = n.lower().strip(); w = re.sub(r"[^a-z ]", "", n).split(); last = w[-1] if w else n
    return any(c in toks for c in (n.replace(" ", ""), last, last.rstrip("s")))

def names_of(b):
    out = []
    for s in b["scenes"]:
        for p in s.get("props", []) or []: out.append(p["name"])
        for c in s["cast"]:
            if c.get("hold"): out.append(c["hold"])
    toks = _known3d()
    return [n for n in dict.fromkeys(n.strip().lower() for n in out if n) if not has3d(n, toks)]

def main(board_p, outdir):
    b = json.load(open(board_p)); os.makedirs(outdir, exist_ok=True)
    st = {}
    from concurrent.futures import ThreadPoolExecutor
    ALIAS = {"goldcoin":"gold-coin","wallet":"purse","handbag":"purse","sack":"money-bag","gold":"gold-coin","money":"coins","cash":"coins","treasure":"treasure-chest","hen":"chicken","rooster":"chicken","puppy":"dog","kitten":"cat","palace":"castle","tower":"castle","cottage":"house","home":"house","ship":"boat","sapphire":"gem","jewel":"gem","ruby":"gem","blade":"sword","love":"heart","cookie":"bread","loaf":"bread","cow":"cow","bull":"cow","automobile":"car","vehicle":"car","smartphone":"phone","fruit":"mango","plant":"tree","sapling":"tree","oak":"tree","stone":"rock","boulder":"rock","flame":"fire","trophy":"crown"}
    def lib_for(n):
        sl = slug(n); cands = [sl, sl.rstrip("s"), sl.replace("-", ""), ALIAS.get(sl, ""), ALIAS.get(sl.rstrip("s"), ""), ALIAS.get(sl.split("-")[-1], ""), sl.split("-")[-1], sl.split("-")[-1].rstrip("s")]
        for c in cands:
            if c and os.path.exists(os.path.join(LIB, c + ".svg")): return os.path.join(LIB, c + ".svg")
        return None
    def one(n):
        path = os.path.join(outdir, slug(n) + ".svg"); lib = os.path.join(LIB, slug(n) + ".svg"); hit = lib_for(n)
        if hit: svg = open(hit).read()
        else:
            svg = gen(n)
            if svg is None: print("  fallback for", n); svg = fallback(n)
            else: os.makedirs(LIB, exist_ok=True); open(lib, "w").write(svg)       # learned once, reused forever
        open(path, "w").write(svg)
        print("sticker", n, "->", path, flush=True)
        return n
    names = names_of(b)
    with ThreadPoolExecutor(2) as ex: list(ex.map(one, names))
    for n in names: st[n] = "prep/stickers/" + slug(n) + ".svg"
    for s in b["scenes"]:                                   # normalise names used on the board
        for p in s.get("props", []) or []: p["name"] = p["name"].strip().lower()
        for c in s["cast"]:
            if c.get("hold"): c["hold"] = c["hold"].strip().lower()
    b["stickers"] = st
    json.dump(b, open(board_p, "w"))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
