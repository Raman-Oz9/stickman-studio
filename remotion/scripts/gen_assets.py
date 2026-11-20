#!/usr/bin/env python3
"""Generate texture/backdrop resources with free image APIs into remotion/public/tex/.

Provider order: Cloudflare Workers AI -> Hugging Face Inference -> Pollinations.
Usage: python3 remotion/scripts/gen_assets.py [name ...] (no args = every missing item).
"""
import base64, json, os, sys, time, urllib.parse, urllib.request

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "tex")
os.makedirs(OUT, exist_ok=True)
STYLE = "seamless tileable texture, flat top-down game material, even diffuse lighting, painterly stylised 3D game art, 1024x1024, no text, no labels, no objects, no perspective"
ITEMS = {
  "sand_dune": "fine wind-rippled desert sand surface", "dry_dirt": "dry cracked earth and dusty soil", "grass": "dense lush short grass with sparse tiny wildflowers",
  "rock": "weathered grey granite and rough stone surface", "snow": "fresh powder snow with subtle crystalline variation", "mud_brick": "ancient sun-baked mud brick wall",
  "limestone": "warm sandstone limestone masonry blocks", "marble": "white marble with subtle grey veins", "wood_planks": "weathered ancient ship deck wooden planks",
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
SKY = {"sky_day": "bright blue daytime sky with soft layered clouds, seamless horizontal panorama gradient, no sun disc",
       "sky_sunset": "warm sunset sky orange pink gradient with thin soft clouds, seamless horizontal panorama",
       "sky_night": "deep blue night sky with sparse stars and faint milky way, seamless horizontal panorama"}

def cloudflare(prompt, w=1024, h=1024):
    acc, tok = os.environ.get("CLOUDFLARE_ACCOUNT_ID"), os.environ.get("CLOUDFLARE_API_TOKEN")
    if not (acc and tok): raise RuntimeError("no Cloudflare credentials")
    req = urllib.request.Request(f"https://api.cloudflare.com/client/v4/accounts/{acc}/ai/run/@cf/black-forest-labs/flux-1-schnell",
        data=json.dumps({"prompt": prompt, "steps": 6}).encode(), headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    return base64.b64decode(r["result"]["image"])

def pollinations(prompt, w=1024, h=1024):
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width={w}&height={h}&nologo=true&model=flux"
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "stickman-studio"}), timeout=180).read()

def huggingface(prompt, w=1024, h=1024):
    tok = os.environ.get("HF_TOKEN")
    if not tok: raise RuntimeError("no Hugging Face token")
    req = urllib.request.Request("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        data=json.dumps({"inputs": prompt}).encode(), headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    return urllib.request.urlopen(req, timeout=180).read()

def make(name, prompt, w=1024, h=1024):
    for fn in (cloudflare, huggingface, pollinations):
        try:
            data = fn(prompt, w, h)
            if len(data) > 5000:
                path = os.path.join(OUT, name + ".jpg")
                with open(path, "wb") as f:
                    f.write(data)
                print("ok", name, fn.__name__, len(data))
                return True
        except Exception as e:
            print(" ", fn.__name__, "failed:", str(e)[:140])
        time.sleep(2)
    print("FAILED", name)
    return False

def main():
    want = sys.argv[1:]
    jobs = [(k, f"{v}, {STYLE}", 1024, 1024) for k, v in ITEMS.items()] + [(k, v, 1536, 768) for k, v in SKY.items()]
    selected = [(k, p, w, h) for k, p, w, h in jobs if not want or k in want]
    unknown = sorted(set(want) - {k for k, _, _, _ in jobs})
    if unknown:
        raise SystemExit("unknown texture name(s): " + ", ".join(unknown))
    failed = []
    generated = 0
    for name, prompt, w, h in selected:
        path = os.path.join(OUT, name + ".jpg")
        if not want and os.path.exists(path):
            continue
        if make(name, prompt, w, h):
            generated += 1
        else:
            failed.append(name)
    print("generated", generated)
    if failed:
        print("generation unavailable for:", ", ".join(failed))
        # Existing procedural material colours remain the safe fallback.

if __name__ == "__main__":
    main()
