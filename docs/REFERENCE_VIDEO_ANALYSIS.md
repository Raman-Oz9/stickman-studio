# Reference video breakdown — first production pass

Source inspected: `VID_20261113_072039_529.mp4` (73.26 s, 1080×1920, 30 fps).
Sampling: contact sheets at 2-second and 1-second intervals. This is a visual beat map, not a claim that every individual frame has been exhaustively annotated.

## Visual identity to reproduce

- Bright, hand-illustrated 2D cartoon world: thick dark ink contours, warm cream/tan ground, saturated but controlled building colours, blue sky, simple cloud shapes, soft cast shadows.
- Character cards remain simple, expressive and readable: oversized heads, compact torsos, thin limbs, strong eyebrows/mouths, distinct hair/clothes/accessories.
- Props are oversized enough to read instantly but retain consistent scale: wooden barrels, coins, eggs, chickens, signs/boards and buildings.
- Backgrounds carry the story: coherent street/building facades, cobbled or tiled ground, farm plots, coops/interiors and repeated settlement layouts.
- Foreground/midground/background are clearly separated. Large readable shapes and clear silhouettes beat excessive tiny detail.
- Captions are compact white words with a dark outline, placed low enough to read but never over faces or the active prop.

## Camera / edit language

- Frequent motivated cuts, often around 1–2 seconds, rather than one continuous generic zoom.
- Establishing wides show the street/settlement and its layout; medium shots stage the character and prop; close-ups land on a reaction, egg/chicken, board or handoff.
- Strong high-angle / top-down reveals explain the arrangement of houses, barrels, people and farm plots.
- Fast push-ins and pull-backs are used for emphasis; overhead and aerial shots provide scale.
- Camera framing changes with the narration. The subject remains visible; prop inserts are tied to a character or a clear action rather than random isolated scenery.
- Location transitions use quick reframes/whip-like motion and then settle into a new, readable composition. Motion blur is brief and purposeful, not a substitute for a legible frame.

## Approximate beat map from 1-second samples

| Approx. time | Visual beat / camera treatment |
|---|---|
| 0–8 s | Colourful town street, wealth/coins, character reaction, explanatory board, then a high-angle settlement reveal. |
| 8–18 s | House and street context; overhead distribution of people/barrels; scale changes from wide layout to individual groupings. |
| 18–28 s | Open farm/desert-like ground with barrel groups; night campfire; dramatic close-up of a character. |
| 28–40 s | Daylight group shots; chicken/egg interactions; expressive medium and close shots of characters with birds. |
| 40–50 s | Relationship/breeding gag and lightbulb idea beat; group composition; small buildings/coop and chalkboard explanation. |
| 50–60 s | Interior coop/shelves with eggs and chicks; warm timber palette; close details then a wider interior view. |
| 60–73 s | Repeated farm/settlement structures, large overhead crowd/group layouts, building fronts, aerial pullbacks and a final wide scale reveal. |

## Implementation priorities for Stickman Studio

1. Preserve the existing original 2D ink character cards. Do not switch to 3D people.
2. Make camera cuts motivated by the active character/action; avoid cycling through arbitrary props that create empty tree, terrain or bag shots.
3. When a prop is near a character, frame both in a readable insert. Only use an isolated prop shot when the story explicitly calls for it.
4. Add stronger overhead and aerial establishing/reveal compositions for group layouts and settlement geography.
5. Improve illustrated-world colour/material treatment while keeping the current world/asset pipeline and checking stills before full renders.
6. Validate with the props-test stills, then inspect a full render frame-by-frame before calling it accepted.

## First code pass

- `camera.ts`: generic action-camera subjects now cycle through the lead and other cast members rather than every prop in the scene.
- `camera.ts`: an explicitly focused prop close-up keeps the nearest actor in frame when the prop is within 5.5 world units; framing distance expands with actor/prop separation.
- This is a targeted first pass, not the finished style conversion. Background illustration/material treatment, richer aerial coverage and character/prop action staging remain for subsequent passes.
