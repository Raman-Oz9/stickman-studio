#!/usr/bin/env python3
"""Script -> storyboard JSON for the StoryShort composition.
usage: plan_story.py script.txt board.json
Uses Gemini (GEMINI_API_KEY) or Groq (GROQ_API_KEY) when available; otherwise a keyword heuristic, so it always works."""
import json, os, re, sys, urllib.request

ROLES = ["king","queen","prince","princess","knight","wizard","witch","police","policewoman","detective","thief","judge","doctor","nurse","scientist","chef","teacher",
         "businessman","businesswoman","worker","farmer","peasant","merchant","pirate","sailor","athlete","musician","student","man","woman","grandpa","grandma",
         "mother","father","kid","girl","boy","baby","guard","soldier","townsfolk"]
LIB = ["gold coin","coins","money bag","purse","mango","apple","apple tree","tree","seed","chicken","egg","crown","sword","key","treasure chest","castle","house","bread","cow",
       "dog","cat","car","book","gem","heart","sun","flower","phone","boat","rock","fire","bone","fish","cake","flag"]
EXPR = ["neutral", "stern", "grin", "laugh", "whistle", "nervous", "shock", "relief", "dazed", "pained", "smile", "smile_closed"]
SHOTS = ["wide", "medium", "close", "low", "over", "high"]
MOVES = ["push", "pull", "reveal", "pan", "descend", "orbit", "hold", "track", "crane", "tiltup", "tiltdown"]
SPEC = f"""Return ONLY JSON: {{"title": str, "scenes": [scene,...]}}. You are the DIRECTOR of a cartoon story video: every noun in the script must be SEEN and every verb ACTED.
One scene per sentence or clause (2.5-5 s each). scene = {{"dur": seconds, "shot": one of {SHOTS}, "target": cast id the camera favours,
"move": one of {MOVES}, "focus": optional "@propname" or cast id the camera must point at, "light": "day"|"golden", "extras": 0-10 background townsfolk,
"caption": the spoken words verbatim (max 12), "narration": full sentence spoken,
"cast": [{{"id": str, "role": one of {ROLES}, "x": -3..3, "z": -1..1, "expr": one of {EXPR}, "expr2": optional reaction, "at2": 0.3-0.8,
  "look": "partner"|"left"|"right"|"cam", "hold": optional item name the character carries in hand, "to": optional {{"x":..,"z":..}} destination the character walks/runs to during the scene,
  "act": optional "wave"|"cheer"|"point"|"nod"|"run" ("run" = sprint to "to"), "walkAt": 0-0.5 when moving starts}}],
"props": [{{"name": item (prefer: {", ".join(LIB)}; any other noun is fine, it gets drawn), "x": -3..3, "z": -1..1, "h": height in metres (0.3 coin, 0.9 chicken, 4 tree, 5 castle),
  "anim": "pop"|"grow"|"bounce"|"float"|"fall"|"spin"|"static", "at": 0-0.8 when it appears (fraction of scene), "until": optional when it vanishes, "count": copies, "spread": width of the group}}]}}.
RULES. (1) Every concrete noun in the narration becomes a prop or a held item in that scene (seed, mango, coins, chicken, tree, castle, purse...). Animals are props. Many coins: anim "fall", count 12-20, spread 2.5.
(2) Characters ACT: carrying = "hold" + "to"; stealing = thief with "hold":"<stolen item>"; running away = act "run" with "to" far away (x +-4), move "track", focus "@<item>"; pointing = act "point" with look toward the prop; a prop must be placed within x -2.5..2.5 and near the character so it is IN FRAME.
(3) Use the right role for the person named: police, thief, doctor, nurse, chef, teacher, king, queen, pirate, grandma, businessman... Use different roles for different people; give a recurring person the same id/role. Max 3 characters per scene, >=1.2 m apart. Use "v" 0-5 (optional) to vary two people of the same role.
(4) Camera language: "reveal" = push-in from environment to a character (opening, introductions); "push" = approach a face for emotion; "pull" = start on a face/object and widen; "pan" = two-person exchange; "descend" with shot "high" = overhead establishing;
"track" = follow a walking/running character sideways (use with act run/walk); "crane" = rise up and over a scene; "tiltup" = look up (tall tree, castle, falling coins); "tiltdown" = look down at the object; when the story is about an object set "focus":"@object".
Reaction (expr2+at2) triggers a quick push-in and hold: use it for surprise, fear, joke, discovery. Never repeat the same shot type or move twice in a row. Open with a wide shot, use close shots on emotional beats, golden light only for the ending or warm/sad beats."""

