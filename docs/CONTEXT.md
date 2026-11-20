### 2026-11-20 — Implement 3D weather/season particles, fog, sky color, and ground tint in world.ts
- Updated `remotion/src/videos/story/world.ts`, `effects.ts`, `types.ts`, `worldgen.ts`, and `plan_story.py` to support comprehensive weather (rain, snow, storm lightning flashes, sandstorm, mist) and season (spring petals, autumn falling leaves, winter snow-covered terrain ground tint) effects as 3D particles/fog with matching sky color and ground tint.
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` successfully with zero errors.

### 2026-11-20 — Make town, city, and village locations denser and more believable in realm.ts
- Updated `remotion/src/videos/story/realm.ts` to add a rich procedural `buildTown` function and integrated it at the town/village center `(0,0)`, featuring cobblestone streets, houses with varied heights and pitched/gabled/flat roofs, canopy market stalls with goods, stone wells, perimeter fences, lamp posts, people-scale props (barrels and crates), and chimney smoke stacks.
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` successfully with zero errors.

### 2026-11-20 — Add zero-cost cinematic finishing pass to StoryHybrid.tsx
- Updated `remotion/src/videos/story/StoryHybrid.tsx` with a low-cost SVG/CSS post-processing finishing layer: mood-based colour grading (warm golden for epic/dawn/dusk, cool blue desaturated for sad/tragedy), radial vignette gradient, lightweight film grain noise, soft SVG bloom filter, sunset light rays, and depth-based desaturation on distant cast members.
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` successfully with zero errors.

### 2026-11-20 — Slow camera moves to 60% speed in camera.ts
- Updated `remotion/src/videos/story/camera.ts` to slow every camera move to about 60% speed: minimum shot length 2.2 s, push/pull durations x1.6, beat interval at least 2.5 s (no more than one move per 2.5 s), and longer holds on faces and props.
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` successfully with zero errors.

### 2026-11-19 — Add verify_sides.mjs check script for battle scenes and opposing armies
- Added `remotion/scripts/verify_sides.mjs` to ensure battle scenes emit two distinct eras of extras (side A on the left facing right, side B on the right with `extrasEra` facing left, meeting in the middle).
- Verified `plan_story.py` and `StoryHybrid.tsx` for `story_alexander2.txt` battle scenes.
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` successfully with zero errors.

### 2026-11-19 — Verify character contact shadows in StoryHybrid
- Verified soft radial elliptical contact shadows beneath every projected ink character and extra in `remotion/src/videos/story/StoryHybrid.tsx` and marked task complete in work queue.
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` successfully with zero errors.

### 2026-11-19 — Enforce camera discipline, narration beat sub-shots, and face-only depth-of-field in camera.ts
- Updated `remotion/src/videos/story/camera.ts` to enforce strict camera discipline: steady angle with azimuth drift `<= 8` degrees per shot, sub-shot derivation from narration beats / word timings, and depth-of-field / background blur restricted strictly to face and upper close-ups (zero on wides or floors).
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` successfully with zero errors.

### 2026-11-19 — Verify five-ship 3D fleet, curved sailing paths, and synchronized landing proof
- Verified five-ship 3D fleet with hero galleon, curved sailing paths, ship bob/roll, coast arrival, synchronized wide/orbit/settle camera choreography in `world.ts` + `StoryHybrid.tsx`, and ink soldier beach disembarkation.
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` successfully with zero errors.

### 2026-11-19 — Verify animated 3D water surfaces, fleet arrival, and strict TypeScript proof
- Verified that sea, connected-realm, generic ocean/lake/coast, river, and ocean-floor scenes utilize animated 3D water surfaces, horizon/coast, five-ship fleet with hero galleon, synchronized camera choreography, and ink soldier beach disembarkation.
- Ran `cd remotion && npm install --no-audit --no-fund && npx tsc --noEmit` with zero errors.

