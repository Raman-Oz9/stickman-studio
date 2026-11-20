#!/usr/bin/env python3
"""Choose a compact set of generated textures from a planned story board.

Usage: python3 remotion/scripts/story_assets.py board.json
       python3 remotion/scripts/story_assets.py --self-test
Prints texture basenames (without .jpg), one per line.
"""
import json
import re
import sys

RULES = [
    (("egypt", "egyptian", "pharaoh", "pyramid", "sphinx", "nile"), ("egyptian_temple_wall", "limestone", "mud_brick", "sand_dune", "carpet_red")),
    (("roman", "rome", "colosseum", "aqueduct", "legion"), ("roman_stone", "marble", "cobblestone")),
    (("greek", "greece", "athens", "sparta", "parthenon", "column"), ("greek_marble", "marble", "limestone")),
    (("islamic", "mosque", "minaret", "persian", "arabia", "babylon"), ("islamic_tile", "limestone", "carpet_red")),
    (("china", "chinese", "pagoda", "samurai", "japan", "asia"), ("pagoda_wood", "roof_tiles", "wood_planks")),
    (("medieval", "castle", "knight", "kingdom", "viking", "longhouse"), ("cobblestone", "roof_tiles", "thatch", "wood_planks")),
    (("ship", "sail", "boat", "harbor", "harbour", "ocean", "sea", "coast", "pirate"), ("ship_sail_cloth", "wood_planks", "water_deep")),
    (("snow", "winter", "ice", "arctic", "glacier", "himalaya", "mountain"), ("snow", "rock", "gravel")),
    (("forest", "jungle", "rainforest", "woods", "tree"), ("forest_floor", "grass", "rock")),
    (("industrial", "factory", "steam", "railway", "train"), ("industrial_metal", "brick_wall", "gravel", "wood_planks")),
    (("modern", "futuristic", "skyscraper", "city", "airport", "highway"), ("concrete", "asphalt", "glass_facade")),
    (("farm", "village", "grassland", "savanna", "plain", "field"), ("grass", "dry_dirt", "wood_planks", "thatch")),
    (("desert", "sahara", "dune", "sand", "camel"), ("sand_dune", "dry_dirt", "rock")),
    (("river", "lake", "waterfall", "flood", "water"), ("water_deep", "rock")),
]

def required_assets(board):
    text = json.dumps(board, ensure_ascii=False).lower()
    tokens = set(re.findall(r"[a-z0-9_-]+", text))
    names = set()
    for keywords, assets in RULES:
        if any(k in tokens or k in text for k in keywords):
            names.update(assets)
    if any(k in tokens for k in ("night", "midnight", "moon", "stars")):
        names.add("sky_night")
    elif any(k in tokens for k in ("dusk", "sunset", "evening", "dawn", "golden")):
        names.add("sky_sunset")
    else:
        names.add("sky_day")
    if not names.intersection({"sand_dune", "dry_dirt", "grass", "snow", "forest_floor", "water_deep"}):
        names.update(("grass", "dry_dirt"))
    return sorted(names)

def self_test():
    cases = [
        ({"scenes": [{"world": {"era": "egypt", "terrain": "desert"}, "props": [{"name": "pyramid"}]}]}, {"egyptian_temple_wall", "sand_dune", "sky_day"}),
        ({"scenes": [{"world": {"era": "roman", "terrain": "city"}}]}, {"roman_stone", "marble", "cobblestone"}),
        ({"scenes": [{"world": {"terrain": "ocean", "timeOfDay": "night"}, "props": [{"name": "ship"}]}]}, {"ship_sail_cloth", "wood_planks", "water_deep", "sky_night"}),
    ]
    for board, expected in cases:
        actual = set(required_assets(board))
        missing = expected - actual
        if missing:
            raise SystemExit("story asset self-test failed; missing: " + ", ".join(sorted(missing)))
    print("story asset planner self-test passed")

def main():
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
        return
    if len(sys.argv) != 2:
        raise SystemExit("usage: story_assets.py board.json | --self-test")
    with open(sys.argv[1], encoding="utf-8") as f:
        board = json.load(f)
    for name in required_assets(board):
        print(name)

if __name__ == "__main__":
    main()
