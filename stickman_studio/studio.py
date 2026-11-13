"""Stickman Studio: AI-painted scenes + cinematic face-tracking camera + calm narration.

    python -m stickman_studio.studio examples/bamboo_story.json --format short

Story JSON:
{
  "title": "...", "character": "stickman description reused in every scene",
  "scenes": [{"narration": "...", "caption": "SHORT ON-SCREEN LINE", "image": "what the picture shows",
              "camera": "push_face | punch_face | pull_back | push_body | pan_left | pan_right | reaction | hold",
              "target": 0}]   # target = which head (left to right) the camera favours
}
"""
import argparse
import json
import math
import random
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from . import heads as H
from . import images as I
from . import voice as V

FPS = 24
OUT = {"short": (720, 1280), "long": (1280, 720)}
AUTO = ["push_face", "punch_face", "pull_back", "push_body", "reaction", "push_face", "pan_right", "punch_face"]


def smooth(t):
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def ease_out(t):
    t = min(1.0, max(0.0, t))
    return 1 - (1 - t) ** 4


def clamp(v, a, b):
    return max(a, min(b, v))


# ------------------------------------------------------------------ camera plan ----
def face_zoom(h, aspect):
    # head should fill roughly 60% of the frame width (or 38% of the height on wide frames)
    return clamp(0.60 / max(0.02, 2 * h[2]), 1.15, 3.1) if aspect < 1 else clamp(0.38 / max(0.02, 2 * h[2] * aspect), 1.15, 3.1)


def face_focus(h, z, aspect):
    # head sits about 40% from the top of the window (a little above centre, like a real close-up)
    return h[0], h[1] + (0.10 / z if aspect < 1 else 0.06 / z)


def plan_camera(move, heads, target, aspect):
    """Returns (z0, f0, z1, f1, mode) with f* = window centre in 0..1 image coordinates."""
    if not heads:
        heads = [(0.5, 0.42, 0.12)]
    h = heads[min(target, len(heads) - 1)]
    zf = face_zoom(h, aspect)
    ff = face_focus(h, zf, aspect)
    mid = (float(np.mean([x[0] for x in heads])), float(np.mean([x[1] for x in heads])))
    wide = (1.0, (0.5, 0.5))
    body = (clamp(zf * 0.55, 1.2, 1.8), (h[0], h[1] + 0.16 * (1 if aspect < 1 else 0.6)))
    if move == "punch_face":
        return 1.08, (h[0], h[1] + 0.05), zf * 1.12, face_focus(h, zf * 1.12, aspect), "punch"
    if move == "pull_back":
        return zf * 0.95, face_focus(h, zf * 0.95, aspect), 1.0, (0.5, 0.5), "smooth"
    if move == "push_body":
        return 1.0, (0.5, 0.5), body[0], body[1], "smooth"
    if move == "pan_left":
        return 1.3, (0.64, mid[1] + 0.05), 1.3, (0.36, mid[1] + 0.05), "smooth"
    if move == "pan_right":
        return 1.3, (0.36, mid[1] + 0.05), 1.3, (0.64, mid[1] + 0.05), "smooth"
    if move == "reaction":
        h0, h1 = heads[0], heads[-1]
        z = min(face_zoom(h0, aspect), face_zoom(h1, aspect)) * 0.92
        return z, face_focus(h0, z, aspect), z, face_focus(h1, z, aspect), "whip"
    if move == "hold":
        return 1.0, (0.5, 0.5), 1.09, (mid[0], 0.5 * 0.5 + mid[1] * 0.5), "smooth"
    return 1.12, (mid[0], mid[1] + 0.06), zf, ff, "smooth"  # push_face


def camera_at(plan, p, t, seed):
    z0, f0, z1, f1, mode = plan
    if mode == "punch":
        k = ease_out(p / 0.28) * 0.85 + smooth(p) * 0.15
    elif mode == "whip":
        k = smooth((p - 0.38) / 0.22)
    else:
        k = smooth(p)
    z = z0 + (z1 - z0) * k
    fx = f0[0] + (f1[0] - f0[0]) * k
    fy = f0[1] + (f1[1] - f0[1]) * k
    # handheld life + impact shake on punch-ins
    fx += math.sin(t * 1.3 + seed) * 0.003 / z
    fy += math.sin(t * 1.7 + seed * 2) * 0.003 / z
    if mode == "punch" and 0.0 < p < 0.22:
        a = (1 - p / 0.22) * 0.006 / z
        fx += math.sin(t * 90) * a
        fy += math.cos(t * 77) * a
    return z, fx, fy