### 2026-11-19 — Verify 3D depth, shadow maps disabled, and strict TypeScript proof passed
- Verified strict TypeScript compilation with `npx tsc --noEmit` and render proof: shadow maps disabled, hemisphere/warm key lighting and film grade retained, FogExp2 distance fog, camera-space vignette, city-building base darkening, contact blobs under 3D props and radial contact shadows beneath ink characters.

### 2026-11-18 — Extend plan_story.py auto models & icons and Props2D fallback
- Extended `remotion/scripts/plan_story.py` so every noun, vehicle, or animal not in `props3d` gets an auto-generated procedural recipe (8-30 parts), and added an `icons` map (`name -> small SVG` with viewBox 0 0 100 100, ink outline `#1d1a20`, flat colours) for hand-held nouns.
- Updated `Props2D.tsx` so `PropIcon` fallback reads `board.icons` instead of rendering the generic letter tile. Verified clean TypeScript compilation with `npx tsc --noEmit`.

### 2026-11-18 — Fix scene-grade uniform type mismatch
- The era/season/weather grade in `world.ts` must blend against `THREE.Vector3` values because the shared `TONE.uLitCol` and `TONE.uShadeCol` uniforms are Vector3 instances in `remotion/src/videos/bridge/shade.ts`. Updated the blend targets to match those declared uniform types; grade values and blend weights are unchanged.
- The proof run at commit `4b558c3` failed at strict TypeScript checking because those targets were `THREE.Color`. This correction is in commit `fc33593`; a fresh run against the latest branch head is needed before claiming the check is fixed.

### 2026-11-18 — Final synced-branch 3D proof passed
- After syncing the latest main wardrobe/OpenCode changes, workflow run `44269012189` completed successfully: Remotion dependency install, strict `npx tsc --noEmit`, and both native-resolution worldgen proof renders passed.
- Inspected the resulting 1080×1920 ocean-floor and canyon stills from that run. The underwater preset has its own deep-water grade, light shafts, fish, rocks and foreground reef; the canyon preset has a rust floor, a continuous blue river above the floor plane, stratified gorge walls and a distant ridge.
- The StoryHybrid cast overlay is clipped to the portrait frame, avoiding the earlier off-frame character spill.
- PR #7 remains a draft. This validates the two environment proof frames, not a complete rendered story or final video.

### 2026-11-18 — Record verified 3D worldgen proof and main sync
- Production proof workflow run `44268655476` completed successfully: dependency install, `npx tsc --noEmit`, and native-resolution still renders for the ocean-floor and canyon presets all passed.
- Inspected both generated 1080×1920 stills. The ocean-floor frame shows the underwater gradient, light shafts, fish, rocks and foreground coral; the canyon frame shows the rust floor, continuous blue river, opposing stratified walls and rear ridge.
- The final river-height correction is included in that successful proof run. A second run against the subsequently merged main wardrobe updates has also passed TypeScript and is finishing its duplicate render/upload step.
- The branch has been synced with the latest `main` updates, including `outfits.ts`, `Caption2D.tsx`, `Props2D.tsx`, `InkStickman.tsx` and the OpenCode queue. It is currently 0 commits behind `main`; PR #7 remains a draft and is not merged.
- These are two proof stills, not a full-story animation review or final video approval.

### 2026-11-18 — Add era-specific costume entries in outfits.ts
- Added complete era costume mappings and palette entries in `remotion/src/videos/story/outfits.ts` for roman, greek, egypt, china, viking, samurai, medieval, space, and ocean-explorer with distinct cloth/trim/skin/hair palettes while preserving the `outfitFor` signature. Verified clean TypeScript compilation.

### 2026-11-18 — Keep the river visible above the raised canyon floor
- The raised rust floor resolved the z-fighting, but the new still showed the river plane hidden just below the overlay's top surface.
- Lifted the river ribbon above the canyon floor so the water remains clearly visible after the depth correction.
- The final proof run will verify both the rust floor and the continuous blue river together.

### 2026-11-18 — Resolve canyon floor z-fighting
- The proof still showed the generic yellow base ground through the rust canyon overlay because both surfaces were coplanar.
- Lifted the canyon floor overlay slightly above the shared ground plane and raised the river ribbon above that surface to prevent z-fighting/occlusion.
- Strict TypeScript and native-resolution stills are being rerun for this correction.

