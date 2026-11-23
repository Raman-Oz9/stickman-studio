# Landed Features & Progress Log

### 2026-11-23 — Add docs/PROGRESS.md progress tracking file
How to test:
1. Run `ls docs/PROGRESS.md` to verify the document exists.
2. Read `docs/PROGRESS.md` to ensure landed features are listed with dates and 3-line test instructions.
3. Verify formatting and entries match all landed repository features.

### 2026-11-23 — Add era-specific architecture sets to realm.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/realm.ts` for era-specific building geometries (e.g. pyramids, pagodas, colosseum).
3. Render a scene with an era set (e.g. `egypt` or `rome`) and verify the corresponding architecture appears in 3D.

### 2026-11-23 — Add distant background layers (mountain ridges, cloud banks, bird flocks) to outdoor locations in world.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/world.ts` for outdoor location distant background rendering.
3. Render an outdoor scene and verify far mountain ridges, cloud banks, and bird flocks line the horizon.

### 2026-11-23 — Add 20 verbs and natural poses to pose2d.ts and map in castPerf.ts and VERB_ALIASES
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/pose2d.ts` and `castPerf.ts` for the 20 newly added verbs (ride, row, sail, etc.).
3. Verify character pose calculation resolves without errors for all added verbs in story scripts.

### 2026-11-22 — Add camera-matched film grain, light bloom on bright props, and close-up focus blur in StoryHybrid.tsx
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/StoryHybrid.tsx` for SVG film grain, light bloom filter, and close-up focus blur.
3. Render a close-up shot and verify background blur applies while character lines remain sharp.

### 2026-11-22 — Add procedural architectural 3D builders in props3d.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Check `remotion/src/videos/story/props3d.ts` for temple, obelisk, sphinx, and columnrow builders.
3. Plan a story with desert/egypt elements and verify ancient architectural models render in Three.js.

### 2026-11-22 — Add head shading and darker hair line in InkStickman.tsx
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/InkStickman.tsx` for radial head shading gradient and hair shadow line.
3. Render any stickman character and verify soft gradient depth on the head and dark line under the hair.

### 2026-11-22 — Add garment shading and lit-edge rim strokes in InkGarments.tsx
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/InkGarments.tsx` for light-opposite linear gradient overlays and lit rim strokes.
3. Render character tunics/shirts and verify directional shading with lit-edge highlights.

### 2026-11-21 — Replace town plaza ground with textured cobblestone and grass planes using remotion/public/tex/*.jpg and retune camera char framing
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/realm.ts` for `TEX.cobblestone` and `TEX.grass` assignments.
3. Render town plaza scene and verify textured ground surfaces and full-body character framing without bottom cropping.

### 2026-11-21 — Add soft ground contact shadow ellipse under character feet in InkStickman.tsx
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/InkStickman.tsx` for the foot contact shadow SVG ellipse element.
3. Render a scene with grounded characters and verify translucent ground contact shadows rendered under their feet.

### 2026-11-21 — Add 3-shot sea arrival sequence for sea crossing narrations in plan_story.py
How to test:
1. Run `python remotion/scripts/plan_story.py` on a narration script mentioning sea voyage.
2. Inspect generated storyboard sequence for wide fleet, coast pull-in, and beach disembarkation shots.
3. Verify camera shot sequence transitions seamlessly across all 3 sea arrival frames.

### 2026-11-21 — Procedural galleon in ships3d.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/ships3d.ts` for `buildGalleon` procedural mesh assembly.
3. Render a ship or ocean scene and verify 3D galleon with hull, deck, masts, fluttering sails, and rigging.

### 2026-11-20 — Validate generated texture image outputs
How to test:
1. Run `python remotion/scripts/story_assets.py --test` or run texture generator scripts.
2. Inspect `remotion/public/tex/` to ensure saved JPEG textures exist at expected resolutions (1024x1024 / 1536x768).
3. Verify image decoding validates valid JPEGs before completing asset generation.

### 2026-11-20 — Make story texture generation demand-driven
How to test:
1. Run `python remotion/scripts/story_assets.py` against a planned storyboard.
2. Verify script identifies only missing required textures and invokes generation provider chain.
3. Confirm unnecessary texture downloads are skipped.

