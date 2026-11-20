#!/usr/bin/env python3
"""Generate texture/backdrop resources with FREE image APIs and store them in remotion/public/tex/.
Order: Cloudflare Workers AI (flux-1-schnell; needs CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN) -> OVHcloud Stable Diffusion XL (free, no key) -> Stable Horde (free, no key).
usage: python3 remotion/scripts/gen_assets.py [name ...]   (no args = every missing item)"""
import base64, io, json, os, sys, time, urllib.parse, urllib.request
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "tex")
os.makedirs(OUT, exist_ok=True)
STYLE = "seamless tileable texture, top-down flat, even lighting, no objects, no text, painterly stylised game texture"
ITEMS = {
  "sand_dune": "close-up of sand surface with fine wind ripples, flat top-down view", "dry_dirt": "dry cracked dirt ground", "grass": "lush green grass with small flowers",
  "rock": "grey rough rock cliff surface", "snow": "fresh snow with soft shadows", "mud_brick": "ancient mud brick wall",
  "limestone": "sandstone limestone blocks wall", "marble": "white marble with grey veins", "wood_planks": "old wooden ship deck planks",
  "cobblestone": "flat top-down cobblestone pavement pattern, close-up of stones only", "roof_tiles": "terracotta roof tiles", "thatch": "straw thatch roof",
  "water_deep": "deep blue ocean water surface with soft foam", "forest_floor": "forest floor with leaves and moss", "gravel": "pebbles gravel path",
  "carpet_red": "red royal carpet with gold pattern",
  "egyptian_temple_wall": "warm Egyptian sandstone temple blocks with shallow symbolic relief motifs, no readable writing",
  "roman_stone": "weathered pale travertine Roman masonry with subtle chisel marks",
  "greek_marble": "sun-warmed ivory Greek marble with faint age patina",
  "islamic_tile": "turquoise and cobalt Islamic geometric ceramic tile mosaic",
  "pagoda_wood": "aged lacquered East Asian pagoda timber and joinery",
  "industrial_metal": "weathered dark iron industrial plate with rivets and subtle oxidation",
  "brick_wall": "aged red-brown industrial brick masonry",
  "concrete": "subtle modern architectural concrete with fine aggregate",
  "asphalt": "dark charcoal asphalt road surface with tiny aggregate",
  "glass_facade": "blue-grey reflective architectural glass panel grid",
  "ship_sail_cloth": "aged cream woven canvas sailcloth with subtle fibers and seams",
  "ancient_scroll_paper": "warm aged parchment with subtle fibers and natural staining",
}
SKY = {"sky_day": "bright blue daytime sky with soft clouds, wide panorama gradient, no sun disc",
       "sky_sunset": "warm sunset sky orange pink gradient with thin clouds, wide panorama",
       "sky_night": "night sky with many stars and faint milky way, wide panorama"}

def cloudflare(prompt, w=1024, h=1024):
    acc, tok = os.environ.get("CLOUDFLARE_ACCOUNT_ID"), os.environ.get("CLOUDFLARE_API_TOKEN")
    if not (acc and tok): raise RuntimeError("no cloudflare key")
    req = urllib.request.Request(f"https://api.cloudflare.com/client/v4/accounts/{acc}/ai/run/@cf/black-forest-labs/flux-1-schnell",
        data=json.dumps({"prompt": prompt, "steps": 6}).encode(), headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    return base64.b64decode(r["result"]["image"])

def ovh(prompt, w=1024, h=1024):
    """OVHcloud AI Endpoints, Stable Diffusion XL: free anonymous (rate limited, no key)."""
    req = urllib.request.Request("https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image",
        data=json.dumps({"prompt": prompt, "negative_prompt": "text, watermark, people"}).encode(), headers={"Content-Type": "application/json", "Accept": "image/jpeg"})
    return urllib.request.urlopen(req, timeout=180).read()

def horde(prompt, w=1024, h=1024):
    """Stable Horde (AI Horde): community Stable Diffusion workers, free anonymous key."""
    H = {"apikey": "0000000000", "Content-Type": "application/json", "Client-Agent": "stickman-studio:1:raman"}
    body = {"prompt": prompt, "params": {"width": 512, "height": 512, "steps": 25, "n": 1, "sampler_name": "k_euler_a", "cfg_scale": 7}, "nsfw": False, "censor_nsfw": True, "r2": True}
    rid = json.load(urllib.request.urlopen(urllib.request.Request("https://aihorde.net/api/v2/generate/async", data=json.dumps(body).encode(), headers=H), timeout=60))["id"]
    for _ in range(60):
        time.sleep(5)
        c = json.load(urllib.request.urlopen(urllib.request.Request(f"https://aihorde.net/api/v2/generate/check/{rid}", headers=H), timeout=60))
        if c.get("done"): break
    st = json.load(urllib.request.urlopen(urllib.request.Request(f"https://aihorde.net/api/v2/generate/status/{rid}", headers=H), timeout=60))
    return urllib.request.urlopen(st["generations"][0]["img"], timeout=120).read()


def save_valid_jpeg(data, name, w, h):
    """Decode provider output, normalise dimensions/format, and verify the saved JPEG."""
    with Image.open(io.BytesIO(data)) as source:
        image = source.convert("RGB")
    if image.size != (w, h):
        image = image.resize((w, h), Image.Resampling.LANCZOS)
    path = os.path.join(OUT, name + ".jpg")
    image.save(path, format="JPEG", quality=90, optimize=True, progressive=True)
    with Image.open(path) as check:
        if check.format != "JPEG" or check.size != (w, h):
            raise ValueError("saved image failed JPEG/dimension validation")
        check.verify()
    return os.path.getsize(path)

def make(name, prompt, w, h):
    for fn in [f for f in (cloudflare, ovh, horde) if not os.environ.get('ONLY') or f.__name__ == os.environ['ONLY']]:
        try:
            data = fn(prompt, w, h)
            if len(data) > 5000:
                size = save_valid_jpeg(data, name, w, h)
                print("ok", name, fn.__name__, f"{w}x{h}", f"{size} bytes")
                return True
        except Exception as e:
            print("  ", fn.__name__, "failed:", str(e)[:100])
        time.sleep(2)
    return False

def main():
    want = sys.argv[1:]
    jobs = [(k, f"{v}, {STYLE}", 1024, 1024) for k, v in ITEMS.items()] + [(k, v, 1536, 768) for k, v in SKY.items()]
    n = 0
    for name, prompt, w, h in jobs:
        if want and name not in want: continue
        existing = os.path.join(OUT, name + ".jpg")
        if not want and os.path.exists(existing):
            try:
                with Image.open(existing) as image:
                    if image.format == "JPEG" and image.size == (w, h):
                        continue
            except Exception:
                pass
        n += make(name, prompt, w, h)
    print("generated", n)

if __name__ == "__main__":
    main()
