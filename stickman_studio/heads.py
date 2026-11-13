"""Find the stickman heads in a scene image so the camera can push into faces.

Returns a list of (cx, cy, r) in 0..1 coordinates (r relative to image width), sorted left to right.
Gemini vision is used when GEMINI_API_KEY exists; otherwise an OpenCV white-circle heuristic.
"""
import io
import json
import os

import numpy as np
import requests
from PIL import Image


def _gemini(img):
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        return None
    buf = io.BytesIO()
    img.convert("RGB").resize((512, int(512 * img.height / img.width))).save(buf, "JPEG", quality=85)
    import base64
    prompt = ("Find the round white heads of every cartoon stickman character in this image. "
              'Reply with JSON only: [{"box_2d":[ymin,xmin,ymax,xmax]}] with coordinates normalised 0-1000, '
              "one box tightly around each head (the whole round face including its outline). Empty list if none.")
    for model in os.environ.get("HEAD_GEMINI_MODELS", "gemini-2.5-flash,gemini-2.5-flash-lite").split(","):
        try:
            r = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model.strip()}:generateContent",
                headers={"x-goog-api-key": key},
                json={"contents": [{"parts": [{"inline_data": {"mime_type": "image/jpeg",
                                                               "data": base64.b64encode(buf.getvalue()).decode()}},
                                              {"text": prompt}]}],
                      "generationConfig": {"responseMimeType": "application/json"}},
                timeout=60)
            if r.status_code != 200:
                continue
            boxes = json.loads(r.json()["candidates"][0]["content"]["parts"][0]["text"])
            heads = []
            for b in boxes:
                y0, x0, y1, x1 = [v / 1000 for v in b["box_2d"]]
                heads.append(((x0 + x1) / 2, (y0 + y1) / 2, max(x1 - x0, (y1 - y0) * img.height / img.width) / 2))
            if heads:
                return sorted(heads)
        except Exception:
            continue
    return None


def _heuristic(img):
    try:
        import cv2
    except ImportError:
        return []
    arr = np.asarray(img.convert("RGB"))
    small = cv2.resize(arr, (384, int(384 * arr.shape[0] / arr.shape[1])))
    hsv = cv2.cvtColor(small, cv2.COLOR_RGB2HSV)
    mask = ((hsv[..., 2] > 150) & (hsv[..., 1] < 90)).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    area_img = small.shape[0] * small.shape[1]
    found = []
    for c in cs:
        a = cv2.contourArea(c)
        if not (0.012 * area_img < a < 0.45 * area_img):
            continue
        p = cv2.arcLength(c, True)
        circ = 4 * np.pi * a / (p * p + 1e-6)
        (x, y), rad = cv2.minEnclosingCircle(c)
        fill = a / (np.pi * rad * rad + 1e-6)
        if circ > 0.35 and fill > 0.6:
            found.append((circ * a, x / small.shape[1], y / small.shape[0], rad / small.shape[1]))
    found.sort(reverse=True)
    return sorted((x, y, r) for _, x, y, r in found[:2])


def find_heads(img):
    return _gemini(img) or _heuristic(img)
