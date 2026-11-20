#!/usr/bin/env python3
"""Generate story textures with free image APIs and write validated, tileable JPEGs.

Provider order: Cloudflare Workers AI -> OVHcloud SDXL -> Stable Horde.
Usage: python3 remotion/scripts/gen_assets.py [name ...] (no args = every missing item).
"""
import base64
import io
import json
import os
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "tex")
os.makedirs(OUT, exist_ok=True)
STYLE = "seamless tileable texture, flat top-down game material, even diffuse lighting, painterly stylised game art, no text, no labels, no isolated objects, no perspective"
ITEMS = {
  "sand_dune": "fine wind-rippled desert sand surface", "dry_dirt": "dry cracked earth and dusty soil", "grass": "dense lush short grass with sparse tiny wildflowers",
  "rock": "weathered grey granite and rough stone surface", "snow": "fresh powder snow with subtle crystalline variation", "mud_brick": "ancient sun-baked mud brick wall",
  "limestone": "warm sandstone limestone masonry blocks", "marble": "white marble with subtle grey veins", "wood_planks": "weathered ancient wooden planks",
  "cobblestone": "irregular medieval cobblestone pavement close-up", "roof_tiles": "aged terracotta roof tiles", "thatch": "golden straw thatch roofing",
  "water_deep": "deep blue ocean surface with subtle foam patterns", "forest_floor": "leaf litter, moss and dark forest soil", "gravel": "small rounded pebbles and gravel path",
  "carpet_red": "rich red Persian carpet with intricate gold geometric ornament",
  "egyptian_temple_wall": "warm Egyptian sandstone temple masonry with shallow carved symbolic relief motifs, no readable writing",
  "roman_stone": "weathered pale travertine Roman masonry with subtle chisel marks",
  "greek_marble": "sun-warmed ivory Greek marble with faint age patina",
  "islamic_tile": "intricate turquoise and cobalt Islamic geometric ceramic tile mosaic",
  "pagoda_wood": "aged lacquered East Asian pagoda timber and joinery",
  "industrial_metal": "weathered dark iron industrial plate with rivets and subtle oxidation",
  "brick_wall": "aged red-brown industrial brick masonry",
  "concrete": "subtle modern architectural concrete with fine aggregate",
  "asphalt": "dark charcoal asphalt road surface with tiny aggregate",
  "glass_facade": "blue-grey reflective architectural glass panel grid, subtle and seamless",
  "ship_sail_cloth": "aged cream woven canvas sailcloth with subtle fibers and seams",
  "ancient_scroll_paper": "warm aged parchment paper with subtle fibers and faint natural staining",
}
SKY = {
  "sky_day": "bright blue daytime sky with soft layered clouds, seamless horizontal panorama gradient, no sun disc",
  "sky_sunset": "warm sunset sky orange pink gradient with thin soft clouds, seamless horizontal panorama",
  "sky_night": "deep blue night sky with sparse stars and faint milky way, seamless horizontal panorama",
}

