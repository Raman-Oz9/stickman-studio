#!/usr/bin/env python3
"""Generate texture/backdrop resources with FREE image APIs and store them in remotion/public/tex/.
Order: Cloudflare Workers AI (flux-1-schnell; needs CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN) -> Pollinations (no key).
usage: python3 remotion/scripts/gen_assets.py [name ...]   (no args = every missing item)"""
import base64, json, os, sys, time, urllib.parse, urllib.request

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

def pollinations(prompt, w=1024, h=1024):
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width={w}&height={h}&nologo=true&model=flux"
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "stickman-studio"}), timeout=180).read()

def huggingface(prompt, w=1024, h=1024):
    tok = os.environ.get("HF_TOKEN")
    if not tok: raise RuntimeError("no HF_TOKEN")
    req = urllib.request.Request("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        data=json.dumps({"inputs": prompt}).encode(), headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    return urllib.request.urlopen(req, timeout=180).read()

def make(name, prompt, w, h):
    for fn in (cloudflare, huggingface, pollinations):
        try:
            data = fn(prompt, w, h)
            if len(data) > 5000:
                open(os.path.join(OUT, name + ".jpg"), "wb").write(data); print("ok", name, fn.__name__, len(data)); return True
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
        if not want and os.path.exists(os.path.join(OUT, name + ".jpg")): continue
        n += make(name, prompt, w, h)
    print("generated", n)

if __name__ == "__main__":
    main()
