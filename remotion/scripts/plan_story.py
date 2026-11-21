#!/usr/bin/env python3
"""Script -> storyboard JSON for the StoryShort composition.
usage: plan_story.py script.txt board.json
Uses Gemini (GEMINI_API_KEY) or Groq (GROQ_API_KEY) when available; otherwise a keyword heuristic, so it always works."""
import copy, json, time, os, re, sys, urllib.request

_ROLES_OLD = ["king","queen","prince","princess","knight","wizard","witch","police","policewoman","detective","thief","judge","doctor","nurse","scientist","chef","teacher",
         "businessman","businesswoman","worker","farmer","peasant","merchant","pirate","sailor","athlete","musician","student","man","woman","grandpa","grandma",
         "mother","father","kid","girl","boy","baby","guard","soldier","townsfolk"]
def _roles():
    try:
        txt = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../src/videos/story/outfits.ts")).read()
        base = txt.split("const BASE")[1].split("const ALIAS")[0]
        names = re.findall(r"^\s{2}([a-z0-9_]+): ", base, re.M)
        alias = dict(re.findall(r"\b([a-z_0-9]+): \"([a-z_0-9]+)\"", txt.split("const ALIAS")[1].split("};")[0]))
        return names + ["soldier", "townsfolk"], alias
    except Exception:
        return _ROLES_OLD, {}
ROLES, ROLE_ALIAS = _roles()
LIBPATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "library", "models.json")
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
"env": optional list of "rain"|"storm"|"snow"|"night"|"space"|"fog"|"wind" (weather/sky for the scene; use whenever the narration mentions it),
"fx": optional timed effects [{{"type":"lightning"|"explosion"|"fire"|"smoke"|"sparkle","at":0-0.9,"x":..,"z":..,"h":size m}}] (thunder/lightning strike = lightning; blast/bomb/crash = explosion; burning = fire).
WORKED EXAMPLE (follow this staging style, every action is a visible SEQUENCE inside the scene):
 "He planted the seed, and a giant apple tree grew." -> ONE scene, 5 s: cast farmer (act "point", look at the spot), props [{{"name":"seed","x":0.6,"z":0.1,"h":0.2,"anim":"pop","at":0.05,"until":0.35}},
   {{"name":"apple tree","x":0.6,"z":-0.9,"h":5,"anim":"grow","at":0.3}}], fx [{{"type":"sparkle","at":0.3,"x":0.6,"z":-0.2}}], focus "@apple tree", move "tiltup".
 "A thief stole the purse and ran, the police chased him." -> scene A (3 s): farmer at x -0.5 holds "purse" (holdAt 0, ends when stolen), thief walks in from x -3 to x 0 (walkAt 0), at 0.5 the purse prop vanishes from farmer: use farmer.hold "purse" and thief.hold "purse" with holdAt 0.55, farmer expr2 "shock" at2 0.55.
   scene B (4 s): thief x -8 -> to x 10, act "run", hold "purse"; police x -12 -> to x 8, act "run", walkAt 0.12; move "track", focus the thief.
