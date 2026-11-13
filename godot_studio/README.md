# Godot Character Animation Prototype

This is a separate experimental renderer for Stickman Studio. It is deliberately kept beside the existing Python renderer until the rendered output is reviewed.

- Engine: Godot 4.7.2 (open source)
- Output target: vertical 720x1280 animation
- Character: layered cartoon-style hoodie character with articulated limbs, face, hair, clothing details and timed action changes
- Demo motion: enter/walk, jump, talking gestures, pointing, exit
- CI: rendered headlessly in GitHub Actions and encoded to MP4 with FFmpeg

The first pass is a visual/technical proof, not yet the finished production system. The production pipeline should only switch after the actual video is reviewed and approved.