### 2026-11-18 — Warm the canyon floor and remove generic specks
- The canyon proof still carried generic parallax dots that read as rendering noise on the open ground, and the floor skewed too yellow.
- Added a dedicated rust-red canyon floor tone and disabled generic parallax markers for canyon scenes.
- The smooth-river proof render will confirm the complete updated canyon composition.

### 2026-11-18 — Smooth the canyon river channel
- The rendered river still showed the hard stair-step joins from separate box segments.
- Replaced the segmented strip with a single triangulated winding ShapeGeometry ribbon so its banks read as one continuous channel.
- This is a geometry-only refinement; final approval still depends on the latest proof render.

### 2026-11-18 — Remove canyon settlement clutter and shape the rear ridge
- The first canyon revision made the opposing walls visible, but the rear escarpment still read as a flat retaining wall and the stone-age dressing added unrelated ground blocks.
- Replaced the rear wall with a jagged natural ridge and suppressed terrestrial settlement dressing for canyon scenes as well as open-water scenes.
- The canyon proof now focuses on the gorge, strata and river rather than buildings or props.

### 2026-11-18 — Create Caption2D.tsx word-synced caption component
- Created remotion/src/videos/story/Caption2D.tsx: word-synced caption component displaying 1-3 words at a time in bold white with a thick black outline in the lower-middle area, highlighting the active word in gold. Pure React with zero dependencies. Verified clean TypeScript compilation.

### 2026-11-18 — Enrich the ocean-floor foreground
- The underwater still showed an overly empty green-tinted seabed with distant-only reef detail and generic parallax specks.
- Added a muted seabed material, larger foreground coral fans around the cast and removed the generic ground specks from the ocean-floor preset.
- The underwater lighting remains cool; the next native-resolution render will confirm whether the sand and reef now separate clearly.

### 2026-11-18 — Rebuild canyon geometry after native-resolution review
- The first proof render showed the canyon's side walls were outside the useful camera framing and the oversized hoodoos dominated the shot.
- Rebuilt the set around tall opposing stratified cliff walls, a closing rear escarpment, a continuous overlapping river ribbon and smaller talus rocks.
- The revised layout is intended to read as a gorge from the default StoryHybrid wide shot; new native-resolution frames are required before visual acceptance.

### 2026-11-18 — Refine underwater atmosphere and portrait-frame proof
- Native-resolution proof stills exposed a terrestrial sky treatment on the ocean-floor preset. Added a deep teal underwater sky gradient, cooler underwater key/fill light and nearer teal fog while preserving night treatment.
- Tightened the StoryHybrid cast overlay to clip projected people to the portrait frame, preventing off-frame extras from leaking beyond the composition.
- Updated the proof board to suppress background extras and use low-profile stone-age dressing for the canyon shot so the terrain silhouettes remain visible.
- These are render-driven refinements; the revised native-resolution proof stills must be inspected before visual approval.

### 2026-11-18 — Keep land settlements out of underwater and open-ocean sets
- `drawWorld` previously layered the default era/region settlement onto every non-space terrain, which would place huts or buildings on the seabed and open water.
- Suppressed terrestrial settlement generation for `ocean` and `ocean-floor`; coastal and river settlements remain available.
- The 3D proof render is intended to catch remaining composition issues; visual acceptance remains pending.

### 2026-11-18 — Add 20 hand-held prop icons to Props2D.tsx
- Added 20 hand-held 2D prop icons (torch variants, hourglass, compass, trumpet, drum, lute, fishing rod, net, plate of meat, jug, quill+inkpot, key ring, magnifier, lantern, whistle, bell, candle, paintbrush, spoon, wheel) in clean ink outline style following the grip-origin convention `(0,0)`. Verified clean TypeScript compilation.

