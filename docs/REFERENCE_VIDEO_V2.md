# Reference video v2 (owner's 2D/3D "chicken & rich" story)

Files: `docs/reference/reference-video.mp4` (720x1280, 73 s, with audio), `docs/reference/reference-video-contact-sheet.jpg` (27 frames, 3 s apart), `docs/reference/video-frames/t01..t73.jpg` (single frames).
ALWAYS look at the contact sheet before touching characters, backdrops, camera or captions. Owner wants this kind of animation, rebuilt in 2D, plus our own unique twist.

## What the reference does (copy the quality, not the pixels)
- **Characters**: big bean/egg-shaped heads (head ~ 60% of visible body), thick black outline, flat skin tone, tiny dot/line eyes, small expressive brows and mouth, hair as a flat cap/bun/side-part, monocle/hat props. (That creator keeps people inside barrels. WE DO NOT: owner rejected it. Ours are FULL-BODY articulated humans that walk, pick up, read, write, drink, point, run, sit, etc.) Rich man = green waistcoat, gold chain, monocle.
- **Animals as co-stars**: chickens/roosters with human acting (teacher chicken with pointer at a chalkboard, rooster hugging a head).
- **Props with story meaning**: chalkboard charts (RICH/POOR graph, 2=egg, 3=egg), gold-coin piles, light bulb for "idea", protest signs (WE WANT EGGS / UNFAIR! / BOO!), coops, barrels, fire at night.
- **World**: warm golden-hour palette, cobblestone streets, tall European houses with red shutters, sky with soft clouds, tilt-shift look (blurry far/near, sharp middle), vignette. Night scene = blue sky + moon + orange fire glow.
- **Camera**: constant motion. Hand descends from sky (god-view reveal), top-down/aerial pull-backs to show scale (rows of coops), slow push-ins on faces, whip-pans, depth-of-field blur on foreground. Hard cuts + cross-dissolves on idea changes.
- **Captions**: 1-3 words at a time, bold white with thick black outline, lower-middle, word-synced. Never covers faces.
- **Pacing**: a new picture every ~2-3 s; every noun said gets shown (chicken, eggs, hunger, night, fire).

## 2D rebuild rules for Remotion/SVG
1. Heads: big rounded bean (rx<ry), outline 7-9 px, face = dots + brows + mouth only. Build `BeanHead` (done in InkStickman via head scale; keep expanding).
2. NO barrels. Full-body characters with our own geometry; reference is style only. Engine = script -> storyboard -> action library (verbs become poses) so any story (history, space, person) is performed by the cast.
3. Fake the 3D: layered parallax backdrops, ground plane with perspective cobble lines, SVG blur filter on far/near layers, vignette, warm light gradient overlay, drop shadows under props.
4. Camera per the cinematic skill: aerial pull-backs, push-ins to faces, whip-pans, descending-hand reveal. Add a slow handheld drift to every shot.
5. Captions: word-synced, 1-3 words, white + black stroke.
6. Props that tell story: chalkboard charts, signs, coin piles, bulbs.

## Unique twist (all three agents add this; do not just clone)
- Our own hook: **ink-line sketch + painted warm light**: thick marker outlines on soft painted gradients with film grain, a signature "ink splash" transition between scenes, and a recurring mascot sidekick (small bird/crow) that reacts to each fact.
- Channel look must be recognisable in 1 frame: palette locked to warm gold / deep teal / ink black.
- Each agent should add one signature element per day and log it in `docs/CONTEXT.md`.

## Ownership
- Claude: character (bean heads, full-body rig, action library, script->action planner), QA, merges.
- ChatGPT: backdrops/props (cobble street, houses, coops, chalkboard, fire/night), palette, tilt-shift/vignette/grain layers.
- OpenCode: scoped issues via `/oc` (hair/hats/monocle, signs, coin piles, caption styling).
