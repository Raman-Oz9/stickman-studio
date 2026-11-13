"""Download the CC0 Kenney kits the world uses and flatten their GLBs into public/bridge/kenney/."""
import io, re, sys, zipfile, urllib.request, pathlib
OUT = pathlib.Path("public/bridge/kenney"); OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0"}
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120).read()
for slug in ["nature-kit", "fantasy-town-kit", "pirate-kit", "city-kit-suburban", "furniture-kit"]:
    try:
        html = get(f"https://kenney.nl/assets/{slug}").decode("utf8", "ignore")
        m = re.search(r'(?:https://kenney\.nl)?(/media/pages/assets/[^"\'\s<>]+?\.zip)', html.replace("\\/", "/"))
        if not m:
            for mm in re.finditer(r"function initiateDownload", html):
                print("JS", " ".join(html[mm.start():mm.start()+900].split()))
            for src in re.findall(r"src=['\"]([^'\"]+\.js[^'\"]*)", html):
                try:
                    js = get(src if src.startswith("http") else "https://kenney.nl" + src).decode("utf8", "ignore")
                    for mm in re.finditer(r"initiateDownload", js):
                        print("JSFILE", src, " ".join(js[mm.start():mm.start()+900].split()))
                        break
                except Exception as e:
                    print("js fail", src, e)
            print("no zip link for", slug)
            break
        z = zipfile.ZipFile(io.BytesIO(get("https://kenney.nl" + m.group(1))))
        n = 0
        for name in z.namelist():
            if name.lower().endswith(".glb") and "glb" in name.lower() or name.lower().endswith(".glb"):
                dest = OUT / pathlib.Path(name).name
                if not dest.exists():
                    dest.write_bytes(z.read(name)); n += 1
        print(slug, "->", n, "glb")
    except Exception as e:
        print("failed", slug, e)
print(len(list(OUT.glob("*.glb"))), "glb files total")
