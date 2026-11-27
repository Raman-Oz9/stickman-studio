// Studio engine: story director (scenes, shots, choreography, API for the exporter)
(function () {
  var S = ST, ctx = S.ctx, W = WD, lerp = S.lerp, ease = S.ease, clamp = S.clamp, cam = S.cam;
  var EXPORT = S.EXPORT, $ = function (id) { return document.getElementById(id); };
  var cap = $("cap");

  // ---------- characters ----------
  var chars = {};
  function mk(id, key, o) { var c = { id: id, key: key, x: 0, y: 0, s: 1, face: 1, pose: "idle", ex: "neutral", t: Math.random() * 4, phase: Math.random() * 6, talk: false, look: [1, 0], item: null, shield: false, layer: 1, fall: 0, show: false }; for (var k in o) c[k] = o[k]; chars[id] = c; return c; }
  var A = mk("A", "alex", { item: null }), Q = mk("Q", "queen");
  var R = [1, 2, 3, 4, 5, 6].map(function (i) { return mk("R" + i, "red", { item: "spear", shield: true }); });
  var T = [1, 2, 3, 4, 5, 6].map(function (i) { return mk("T" + i, "teal", { item: "spear", shield: true, face: -1 }); });
  var ALLC = Object.keys(chars).map(function (k) { return chars[k]; });
  function resetChars() { ALLC.forEach(function (c) { c.act = null; c.show = false; c.pose = "idle"; c.ex = "neutral"; c.talk = false; c.fall = 0; c.item = c.key === "red" || c.key === "teal" ? "spear" : null; c.shield = c.key === "red" || c.key === "teal"; c.layer = 1; c.s = 1; c.y = 0; c.cloak = 0; c.wind = 0; c.fphase = Math.random() * 6; c._thrust = 0; c.look = [1, 0]; c.key = c.id === "A" ? "alex" : c.id === "Q" ? "queen" : c.id[0] === "R" ? "red" : "teal"; }); }
  function put(c, x, face, extra) { c.x = x; c.face = face; c.show = true; if (extra) for (var k in extra) c[k] = extra[k]; return c; }

  // ---------- camera helpers (p = parallax layer of the thing being framed) ----------
  function camFor(p, wx, wy, z) { return { x: wx / p, y: wy / p, z: z }; }
  function follow(c, z0, z1, dx, dy) { return function (v) { return { x: c.x + (dx || 0) * (c.face || 1), y: dy == null ? -170 : dy, z: lerp(z0, z1, ease(v)) }; }; }
  function fixed(x, y, z0, z1) { return function (v) { return { x: x, y: y, z: lerp(z0, z1 == null ? z0 : z1, ease(v)) }; }; }
  function between(a, b, zmax, dy, ztight) { return function (v) { var dx = Math.abs(a.x - b.x); var z = clamp(560 / (dx + 240), 0.7, zmax); return { x: (a.x + b.x) / 2, y: dy == null ? -180 : dy, z: z * (1 + 0.05 * v) }; }; }
  function pan(x0, x1, y, z0, z1) { return function (v) { return { x: lerp(x0, x1, ease(v)), y: y, z: lerp(z0, z1 == null ? z0 : z1, ease(v)) }; }; }
  function head(c, z0, z1, dx, dy) { return function (v) { return { x: c.x + (dx || 0) * (c.face || 1), y: -(dy == null ? 262 : dy), z: lerp(z0, z1, ease(v)) }; }; }

  // ---------- FX ----------
  var sparks = [];
  function emit(x, y, n, col, spd) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, v = (60 + Math.random() * 220) * (spd || 1); sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 0.45 + Math.random() * 0.4, t: 0, col: col || "#ffe49a" }); } }
  function drawSparks(dt) { sparks = sparks.filter(function (p) { return p.t < p.life; }); sparks.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 520 * dt; var a = 1 - p.t / p.life; ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = S.alpha(p.col, a); ctx.beginPath(); ctx.arc(p.x, p.y, 3.5 * a + 1, 0, 6.283); ctx.fill(); ctx.restore(); }); }
  var flash = 0;

  // ---------- backgrounds ----------
  function bgSea(opts) {
    opts = opts || {};
    W.sky(); W.clouds(5, 0.06, -820, 6);
    W.ridge(0.08, -140, 90, 3, "#5c8f86", "#86b8b0", 0.004, 0.5);
    W.cityline(0.11, -128, 9);
    W.sea(0.1, -120, "#43b0e4", "#0e4f94");
    if (opts.farShips) { W.ship(0.14, 520 * 0.14, -118, 0.1, S.time + 3); W.ship(0.12, -620 * 0.12, -122, 0.08, S.time + 7); }
  }
  function bgBeach() {
    W.sky(); W.clouds(8, 0.06, -820, 5);
    W.ridge(0.08, -150, 70, 6, "#7da79a", "#a5cbbf", 0.003, 0.5);
    W.sea(0.1, -130, "#43b0e4", "#0e4f94");
    W.ship(0.3, 620, -110, 0.3, S.time + 1);
    W.ground(1, -60, "#f1d9a2", "#e0bd7c");
    // surf line
    layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.beginPath(); ctx.moveTo(v.l, -58); for (var x = v.l; x <= v.r; x += 40) ctx.lineTo(x, -58 + Math.sin(x * 0.02 + S.time * 1.5) * 4 + 10); ctx.lineTo(v.r, -30); ctx.lineTo(v.l, -30); ctx.fill(); });
  }
  function layer(p, fn) { S.layer(p, fn); }
  function bgEgypt(opt) {
    opt = opt || {};
    W.sky(); W.clouds(2, 0.05, -900, 5);
    W.ridge(0.08, -150, 50, 2, "#d7b27a", "#e6c590", 0.004, 0.6);
    W.pyramid(0.16, -700 * 0.16, -140, 520 * 0.16 * 1.9, 330 * 0.16 * 1.9, 0);
    W.pyramid(0.2, 120 * 0.2, -134, 640 * 0.2 * 1.9, 420 * 0.2 * 1.9, 0);
    W.pyramid(0.14, 900 * 0.14, -140, 420 * 0.14 * 1.9, 270 * 0.14 * 1.9, 0);
    W.dunes(0.3, -120, 60, 4, "#f0cf8a", "#dcae66", 0.004);
    W.sphinx(0.5, -300, -76, 0.9);
    W.obelisk(0.55, 700, -76, 330);
    W.dunes(0.6, -40, 46, 8, "#f2d596", "#e0b873", 0.006);
    W.palm(0.7, 1000, -30, 360, 3); W.palm(0.7, 1150, -30, 300, 5);
    W.ground(1, -56, "#f3d89c", "#e2bb78");
    if (!opt.nofg) { }
  }
  function fgPalms() { W.palm(1.35, -520, 700, 640, 7); W.palm(1.5, 460, 800, 700, 2); }
  function bgPlain(opt) {
    opt = opt || {};
    W.sky(); W.clouds(4, 0.05, -860, 6);
    W.ridge(0.07, -150, 140, 12, "#6f8fa8", "#9bb9cf", 0.003, 0.55);
    W.ridge(0.12, -135, 80, 5, "#7d9f6a", "#a6c488", 0.005, 0.4);
    W.acacia(0.3, -300 * 0.3, -110, 150); W.acacia(0.3, 700 * 0.3, -110, 120);
    W.dunes(0.45, -70, 40, 21, "#c9b36b", "#b59a52", 0.005);
    W.acacia(0.6, 40, -50, 220); W.acacia(0.6, -900, -50, 190);
    W.ground(1, -50, "#cdb870", "#a99244", { grass: "#a5a24a" });
    W.rock(1, -420, 20, 120, 60, "#b09a74"); W.rock(1, 560, 30, 90, 46, "#a58f6c");
  }
  function bgTempleFront() {
    W.sky(); W.clouds(2, 0.05, -900, 4);
    W.ridge(0.08, -150, 40, 2, "#d7b27a", "#e6c590", 0.004, 0.6);
    W.pyramid(0.16, -520 * 0.16, -140, 520 * 0.16 * 1.9, 330 * 0.16 * 1.9, 0);
    W.dunes(0.3, -110, 50, 4, "#f0cf8a", "#dcae66", 0.004);
    W.temple(0.62, 0, -30, 1.0);
    W.obelisk(0.7, -780, -20, 300); W.obelisk(0.7, 780, -20, 300);
    W.ground(1, -44, "#ecd29a", "#d4ae6c");
    layer(1, function () { var R2 = S.rng(3); ctx.fillStyle = S.alpha("#8a5a2b", 0.14); for (var i = 0; i < 18; i++) ctx.fillRect(-900 + i * 100, 40 + (i % 3) * 18, 90, 4); });
    W.brazier(1, -340, 0); W.brazier(1, 340, 0);
  }
  function fgColumns() { W.columns(1.4, -430, 900, 2, 860, 760); }
  function bgHall() {
    var VW = S.VW, VH = S.VH; ctx.fillStyle = S.vgrad(0, VH, [[0, "#2a1d17"], [1, "#6a4a34"]]); ctx.fillRect(0, 0, VW, VH);
    layer(0.5, function () { var v = S.viewRect(0.5); var g = S.vgrad(-700, 100, [[0, "#3a281c"], [1, "#7a5a3a"]]); ctx.fillStyle = g; ctx.fillRect(v.l, -700, v.r - v.l, 800);
      for (var x = -1500; x < 1500; x += 300) { ctx.fillStyle = "#c9a560"; ctx.fillRect(x, -560, 240, 460); ctx.fillStyle = "#2c6fb3"; ctx.fillRect(x + 12, -548, 216, 14); ctx.fillStyle = "#b8452c"; ctx.fillRect(x + 12, -120, 216, 14); ctx.fillStyle = "rgba(60,30,10,.55)"; for (var r = 0; r < 5; r++) for (var q = 0; q < 5; q++) { ctx.fillRect(x + 30 + q * 38, -520 + r * 74, 14, 8); ctx.fillRect(x + 36 + q * 38, -508 + r * 74, 5, 24); } } });
    W.columns(0.8, -900, 40, 7, 300, 720);
    W.ground(1, -40, "#9a7a52", "#5a3e26");
    layer(1, function () { var v = S.viewRect(1); ctx.strokeStyle = "rgba(255,230,170,.1)"; ctx.lineWidth = 2; for (var x = v.l; x < v.r; x += 120) { ctx.beginPath(); ctx.moveTo(x, -40); ctx.lineTo(x - 80, 700); ctx.stroke(); } });
    W.brazier(1, -300, 0); W.brazier(1, 300, 0);
    // light shaft
    ctx.save(); ctx.globalCompositeOperation = "lighter"; layer(0.9, function () { var g = S.vgrad(-700, 100, [[0, "rgba(255,220,150,.22)"], [1, "rgba(255,220,150,0)"]]); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-60, -700); ctx.lineTo(40, -700); ctx.lineTo(260, 60); ctx.lineTo(-160, 60); ctx.fill(); }); ctx.restore();
  }
  function bgDeck(t) {
    W.sky(); W.clouds(5, 0.06, -820, 6); W.ridge(0.08, -140, 90, 3, "#5c8f86", "#86b8b0", 0.004, 0.5); W.sea(0.1, -100, "#43b0e4", "#0e4f94");
    layer(0.9, function () { var g = S.vgrad(-640, 0, [[0, "#f6ead0"], [1, "#e1cfa7"]]); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-420, -640); ctx.quadraticCurveTo(-300 + Math.sin(t * 1.6) * 14, -380, -420, -80); ctx.lineTo(420, -80); ctx.quadraticCurveTo(540 + Math.sin(t * 1.6) * 14, -380, 420, -640); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(120,90,50,.3)"; ctx.lineWidth = 2; for (var i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-420, -640 + i * 120); ctx.quadraticCurveTo(0, -640 + i * 120 + 30, 420, -640 + i * 120); ctx.stroke(); } ctx.fillStyle = "#b5242c"; ctx.beginPath(); ctx.arc(0, -360, 62, 0, 6.283); ctx.fill(); ctx.fillStyle = "#e2b23d"; ctx.beginPath(); ctx.arc(0, -360, 30, 0, 6.283); ctx.fill(); ctx.fillStyle = "#8a5a30"; ctx.fillRect(-14, -700, 28, 720); });
    // deck planks
    layer(1, function () { var v = S.viewRect(1), g = S.vgrad(-40, 500, [[0, "#b07a45"], [1, "#6a4426"]]); ctx.fillStyle = g; ctx.fillRect(v.l, -40, v.r - v.l, 700); ctx.strokeStyle = "rgba(40,20,5,.35)"; ctx.lineWidth = 3; for (var i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(v.l, -40 + i * i * 9 + 20); ctx.lineTo(v.r, -40 + i * i * 9 + 20); ctx.stroke(); } ctx.fillStyle = "#6a4426"; ctx.fillRect(v.l, -70, v.r - v.l, 34); ctx.fillStyle = "#e2b23d"; ctx.fillRect(v.l, -70, v.r - v.l, 5); for (var x = Math.ceil(v.l / 120) * 120; x < v.r; x += 120) { ctx.fillStyle = "#4e301a"; ctx.fillRect(x - 8, -150, 16, 96); ctx.beginPath(); ctx.arc(x, -152, 12, 0, 6.283); ctx.fill(); } ctx.strokeStyle = "#4e301a"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(v.l, -150); ctx.lineTo(v.r, -150); ctx.stroke(); });
  }
  function bgNight(shipX) {
    W.sky(); W.clouds(6, 0.05, -820, 4);
    W.ridge(0.08, -150, 70, 6, "#1b2a55", "#27407a", 0.003, 0.4);
    W.sea(0.1, -130, "#1e3f84", "#0a1a44");
    // moon path
    layer(0.1, function () { ctx.save(); ctx.globalCompositeOperation = "lighter"; var R2 = S.rng(5); for (var i = 0; i < 40; i++) { var t = R2(), y = -120 + t * t * 700, x = -500 + (R2() - 0.5) * (30 + t * 260); ctx.fillStyle = "rgba(220,235,255," + (0.25 * (0.5 + 0.5 * Math.sin(S.time * 3 + i)) * (1 - t * 0.5)) + ")"; ctx.fillRect(x, y, 10 + t * 70 * R2(), 2 + t * 3); } ctx.restore(); });
    W.ship(0.16, shipX * 0.16, -122, 0.12, S.time + 2);
    W.ground(1, -60, "#4a5a7a", "#2a3452");
    layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "rgba(200,220,255,.4)"; ctx.beginPath(); ctx.moveTo(v.l, -58); for (var x = v.l; x <= v.r; x += 40) ctx.lineTo(x, -58 + Math.sin(x * 0.02 + S.time * 1.2) * 3 + 8); ctx.lineTo(v.r, -30); ctx.lineTo(v.l, -30); ctx.fill(); });
  }
  function campfire(x) { layer(1, function () { ctx.fillStyle = "#4a3220"; ctx.fillRect(x - 30, 0, 60, 8); ctx.save(); ctx.globalCompositeOperation = "lighter"; var g = S.rgrad(x, -30, 4, 380, [[0, "rgba(255,160,60,.6)"], [1, "rgba(255,160,60,0)"]]); ctx.fillStyle = g; ctx.fillRect(x - 400, -420, 800, 800); ctx.restore(); var fl = Math.sin(S.time * 11) * 4; ctx.fillStyle = "#ff8a22"; ctx.beginPath(); ctx.moveTo(x - 26, 0); ctx.quadraticCurveTo(x - 20 + fl, -50, x + fl, -92); ctx.quadraticCurveTo(x + 22 + fl, -44, x + 26, 0); ctx.fill(); ctx.fillStyle = "#ffd25a"; ctx.beginPath(); ctx.moveTo(x - 14, 0); ctx.quadraticCurveTo(x + fl * 0.5, -48, x + 14, 0); ctx.fill(); }); }
  function bgCliff() {
    W.sky(); W.clouds(3, 0.05, -900, 7);
    W.ridge(0.04, -230, 360, 15, "#7a86b8", "#c4cbe6", 0.0024, 0.45);
    W.ridge(0.07, -190, 240, 8, "#6f7fb0", "#a9b4d8", 0.0034, 0.4);
    W.pyramid(0.1, 620 * 0.1, -150, 480 * 0.1 * 2.2, 320 * 0.1 * 2.2, 0); W.pyramid(0.09, -300 * 0.09, -148, 420 * 0.09 * 2.2, 280 * 0.09 * 2.2, 0);
    W.ridge(0.1, -150, 90, 21, "#8aa0b4", "#b5c6d6", 0.004, 0.45);
    W.sea(0.13, -120, "#4ab0e0", "#1a5aa0");
    W.cityline(0.16, -118, 6);
    W.ground(1, 120, "#a8935a", "#7a5f38");
    layer(1, function () { var g = S.vgrad(-100, 160, [[0, W.cur.night ? "#6a6a80" : "#c9a76a"], [1, "#8a6a3e"]]); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-260, 160); ctx.lineTo(-210, -60); ctx.quadraticCurveTo(-120, -112, 60, -94); ctx.quadraticCurveTo(260, -104, 330, -50); ctx.lineTo(420, 160); ctx.fill(); ctx.fillStyle = "rgba(60,30,10,.25)"; ctx.beginPath(); ctx.moveTo(150, -96); ctx.lineTo(330, -50); ctx.lineTo(420, 160); ctx.lineTo(150, 160); ctx.fill(); });
  }

  // ---------- scene set ----------
  // ---------- weather & ambient FX (screen space) ----------
  function weatherFx(kind, dt) {
    if (!kind) return; var VW = S.VW, VH = S.VH, t = S.time, i, r;
    ctx.save();
    if (kind === "storm" || kind === "rain") {
      ctx.strokeStyle = "rgba(210,228,248,.5)"; ctx.lineWidth = 1.8; ctx.beginPath();
      for (i = 0; i < 230; i++) { var h1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, h2 = Math.abs(Math.sin(i * 78.233 + 1.7) * 24634.6345) % 1, sp = 1300 + h2 * 700, x0 = ((h1 * (VW + 300) - t * 260 * (0.6 + h2)) % (VW + 300) + VW + 300) % (VW + 300) - 100, y0 = (h2 * VH * 1.3 + t * sp) % (VH + 200) - 100; ctx.moveTo(x0, y0); ctx.lineTo(x0 - 26, y0 + 70); }
      ctx.stroke();
      ctx.fillStyle = "rgba(190,210,230,.10)"; ctx.fillRect(0, 0, VW, VH);
      if (kind === "storm") { var ph = (t * 0.43) % 1; var bolt = ph < 0.05 ? 1 - ph / 0.05 : (ph > 0.09 && ph < 0.13 ? 0.6 * (1 - (ph - 0.09) / 0.04) : 0); if (bolt > 0) { ctx.fillStyle = "rgba(235,242,255," + (0.5 * bolt) + ")"; ctx.fillRect(0, 0, VW, VH); if (ph < 0.05) { ctx.strokeStyle = "rgba(255,255,255," + bolt + ")"; ctx.lineWidth = 4; ctx.beginPath(); var bx = VW * (0.25 + 0.5 * ((Math.floor(t * 0.43) * 0.37) % 1)), by = 0; ctx.moveTo(bx, by); for (i = 0; i < 9; i++) { bx += (Math.sin(i * 7.1 + Math.floor(t * 0.43)) * 40); by += VH * 0.055; ctx.lineTo(bx, by); } ctx.stroke(); } } }
    } else if (kind === "sand") {
      ctx.fillStyle = "rgba(226,184,120,.16)"; ctx.fillRect(0, 0, VW, VH);
      for (i = 0; i < 90; i++) { var x1 = ((i * 131.7 + t * (700 + (i % 5) * 160)) % (VW + 400)) - 200, y1 = (i * 53.9) % VH; ctx.fillStyle = "rgba(240,205,140," + (0.12 + (i % 4) * 0.05) + ")"; ctx.fillRect(x1, y1, 50 + (i % 6) * 22, 2 + (i % 3)); }
    } else if (kind === "fog") {
      for (i = 0; i < 4; i++) { var fy = VH * (0.45 + i * 0.12), dx = Math.sin(t * 0.15 + i) * 60; var g = ctx.createLinearGradient(0, fy - 160, 0, fy + 160); g.addColorStop(0, "rgba(190,205,235,0)"); g.addColorStop(0.5, "rgba(190,205,235,.2)"); g.addColorStop(1, "rgba(190,205,235,0)"); ctx.fillStyle = g; ctx.fillRect(dx - 100, fy - 160, VW + 200, 320); }
    } else if (kind === "birds") {
      ctx.strokeStyle = "rgba(30,30,50,.75)"; ctx.lineWidth = 3; ctx.lineCap = "round";
      for (i = 0; i < 9; i++) { var bx2 = ((t * (60 + i * 6) + i * 210) % (VW + 300)) - 150, by2 = VH * (0.12 + (i % 4) * 0.06) + Math.sin(t * 0.9 + i) * 14, fl = Math.sin(t * 7 + i * 1.7) * 9; ctx.beginPath(); ctx.moveTo(bx2 - 16, by2 - 4 - fl); ctx.quadraticCurveTo(bx2 - 7, by2 - 9 + fl * 0.3, bx2, by2); ctx.quadraticCurveTo(bx2 + 7, by2 - 9 + fl * 0.3, bx2 + 16, by2 - 4 - fl); ctx.stroke(); }
    }
    ctx.restore();
  }
  var SCENES = [];
  function scene(o) { SCENES.push(o); return o; }

  scene({ text: "Alexander led his army across the sea.", dur: 7.5, chapter: "Sea", tod: "day",
    setup: function () { put(A, 0, 1, { pose: "look", ex: "smug", look: [1, -0.1] }); put(R[0], -130, 1, { pose: "idle" }); put(R[1], -230, 1, { pose: "idle" }); put(R[2], 120, 1, { pose: "idle" }); },
    world: function (m, u) { if (m === "deck") { bgDeck(S.time); } else { bgSea({ farShips: true }); W.ship(0.5, lerp(-260, 220, u) * 0.5, -100, 0.62, S.time); W.ship(0.28, 520 * 0.28, -110, 0.3, S.time + 2); } },
    shots: [{ a: 0, mode: "sea", nochars: true, cam: function (v) { return { x: lerp(-60, 120, ease(v)) * 0.5 / 0.5 * 0.9, y: -160, z: 0.95 }; } },
      { a: 0.36, mode: "sea", nochars: true, cam: function (v) { var ux = lerp(-260, 220, 0.5 + v * 0.3) * 0.5; return { x: (ux + 150) / 0.5 * 0.9, y: -220, z: lerp(1.5, 1.8, v) }; } },
      { a: 0.64, mode: "deck", roll: 0.03, cam: function (v) { return { x: 40, y: -200, z: lerp(1.55, 1.8, ease(v)) }; } }] });

  scene({ text: "At last the fleet reached the shore, and his soldiers stepped onto the sand.", dur: 8.5, chapter: "Shore", tod: "day", weather: "birds",
    setup: function () { put(A, -520, 1, { pose: "walk", ex: "happy", look: [1, 0] }); R.slice(0, 4).forEach(function (c, i) { put(c, -640 - i * 120, 1, { pose: "march", phase: i * 1.3 }); }); },
    update: function (u, dt) { var sp = 78; [A].concat(R.slice(0, 4)).forEach(function (c) { c.x += sp * dt * (c === A ? 1.05 : 1); if (u > 0.78 && c === A) { c.pose = "look"; } }); },
    world: function () { bgBeach(); },
    shots: [{ a: 0, views: { A: "side", R1: "side", R2: "side", R3: "side", R4: "side" }, cam: follow(A, 1.25, 1.5, 150, -170) }, { a: 0.32, blur: 0, cam: function (v) { var cx = (A.x + R[3].x) / 2; return { x: cx, y: -120, z: lerp(0.9, 1.0, v) }; } }, { a: 0.62, blur: 6, cam: head(A, 2.5, 2.8, 70, 258) }] });

  scene({ text: "In Egypt, beneath the great pyramids, a queen was waiting for him.", dur: 7.5, chapter: "Egypt", tod: "gold",
    setup: function () { put(A, -560, 1, { pose: "walk", ex: "smug" }); put(Q, 160, -1, { pose: "idle", ex: "happy", look: [-1, 0] }); },
    update: function (u, dt) { if (A.x < -140) A.x += 74 * dt; else A.pose = "talk"; if (u > 0.55) { A.pose = "idle"; } },
    world: function () { bgEgypt(); },
    foreground: function () { fgPalms(); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-480, -200, ease(v)), y: -190, z: 0.9 }; } }, { a: 0.4, cam: follow(Q, 1.6, 1.85, 0, -200) }, { a: 0.7, views: { A: "back" }, blur: 0, fg: [{ id: "A", dx: -60, view: "back", layer: 1.35, s: 1.15 }], cam: function (v) { return { x: Q.x - 120, y: -210, z: lerp(1.5, 1.75, ease(v)) }; } }] });

  scene({ text: "She smiled at him, and said:", quote: "Welcome to Egypt. Gold is only sand that someone loved.", dur: 9.5, chapter: "Quote", tod: "gold",
    setup: function () { put(Q, 0, -1, { pose: "talk", ex: "happy", talk: true, look: [-0.4, 0] }); },
    world: function () { bgEgypt({ nofg: true }); },
    shots: [{ a: 0, blur: 7, cam: head(Q, 2.4, 2.7, 0, 262) }, { a: 0.42, blur: 6, views: { Q: "side" }, cam: function (v) { return { x: Q.x - 110 * (1 - v * 0.4), y: -230, z: lerp(1.8, 1.95, v) }; } }, { a: 0.74, blur: 8, cam: head(Q, 3.0, 3.25, 0, 268) }] });

  var duel = { t: 0 };
  scene({ text: "But the Persians marched against him, and the two armies clashed on the plain, spear against shield.", dur: 9, chapter: "Battle", tod: "storm", weather: "storm",
    setup: function () { duel.t = 0; sparks = []; put(A, -380, 1, { pose: "march", item: "sword", shield: true, ex: "angry" }); R.slice(0, 5).forEach(function (c, i) { put(c, -560 - i * 70, 1, { pose: "march", ex: "angry", s: 0.96, phase: i, layer: i % 2 && i > 0 ? 0.88 : 1 }); }); T.slice(0, 5).forEach(function (c, i) { put(c, 560 + i * 70, -1, { pose: "march", ex: "angry", s: 0.96, phase: i + 1, layer: i % 2 && i > 0 ? 0.88 : 1 }); }); T[5].layer = 0.85; },
    update: function (u, dt) {
      var adv = ease(clamp((u - 0.03) / 0.27, 0, 1)); A.x = lerp(-380, -62, adv); T[0].x = lerp(560, 30, adv);
      R.slice(0, 5).forEach(function (c, i) { c.x = lerp(-640 - i * 140, -190 - i * 150, adv); }); T.slice(0, 5).forEach(function (c, i) { c.x = i === 0 ? T[0].x : lerp(640 + i * 140, 140 + i * 150, adv); });
      var fight = adv >= 1; [A].concat(R.slice(0, 5), T.slice(0, 5)).forEach(function (c) { if (c.fall > 0 || c.pose === "down") return; c.pose = fight ? "fight" : "march"; });
      // scheduled casualties: [char, time, dir]
      [[T[1], 0.38], [R[2], 0.46], [T[2], 0.52], [T[3], 0.6], [R[4], 0.68], [T[0], 0.76]].forEach(function (e) { if (u > e[1]) { e[0].pose = "down"; e[0].fall = clamp((u - e[1]) / 0.07, 0, 1); if (e[0].fall < 0.1 && !e[0]._hit) { e[0]._hit = 1; emit(e[0].x, -150, 22, "#ffd77a"); S.cam.shake = 7; } } else { e[0]._hit = 0; } });
      cam.shake = Math.max(0, cam.shake - dt * 22);
      if (u > 0.7) { T[4].pose = "march"; T[4].face = 1; T[4].x += 190 * dt; T[4].ex = "shock"; }
      // clash sparks
      if (fight) { duel.t += dt; if (Math.sin(duel.t * 3.4 * 1) > 0.97) { emit((A.x + T[0].x) / 2 + 40, -190, 10, "#fff2b0", 0.7); } }
    },
    world: function () { bgPlain(); },
    foreground: function () { var v = 0; },
    shots: [{ a: 0, cam: fixed(0, -200, 0.8, 0.88) }, { a: 0.2, cam: function (v) { return { x: lerp(-90, -20, ease(v)), y: -200, z: 1.5 }; } }, { a: 0.46, blur: 6, cam: head(A, 2.4, 2.7, 80, 258) }, { a: 0.62, views: { A: "back" }, fg: [{ id: "A", dx: -230, view: "back", layer: 1.4, s: 1.1, pose: "fight" }], cam: function (v) { return { x: lerp(-60, 10, ease(v)), y: -190, z: lerp(1.35, 1.55, ease(v)) }; } }, { a: 0.82, cam: fixed(0, -200, 0.85, 0.8) }] });

  scene({ text: "Victorious, Alexander knelt, and the queen placed the crown upon his head.", dur: 9.5, chapter: "Crown", tod: "gold",
    setup: function () { put(A, -520, 1, { pose: "walk", ex: "smug" }); put(Q, 90, -1, { pose: "idle", ex: "happy", look: [-1, 0] }); R.slice(0, 3).forEach(function (c, i) { put(c, -380 - i * 130, 1, { pose: "idle", ex: "happy", layer: 0.9, s: 0.9 }); }); T.slice(0, 2).forEach(function (c, i) { put(c, 380 + i * 130, -1, { pose: "idle", ex: "happy", layer: 0.9, s: 0.9, item: null, shield: false }); }); },
    update: function (u, dt) {
      if (u < 0.28) { A.x = lerp(-520, -80, ease(u / 0.28)); A.pose = "walk"; } else { A.x = -80; A.pose = u < 0.64 ? "kneel" : u < 0.8 ? "idle" : "idle"; }
      A.key = u > 0.58 ? "alexc" : "alex"; if (u > 0.6) A.ex = "happy";
      if (u > 0.28 && u < 0.6) { Q.pose = "hold"; Q.item = u < 0.46 ? "crown" : null; Q.ex = "happy"; } if (u >= 0.6) { Q.pose = "talk"; Q.item = null; Q.talk = false; Q.pose = "idle"; }
      var ch = u > 0.6; if (ch && !this._flashed) { this._flashed = 1; flash = 1; emit(A.x + 10, -270, 40, "#ffe49a", 1.1); } if (u < 0.5) this._flashed = 0;
      R.slice(0, 3).concat(T.slice(0, 2)).forEach(function (c) { c.pose = u > 0.62 ? "cheer" : "idle"; });
    },
    world: function () { bgTempleFront(); },
    foreground: function () { fgColumns(); },
    shots: [{ a: 0, cam: fixed(-100, -210, 0.95, 1.05) }, { a: 0.26, cam: between(A, Q, 1.55, -210) }, { a: 0.52, blur: 6, cam: head(A, 2.9, 3.2, 20, 235) }, { a: 0.66, blur: 6, cam: head(A, 2.7, 2.95, 40, 238) }, { a: 0.8, cam: fixed(-60, -130, 1.15, 1.0) }] });

  scene({ text: "In the marble halls of the temple, the council gathered to plan the realm's future.", dur: 8.5, chapter: "Council", tod: "inner",
    setup: function () { put(A, 0, 1, { key: "alexc", pose: "talk", ex: "neutral", talk: false }); put(Q, -180, 1, { pose: "idle", ex: "smug" }); put(R[0], 190, -1, { pose: "idle" }); put(R[1], 300, -1, { pose: "idle" }); put(R[2], -320, 1, { pose: "idle" }); put(T[0], 420, -1, { pose: "idle", key: "elder", item: "scroll", shield: false }); chars.T1.key = "elder"; chars.T1.item = "scroll"; R.slice(0, 3).forEach(function (c) { c.shield = false; c.item = null; }); },
    update: function (u, dt) { var sp = u < 0.34 ? "A" : u < 0.58 ? "Q" : "T1"; [A, Q, chars.T1].forEach(function (c) { c.talk = false; if (c.pose === "talk") c.pose = "idle"; }); var s2 = chars[sp]; s2.talk = true; s2.pose = "talk"; s2.ex = sp === "T1" ? "angry" : sp === "A" ? "neutral" : "happy"; R[0].look = [-0.6, 0]; },
    world: function () { bgHall(); },
    foreground: function () { layer(1, function () { var g = S.vgrad(-30, 80, [[0, "#6a4a2a"], [1, "#3e2814"]]); ctx.fillStyle = g; S.rrect(-110, -40, 220, 66, 8); ctx.fill(); ctx.fillStyle = "#e9dcb4"; S.rrect(-70, -52, 140, 22, 6); ctx.fill(); ctx.strokeStyle = "#a88d55"; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = "#b5242c"; ctx.beginPath(); ctx.arc(-24, -42, 6, 0, 6.283); ctx.fill(); ctx.fillStyle = "#2c6fb3"; ctx.beginPath(); ctx.arc(30, -40, 6, 0, 6.283); ctx.fill(); }); },
    shots: [{ a: 0, cam: pan(-120, 40, -200, 0.95, 1.0) }, { a: 0.18, cam: follow(A, 1.7, 1.95, 60, -190) }, { a: 0.36, blur: 5, cam: head(Q, 2.4, 2.65, 70, 258) }, { a: 0.58, cam: follow(chars.T1, 1.7, 1.9, -50, -190) }, { a: 0.8, cam: pan(260, -100, -200, 0.95, 1.0) }] });

  scene({ text: "Across the sunlit plains, the eight soldiers marched in steadfast formation.", dur: 9.0, chapter: "March", tod: "dusk", weather: "sand",
    setup: function () { put(A, 0, 1, { key: "alexc", pose: "march", ex: "smug", cloak: 6 }); R.slice(0, 4).forEach(function (c, i) { put(c, -150 - i * 105, 1, { pose: "march", phase: i * 0.9, ex: "happy", s: 0.96 }); }); T.slice(0, 3).forEach(function (c, i) { put(c, -120 - i * 125 - 60, 1, { key: "red", pose: "march", phase: i * 1.7 + 1, ex: "neutral", s: 0.94, layer: 0.9, face: 1 }); }); },
    update: function (u, dt) { var sp = 124; ALLC.forEach(function (c) { if (c.show) c.x += sp * dt; }); },
    world: function () { bgPlain(); W.dust(40, "rgba(255,210,150,.5)", 120, 3, 3); },
    shots: [{ a: 0, cam: function (v) { return { x: A.x - 160, y: -190, z: 1.05 }; } }, { a: 0.34, cam: function (v) { return { x: A.x - 40, y: -90, z: lerp(1.35, 1.5, v) }; } }, { a: 0.66, blur: 6, cam: function (v) { return { x: A.x + 40, y: -250, z: lerp(2.2, 2.5, v) }; } }] });

  scene({ text: "From mountain peak to distant sea, the empire stood eternal under the open sky.", dur: 8.5, chapter: "Wide", tod: "gold", weather: "birds",
    setup: function () { put(A, 70, -1, { key: "alexc", pose: "look", ex: "happy", look: [-1, -0.1], y: -96, cloak: 10, wind: 18 }); },
    world: function () { bgCliff(); },
    shots: [{ a: 0, views: { A: "back" }, cam: function (v) { return { x: lerp(150, 30, ease(v)), y: lerp(-230, -260, ease(v)), z: lerp(1.7, 1.05, ease(v)) }; } },
      { a: 0.4, views: { A: "side" }, cam: function (v) { return { x: lerp(-40, 30, ease(v)), y: -250, z: lerp(1.5, 1.7, ease(v)) }; } },
      { a: 0.62, cam: function (v) { return { x: lerp(60, -20, ease(v)), y: lerp(-300, -470, ease(v)), z: lerp(1.0, 0.6, ease(v)) }; } }] });

  scene({ text: "And when night fell, the king looked back at the sea he had crossed.", dur: 9, chapter: "Night", tod: "night", weather: "fog",
    setup: function () { put(A, -30, 1, { key: "alexc", pose: "look", ex: "sad", look: [1, -0.15] }); R.slice(0, 3).forEach(function (c, i) { put(c, 380 + i * 90, -1, { pose: "sit", ex: "sad", item: null, shield: false }); }); },
    update: function (u, dt) { A.look = [1, -0.15 + Math.sin(S.time * 0.4) * 0.03]; if (u > 0.55) { A.pose = u > 0.72 ? "down" : "kneel"; A.fall = clamp((u - 0.72) / 0.08, 0, 1); A.ex = "sad"; if (u > 0.72) { R.slice(0, 3).forEach(function (c) { c.pose = "idle"; c.ex = "sad"; }); if (Math.random() < 0.05) puff(A.x, -60, 1, "#fff3c4", 14, -60); } } },
    world: function (m, u) { bgNight(lerp(900, 4200, u)); campfire(330); },
    shots: [{ a: 0, blur: 5, cam: head(A, 2.5, 2.7, 80, 262) }, { a: 0.35, views: { A: "back" }, fg: [{ id: "A", dx: -120, view: "back", layer: 1.3, s: 1.1 }], cam: function (v) { return { x: lerp(60, 120, ease(v)), y: -190, z: lerp(1.2, 1.35, ease(v)) }; } }, { a: 0.5, cam: function (v) { return { x: lerp(100, 120, v), y: -170, z: lerp(0.85, 0.95, ease(v)) }; } }] });

  // ---------- director ----------
  // ================= SET PIECES (library used by the script director) =================
  var BUILT = SCENES.slice(0, 10); SCENES.length = 10;
  var puffs = [];
  function puff(x, y, n, col, r0, vy) { for (var i = 0; i < n; i++) puffs.push({ x: x + (Math.random() - 0.5) * 40, y: y, vx: (Math.random() - 0.5) * 120, vy: (vy == null ? -40 : vy) * (0.4 + Math.random()), r: r0 * (0.6 + Math.random() * 0.7), t: 0, life: 1.6 + Math.random(), col: col || "#d8d8d8" }); }
  function drawPuffs(dt) { puffs = puffs.filter(function (p) { return p.t < p.life; }); puffs.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; var k = p.t / p.life; ctx.globalAlpha = 0.55 * (1 - k); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + k * 2.2), 0, 6.283); ctx.fill(); }); ctx.globalAlpha = 1; }
  function ol(fill, w) { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = w || 3; ctx.strokeStyle = S.dk(fill, 0.55); ctx.lineJoin = "round"; ctx.stroke(); }
  function rocketDraw(x, y, flame, door) {
    ctx.save(); ctx.translate(x, y);
    if (flame > 0) { var fl = 120 + 260 * flame + Math.random() * 40; var g = S.rgrad(0, 40, 4, fl, [[0, "rgba(255,250,200,1)"], [0.35, "rgba(255,170,40,.9)"], [1, "rgba(255,80,0,0)"]]); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-50, fl * 0.5, 0, fl); ctx.quadraticCurveTo(50, fl * 0.5, 34, 0); ctx.fill(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = S.rgrad(0, 30, 10, 300, [[0, "rgba(255,170,60,.45)"], [1, "rgba(255,120,0,0)"]]); ctx.fillRect(-300, -270, 600, 600); ctx.globalCompositeOperation = "source-over"; }
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-92, 0); ctx.lineTo(-52, -140); ctx.lineTo(-52, -40); ctx.closePath(); ol("#d33a2e"); ctx.beginPath(); ctx.moveTo(70, 0); ctx.lineTo(92, 0); ctx.lineTo(52, -140); ctx.lineTo(52, -40); ctx.closePath(); ol("#d33a2e");
    ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(-58, -430); ctx.quadraticCurveTo(-52, -640, 0, -720); ctx.quadraticCurveTo(52, -640, 58, -430); ctx.lineTo(58, 0); ctx.closePath();
    var bg = ctx.createLinearGradient(-58, 0, 58, 0); bg.addColorStop(0, "#c9d2dc"); bg.addColorStop(0.35, "#ffffff"); bg.addColorStop(1, "#aab6c4"); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = "#5c6878"; ctx.stroke();
    ctx.fillStyle = "#d33a2e"; ctx.fillRect(-58, -250, 116, 26); ctx.fillRect(-58, -300, 116, 10);
    ctx.beginPath(); ctx.moveTo(-58, -560); ctx.quadraticCurveTo(-30, -700, 0, -720); ctx.quadraticCurveTo(30, -700, 58, -560); ctx.closePath(); ctx.fillStyle = "#d33a2e"; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -450, 28, 0, 6.283); ol("#7fc8ee", 4); ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.ellipse(-8, -460, 8, 14, 0.6, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.rect(-26, -42, 52, 42); ol("#6a7686"); if (door) { ctx.fillStyle = "#1c2430"; ctx.fillRect(-18, -150, 36, 70); ctx.strokeStyle = "#5c6878"; ctx.strokeRect(-18, -150, 36, 70); }
    ctx.restore();
  }
  function towerDraw(x) { ctx.save(); ctx.translate(x, 0); ctx.fillStyle = "#8d98a6"; ctx.strokeStyle = "#4b5663"; ctx.lineWidth = 4; for (var s = 0; s < 9; s++) { var y0 = -s * 90; ctx.strokeRect(-34, y0 - 90, 68, 90); ctx.beginPath(); ctx.moveTo(-34, y0); ctx.lineTo(34, y0 - 90); ctx.moveTo(34, y0); ctx.lineTo(-34, y0 - 90); ctx.stroke(); } ctx.fillRect(34, -560, 90, 14); ctx.restore(); }
  function whaleDraw(x, y, L, t, dir) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir || 1, 1); var sw = Math.sin(t * 1.6) * L * 0.02;
    ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.quadraticCurveTo(-L * 0.47, -L * 0.17, -L * 0.1, -L * 0.17); ctx.quadraticCurveTo(L * 0.25, -L * 0.14, L * 0.42, -L * 0.03 + sw); ctx.lineTo(L * 0.5, -L * 0.14 + sw * 2); ctx.quadraticCurveTo(L * 0.56, -L * 0.1 + sw * 2, L * 0.51, -L * 0.01 + sw); ctx.quadraticCurveTo(L * 0.56, L * 0.09 + sw * 2, L * 0.5, L * 0.12 + sw * 2); ctx.lineTo(L * 0.42, L * 0.03 + sw); ctx.quadraticCurveTo(L * 0.1, L * 0.19, -L * 0.2, L * 0.17); ctx.quadraticCurveTo(-L * 0.46, L * 0.12, -L * 0.5, 0); ctx.closePath();
    var g = ctx.createLinearGradient(0, -L * 0.17, 0, L * 0.18); g.addColorStop(0, "#2a5f8f"); g.addColorStop(0.6, "#4a86b5"); g.addColorStop(1, "#cfe3ee"); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = "#173a5a"; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 3; for (var i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-L * 0.36 + i * L * 0.04, L * 0.08); ctx.quadraticCurveTo(-L * 0.3 + i * L * 0.04, L * 0.13, -L * 0.22 + i * L * 0.04, L * 0.15); ctx.stroke(); }
    ctx.strokeStyle = "#173a5a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-L * 0.5, L * 0.02); ctx.quadraticCurveTo(-L * 0.3, L * 0.09, -L * 0.14, L * 0.06); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-L * 0.36, -L * 0.01, L * 0.018, 0, 6.283); ctx.fill(); ctx.fillStyle = "#101820"; ctx.beginPath(); ctx.arc(-L * 0.355, -L * 0.01, L * 0.01, 0, 6.283); ctx.fill();
    ctx.save(); ctx.translate(-L * 0.15, L * 0.12); ctx.rotate(0.5 + Math.sin(t * 1.6 + 1) * 0.25); ctx.beginPath(); ctx.ellipse(L * 0.04, L * 0.07, L * 0.05, L * 0.11, 0.3, 0, 6.283); ol("#2f6f9f"); ctx.restore();
    ctx.restore();
  }
  function subDraw(x, y, t, dir, sz) {
    ctx.save(); ctx.translate(x, y); ctx.scale((dir || 1) * (sz || 1), sz || 1); ctx.globalCompositeOperation = "lighter"; var bm = ctx.createLinearGradient(-190, 0, -700, 0); bm.addColorStop(0, "rgba(255,250,190,.55)"); bm.addColorStop(1, "rgba(255,250,190,0)"); ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(-190, -10); ctx.lineTo(-700, -170); ctx.lineTo(-700, 150); ctx.lineTo(-190, 20); ctx.fill(); ctx.globalCompositeOperation = "source-over";
    ctx.beginPath(); ctx.ellipse(0, 0, 200, 76, 0, 0, 6.283); ol("#f2c230"); ctx.beginPath(); ctx.rect(-40, -120, 80, 56); ol("#e8b020"); ctx.fillStyle = "#e8b020"; ctx.fillRect(-4, -170, 8, 52); ctx.fillRect(-4, -170, 34, 8);
    [-100, -30, 40, 110].forEach(function (px) { ctx.beginPath(); ctx.arc(px, -4, 20, 0, 6.283); ol("#8fd4f2", 4); ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.arc(px - 6, -10, 6, 0, 6.283); ctx.fill(); });
    ctx.save(); ctx.translate(206, 0); ctx.rotate(t * 14); ctx.beginPath(); ctx.ellipse(0, 0, 8, 46, 0, 0, 6.283); ol("#6a7686", 3); ctx.restore(); ctx.beginPath(); ctx.moveTo(180, -40); ctx.lineTo(236, -66); ctx.lineTo(236, 66); ctx.lineTo(180, 40); ctx.closePath(); ol("#d89a1c");
    ctx.restore();
  }
  function anglerDraw(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.ellipse(0, 0, 70, 52, 0, 0, 6.283); ol("#1d3a4a"); ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-100, -20); ctx.lineTo(-100, 24); ctx.closePath(); ol("#1d3a4a"); ctx.fillStyle = "#fff"; for (var i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(30 + i * 7, 6); ctx.lineTo(34 + i * 7, 26); ctx.lineTo(38 + i * 7, 6); ctx.fill(); } ctx.beginPath(); ctx.arc(34, -16, 9, 0, 6.283); ctx.fillStyle = "#fff"; ctx.fill(); ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(37, -16, 4, 0, 6.283); ctx.fill(); ctx.strokeStyle = "#1d3a4a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(20, -48); ctx.quadraticCurveTo(70, -110 + Math.sin(t * 2) * 10, 110, -60); ctx.stroke(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = S.rgrad(110, -60, 2, 70, [[0, "rgba(200,255,230,1)"], [0.3, "rgba(80,255,200,.55)"], [1, "rgba(0,255,200,0)"]]); ctx.beginPath(); ctx.arc(110, -60, 70, 0, 6.283); ctx.fill(); ctx.restore(); }
  function jellyDraw(x, y, s, t, c) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + Math.sin(t * 2) * 0.06), s * (1 - Math.sin(t * 2) * 0.06)); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = S.rgrad(0, -10, 4, 60, [[0, c + ",.75)"], [1, c + ",.1)"]]); ctx.beginPath(); ctx.arc(0, 0, 50, Math.PI, 0); ctx.quadraticCurveTo(30, 18, 0, 10); ctx.quadraticCurveTo(-30, 18, -50, 0); ctx.fill(); ctx.strokeStyle = c + ",.5)"; ctx.lineWidth = 3; for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 13, 8); for (var k = 1; k <= 5; k++) ctx.lineTo(i * 13 + Math.sin(t * 2 + k + i) * 8, 8 + k * 22); ctx.stroke(); } ctx.restore(); }
  function darkOcean(depth) { PL.ocean({}); S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "rgba(2,8,22," + depth + ")"; ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); }); }
  function lamp(c, on) { if (!on) return; S.layer(1, function () { ctx.save(); ctx.globalCompositeOperation = "lighter"; var fx = c.x + (c.face || 1) * 40, fy = c.y - 205, d = c.face || 1; var g = ctx.createLinearGradient(fx, 0, fx + d * 520, 0); g.addColorStop(0, "rgba(255,245,190,.55)"); g.addColorStop(1, "rgba(255,245,190,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx, fy - 6); ctx.lineTo(fx + d * 520, fy - 190); ctx.lineTo(fx + d * 520, fy + 210); ctx.lineTo(fx, fy + 10); ctx.fill(); ctx.restore(); }); }
  function mkCrew(era) { A.key = era === "space" ? "astro" : "diver"; return A; }

  // --- SPACE: rocket launch (astronauts walk to the rocket, board it, it lifts off) ---
  scene({ text: "", dur: 10, chapter: "Launch", tod: "gold", weather: null, tags: "launch",
    setup: function () { A.key = "astro"; R[0].key = "astro2"; R[0].item = null; R[0].shield = false; put(A, -520, 1, { pose: "walk", ex: "happy" }); put(R[0], -640, 1, { pose: "walk", ex: "happy" }); this.rk = 0; },
    update: function (u, dt) { var walk = clamp(u / 0.34, 0, 1); A.x = lerp(-520, -24, ease(walk)); R[0].x = lerp(-640, -110, ease(walk)); if (walk >= 1) { A.pose = "idle"; R[0].pose = "idle"; } if (u > 0.34) { A.show = false; R[0].show = false; } this.rk = clamp((u - 0.5) / 0.5, 0, 1); if (u > 0.46 && u < 0.5) cam.shake = 5; else cam.shake = this.rk > 0 ? 4 + this.rk * 8 : 0; if (u > 0.46) puff(0, -20, 3, "#e8e0d4", 40, -60); if (this.rk > 0) puff(0, -10 + this.rk * -900 * 0.2, 4, "#d8d8d8", 60, 30); },
    world: function (m, u) { var rk = this.rk || 0; bgPlain({}); S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "#9aa2ac"; ctx.fillRect(-420, -20, 840, 40); towerDraw(-230); drawPuffs(1 / 30); rocketDraw(0, -10 - Math.pow(rk, 2.2) * 2600, rk > 0 ? Math.min(1, rk * 4) : 0, u > 0.2 && u < 0.5); }); },
    shots: [{ a: 0, cam: function (v) { return { x: -230, y: -300, z: lerp(0.72, 0.8, v) }; } }, { a: 0.14, views: { A: "side" }, cam: follow(A, 1.3, 1.5, 130, -170) }, { a: 0.34, cam: function (v) { return { x: 0, y: -150, z: lerp(0.78, 0.7, v) }; } }, { a: 0.5, cam: function (v) { return { x: 0, y: lerp(-350, -1200, ease(v)), z: lerp(0.62, 0.5, v) }; } }, { a: 0.78, cam: function (v) { return { x: 0, y: lerp(-1500, -2600, v), z: 0.42 }; } }] });

  // --- SPACE: inside the spacecraft, window on the stars ---
  scene({ text: "", dur: 8, chapter: "Cabin", tod: "inner", tags: "cabin",
    setup: function () { A.key = "astro"; R[0].key = "astro2"; R[0].item = null; R[0].shield = false; put(A, -90, 1, { pose: "sit", ex: "neutral" }); put(R[0], 120, -1, { pose: "sit", ex: "happy" }); },
    update: function (u, dt) { A.y = Math.sin(S.time * 0.9) * 10 - 14; R[0].y = Math.sin(S.time * 0.9 + 1.5) * 10 - 14; A.look = [Math.cos(u * 3) * 0.3 + 0.3, -0.05]; },
    world: function (m, u) { S.layer(0, function () { var v = S.viewRect(0); ctx.fillStyle = S.vgrad(v.t, v.b, [[0, "#2a3446"], [1, "#161c28"]]); ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); }); S.layer(0.5, function () { ctx.save(); ctx.beginPath(); ctx.arc(0, -300, 250, 0, 6.283); ctx.clip(); ctx.fillStyle = "#02040c"; ctx.fillRect(-300, -560, 600, 560); var r = S.rng(3); for (var i = 0; i < 60; i++) { var sx = ((r() * 600 - S.time * 14 * (0.5 + r())) % 600 + 600) % 600 - 300, sy = -540 + r() * 480; ctx.fillStyle = "rgba(255,255,240," + (0.4 + r() * 0.6) + ")"; ctx.fillRect(sx, sy, 2.5, 2.5); } ctx.fillStyle = S.rgrad(120 - u * 40, -330, 4, 60 + u * 60, [[0, "#e88a5a"], [1, "#8a2e20"]]); ctx.beginPath(); ctx.arc(120 - u * 40, -330, 28 + u * 60, 0, 6.283); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(0, -300, 250, 0, 6.283); ctx.lineWidth = 26; ctx.strokeStyle = "#8d98a6"; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = "#4b5663"; ctx.stroke(); }); S.layer(1, function () { ctx.fillStyle = "#3a4558"; ctx.fillRect(-900, -20, 1800, 400); ctx.fillStyle = "#222a38"; ctx.fillRect(-900, -26, 1800, 8); [-340, 340].forEach(function (x) { ctx.fillStyle = "#1b2230"; ctx.fillRect(x - 40, -380, 80, 300); for (var i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? "#4fd08a" : "#e8a23a"; ctx.beginPath(); ctx.arc(x - 20 + (i % 3) * 20, -350 + Math.floor(i / 3) * 24, 5, 0, 6.283); ctx.fill(); } }); }); },
    shots: [{ a: 0, cam: function (v) { return { x: 0, y: -230, z: lerp(0.95, 1.1, ease(v)) }; } }, { a: 0.4, views: { A: "side" }, blur: 5, cam: head(A, 2.2, 2.5, 30, 250) }, { a: 0.7, views: { A: "back" }, cam: function (v) { return { x: -40, y: -260, z: lerp(1.25, 1.5, ease(v)) }; } }] });

  // --- SPACE: the red planet approaches (spacecraft flying in) ---
  scene({ text: "", dur: 7, chapter: "Approach", tod: "night", tags: "approach",
    setup: function () { },
    world: function (m, u) { S.layer(0, function () { var v = S.viewRect(0); ctx.fillStyle = "#03050d"; ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); }); PLstars(); S.layer(0.1, function () { var R0 = 60 + u * 520; ctx.fillStyle = S.rgrad(240 - 20 * u, -300, R0 * 0.1, R0 * 1.05, [[0, "#f0a070"], [0.5, "#c8693a"], [1, "#4a1812"]]); ctx.beginPath(); ctx.arc(240 - 20 * u, -300, R0, 0, 6.283); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.arc(240 - 20 * u, -300, R0, 0, 6.283); ctx.clip(); ctx.fillStyle = "rgba(90,30,20,.5)"; for (var i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(240 + i * 60 - 150, -300 + (i % 2 ? 40 : -50) * (R0 / 200), 40 * R0 / 200, 14 * R0 / 200, 0.2, 0, 6.283); ctx.fill(); } ctx.fillStyle = S.rgrad(240 + R0 * 0.5, -300 + R0 * 0.4, R0 * 0.2, R0 * 1.3, [[0, "rgba(0,0,10,0)"], [1, "rgba(0,0,20,.7)"]]); ctx.fillRect(-1000, -1000, 2000, 1500); ctx.restore(); }); S.layer(1, function () { ctx.save(); ctx.translate(lerp(-520, 40, ease(u)), lerp(-100, -240, ease(u))); ctx.rotate(1.4); ctx.scale(0.42, 0.42); rocketDraw(0, 360, 0.5, false); ctx.restore(); }); },
    shots: [{ a: 0, nochars: true, cam: function (v) { return { x: lerp(-120, 80, v), y: -220, z: 0.9 }; } }, { a: 0.55, nochars: true, cam: function (v) { return { x: lerp(60, 160, v), y: -250, z: lerp(1.1, 1.5, ease(v)) }; } }] });
  function PLstars() { var r = S.rng(11); S.layer(0.05, function () { var v = S.viewRect(0.05); for (var i = 0; i < 100; i++) { ctx.fillStyle = "rgba(255,255,240," + (0.4 + r() * 0.6) + ")"; ctx.beginPath(); ctx.arc(v.l + r() * (v.r - v.l), v.t + r() * (v.b - v.t), 0.8 + r() * 1.8, 0, 6.283); ctx.fill(); } }); }

  // --- SPACE: landing; astronaut steps onto the dust and plants a flag ---
  scene({ text: "", dur: 9, chapter: "Landing", tod: "dusk", tags: "landing",
    setup: function () { A.key = "astro"; R[0].key = "astro2"; R[0].item = null; R[0].shield = false; put(A, -40, 1, { pose: "walk", ex: "happy", y: -30 }); put(R[0], -120, 1, { pose: "idle", ex: "happy" }); this.flag = 0; },
    update: function (u, dt) { var w = clamp(u / 0.5, 0, 1); A.x = lerp(-40, 260, ease(w)); A.y = lerp(-30, 0, clamp(w * 3, 0, 1)); A.pose = u < 0.5 ? "walk" : u < 0.7 ? "cheer" : "idle"; R[0].pose = "cheer"; R[0].x = -120; if (u < 0.5 && Math.random() < 0.3) puff(A.x - 20, -6, 1, "#c98a68", 22, -30); this.flag = clamp((u - 0.55) / 0.15, 0, 1); },
    world: function (m, u) { PL.space({}); var fl = this.flag; S.layer(1, function () { ctx.save(); ctx.translate(-190, -10); ctx.strokeStyle = "#cfd6de"; ctx.lineWidth = 8; for (var i = -1; i <= 1; i += 2) { ctx.beginPath(); ctx.moveTo(i * 36, -90); ctx.lineTo(i * 100, 0); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-50, -90); ctx.lineTo(-30, -190); ctx.quadraticCurveTo(0, -260, 30, -190); ctx.lineTo(50, -90); ctx.closePath(); ol("#e8ecf2"); ctx.beginPath(); ctx.arc(0, -168, 14, 0, 6.283); ol("#7fc8ee", 3); ctx.restore(); if (fl > 0) { ctx.fillStyle = "#cfd6de"; ctx.fillRect(398, -10 - 300 * fl, 6, 300 * fl); if (fl > 0.6) { ctx.beginPath(); ctx.moveTo(404, -300 * fl + 10); ctx.quadraticCurveTo(450, -290 * fl + 22, 500, -300 * fl + 10); ctx.lineTo(500, -300 * fl + 90); ctx.quadraticCurveTo(450, -300 * fl + 100, 404, -300 * fl + 90); ctx.closePath(); ol("#e8e8f0", 2); ctx.fillStyle = "#2c4a9a"; ctx.fillRect(404, -300 * fl + 14, 40, 40); } } drawPuffs(1 / 30); }); },
    shots: [{ a: 0, views: { A: "side" }, cam: function (v) { return { x: lerp(-120, 60, v), y: -150, z: 1.1 }; } }, { a: 0.32, cam: follow(A, 1.4, 1.65, 120, -120) }, { a: 0.55, views: { A: "back" }, cam: function (v) { return { x: A.x + 60, y: -200, z: lerp(1.2, 1.45, ease(v)) }; } }, { a: 0.8, cam: function (v) { return { x: 200, y: lerp(-180, -330, ease(v)), z: lerp(1.1, 0.8, ease(v)) }; } }] });

  // --- OCEAN: diver sinks down through the water ---
  scene({ text: "", dur: 8, chapter: "Dive", tod: "day", tags: "dive",
    setup: function () { A.key = "diver"; put(A, -380, 1, { pose: "swim", ex: "happy", y: -1000 }); A.rotv = 2.6; this.dp = 0; },
    update: function (u, dt) { var e = ease(u); A.pose = "swim"; A.rotv = lerp(2.65, 1.75, ease(Math.min(1, u * 1.2))); A.x = lerp(-380, 220, e) + Math.sin(u * 9) * 14; A.y = lerp(-1000, -120, e); A.ex = "happy"; this.dp = u * 0.55;
      var ax = A.x + Math.sin(A.rotv) * 150 * 0 , ay = A.y; if (Math.random() < 0.8) puff(A.x - 20, A.y + 40, 1, "#e6f6ff", 9, -70);
      if (u < 0.22 && Math.random() < 0.9) puff(A.x + (Math.random() - 0.5) * 120, -1000 + (Math.random() * 60), 1, "#ffffff", 14, 40); },
    world: function (m, u) { darkOcean(this.dp); S.layer(1, function () { drawPuffs(1 / 30); }); },
    shots: [{ a: 0, roll: 0.05, cam: function (v) { return { x: -80, y: -820 + v * 160, z: 0.75 }; } }, { a: 0.25, views: { A: "side" }, cam: function (v) { return { x: A.x + 80, y: A.y - 40, z: lerp(1.1, 1.3, v) }; } }, { a: 0.55, roll: -0.06, cam: function (v) { return { x: A.x + 160, y: A.y + 60, z: lerp(0.8, 1.2, ease(v)) }; } }, { a: 0.82, cam: function (v) { return { x: A.x + 40, y: A.y - 160, z: lerp(0.9, 0.7, ease(v)) }; } }] });

  // --- OCEAN: whale swims past, diver watches ---
  scene({ text: "", dur: 8, chapter: "Whale", tod: "day", tags: "whale",
    setup: function () { A.key = "diver"; put(A, -120, 1, { pose: "look", ex: "shock", look: [1, -0.2] }); this.wx = 1600; },
    update: function (u, dt) { this.wx = lerp(1700, -1700, u); A.ex = u < 0.4 ? "shock" : "happy"; A.pose = u > 0.3 && u < 0.7 ? "point" : "look"; A.look = [(this.wx - A.x) > 0 ? 1 : -1, -0.3]; A.face = this.wx > A.x ? 1 : -1; },
    world: function (m, u) { darkOcean(0.35); var wx = this.wx; S.layer(0.85, function () { whaleDraw(wx, -330, 1250, S.time, 1); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(300, 0, ease(v)), y: -260, z: 0.7 }; } }, { a: 0.3, views: { A: "back" }, fg: [], cam: function (v) { return { x: A.x + 160, y: -240, z: lerp(0.9, 1.0, v) }; } }, { a: 0.62, cam: head(A, 1.9, 2.2, 40, 250) }] });

  // --- OCEAN: submarine descending past glowing fish ---
  scene({ text: "", dur: 8, chapter: "Sub", tod: "day", tags: "sub",
    setup: function () { },
    world: function (m, u) { darkOcean(0.5 + u * 0.2); var t = S.time; S.layer(0.7, function () { var r = S.rng(7); for (var i = 0; i < 16; i++) { var fx = -900 + r() * 1800, fy = -500 + r() * 520 + Math.sin(t + i) * 12; ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = S.rgrad(fx, fy, 1, 22, [[0, "rgba(120,255,230,.9)"], [1, "rgba(0,255,200,0)"]]); ctx.beginPath(); ctx.arc(fx, fy, 22, 0, 6.283); ctx.fill(); ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#0b2a3a"; ctx.beginPath(); ctx.ellipse(fx, fy, 16, 8, 0, 0, 6.283); ctx.fill(); } }); S.layer(1, function () { subDraw(lerp(-500, 420, ease(u)), lerp(-560, -220, ease(u)), t, 1, 1.5); }); },
    shots: [{ a: 0, nochars: true, cam: function (v) { return { x: lerp(-500, 420, ease(v * 0.5)), y: lerp(-560, -400, ease(v * 0.5)) + 40, z: 0.62 }; } }, { a: 0.5, nochars: true, cam: function (v) { return { x: lerp(-500, 420, ease(0.5 + v * 0.5)) + 40, y: lerp(-560, -220, ease(0.5 + v * 0.5)) - 30, z: lerp(0.62, 0.8, ease(v)) }; } }] });

  // --- OCEAN: the dark trench, glowing creatures, diver with lamp ---
  scene({ text: "", dur: 8, chapter: "Trench", tod: "night", tags: "trench",
    setup: function () { A.key = "diver"; put(A, -300, 1, { pose: "walk", ex: "shock" }); },
    update: function (u, dt) { A.x = lerp(-300, 160, u); A.ex = u > 0.5 ? "shock" : "neutral"; },
    world: function (m, u) { darkOcean(0.82); var t = S.time; S.layer(0.9, function () { anglerDraw(lerp(1200, 150, ease(u)), -300 + Math.sin(t) * 20, 1.5, t); jellyDraw(-400, -520 + Math.sin(t * 0.7) * 30, 1.6, t, "rgba(220,120,255"); jellyDraw(520, -600 + Math.sin(t * 0.6 + 2) * 30, 1.2, t + 1, "rgba(120,200,255"); }); },
    foreground: function () { lamp(A, true); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-200, 40, v), y: -250, z: 0.8 }; } }, { a: 0.4, views: { A: "side" }, cam: follow(A, 1.3, 1.5, 150, -190) }, { a: 0.7, cam: head(A, 2.2, 2.5, 70, 250) }] });


  // ================= MODERN / MONEY STORY SET PIECES =================
  var lt = S.lt, dk = S.dk; function sparkBurst(x, y) { emit(x, y, 5, "#ffcc66", 0.5); }
  var PAL = { dawn: { s0: "#2b2f5a", s1: "#f2a27a", far: "#7c6f9c", mid: "#4f4a78", near: "#2e2c52", haze: "rgba(255,170,130,.28)", lit: "#ffd89a" },
    day: { s0: "#6fb4ec", s1: "#e3f2ff", far: "#a9c3da", mid: "#7f9db8", near: "#5b7896", haze: "rgba(230,242,255,.35)", lit: "#bfe2ff" },
    dusk: { s0: "#4a3a72", s1: "#f29a62", far: "#9a6f92", mid: "#6a4a7c", near: "#3e2e5c", haze: "rgba(255,160,110,.3)", lit: "#ffd27a" },
    night: { s0: "#0b1030", s1: "#2a2f66", far: "#2a3060", mid: "#1c2148", near: "#12162e", haze: "rgba(90,110,200,.2)", lit: "#ffe08a" },
    rain: { s0: "#2d3446", s1: "#6a7488", far: "#586178", mid: "#434b60", near: "#2c3244", haze: "rgba(150,165,190,.3)", lit: "#ffe39a" } };
  function mixc(c, a) { return c; }
  function mBuilding(x, w, hh, col, lit, pal, seed) { var g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, lt(col, 0.18)); g.addColorStop(0.5, col); g.addColorStop(1, dk(col, 0.22)); ctx.fillStyle = g; ctx.fillRect(x, -hh, w, hh + 60); var sb = (seed % 3 === 0); if (sb) { ctx.fillRect(x + w * 0.18, -hh - 46, w * 0.64, 48); } ctx.fillStyle = dk(col, 0.3); ctx.fillRect(x, -hh, w, 5); if (seed % 4 === 1) { ctx.fillRect(x + w * 0.45, -hh - 90, 4, 90); if (Math.sin(S.time * 3 + seed) > 0) { ctx.fillStyle = "#ff4a3a"; ctx.beginPath(); ctx.arc(x + w * 0.45 + 2, -hh - 92, 4, 0, 6.283); ctx.fill(); } } if (seed % 4 === 2) { ctx.fillStyle = dk(col, 0.35); ctx.fillRect(x + w * 0.2, -hh - 26, w * 0.28, 24); }
    if (lit) for (var yy = -hh + 18; yy < 20; yy += 30) for (var xx = x + 10; xx < x + w - 14; xx += 22) { var r = Math.abs(Math.sin(xx * 12.9 + yy * 7.3 + seed)); ctx.fillStyle = r > 0.62 ? pal.lit : (r > 0.3 ? "rgba(120,150,200,.35)" : "rgba(10,14,30,.35)"); ctx.fillRect(xx, yy, 13, 17); } }
  function mCity(tod, withRoad) { var pal = PAL[tod] || PAL.day; mSky(pal.s0, pal.s1);
    S.layer(0.05, function () { var v = S.viewRect(0.05); ctx.fillStyle = "rgba(255,240,200,.35)"; ctx.beginPath(); ctx.arc(200, -700, 140, 0, 6.283); ctx.fill(); });
    [[0.22, pal.far, 0, 380, 700], [0.42, pal.mid, 7, 300, 560], [0.7, pal.near, 13, 220, 420]].forEach(function (L, li) { S.layer(L[0], function () { var v = S.viewRect(L[0]), step = 130 + li * 20; for (var x = Math.floor(v.l / step) * step; x < v.r + step; x += step) { var n = Math.abs(x / step | 0), hh = L[3] + (Math.abs(Math.sin(n * 1.7 + L[2])) * L[4]) * 0.8; mBuilding(x + (n % 3) * 8, step - 14 - (n % 2) * 10, hh, L[1], li > 0, pal, n + L[2]); } var g = ctx.createLinearGradient(0, -400, 0, 60); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, pal.haze); ctx.fillStyle = g; ctx.fillRect(v.l, -400, v.r - v.l, 460); }); });
    if (withRoad !== false) S.layer(1, function () { var v = S.viewRect(1); var g = ctx.createLinearGradient(0, -10, 0, 600); g.addColorStop(0, "#4a4d58"); g.addColorStop(1, "#1d1f27"); ctx.fillStyle = g; ctx.fillRect(v.l, -10, v.r - v.l, 720); ctx.fillStyle = "#8a8d98"; ctx.fillRect(v.l, -10, v.r - v.l, 22); ctx.fillStyle = "rgba(255,255,255,.55)"; for (var x = Math.floor(v.l / 160) * 160; x < v.r + 160; x += 160) ctx.fillRect(x, 160, 80, 8);
      for (var lx = Math.floor(v.l / 700) * 700; lx < v.r + 700; lx += 700) { ctx.fillStyle = "#2a2d36"; ctx.fillRect(lx, -760, 12, 760); ctx.fillRect(lx, -760, 110, 10); ctx.fillStyle = "#3a3e4a"; ctx.fillRect(lx + 88, -758, 44, 18); var gl = ctx.createRadialGradient(lx + 110, -730, 4, lx + 110, -730, 300); gl.addColorStop(0, "rgba(255,226,150," + (tod === "day" ? 0.0 : 0.55) + ")"); gl.addColorStop(1, "rgba(255,226,150,0)"); ctx.fillStyle = gl; ctx.fillRect(lx - 200, -1030, 620, 620); }
      for (var c = 0; c < 3; c++) { var sp = 200, per = 4800, cx = ((S.time * sp + c * 1600) % per) - 1400 + (v.l + v.r) / 2, cy = 330 + c * 10, cc = ["#c0392b", "#2c6fb0", "#e8c14a"][c]; carDraw(cx, cy, cc, S.time * 9 + c); } }); }
  // true-to-scale car: person = ~330 units, car = 4.5 m long = ~850 units, 1.45 m high = ~270
  function carDraw(x, y, col, spin) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(430, 6, 440, 22, 0, 0, 6.283); ctx.fill(); var g = ctx.createLinearGradient(0, -260, 0, 0); g.addColorStop(0, lt(col, 0.25)); g.addColorStop(1, dk(col, 0.25)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -60); ctx.quadraticCurveTo(0, -150, 70, -154); ctx.lineTo(210, -160); ctx.quadraticCurveTo(290, -262, 400, -262); ctx.lineTo(560, -258); ctx.quadraticCurveTo(650, -240, 700, -156); ctx.lineTo(800, -140); ctx.quadraticCurveTo(850, -120, 850, -60); ctx.lineTo(850, -34); ctx.lineTo(0, -34); ctx.closePath(); ctx.fill(); ctx.strokeStyle = dk(col, 0.45); ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "rgba(170,215,245,.85)"; ctx.beginPath(); ctx.moveTo(250, -166); ctx.quadraticCurveTo(310, -244, 396, -246); ctx.lineTo(420, -246); ctx.lineTo(420, -166); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(446, -246); ctx.lineTo(552, -242); ctx.quadraticCurveTo(620, -226, 660, -166); ctx.lineTo(446, -166); ctx.closePath(); ctx.fill(); ctx.fillStyle = dk(col, 0.35); ctx.fillRect(425, -246, 16, 82); ctx.fillStyle = "rgba(255,240,170,.95)"; ctx.beginPath(); ctx.ellipse(836, -104, 14, 20, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = "#d33"; ctx.fillRect(0, -100, 10, 26); [150, 690].forEach(function (wx) { ctx.fillStyle = "#15161b"; ctx.beginPath(); ctx.arc(wx, -44, 62, 0, 6.283); ctx.fill(); ctx.fillStyle = "#b8bcc6"; ctx.beginPath(); ctx.arc(wx, -44, 34, 0, 6.283); ctx.fill(); ctx.strokeStyle = "#6a6e78"; ctx.lineWidth = 5; for (var i = 0; i < 5; i++) { var an = spin + i * 1.2566; ctx.beginPath(); ctx.moveTo(wx, -44); ctx.lineTo(wx + Math.cos(an) * 32, -44 + Math.sin(an) * 32); ctx.stroke(); } }); ctx.restore(); }
  function mSky(c0, c1) { S.layer(0, function () { var v = S.viewRect(0); ctx.fillStyle = S.vgrad(v.t, v.b, [[0, c0], [1, c1]]); ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); }); }
  function mGround(c0, c1) { S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = S.vgrad(-10, 700, [[0, c0], [1, c1]]); ctx.fillRect(v.l, -10, v.r - v.l, 720); ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(v.l, -10, v.r - v.l, 6); }); }
  function mStack(x, y, n) { for (var i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? "#3f9b57" : "#4cb06a"; ctx.fillRect(x - 24, y - 10 - i * 9, 48, 9); ctx.strokeStyle = "#1f5a31"; ctx.lineWidth = 1.5; ctx.strokeRect(x - 24, y - 10 - i * 9, 48, 9); ctx.fillStyle = "#d9f2c9"; ctx.fillRect(x - 6, y - 8 - i * 9, 12, 5); } }
  function mBill(x, y, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = "#6cc487"; ctx.fillRect(-22, -10, 44, 20); ctx.strokeStyle = "#1f5a31"; ctx.lineWidth = 2; ctx.strokeRect(-22, -10, 44, 20); ctx.fillStyle = "#1f5a31"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.fillText("$", 0, 5); ctx.restore(); }
  function mCoin(x, y, r) { ctx.fillStyle = "#f4c430"; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.strokeStyle = "#a07a10"; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = "#a07a10"; ctx.font = "bold " + (r * 1.2 | 0) + "px sans-serif"; ctx.textAlign = "center"; ctx.fillText("$", x, y + r * 0.42); }
  function mText(t, x, y, sz, col) { ctx.fillStyle = col || "#fff"; ctx.font = "bold " + sz + "px sans-serif"; ctx.textAlign = "center"; ctx.fillText(t, x, y); }
  function mGear(x, y, r, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = "#8a95a5"; ctx.strokeStyle = "#39424f"; ctx.lineWidth = 3; for (var i = 0; i < 10; i++) { ctx.rotate(0.628); ctx.fillRect(-6, -r - 10, 12, 20); } ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#39424f"; ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, 6.283); ctx.fill(); ctx.restore(); }
  var coinsFly = [];
  function flyCoins(dt, draw) { coinsFly = coinsFly.filter(function (c) { c.t += dt / c.d; return c.t < 1; }); if (draw) coinsFly.forEach(function (c) { var e = c.t, x = lerp(c.x0, c.x1, e), y = lerp(c.y0, c.y1, e) - Math.sin(e * Math.PI) * c.h; if (c.bill) mBill(x, y, e * 6); else mCoin(x, y, c.r || 12); }); }
  function shootCoin(x0, y0, x1, y1, bill) { coinsFly.push({ x0: x0, y0: y0, x1: x1, y1: y1, t: 0, d: 0.9, h: 90, r: 12, bill: bill }); }
  function factoryBG(t) { mSky("#3a4150", "#555e6e"); S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = S.vgrad(-700, 100, [[0, "#596273"], [1, "#3c4352"]]); ctx.fillRect(v.l, -700, v.r - v.l, 800); ctx.fillStyle = "#2d3441"; for (var x = Math.floor(v.l / 220) * 220; x < v.r + 220; x += 220) { ctx.fillRect(x + 20, -560, 140, 230); var wg = ctx.createLinearGradient(0, -552, 0, -340); wg.addColorStop(0, "#a8cdee"); wg.addColorStop(1, "#6f93b8"); ctx.fillStyle = wg; ctx.fillRect(x + 28, -552, 124, 214); ctx.fillStyle = "#2d3441"; ctx.fillRect(x + 88, -552, 4, 214); } ctx.fillStyle = "#6c717a"; ctx.fillRect(v.l, -40, v.r - v.l, 60); ctx.fillStyle = "#1f242d"; ctx.fillRect(v.l, -48, v.r - v.l, 8);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-120, -420, 52, 0, 6.283); ctx.fill(); ctx.strokeStyle = "#222"; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-120, -420); ctx.lineTo(-120 + Math.sin(t * 2.5) * 36, -420 - Math.cos(t * 2.5) * 36); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-120, -420); ctx.lineTo(-120 + Math.sin(t * 0.21) * 26, -420 - Math.cos(t * 0.21) * 26); ctx.stroke(); }); }
  function machineDraw(x, t, lever) { ctx.fillStyle = "#4b5668"; ctx.fillRect(x - 90, -300, 180, 300); ctx.fillStyle = "#c0392b"; ctx.fillRect(x - 70, -280, 140, 70); ctx.fillStyle = "#222"; ctx.fillRect(x - 70, -170, 140, 120); mGear(x - 30, -110, 30, t * 2.4); mGear(x + 28, -90, 22, -t * 3.4); ctx.fillStyle = "#222"; ctx.fillRect(x + 50, -330, 18, 40); ctx.strokeStyle = "#cfcfcf"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x - 110, -150); ctx.lineTo(x - 110 + Math.sin(lever) * 26, -230 + Math.abs(Math.cos(lever)) * -10); ctx.stroke(); ctx.fillStyle = "#e84a3a"; ctx.beginPath(); ctx.arc(x - 110 + Math.sin(lever) * 26, -232, 12, 0, 6.283); ctx.fill(); }

  // 1 walking to the factory at dawn
  scene({ text: "", dur: 8, chapter: "Walk", tod: "dawn", tags: "m_walk",
    setup: function () { coinsFly = []; A.key = "builder"; put(A, -520, 1, { pose: "walk", ex: "sad", item: null, act: null }); this.t = 0; },
    update: function (u, dt) { this.t += dt; A.x = lerp(-520, 260, u); A.pose = "walk"; A.act = null; A.ex = u > 0.5 ? "sad" : "neutral"; },
    world: function (m, u) { mCity("dawn", true); S.layer(1, function () { ctx.fillStyle = "#3b4150"; ctx.fillRect(420, -420, 360, 420); ctx.fillStyle = "#2a2f3a"; ctx.fillRect(560, -520, 40, 100); ctx.fillRect(660, -560, 40, 140); ctx.fillStyle = "rgba(255,226,150,.8)"; for (var i = 0; i < 5; i++) ctx.fillRect(450 + i * 64, -340, 38, 48); mText("FACTORY", 600, -440, 30, "#ffd6a0"); ctx.fillStyle = "#111"; ctx.fillRect(540, -400, 170, 400); }); },
    shots: [{ a: 0, cam: function (v) { return { x: A.x + 160, y: -190, z: lerp(0.8, 1.0, v) }; } }, { a: 0.5, cam: function (v) { return { x: A.x + 60, y: -230, z: lerp(1.05, 1.6, ease(v)) }; } }, { a: 0.82, cam: function (v) { return { x: A.x + 20, y: -250, z: lerp(1.6, 2.3, ease(v)) }; } }] });

  // 2 ten hours on the line: lever, hammer, clock spinning, products coming out
  scene({ text: "", dur: 9, chapter: "Factory", tod: "day", tags: "m_factory",
    setup: function () { coinsFly = []; A.key = "builder"; put(A, -40, 1, { pose: "idle", act: "lever", ex: "sad", item: null }); put(R[0], 330, -1, { key: "builder2", pose: "idle", act: "hammer", ex: "sad", item: "wrench" }); this.t = 0; },
    update: function (u, dt) { this.t += dt * (1 + u * 1.2); A.act = "lever"; A.ex = u > 0.6 ? "sad" : "neutral"; if (Math.sin(this.t * 4.2) > 0.96) { sparkBurst(R[0].x - 80, -120); } if (Math.random() < 0.2) puff(140, -330, 1, "#cfcfcf", 16, -50); },
    world: function (m, u) { var t = this.t || 0; factoryBG(t * 3); S.layer(1, function () { machineDraw(140, t, t * 3.2); for (var bx = -700 - ((t * 120) % 220); bx < 900; bx += 220) { ctx.fillStyle = "#7a7f86"; ctx.fillRect(bx, -58, 190, 16); ctx.fillStyle = "#c28a4a"; ctx.fillRect(bx + 50, -118, 70, 62); ctx.strokeStyle = "#7a5128"; ctx.lineWidth = 3; ctx.strokeRect(bx + 50, -118, 70, 62); ctx.fillStyle = "#e8c38a"; ctx.fillRect(bx + 76, -118, 14, 62); } drawPuffs(1 / 30); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-200, 40, v), y: -200, z: 0.8 }; } }, { a: 0.28, cam: function (v) { return { x: lerp(40, 90, v), y: -200, z: lerp(1.0, 1.7, ease(v)) }; } }, { a: 0.55, cam: function (v) { return { x: lerp(120, 300, ease(v)), y: -180, z: lerp(1.3, 1.5, v) }; } }, { a: 0.8, cam: function (v) { return { x: lerp(0, -30, v), y: -250, z: lerp(2.0, 2.5, ease(v)) }; } }] });

  // 3 glass office: the businessman counts the money
  scene({ text: "", dur: 9, chapter: "Office", tod: "dusk", tags: "m_office",
    setup: function () { coinsFly = []; A.key = "tycoon"; put(A, 40, -1, { pose: "sit", act: "count", ex: "smug", item: null }); this.t = 0; this.cnt = 0; },
    update: function (u, dt) { this.t += dt; this.cnt = Math.floor(u * u * 4800000 / 1000) * 1000 + 12000; A.act = "count"; if (Math.random() < 0.35) shootCoin(A.x - 50, -150, A.x - 130 - Math.random() * 40, -140 - Math.random() * 40, true); },
    world: function (m, u) { var t = this.t || 0, self = this; mCity("dusk", false); S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "#1b1624"; ctx.fillRect(v.l, -10, v.r - v.l, 720); ctx.fillStyle = "rgba(170,215,255,.1)"; for (var x = Math.floor(v.l / 220) * 220; x < v.r + 220; x += 220) ctx.fillRect(x, -820, 8, 820);
      ctx.fillStyle = "#5a3b22"; ctx.fillRect(-170, -120, 280, 22); ctx.fillRect(-150, -98, 18, 98); ctx.fillRect(76, -98, 18, 98); ctx.fillStyle = "#c9a14a"; ctx.fillRect(-170, -126, 280, 6);
      var np = Math.min(10, 2 + Math.floor(u * 10)); mStack(-120, -126, np); mStack(-70, -126, Math.max(1, np - 3)); mStack(-20, -126, Math.max(1, np - 5)); ctx.fillStyle = "#111823"; ctx.fillRect(-300, -250, 150, 90); ctx.fillStyle = "#7be39a"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center"; ctx.fillText("$" + self.cnt.toLocaleString("en-US"), -225, -195); ctx.fillStyle = "#4cb06a"; for (var k = 0; k < 6; k++) ctx.fillRect(-290 + k * 22, -165 - k * 5 - Math.abs(Math.sin(t * 2 + k)) * 6, 12, 8 + k * 5); flyCoins(1 / 30, true); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-260, -30, v), y: -330, z: lerp(0.62, 0.85, v) }; } }, { a: 0.3, cam: function (v) { return { x: lerp(-40, 10, v), y: -190, z: lerp(1.0, 1.7, ease(v)) }; } }, { a: 0.62, cam: function (v) { return { x: lerp(-40, -140, ease(v)), y: -170, z: lerp(1.7, 1.2, ease(v)) }; } }, { a: 0.85, cam: function (v) { return { x: 20, y: -200, z: lerp(1.2, 2.3, ease(v)) }; } }] });

  // 4 relaxing: he did not work harder
  scene({ text: "", dur: 8, chapter: "Relax", tod: "dusk", tags: "m_relax",
    setup: function () { coinsFly = []; A.key = "tycoon"; put(A, 0, -1, { pose: "sit", act: "sip", ex: "happy", item: null }); this.t = 0; },
    update: function (u, dt) { this.t += dt; A.act = "sip"; },
    world: function (m, u) { var t = this.t || 0; mSky("#f2a35a", "#4a3a72"); S.layer(0.3, function () { var v = S.viewRect(0.3); ctx.fillStyle = S.vgrad(-120, 400, [[0, "#3a6aa8"], [1, "#1c3a6a"]]); ctx.fillRect(v.l, -120, v.r - v.l, 600); ctx.fillStyle = "rgba(255,200,120,.35)"; for (var i = 0; i < 12; i++) ctx.fillRect(v.l + ((i * 233 + t * 20) % (v.r - v.l)), -110 + i * 8, 60, 3); }); S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "#b98a5a"; ctx.fillRect(v.l, -10, v.r - v.l, 720); ctx.fillStyle = "#8a6240"; for (var x = Math.floor(v.l / 60) * 60; x < v.r + 60; x += 60) ctx.fillRect(x, -10, 2, 720);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(-240, -420, 8, 420); ctx.beginPath(); ctx.moveTo(-232, -420); ctx.lineTo(-232, -130); ctx.lineTo(-90, -130); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#e8e8ee"; ctx.beginPath(); ctx.moveTo(-232, -400); ctx.lineTo(-232, -150); ctx.lineTo(-330, -150); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#d96a3a"; ctx.fillRect(-130, -80, 230, 28); ctx.fillRect(-150, -60, 14, 60); ctx.fillRect(86, -60, 14, 60); ctx.fillStyle = "#f2d9a0"; ctx.fillRect(-120, -108, 200, 28); ctx.fillStyle = "#6a3f1a"; ctx.fillRect(170, -90, 8, 90); ctx.fillStyle = "#2f9a52"; for (var l = 0; l < 6; l++) { ctx.save(); ctx.translate(174, -94); ctx.rotate(-1.4 + l * 0.55 + Math.sin(t + l) * 0.04); ctx.fillRect(0, -6, 90, 12); ctx.restore(); } ctx.fillStyle = "#e8c14a"; ctx.fillRect(110, -60, 36, 40); ctx.fillStyle = "#ff7a3a"; ctx.fillRect(114, -78, 8, 20); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-140, -30, v), y: -250, z: lerp(0.65, 0.85, v) }; } }, { a: 0.4, cam: function (v) { return { x: lerp(-30, 10, v), y: -190, z: lerp(1.1, 1.8, ease(v)) }; } }, { a: 0.78, cam: function (v) { return { x: lerp(10, 220, ease(v)), y: -260, z: lerp(1.2, 0.7, ease(v)) }; } }] });

  // 5 asleep while the machines earn: window onto a factory pouring coins into his vault
  scene({ text: "", dur: 9, chapter: "Sleep", tod: "night", tags: "m_sleep",
    setup: function () { coinsFly = []; A.key = "tycoon"; put(A, -50, 1, { pose: "down", ex: "happy", item: null, fall: 1, act: null, y: -128 }); this.t = 0; },
    update: function (u, dt) { this.t += dt; A.fall = 1; A.y = -128; A.pose = "down"; A.act = null; if (Math.random() < 0.5) shootCoin(300, -220, 20 + Math.random() * 80, -60, false); if (Math.random() < 0.04) puff(-120, -140, 1, "#e8f0ff", 10, -60); },
    world: function (m, u) { var t = this.t || 0; S.layer(0, function () { var v = S.viewRect(0); ctx.fillStyle = S.vgrad(v.t, v.b, [[0, "#14183a"], [1, "#2a2f66"]]); ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); }); S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "#3a2a4a"; ctx.fillRect(v.l, -10, v.r - v.l, 720);
      ctx.fillStyle = "#e8eefc"; ctx.fillRect(-420, -520, 20, 520); ctx.fillStyle = "#1a2040"; ctx.fillRect(-380, -120, 360, 120); ctx.fillStyle = "#cfd8f0"; ctx.fillRect(-380, -150, 360, 34); ctx.fillStyle = "#7a8fd0"; ctx.fillRect(-100, -160, 90, 40);
      ctx.fillStyle = "#0a0e24"; ctx.fillRect(120, -520, 480, 400); var wg = ctx.createLinearGradient(0, -520, 0, -120); wg.addColorStop(0, "#1c2a5a"); wg.addColorStop(1, "#46386a"); ctx.fillStyle = wg; ctx.fillRect(132, -508, 456, 376); ctx.fillStyle = "#2b2f3d"; ctx.fillRect(132, -240, 456, 108); machineDraw(480, t, t * 3); ctx.fillStyle = "#c9a14a"; for (var bx = 140 - ((t * 150) % 120); bx < 380; bx += 120) { ctx.fillRect(bx, -196, 60, 18); } ctx.fillStyle = "#e8c14a"; ctx.fillRect(40, -170, 70, 170); ctx.fillStyle = "#6a5a10"; mText("$", 75, -80, 54, "#6a5a10"); ctx.strokeStyle = "#e8eefc"; ctx.lineWidth = 3; ctx.fillStyle = "#e8eefc"; ctx.font = "bold " + (28 + Math.sin(t) * 3 | 0) + "px sans-serif"; ctx.fillText("Z", -140 + Math.sin(t * 1.5) * 8, -240 - (t * 30) % 60); ctx.font = "bold 40px sans-serif"; ctx.fillText("Z", -110, -300 - (t * 30) % 70); flyCoins(1 / 30, true); drawPuffs(1 / 30); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-230, -200, v), y: -190, z: lerp(1.4, 2.1, ease(v)) }; } }, { a: 0.4, cam: function (v) { return { x: lerp(-160, 260, ease(v)), y: -230, z: lerp(1.0, 0.8, ease(v)) }; } }, { a: 0.78, cam: function (v) { return { x: lerp(260, 70, ease(v)), y: -170, z: lerp(0.9, 1.5, ease(v)) }; } }] });

  // 6 "Money makes money": a money tree he harvests
  scene({ text: "", dur: 8, chapter: "Tree", tod: "day", tags: "m_talk",
    setup: function () { coinsFly = []; A.key = "tycoon"; put(A, -140, 1, { pose: "talk", ex: "smug", item: null, act: null }); this.t = 0; },
    update: function (u, dt) { this.t += dt; A.pose = "talk"; A.ex = "smug"; if (Math.random() < 0.2) shootCoin(120 + Math.random() * 100, -420, A.x + 70, -120, false); },
    world: function (m, u) { var t = this.t || 0; mCity("day", true); S.layer(1, function () { ctx.fillStyle = "#6a4a2a"; ctx.fillRect(150, -330, 34, 330); ctx.fillStyle = "#2f9a52"; [[170, -430, 190], [90, -380, 130], [260, -380, 130]].forEach(function (b) { ctx.beginPath(); ctx.arc(b[0], b[1], b[2] * 0.7, 0, 6.283); ctx.fill(); }); for (var i = 0; i < 14; i++) { var a = i * 2.4; mCoin(170 + Math.cos(a) * (40 + i * 6), -420 + Math.sin(a) * (30 + i * 5) + Math.sin(t * 2 + i) * 2, 13); } flyCoins(1 / 30, true); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-20, 0, v), y: -230, z: lerp(0.8, 1.2, ease(v)) }; } }, { a: 0.4, cam: function (v) { return { x: lerp(-100, -120, v), y: -250, z: lerp(1.4, 2.4, ease(v)) }; } }, { a: 0.8, cam: function (v) { return { x: lerp(-100, 100, ease(v)), y: -290, z: lerp(2.0, 0.9, ease(v)) }; } }] });

  // 7 saving vs rising prices
  scene({ text: "", dur: 9, chapter: "Rent", tod: "dusk", tags: "m_rent",
    setup: function () { coinsFly = []; A.key = "builder"; put(A, -150, 1, { pose: "idle", act: "carry", ex: "sad", item: null }); this.t = 0; this.jar = 0; },
    update: function (u, dt) { this.t += dt; if (Math.random() < 0.05 && u > 0.1) { shootCoin(A.x + 60, -190, 60, -70, false); this.jar += 0.03; } A.act = "carry"; },
    world: function (m, u) { var self = this; mCity("dusk", true); S.layer(1, function () { ctx.fillStyle = "#222c38"; ctx.fillRect(220, -560, 330, 360); ctx.fillStyle = "#e8e8ee"; ctx.fillRect(228, -552, 314, 344); mText("PRICES vs MY SAVINGS", 385, -520, 22, "#222c38"); ctx.strokeStyle = "#e84a3a"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(250, -250); ctx.lineTo(320, -320 - u * 40); ctx.lineTo(400, -360 - u * 100); ctx.lineTo(520, -480 - u * 40); ctx.stroke(); ctx.strokeStyle = "#2f9a52"; ctx.beginPath(); ctx.moveTo(250, -250); ctx.lineTo(520, -250 - u * 30); ctx.stroke(); mText("prices", 470, -420, 20, "#e84a3a"); mText("savings", 470, -228, 20, "#2f9a52");
      ctx.fillStyle = "#f2b8c8"; ctx.beginPath(); ctx.ellipse(60, -34, 34, 25, 0, 0, 6.283); ctx.fill(); ctx.fillRect(48, -62, 22, 6); ctx.fillStyle = "#e8c14a"; ctx.fillRect(52, -54, 12, 14 * Math.min(1, self.jar + 0.1)); flyCoins(1 / 30, true); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-120, 0, v), y: -220, z: lerp(0.8, 1.1, v) }; } }, { a: 0.38, cam: function (v) { return { x: lerp(40, 80, v), y: -140, z: lerp(1.6, 2.2, ease(v)) }; } }, { a: 0.66, cam: function (v) { return { x: lerp(80, 360, ease(v)), y: -330, z: lerp(1.1, 0.95, ease(v)) }; } }] });

  // 8 the bank: he borrows, buys buildings, tenants pay him
  scene({ text: "", dur: 9, chapter: "Bank", tod: "day", tags: "m_bank",
    setup: function () { coinsFly = []; A.key = "tycoon"; put(A, -300, 1, { pose: "walk", ex: "smug", item: null, act: null }); put(R[0], 140, -1, { key: "builder", pose: "walk", ex: "sad", item: null, act: "carry" }); put(R[1], 280, -1, { key: "builder2", pose: "walk", ex: "sad", item: null, act: "carry" }); this.t = 0; },
    update: function (u, dt) { this.t += dt; A.x = lerp(-300, -20, ease(clamp(u / 0.6, 0, 1))); A.pose = u < 0.6 ? "walk" : "cheer"; A.act = null; R[0].x = lerp(380, 80, ease(clamp(u / 0.8, 0, 1))); R[1].x = lerp(520, 200, ease(clamp(u / 0.8, 0, 1))); R[0].pose = R[1].pose = u < 0.8 ? "walk" : "idle"; if (u > 0.3 && Math.random() < 0.15) { shootCoin(R[0].x - 20, -170, A.x + 40, -170, false); } if (u < 0.3 && Math.random() < 0.15) shootCoin(-520, -300, A.x, -170, true); },
    world: function (m, u) { mCity("day", true); S.layer(1, function () { ctx.fillStyle = "#e9e3d6"; ctx.fillRect(-820, -640, 520, 640); ctx.beginPath(); ctx.moveTo(-850, -640); ctx.lineTo(-560, -780); ctx.lineTo(-270, -640); ctx.fill(); ctx.fillStyle = "#c9c1b0"; for (var i = 0; i < 6; i++) ctx.fillRect(-800 + i * 85, -620, 38, 620); ctx.fillStyle = "#6a5a2a"; ctx.fillRect(-590, -400, 150, 400); mText("BANK", -560, -668, 44, "#6a5a2a"); var nb = Math.floor(u * 5); for (var b = 0; b < 5; b++) { var gr = b < nb ? 1 : (b === nb ? (u * 5 - nb) : 0); if (gr <= 0) continue; var bx = 420 + b * 190, bh = (400 + b * 140) * gr; ctx.fillStyle = b % 2 ? "#3d5a80" : "#2f4a6a"; ctx.fillRect(bx, -bh, 170, bh); ctx.fillStyle = "rgba(255,230,160,.7)"; for (var yy = -bh + 30; yy < -60; yy += 110) { ctx.fillRect(bx + 22, yy, 54, 64); ctx.fillRect(bx + 94, yy, 54, 64); } } flyCoins(1 / 30, true); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-480, -200, v), y: -250, z: 0.72 }; } }, { a: 0.35, cam: function (v) { return { x: lerp(-100, 20, v), y: -200, z: lerp(0.9, 1.4, ease(v)) }; } }, { a: 0.72, cam: function (v) { return { x: lerp(40, 360, ease(v)), y: -300, z: lerp(0.8, 0.65, ease(v)) }; } }] });

  // 9 crisis: bailout for the rich, a box and the rain for the worker
  scene({ text: "", dur: 9, chapter: "Crisis", tod: "storm", weather: "rain", tags: "m_fired",
    setup: function () { coinsFly = []; A.key = "builder"; put(A, 560, -1, { pose: "walk", act: "carry", ex: "sad", item: null }); put(R[0], -300, 1, { key: "tycoon", pose: "cheer", ex: "happy", item: null, act: null }); put(R[1], -180, -1, { key: "tycoon2", pose: "idle", act: "carry", ex: "smug", item: null }); this.t = 0; },
    update: function (u, dt) { this.t += dt; A.x = lerp(560, -80, u); A.pose = "walk"; A.act = "carry"; if (u > 0.05 && u < 0.7 && Math.random() < 0.18) shootCoin(-170, -170, -290, -170, true); R[0].pose = "cheer"; },
    world: function (m, u) { mCity("rain", true); S.layer(1, function () { ctx.fillStyle = "#5a6070"; ctx.fillRect(380, -760, 260, 760); mText("FACTORY", 510, -790, 34, "#c8ccd8"); ctx.fillStyle = "#111"; ctx.fillRect(425, -400, 170, 400); mText("CLOSED", 510, -300, 28, "#e84a3a"); mText("YOU'RE FIRED", 510, -500, 30, "#e84a3a"); flyCoins(1 / 30, true); }); },
    shots: [{ a: 0, cam: function (v) { return { x: lerp(-250, -230, v), y: -220, z: lerp(1.05, 1.4, ease(v)) }; } }, { a: 0.4, cam: function (v) { return { x: lerp(-100, 380, ease(v)), y: -200, z: 0.8 }; } }, { a: 0.7, cam: function (v) { return { x: A.x - 80, y: -200, z: lerp(1.2, 2.0, ease(v)) }; } }] });

  // 10 the lesson children get
  scene({ text: "", dur: 9, chapter: "Kids", tod: "day", tags: "m_kids",
    setup: function () { coinsFly = []; A.key = "tycoon"; put(A, -300, 1, { pose: "point", ex: "happy", item: null, act: null }); put(R[0], -170, 1, { key: "tycoon2", s: 0.58, pose: "look", ex: "happy", item: null, act: null }); put(R[1], 240, -1, { key: "builder", pose: "hold", ex: "sad", item: null, act: "push" }); put(R[2], 380, -1, { key: "builder2", s: 0.58, pose: "hold", ex: "sad", item: null, act: "beg" }); this.t = 0; },
    update: function (u, dt) { this.t += dt; A.pose = Math.sin(this.t * 2) > 0 ? "point" : "talk"; R[1].pose = "idle"; R[1].act = "hammer"; R[1].item = "wrench"; if (Math.random() < 0.04) shootCoin(-100, -300, -170, -120, false); },
    world: function (m, u) { mSky("#9ed2f0", "#e6f4ff"); S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "#2f8a52"; ctx.fillRect(v.l, -10, 760, 720); ctx.fillStyle = "#6a6a72"; ctx.fillRect(40, -10, v.r - 40, 720); ctx.fillStyle = "#e9dcc4"; ctx.fillRect(-900, -620, 560, 620); ctx.fillStyle = "#a33a2a"; ctx.beginPath(); ctx.moveTo(-940, -620); ctx.lineTo(-620, -820); ctx.lineTo(-300, -620); ctx.fill(); ctx.fillStyle = "#8fc3e8"; ctx.fillRect(-860, -520, 120, 140); ctx.fillRect(-520, -520, 120, 140); ctx.fillStyle = "#6a3f1a"; ctx.fillRect(-700, -400, 130, 400);
      ctx.fillStyle = "#fff"; ctx.fillRect(-230, -440, 260, 200); ctx.strokeStyle = "#5a3b22"; ctx.lineWidth = 8; ctx.strokeRect(-230, -440, 260, 200); mText("ASSETS", -100, -405, 26, "#2f6a3a"); ctx.strokeStyle = "#2f9a52"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-210, -270); ctx.lineTo(-150, -310 - u * 20); ctx.lineTo(-90, -350 - u * 40); ctx.lineTo(0, -400 - u * 30); ctx.stroke(); ctx.fillStyle = "#6a5a4a"; ctx.fillRect(150, -380, 300, 380); ctx.fillStyle = "#222c38"; ctx.fillRect(190, -330, 120, 150); mText("WORK = SALARY", 300, -400, 24, "#ffd6a0"); flyCoins(1 / 30, true); }); },
    shots: [{ a: 0, cam: function (v) { return { x: -200, y: -200, z: lerp(1.1, 1.3, v) }; } }, { a: 0.35, cam: function (v) { return { x: lerp(-200, -110, v), y: -190, z: lerp(1.0, 1.9, ease(v)) }; } }, { a: 0.68, cam: function (v) { return { x: lerp(100, 320, ease(v)), y: -200, z: lerp(0.8, 1.6, ease(v)) }; } }] });

  // 11 the gap widens
  scene({ text: "", dur: 10, chapter: "Gap", tod: "dusk", tags: "m_gap",
    setup: function () { coinsFly = []; A.key = "builder"; put(A, 260, -1, { pose: "look", ex: "sad", item: null, act: null }); put(R[0], -260, 1, { key: "tycoon", pose: "cheer", ex: "happy", item: null, act: null }); this.t = 0; },
    update: function (u, dt) { this.t += dt; A.ex = u > 0.7 ? "happy" : "sad"; A.pose = u > 0.8 ? "cheer" : "look"; },
    world: function (m, u) { var g = ease(u); mCity("dusk", true); S.layer(1, function () { ctx.fillStyle = "#3d5a80"; var th = 220 + g * 1500; ctx.fillRect(-420, -th, 240, th); ctx.fillStyle = "rgba(255,230,160,.75)"; for (var yy = -th + 24; yy < -20; yy += 42) for (var xx = -400; xx < -200; xx += 56) ctx.fillRect(xx, yy, 24, 22); mText("$ " + (1 + Math.floor(g * 99)) + "x", -300, -th - 24, 34, "#7be39a"); ctx.fillStyle = "#8a6a4a"; ctx.fillRect(140, -170 - g * 14, 190, 170 + g * 14); ctx.fillStyle = "#7a4a3a"; ctx.beginPath(); ctx.moveTo(130, -170 - g * 14); ctx.lineTo(235, -250 - g * 14); ctx.lineTo(340, -170 - g * 14); ctx.fill(); mText("salary", 235, -280 - g * 14, 24, "#ffd6a0"); if (u > 0.75) { var k = clamp((u - 0.75) / 0.2, 0, 1); for (var i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = k; mStack(380 + i * 54, -10, 3 + i); ctx.restore(); } mText("OWN ASSETS", 470, -300 - k * 20, 34, "#7be39a"); } }); },
    shots: [{ a: 0, cam: function (v) { return { x: 0, y: -260, z: 0.62 }; } }, { a: 0.4, cam: function (v) { return { x: lerp(-100, 0, v), y: lerp(-500, -700, ease(v)), z: lerp(0.5, 0.36, ease(v)) }; } }, { a: 0.72, cam: function (v) { return { x: lerp(120, 300, ease(v)), y: lerp(-500, -230, ease(v)), z: lerp(0.55, 0.9, ease(v)) }; } }] });

  var LIBSET = {}; SCENES.slice(10).forEach(function (sc) { LIBSET[sc.tags] = sc; }); SCENES.length = 10;
  var LIBRULES = [
    ["modern", /\b(gap|own assets|asset|assets|salary)\b/i, "m_gap"], ["modern", /\b(children|taught|families|kids)\b/i, "m_kids"], ["modern", /\b(crisis|lost his job|rescued|fired)\b/i, "m_fired"],
    ["modern", /\b(bank|borrowed|borrow|debts?|buildings)\b/i, "m_bank"], ["modern", /\b(saved|prices)\b/i, "m_rent"], ["modern", /\b(said with a smile|money makes)\b/i, "m_talk"],
    ["modern", /\b(owned|slept|while he slept)\b/i, "m_sleep"], ["modern", /\b(work harder|did not work)\b/i, "m_relax"], ["modern", /\b(office|counting|profits?)\b/i, "m_office"],
    ["modern", /\b(ten hours|built machines|wage)\b/i, "m_factory"], ["modern", /\b(walked|sunrise|empty stomach)\b/i, "m_walk"],
    ["space", /\b(rocket|spacecraft|shuttle)\b.*\b(rose|launch|lift|lifted|took off|blast|ignit)|\blaunchpad\b/i, "launch"], ["space", /\b(drifted|months|silent dark|deep space|journey)\b/i, "cabin"],
    ["space", /\b(red planet|rusty|planet appeared|appeared.*(distance|horizon))\b/i, "approach"], ["space", /\b(landed|landing|touched down)\b|\bstepped (out|onto)\b|\bsmall step\b/i, "landing"],
    ["ocean", /\bsubmarine\b/i, "sub"], ["ocean", /\bsubmarine\b.*\b(sank|descend|dive|dove|beneath)|\bsank slowly\b|\bdiver\b.*\b(sank|dived|dove|beneath)/i, "dive"], ["ocean", /\b(whale|shark|orca|dolphin)\b/i, "whale"],
    ["ocean", /\b(squid|jellyfish|angler|anglerfish|bioluminescent|glowing|lures|creatures|floodlights|trench|pressure|abyss)\b/i, "trench"], ["ocean", /\bsubmarine\b/i, "sub"], ["ocean", /\b(sunlight faded|water turned dark|dark blue)\b/i, "dive"], ["ocean", /\b(bottom|silt|seabed|ocean floor)\b/i, "trench"]
  ];
  // ---------- script-driven director: builds SCENES from a plan JSON (window.__PLAN) ----------
  function buildFromPlan(plan) {
    var BG = { sea: function (m, u) { bgSea({ farShips: true }); W.ship(0.5, lerp(-260, 220, u) * 0.5, -100, 0.62, S.time); }, beach: bgBeach, egypt: bgEgypt, plain: bgPlain, temple: bgTempleFront, hall: bgHall, night: function (m, u) { bgNight(lerp(900, 4200, u)); campfire(330); }, cliff: bgCliff };
    var POSE = { walk: "walk", march: "march", fight: "fight", kneel: "kneel", point: "point", sit: "sit", cheer: "cheer", talk: "talk", look: "look", idle: "idle", hold: "hold", run: "march" };
    var ERAKEY = window.ERAS || {};
    var lastTag = null;
    plan.forEach(function (p, idx) {
      var loc = p.location || "plain", era = p.era || "ancient", act = ((p.characters && p.characters[0] && p.characters[0].action) || "talk"), pose = POSE[act] || "talk";
      var low = p.text.toLowerCase(), pickS = null;
      LIBRULES.forEach(function (r) { if (!pickS && r[0] === era && r[1].test(p.text)) pickS = LIBSET[r[2]]; });
      if (!pickS && era === "ancient") {
        var T0 = function (rx) { return rx.test(low); };
        pickS = T0(/\b(clash|clashed|battle|armies)\b/) ? BUILT[4] : T0(/\b(crown|knelt)\b/) ? BUILT[5] : T0(/\b(council|halls?)\b/) ? BUILT[6] : (p.quote && T0(/\b(she|queen)\b/)) ? BUILT[3] : T0(/\b(pyramids?|egypt)\b/) ? BUILT[2] : T0(/\b(march|marched|desert)\b/) ? BUILT[7] : T0(/\b(cliff|looked over)\b/) ? BUILT[8] : T0(/\b(died|forever|night)\b/) ? BUILT[9] : T0(/\b(shore|beach|sand)\b/) ? BUILT[1] : T0(/\b(sea|fleet|ship|sail)\b/) ? BUILT[0] : null;
      }
      if (pickS && pickS.tags && pickS.tags === lastTag) pickS = null; // never repeat the same set piece back-to-back: fall to the generic builder
      lastTag = pickS ? pickS.tags : null;
      if (pickS) { SCENES.push(Object.assign({}, pickS, { text: p.quote ? p.text.replace(/\s*"[^"]*"\s*/g, " ").replace(/\s+$/, "") : p.text, quote: p.quote || null, speaker: p.speaker || null })); return; }
      var moving = pose === "walk" || pose === "march";
      var fighting = pose === "fight" || /\b(fight|fought|battle|clash|clashed|war)\b/i.test(p.text);
      var palKey = era === "ancient" ? "red" : (ERAKEY[era] && CH.KIND[ERAKEY[era][1]] ? ERAKEY[era][1] : "red");
      var heroKey = era === "ancient" ? "alex" : (ERAKEY[era] && ERAKEY[era][0] && CH.KIND[ERAKEY[era][0]]) ? ERAKEY[era][0] : "alex";
      var rk = p.role && CH.KIND[p.role] ? p.role : null;
      if (rk) { heroKey = rk; palKey = CH.KIND[rk + "2"] ? rk + "2" : rk; }
      var rk2 = p.role2 && CH.KIND[p.role2] ? p.role2 : null;
      var others = (p.characters || []).slice(1);
      var bgf = (era === "space" || era === "ocean") ? function () { window.PL[era]({ t: S.time }); } : BG[loc] || (window.PL && window.PL[loc] ? function () { window.PL[loc]({ t: S.time }); } : bgPlain);
      var shotSet = (p.shots && p.shots.length ? p.shots : ["wide", "follow", "closeup"]);
      function mkShot(name, i, n) {
        var a = i / n, o = { a: a };
        if (name === "wide") o.cam = function (v) { return { x: A.x * 0.5, y: -190, z: lerp(0.85, 0.95, ease(v)) }; };
        else if (name === "follow") o.cam = follow(A, 1.25, 1.5, 150, -170);
        else if (name === "closeup") { o.blur = 6; o.cam = head(A, 2.4, 2.7, 70, 258); }
        else if (name === "side") { o.views = { A: "side" }; o.cam = follow(A, 1.3, 1.5, 150, -170); }
        else if (name === "back") { o.views = { A: "back" }; o.cam = function (v) { return { x: A.x + lerp(-90, 40, ease(v)), y: -210, z: lerp(1.5, 1.1, ease(v)) }; }; }
        else if (name === "ots") { o.views = { A: "back" }; o.fg = [{ id: "A", dx: -150, view: "back", layer: 1.35, s: 1.12 }]; o.cam = function (v) { return { x: A.x + 40, y: -210, z: lerp(1.5, 1.75, ease(v)) }; }; }
        else if (name === "crane") o.cam = function (v) { return { x: A.x + 40, y: lerp(-220, -460, ease(v)), z: lerp(1.2, 0.65, ease(v)) }; };
        else o.cam = fixed(A.x, -190, 1.1);
        return o;
      }
      scene({ text: p.quote ? p.text.replace(/\s*"[^"]*"\s*/g, " ").replace(/\s+$/, "").replace(/,$/, ",") : p.text, quote: p.quote || null, speaker: p.speaker || null, dur: 7 + (p.text.length / 20), chapter: p.location || "x", tod: loc === "space" ? "dusk" : (p.tod || "day"), weather: p.weather && p.weather !== "none" ? p.weather : null,
        setup: function () {
          put(A, moving ? -420 : 0, 1, { key: heroKey, pose: pose, ex: p.mood === "sad" ? "sad" : p.mood === "tense" ? "angry" : "happy" });
          var pals = [R[0], R[1], R[2]]; (fighting && !rk ? [T[0], T[1], T[2]] : []).forEach(function (c, i) { put(c, 380 + i * 120, -1, { pose: "fight", ex: "angry" }); });
          pals.slice(0, Math.min(3, others.length + (fighting ? 2 : 0))).forEach(function (c, i) { put(c, (moving ? -420 : 0) - 130 - i * 110, 1, { pose: pose, ex: "happy", key: (rk2 && i === 0) ? rk2 : palKey }); });
          ALLC.forEach(function (c) { if (c.show && !fighting) { c.item = null; c.shield = false; } }); if (fighting) { A.item = "sword"; }
          if (rk) { var kk = CH.KIND[rk]; ALLC.forEach(function (c) { c.shield = false; if (c.show) c.item = (c === A || /^(firefighter|police|soldier|pirate|miner|builder|mechanic|farmer|chef)$/.test(rk)) ? (kk.item || (rk === "soldier" ? "rifle" : null)) : null; }); if (rk === "soldier") ALLC.forEach(function (c) { if (c.show) c.item = "rifle"; }); if (fighting && rk !== "soldier" && !kk.item) A.item = null; }
        },
        update: function (u, dt) { if (moving) ALLC.forEach(function (c) { if (c.show && c.pose === pose) c.x += 120 * dt * (c.face || 1); }); if (A.pose === "talk" || pose === "talk") { A.talk = true; } },
        world: function (m, u) { bgf(m, u); },
        shots: shotSet.map(function (n, i) { return mkShot(n, i, shotSet.length); }) });
    });
  }
  if (window.__PLAN && window.__PLAN.length) { SCENES.length = 0; buildFromPlan(window.__PLAN); }

  var si = -1, st = 0, spoken = 0, playing = false, shotIdx = -1, ended = false;
  var tmp = document.createElement("canvas"), tctx = tmp.getContext("2d");
  var NOUNS = /^(sea|army|fleet|shore|soldiers?|sand|pyramids?|queen|crown|spear|shield|armies|plain|temple|council|realm|mountain|empire|sky|king|gold|head|night)$/i;
  var capWords = [], capHi = -2;
  function setCap(sc) { var words = sc.text.split(/\s+/); capWords = words.map(function (w, i) { return { w: w, noun: NOUNS.test(w.replace(/[^A-Za-z]/g, "")) || !!(window.PR && PR.has(w.replace(/[^A-Za-z]/g, "").toLowerCase().replace(/s$/, ""))), i: i }; }); capHi = -2; renderCap(sc, -1); }
  function renderCap(sc, hi) { var h = capWords.map(function (o) { return o.noun ? '<span class="nn' + (hi >= o.i ? " hi" : "") + '">' + o.w + "</span>" : o.w; }).join(" "); cap.innerHTML = sc.quote ? h + '<br><b style="margin-top:8px">' + (sc.speaker || "The Queen") + '</b>“' + sc.quote + "”" : h; cap.className = "on"; }
  function enter(i) {
    if (si >= 0) { if (prevCv.width !== S.cv.width) { prevCv.width = S.cv.width; prevCv.height = S.cv.height; } pctx.clearRect(0, 0, prevCv.width, prevCv.height); pctx.drawImage(S.cv, 0, 0); hasPrev = true; fade = 1; }
    si = i; st = 0; shotIdx = -1; var sc = SCENES[i]; resetChars(); puffs = []; cam.shake = 0; W.setTod(sc.tod || "day"); sparks = []; flash = 0; if (sc.setup) sc.setup(); setCap(sc);
  }
  // ---- cinematic polish: foreground silhouettes with parallax + soft bloom + scene crossfade ----
  var bcv = document.createElement("canvas"), bctx = bcv.getContext("2d"), prevCv = document.createElement("canvas"), pctx = prevCv.getContext("2d"), fade = 0, hasPrev = false;
  function bloom() { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); var w = S.cv.width, hh = S.cv.height, bw = w >> 2, bh = hh >> 2; if (bcv.width !== bw) { bcv.width = bw; bcv.height = bh; } bctx.clearRect(0, 0, bw, bh); bctx.filter = "blur(6px) brightness(1.1) saturate(1.2)"; bctx.drawImage(S.cv, 0, 0, bw, bh); bctx.filter = "none"; ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.14; ctx.drawImage(bcv, 0, 0, w, hh); ctx.restore(); }
  function fgDeco(sc, shot) {
    if (shot.nochars && !sc.fgdeco) return; var tag = sc.tags || "", era = sc.era || ""; if (/launch|cabin|approach|sub|dive|whale|trench/.test(tag) && !/launch/.test(tag)) return;
    var dark = { dusk: 0.55, night: 0.8, storm: 0.6 }[sc.tod] || 0.25;
    S.layer(1.45, function () { ctx.save(); ctx.globalAlpha = 0.85; var r = S.rng(11), vr = S.viewRect(1.45), base = vr.b - 20;
      for (var x = Math.floor(vr.l / 160) * 160; x < vr.r + 160; x += 160) { var k = Math.abs(x * 7 + 3) % 5, hh = 30 + ((Math.abs(x) * 13) % 70); ctx.fillStyle = "rgba(" + (40 - dark * 25 | 0) + "," + (28 - dark * 18 | 0) + "," + (20 - dark * 12 | 0) + ",.9)"; if (k < 3) { ctx.beginPath(); ctx.moveTo(x - 40, base + 40); for (var j = 0; j < 5; j++) ctx.quadraticCurveTo(x - 30 + j * 16, base - hh * (0.5 + (j % 2) * 0.6), x - 24 + j * 16, base + 40); ctx.fill(); } else if (k === 3) { ctx.beginPath(); ctx.ellipse(x, base + 30, 70, 34, 0, Math.PI, 0); ctx.fill(); } }
      ctx.restore(); });
  }
  function drawScene(sc, u, dt) {
    var VW = S.VW, VH = S.VH, shot = sc.shots[shotIdx];
    ctx.save(); ctx.setTransform(S.SC, 0, 0, S.SC, 0, 0);
    cam.roll = shot.roll ? shot.roll * Math.sin(S.time * 0.9) : 0;
    if (sc.world) sc.world(shot.mode, u);
    // depth of field: soften the background behind close-ups
    if (shot.blur) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (tmp.width !== S.cv.width) { tmp.width = S.cv.width; tmp.height = S.cv.height; } tctx.clearRect(0, 0, tmp.width, tmp.height); tctx.drawImage(S.cv, 0, 0); ctx.filter = "blur(" + Math.round(shot.blur * S.SC) + "px)"; ctx.drawImage(tmp, 0, 0); ctx.filter = "none"; ctx.restore(); }
    // characters, back to front by layer then x
    var list = shot.nochars ? [] : ALLC.filter(function (c) { return c.show && !(shot.fg && shot.fg.some(function (f) { return f.id === c.id; })); }).sort(function (a, b) { return a.layer - b.layer; });
    var byLayer = {}; list.forEach(function (c) { (byLayer[c.layer] = byLayer[c.layer] || []).push(c); });
    Object.keys(byLayer).sort().forEach(function (p) { S.layer(+p, function () { byLayer[p].forEach(function (c) { c.t += dt; CH.draw(c); }); }); });
    // crown flight in the coronation
    if (sc.chapter === "Crown" && u > 0.46 && u < 0.6) { var f = ease((u - 0.46) / 0.14); S.layer(1, function () { var sx = Q.x - 36, sy = -300, ex = A.x + 4, ey = -300; var x = lerp(sx, ex, f), y = lerp(sy, ey, f) - Math.sin(f * Math.PI) * 60, g = ctx.createLinearGradient(0, y - 30, 0, y + 10); g.addColorStop(0, "#fff1b0"); g.addColorStop(1, "#c8962a"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 30, y + 8); ctx.lineTo(x - 32, y - 18); ctx.lineTo(x - 17, y - 4); ctx.lineTo(x - 8, y - 30); ctx.lineTo(x, y - 8); ctx.lineTo(x + 8, y - 30); ctx.lineTo(x + 17, y - 4); ctx.lineTo(x + 32, y - 18); ctx.lineTo(x + 30, y + 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#7a5a1a"; ctx.lineWidth = 2; ctx.stroke(); ctx.save(); ctx.globalCompositeOperation = "lighter"; var gl = S.rgrad(x, y - 10, 4, 90, [[0, "rgba(255,230,140,.7)"], [1, "rgba(255,230,140,0)"]]); ctx.fillStyle = gl; ctx.fillRect(x - 100, y - 110, 200, 200); ctx.restore(); }); }
    S.layer(1, function () { drawSparks(dt); });
    // over-the-shoulder / foreground characters (nearer layer, soft)
    if (shot.fg) { shot.fg.forEach(function (f) { var base = chars[f.id]; if (!base.show) return; var cl = Object.create(base); cl.x = (f.abs != null ? f.abs : base.x + (f.dx || 0)); cl.view = f.view || "back"; cl.face = f.face || base.face; cl.pose = f.pose || base.pose; cl.s = f.s || 1; cl.y = f.y || 0; S.layer(f.layer || 1.5, function () { CH.draw(cl); }); }); }
    if (sc.foreground) sc.foreground();
    fgDeco(sc, shot);
    weatherFx(shot.weather || sc.weather, dt);
    // noun pop-up: icon of the noun just spoken (props library from studio_props.js)
    if (false && window.PR && capHi >= 0 && capWords[capHi]) { var nn = capWords[capHi].w.replace(/[^A-Za-z]/g, "").toLowerCase().replace(/s$/, ""), age = S.time - (popT || 0); if (nn !== popN) { popN = nn; popT = S.time; age = 0; } if (PR.has(nn) && age < 2.2) { var pa = Math.min(1, age / 0.25), po = age > 1.7 ? (2.2 - age) / 0.5 : 1, sc2 = (0.6 + 0.4 * S.easeOut(pa)) * 1.25 * (1 + 0.05 * Math.sin(age * 5)); ctx.save(); ctx.globalAlpha = po; ctx.fillStyle = "rgba(255,248,225,.82)"; ctx.beginPath(); ctx.arc(VW * 0.78, VH * 0.17, 95 * sc2, 0, 6.283); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(60,40,20,.55)"; ctx.stroke(); PR.draw(nn, VW * 0.78, VH * 0.17, sc2, S.time); ctx.restore(); } }
    bloom();
    W.vignetteGrade(shot.blur ? 1.15 : 0.9);
    if (fade > 0 && hasPrev) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = fade * fade * 0.9; ctx.drawImage(prevCv, 0, 0); ctx.restore(); fade = Math.max(0, fade - dt / 0.3); }
    if (flash > 0) { ctx.fillStyle = "rgba(255,244,200," + (0.55 * flash) + ")"; ctx.fillRect(0, 0, VW, VH); flash = Math.max(0, flash - dt * 2.2); }
    W.grain();
    ctx.restore();
  }
  var target = { x: 0, y: -170, z: 1 }, popN = "", popT = 0;
  function tick(dt) {
    S.time += dt; var sc = SCENES[si]; st += dt; var u = clamp(st / sc.dur, 0, 0.9999);
    if (sc.update) sc.update.call(sc, u, dt);
    // distance-locked gait: leg phase advances with ground covered (no foot sliding / moonwalk), and walkers face the way they move
    ALLC.forEach(function (c) { if (c._px == null) c._px = c.x; var d = c.x - c._px; c._px = c.x; var ad = Math.abs(d); if (c.show && (c.pose === "walk" || c.pose === "march") && ad > 0.02 && ad < 80) { c._gait = (c._gait || 0) + ad * 0.0247 / (c.s || 1); c._gmove = 0.2; if (ad > 0.25) c.face = d > 0 ? 1 : -1; } else if (c._gmove > 0) c._gmove -= dt; });
    // shot selection
    var idx = 0; for (var k = 0; k < sc.shots.length; k++) if (u >= sc.shots[k].a) idx = k;
    var sh = sc.shots[idx], nxt = sc.shots[idx + 1] ? sc.shots[idx + 1].a : 1, v = clamp((u - sh.a) / Math.max(0.001, nxt - sh.a), 0, 1);
    ALLC.forEach(function (c) { c.view = null; }); if (sh.views) for (var vk in sh.views) chars[vk].view = sh.views[vk];
    var tg = sh.cam(v); tg = { x: tg.x, y: tg.y, z: Math.min(tg.z, 2.6) };
    // auto-framing applied to the TARGET (never fights the spring => no shake): everyone on stage stays in frame unless it is a deliberate close-up
    (function () { var shown = ALLC.filter(function (c) { return c.show && !(sh.nochars) && !(sh.fg && sh.fg.some(function (f) { return chars[f.id] === c; })); }); if (!shown.length) return; var VWd = S.VW, VHd = S.VH, lo = VWd * 0.14, hi = VWd * 0.86;
      var xs = shown.map(function (c) { return c.x; }), mn = Math.min.apply(0, xs), mx = Math.max.apply(0, xs), span = mx - mn + 160;
      if (tg.z <= 2.0 && shown.length > 1) { var maxz = Math.max((hi - lo) / span, 0.5); if (tg.z > maxz) tg.z = maxz; }
      var f = A.show ? A : shown[0]; if (tg.z <= 2.0 && shown.length > 1 && span * tg.z < hi - lo) { var mid = (mn + mx) / 2; var sm = VWd / 2 + (mid - tg.x) * tg.z; if (sm < lo || sm > hi) tg.x = mid; }
      var sxA = VWd / 2 + (f.x - tg.x) * tg.z; if (sxA < lo) tg.x += (sxA - lo) / tg.z; else if (sxA > hi) tg.x += (sxA - hi) / tg.z;
      if (tg.z <= 1.9) { var low = Math.max.apply(0, shown.map(function (c) { return VHd * 0.46 + (c.y - tg.y) * tg.z; })); var lim = VHd * 0.8; if (low > lim) tg.y += (low - lim) / tg.z; } })();
    // one continuous take: never snap inside a scene; critically-damped spring toward the (smooth) target path
    if (!cam.vx) { cam.vx = 0; cam.vy = 0; cam.vz = 0; }
    if (idx !== shotIdx) { if (shotIdx < 0 || st < dt * 2) { cam.x = tg.x; cam.y = tg.y; cam.z = tg.z; cam.vx = cam.vy = cam.vz = 0; } shotIdx = idx; }
    var w0 = 2.6;
    function spring(p, v, g, w) { var d = p - g, a = -w * w * d - 2 * w * v; v += a * dt; return [p + v * dt, v]; }
    var rx = spring(cam.x, cam.vx, tg.x, w0), ry = spring(cam.y, cam.vy, tg.y, w0), rz = spring(cam.z, cam.vz, tg.z, w0 * 0.9);
    cam.x = rx[0]; cam.vx = rx[1]; cam.y = ry[0]; cam.vy = ry[1]; cam.z = rz[0]; cam.vz = rz[1];
    // caption nouns light up as they are spoken
    var hi = -1; capWords.forEach(function (o) { if (o.noun && u >= (o.i + 0.3) / capWords.length * 0.92) hi = Math.max(hi, o.i); }); if (hi !== capHi) { capHi = hi; renderCap(sc, hi); }
    drawScene(sc, u, dt);
    if (st >= sc.dur) { if (si + 1 < SCENES.length) enter(si + 1); else { window.__finished = true; playing = false; } }
  }
  if (window.__DUR) SCENES.forEach(function (sc, i) { if (window.__DUR[i]) sc.dur = window.__DUR[i]; });
  var last = 0; function loop(ts) { if (playing) { var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.033; last = ts; tick(dt); } else last = ts; requestAnimationFrame(loop); }
  window.__film = { texts: SCENES.map(function (sc) { return { text: sc.text, quote: sc.quote || "", speaker: sc.speaker || "" }; }), step: function () { tick(1 / 30); }, start: function () { var b = $("start"); if (b) b.hidden = true; playing = !EXPORT; enter(0); tick(0.0001); if (EXPORT) playing = false; if (!EXPORT) { last = 0; playing = true; } } };
  window.__still = function (i, u) { enter(i); var sc = SCENES[i]; var dt = 1 / 30, n = Math.floor(u * sc.dur / dt); for (var k = 0; k < n; k++) tick(dt); };
  if (!EXPORT) requestAnimationFrame(loop);
  var sb = $("start"); if (sb) sb.onclick = function () { window.__film.start(); };
})();