### 2026-11-18 — Fix scene-grade uniform type mismatch
- The new scene-aware grading in `world.ts` lerps Three.js vector uniforms; the first CI run exposed that its target values were incorrectly typed as `THREE.Color`.
- Replaced those targets with normalized RGB `THREE.Vector3` values, preserving the intended warm/cool grade adjustments while matching the uniform types.
- The initial strict TypeScript run failed on this issue; the updated branch is being rechecked. No visual pass is claimed yet.

### 2026-11-18 — Add `accessory` prop to InkStickman.tsx
- Added `accessory` prop (`"none" | "glasses" | "monocle" | "crown" | "helmet" | "turban" | "headwrap" | "hat" | "beard" | "moustache"`) to `InkStickman.tsx`, drawing each accessory in clean ink outline style inside the head group and hiding facial accessories when `back` is true. Verified clean TypeScript compilation.
### 2026-11-18 — Add `hairStyle` prop to InkStickman.tsx
- Added `hairStyle` prop supporting `"short" | "bun" | "afro" | "long" | "cap" | "bald" | "curly" | "braids"` to `InkStickman.tsx`, drawing each style in ink outline over the head while keeping the existing `hair` color prop and preserving body geometry. Verified clean TypeScript compilation.

### 2026-11-18 — Add production-branch 3D worldgen verification workflow
- Added `.github/workflows/worldgen-check.yml`, which runs the strict Remotion TypeScript check for the 3D story pipeline and renders native-resolution proof stills for both the ocean-floor and canyon presets.
- The proof workflow uses the current PR branch/PR target instead of checking out the obsolete `reference-style-pass-01` branch used by the older world-render workflow.
- CI results and rendered frames must still be inspected before claiming the environments are validated; this commit adds the verification path, not a claim that it has passed.

### 2026-11-18 — Port reusable village palette and prop art into the 3D pipeline
- Ported the vivid blue-sky / golden-earth / near-black ink palette from the legacy illustrated pass into the shared 3D world palette in `worldgen.ts`.
- Ported the reusable chicken-village coop and chalkboard prop concepts into procedural Three.js models in `props3d.ts`, with aliases and default heights. Existing chicken, egg and fire models remain available.
- The flat 2D village backdrops and inline Story2D prop renderer are not carried into production. Legacy PRs #4, #5 and #6 are superseded by the StoryHybrid/3D work; reusable pieces are consolidated here.

### 2026-11-18 — Add signature details to deep-space and underwater sets
- Underwater preset now includes a broken shipwreck frame, hydrothermal vent with animated plume, anglerfish lure light and deterministic rising bubbles alongside the reef, fish and light shafts.
- Deep-space preset now includes soft layered nebula volumes behind the ringed planet, orbital station, black hole and asteroid belt.
- Added bubble/plume motion as pure functions of scene time so arbitrary frame seeking remains deterministic. Still requires native-resolution render review and strict typecheck.

### 2026-11-18 — Add a dedicated deep-space 3D set
- Added a `space` terrain preset in `worldgen.ts`: deterministic starfield, ringed planet, orbital station with solar wings, black hole/accretion disc and a moving asteroid belt. It bypasses the terrestrial ground/settlement generator so space scenes do not inherit a floor.
- Planet, disc and asteroid motion are functions of scene time for frame-exact seeking; existing `env: ["space"]` effects continue to provide the camera-relative star/planet lighting layer.
- This is a reusable 3D set preset, not yet visually approved. TypeScript and native StoryHybrid stills remain required.

### 2026-11-18 — Grade the 3D world per era, season and weather
- In `world.ts`, added restrained scene-driven tone grading: historical eras lean warm, Viking/war/space/future eras lean cool, winter shifts cooler and slightly desaturates, autumn warms, spring lifts green, and rain/storm/drought adjust saturation and tint.
- In `worldgen.ts`, drought now emits deterministic drifting dust particles in addition to the grade. Existing rain, storm, snow, fog and wind paths remain intact.
- This changes the 3D world lighting/material treatment only; the 2D ink character overlay remains separate. Visual review is required to ensure each grade remains subtle and readable.

