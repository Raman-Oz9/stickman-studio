// Studio engine core: canvas, camera, colour helpers, noise.  Global namespace: ST
var ST = (function () {
  var EXPORT = /[?&]export/.test(location.search);
  var cv = document.getElementById("c"), ctx = cv.getContext("2d");
  var VH = 1280, VW = 720, SC = 1;
  function resize() { var w = window.innerWidth, h = window.innerHeight; var dpr = EXPORT ? 1 : Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + "px"; cv.style.height = h + "px"; SC = cv.height / VH; VW = cv.width / SC; }
  resize(); window.addEventListener("resize", resize);

  // ---- colour helpers ----
  function hex(c) { if (c[0] === "r") { var m = c.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]]; } if (c[0] !== "#") return [128, 128, 128]; if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function rgb(a) { return "rgb(" + (a[0] | 0) + "," + (a[1] | 0) + "," + (a[2] | 0) + ")"; }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return rgb([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function dk(c, k) { return mix(c, "#4a2455", Math.min(1, k * 0.95)); }
  function lt(c, k) { return mix(c, "#fff6dc", k); }
  function alpha(c, a) { var x = hex(c); return "rgba(" + x[0] + "," + x[1] + "," + x[2] + "," + a + ")"; }
  // scene ambient tint applied to flat colours so every shape shares the same light
  var AMB = { c: "#ffffff", k: 0 };
  function tint(c) { return AMB.k > 0 ? mix(c, AMB.c, AMB.k) : c; }

  // ---- math / noise ----
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function easeOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function noise1(x, seed) { var s = seed || 1; return Math.sin(x * 1.0 + s) * 0.5 + Math.sin(x * 2.13 + s * 1.7) * 0.28 + Math.sin(x * 4.37 + s * 2.9) * 0.14 + Math.sin(x * 8.9 + s * 0.3) * 0.06; }

  // ---- camera ----
  var cam = { x: 0, y: -170, z: 1.2, roll: 0, shake: 0 };
  var time = 0;
  var HOR = 0.46; // screen anchor of the camera point
  // run fn in the coordinate frame of a parallax layer p (0 = infinitely far, 1 = character plane, >1 foreground)
  function layer(p, fn, opt) {
    ctx.save();
    var zl = 1 + (cam.z - 1) * (0.25 + 0.75 * Math.min(1.2, p));
    var sh = cam.shake, sx = sh ? Math.sin(time * 61) * sh : 0, sy = sh ? Math.cos(time * 53) * sh : 0;
    ctx.translate(VW / 2 + sx, VH * HOR + sy); if (cam.roll) ctx.rotate(cam.roll);
    ctx.scale(zl, zl); ctx.translate(-cam.x * p, -cam.y * p);
    fn(); ctx.restore();
  }
  function screenOfWorld(wx, wy) { var zl = cam.z; return [VW / 2 + (wx - cam.x) * zl, VH * HOR + (wy - cam.y) * zl]; }
  // visible world rectangle for a layer (for filling)
  function viewRect(p) { var zl = 1 + (cam.z - 1) * (0.25 + 0.75 * Math.min(1.2, p)); return { l: cam.x * p - VW / 2 / zl - 40, r: cam.x * p + VW / 2 / zl + 40, t: cam.y * p - VH * HOR / zl - 40, b: cam.y * p + VH * (1 - HOR) / zl + 40, z: zl }; }

  // ---- drawing helpers ----
  function path(pts, close) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
  function smooth(pts, close) { // catmull-rom through points
    ctx.beginPath(); var n = pts.length; ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 0; i < n - 1; i++) { var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)]; ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
    if (close) ctx.closePath();
  }
  function vgrad(y0, y1, stops) { var g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
  function hgrad(x0, x1, stops) { var g = ctx.createLinearGradient(x0, 0, x1, 0); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
  function rgrad(x, y, r0, r1, stops) { var g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
  function rrect(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  return { EXPORT: EXPORT, cv: cv, ctx: ctx, get VW() { return VW; }, get VH() { return VH; }, get SC() { return SC; }, hex: hex, rgb: rgb, mix: mix, dk: dk, lt: lt, alpha: alpha, AMB: AMB, tint: tint,
    lerp: lerp, clamp: clamp, ease: ease, easeOut: easeOut, rng: rng, noise1: noise1, cam: cam, layer: layer, screenOfWorld: screenOfWorld, viewRect: viewRect,
    path: path, smooth: smooth, vgrad: vgrad, hgrad: hgrad, rgrad: rgrad, rrect: rrect, resize: resize, get time() { return time; }, set time(v) { time = v; }, HOR: HOR };
})();
