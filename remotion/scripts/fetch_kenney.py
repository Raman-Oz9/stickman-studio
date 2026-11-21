"""Download the CC0 Kenney kits the world uses and flatten their GLBs into public/bridge/kenney/.
Kenney's site hands out a fresh signed link from /download-link/<hex of "assets/<slug>"> (the page's own
"Continue without donating" button does exactly this)."""
import http.cookiejar, io, json, re, struct, zipfile, urllib.request, pathlib, posixpath
OUT = pathlib.Path("public/bridge/kenney"); OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"}
OP = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def get(u, ref=None):
    h = dict(UA)
    if ref: h.update({"Referer": ref, "Accept": "application/json, text/plain, */*", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Site": "same-origin"})
    return OP.open(urllib.request.Request(u, headers=h), timeout=180).read()

def embed(glb: bytes, z, base: str) -> bytes:
    """Kenney GLBs point at an external Textures/colormap.png: pull it from the zip and embed it so the model keeps its colours."""
    try:
        if glb[:4] != b"glTF": return glb
        ln = struct.unpack("<I", glb[12:16])[0]; js = json.loads(glb[20:20 + ln]); off = 20 + ln; off += (4 - off % 4) % 4
        bl = struct.unpack("<I", glb[off:off + 4])[0]; binc = bytearray(glb[off + 8:off + 8 + bl]) if glb[off + 4:off + 8] == b"BIN\x00" else bytearray()
        imgs = js.get("images", [])
        if not imgs or all("uri" not in i or i["uri"].startswith("data:") for i in imgs): return glb
        names = {n.lower(): n for n in z.namelist()}
        for im in imgs:
            u = im.get("uri")
            if not u or u.startswith("data:"): continue
            cand = [posixpath.normpath(posixpath.join(base, u)).lower(), posixpath.join(posixpath.dirname(base), "textures", posixpath.basename(u)).lower()] + [n for n in names if n.endswith("/" + posixpath.basename(u).lower())]
            hit = next((names[c] for c in cand if c in names), None)
            if not hit: return glb
            data = z.read(hit); binc += b"\0" * ((4 - len(binc) % 4) % 4); start = len(binc); binc += data
            js.setdefault("bufferViews", []).append({"buffer": 0, "byteOffset": start, "byteLength": len(data)})
            im.pop("uri"); im["bufferView"] = len(js["bufferViews"]) - 1; im["mimeType"] = "image/png" if hit.lower().endswith("png") else "image/jpeg"
        binc += b"\0" * ((4 - len(binc) % 4) % 4)
        js.setdefault("buffers", [{}]); js["buffers"][0]["byteLength"] = len(binc); js["buffers"][0].pop("uri", None)
        jb = json.dumps(js, separators=(",", ":")).encode(); jb += b" " * ((4 - len(jb) % 4) % 4)
        out = struct.pack("<II", len(jb), 0x4E4F534A) + jb + struct.pack("<II", len(binc), 0x004E4942) + bytes(binc)
        return b"glTF" + struct.pack("<II", 2, 12 + len(out)) + out
    except Exception as e:
        print("embed failed", base, repr(e)[:100]); return glb
for slug in ["nature-kit", "fantasy-town-kit", "pirate-kit", "city-kit-suburban", "furniture-kit", "car-kit", "city-kit-commercial", "city-kit-roads", "city-kit-industrial", "watercraft-pack", "space-kit", "train-kit", "blaster-kit", "cube-pets", "survival-kit", "castle-kit", "mini-dungeon", "food-kit", "weapon-pack", "toy-car-kit", "blocky-characters", "animal-pack", "graveyard-kit", "retro-medieval-kit", "modular-buildings", "building-kit", "platformer-kit", "holiday-kit", "hexagon-kit", "tower-defense-kit", "mini-market", "mini-characters", "brick-kit", "pirate-pack", "medieval-town-base", "castle-kit-2", "desert-kit", "ancient-kit", "fish-pack"]:
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
                    dest.write_bytes(embed(z.read(name), z, name)); n += 1
        print(slug, "->", n, "glb")
    except Exception as e:
        print("failed", slug, repr(e)[:200])
print(len(list(OUT.glob("*.glb"))), "glb files total")
