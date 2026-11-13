def write_srt(scenes, path):
    def stamp(seconds):
        ms = int(round(seconds * 1000))
        h, rem = divmod(ms, 3600000)
        m, rem = divmod(rem, 60000)
        s, milli = divmod(rem, 1000)
        return f"{h:02}:{m:02}:{s:02},{milli:03}"
    now, chunks = 0.0, []
    for i, scene in enumerate(scenes, 1):
        end = now + float(scene.get("duration", 4))
        text = scene.get("narration", "").replace("-->", "→").strip()
        chunks.append(f"{i}\n{stamp(now)} --> {stamp(end)}\n{text}\n")
        now = end
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(chunks))
