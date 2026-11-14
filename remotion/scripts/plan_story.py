#!/usr/bin/env python3
"""Script -> storyboard JSON for the StoryShort composition.
usage: plan_story.py script.txt board.json
Uses Gemini (GEMINI_API_KEY) or Groq (GROQ_API_KEY) when available; otherwise a keyword heuristic, so it always works."""
import json, os, re, sys, urllib.request

ROLES = ["king", "queen", "knight", "peasant", "farmer", "wizard", "merchant", "kid", "girl", "parent", "guard"]
EXPR = ["neutral", "stern", "grin", "laugh", "whistle", "nervous", "shock", "relief", "dazed", "pained", "smile", "smile_closed"]
SHOTS = ["wide", "medium", "close", "low", "over"]
SPEC = f"""Return ONLY JSON: {{"title": str, "scenes": [scene,...]}}. One scene per 1-2 sentences of the script, 3-6 s each.
scene = {{"dur": seconds, "shot": one of {SHOTS}, "target": cast id the camera favours, "move": "push"|"pull"|"orbit"|"hold",
"light": "day"|"golden", "extras": 0-12 background townsfolk, "caption": the narration line (max 9 words),
"narration": full sentence(s) spoken, "cast": [{{"id": str, "role": one of {ROLES}, "x": -2..2, "z": -1..1, "expr": one of {EXPR},
"expr2": optional reaction expr, "at2": 0.3-0.8 when the reaction lands, "look": "partner"|"left"|"right"|"cam"}}]}}.
Rules: open with a wide shot, use close shots on emotional beats, alternate shot types, max 3 characters per scene, keep each
character's id/role consistent across scenes, use golden light for the ending or sad/warm beats, characters at least 1.2 m apart."""

def post(url, headers, body):
    r = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", **headers})
    return json.load(urllib.request.urlopen(r, timeout=120))

def llm(script):
    prompt = SPEC + "\n\nSCRIPT:\n" + script
    k = os.environ.get("GEMINI_API_KEY", "").strip()
    if k:
        for m in ("gemini-2.5-flash", "gemini-2.5-flash-lite"):
            try:
                j = post(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent", {"x-goog-api-key": k},
                         {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json"}})
                return json.loads(j["candidates"][0]["content"]["parts"][0]["text"])
            except Exception as e:
                print("gemini:", e, file=sys.stderr)
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
      "mother": "parent", "father": "parent", "man": "peasant", "woman": "parent"}
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
        cyc = ["medium", "over", "low", "medium", "wide"]
        shot = "wide" if i == 0 else ("close" if expr in ("shock", "pained", "laugh") and prev != "close" else cyc[i % 5])
        xs = [0] if len(roles) == 1 else [-0.9, 0.9] if len(roles) == 2 else [-1.6, 0, 1.6]
        words = len(s.split())
        scenes.append({"dur": round(max(2.4, words / 2.7 + 0.5), 1), "shot": shot, "target": roles[0], "light": "golden" if i >= n - 2 and n > 3 else "day",
                       "extras": 10 if i == 0 else 4, "caption": " ".join(s.split()[:9]), "narration": s,
                       "cast": [{"id": r, "role": r, "x": x, "z": 0.2 * (j % 2), "expr": expr, "look": "partner" if len(roles) > 1 else "cam"} for j, (r, x) in enumerate(zip(roles, xs))]})
    return {"title": (sents[0][:48] if sents else "Story"), "scenes": scenes}

def clean(b):
    ok = []
    for s in b.get("scenes", []):
        s["dur"] = min(9.0, max(1.5, float(s.get("dur", 3))))
        if s.get("shot") not in SHOTS: s["shot"] = "medium"
        s["extras"] = int(min(12, max(0, s.get("extras", 5))))
        cast = []
        for c in s.get("cast", [])[:3]:
            if c.get("role") not in ROLES: c["role"] = "peasant"
            for k in ("expr", "expr2"):
                if c.get(k) not in EXPR: c.pop(k, None)
            c["x"] = float(c.get("x", 0)); c["z"] = float(c.get("z", 0)); c.setdefault("id", c["role"])
            cast.append(c)
        if not cast: continue
        s["cast"] = cast
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