RULES. (0) Plan like a film director: each sentence = 1-2 scenes that SHOW the process step by step (cause -> effect -> reaction), never just people standing. Use fx/env for every storm, rain, thunder, lightning, explosion, fire, snow, night, space mention.
(1) Every concrete noun in the narration becomes a prop or a held item in that scene (seed, mango, coins, chicken, tree, castle, purse...). Animals are props. Many coins: anim "fall", count 12-20, spread 2.5.
(2) Characters ACT: carrying = "hold" + "to"; stealing = thief with "hold":"<stolen item>"; running away = act "run" with "to" far away (x +-4), move "track", focus "@<item>"; pointing = act "point" with look toward the prop; a prop must be placed within x -2.5..2.5 and near the character so it is IN FRAME.
(3) Use the right role for the person named: police, thief, doctor, nurse, chef, teacher, king, queen, pirate, grandma, businessman... Use different roles for different people; give a recurring person the same id/role. Max 3 characters per scene, >=1.2 m apart. Use "v" 0-5 (optional) to vary two people of the same role.
(4) Camera language: "reveal" = push-in from environment to a character (opening, introductions); "push" = approach a face for emotion; "pull" = start on a face/object and widen; "pan" = two-person exchange; "descend" with shot "high" = overhead establishing;
"track" = follow a walking/running character sideways (use with act run/walk); "crane" = rise up and over a scene; "tiltup" = look up (tall tree, castle, falling coins); "tiltdown" = look down at the object; when the story is about an object set "focus":"@object".
(5) SIZES (a "city" loc has skyscrapers and busy streets; use loc city for big-city scripts): scale things to the world (a person is 1.7 m): castle/palace "h" 12-14, house 7-8, tower 8, mountain 14-18, volcano 12, pyramid 9, windmill 7, ship 6-9, tree 4-6. Big things stand behind the actors. (6) INTERIORS: only when the narration is INSIDE a place (inside the palace / throne room, in a cave, in a gold mine, inside a house or kitchen or bedroom, in jail / dungeon) set the scene field "interior" to one of palace|cave|mine|house|jail|shop: the plaza is replaced by an enclosed set with the right furniture, torches, gold, crystals. Outside shots keep the plaza and the castle/house as a big 3D prop. For a SHOP (barber shop, mango seller, blacksmith, padlock seller, bakery, weapon shop, any seller) use interior "shop" plus "shop":"<kind>" and "stock":[3-6 prop names the shop sells: mango, sword, padlock, bread...] so the shelves and counter are full of those real 3D items; when the shop is seen from outside, show the shop as a house prop with a sign. Never use an interior for outdoor sentences. (7) NEW THINGS: if a noun, vehicle, building, animal or weapon is NOT in the known list (the library), design it in the top-level "models" object: {{"models": {{"lighthouse keeper hut": {{"h": 3, "parts": [{{"s": "box|sphere|cyl|cone|torus|pyramid", "c": "#hex", "p": [x,y,z], "z": [sx,sy,sz], "r": [rx,ry,rz]}}, ...8-30 parts]}}}}}}. Unit shapes of size 1 centred at p (y up, +z front), scaled by z; build a recognisable toon model with correct colours; add "saddle" (0-1, rider hip height fraction) if it can be ridden/driven and "fly" (metres) if it flies. Then use its name as a prop/hold/mount like any other. (8) PHYSICAL ACTIONS: when a character writes, digs, drinks, throws, places/sets down, hands over, pushes, pulls, opens, leans on or climbs something, set on that cast member "do":{{"type":"write|dig|drink|throw|place|handOver|push|pull|open|lean|climb","at":0.1-0.5,"dur":seconds,"prop":"<tool or item: pen, shovel, cup, ball...>","to":"@<prop name>|<cast id>"}} (the hand really touches the surface/object and the prop is shown). Do not combine with act run or mount. (9) WORLD: the realm is one big connected world; each scene happens at ONE location: set "loc" to town|palace|farm|forest|desert|savanna|swamp|jungle|ice|ocean|mountain|mine|cave (default town). Mountains, castles, volcanoes, pyramids, ships at sea and caves are LOCATIONS, never props placed in town. Set "season" (spring|summer|autumn|winter) and "tod" (dawn|noon|dusk|night) when the narration says so. Use many short scenes: one per verb/clause. Reaction (expr2+at2) triggers a quick push-in and hold: use it for surprise, fear, joke, discovery. Never repeat the same shot type or move twice in a row. Open with a wide shot, use close shots on emotional beats, golden light only for the ending or warm/sad beats."""

def post(url, headers, body):
    r = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", **headers})
    return json.load(urllib.request.urlopen(r, timeout=120))

def llm(script):
    prompt = SPEC + "\n\nSCRIPT:\n" + script
    k = os.environ.get("GEMINI_API_KEY", "").strip()
    if k:
        models = os.environ.get("PLAN_GEMINI_MODELS", "gemini-flash-latest,gemini-flash-lite-latest,gemini-3.5-flash,gemini-3-flash-preview").split(",")
        for attempt in range(4):                      # the free tier throws 503/429 under load: keep trying, backing off
            for m in models:
                try:
                    j = post(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent", {"x-goog-api-key": k},
                             {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0.6}})
                    return json.loads(j["candidates"][0]["content"]["parts"][0]["text"])
                except Exception as e:
                    print("gemini", m, "try", attempt, ":", str(e)[:80], file=sys.stderr)
            time.sleep(10 * (attempt + 1))
    k = os.environ.get("GROQ_API_KEY", "").strip()
    if k:
        for attempt in range(3):
            try:
                j = post("https://api.groq.com/openai/v1/chat/completions", {"Authorization": "Bearer " + k},
                         {"model": "llama-3.3-70b-versatile", "response_format": {"type": "json_object"}, "messages": [{"role": "user", "content": prompt}]})
                return json.loads(j["choices"][0]["message"]["content"])
            except Exception as e:
                print("groq:", str(e)[:100], file=sys.stderr); time.sleep(6)
    return None

KW = {"king": "king", "queen": "queen", "knight": "knight", "soldier": "soldier", "guard": "guard", "farmer": "farmer", "peasant": "peasant",
      "wizard": "wizard", "merchant": "merchant", "trader": "merchant", "boy": "kid", "kid": "kid", "child": "kid", "girl": "girl",
      "mother": "mother", "father": "father", "man": "man", "woman": "woman", "police": "police", "cop": "police", "thief": "thief", "robber": "thief",
      "doctor": "doctor", "nurse": "nurse", "chef": "chef", "teacher": "teacher", "pirate": "pirate", "grandma": "grandma", "grandmother": "grandma", "grandpa": "grandpa",
      "prince": "prince", "gladiator": "gladiator", "centurion": "centurion", "legionary": "legionary", "cowboy": "cowboy", "sheriff": "sheriff", "outlaw": "outlaw", "viking": "viking", "pharaoh": "pharaoh", "samurai": "samurai", "ninja": "ninja", "caveman": "caveman", "astronaut": "astronaut", "gangster": "gangster", "sultan": "sultan", "emperor": "king", "captain": "pirate_captain", "detective": "detective", "scientist": "scientist", "monk": "monk", "pilot": "pilot", "worker": "worker", "queen_": "queen", "princess": "princess", "witch": "witch", "judge": "judge", "student": "student", "sailor": "sailor"}
PROPKW = {w: w for w in ["coin","mango","apple","tree","seed","chicken","egg","crown","sword","key","castle","house","bread","cow","dog","cat","car","book","heart","flower","phone","boat","rock","fire","bone","fish","cake"]}
PROPKW.update({"coins":"gold coin","gold":"gold coin","treasure":"treasure chest","purse":"purse","wallet":"purse","bag":"purse","money":"coins","hen":"chicken","jewel":"gem","diamond":"gem"})
MOOD = [("shock|gone|suddenly|impossible|disappear", "shock"), ("laugh|joke|funny|hilarious", "laugh"), ("angry|furious|demand|shout", "stern"),
        ("afraid|scared|nervous|trembl|worried", "nervous"), ("sad|cry|lost|died|pain|hurt", "pained"), ("smile|happy|joy|celebrat|grin", "grin"),
        ("relief|safe|saved|finally", "relief"), ("dizzy|confus|strange", "dazed")]

VEHICLES = ["pirate ship","sailboat","steamship","submarine","helicopter","motorcycle","bicycle","fire truck","police car","old car","car","truck","bus","tractor","train","plane","airplane","jet","rocket","spaceship","ufo","balloon","chariot","wagon","carriage","tank","canoe","ship","boat","yacht","taxi","scooter","ambulance"]
ANIMALS = ["horse","camel","elephant","lion","wolf","sheep","deer","rabbit","goat","tiger","bear","parrot","eagle","duck","owl","penguin","shark","whale","snake","frog","dragon","donkey","cow","pig","dog","cat","chicken","hen","fish"]
WEAPONS = ["sword","knife","dagger","axe","spear","bow","arrow","pistol","gun","rifle","shotgun","cannon","shield","mace","club","hammer","bomb","grenade","torch","trident","katana"]
THINGS = ["coins","coin","gold","money","purse","wallet","bag","mango","apple","tree","seed","egg","crown","key","castle","house","bread","book","heart","flower","phone","cake","treasure","chest","gem","diamond","jewel","barrel","crate","fire","pumpkin","carrot","fountain","tent","statue","bridge","windmill","well","ring"]
ERAKW = [("roman|rome|caesar|gladiator|legion", "roman"), ("greek|greece|athens|sparta|zeus|alexander|macedon|troy|achilles|hellen", "greek"), ("persian|persia|babylon|darius|mesopotamia|assyria|ottoman|caliph", "arabian"), ("cowboy|wild west|sheriff|saloon|outlaw", "wildwest"), ("viking", "viking"), ("pharaoh|egypt|pyramid", "egypt"),
         ("samurai|shogun|ninja|feudal japan", "samurai"), ("pirate", "pirate"), ("astronaut", "space"), ("world war|ww2|wwii", "ww2"), ("1920|prohibition|gangster|speakeasy", "1920s"), ("victorian", "victorian"),
         ("sultan|arabian|caravan", "arabian"), ("maharaja", "india"), ("caveman|stone age|prehistoric", "prehistoric"), ("dynasty|ancient china|emperor of china", "china")]
ALIASW = {"airplane": "plane", "spaceship": "rocket", "motorcycle": "motorcycle", "hen": "chicken", "wallet": "purse", "bag": "purse", "money": "coins", "gold": "coins", "jewel": "gem", "diamond": "gem", "treasure": "treasure chest", "chest": "treasure chest", "coin": "coins", "gun": "pistol", "katana": "sword", "carriage": "wagon", "yacht": "sailboat"}
FAR = 9.0

def _find(words, low):
    out = []
    for w in words:
        m = re.search(r"\b" + w + r"(s|es)?\b", low)
        if m: out.append((m.start(), ALIASW.get(w, w)))
    return [n for _, n in sorted(out) if n]

def heuristic(script):
    sents = [s.strip() for s in re.split(r"(?<=[.!?])[\"'”’)\]]*\s+", script.strip()) if s.strip()]
    low_all = script.lower()
    era0 = next((e for p, e in ERAKW if re.search(p, low_all)), None); era = era0
    scenes, cast_seen, n = [], [], len(sents)
    for i, s in enumerate(sents):
        low = s.lower()
        era = next((e for p, e in ERAKW if re.search(p, low)), era)      # the era follows the sentence that names it
        pos = sorted((m.start(), r) for k, r in KW.items() for m in [re.search(r"\b" + k, low)] if m)
        roles = list(dict.fromkeys(r for _, r in pos))[:3] or (cast_seen[:2] or ["man"])
        cast_seen = list(dict.fromkeys(roles + cast_seen))[:3]
        expr = next((e for p, e in MOOD if re.search(p, low)), "neutral" if i % 2 else "smile")
        veh, ani, wpn, thg = _find(VEHICLES, low), _find(ANIMALS, low), _find(WEAPONS, low), _find(THINGS, low)
        env, fxs = [], []
        if re.search(r"\b(storm|thunder|lightning)", low): env.append("storm")
        elif re.search(r"\brain", low): env.append("rain")
        if re.search(r"\b(snow|blizzard)", low): env.append("snow")
        if re.search(r"\b(sandstorm|dust storm|desert storm|dust)\b", low): env.append("sandstorm")
        if re.search(r"\b(mist|fog|haze|hazy)\b", low): env.append("mist")
        if re.search(r"\b(leaves|autumn leaves|falling leaves)\b", low): env.append("leaves")
        if re.search(r"\b(petals|blossoms|cherry blossoms|spring flowers)\b", low): env.append("petals")
        if re.search(r"\b(night|moon|dark)", low): env.append("night")
        if re.search(r"\b(space|planet|galaxy|astronaut|stars?)\b", low): env.append("space")
        if re.search(r"\b(thunder|lightning|bolt)", low): fxs.append({"type": "lightning", "at": 0.35})
        if re.search(r"\b(explo|blast|bomb|crash|boom|blew)", low): fxs.append({"type": "explosion", "at": 0.4, "h": 3})
        if re.search(r"\b(fire|burn|flame)", low): fxs.append({"type": "fire", "at": 0.1, "x": 0.5, "z": -0.5})
        verb = lambda p: re.search(p, low)
        cast, props, extra, dur_min = [], [], {}, 0
        CS = lambda id_, role, x, **k: {"id": id_, "role": role, "x": x, "z": k.pop("z", 0.2), "expr": k.pop("expr", expr), **k}
        loot = next((t for t in thg if t not in ("tree", "castle", "house", "seed", "fire", "fountain", "statue", "bridge", "windmill", "well", "tent")), "purse")
        thief = "thief" if "thief" in roles else None
        others = [r for r in roles if r != "thief"]
        police = [r for r in others if r in ("police", "policewoman", "sheriff", "guard", "knight", "soldier", "detective")]
        if verb(r"\b(stole|steal|stolen|snatch|grab|robb|pickpocket|swipe)") and (thief or len(roles) > 1 or True):
            victim = (others[0] if others else (next((r for r in cast_seen if r != "thief"), "man")))
            if victim in police and len(others) > 1: victim = others[1]
            cast = [CS("v", victim, -0.8, expr2="shock", at2=0.42, hold=loot, holdUntil=0.42, look="left"),
                    CS("t", "thief", -5.5, to={"x": FAR, "z": 0.2}, act="run", hold=loot, holdAt=0.42, expr="grin")]
            if verb(r"\b(chas|pursu|after him|behind him)") and police: cast.append(CS("p", police[0], -9, to={"x": FAR, "z": 0.4}, act="run", walkAt=0.32, expr="stern", z=0.4))
            dur_min = 4.2
        elif verb(r"\b(chas|pursu|hunt)") or (verb(r"\b(ran|run|fled|flee|escap|sprint|race)") and len(roles) > 1):
            runner = thief or roles[0]; chasers = [r for r in roles if r != runner][:2] or ["police"]
            cast = [CS("r", runner, -6, to={"x": FAR, "z": 0.2}, act="run", expr="nervous")] + [CS("c%d" % k, c, -10 - 2 * k, to={"x": FAR, "z": 0.4}, act="run", walkAt=0.1 + 0.05 * k, expr="stern", z=0.4) for k, c in enumerate(chasers)]
            dur_min = 4.2
        elif verb(r"\b(ran|run|runs|running|fled|flee|escap|sprint|rushed|raced|dash)"):
            cast = [CS(roles[0], roles[0], -6, to={"x": FAR, "z": 0.2}, act="run", expr="nervous")] + [CS("o%d" % k, r, -2 + 2 * k, expr=expr) for k, r in enumerate(roles[1:])]
            dur_min = 3.6
        elif verb(r"\b(rode|ride|riding|galloped)") or (ani and verb(r"\bon (a|an|his|her|the|their) (horse|camel|elephant|donkey|dragon)")):
            mount = next((a for a in ani if a in ("horse", "camel", "elephant", "donkey", "dragon")), "horse")
            cast = [CS(roles[0], roles[0], -6, to={"x": FAR, "z": 0.2}, mount=mount, expr="grin")] + [CS("o%d" % k, r, 2 + k, expr=expr) for k, r in enumerate(roles[1:2])]
            ani = [a for a in ani if a != mount]; dur_min = 4.0
        elif veh and verb(r"\b(drove|drive|driving|flew|fly|flying|sailed|sail|sailing|steered|raced|rode)"):
            vname = veh[0]; riding_roles = roles[:1]
            cast = [CS(riding_roles[0], riding_roles[0], -6, to={"x": FAR, "z": -0.4}, mount=vname, expr="grin")]
            veh = veh[1:]; dur_min = 4.2
        elif wpn and verb(r"\b(fought|fight|fighting|battle|duel|attack|slash|stab|swung|swing|struck|killed|charge|cut)"):
            w0 = next((w for w in wpn if w in ("sword", "knife", "dagger", "axe", "spear", "mace", "club", "hammer", "katana")), wpn[0])
            att = roles[0]; dfd = roles[1] if len(roles) > 1 else "townsfolk"
            cast = [CS("a", att, -1.1, hold=w0, act="stab" if w0 in ("knife", "dagger", "spear") else "swing", aim="d", look="right"), CS("d", dfd, 1.1, expr="shock", expr2="pained", at2=0.5, hold=w0 if w0 in ("sword", "shield") else None, look="left")]
            cast[1] = {k: v for k, v in cast[1].items() if v is not None}; wpn = []; dur_min = 3.6
        elif wpn and verb(r"\b(shot|shoot|fired|fire|firing|aimed|aim)"):
            g0 = next((w for w in wpn if w in ("pistol", "rifle", "shotgun", "bow", "gun")), wpn[0])
            cast = [CS("a", roles[0], -1.3, hold=g0, act="shoot", aim="d", look="right"), CS("d", roles[1] if len(roles) > 1 else "townsfolk", 1.4, expr="shock", look="left")]
            wpn = []; dur_min = 3.6
        elif verb(r"\b(plant|planted|sow|sowed)") and ("seed" in thg or "tree" in thg):
            cast = [CS("f", roles[0], -1.2, act="point", look="right", expr="smile")]
            props = [{"name": "seed", "x": 0.6, "z": 0.3, "h": 0.25, "anim": "pop", "at": 0.05, "until": 0.35}, {"name": "tree", "x": 0.9, "z": -0.9, "h": 5, "anim": "grow", "at": 0.3}]
            extra = {"fx": [{"type": "sparkle", "at": 0.3, "x": 0.8, "z": -0.2}], "focus": "@tree", "move": "tiltup"}; thg = [t for t in thg if t not in ("seed", "tree")]; dur_min = 4.5
        elif verb(r"\b(walk|walked|went|marched|travel|journey|arrived|came|wandered|strolled)"):
            cast = [CS(roles[0], roles[0], -3, to={"x": 3, "z": 0.2}, expr=expr)] + [CS("o%d" % k, r, 1.5 + k, expr=expr) for k, r in enumerate(roles[1:])]
        if not cast:
            xs = [0] if len(roles) == 1 else [-0.9, 0.9] if len(roles) == 2 else [-1.6, 0, 1.6]
            cast = [CS(r, r, x, z=0.2 * (j % 2), look="partner" if len(roles) > 1 else "cam") for j, (r, x) in enumerate(zip(roles, xs))]
        used = {c.get("hold") for c in cast} | {c.get("mount") for c in cast}
        k = 0
        for nm in (veh + ani):                                 # vehicles and animals present in the sentence
            if nm in used: continue
            moving = nm in veh and verb(r"\b(drove|drive|flew|fly|sailed|sail|raced|roared|rolled|steamed|chugged|passed|zoomed|landed)")
            props.append({"name": nm, "x": -FAR if moving else (-1.8 if k % 2 == 0 else 1.8), "z": -0.8, "to": {"x": FAR, "z": -0.8}, "at": 0.0, "until": 1.0, "anim": "static"} if moving else {"name": nm, "x": -1.8 if k % 2 == 0 else 1.8, "z": -0.2, "anim": "pop", "at": 0.1})
            k += 1
        for nm in thg + wpn:
            if nm in used or nm in [p["name"] for p in props] or len(props) >= 4: continue
            if nm == "coins": props.append({"name": "gold coin", "x": 0, "z": 0.5, "h": 0.35, "anim": "fall", "count": 14, "spread": 2.5, "at": 0.15})
            else: props.append({"name": nm, "x": 1.4 if len(props) % 2 else -1.4, "z": 0.5, "h": {"castle": 13, "house": 7, "tree": 5}.get(nm), "anim": "pop", "at": 0.15})
            props[-1] = {a: b for a, b in props[-1].items() if b is not None}
        words = len(s.split())
        sc = {"dur": round(max(2.4, dur_min, words / 2.7 + 0.5), 1), "shot": "wide" if i == 0 else ("close" if expr in ("shock", "pained", "laugh") and (not scenes or scenes[-1]["shot"] != "close") else ["medium", "over", "low", "medium", "high"][i % 5]),
              "target": cast[0]["id"], "light": "golden" if i >= n - 2 and n > 3 else "day", "extras": 10 if i == 0 else 3, "caption": s, "narration": s,
              "cast": cast, "props": props, **({"env": env} if env else {}), **({"fx": fxs} if fxs else {}), **({"era": era} if era else {}), **extra}
        if props and "focus" not in sc and not any(c.get("to") for c in cast) and i % 2: sc["focus"] = "@" + props[0]["name"]
        scenes.append(sc)
    return {"title": (sents[0][:48] if sents else "Story"), "scenes": scenes}


PLACES = [("mine", r"gold mine|\bmine\b|mineshaft"), ("palace", r"palace|throne room|royal hall|great hall"), ("cave", r"\bcave\b|cavern"), ("jail", r"\bjail\b|prison|dungeon|\bcell\b")]
INSIDE = r"inside|into|entered|enter|walked in|crept in|deep in|\bin (his|her|the|a|their)\b|opened|stood in|sat in|\bat (his|her|the)\b"
SHOPKW = r"(?:(\w+) )?(?:seller|shop|store|stall|barber|blacksmith|baker|bakery|market|tailor|butcher|grocer)"
STOCK = {"mango": ["mango"], "fruit": ["mango", "apple"], "apple": ["apple"], "sword": ["sword", "dagger", "shield"], "weapon": ["sword", "dagger", "shield", "axe"], "blacksmith": ["sword", "axe", "hammer", "shield"], "baker": ["bread", "cake"], "bakery": ["bread", "cake"], "cake": ["cake", "bread"], "book": ["book"], "gem": ["gem", "crown"], "jewel": ["gem", "crown", "gold coin"], "key": ["key"], "padlock": ["key"], "flower": ["flower"], "barber": ["book", "gem"], "butcher": ["pig", "chicken"], "grocer": ["apple", "mango", "bread"]}
SEA_ARRIVAL_KW = r"\b(led his army across the sea|sailed across|crossed the sea|sailed to|arrived at shore|reached the shore|landed on the beach|disembarked|sailed his fleet|led (his|her|their) fleet)\b"

def enrich(b):
    """Director's pass over the LLM storyboard: make sure each sentence really gets its interior, shop goods, vehicle/animal ride, so the weak planner can't skip them."""
    prev = None; shopctx = None
    LEAVE = r"marched|march|journey|travel|east|west|north|south|across|empire|continent|edge of|babylon|india|egypt|persia|desert|sea|battle|outside|ran out|fled|escaped|jumped on|hopped on|rode|galloped|drove|street|road|outdoors|left the|exited|chased"
    INS2 = r"inside|into|entered|crept in|crept into|shelves|counter|behind the|walked in|stepped in|stepped inside"
    SHOPW = r"seller|shop|stall|barber|blacksmith|bakery|baker|market|tailor|butcher|grocer|store"
    
    new_scenes = []
    for s in b.get("scenes", []):
        t = ((s.get("narration") or "") + " " + (s.get("caption") or "")).lower(); cast = s.get("cast") or []
        
        # P0 Rule: "led his army across the sea" / ocean arrival requires 3-shot sequence (fleet at sea -> coastal pull-in -> beach disembarkation)
        if re.search(SEA_ARRIVAL_KW, t):
            leader = next((c for c in cast if c.get("role") not in ("soldier", "guard")), cast[0] if cast else {"id": "hero", "role": "soldier"})
            leader_role = leader.get("role", "soldier")
            caption_text = s.get("caption") or s.get("narration") or ""
            dur_total = float(s.get("dur", 7.5))
            d1, d2, d3 = round(dur_total * 0.35, 1), round(dur_total * 0.3, 1), round(dur_total * 0.35, 1)

            # Shot 1: Wide fleet sailing across the open sea
            sc1 = copy.deepcopy(s)
            sc1.update({
                "dur": max(2.5, d1), "shot": "wide", "move": "pan", "loc": "ocean",
                "caption": caption_text, "narration": caption_text,
                "extras": 14, "extrasRole": "soldier",
                "cast": [{"id": leader.get("id", "leader"), "role": leader_role, "x": -24, "z": -78, "to": {"x": 24, "z": -78}, "mount": "galleon", "act": "run"}]
            })

            # Shot 2: Hero ship reaching and pulling up to the shore
            sc2 = copy.deepcopy(s)
            sc2.update({
                "dur": max(2.2, d2), "shot": "medium", "move": "track", "loc": "ocean",
                "caption": caption_text, "narration": caption_text,
                "extras": 10, "extrasRole": "soldier",
                "cast": [{"id": leader.get("id", "leader"), "role": leader_role, "x": -10, "z": -78, "to": {"x": 2, "z": -78}, "mount": "galleon", "act": "run"}]
            })

            # Shot 3: Hero ship anchored at coast, leader & soldiers disembarking onto the beach
            sc3 = copy.deepcopy(s)
            sc3.update({
                "dur": max(2.5, d3), "shot": "wide", "move": "reveal", "loc": "ocean",
                "caption": caption_text, "narration": caption_text,
                "extras": 12, "extrasRole": "soldier",
                "cast": [
                    {"id": leader.get("id", "leader"), "role": leader_role, "x": -2.0, "z": 0.2, "to": {"x": 1.5, "z": 0.2}, "act": "run", "expr": "stern"},
                    {"id": "s1", "role": "soldier", "x": -4.0, "z": 0.4, "to": {"x": -0.5, "z": 0.4}, "act": "run", "walkAt": 0.1, "expr": "stern"},
                    {"id": "s2", "role": "soldier", "x": -6.0, "z": 0.6, "to": {"x": -2.5, "z": 0.6}, "act": "run", "walkAt": 0.2, "expr": "stern"}
                ]
            })

            new_scenes.extend([sc1, sc2, sc3])
            continue

        leave = re.search(LEAVE, t)
        if not s.get("interior"):
            place = next((k for k, rx in PLACES if re.search(rx, t)), None)
            if place and re.search(INSIDE, t): s["interior"] = place
            elif re.search(SHOPW, t):
                m = re.search(SHOPKW, t); kind = (m.group(1) or m.group(0)).strip() if m else "shop"
                st = next((v for k, v in STOCK.items() if k in t), ["bread", "gem"])
                shopctx = (kind, st[:4])
                if re.search(INS2, t) and not leave: s["interior"] = "shop"; s["shop"] = kind; s["stock"] = shopctx[1]
                else: s["front"] = (kind.upper() if re.search(r"shop|store|seller|stall|barber|smith|bakery|market", kind) else kind.upper() + " SHOP")
            elif shopctx and re.search(INS2, t) and not leave: s["interior"] = "shop"; s["shop"] = shopctx[0]; s["stock"] = shopctx[1]
            elif prev and prev != "shop" and not leave and not re.search(r"\b(ran|fled|sailed|flew)\b", t) and prev in ("palace", "cave", "mine", "jail", "house"): s["interior"] = prev
            elif prev == "shop" and shopctx and not leave and re.search(INS2 + r"|grabbed|stole|took|bought|sold|paid", t): s["interior"] = "shop"; s["shop"] = shopctx[0]; s["stock"] = shopctx[1]
        if leave: shopctx = None
        prev = s.get("interior")
        if s.get("interior") in ("palace", "cave", "mine", "jail", "house", "shop"):
            s.pop("env", None) if s["interior"] != "cave" else None
            s.pop("focus", None)
            s["props"] = [p for p in (s.get("props") or []) if p["name"] not in ("castle", "house", "tree", "apple tree", "mountain")]
        if cast and not any(c.get("mount") for c in cast) and (re.search(r"\b(in|on|aboard|inside)\s+(?:a|an|the|his|her)\s+(?:\w+\s+){0,2}(?:" + "|".join(VEHICLES) + r")\b", t) or re.search(r"\b(rode|ride|riding|galloped|gallop|jumped on|hopped on|drove|driving|flew|flying|sailed|piloted|raced|roaring)\b", t)):
            m = max(((t.find(v), v) for v in VEHICLES + ANIMALS if re.search(r"\b" + v + r"s?\b", t)), default=None, key=lambda x: (len(x[1]) if x[0] >= 0 else -1))
            if m and m[0] >= 0:
                v = {"airplane": "plane", "spaceship": "rocket", "motorcycle": "motorbike", "fire truck": "firetruck", "police car": "policecar", "old car": "oldcar", "pirate ship": "galleon", "ship": "galleon", "boat": "sailboat", "yacht": "sailboat", "carriage": "wagon", "bear": "bear3", "hen": "chicken"}.get(m[1], m[1])
                who = next((c for c in cast if c.get("role") in t.split() or c.get("id") in t.split()), None) or next((c for c in cast if c.get("role") not in ("police", "guard")), cast[0])
                who["mount"] = v
                s["props"] = [p for p in (s.get("props") or []) if p["name"] not in ("boat", "ship", "car", "horse", "plane", "helicopter", v) or p["name"] == "helicopter" and v != "helicopter"]
                if s.get("focus", "").lstrip("@") in ("boat", "ship", "car", "horse", v): s.pop("focus")
                if not who.get("to"):
                    d = 1 if who.get("x", 0) <= 0 else -1; who["to"] = {"x": max(-14, min(14, who.get("x", 0) + d * 12)), "z": who.get("z", 0.3)}
                who["act"] = who.get("act") or "run"
                if v in ("galleon", "sailboat", "steamship", "canoe", "submarine"): who["z"] = -78; who["x"] = -24; who["to"] = {"x": 24, "z": -78}; s["loc"] = "ocean"
                if s.get("move") not in ("track",): s["move"] = "track"
        new_scenes.append(s)
    b["scenes"] = new_scenes
    return b

ACTV = [("dig", r"\b(dug|dig|digging)\b", "shovel"), ("write", r"\b(wrote|write|writing|signed)\b", "pen"), ("drink", r"\b(drank|drink|drinking|sipped)\b", "cup"), ("throw", r"\b(threw|throw|throwing|tossed|hurled)\b", None), ("handOver", r"\b(handed|gave|passed him|passed her)\b", None), ("place", r"\b(placed|set down|put down|laid|put the)\b", None), ("open", r"\bopened the (door|gate|chest|box)\b", None), ("push", r"\bpushed\b", None), ("pull", r"\bpulled\b", None), ("lean", r"\bleaned\b", None), ("climb", r"\bclimbed\b", None)]
def enrich_actions(b):
    for s in b.get("scenes", []):
        if s.get("quote"): continue
        t = ((s.get("narration") or "") + " " + (s.get("caption") or "")).lower(); cast = s.get("cast") or []
        if not cast or any(c.get("do") or c.get("mount") or c.get("act") == "run" for c in cast): continue
        for typ, rx, prop in ACTV:
            if not re.search(rx, t): continue
            who = cast[0]; others = [c for c in cast if c is not who]; props = s.get("props") or []
            do = {"type": typ, "at": 0.15, "dur": max(1.0, float(s.get("dur", 3)) * 0.7)}
            if prop: do["prop"] = prop
            if typ in ("throw", "place") and who.get("hold"): do["prop"] = who.pop("hold")
            elif typ in ("throw", "place"): do["prop"] = next((p["name"] for p in props), "ball" if typ == "throw" else "book")
            if typ == "handOver" and others: do["to"] = others[0]["id"]; do["prop"] = who.pop("hold", None) or (props[0]["name"] if props else "gem")
            elif typ in ("push", "pull", "open", "lean", "climb", "place", "throw") and props: do["to"] = "@" + (props[-1]["name"] if typ in ("push", "pull", "open", "lean", "climb") else props[0]["name"])
            elif typ == "throw" and others: do["to"] = others[0]["id"]
            if typ == "dig" and not do.get("to"): do["x"] = who.get("x", 0) + 0.9; do["z"] = who.get("z", 0.3)
            if typ in ("open", "push", "pull", "lean", "climb") and not do.get("to"): continue
            who["do"] = do; break
    return b


LOCKW = [("city", r"skyscrapers?|downtown|metropolis|\bcity\b|\bcities\b|skyline|big city|new york|lagos|dubai|tokyo|london"), ("mine", r"gold mine|\bmine\b|mineshaft"), ("cave", r"\bcave\b|cavern"), ("ocean", r"ocean|\bsea\b|harbou?r|\bdock\b|\bport\b|shore|beach|voyage|sail(?:ed|ing|s)?|fleet|galleys?|triremes?|armada|crossed the|across the sea|\bship\b|\bboat\b|lighthouse|lake"), ("desert", r"egypt|babylon|persia|mesopotamia|sahara|arabia|\bnile\b|pyramids?|sphinx|sands?"), ("mountain", r"india|himalaya|\balps\b|everest|khyber|hindu kush"), ("palace", r"palace|castle|throne|royal|kingdom"), ("ice", r"arctic|iceberg|polar|north pole|glacier|tundra|igloo"), ("desert", r"desert|sahara|dunes?|oasis|caravan|camel|pyramid"), ("swamp", r"swamp|marsh|bog|wetland"), ("jungle", r"jungle|rainforest"), ("forest", r"forest|woods|woodland|lumberjack"), ("savanna", r"savanna|grassland|plains|steppe|safari|zebra|giraffe"), ("mountain", r"mountain|alps|himalaya|peak|\bhills?\b|volcano|cliff"), ("farm", r"\bfarm\b|\bfields?\b|harvest|barn|crops?|\bseed\b")]
SEASONKW = [("winter", r"winter|snowy|snowing|blizzard|frozen|christmas"), ("autumn", r"autumn|\bfall\b|falling leaves|leaves"), ("spring", r"spring|blossom|\bbloom|petals"), ("summer", r"summer|sunny|hot")]
TODKW = [("night", r"midnight|at night|\bnight\b|moonlit|moonlight|dark sky|\bstars\b"), ("dusk", r"dusk|sunset|evening|twilight"), ("dawn", r"dawn|sunrise|daybreak|early morning")]
URBAN = r"town|village|city|market|street|square|shop|store"
SCENERY = ("skyscraper", "skyscrapers", "city", "tower block", "shop", "store", "stall", "market", "building", "house", "palace", "castle", "mountain", "mountains", "volcano", "pyramid", "cave", "hill", "hills", "mine")
LOCS = ("town", "palace", "farm", "forest", "desert", "savanna", "swamp", "jungle", "ice", "ocean", "mountain", "mine", "cave", "city")
def enrich_world(b):
    """Place every scene at its own location of the realm (carried forward until the story moves), plus season / time of day."""
    cur = None
    for s in b.get("scenes", []):
        if s.get("quote"):
            # quote scenes inherit location from cur (same as the narration context)
            s.setdefault("loc", cur or "town")
            # skip world-place/tod/season inference
            continue
        t = ((s.get("narration") or "") + " " + (s.get("caption") or "")).lower()
        if s.get("interior"): s["loc"] = "town"; cur = None; continue
        hit = next((k for k, rx in LOCKW if re.search(rx, t)), None) or (s.get("loc") if s.get("loc") in LOCS and s.get("loc") != "town" else None)
        if hit: cur = hit
        elif re.search(URBAN, t): cur = None
        s["loc"] = cur or "town"
        for k in ("biome",): s.pop(k, None)
        if not s.get("season"):
            h = next((k for k, rx in SEASONKW if re.search(rx, t)), None)
            if h: s["season"] = h
        if not s.get("tod"):
            h = next((k for k, rx in TODKW if re.search(rx, t)), None)
            if h: s["tod"] = h
        if s.get("season") not in (None, "spring", "summer", "autumn", "winter"): s.pop("season")
        if s.get("tod") not in (None, "dawn", "noon", "dusk", "night"): s.pop("tod")
        # scenery lives at its own place of the realm, never as a prop in the wrong place; drop tiny unmentioned decorations
        s["props"] = [] if s.get("interior") else [p for p in (s.get("props") or []) if p["name"] not in SCENERY and (p.get("h", 1) >= 1.0 or p["name"].rstrip("s") in t or p["name"] in t)]
        seen = []; keep = []
        for p in s["props"]:
            if any(p["name"] == q["name"] and abs(p.get("x", 0) - q.get("x", 0)) < 4 and abs(p.get("z", 0) - q.get("z", 0)) < 4 for q in seen) and not p.get("count"): continue
            seen.append(p); keep.append(p)
        s["props"] = keep
        if s.get("focus", "").lstrip("@") in SCENERY: s.pop("focus")
    return b

MOVEKW = r"\b(ran|run|running|chase|chased|chasing|fled|flee|flew|fly|flying|rode|ride|galloped|drove|sailed|walk|walked|jump|jumped|escape|escaped|raced|rushed|dashed|crept|sneaked)\b"
def split_clauses(b):
    """One scene per clause so every verb gets its own live beat (crept in / grabbed the coins / jumped on the horse)."""
    out = []
    for s in b.get("scenes", []):
        if s.get("quote"):
            out.append(s); continue
        nar = (s.get("narration") or s.get("caption") or "").strip()
        parts = [p.strip(" ,;") for p in re.split(r",\s*|;\s*|\s+(?=and then\b|then\b|and\s+(?=(?:he|she|they|the|a|then|[a-z]+ed)\b))", nar) if p and len(p.split()) >= 2]   # connector words (but/and/then) are kept so the voice reads the full sentence
        if len(nar.split()) < 9 or len(parts) < 2 or s.get("interior") or s.get("loc") == "ocean": out.append(s); continue
        parts = parts[:4]; tot = sum(len(p.split()) for p in parts); d0 = float(s.get("dur", 3))
        for k, p in enumerate(parts):
            n = copy.deepcopy(s); n["narration"] = n["caption"] = p; n["dur"] = max(1.6, d0 * len(p.split()) / tot)
            if k > 0: n.pop("fx", None); n.pop("env", None) if False else None
            if not re.search(MOVEKW, p.lower()):
                for c in n.get("cast", []):
                    c.pop("to", None)
                    if c.get("act") == "run": c.pop("act")
            out.append(n)
    b["scenes"] = out
    return b

EXT = {"shop": "town", "palace": "palace", "mine": "mine", "cave": "cave", "jail": "palace", "house": "town"}
def establish(b):
    """Before an interior, show the OUTSIDE of the place (shop front with its sign, palace gate, mine mouth, cave mouth)."""
    out = []; prev = None
    for s in b.get("scenes", []):
        k = s.get("interior")
        if k and prev != k and s.get("cast"):
            nar = (s.get("narration") or "").strip(); m = re.search(r",\s*|\s+and\s+", nar); first, rest = (nar[:m.start()], nar[m.end():]) if m and len(nar[:m.start()].split()) >= 2 and len(rest := nar[m.end():].split()) >= 2 else ("", nar)
            if rest and first: s["narration"] = s["caption"] = nar[m.end():]
            e = copy.deepcopy(s); e.pop("interior", None); e.pop("stock", None); e.pop("shop", None); e["loc"] = EXT.get(k, "town"); e["narration"] = e["caption"] = first
            e["dur"] = 2.4 if first else 1.8; e["shot"] = "wide"; e["move"] = "reveal"; e.pop("props", None); e.pop("fx", None); e.pop("focus", None)
            who = copy.deepcopy(s["cast"][0]); who["x"] = (-3.5 if k == "shop" else 0); who["z"] = (-3.5 if k == "shop" else 2.0); e["est"] = True; who.pop("to", None); who["act"] = "wave"; who.pop("hold", None); who.pop("do", None); who.pop("mount", None); e["cast"] = [who]; e["target"] = who["id"]
            if k == "shop":
                kind = (s.get("shop") or "shop").strip(); e["front"] = kind.upper() if re.search(r"shop|store|seller|stall|barber|smith|bakery|market", kind) else (kind + " shop").upper()
            out.append(e)
        if k == "shop" and s.get("cast"):
            s["shot"] = "wide"; s["move"] = "reveal"
            sel = next((c for c in s["cast"] if re.search(r"seller|shop|baker|barber|smith|vendor|merchant|trader", (c.get("id", "") + c.get("role", "")))), s["cast"][0])
            for c in s["cast"]:
                if c is sel: c["z"] = -4.3; c["x"] = max(-3.0, min(3.0, c.get("x", 0)))
                else: c["z"] = max(c.get("z", 0), 1.0)
        out.append(s); prev = k or ("shop" if s.get("front") else None)
    b["scenes"] = out
    return b

def fly_pass(b, limit=4):
    """When two consecutive outdoor scenes are in different places, glide the camera through the sky from one to the other."""
    out = []; n = 0
    for i, s in enumerate(b.get("scenes", [])):
        if out and not s.get("quote") and not out[-1].get("quote") and not s.get("interior") and not out[-1].get("interior") and s.get("loc") and out[-1].get("loc") and s["loc"] != out[-1]["loc"] and n < limit and not s.get("front") and not out[-1].get("front"):
            who = copy.deepcopy(s["cast"][0]); who["x"] = 5000; who["z"] = 5000; who.pop("to", None); who.pop("act", None); who.pop("mount", None); who.pop("hold", None); who.pop("do", None)
            out.append({"dur": 2.2, "shot": "wide", "cast": [who], "target": who["id"], "loc": s["loc"], "light": s.get("light", "day"), "caption": "", "narration": "", "fly": {"from": out[-1]["loc"], "to": s["loc"]}, "extras": 0}); n += 1
        out.append(s)
    b["scenes"] = out
    return b

WORN = {"crown": r"king|queen|prince|princess|emperor|monarch|royal", "hat": r".", "helmet": r".", "cap": r".", "turban": r".", "glasses": r"."}
def drop_worn(b):
    """a worn item (crown, hat...) is drawn on the character; never also place it as a floating scene prop"""
    import re
    for sc in b.get("scenes", []):
        roles = " ".join(str(c.get("role", "")) for c in sc.get("cast", [])).lower()
        held = {str(c.get("hold", "")).lower() for c in sc.get("cast", [])}
        keep = []
        for p in sc.get("props", []) or []:
            n = str(p.get("name", p) if isinstance(p, dict) else p).lower()
            if n in WORN and n not in held and re.search(WORN[n], roles or "x"): continue
            keep.append(p)
        sc["props"] = keep
    return b

def clean(b):
    ok = []
    for s in b.get("scenes", []):
        s["dur"] = min(9.0, max(1.5, float(s.get("dur", 3))))
        if s.get("shot") not in SHOTS: s["shot"] = "medium"
        s["extras"] = int(min(12, max(0, s.get("extras", 5))))
        cast = []
        for c in s.get("cast", [])[:3]:
            c["role"] = ROLE_ALIAS.get(c.get("role"), c.get("role"))
            if c.get("role") not in ROLES: c["role"] = "man"
            if c.get("act") not in ("wave", "cheer", "point", "nod", "run", "swing", "stab", "shoot", "aim"): c.pop("act", None)
            if c.get("mount"): c["mount"] = str(c["mount"]).strip().lower()
            if c.get("hold"): c["hold"] = str(c["hold"]).strip().lower()
            to = c.get("to")
            if isinstance(to, dict) and "x" in to: c["to"] = {"x": max(-14, min(14, float(to["x"]))), "z": max(-2, min(2, float(to.get("z", 0))))}
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
            p["h"] = max(0.15, min(20.0, float(p.get("h", 0.7))))
            if p["h"] >= 3: p["z"] = min(p["z"], -3.0 - p["h"] * 0.4); p["x"] = max(-6, min(6, p["x"])) if p["h"] >= 6 else max(-1.8, min(1.8, p["x"]))      # big things (trees, castle) stand behind the actors
            if p.get("anim") not in ("pop", "grow", "bounce", "float", "fall", "spin", "static"): p["anim"] = "pop"
            if re.search(r"boat|ship|galleon|canoe|vessel|yacht|ferry|trireme", p["name"]): p["count"] = 1; p["anim"] = "static"; p.pop("spread", None)   # one ship, no bouncing pile
            if p["name"] in ("bed", "royal_bed", "deathbed", "death_bed"): p["name"] = "bed"; p["count"] = 1; p["anim"] = "static"
            pr.append(p)
        s["props"] = pr
        if s.get("era") not in ("roman","greek","wildwest","viking","egypt","samurai","pirate","space","ww2","1920s","victorian","arabian","india","prehistoric","china"): s.pop("era", None)
        for p in s["props"]:
            to = p.get("to")
            if isinstance(to, dict) and "x" in to: p["to"] = {"x": max(-16, min(16, float(to["x"]))), "z": max(-3, min(3, float(to.get("z", 0))))}
            else: p.pop("to", None)
        ENVS = ("rain", "storm", "snow", "night", "space", "fog", "wind", "sandstorm", "mist", "leaves", "petals"); FXS = ("lightning", "explosion", "fire", "smoke", "sparkle")
        env = [e for e in (s.get("env") or []) if e in ENVS]
        if env: s["env"] = env
        else: s.pop("env", None)
        fx = []
        for e in (s.get("fx") or [])[:6]:
            if isinstance(e, dict) and e.get("type") in FXS:
                e["at"] = max(0.0, min(0.95, float(e.get("at", 0.3))))
                for k in ("x", "z", "h"):
                    if k in e:
                        try: e[k] = float(e[k])
                        except Exception: e.pop(k)
                fx.append(e)
        if fx: s["fx"] = fx
        else: s.pop("fx", None)
        for c in cast:       # sprinters really sprint: ~5.5 m/s over the scene so the chase reads as fast
            if c.get("act") == "run" and c.get("to"):
                dirx = 1 if c["to"]["x"] >= c["x"] else -1
                dist = min(22.0, 5.5 * float(s.get("dur", 3)) * 0.9)
                c["to"] = {"x": max(-14, min(14, c["x"] + dirx * dist)), "z": c["to"]["z"]}
        if str(s.get("interior", "")).lower() not in ("palace", "cave", "mine", "house", "jail", "shop"): s.pop("interior", None)
        else:
            s["interior"] = str(s["interior"]).lower()
            if s["interior"] == "shop":
                s["shop"] = str(s.get("shop", "shop"))[:30].lower(); s["stock"] = [str(x).lower()[:30] for x in (s.get("stock") or ["bread"])][:6]
            else: s.pop("shop", None); s.pop("stock", None)
        if s.get("move") not in MOVES: s.pop("move", None)
        if s.get("focus") and not (str(s["focus"]).startswith("@") or s["focus"] in [c["id"] for c in cast]): s.pop("focus", None)
        if s.get("target") not in [c["id"] for c in cast]: s["target"] = cast[0]["id"]
        for c in cast:
            dd = c.get("do")
            if isinstance(dd, dict) and dd.get("type") in ("write", "dig", "carry", "place", "drink", "pull", "push", "climb", "throw", "handOver", "lean", "open"):
                dd["at"] = max(0.0, min(0.7, float(dd.get("at", 0.15)))); dd["dur"] = max(0.6, min(8.0, float(dd.get("dur", 2.0))))
                if c.get("act") == "run" or c.get("mount"): c.pop("do")
            else: c.pop("do", None)
        ok.append(s)
    b["scenes"] = ok
    lib = {}
    try: lib = json.load(open(LIBPATH))
    except Exception: pass
    new = {}
    for nm, r in (b.get("models") or {}).items():
        try:
            parts = [q for q in r["parts"][:40] if q.get("s") in ("box", "sphere", "cyl", "cone", "torus", "pyramid")]
            if len(parts) >= 3: new[str(nm).lower()] = {"h": max(0.2, min(20.0, float(r.get("h", 1)))), "parts": parts, **{k: r[k] for k in ("saddle", "fly") if k in r}}
        except Exception: pass
    lib.update(new)                                   # the library grows with every video: designed things are reused forever
    try: os.makedirs(os.path.dirname(LIBPATH), exist_ok=True); json.dump(lib, open(LIBPATH, "w"), indent=1)
    except Exception: pass
    b["models"] = lib
    return b

# ---------- quote cutaways (owner P0) ----------
# Detect quoted lines ("..." / ‘...’ / said X, ...) inside a sentence and split the
# scene into narration / quote / narration sub-scenes. The quote scene is tagged with
# speaker, mood and shot="close" so make_voice.py and StoryHybrid.tsx can give the
# character their own voice, a face close-up and talking-mouth animation.
QUOTE_RE = re.compile(r'["“]([^"”]{2,}?)["”]')
_SAYV = r"(?:said|says|shouted|shouts|replied|replies|declared|declares|whispered|whispers|cried|cries|yelled|yells|asked|asks|roared|roars|exclaimed|exclaims|answered|answers|murmured|murmurs|announced|announces|called|calls|begged|begs|proclaimed|proclaims|snapped|snaps)"
_MOODV = [
    (r"\b(shout|shouts|shouted|yell|yells|yelled|roar|roars|roared|snap|snaps|furious|angry|command|orders|demand)\b", "stern"),
    (r"\b(whisper|whispers|whispered|murmur|murmurs|mutter|muttered|afraid|nervous|trembl|scared|worried)\b", "nervous"),
    (r"\b(laugh|laughs|laughed|joke|joked|grin|grinned|smile|smiled|happy|joy|celebrat)\b", "laugh"),
    (r"\b(cry|cries|cried|wept|weep|sad|sorrow|mourn|pain|hurt)\b", "pained"),
    (r"\b(declare|declares|declared|proclaim|proclaims|proud|boast)\b", "stern"),
    (r"\b(ask|asks|asked|beg|begs|begged|plead|pleaded)\b", "nervous"),
    (r"\b(shock|shocked|gasps|gasped|surprise|surprised|impossible)\b", "shock"),
]
_EXPRS = set(EXPR)

def _mood_for(text):
    low = text.lower()
    for rx, m in _MOODV:
        if re.search(rx, low): return m
    if re.search(r"!", low): return "stern"
    return "smile"

def _speaker_from(text, cast, default):
    low = text.lower(); cands = []
    for c in cast:
        for nm in {str(c.get("id", "")).lower(), str(c.get("role", "")).lower()}:
            if nm and re.search(r"\b" + re.escape(nm) + r"\b", low):
                cands.append((low.find(nm), c.get("id")))
    if cands: return sorted(cands)[0][1]
    return default

def _extract_quote(nar):
    """Return (pre, quote, post) for a sentence containing a quoted line, else None."""
    m = QUOTE_RE.search(nar)
    if m:
        q = m.group(1).strip()
        if len(q.split()) >= 1:
            return nar[:m.start()].strip(" ,;:.-"), q, nar[m.end():].strip(" ,;:.-")
    m = re.search(r"\b" + _SAYV + r"\b\s*[,:]\s*(.+)$", nar, re.I)
    if m and len(m.group(1).split()) >= 3:
        q = m.group(1).strip(" ,;:.!?\"'“”")
        pre = nar[:m.start()].rstrip(" ,;:.-")
        if len(pre.split()) >= 1 and len(q.split()) >= 3:
            return pre, q, ""
    return None

def detect_quotes(b):
    out = []
    for s in b.get("scenes", []):
        nar = (s.get("narration") or s.get("caption") or "").strip()
        if not nar or s.get("quote"):
            out.append(s); continue
        got = _extract_quote(nar)
        if not got:
            out.append(s); continue
        pre, q, post = got
        cast = s.get("cast") or []
        speaker = _speaker_from(pre + " " + q + " " + post, cast, s.get("target") or (cast[0]["id"] if cast else "narrator"))
        mood = _mood_for(pre + " " + q)
        mood = mood if mood in _EXPRS else "smile"

        def clone(narr, dur):
            n = copy.deepcopy(s)
            n["narration"] = n["caption"] = narr
            n["dur"] = round(dur, 2)
            return n

        n_words = max(1, len(nar.split()))
        if len(pre.split()) >= 2:
            out.append(clone(pre, max(1.6, float(s.get("dur", 3)) * len(pre.split()) / n_words)))
        qs = clone(q, max(2.0, min(5.0, 0.55 + len(q.split()) / 2.5)))
        qs["quote"] = True; qs["speaker"] = speaker; qs["mood"] = mood; qs["shot"] = "close"; qs["move"] = "push"
        spdef = next((copy.deepcopy(c) for c in cast if c.get("id") == speaker), {"id": speaker, "role": "man"})
        for k in ("to", "act", "do", "mount", "hold", "holdAt", "aim", "walkAt"):
            spdef.pop(k, None)
        spdef["x"] = 0.0; spdef["z"] = 0.2
        spdef["expr"] = mood; spdef.pop("expr2", None); spdef.pop("at2", None)
        spdef["look"] = "cam"
        qs["cast"] = [spdef]; qs["target"] = spdef["id"]; qs["extras"] = 0
        qs["props"] = []
        for k in ("focus", "fx", "shots", "words", "focusWord"): qs.pop(k, None)
        out.append(qs)
        if len(post.split()) >= 2:
            out.append(clone(post, max(1.6, float(s.get("dur", 3)) * len(post.split()) / n_words)))
    b["scenes"] = out
    return b

def quotes_finalize(b):
    """After the other passes, lock each quote scene down to one centred speaker."""
    act_by_mood = {"stern": "point", "laugh": "cheer", "grin": "cheer", "shock": "wave", "smile": "nod"}
    for s in b.get("scenes", []):
        if not s.get("quote"): continue
        cast = s.get("cast") or []
        keep = next((c for c in cast if c.get("id") == s.get("speaker")), cast[0] if cast else None)
        if keep is None: continue
        keep["x"] = 0.0; keep["z"] = 0.2; keep["look"] = "cam"
        for k in ("to", "do", "mount", "hold", "holdAt", "aim", "walkAt"): keep.pop(k, None)
        mood = s.get("mood") or "smile"
        keep["expr"] = mood if mood in _EXPRS else "smile"
        keep.pop("expr2", None); keep.pop("at2", None)
        act = act_by_mood.get(mood)
        if act: keep["act"] = act
        s["cast"] = [keep]; s["target"] = keep["id"]
        s["extras"] = 0; s["props"] = []
        s["shot"] = "close"; s["move"] = "push"
        s["narration"] = s["caption"] = str(s.get("narration") or "").strip()
    return b

def _load_props3d_known():
    known = set(LIB) | set(ROLES)
    try:
        txt = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../src/videos/story/props3d.ts")).read()
        for block_name in ["PROC", "KEN", "ALIAS", "DEFAULT_H", "SADDLE"]:
            part = txt.split(f"const {block_name}")
            if len(part) > 1:
                block_content = part[1].split(";")[0]
                for k in re.findall(r"([a-z0-9_]+)\s*:", block_content):
                    known.add(k.lower())
    except Exception:
        pass
    return known

def generate_recipe(name):
    import hashlib
    h_val = int(hashlib.md5(name.encode()).hexdigest(), 16)
    shapes = ["box", "sphere", "cyl", "cone", "torus", "pyramid"]
    colors = ["#8a5a2b", "#e23b3b", "#4aa84a", "#f1c24f", "#3a3a44", "#35c3e8", "#c0353a", "#8a8f9c", "#d49e35", "#b88a3a"]
    num_parts = 12 + (h_val % 15)  # 12 to 26 parts (between 8 and 30)
    parts = []
    for i in range(num_parts):
        s = shapes[(h_val + i * 3) % len(shapes)]
        c = colors[(h_val + i * 7) % len(colors)]
        px = ((h_val >> (i % 8)) % 21 - 10) * 0.05
        py = 0.2 + (i * 0.07)
        pz = ((h_val >> ((i + 2) % 8)) % 21 - 10) * 0.05
        sx = 0.3 + ((h_val + i) % 5) * 0.1
        sy = 0.3 + ((h_val + i * 2) % 5) * 0.1
        sz = 0.3 + ((h_val + i * 3) % 5) * 0.1
        parts.append({"s": s, "c": c, "p": [round(px, 2), round(py, 2), round(pz, 2)], "z": [round(sx, 2), round(sy, 2), round(sz, 2)], "r": [0, 0, 0]})
    return {"h": 1.2, "parts": parts}

def generate_icon_svg(name):
    import hashlib
    h_val = int(hashlib.md5(name.encode()).hexdigest(), 16)
    colors = ["#f1c24f", "#e23b3b", "#4aa84a", "#35c3e8", "#d49e35", "#8a5a2b", "#b88a3a", "#c0353a", "#7a4b2a", "#3a3d45"]
    col = colors[h_val % len(colors)]
    col2 = colors[(h_val + 3) % len(colors)]
    return f'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#1d1a20" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><rect x="20" y="20" width="60" height="60" rx="12" fill="{col}"/><circle cx="50" cy="50" r="18" fill="{col2}"/><path d="M 35 50 H 65" stroke="#1d1a20" stroke-width="6"/></g></svg>'

def add_auto_models_and_icons(b):
    known = _load_props3d_known()
    models = b.get("models", {})
    icons = b.get("icons", {})
    all_nouns = set()
    for sc in b.get("scenes", []):
        for p in sc.get("props", []):
            if isinstance(p, dict) and p.get("name"):
                all_nouns.add(str(p["name"]).lower().strip())
        for c in sc.get("cast", []):
            if c.get("hold"):
                all_nouns.add(str(c["hold"]).lower().strip())
            if c.get("mount"):
                all_nouns.add(str(c["mount"]).lower().strip())
    for noun in all_nouns:
        if not noun:
            continue
        if noun not in known and noun not in models:
            models[noun] = generate_recipe(noun)
        if noun not in icons:
            icons[noun] = generate_icon_svg(noun)
    b["models"] = models
    if icons:
        b["icons"] = icons
    return b

ARMY = r"\b(army|armies|soldiers?|troops?|legions?|warriors?|men marched|invad\w+|battle|siege|conquer\w*|crush\w*|march\w*)\b"
CROWD = r"\b(crowd|people|villagers|citizens|priests|worshipp?ers|merchants|pilgrims|workers|nobles|courtiers|city|cities|market)\b"
def crowds(b, script):
    """Dedupe repeated scenes, set the era (dominant era of the story, per-scene override), armies/crowds as visible groups."""
    seen, out = set(), []
    for sc in b["scenes"]:
        if sc.get("quote"):
            # quote scenes bypass dedup and extras assignment (single speaker only)
            out.append(sc)
            continue
        cap = (sc.get("narration") or sc.get("caption") or "").strip().lower()
        if cap and cap in seen: continue
        if cap: seen.add(cap)
        out.append(sc)
    b["scenes"] = out
    low = script.lower()
    main = next((e for p, e in ERAKW if re.search(p, low) and e != "arabian"), None)     # protagonists' era (Alexander -> greek)
    for sc in b["scenes"]:
        if sc.get("quote"): continue
        t = (sc.get("narration") or sc.get("caption") or "").lower()
        here = next((e for p, e in ERAKW if re.search(p, t) and e not in ("arabian",)), None)
        sc["era"] = here or sc.get("era") or main
        if sc["era"] == "arabian" and main: sc["era"] = main
        if re.search(r"persian\s+(soldiers?|army|armies|troops|warriors|forces)|babylonian|assyrian", t): sc["extrasEra"] = "arabian"
        if re.search(r"\b(charg\w*|attack\w*|fought|fight|clash\w*|held the line|crush\w*|battle|war)\b", t):
            sc["extras"] = max(int(sc.get("extras") or 0), 14)
            sc["extrasRole"] = "soldier"
            if not sc.get("extrasEra"):
                sc["extrasEra"] = "arabian" if sc.get("era") == "greek" else ("barbarian" if sc.get("era") == "roman" else "viking")
            if sc.get("cast"):
                leader = sc["cast"][0]
                leader["x"] = -1.2
                leader["act"] = leader.get("act") or "point"
        if re.search(ARMY, t): sc["extras"] = max(int(sc.get("extras") or 0), 10); sc["extrasRole"] = "soldier"
        elif re.search(CROWD, t): sc["extras"] = max(int(sc.get("extras") or 0), 8); sc["extrasRole"] = "townsfolk"
    return b

def _split_durs(dur, n):
    """Split dur into n parts each in [1.5, 3.5], evenly as possible."""
    n = max(1, int(n))
    lo, hi = 1.5, 3.5
    if n * hi < dur:
        n = max(1, int(dur / hi + 0.99))
    if n * lo > dur:
        n = max(1, int(dur / lo + 0.001))
    base = dur / n
    parts = [min(hi, max(lo, base)) for _ in range(n)]
    total = sum(parts)
    if total and abs(total - dur) > 0.05:
        diff = dur - total
        for _ in range(20):
            if abs(diff) < 0.05:
                break
            cand = [i for i in range(n) if parts[i] < hi - 0.05] if diff > 0 else [i for i in range(n) if parts[i] > lo + 0.05]
            if not cand:
                break
            i = max(cand, key=lambda idx: abs(parts[idx] - (hi if diff > 0 else lo)))
            parts[i] = max(lo, min(hi, parts[i] + diff))
            diff = dur - sum(parts)
    return [round(p, 2) for p in parts]

def _pick_focus_noun(s):
    """Return the noun/face the sentence names: a prop, a held item, or the target character."""
    for p in (s.get("props") or []):
        return "@" + p["name"]
    for c in s.get("cast", []):
        if c.get("hold"):
            return "@" + c["hold"]
    return s.get("target") or (s.get("cast") or [{}])[0].get("id")

def _reactor(s, main_who):
    for c in s.get("cast", []):
        if c.get("expr2") and c["id"] != main_who:
            return c["id"]
    for c in s.get("cast", []):
        if c["id"] != main_who:
            return c["id"]
    return main_who

def _word_timings(narration, dur):
    ws = narration.split()
    if not ws:
        return []
    per = dur / len(ws)
    return [{"w": w, "t0": round(i * per, 3), "t1": round((i + 1) * per, 3)} for i, w in enumerate(ws)]

SHOT_TEMPLATES = {
    4: [("wide", "reveal"), ("medium", "pan"), ("close", "push"), ("close", "hold")],
    3: [("wide", "reveal"), ("medium", "pan"), ("close", "push")],
    2: [("wide", "reveal"), ("close", "push")],
    1: [("wide", "reveal")],
}

def plan_shots(b):
    """Reference video shot grammar: for every sentence pick establishing wide -> medium -> close-up on the
    named noun/face -> reaction shot; add per-scene focus word timings; keep each shot 1.5-3.5 s."""
    for s in b.get("scenes", []):
        if s.get("fly") or not (s.get("narration") or "").strip():
            s.pop("shots", None)
            s.pop("words", None)
            s.pop("focusWord", None)
            continue
        dur = round(max(1.5, min(3.5, float(s.get("dur", 3)))), 2)
        s["dur"] = dur
        n = 4 if dur >= 7.0 else 3 if dur >= 4.5 else 2 if dur >= 3.0 else 1
        tmpl = SHOT_TEMPLATES[n]
        durs = _split_durs(dur, n)
        noun = _pick_focus_noun(s)
        who = s.get("target") or (s.get("cast") or [{}])[0].get("id")
        reactor = _reactor(s, who)
        shots = []
        for k, ((shot, move), d) in enumerate(zip(tmpl, durs)):
            if k == 0:
                focus = who
            elif k == n - 1 and n == 4:
                focus = reactor
            else:
                focus = noun if noun.startswith("@") else who
            shots.append({"shot": shot, "move": move, "dur": d, "focus": focus})
        s["shots"] = shots
        nar = s.get("narration") or ""
        s["words"] = _word_timings(nar, dur)
        focus_name = noun[1:].lower() if noun.startswith("@") else noun.lower()
        s["focusWord"] = next((w for w in nar.split() if w.lower().strip(".,;:!?'\"") == focus_name or focus_name in w.lower()), nar.split()[0] if nar.split() else "")
    return b

if __name__ == "__main__":
    script = open(sys.argv[1]).read()
    b = llm(script)
    src = "llm"
    if not b or not b.get("scenes"):
        b, src = heuristic(script), "heuristic"
    b = drop_worn(fly_pass(quotes_finalize(clean(establish(enrich_world(enrich_actions(enrich(split_clauses(detect_quotes(b))))))))))
    b = add_auto_models_and_icons(crowds(b, script))
    b = plan_shots(b)
    json.dump(b, open(sys.argv[2], "w"), indent=1)
    print(f"{src}: {len(b['scenes'])} scenes, {sum(s['dur'] for s in b['scenes']):.0f}s -> {sys.argv[2]}")
