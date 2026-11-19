---
name: "cinematic-2d-storytelling-director"
description: "Direct illustrated 2D story videos with purposeful virtual-camera work: progressive push-ins, reaction close-ups, pull-backs, pans, elevated views, narration-led shots, captions and sound. Use for any stickman/cartoon storytelling video."
---

# Cinematic 2D Storytelling Director (Stickman Studio)

Turn a script into a directed illustrated video, never a slideshow. Default output: 9:16, 1080x1920, 30 fps, polished colourful 2D cartoon look, clear narration, subtle music, action-synced SFX. **Camera movement is the top priority.**

## Camera rules (highest priority)
Every move must reveal information, direct attention, follow an action or intensify a reaction. Never a repetitive automatic zoom.
- **Progressive push-in (wide to detail):** environment -> character -> upper body -> face -> eyes/mouth -> hands or key object. Continuous, ease-in/ease-out, let the viewer register the subject first. No jump to extreme close-up unless an abrupt dramatic cut is justified. Never crop essential face, hands or objects.
- **Reaction close-ups:** when a character discovers, is confused, frightened, excited, angry or surprised, the reaction is the visual event: quick push to the face/eyes/hands, hold long enough to read it, then cut or pull back. Vary size and angle between close-ups.
- **Pull-back (detail to context):** start on a face/hand/object, widen to body, neighbours, then the environment. It must reveal useful information and keep spatial continuity.
- **Pan:** across a group, or from a character to the object they indicate. Smooth, readable, subject never left out of frame.
- **Tracking:** move with a travelling subject, match its speed, no jitter, lag or shake.
- **Elevated / overhead / descending views:** explain layouts, crowds, settlements, scale; descend from overview to a subject. Clarify geography, not decoration.
- **Dynamic composition:** do not centre everything; use left/right placement, foreground subjects, background reactions. Keep headroom/space for captions, never covering faces, hands or key objects.

### Timing guide (starting values; the story decides)
| move | duration |
|---|---|
| quick reaction push-in | 0.4-0.8 s, fast but controlled, lands on the reaction |
| normal push-in | 1-2 s |
| slow dramatic push-in | 2-3 s with gentle settle |
| smooth pull-back | 1-2.5 s |
| overhead reveal | 1.5-3 s |
| tracking / pan | duration of the action |
| reaction hold | 0.7-1.5 s |

### Keyframes
Frame rate and camera timing are separate controls (30 fps: 2 s = 60 frames, 0.5 s = 15). For each shot define: start/end time, start and end camera position and scale, path, easing, followed subject, point of attention. Interpolate smoothly (ease in/out); faster moves only for surprise, urgency or a sudden reveal. Avoid excessive motion blur, random shake, mechanical repeated zooms and uncontrolled cropping.

## Characters
Large expressive heads, readable eyes/eyebrows/mouth, clear hands and limbs. Keep clothing, colours, proportions and features identical across shots. Use blinks, head tilts, glances, nods, pointing, gestures, turns, posture changes. Readable reactions (surprise, confusion, joy, sadness, frustration, curiosity, confidence, fear). Hands must visibly connect with objects; pointing must indicate the intended subject. No random movement that contradicts the narration.

## World and depth
Complete environments with foreground, readable middle ground (main action) and background that establishes location. Same layout whenever a location returns. Bright coherent cartoon lighting, soft shadows; adapt for day/night/interiors while keeping characters readable. Effects (clouds, dust, smoke, birds) must serve the story.

## Shot variation and editing
Vary extreme close-ups, close-ups, mediums, medium-wides, full-body, establishing wides, elevated/overhead, object-focused and group shots. Change framing when the narration changes focus. Hard cuts for new locations or ideas; smoother transitions for connected actions. No needless flashes, spins or flashy transitions, no repeated identical shots, no long stretches without new visual information. Never cut away before a reaction or action can be understood.

## Narration-led storytelling
Narration is the source of visual intent: show the person, object, comparison or action being mentioned. A new subject means a deliberate change of framing, camera attention or scene. For every sentence/beat plan: visual, character action, shot size, camera start/end, path, duration, easing, transition, caption. Close-ups for emotion and detail, wides for context.

## Captions and on-screen text
Clean, high-contrast, short captions in the lower-middle area, clear of faces/hands/key objects, highlight key words selectively, sync to narration. Only show text, numbers, labels that the script supports.

## Audio and pacing
Clear natural conversational narration. Music subtle, never competes with the narrator (music and SFX at about half the voice level). SFX synced to the actions they represent. Let important explanations and dramatic reactions breathe.

## Continuity
Same identity, clothing, proportions across scenes. Recurring objects recognisable and plausibly placed. Same location layout on return. No unexplained duplication, disappearance, teleportation or scale changes. Every camera move spatially understandable; do not cross positions confusingly.

## Final QC checklist
- Camera moves smooth, purposeful, varied.
- Push-ins reach meaningful faces/eyes/hands/objects.
- Pull-backs reveal useful context and keep spatial understanding.
- Pans and tracking follow the right subject or reveal.
- Elevated views clarify geography, groups, scale.
- No accidental cropping of essential subjects.
- Characters and object interactions consistent and readable.
- Every important narration beat has a visual.
- Captions and SFX synchronised.
- The result feels like one coherent illustrated film, not a slideshow.

If the production tool cannot execute a requested camera move, say so instead of pretending it was done. Prefer building from a shot timeline with exposed camera position, scale, keyframes, easing, shot boundaries and subject tracking.

## Where this lives in the stickman-studio repo
Full spec text: `docs/CINEMATIC_CAMERA_SKILL.txt`. Camera implementation: `remotion/src/videos/story/camera.ts` (levels env/char/upper/face/eyes/low/high, moves reveal/push/pull/pan/descend/orbit/hold, reaction push + hold). Storyboard planner: `remotion/scripts/plan_story.py`. Pipeline: workflow `story-video.yml` (script -> Gemini storyboard -> Kokoro narration -> sharded Remotion render -> music/SFX mix).