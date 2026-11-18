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