# -------------------------------------------------------------------- captions ----
def _font(size):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"):
        if Path(f).exists():
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def caption_layer(text, index, size, fmt):
    """Returns (rgb float array, alpha float array) for the bottom caption band and scene tag."""
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    fs = int(w * (0.052 if fmt == "short" else 0.034))
    f = _font(fs)
    words, lines, cur = text.upper().split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) > w * 0.82 and cur:
            lines.append(cur)
            cur = wd
        else:
            cur = t
    if cur:
        lines.append(cur)
    lines = lines[:3]
    lh = int(fs * 1.28)
    band_h = lh * len(lines) + int(fs * 1.1)
    y0 = int(h * (0.80 if fmt == "short" else 0.86)) - band_h // 2
    for i in range(band_h):  # soft gradient band, like the reference video
        a = int(150 * min(1, i / (band_h * 0.25)) * min(1, (band_h - i) / (band_h * 0.2)))
        d.line((0, y0 + i, w, y0 + i), fill=(8, 6, 4, a))
    ty = y0 + int(fs * 0.55)
    for ln in lines:
        tw = d.textlength(ln, font=f)
        d.text(((w - tw) / 2, ty), ln, font=f, fill=(255, 255, 255, 255), stroke_width=max(2, fs // 12), stroke_fill=(10, 8, 6, 255))
        ty += lh
    tag = _font(int(w * 0.026))
    label = f"SCENE {index + 1}"
    tw = d.textlength(label, font=tag)
    d.rounded_rectangle((int(w * 0.03), int(w * 0.03), int(w * 0.03) + tw + int(w * 0.05), int(w * 0.03) + int(w * 0.06)),
                        radius=int(w * 0.03), fill=(20, 12, 4, 190))
    d.text((int(w * 0.055), int(w * 0.03) + int(w * 0.012)), label, font=tag, fill=(255, 226, 170, 255))
    arr = np.asarray(layer).astype(np.float32) / 255.0
    return arr[..., :3], arr[..., 3]


# ----------------------------------------------------------------------- render ----
def warp(src, z, fx, fy, out_size):
    ow, oh = out_size
    sh, sw = src.shape[:2]
    cw, ch = sw / z, sh / z
    cx = clamp(fx * sw, cw / 2, sw - cw / 2)
    cy = clamp(fy * sh, ch / 2, sh - ch / 2)
    k = ow / cw
    m = np.array([[k, 0, -(cx - cw / 2) * k], [0, k, -(cy - ch / 2) * k]], dtype=np.float32)
    return cv2.warpAffine(src, m, (ow, oh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def grade(frame):
    """Tiny vignette baked per frame via a cached mask."""
    return frame


def build(story_path, fmt="short", outdir="output", fps=FPS, voice=None, no_voice=False, scale=1.0):
    data = json.loads(Path(story_path).read_text(encoding="utf-8"))
    scenes = data["scenes"]
    character = data.get("character", "a cartoon stickman")
    size = (int(OUT[fmt][0] * scale), int(OUT[fmt][1] * scale))
    aspect = size[0] / size[1]
    out = Path(outdir)
    work = out / "work"
    work.mkdir(parents=True, exist_ok=True)

    plan = []
    for i, s in enumerate(scenes):
        print(f"[scene {i + 1}/{len(scenes)}] {s.get('caption', '')}")
        img_path = I.make_image(s, character, fmt, i, str(work / f"scene_{i:02d}.jpg"))
        img = Image.open(img_path).convert("RGB")
        hd = H.find_heads(img)
        print(f"  heads: {[(round(a, 2), round(b, 2), round(c, 2)) for a, b, c in hd]}")
        dur = float(s.get("duration", 4.0))
        wav = None
        if not no_voice and s.get("narration", "").strip():
            wav, vd = V.synth(s["narration"], work / f"voice_{i:02d}.wav", voice)
            dur = max(float(s.get("min_duration", 2.8)), vd + 0.45)
        src = np.asarray(img.resize((img.width * 2, img.height * 2), Image.Resampling.LANCZOS))
        move = s.get("camera") or AUTO[i % len(AUTO)]
        cam = plan_camera(move, hd, int(s.get("target", 0)), aspect)
        cap = caption_layer(s.get("caption", ""), i, size, fmt) if s.get("caption") else None
        plan.append(dict(src=src, cam=cam, cap=cap, dur=dur, wav=wav, seed=i * 1.7))

    total = sum(p["dur"] for p in plan)
    print(f"Total runtime {total:.1f}s")
    silent = out / f"video_{fmt}_silent.mp4"
    proc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{size[0]}x{size[1]}",
                             "-r", str(fps), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
                             "-movflags", "+faststart", str(silent)], stdin=subprocess.PIPE)
    for p in plan:
        n = max(1, int(round(p["dur"] * fps)))
        for f in range(n):
            pr = f / max(1, n - 1)
            z, fx, fy = camera_at(p["cam"], pr, f / fps, p["seed"])
            frame = warp(p["src"], z, fx, fy, size).astype(np.float32)
            if p["cap"] is not None:
                rgb, a = p["cap"]
                a = (a * min(1.0, (f / fps) / 0.3))[..., None]
                frame = frame * (1 - a) + rgb * 255.0 * a
            fade = min(1.0, f / (fps * 0.10), (n - f) / (fps * 0.10))  # tiny dip between scenes
            frame *= 0.82 + 0.18 * fade
            proc.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
    proc.stdin.close()
    proc.wait()

    final = out / f"video_{fmt}.mp4"
    voiced = [p for p in plan if p["wav"]]
    if voiced:
        parts = []
        for i, p in enumerate(plan):
            part = work / f"pad_{i:02d}.wav"
            src = str(p["wav"]) if p["wav"] else None
            if src:
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", f"apad=whole_dur={p['dur']:.3f}", "-ar", "24000", "-ac", "1", str(part)], check=True)
            else:
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", f"{p['dur']:.3f}", str(part)], check=True)
            parts.append(part)
        lst = work / "audio.txt"
        lst.write_text("".join(f"file '{x.resolve().as_posix()}'\n" for x in parts), encoding="utf-8")
        joined = work / "narration_raw.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(joined)], check=True)
        mastered = work / "narration.wav"
        V.master(joined, mastered)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(silent), "-i", str(mastered), "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(final)], check=True)
        silent.unlink(missing_ok=True)
    else:
        silent.replace(final)

    t = 0.0  # captions file for upload / subtitles
    lines = []
    for i, p in enumerate(plan):
        txt = scenes[i].get("narration", "").strip()
        if txt:
            fmt_t = lambda x: f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(x % 1 * 1000):03d}"
            lines.append(f"{len(lines) + 1}\n{fmt_t(t)} --> {fmt_t(t + p['dur'] - 0.1)}\n{txt}\n")
        t += p["dur"]
    (out / f"captions_{fmt}.srt").write_text("\n".join(lines), encoding="utf-8")
    (out / "title.txt").write_text(data.get("title", ""), encoding="utf-8")
    (out / "description.txt").write_text(data.get("description", ""), encoding="utf-8")
    print(f"DONE {final} ({total:.1f}s)")
    return final


def voice_samples(outdir="output/voices", text=None):
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    text = text or ("Nobody laughed at the farmer more than his neighbours. Five years of watering dirt. "
                    "But then, in just six weeks, the whole sky filled with green.")
    for v in V.SAMPLE_VOICES:
        try:
            raw = out / f"{v}_raw.wav"
            V._kokoro(text, raw, v)
            V.master(raw, out / f"{v}.wav")
            raw.unlink(missing_ok=True)
            print("sample", v)
        except Exception as exc:
            print("sample failed", v, exc)


def main():
    ap = argparse.ArgumentParser(description="Render a stickman story with AI scenes, cinematic camera and narration.")
    ap.add_argument("story", nargs="?")
    ap.add_argument("--format", choices=["short", "long"], default="short")
    ap.add_argument("--outdir", default="output")
    ap.add_argument("--voice", default=None)
    ap.add_argument("--no-voice", action="store_true")
    ap.add_argument("--scale", type=float, default=1.0, help="1.5 renders 1080x1920")
    ap.add_argument("--voice-samples", action="store_true")
    a = ap.parse_args()
    if a.voice_samples:
        voice_samples(str(Path(a.outdir) / "voices"))
        return
    build(a.story, a.format, a.outdir, voice=a.voice, no_voice=a.no_voice, scale=a.scale)


if __name__ == "__main__":
    main()
