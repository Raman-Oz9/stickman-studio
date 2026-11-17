# Week plan (Tue 17 – Sun 22 Nov 2026): ship the 2D stickman story videos

Goal: an automated pipeline that turns a script into a polished 2D "Ink Explainer"-style stickman
video (references in `docs/reference/ink-explainer/`), directed by the skill in
`.claude/skills/cinematic-2d-storytelling-director/SKILL.md` (OpenCode: `.opencode/skills/`),
audio per `.claude/skills/cartoon-audio-short/`. Owner's verdict so far: faces OK, legs/bodies bad,
backdrops bland. Bar: first-class polish, nothing childish, every noun shown, every verb acted.

## Agents and ownership (read AGENTS.md first; log every change in docs/CONTEXT.md)
- **Claude Code**: character (`InkStickman.tsx`: poses, hair/hats, expressions, hand-object contact),
  QA of every render frame, merges, workflow health.
- **ChatGPT**: backdrops/props/palette (`worldgen.ts`, Story2D scene art), map mode, board JSON.
- **OpenCode** (`/oc <task>` on an issue): well-scoped tasks assigned by Claude/owner in issues;
  always opens a PR; never edits the other agents' files wholesale.

## Schedule
- Tue/Wed: character complete: hair/hats/outfits by role, walk/run/sit/ride/point/carry/throw poses,
  no knock-knees, feet planted. Backdrops move to vivid flat colour, thick black outlines (see refs).
- Thu: camera per skill (push-in to faces/hands, reaction holds, pull-backs, pans, tracking),
  word-timed cues for actions, captions in the lower third, music at 50% of voice, SFX synced.
- Fri: full 60 s test video from `remotion/story_world.txt`, frame-by-frame QA, fix list.
- Sat: pipeline automation (script -> board -> render -> upload + thumbnail), failure alerts.
- Sun: 3 finished sample videos, final QA, hand over.

## Gates (every PR / push)
1. `illustrated-proof.yml` passes (strict tsc + stills). 2. Stills viewed and compared with the
references. 3. CONTEXT.md updated. 4. Never send the owner a video that has not passed QA.
