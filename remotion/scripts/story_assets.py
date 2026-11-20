#!/usr/bin/env python3
import json, re, sys
RULES=[
(("egypt","egyptian","pharaoh","pyramid","sphinx","nile"),("egyptian_temple_wall","limestone","mud_brick","sand_dune","carpet_red")),
(("roman","rome","colosseum","aqueduct","legion"),("roman_stone","marble","cobblestone","limestone")),
(("greek","greece","athens","sparta","parthenon"),("greek_marble","marble","limestone")),
(("islamic","mosque","minaret","persian","arabia"),("islamic_tile","limestone","carpet_red")),
(("china","chinese","pagoda","samurai","japan"),("pagoda_wood","roof_tiles","wood_planks")),
(("medieval","castle","knight","viking"),("cobblestone","roof_tiles","thatch","wood_planks")),
(("ship","sail","boat","harbor","harbour","ocean","sea","coast","pirate"),("ship_sail_cloth","wood_planks","water_deep")),
(("snow","winter","ice","arctic","glacier","himalaya","mountain"),("snow","rock","gravel")),
(("forest","jungle","rainforest","woods","tree"),("forest_floor","grass","rock")),
(("industrial","factory","steam","railway","train"),("industrial_metal","brick_wall","gravel","wood_planks")),
(("modern","futuristic","skyscraper","skyscrapers","urban","airport","highway"),("concrete","asphalt","glass_facade")),
(("farm","village","grassland","savanna","plain","field"),("grass","dry_dirt","wood_planks","thatch")),
(("desert","sahara","dune","sand","camel"),("sand_dune","dry_dirt","rock")),
(("river","lake","waterfall","flood","water"),("water_deep","rock")),
(("scroll","parchment","papyrus","manuscript","scribe"),("ancient_scroll_paper",))]
def required(board):
 text=json.dumps(board,ensure_ascii=False).lower(); tokens=set(re.findall(r"[a-z0-9_-]+",text)); out=set()
 for keys,assets in RULES:
  if any(k in tokens for k in keys): out.update(assets)
 if any(k in tokens for k in ("night","midnight","moon","stars")): out.add("sky_night")
 elif any(k in tokens for k in ("dusk","sunset","evening","dawn","golden")): out.add("sky_sunset")
 else: out.add("sky_day")
 if not out.intersection({"sand_dune","dry_dirt","grass","snow","forest_floor","water_deep"}): out.update(("grass","dry_dirt"))
 return sorted(out)
if __name__=="__main__":
 if sys.argv[1:]==["--self-test"]:
  cases=[
   ({"scenes":[{"world":{"era":"egypt","terrain":"desert"}}]},{"egyptian_temple_wall","sand_dune"}),
   ({"scenes":[{"world":{"era":"roman","terrain":"city"}}]},{"roman_stone","marble"}),
   ({"scenes":[{"world":{"era":"greek"}}]},{"greek_marble"}),
   ({"scenes":[{"world":{"era":"islamic"}}]},{"islamic_tile"}),
   ({"scenes":[{"world":{"era":"china"}}]},{"pagoda_wood"}),
   ({"scenes":[{"world":{"terrain":"ocean","timeOfDay":"night"},"props":[{"name":"ship"}]}]},{"ship_sail_cloth","water_deep","sky_night"}),
   ({"scenes":[{"world":{"era":"modern","terrain":"city"}}]},{"concrete","asphalt","glass_facade"}),
   ({"scenes":[{"props":[{"name":"ancient scroll"}]}]},{"ancient_scroll_paper"})]
  for board,expected in cases:
   assert expected.issubset(set(required(board))),(expected-set(required(board)),board)
  roman_city=required({"scenes":[{"world":{"era":"roman","terrain":"city"}}]})
  assert "concrete" not in roman_city and "asphalt" not in roman_city
  assert "water_deep" not in required({"title":"research methods"})
  print("story asset planner self-test passed")
 elif len(sys.argv)==2:
  for name in required(json.load(open(sys.argv[1],encoding="utf-8"))): print(name)
 else: raise SystemExit("usage: story_assets.py board.json | --self-test")
