#!/usr/bin/env python3
"""Generate cartoon object stickers for every noun a storyboard uses (props + held items).
usage: make_stickers.py board.json out_dir   -> out_dir/<slug>.png (transparent) and board['stickers'] = {name: 'prep/stickers/<slug>.png'}
Gemini text model writes each object as a bold cartoon SVG (free tier). Learned objects are cached in remotion/stickers/."""
import base64, io, json, os, re, sys, time, urllib.request

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

def gen(name):
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key: return None
    for m in SVG_MODELS:
        for attempt in range(2):
            try:
                body = {"contents": [{"parts": [{"text": SVG_PROMPT.format(name=name)}]}], "generationConfig": {"temperature": 0.7}}
                r = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{m.strip()}:generateContent", json.dumps(body).encode(),
                                           {"Content-Type": "application/json", "x-goog-api-key": key})
                j = json.load(urllib.request.urlopen(r, timeout=120))
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
        path = os.path.join(outdir, slug(n) + ".svg"); lib = os.path.join(LIB, slug(n) + ".svg")
        if os.path.exists(lib): open(path, "w").write(open(lib).read())
        else:
            svg = gen(n)
            if svg is None: print("  fallback for", n); svg = fallback(n)
            else: os.makedirs(LIB, exist_ok=True); open(lib, "w").write(svg)       # learned once, reused forever
            open(path, "w").write(svg)
        st[n] = "prep/stickers/" + slug(n) + ".svg"
        print("sticker", n, "->", path)
    for s in b["scenes"]:                                   # normalise names used on the board
        for p in s.get("props", []) or []: p["name"] = p["name"].strip().lower()
        for c in s["cast"]:
            if c.get("hold"): c["hold"] = c["hold"].strip().lower()
    b["stickers"] = st
    json.dump(b, open(board_p, "w"))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