### 2026-11-20 — Implement 3D weather/season particles, fog, sky color, and ground tint in world.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/world.ts` for weather particles (rain/snow/leaves/petals) and season tints.
3. Render scenes with weather or season tags and verify matching particle effects, sky gradient, and ground tinting.

### 2026-11-20 — Make town, city, and village locations denser and more believable in realm.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/realm.ts` for `buildTown` density, market stalls, wells, and chimneys.
3. Render a town center scene and confirm dense procedural layout with houses, streets, and props.

### 2026-11-20 — Add zero-cost cinematic finishing pass to StoryHybrid.tsx
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/StoryHybrid.tsx` for post-processing overlay elements.
3. Render a story frame and verify mood color grading, radial vignette, light film grain, and SVG bloom overlay.

### 2026-11-20 — Slow camera moves to 60% speed in camera.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/camera.ts` for minimum shot lengths (2.2s) and 1.6x push/pull duration scaling.
3. Render a multi-shot video and verify camera movement speed is smooth and paced appropriately.

### 2026-11-20 — Redesign InkStickman faces with expressive eyes, brows, nose line, distinct mouth shapes, and talking animation
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/InkStickman.tsx` for expressive eye pupils, blink logic, emotion brows, and mouths.
3. Render characters with various emotions and `isTalking=true` to verify talking mouth frames without speech bubbles.

### 2026-11-20 — Add qa_frames.mjs script for frame extraction and report generation
How to test:
1. Run `node remotion/scripts/qa_frames.mjs <video.mp4>`.
2. Check output directory for extracted 2s frames and generated `contact_sheet.jpg`.
3. Verify JSON report correctly flags flat/empty scenes with standard deviation < 12.

### 2026-11-19 — Add verify_sides.mjs check script for battle scenes
How to test:
1. Run `node remotion/scripts/verify_sides.mjs`.
2. Inspect script execution log to confirm side A (left facing right) and side B (right facing left) checks.
3. Verify battle scenes pass side-separation and era alignment checks.

### 2026-11-19 — Enforce camera discipline, narration beat sub-shots, and face-only depth-of-field in camera.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/camera.ts` for max 8-degree azimuth drift and face-only blur conditions.
3. Render wide and close shots to confirm wide shots are sharp throughout and close-ups focus on character faces.

### 2026-11-19 — Five-ship 3D fleet, curved sailing paths, and synchronized landing
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/world.ts` and `StoryHybrid.tsx` for 5-ship fleet positioning and movement.
3. Render a naval scene and verify galleon lead fleet, curved sailing trajectories, ship bobbing, and disembarkation.

### 2026-11-18 — Create Caption2D.tsx word-synced caption component
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/Caption2D.tsx` for word highlighting and lower-middle placement.
3. Render captions with narration timing and verify active word highlights in gold with crisp ink outlines.

### 2026-11-18 — Add 20 hand-held prop icons to Props2D.tsx
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/Props2D.tsx` for 20 SVG prop icons (torch, hourglass, compass, etc.).
3. Render characters holding props and verify icons align with hand grip origin (0,0).

### 2026-11-18 — Add accessory prop to InkStickman.tsx
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/InkStickman.tsx` for `accessory` prop rendering (glasses, crown, helmet, hat, etc.).
3. Render stickmen with different accessories and verify facial accessories hide when character faces backward.

### 2026-11-18 — Add hairStyle prop to InkStickman.tsx
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/InkStickman.tsx` for `hairStyle` options (short, bun, afro, long, cap, etc.).
3. Render stickmen with various hair styles and verify ink outlines layer accurately over head geometry.

### 2026-11-18 — Add era-specific costume entries in outfits.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/outfits.ts` for roman, greek, egypt, china, viking, samurai, medieval outfits.
3. Render characters with different era settings and verify era-appropriate cloth, trim, skin, and hair palettes.

### 2026-11-18 — Add 3D ocean-floor and canyon environment sets
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/worldgen.ts` for `ocean-floor` and `canyon` terrain configurations.
3. Render ocean-floor and canyon scenes to verify coral/shipwreck underwater features and stratified canyon walls.

### 2026-11-18 — Add space terrain set in worldgen.ts
How to test:
1. Run `cd remotion && npx tsc --noEmit`.
2. Inspect `remotion/src/videos/story/worldgen.ts` for `space` terrain preset.
3. Render space scene and verify starfield, ringed planet, orbital station, black hole, and asteroid belt without ground plane.