def post(url, headers, body):
    r = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", **headers})
    return json.load(urllib.request.urlopen(r, timeout=120))

def llm(script):
    prompt = SPEC + "\n\nSCRIPT:\n" + script
    k = os.environ.get("GEMINI_API_KEY", "").strip()
    if k:
        for m in os.environ.get("PLAN_GEMINI_MODELS", "gemini-flash-latest,gemini-3.5-flash,gemini-2.5-flash").split(","):
            try:
                j = post(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent", {"x-goog-api-key": k},
                         {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json"}})
                return json.loads(j["candidates"][0]["content"]["parts"][0]["text"])
            except Exception as e:
                print("gemini", m, ":", e, getattr(e, "read", lambda: b"")()[:200], file=sys.stderr)
    k = os.environ.get("GROQ_API_KEY", "").strip()
    if k:
        try:
            j = post("https://api.groq.com/openai/v1/chat/completions", {"Authorization": "Bearer " + k},
                     {"model": "llama-3.3-70b-versatile", "response_format": {"type": "json_object"}, "messages": [{"role": "user", "content": prompt}]})
            return json.loads(j["choices"][0]["message"]["content"])
        except Exception as e:
            print("groq:", e, file=sys.stderr)
    return None

KW = {"king": "king", "queen": "queen", "knight": "knight", "soldier": "knight", "guard": "guard", "farmer": "farmer", "peasant": "peasant",
      "wizard": "wizard", "merchant": "merchant", "trader": "merchant", "boy": "kid", "kid": "kid", "child": "kid", "girl": "girl",
      "mother": "mother", "father": "father", "man": "man", "woman": "woman", "police": "police", "cop": "police", "thief": "thief", "robber": "thief",
      "doctor": "doctor", "nurse": "nurse", "chef": "chef", "teacher": "teacher", "pirate": "pirate", "grandma": "grandma", "grandmother": "grandma", "grandpa": "grandpa",
      "prince": "prince", "princess": "princess", "witch": "witch", "judge": "judge", "student": "student", "sailor": "sailor"}
PROPKW = {w: w for w in ["coin","mango","apple","tree","seed","chicken","egg","crown","sword","key","castle","house","bread","cow","dog","cat","car","book","heart","flower","phone","boat","fish","cake"]}
PROPKW.update({"coins":"gold coin","gold":"gold coin","treasure":"treasure chest","purse":"purse","wallet":"purse","bag":"purse","money":"coins","hen":"chicken","jewel":"gem","diamond":"gem"})
MOOD = [("shock|gone|suddenly|impossible|disappear", "shock"), ("laugh|joke|funny|hilarious", "laugh"), ("angry|furious|demand|shout", "stern"),
        ("afraid|scared|nervous|trembl|worried", "nervous"), ("sad|cry|lost|died|pain|hurt", "pained"), ("smile|happy|joy|celebrat|grin", "grin"),
        ("relief|safe|saved|finally", "relief"), ("dizzy|confus|strange", "dazed")]

def heuristic(script):
    sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", script.strip()) if s.strip()]
    scenes, cast_seen, n = [], [], len(sents)
    for i, s in enumerate(sents):
        low = s.lower()
        roles = [r for k, r in KW.items() if re.search(r"\b" + k, low)]
        roles = list(dict.fromkeys(roles))[:3] or (cast_seen[:2] or ["peasant"])
        cast_seen = list(dict.fromkeys(roles + cast_seen))[:3]
        expr = next((e for p, e in MOOD if re.search(p, low)), "neutral" if i % 2 else "smile")
        prev = scenes[-1]["shot"] if scenes else ""
        cyc = ["medium", "over", "low", "medium", "high"]
        shot = "wide" if i == 0 else ("close" if expr in ("shock", "pained", "laugh") and prev != "close" else cyc[i % 5])
        xs = [0] if len(roles) == 1 else [-0.9, 0.9] if len(roles) == 2 else [-1.6, 0, 1.6]
        props = []
        for k, nm in PROPKW.items():
            if re.search(r"\b" + k + r"(s|es)?\b", low) and nm not in [p["name"] for p in props]:
                props.append({"name": nm, "x": 1.4 if len(props) % 2 else -1.4, "z": 0.5, "h": 4 if nm in ("tree", "castle") else 0.7, "anim": "pop", "at": 0.15, **({"anim": "fall", "count": 14, "spread": 2.5, "h": 0.35} if nm == "gold coin" else {})})
        props = props[:3]
        if props: roles = roles[:2]
        words = len(s.split())
        scenes.append({"dur": round(max(2.4, words / 2.7 + 0.5), 1), "shot": shot, "target": roles[0], "light": "golden" if i >= n - 2 and n > 3 else "day",
                       "extras": 10 if i == 0 else 4, "caption": " ".join(s.split()[:9]), "narration": s,
                       "cast": [{"id": r, "role": r, "x": x, "z": 0.2 * (j % 2), "expr": expr, "look": "partner" if len(roles) > 1 else "cam"} for j, (r, x) in enumerate(zip(roles, xs))],
                       "props": props, **({"focus": "@" + props[0]["name"], "move": "tiltdown" if props[0]["name"] in ("seed", "purse") else "push"} if props and i % 2 else {})})
    return {"title": (sents[0][:48] if sents else "Story"), "scenes": scenes}

def clean(b):
    ok = []
    for s in b.get("scenes", []):
        s["dur"] = min(9.0, max(1.5, float(s.get("dur", 3))))
        if s.get("shot") not in SHOTS: s["shot"] = "medium"
        s["extras"] = int(min(12, max(0, s.get("extras", 5))))
        cast = []
        for c in s.get("cast", [])[:3]:
            if c.get("role") not in ROLES: c["role"] = "man"
            if c.get("act") not in ("wave", "cheer", "point", "nod", "run"): c.pop("act", None)
            if c.get("hold"): c["hold"] = str(c["hold"]).strip().lower()
            to = c.get("to")
            if isinstance(to, dict) and "x" in to: c["to"] = {"x": max(-6, min(6, float(to["x"]))), "z": max(-2, min(2, float(to.get("z", 0))))}
            else: c.pop("to", None)
            for k in ("expr", "expr2"):
                if c.get(k) not in EXPR: c.pop(k, None)
            c["x"] = float(c.get("x", 0)); c["z"] = float(c.get("z", 0)); c.setdefault("id", c["role"])
            cast.append(c)
        if not cast: continue
        s["cast"] = cast
        nar = str(s.get("narration") or "").strip()
        if nar and len(nar.split()) <= 12: s["caption"] = nar            # captions are the spoken words, none dropped
        pr = []
        for p in (s.get("props") or [])[:6]:
            if not isinstance(p, dict) or not p.get("name"): continue
            p["name"] = str(p["name"]).strip().lower(); p["x"] = max(-3.0, min(3.0, float(p.get("x", 0)))); p["z"] = max(-1.5, min(1.5, float(p.get("z", 0.4))))
            p["h"] = max(0.15, min(7.0, float(p.get("h", 0.7))))
            if p["h"] >= 3: p["z"] = min(p["z"], -1.0); p["x"] = max(-1.8, min(1.8, p["x"]))      # big things (trees, castle) stand behind the actors
            if p.get("anim") not in ("pop", "grow", "bounce", "float", "fall", "spin", "static"): p["anim"] = "pop"
            pr.append(p)
        s["props"] = pr
        if s.get("move") not in MOVES: s.pop("move", None)
        if s.get("focus") and not (str(s["focus"]).startswith("@") or s["focus"] in [c["id"] for c in cast]): s.pop("focus", None)
        if s.get("target") not in [c["id"] for c in cast]: s["target"] = cast[0]["id"]
        ok.append(s)
    b["scenes"] = ok
    return b

if __name__ == "__main__":
    script = open(sys.argv[1]).read()
    b = llm(script)
    src = "llm"
    if not b or not b.get("scenes"):
        b, src = heuristic(script), "heuristic"
    b = clean(b)
    json.dump(b, open(sys.argv[2], "w"), indent=1)
    print(f"{src}: {len(b['scenes'])} scenes, {sum(s['dur'] for s in b['scenes']):.0f}s -> {sys.argv[2]}")
