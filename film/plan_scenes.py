#!/usr/bin/env python3
"""Rule-based script -> scene plan.  python3 film/plan_scenes.py script.txt out.json"""
import json, re, sys

LOC = [("city", r"\b(hospital|clinic|operating room|office|factory|bank|kitchen|restaurant|garage|race track|airport|runway|stadium|laboratory|station)\b"), ("snow", r"\b(snow|snowy|blizzard|glacier|arctic)\b"), ("volcano", r"\b(volcano|lava|eruption)\b"), ("jungle", r"\b(jungle|rainforest|amazon)\b"), ("forest", r"\b(forest|woods|trees)\b"), ("castle", r"\b(castle|knight|knights|kingdom|fortress|dragon)\b"), ("city", r"\b(city|skyscraper|skyscrapers|street|streets|downtown|office)\b"),
       ("space", r"\b(space|rocket|planet|mars|moon|star|stars|galaxy|orbit|astronaut)\b"),
       ("ocean", r"\b(diver|submarine|seabed|trench|whale|deep sea|beneath the waves|underwater|reef)\b"),
       ("egypt", r"\b(egypt|pyramid|pyramids|pharaoh|sphinx|nile)\b"),
       ("hall", r"\b(hall|halls|council|palace|throne)\b"),
       ("temple", r"\b(temple)\b"),
       ("cliff", r"\b(cliff|mountain|peak|summit)\b"),
       ("beach", r"\b(shore|beach|sand|landed|landing)\b"),
       ("sea", r"\b(sea|ship|fleet|ocean|voyage|sail|waves|boat)\b"),
       ("plain", r"\b(plain|desert|field|battle|army|armies|road|march|marched|dust)\b")]
TOD = [("storm", r"\b(storm|thunder|lightning)\b"), ("night", r"\b(night|dark|darkness|midnight|stars)\b"),
       ("dusk", r"\b(dusk|sunset|evening|twilight)\b"), ("gold", r"\b(dawn|sunrise|morning|golden hour)\b")]
WEA = [("storm", r"\b(storm|thunder|lightning)\b"), ("rain", r"\b(rain)\b"), ("sand", r"\b(sand storm|blowing sand|blew red sand|dust storm|burning desert)\b"),
       ("fog", r"\b(fog|mist|night fell|dark as night)\b"), ("birds", r"\b(eagle|eagles|birds|bird|gull|gulls|cliff)\b"), ("snow", r"\b(snow|blizzard)\b")]
ACT = [("fight", r"\b(clash|clashed|fought|fight|battle|attack|war|struck)\b"), ("kneel", r"\b(knelt|kneel|bow|bowed)\b"),
       ("march", r"\b(march|marched|marching|walked|walk|stepped|crossed)\b"), ("cheer", r"\b(victorious|cheer|celebrate|triumph)\b"),
       ("point", r"\b(pointed|showed)\b"), ("sit", r"\b(gathered|sat|plan)\b"), ("look", r"\b(looked|watched|gazed|appeared)\b"),
       ("talk", r"\b(said|whispered|asked|replied|smiled)\b")]
ERA = [("space", r"\b(rocket|astronaut|mars|space|planet)\b"), ("ocean", r"\b(diver|submarine|whale|trench)\b"),
       ("modern", r"\b(city|skyscraper|car|phone)\b"), ("medieval", r"\b(knight|castle|king arthur|viking)\b")]
MOOD = [("tense", r"\b(clash|storm|fight|battle|war|marched against)\b"), ("sad", r"\b(died|lost|alone|lonely)\b"),
        ("wonder", r"\b(stars|glowing|appeared|giant|great|marble)\b")]
NOUNS = "crown spear shield sword scroll gold ship fleet torch bow arrow helmet flag throne chest sun moon star rocket planet satellite fish whale anchor key book map wheel castle tent horse pyramid army eagle sand storm temple empire stars".split()

ROLE = [("surgeon", r"\b(surgeon|surgery|operating (room|theatre|theater)|scalpel)\b"), ("nurse", r"\b(nurse|nurses)\b"),
        ("doctor", r"\b(doctor|doctors|physician|stethoscope|patient|patients|hospital|clinic)\b"), ("scientist", r"\b(scientist|scientists|laboratory|experiment|researcher)\b"),
        ("firefighter", r"\b(firefighter|firefighters|fireman|fire truck|blaze|wildfire)\b"), ("skydiver", r"\b(skydiv\w*|parachute|freefall|free fall)\b"),
        ("scuba", r"\b(scuba|snorkel\w*|coral reef|reef)\b"), ("racer", r"\b(racer|racing|race car|formula one|formula 1|grand prix|pit stop|race track)\b"),
        ("police", r"\b(police|policeman|cop|detective|officer|patrol)\b"), ("pilot", r"\b(pilot|airplane|aeroplane|cockpit|jet|airliner)\b"),
        ("chef", r"\b(chef|kitchen|restaurant|cooking|cook)\b"), ("mechanic", r"\b(mechanic|garage|engine repair)\b"),
        ("miner", r"\b(miner|miners|mining|coal mine|gold mine|mineshaft)\b"), ("farmer", r"\b(farmer|farmers|farm|harvest|tractor)\b"),
        ("athlete", r"\b(athlete|footballer|football|soccer|marathon|sprinter|olympic\w*|basketball)\b"), ("pirate", r"\b(pirate|pirates|buccaneer)\b"),
        ("builder", r"\b(builder|construction|skyscraper|crane operator|bricklayer|worker|workers|factory|wage)\b"), ("tycoon", r"\b(businessman|business|ceo|company|startup|entrepreneur|investor|banker|bank|rich man|profits?)\b"),
        ("monk", r"\b(monk|monks|monastery)\b"), ("soldier", r"\b(modern soldier|military|rifles?|marines?|commando|special forces|infantry|battalion)\b"),
        ("knight", r"\b(knight|knights|crusader)\b"), ("viking", r"\b(viking|vikings|longship)\b")]