### 2026-11-18 — Add transport infrastructure to 3D world presets
- Added city street grids with lane markings, junction crossings, sidewalks, street furniture and mid-rise blocks; railway track pairs with sleepers/platform/canopy; airport runway markings, terminal and control tower; and harbour quay, water inlet, containers, bollards and gantry cranes.
- These are static 3D route/set pieces. Existing `PropDef.from/to` and `props3d.ts` vehicle models remain the mechanism for staging moving cars, trains, aircraft and ships along authored scene coordinates; no new autonomous traffic system is claimed.
- Static source delimiter checks pass. TypeScript and StoryHybrid render QA remain pending.

### 2026-11-18 — Extend 3D era coverage to China, India and frontier settings
- Added Great Wall/pagoda, Indian temple, Wild West frontier street, pirate harbour/rigging, and WWI trench-set silhouettes. Added `space` and `egypt` aliases alongside the explicit `space-age` and `egyptian` era names.
- Kept all new geometry in `worldgen.ts` and within the shared palette. No character/action or legacy 2D backdrop files changed.
- Static delimiter/palette-reference checks pass. This is not a substitute for the required project TypeScript check or rendered visual QA, which remain pending.

### 2026-11-18 — Refine StoryHybrid caption treatment
- Kept the established white lettering with a heavy ink outline and lower-safe-area placement, while making caption typography respond to scene era: a restrained serif treatment for historical eras and the bold sans treatment for modern/futuristic scenes.
- Night/space scenes receive a cool restrained glow; all captions now have a subtle translucent backing for contrast, with slightly tighter sizing for longer words.
- Caption work is limited to the StoryHybrid overlay; character projection and rig code are unchanged. Visual acceptance still depends on native-resolution still review, especially hand/face clearance.

### 2026-11-18 — Expand 3D era architecture presets
- Extended the procedural 3D settlement vocabulary with dedicated Viking longhouse/longship dressing, Renaissance palazzo and dome, Victorian terraces and street lamps, 1920s stepped skyline, WWII defensive emplacement, near-future towers/elevated transit, space-age landing pad/habitats, Egyptian pyramidal/obelisk forms, and Roman/Greek civic architecture.
- Era additions stay inside the established six-colour world palette and are built in the shared `worldgen.ts` 3D environment layer; no flat backdrop or character files were touched.
- These are procedural first-pass silhouettes. Strict TypeScript and native StoryHybrid still review remain required; historical accuracy, camera framing and lighting need visual QA.

### 2026-11-18 — Add 3D ocean-floor and canyon environment sets (ChatGPT)
- Followed the Nov 18 owner handoff: production world is Three.js StoryWorld rendered through StoryHybrid; Story2D remains legacy and was not changed in this pass. Character rig, pose/action system, wardrobe and Claude QA files were left untouched.
- Extended `worldgen.ts` with dedicated `ocean-floor` and `canyon` terrain presets. Ocean-floor dressing includes sandy seabed, rock scatter, branching coral, small animated fish schools, translucent light shafts and an animated translucent water sheet. Open-water/coast/river scenes now have a broader water body and animated wave marks. Canyon dressing adds stratified opposing cliff walls, a winding river and foreground hoodoo forms.
- This is an incremental set-dressing pass, not universal world coverage or visual acceptance. Strict `cd remotion && npx tsc --noEmit` and native-resolution StoryHybrid still review are still required. No video is claimed.
- 2026-11-20 Claude: Cloudflare Workers AI verified (17 textures/skies generated into remotion/public/tex). Pollinations sand_dune had a watermark: regenerated via Cloudflare. HF_TOKEN fallback added to gen_assets.py.
- 2026-11-20 Claude: gen_assets.py providers now Cloudflare -> OVHcloud SDXL (free, no key) -> Stable Horde (free anon key); Hugging Face and Pollinations removed per owner.
- 2026-11-20 Claude: gen_assets.py providers: Cloudflare -> OVHcloud SDXL (free, no key) -> Stable Horde (free anon key); Hugging Face and Pollinations removed per owner.
