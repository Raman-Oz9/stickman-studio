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
  function resetChars() { ALLC.forEach(function (c) { c.show = false; c.pose = "idle"; c.ex = "neutral"; c.talk = false; c.fall = 0; c.item = c.key === "red" || c.key === "teal" ? "spear" : null; c.shield = c.key === "red" || c.key === "teal"; c.layer = 1; c.s = 1; c.y = 0; c.cloak = 0; c.wind = 0; c.fphase = Math.random() * 6; c._thrust = 0; c.look = [1, 0]; c.key = c.id === "A" ? "alex" : c.id === "Q" ? "queen" : c.id[0] === "R" ? "red" : "teal"; }); }
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
    setup: function () { put(A, 0, 1, { key: "alexc", pose: "march", ex: "smug", cloak: 6 }); R.slice(0, 4).forEach(function (c, i) { put(c, -150 - i * 105, 1, { pose: "march", phase: i * 0.9, ex: "happy", s: 0.96 }); }); T.slice(0, 3).forEach(function (c, i) { put(c, -120 - i * 125 - 60, 1, { pose: "march", phase: i * 1.7 + 1, ex: "neutral", s: 0.94, layer: 0.9, face: 1 }); }); },
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
    update: function (u, dt) { A.look = [1, -0.15 + Math.sin(S.time * 0.4) * 0.03]; },
    world: function (m, u) { bgNight(lerp(900, 4200, u)); campfire(330); },
    shots: [{ a: 0, blur: 5, cam: head(A, 2.5, 2.7, 80, 262) }, { a: 0.35, views: { A: "back" }, fg: [{ id: "A", dx: -120, view: "back", layer: 1.3, s: 1.1 }], cam: function (v) { return { x: lerp(60, 120, ease(v)), y: -190, z: lerp(1.2, 1.35, ease(v)) }; } }, { a: 0.66, blur: 6, cam: head(A, 3.0, 3.3, 90, 266) }] });

  // ---------- director ----------
  // ---------- script-driven director: builds SCENES from a plan JSON (window.__PLAN) ----------
  function buildFromPlan(plan) {
    var BG = { sea: function (m, u) { bgSea({ farShips: true }); W.ship(0.5, lerp(-260, 220, u) * 0.5, -100, 0.62, S.time); }, beach: bgBeach, egypt: bgEgypt, plain: bgPlain, temple: bgTempleFront, hall: bgHall, night: function (m, u) { bgNight(lerp(900, 4200, u)); campfire(330); }, cliff: bgCliff };
    var POSE = { walk: "walk", march: "march", fight: "fight", kneel: "kneel", point: "point", sit: "sit", cheer: "cheer", talk: "talk", look: "look", idle: "idle", hold: "hold", run: "march" };
    var ERAKEY = window.ERAS || {};
    plan.forEach(function (p, idx) {
      var loc = p.location || "plain", era = p.era || "ancient", act = ((p.characters && p.characters[0] && p.characters[0].action) || "talk"), pose = POSE[act] || "talk";
      var moving = pose === "walk" || pose === "march";
      var fighting = pose === "fight" || /\b(fight|fought|battle|clash|clashed|war)\b/i.test(p.text);
      var heroKey = (ERAKEY[era] && ERAKEY[era][0] && CH.KIND[ERAKEY[era][0]]) ? ERAKEY[era][0] : "alex";
      var others = (p.characters || []).slice(1);
      var bgf = BG[loc] || (window.PL && window.PL[loc] ? function () { window.PL[loc]({ t: S.time }); } : bgPlain);
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
          var pals = [R[0], R[1], R[2]]; (fighting ? [T[0], T[1], T[2]] : []).forEach(function (c, i) { put(c, 380 + i * 120, -1, { pose: "fight", ex: "angry" }); });
          pals.slice(0, Math.min(3, others.length + (fighting ? 2 : 0))).forEach(function (c, i) { put(c, (moving ? -420 : 0) - 130 - i * 110, 1, { pose: pose, ex: "happy", key: window.ERAS && ERAKEY[era] && CH.KIND[ERAKEY[era][1]] ? ERAKEY[era][1] : "red" }); });
          ALLC.forEach(function (c) { if (c.show && !fighting) { c.item = null; c.shield = false; } }); if (fighting) { A.item = "sword"; }
        },
        update: function (u, dt) { if (moving) ALLC.forEach(function (c) { if (c.show && c.pose === pose) c.x += 74 * dt * (c.face || 1); }); if (A.pose === "talk" || pose === "talk") { A.talk = true; } },
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
    si = i; st = 0; shotIdx = -1; var sc = SCENES[i]; resetChars(); W.setTod(sc.tod || "day"); sparks = []; flash = 0; if (sc.setup) sc.setup(); setCap(sc);
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
    weatherFx(shot.weather || sc.weather, dt);
    // noun pop-up: icon of the noun just spoken (props library from studio_props.js)
    if (window.PR && capHi >= 0 && capWords[capHi]) { var nn = capWords[capHi].w.replace(/[^A-Za-z]/g, "").toLowerCase().replace(/s$/, ""), age = S.time - (popT || 0); if (nn !== popN) { popN = nn; popT = S.time; age = 0; } if (PR.has(nn) && age < 2.2) { var pa = Math.min(1, age / 0.25), po = age > 1.7 ? (2.2 - age) / 0.5 : 1, sc2 = (0.6 + 0.4 * S.easeOut(pa)) * 1.25 * (1 + 0.05 * Math.sin(age * 5)); ctx.save(); ctx.globalAlpha = po; ctx.fillStyle = "rgba(255,248,225,.82)"; ctx.beginPath(); ctx.arc(VW * 0.78, VH * 0.17, 95 * sc2, 0, 6.283); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(60,40,20,.55)"; ctx.stroke(); PR.draw(nn, VW * 0.78, VH * 0.17, sc2, S.time); ctx.restore(); } }
    W.vignetteGrade(shot.blur ? 1.15 : 0.9);
    if (flash > 0) { ctx.fillStyle = "rgba(255,244,200," + (0.55 * flash) + ")"; ctx.fillRect(0, 0, VW, VH); flash = Math.max(0, flash - dt * 2.2); }
    W.grain();
    ctx.restore();
  }
  var target = { x: 0, y: -170, z: 1 }, popN = "", popT = 0;
  function tick(dt) {
    S.time += dt; var sc = SCENES[si]; st += dt; var u = clamp(st / sc.dur, 0, 0.9999);
    if (sc.update) sc.update.call(sc, u, dt);
    // shot selection
    var idx = 0; for (var k = 0; k < sc.shots.length; k++) if (u >= sc.shots[k].a) idx = k;
    var sh = sc.shots[idx], nxt = sc.shots[idx + 1] ? sc.shots[idx + 1].a : 1, v = clamp((u - sh.a) / Math.max(0.001, nxt - sh.a), 0, 1);
    ALLC.forEach(function (c) { c.view = null; }); if (sh.views) for (var vk in sh.views) chars[vk].view = sh.views[vk];
    var tg = sh.cam(v);
    // subtle handheld breathing
    tg = { x: tg.x + Math.sin(S.time * 0.8) * 3, y: tg.y + Math.cos(S.time * 1.1) * 2, z: tg.z * (1 + Math.sin(S.time * 0.5) * 0.004) };
    if (idx !== shotIdx) { shotIdx = idx; cam.x = tg.x; cam.y = tg.y; cam.z = tg.z; } else { var kf = 1 - Math.exp(-dt * 7); cam.x += (tg.x - cam.x) * kf; cam.y += (tg.y - cam.y) * kf; cam.z += (tg.z - cam.z) * (1 - Math.exp(-dt * 5)); }
    // caption nouns light up as they are spoken
    var hi = -1; capWords.forEach(function (o) { if (o.noun && u >= (o.i + 0.3) / capWords.length * 0.92) hi = Math.max(hi, o.i); }); if (hi !== capHi) { capHi = hi; renderCap(sc, hi); }
    drawScene(sc, u, dt);
    if (st >= sc.dur) { if (si + 1 < SCENES.length) enter(si + 1); else { window.__finished = true; playing = false; } }
  }
  if (window.__DUR) SCENES.forEach(function (sc, i) { if (window.__DUR[i]) sc.dur = window.__DUR[i]; });
  var last = 0; function loop(ts) { if (playing) { var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.033; last = ts; tick(dt); } else last = ts; requestAnimationFrame(loop); }
  window.__film = { texts: SCENES.map(function (sc) { return { text: sc.text, quote: sc.quote || "" }; }), step: function () { tick(1 / 30); }, start: function () { var b = $("start"); if (b) b.hidden = true; playing = !EXPORT; enter(0); tick(0.0001); if (EXPORT) playing = false; if (!EXPORT) { last = 0; playing = true; } } };
  window.__still = function (i, u) { enter(i); var sc = SCENES[i]; var dt = 1 / 30, n = Math.floor(u * sc.dur / dt); for (var k = 0; k < n; k++) tick(dt); };
  if (!EXPORT) requestAnimationFrame(loop);
  var sb = $("start"); if (sb) sb.onclick = function () { window.__film.start(); };
})();
