import json, struct, sys, pathlib
for n in sys.argv[1:]:
    f = pathlib.Path("public/bridge/kenney") / (n + ".glb")
    if not f.exists(): print(n, "MISSING"); continue
    b = f.read_bytes(); ln = struct.unpack("<I", b[12:16])[0]; j = json.loads(b[20:20 + ln])
    print(n, len(b), "anims:", [a.get("name") for a in j.get("animations", [])], "skins:", len(j.get("skins", [])),
          "joints:", [j["nodes"][i].get("name") for i in (j["skins"][0]["joints"] if j.get("skins") else [])][:40], "images:", [("emb" if "bufferView" in i else i.get("uri")) for i in j.get("images", [])])
