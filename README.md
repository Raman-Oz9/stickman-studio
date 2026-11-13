# Stickman Studio

A zero-subscription-cost, open-source-first starter for producing stickman YouTube videos. It renders original 2D stickman scenes locally with Python and FFmpeg, creates thumbnails and SRT captions, optionally generates narration with Edge TTS, and includes an optional YouTube upload helper.

## Current capabilities
- Render a scene-based JSON story as a vertical YouTube Short (9:16) or landscape video (16:9).
- Build layered workshop, city/rooftop, forest and space environments, animated character poses, scene props and subtle camera drift from scene metadata.
- Use per-scene `setting`, `prop`, `shirt`, and `accent` fields to direct the visual storytelling.
- Generate a thumbnail and SRT captions.
- Optional narration using Edge TTS (internet/service availability and terms may change).
- Optional YouTube upload through OAuth and the official YouTube Data API.
- GitHub Actions workflow for manual or scheduled rendering; it uploads the rendered output as a workflow artifact.

## Honest limitations
This is a starter engine, not a finished AI video studio. The included script generator uses reusable templates, not an AI model. Visuals are procedural stickman scenes rather than a full character rig/editor. GitHub Actions quotas, YouTube API quota, and third-party voice availability apply. The workflow renders and stores artifacts; it does not automatically publish videos to YouTube by default.

## Requirements
- Python 3.11+
- FFmpeg installed and available on PATH
- Dependencies in `requirements.txt`

Install:
```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

## Render the example
```bash
python -m stickman_studio.cli render examples/sample_story.json --format short
```
For landscape, use `--format long`. Add `--voice` for optional narration. Output files are written to `output/`.

## Generate a starter script
```bash
python -m stickman_studio.cli generate-script --kind comedy --output examples/generated_story.json
```
Kinds: `comedy`, `lesson`, `action`, `facts`.

## YouTube upload (optional)
You must create a Google Cloud project, enable YouTube Data API v3, configure OAuth consent, and create a Desktop OAuth client. Keep OAuth client secrets and tokens out of Git. Uploads default to private; test before making anything public. See the CLI help for `auth-youtube` and `upload`.

## GitHub Actions
Every push affecting the animation engine, sample story, dependencies or workflow starts a prototype render automatically. You can also use Actions → Render Stickman Video → Run workflow to choose `short` or `long`; narration is optional. The workflow stores output as an artifact (it does not publish to YouTube). Scheduled runs are best-effort and subject to GitHub Actions plan limits.

## License
MIT. Check licenses and terms for any external voices, music, sound effects, fonts, or services you add.
