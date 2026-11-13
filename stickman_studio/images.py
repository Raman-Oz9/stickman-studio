"""Scene image generation: painterly cartoon-stickman scenes like the cave reference video.

Provider chain (first that works wins, every provider is optional):
  1. Gemini image model   (needs GEMINI_API_KEY; best prompt-following and consistency)
  2. Pollinations / Flux  (free, no key)
  3. Procedural fallback  (flat vector scene from cinematic.py, so a render never dies)
"""
import base64
import io
import os
import time
import urllib.parse

import requests
from PIL import Image

STYLE = (
    "Cinematic 2D cartoon illustration in the style of a viral stickman storytelling channel. "
    "The character is a stickman: a very large round white head with a thick black outline, "
    "big expressive cartoon eyes, thick expressive eyebrows and an expressive mouth, thin black stick arms "
    "and legs with simple hands. Rich painterly background with dramatic cinematic lighting and depth. "
    "Clean, polished, high contrast. No text, no letters, no captions, no watermark, no frame."
)
SIZES = {"short": (768, 1344, "9:16"), "long": (1344, 768, "16:9")}


def build_prompt(scene, character, fmt="short"):
    view = "vertical 9:16 composition" if fmt == "short" else "wide 16:9 composition"
    shot = scene.get("shot_note", "")
    return (f"{STYLE} {view}. Main character: {character}. "
            f"Scene: {scene['image']}. {shot} Keep the character design identical in every scene.").strip()


def _gemini(prompt, aspect):
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        return None
    models = os.environ.get("IMAGE_GEMINI_MODELS", "gemini-2.5-flash-image,gemini-3.1-flash-image-preview").split(",")
    for model in [m.strip() for m in models if m.strip()]:
        for attempt in range(2):
            try:
                r = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    headers={"x-goog-api-key": key},
                    json={"contents": [{"parts": [{"text": prompt}]}],
                          "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}}},
                    timeout=180)
            except Exception as exc:
                print(f"  gemini {model}: {exc}")
                time.sleep(3)
                continue
            if r.status_code in (404, 400, 403):
                print(f"  gemini {model}: HTTP {r.status_code} {r.text[:120]}")
                break
            if r.status_code != 200:
                print(f"  gemini {model}: HTTP {r.status_code}, retrying")
                time.sleep(6 * (attempt + 1))
                continue
            try:
                for part in r.json()["candidates"][0]["content"]["parts"]:
                    data = part.get("inlineData") or part.get("inline_data")
                    if data:
                        return Image.open(io.BytesIO(base64.b64decode(data["data"]))).convert("RGB")
            except Exception as exc:
                print(f"  gemini {model}: bad response {exc}")
            break
    return None


def _pollinations(prompt, w, h, seed):
    url = ("https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt[:1400]) +
           f"?width={w}&height={h}&model=flux&nologo=true&enhance=false&seed={seed}")
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=180)
            if r.status_code == 200 and r.headers.get("content-type", "").startswith("image"):
                return Image.open(io.BytesIO(r.content)).convert("RGB")
            print(f"  pollinations: HTTP {r.status_code}")
        except Exception as exc:
            print(f"  pollinations: {exc}")
        time.sleep(5 * (attempt + 1))
    return None


def _procedural(scene, fmt, index):
    from .cinematic import render_frame
    w, h, _ = SIZES[fmt]
    sc = {"setting": scene.get("setting", "city"), "action": scene.get("action", "idle"),
          "duration": 4, "shirt": scene.get("shirt", "#2D91DC")}
    return render_frame(sc, 2.0, index, 0.0, fmt, (720, 1280) if fmt == "short" else (1280, 720), index * 101 + 9).resize((w, h))


def make_image(scene, character, fmt, index, dest):
    """Generate (or fetch from cache) the image for one scene. Returns the file path."""
    if os.path.exists(dest):
        return dest
    w, h, aspect = SIZES[fmt]
    prompt = build_prompt(scene, character, fmt)
    img = _gemini(prompt, aspect) or _pollinations(prompt, w, h, 1000 + index * 17)
    source = "ai"
    if img is None:
        print(f"  scene {index + 1}: no image provider worked, using procedural fallback")
        img, source = _procedural(scene, fmt, index), "fallback"
    img = img.convert("RGB")
    if img.size != (w, h):  # crop to the exact aspect, then resize
        tr = w / h
        ir = img.width / img.height
        if ir > tr:
            nw = int(img.height * tr)
            img = img.crop(((img.width - nw) // 2, 0, (img.width - nw) // 2 + nw, img.height))
        else:
            nh = int(img.width / tr)
            img = img.crop((0, (img.height - nh) // 2, img.width, (img.height - nh) // 2 + nh))
        img = img.resize((w, h), Image.Resampling.LANCZOS)
    img.save(dest, quality=95)
    print(f"  scene {index + 1}: image ok ({source})")
    return dest
