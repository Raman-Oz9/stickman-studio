# Agent instructions (OpenCode, Claude Code, ChatGPT)

Read `docs/CONTEXT.md` first: it holds the product requirements, architecture, current state and
change log. Update it in the same commit as every repository change.

Rules:
- Never ship or announce a video you have not checked frame by frame.
- Look: clean polished 2D, original ink stickman characters (round head, minimal face), cinematic
  camera per `docs/CINEMATIC_CAMERA_SKILL.txt`. No blocky 3D characters.
- Small commits; never replace another agent's file wholesale; merge hunks and keep both intents.
- Verify with `.github/workflows/illustrated-proof.yml` (strict tsc + stills) before pushing big changes.

Skills and references (all agents, including OpenCode, must read these before animation work):
- `.claude/skills/` is the canonical skill source for Claude Code. `.opencode/skills/` contains byte-for-byte mirrors for OpenCode discovery; keep both trees synchronized whenever a skill changes.
- `.claude/skills/cinematic-2d-storytelling-director/SKILL.md` and `.opencode/skills/cinematic-2d-storytelling-director/SKILL.md`: camera, shots, pacing.
- `.claude/skills/cartoon-audio-short/SKILL.md` and `.opencode/skills/cartoon-audio-short/SKILL.md`: narration, music and SFX levels (music/SFX about half the voice level).
- `docs/REFERENCE_VIDEO_V2.md` + `docs/reference/reference-video.mp4` + `docs/reference/reference-video-contact-sheet.jpg`: THE owner's reference animation (read/look first, always use it, add our unique twist)
- `docs/reference/ink-explainer/*.jpg`: the target look (round white head, minimal face, thin arms, mitten
  hands, sneakers, thick black outlines, flat vivid colours, detailed illustrated backdrops).
- `docs/WEEK_PLAN.md`: schedule, ownership, gates.
