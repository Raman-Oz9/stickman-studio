# HANDOFF (read first if Claude/ChatGPT hit a session limit)
Owner decision (Nov 18): **WORLD = real 3D** (Three.js StoryWorld: terrain, realm, buildings, sky, space/planets, camera moves). **CHARACTERS = 2D ink** (InkStickman + Performer2D) standing in the 3D world, projected through the same camera (`remotion/src/videos/story/StoryHybrid.tsx`). Flat 2D painted backdrops (Story2D.tsx) are LEGACY: do not extend them.

## Pieces
- 3D world: `world.ts`, `worldgen.ts`, `realm.ts`, `terrain.ts`, `interiors.ts`, `props3d.ts`, `effects.ts`, `camera.ts`. In hybrid mode `StoryWorld.hideCast=true` (no 3D characters).
- 2D cast: `InkStickman.tsx` (rig), `pose2d.ts` (55 verbs + `verbFromText`), `Props2D.tsx` (hand props), `Performer2D.tsx`, `castPerf.ts` (which verb now), overlay in `StoryHybrid.tsx`.
- Planner: `remotion/scripts/plan_story.py` (Gemini -> scenes with cast do/act/props/loc/biome/env, incl. space/ocean).
- Proof: workflow `action-sheet.yml` (push to claude/actions or claude/hybrid) -> branch `proof-actions` (stills). Never ship video without viewing stills.
- Queue for OpenCode: `docs/OPENCODE_QUEUE.md` (auto every 20 min).

## Roadmap (do in order)
1. Hybrid looks right: characters planted on ground, correct scale/depth, camera moves (push/pull/orbit) keep them framed; occlusion by buildings acceptable.
2. Space + ocean + ancient-history worlds in 3D: planets/stars/ISS/black hole sets, underwater (fish, coral, light shafts, bubbles), Rome/Greece/Egypt/China sets. Characters in spacesuit/diving suit/togas via outfits.ts.
3. Word-timed captions + music/SFX at half voice level (cinematic skill).
4. Full script -> narrated 60 s video via story-video.yml (StoryShort = StoryHybrid).
5. 3 sample videos (ancient history, deep space, deep ocean).

## Rules
No barrels. Full-body humans that act every verb. Check stills before sending video. Update docs/CONTEXT.md on every change. Small commits.

## WORLD BIBLE (owner request Nov 18, 04:00): everything in the human world, in 3D, whatever the script says
- **Not one location.** Every scene picks its own place AND era AND weather. Places: cities (modern, medieval, ancient Rome/Greece/Egypt/China, futuristic), villages, farms, seas/oceans (real 3D water + ships, underwater), mountains, grand canyon, deserts, jungles, ice/arctic, caves/mines, airports, railway stations/tracks, highways, harbours, space (planets, stations, black holes).
- **Eras**: stone age, ancient (Egypt, Greece, Rome, China, India), medieval, Viking, Renaissance, pirate age, Victorian, 1920s, wild west, WW1/WW2, modern, near future, space age. Era drives: buildings, vehicles, props, and the 2D cast's outfit (`inkOutfit.ts` + `outfits.ts` ERA table).
- **Weather/season** everywhere: summer, winter/snow, rain, storm, fog, wind, night/dawn/dusk (`env`, `season`, `tod` in scenes).
- **Vehicles/objects are real 3D**: cars, trucks, buses, trains on rails, planes, helicopters, ships, boats, carts, chariots, tanks, bikes, rockets. They must NOT always drive sideways: camera orbits/tracks/flies over them from front, back, above, low angle; vehicles drive along paths (roads, rails, air lanes) not across the screen.
- **Animals** in 3D, matching biome/era. **Tools/tech**: calculators, phones, computers, books, scrolls, pens, instruments... held by the 2D cast (Props2D) and 3D set dressing (props3d).
- **Any noun**: if the library has it, use it; if not, the engine AUTO-GENERATES it: planner (Gemini) emits a 3D `models` recipe (already supported in plan_story.py step 7) and an SVG hand-icon for held items (`icons` field, TODO). Never show a placeholder tile.
- **Cinematic look**: depth-of-field blur (LensBlur), bloom, colour grade per era/weather, shiny outfits (gradient + specular on garments, metals), film grain, soft shadows, vignette; camera always moving (push, pull, orbit, crane, tracking).
