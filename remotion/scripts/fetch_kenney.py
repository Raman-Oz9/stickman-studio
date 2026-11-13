"""Download the CC0 Kenney kits the world uses and flatten their GLBs into public/bridge/kenney/.
Kenney's site hands out a fresh signed link from /download-link/<hex of "assets/<slug>"> (the page's own
"Continue without donating" button does exactly this)."""
import http.cookiejar, io, json, re, zipfile, urllib.request, pathlib
OUT = pathlib.Path("public/bridge/kenney"); OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"}
OP = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def get(u, ref=None):
    h = dict(UA)
    if ref: h.update({"Referer": ref, "Accept": "application/json, text/plain, */*", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Site": "same-origin"})
    return OP.open(urllib.request.Request(u, headers=h), timeout=180).read()
for slug in ["nature-kit", "fantasy-town-kit", "pirate-kit", "city-kit-suburban", "furniture-kit"]:
    try:
        html = get(f"https://kenney.nl/assets/{slug}").decode("utf8", "ignore")
        m = re.search(r"data-download-id='([0-9a-f]+)'", html)
        did = m.group(1) if m else ("assets/" + slug).encode().hex()
        url = json.loads(get("https://kenney.nl/download-link/" + did, ref=f"https://kenney.nl/assets/{slug}"))["url"]
        z = zipfile.ZipFile(io.BytesIO(get(url)))
        n = 0
        for name in z.namelist():
            if name.lower().endswith(".glb"):
                dest = OUT / pathlib.Path(name).name
                if not dest.exists():
                    dest.write_bytes(z.read(name)); n += 1
        print(slug, "->", n, "glb")
    except Exception as e:
        print("failed", slug, repr(e)[:200])
print(len(list(OUT.glob("*.glb"))), "glb files total")