def cloudflare(prompt, w=1024, h=1024):
    account, token = os.environ.get("CLOUDFLARE_ACCOUNT_ID"), os.environ.get("CLOUDFLARE_API_TOKEN")
    if not (account and token):
        raise RuntimeError("no Cloudflare credentials")
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/@cf/black-forest-labs/flux-1-schnell",
        data=json.dumps({"prompt": prompt, "steps": 6}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    result = json.load(urllib.request.urlopen(req, timeout=120))
    return base64.b64decode(result["result"]["image"])

def ovh(prompt, w=1024, h=1024):
    req = urllib.request.Request(
        "https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image",
        data=prompt.encode(), headers={"Content-Type": "text/plain", "Accept": "application/octet-stream"})
    return urllib.request.urlopen(req, timeout=180).read()

def horde(prompt, w=1024, h=1024):
    headers = {"apikey": "0000000000", "Content-Type": "application/json", "Client-Agent": "stickman-studio:1:raman"}
    body = {"prompt": prompt, "params": {"width": 512, "height": 512, "steps": 25, "n": 1,
            "sampler_name": "k_euler_a", "cfg_scale": 7}, "nsfw": False, "censor_nsfw": True, "r2": True}
    request = urllib.request.Request("https://aihorde.net/api/v2/generate/async",
        data=json.dumps(body).encode(), headers=headers)
    request_id = json.load(urllib.request.urlopen(request, timeout=60))["id"]
    for _ in range(60):
        time.sleep(5)
        status = json.load(urllib.request.urlopen(urllib.request.Request(
            f"https://aihorde.net/api/v2/generate/check/{request_id}", headers=headers), timeout=60))
        if status.get("done"):
            break
    result = json.load(urllib.request.urlopen(urllib.request.Request(
        f"https://aihorde.net/api/v2/generate/status/{request_id}", headers=headers), timeout=60))
    return urllib.request.urlopen(result["generations"][0]["img"], timeout=120).read()

def _edge_blend(image, width=64):
    """Crossfade opposite borders so repeated tiles have matching edge colours."""
    width = min(width, image.width // 4, image.height // 4)
    if width < 2:
        return image
    ramp = Image.new("L", (width, 1))
    ramp.putdata([round(255 * (1 - i / (width - 1))) for i in range(width)])
    horizontal_mask = ramp.resize((width, image.height))
    left = image.crop((0, 0, width, image.height))
    right = image.crop((image.width - width, 0, image.width, image.height)).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    common = Image.blend(left, right, 0.5)
    image.paste(Image.composite(common, left, horizontal_mask), (0, 0))
    right_result = Image.composite(common, right, horizontal_mask).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    image.paste(right_result, (image.width - width, 0))

    top = image.crop((0, 0, image.width, width))
    bottom = image.crop((0, image.height - width, image.width, image.height)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    common = Image.blend(top, bottom, 0.5)
    vertical_mask = ramp.transpose(Image.Transpose.ROTATE_90).resize((image.width, width))
    image.paste(Image.composite(common, top, vertical_mask), (0, 0))
    bottom_result = Image.composite(common, bottom, vertical_mask).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    image.paste(bottom_result, (0, image.height - width))
    return image

def _save_jpeg(data, name, width, height, tileable):
    with Image.open(io.BytesIO(data)) as source:
        image = source.convert("RGB")
    if image.size != (width, height):
        image = image.resize((width, height), Image.Resampling.LANCZOS)
    if tileable:
        image = _edge_blend(image)
    path = os.path.join(OUT, name + ".jpg")
    image.save(path, format="JPEG", quality=90, optimize=True, progressive=True, subsampling=1)
    with Image.open(path) as check:
        check.verify()
    return os.path.getsize(path)

def make(name, prompt, width, height, tileable=True):
    providers = (cloudflare, ovh, horde)
    if os.environ.get("ONLY"):
        providers = tuple(fn for fn in providers if fn.__name__ == os.environ["ONLY"])
    for provider in providers:
        try:
            data = provider(prompt, width, height)
            if len(data) < 5000:
                raise ValueError(f"provider returned suspiciously small image ({len(data)} bytes)")
            size = _save_jpeg(data, name, width, height, tileable)
            print("ok", name, provider.__name__, f"{width}x{height}", f"{size} bytes", flush=True)
            return True
        except Exception as error:
            print(" ", provider.__name__, "failed:", str(error)[:160], flush=True)
        time.sleep(2)
    print("FAILED", name, flush=True)
    return False

def main():
    requested = sys.argv[1:]
    jobs = [(key, f"{description}, {STYLE}", 1024, 1024, True) for key, description in ITEMS.items()]
    jobs += [(key, description, 1536, 768, False) for key, description in SKY.items()]
    known = {job[0] for job in jobs}
    unknown = sorted(set(requested) - known)
    if unknown:
        raise SystemExit("unknown texture name(s): " + ", ".join(unknown))
    selected = [job for job in jobs if not requested or job[0] in requested]
    generated, failed = 0, []
    for name, prompt, width, height, tileable in selected:
        path = os.path.join(OUT, name + ".jpg")
        if not requested and os.path.exists(path):
            try:
                with Image.open(path) as existing:
                    if existing.format == "JPEG" and existing.size == (width, height):
                        continue
            except Exception:
                pass
        if make(name, prompt, width, height, tileable):
            generated += 1
        else:
            failed.append(name)
    print("generated", generated)
    if failed:
        print("generation unavailable for:", ", ".join(failed))
        # Existing procedural material colours remain the safe fallback.
        raise SystemExit(1)

if __name__ == "__main__":
    main()