ROLE_ERA = {"soldier": "modern", "knight": "medieval", "viking": "medieval", "pirate": "pirate", "monk": "medieval"}

def pick(tbl, t, default):
    for k, rx in tbl:
        if re.search(rx, t, re.I): return k
    return default

def shots_for(loc, act, i, quote):
    if quote: return ["ots", "closeup", "side"]
    if act == "fight": return ["wide", "ots", "closeup"]
    if act in ("march",): return ["side", "follow", "back"]
    if act == "kneel": return ["back", "closeup", "crane"]
    if loc in ("cliff",): return ["back", "side", "crane"]
    cyc = [["wide", "follow", "closeup"], ["crane", "side", "closeup"], ["back", "ots", "wide"], ["follow", "side", "closeup"]]
    return cyc[i % 4]

def speaker_of(s, era, role=None):
    m = re.search(r"\b([Ss]he|[Hh]e|[Tt]he [a-z]+|[A-Z][a-z]+)\s+(said|whispered|asked|replied)", s)
    w = m.group(1) if m else None
    if w is None or w.lower() in ("she", "he"):
        if role: return "The " + {"tycoon": "Businessman", "builder": "Worker"}.get(role, role[0].upper() + role[1:])
        return {"space": "The Astronaut", "ocean": "The Diver"}.get(era, "The Queen" if ((w or "").lower() == "she" or re.search(r"\b[Ss]he\b", s)) else "The King")
    return w[0].upper() + w[1:]

def plan(text):
    text = re.sub(r"\s+", " ", text.strip())
    text = re.sub(r'"[^"]*"', lambda m: re.sub(r"([.!?])(?=\s)", lambda k: {".": "\u0001", "!": "\u0002", "?": "\u0003"}[k.group(1)], m.group(0)), text)
    sents = [x.strip() for x in re.split(r"(?<=[.!?\"])\s+(?=[A-Z\"])", text) if x.strip()]
    sents = [x.replace("\u0001", ".").replace("\u0002", "!").replace("\u0003", "?") for x in sents]
    out = []
    for x in sents:
        if out and x.startswith('"') and out[-1].rstrip().endswith(","): out[-1] += " " + x
        else: out.append(x)
    full = " ".join(out).lower(); counts = {}
    for k, rx in ROLE:
        n = len(re.findall(rx, full, re.I))
        if n: counts[k] = n
    grole = max(counts, key=counts.get) if counts else None
    if grole and re.search(r"\b(alexander|pharaoh|egypt|persians?|crown|empire|temple|gladiator|caesar|spartan|roman)\b", full, re.I): grole = None
    if grole and re.search(ERA[0][1], full, re.I): grole = None
    if grole and re.search(ERA[1][1], full, re.I): grole = None
    scenes = []; prev_loc = "plain"; prev_era = (ROLE_ERA.get(grole, "modern") if grole else "ancient")
    for i, s in enumerate(out):
        qs = re.findall(r'"([^"]+)"', s); quote = " ".join(qs) if qs else None
        low = s.lower()
        loc = pick(LOC, low, prev_loc)
        era0 = pick(ERA, low, prev_era)
        if era0 in ("space", "ocean") and loc not in ("space", "ocean"): loc = era0
        prev_loc = loc
        act = pick(ACT, low, "talk" if quote else "idle")
        tod = pick(TOD, low, "day"); wea = pick(WEA, low, "none")
        era = pick(ERA, low, prev_era); prev_era = era; mood = pick(MOOD, low, "calm")
        names = [n for n in re.findall(r"\b[A-Z][a-z]{2,}\b", s) if n not in ("The", "She", "But", "Then", "They", "That", "For", "Far", "Strange", "Sunlight", "Victorious", "From", "Alexander", "Persians", "Egypt", "Mars", "Earth")]
        chars = [{"role": "hero", "kind": "hero", "action": act}]
        if re.search(r"\b(queen|she|her)\b", low): chars.append({"role": "queen", "kind": "queen", "action": "talk"})
        if re.search(r"\b(army|armies|soldiers|crew|council|fleet|persians)\b", low): chars.append({"role": "crowd", "kind": "soldier", "action": act})
        role = pick(ROLE, low, grole) if era not in ("space", "ocean") else None
        found = sorted((m.start(), k) for k, rx in ROLE for m in [re.search(rx, low, re.I)] if m)
        seen = []
        for _, k in found:
            if k not in seen: seen.append(k)
        role2 = None
        if era not in ("space", "ocean") and len(seen) >= 2: role, role2 = seen[0], seen[1]
        if era == "ancient" and role not in ("monk",): role = None
        nouns = [w for w in NOUNS if re.search(r"\b" + w + r"\b", low)]
        scenes.append({"text": re.sub(r"\s+", " ", s), "quote": quote, "location": loc, "tod": tod, "weather": wea, "era": era,
                       "speaker": speaker_of(s, era, role), "role": role, "role2": role2, "characters": chars, "nouns": nouns, "mood": mood, "shots": shots_for(loc, act, i, quote)})
    return scenes

if __name__ == "__main__":
    src = open(sys.argv[1], encoding="utf8").read()
    p = plan(src)
    json.dump(p, open(sys.argv[2], "w"), indent=1)
    print(len(p), "scenes ->", sys.argv[2])
