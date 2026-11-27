// Studio engine: illustrated world layers (sky, mountains, dunes, pyramids, temple, sea, ship, palms, plains, props, FX)
var WD = (function () {
  var S = ST, ctx = S.ctx, mix = S.mix, dk = S.dk, lt = S.lt, tint = S.tint, layer = S.layer, rng = S.rng, nz = S.noise1;
  var TOD = {
    day:    { sky: ["#3f9be0", "#8fd0f2", "#fdebc4"], sun: [0.72, -0.06], sunCol: "#fff3c4", amb: "#ffffff", ambK: 0, fog: "#e6f3f6", haze: "#f4e6c4", light: 1 },
    gold:   { sky: ["#4d79c9", "#f2a76b", "#ffd9a0"], sun: [0.3, 0.12], sunCol: "#ffe0a0", amb: "#ffc98a", ambK: 0.12, fog: "#f6c79a", haze: "#f3b57e", light: -1 },
    dusk:   { sky: ["#2b2f78", "#a2527f", "#f59d6a"], sun: [0.78, 0.2], sunCol: "#ffb978", amb: "#d98aa0", ambK: 0.16, fog: "#c9759a", haze: "#d9809a", light: 1 },
    night:  { sky: ["#070c24", "#142149", "#27407a"], sun: [0.25, -0.12], sunCol: "#eaf1ff", amb: "#6a84cc", ambK: 0.26, fog: "#26407a", haze: "#2c4a86", light: -1, night: true },
    storm:  { sky: ["#232a3a", "#4a5568", "#8a93a0"], sun: [0.5, -0.5], sunCol: "#cfd6e0", amb: "#6f7c93", ambK: 0.3, fog: "#59636f", haze: "#6a7480", light: 1 },
    inner:  { sky: ["#2a1d17", "#4a3326", "#6a4a34"], sun: [0.5, -0.5], sunCol: "#ffd9a0", amb: "#ffb86a", ambK: 0.2, fog: "#4a3326", haze: "#5a3e2c", light: 1 }
  };
  var cur = TOD.day, curName = "day";
  function setTod(name) { cur = TOD[name] || TOD.day; curName = name; S.AMB.c = cur.amb; S.AMB.k = cur.ambK; S.LIGHT_DX = cur.light; }

  // 1. Sky (gradient + sun/moon glow + clouds with depth)
  function sky() {
    var VW = S.VW, VH = S.VH;
    var g = S.vgrad(0, VH * 0.78, [[0, cur.sky[0]], [0.45, cur.sky[1]], [1, cur.sky[2]]]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);

    // atmospheric horizon glow band
    var hg = S.vgrad(VH * 0.6, VH * 0.85, [[0, S.alpha(cur.haze, 0)], [1, S.alpha(cur.haze, 0.38)]]);
    ctx.fillStyle = hg; ctx.fillRect(0, VH * 0.6, VW, VH * 0.4);

    // sun / moon with glow
    var sx = VW * cur.sun[0] - S.cam.x * 0.02, sy = VH * (0.3 + cur.sun[1]) - (S.cam.y + 170) * 0.03;
    if (!cur.night) {
      var halo = S.rgrad(sx, sy, 12, VH * 0.65, [[0, S.alpha(cur.sunCol, 0.9)], [0.3, S.alpha(cur.sunCol, 0.32)], [1, S.alpha(cur.sunCol, 0)]]);
      ctx.fillStyle = halo; ctx.fillRect(0, 0, VW, VH);
      ctx.fillStyle = cur.sunCol; ctx.beginPath(); ctx.arc(sx, sy, 56, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.arc(sx, sy, 42, 0, 6.283); ctx.fill();
      // god rays
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < 8; i++) {
        var a = 0.9 + i * 0.25 + Math.sin(S.time * 0.12 + i) * 0.03;
        ctx.fillStyle = S.alpha(cur.sunCol, 0.05);
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(a) * 1800 - 80, sy + Math.sin(a) * 1800);
        ctx.lineTo(sx + Math.cos(a) * 1800 + 80, sy + Math.sin(a) * 1800);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    } else {
      var halo2 = S.rgrad(sx, sy, 8, 350, [[0, "rgba(220,235,255,.6)"], [1, "rgba(220,235,255,0)"]]);
      ctx.fillStyle = halo2; ctx.fillRect(0, 0, VW, VH);
      // moon disc + craters
      ctx.fillStyle = "#f4f7ff"; ctx.beginPath(); ctx.arc(sx, sy, 48, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(170,185,215,.55)";
      ctx.beginPath();
      ctx.arc(sx + 14, sy - 10, 11, 0, 6.283);
      ctx.arc(sx - 16, sy + 16, 8, 0, 6.283);
      ctx.arc(sx + 18, sy + 20, 6, 0, 6.283);
      ctx.fill();
      // twinkling star field
      var R = rng(17);
      for (var s2 = 0; s2 < 110; s2++) {
        var x = R() * VW, y = R() * VH * 0.6, tw = 0.4 + 0.6 * Math.sin(S.time * (1.5 + R() * 3) + s2 * 1.3);
        ctx.fillStyle = "rgba(255,255,255," + (0.3 + 0.6 * tw) + ")";
        ctx.beginPath(); ctx.arc(x, y, 0.8 + R() * 1.6, 0, 6.283); ctx.fill();
      }
    }
  }

  function clouds(seed, p, y0, amt) {
    layer(p, function () {
      var R = rng(seed || 3), span = 2800;
      for (var i = 0; i < (amt || 7); i++) {
        var bx = ((R() * span + S.time * (5 + R() * 7)) % span) - span / 2;
        var by = y0 + R() * 180;
        var w = 180 + R() * 240;
        var depthScale = 0.7 + p * 0.4;
        drawCloud(bx, by, w * depthScale, R);
      }
    });
  }

  function drawCloud(x, y, w, R) {
    var base = curName === "night" ? "#7f95c8" : curName === "dusk" ? "#fbb396" : curName === "gold" ? "#fce0bd" : "#ffffff";
    var sh = curName === "night" ? "#3e5282" : curName === "dusk" ? "#b85c7d" : curName === "gold" ? "#df986d" : "#c6dcee";
    var puffs = [];
    for (var j = 0; j < 8; j++) {
      puffs.push([x + (j - 3.5) * w * 0.13, y - Math.sin(j / 7 * Math.PI) * w * 0.12, w * (0.11 + Math.sin(j / 7 * Math.PI) * 0.09)]);
    }
    // cloud shadow base with depth
    ctx.fillStyle = sh;
    puffs.forEach(function (p) {
      ctx.beginPath(); ctx.arc(p[0], p[1] + 10, p[2] * 1.05, 0, 6.283); ctx.fill();
    });
    // main cloud body
    ctx.fillStyle = base;
    puffs.forEach(function (p) {
      ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, 6.283); ctx.fill();
    });
    // top soft rim highlight
    ctx.fillStyle = "rgba(255,255,255,.45)";
    puffs.forEach(function (p) {
      ctx.beginPath(); ctx.arc(p[0], p[1] - p[2] * 0.3, p[2] * 0.7, 0, 6.283); ctx.fill();
    });
  }

  // 5. Atmospheric perspective (distant layers hazier)
  function ridge(p, baseY, amp, seed, col, topCol, scale, haze) {
    layer(p, function () {
      var v = S.viewRect(p), pts = [], step = 35;
      for (var x = v.l - 80; x <= v.r + 80; x += step) {
        pts.push([x, baseY - (nz(x * scale, seed) * 0.5 + 0.5) * amp]);
      }
      var hazeAmt = Math.min(0.9, (1 - p) * 0.6 + (haze || 0.4));
      var mixedTop = mix(topCol, cur.haze, hazeAmt * 0.8);
      var mixedBot = mix(col, cur.haze, hazeAmt);
      var g = S.vgrad(baseY - amp, baseY + 40, [[0, mixedTop], [1, mixedBot]]);
      ctx.fillStyle = g;
      S.smooth(pts.concat([[v.r + 80, baseY + 3000], [v.l - 80, baseY + 3000]]), true);
      ctx.fill();
    });
  }

  function dunes(p, baseY, amp, seed, c1, c2, scale) {
    layer(p, function () {
      var v = S.viewRect(p), pts = [];
      for (var x = v.l - 80; x <= v.r + 80; x += 30) {
        var h = (nz(x * scale, seed) * 0.5 + 0.5) * amp;
        pts.push([x, baseY - h]);
      }
      var hazeAmt = Math.min(0.85, (1 - p) * 0.5 + 0.3);
      var mixedC1 = mix(c1, cur.haze, hazeAmt);
      var mixedC2 = mix(c2, cur.haze, hazeAmt);
      var g = S.vgrad(baseY - amp, baseY + 200, [[0, lt(tint(mixedC1), 0.08)], [1, tint(mixedC2)]]);
      ctx.fillStyle = g;
      S.smooth(pts.concat([[v.r + 80, baseY + 3000], [v.l - 80, baseY + 3000]]), true);
      ctx.fill();
      // shaded lee side ridge lines
      ctx.strokeStyle = S.alpha(dk(mixedC2, 0.35), 0.22);
      ctx.lineWidth = 4;
      for (var i = 0; i < pts.length - 1; i += 3) {
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1] + 4);
        ctx.quadraticCurveTo(pts[i][0] + 40, pts[i][1] + 30, pts[i][0] + 82, pts[i][1] + 12);
        ctx.stroke();
      }
    });
  }

  // 2. Ground (patchy textured)
  function ground(p, topY, c1, c2, opts) {
    opts = opts || {};
    layer(p, function () {
      var v = S.viewRect(p);
      var g = S.vgrad(topY, topY + 800, [
        [0, lt(tint(c1), 0.06)],
        [0.2, tint(c1)],
        [0.6, mix(tint(c1), tint(c2), 0.5)],
        [1, dk(tint(c2), 0.15)]
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(v.l, topY, v.r - v.l, v.b - topY + 500);

      // Organic patchy soil mottling / texture variations
      var R = rng(19);
      for (var k = 0; k < 35; k++) {
        var px = v.l + R() * (v.r - v.l), py = topY + 40 + R() * 600, pw = 80 + R() * 220, ph = 20 + R() * 80;
        var pg = S.rgrad(px, py, 10, pw, [
          [0, S.alpha(dk(c2, 0.25), 0.18 + R() * 0.12)],
          [1, S.alpha(c1, 0)]
        ]);
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.ellipse(px, py, pw, ph, (R() - 0.5) * 0.3, 0, 6.283); ctx.fill();
      }

      // soft top edge atmospheric haze blending
      var hz = S.vgrad(topY - 140, topY + 50, [[0, S.alpha(cur.haze, 0)], [1, S.alpha(cur.haze, 0.6)]]);
      ctx.fillStyle = hz; ctx.fillRect(v.l, topY - 140, v.r - v.l, 190);

      // Fine ground strokes / pebbles
      ctx.lineCap = "round";
      for (var i = 0; i < 180; i++) {
        var x = v.l + R() * (v.r - v.l), y = topY + 25 + Math.pow(R(), 1.6) * 750, sz = 3 + (y - topY) * 0.02;
        ctx.strokeStyle = S.alpha(dk(c2, 0.4), 0.16 + R() * 0.15);
        ctx.lineWidth = sz * 0.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sz * (3 + R() * 6), y + sz * 0.3); ctx.stroke();
      }

      // Grass tufts with wind sway
      if (opts.grass) {
        for (var j = 0; j < 260; j++) {
          var gx = v.l + R() * (v.r - v.l), gy = topY + 30 + Math.pow(R(), 1.3) * 700, h = 10 + (gy - topY) * 0.05 + R() * 10;
          ctx.strokeStyle = tint(R() > 0.4 ? opts.grass : lt(opts.grass, 0.25));
          ctx.lineWidth = 2 + (gy - topY) * 0.007;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.quadraticCurveTo(gx + 4 + Math.sin(S.time * 2.2 + gx) * 4, gy - h * 0.6, gx + 8 + Math.sin(S.time * 2.2 + gx) * 7, gy - h);
          ctx.stroke();
        }
      }
    });
  }

  function pyramid(p, x, baseY, w, h, tilt) {
    layer(p, function () {
      var L = tint("#f6d894"), Dk = tint("#c98f55"), apex = [x + (tilt || 0), baseY - h], bl = [x - w / 2, baseY], br = [x + w / 2, baseY], bm = [x + w * 0.14, baseY + h * 0.04];
      var hazeAmt = Math.min(0.75, (1 - p) * 0.5 + 0.25);
      var gL = S.vgrad(apex[1], baseY, [[0, lt(L, 0.25)], [1, mix(L, cur.haze, hazeAmt)]]); ctx.fillStyle = gL; ctx.beginPath(); ctx.moveTo(apex[0], apex[1]); ctx.lineTo(bl[0], bl[1]); ctx.lineTo(bm[0], bm[1]); ctx.closePath(); ctx.fill();
      var gD = S.vgrad(apex[1], baseY, [[0, Dk], [1, mix(Dk, cur.haze, hazeAmt)]]); ctx.fillStyle = gD; ctx.beginPath(); ctx.moveTo(apex[0], apex[1]); ctx.lineTo(bm[0], bm[1]); ctx.lineTo(br[0], br[1]); ctx.closePath(); ctx.fill();
      // masonry courses
      ctx.strokeStyle = "rgba(120,80,40,.18)"; ctx.lineWidth = 2; for (var i = 1; i < 9; i++) { var t = i / 9, y = apex[1] + (baseY - apex[1]) * t; ctx.beginPath(); ctx.moveTo(apex[0] - (apex[0] - bl[0]) * t, y); ctx.lineTo(apex[0] + (br[0] - apex[0]) * t, y); ctx.stroke(); }
      ctx.fillStyle = tint("#f2c64a"); ctx.beginPath(); ctx.moveTo(apex[0], apex[1]); ctx.lineTo(apex[0] - w * 0.025, apex[1] + h * 0.06); ctx.lineTo(apex[0] + w * 0.025, apex[1] + h * 0.06); ctx.closePath(); ctx.fill();
      ctx.fillStyle = S.alpha(cur.haze, 0.3); ctx.fillRect(x - w / 2 - 20, baseY - 8, w + 40, 40);
    });
  }

  function sphinx(p, x, baseY, sc) {
    layer(p, function () {
      ctx.save(); ctx.translate(x, baseY); ctx.scale(sc, sc); var c1 = tint("#e3bd7e"), c2 = tint("#c2915a");
      ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(-170, 0); ctx.quadraticCurveTo(-170, -60, -110, -64); ctx.lineTo(0, -66); ctx.quadraticCurveTo(70, -70, 96, -86); ctx.lineTo(96, -150); ctx.quadraticCurveTo(100, -196, 140, -196); ctx.quadraticCurveTo(180, -196, 180, -150); ctx.lineTo(186, -96); ctx.lineTo(210, -80); ctx.lineTo(210, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(-170, 0); ctx.quadraticCurveTo(-170, -30, -110, -34); ctx.lineTo(210, -30); ctx.lineTo(210, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = tint("#2c6fb3"); ctx.beginPath(); ctx.moveTo(100, -190); ctx.lineTo(180, -190); ctx.lineTo(196, -120); ctx.lineTo(90, -120); ctx.closePath(); ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = tint("#e8c14a"); for (var i = 0; i < 4; i++) ctx.fillRect(98 + i * 2, -186 + i * 17, 84 - i * 4, 5);
      ctx.fillStyle = c1; ctx.beginPath(); ctx.ellipse(140, -140, 30, 38, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = "#4a2a14"; ctx.beginPath(); ctx.arc(152, -150, 3.5, 0, 6.283); ctx.fill(); ctx.restore();
    });
  }

  function obelisk(p, x, baseY, h) {
    layer(p, function () {
      var w = h * 0.09, c1 = tint("#e8cc94"), c2 = tint("#b98655");
      ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(x - w, baseY); ctx.lineTo(x - w * 0.62, baseY - h); ctx.lineTo(x, baseY - h - w * 1.4); ctx.lineTo(x, baseY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x, baseY - h - w * 1.4); ctx.lineTo(x + w * 0.62, baseY - h); ctx.lineTo(x + w, baseY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = tint("#f2c64a"); ctx.beginPath(); ctx.moveTo(x - w * 0.62, baseY - h); ctx.lineTo(x, baseY - h - w * 1.4); ctx.lineTo(x + w * 0.62, baseY - h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(90,50,20,.35)"; ctx.lineWidth = 2; for (var i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x - w * 0.5, baseY - i * h / 9); ctx.lineTo(x - w * 0.2, baseY - i * h / 9 - 4); ctx.stroke(); }
    });
  }

  function palm(p, x, baseY, h, seed) {
    layer(p, function () {
      var R = rng(seed || 1), lean = (R() - 0.5) * 60, tx = x + lean, ty = baseY - h, sway = Math.sin(S.time * 1.3 + x) * 5;
      ctx.strokeStyle = dk(tint("#8a6a3e"), 0.2); ctx.lineWidth = h * 0.07 + 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x + lean * 0.2, baseY - h * 0.5, tx + sway * 0.3, ty); ctx.stroke(); ctx.strokeStyle = tint("#a98550"); ctx.lineWidth = h * 0.05 + 2; ctx.stroke();
      ctx.strokeStyle = "rgba(60,40,20,.35)"; ctx.lineWidth = 2; for (var i = 1; i < 7; i++) { var t = i / 7; ctx.beginPath(); ctx.moveTo(x + lean * 0.2 * t - 6, baseY - h * t); ctx.lineTo(x + lean * 0.2 * t + 6, baseY - h * t - 3); ctx.stroke(); }
      for (var f = 0; f < 9; f++) { var a = Math.PI * (0.05 + f / 8 * 0.9) + Math.PI, len = h * (0.5 + R() * 0.15), dx = Math.cos(a) * len, dy = Math.sin(a) * len * 0.5 + len * 0.28; var gcol = f % 2 ? tint("#3f8f4a") : tint("#58b055"); ctx.fillStyle = gcol; ctx.beginPath(); ctx.moveTo(tx + sway * 0.3, ty); ctx.quadraticCurveTo(tx + dx * 0.55 + sway, ty + dy * 0.1 - len * 0.2, tx + dx + sway * 1.5, ty + dy); ctx.quadraticCurveTo(tx + dx * 0.5 + sway, ty + dy * 0.1 - len * 0.04, tx + sway * 0.3, ty + 4); ctx.fill(); }
    });
  }

  function acacia(p, x, baseY, h) {
    layer(p, function () {
      ctx.strokeStyle = dk(tint("#6a4a2a"), 0.1); ctx.lineWidth = h * 0.06 + 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x - h * 0.08, baseY - h * 0.6, x + h * 0.05, baseY - h); ctx.stroke();
      var cw = h * 0.95, cy = baseY - h; var g = S.vgrad(cy - 30, cy + 30, [[0, lt(tint("#6fae4c"), 0.1)], [1, dk(tint("#3f7a3a"), 0.1)]]); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, cy, cw, h * 0.2, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = lt(tint("#7fbe56"), 0.15); ctx.beginPath(); ctx.ellipse(x - cw * 0.1, cy - h * 0.07, cw * 0.7, h * 0.11, 0, 0, 6.283); ctx.fill();
    });
  }

  function rock(p, x, baseY, w, h, col) {
    layer(p, function () {
      var c = tint(col || "#b89a72"); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - w / 2, baseY); ctx.lineTo(x - w * 0.4, baseY - h * 0.7); ctx.lineTo(x - w * 0.1, baseY - h); ctx.lineTo(x + w * 0.3, baseY - h * 0.8); ctx.lineTo(x + w / 2, baseY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = dk(c, 0.25); ctx.beginPath(); ctx.moveTo(x + w * 0.05, baseY); ctx.lineTo(x - w * 0.02, baseY - h * 0.9); ctx.lineTo(x + w * 0.3, baseY - h * 0.8); ctx.lineTo(x + w / 2, baseY); ctx.closePath(); ctx.fill();
    });
  }

  function temple(p, x, baseY, sc) {
    layer(p, function () {
      ctx.save(); ctx.translate(x, baseY); ctx.scale(sc, sc);
      var st = tint("#e6cb96"), st2 = tint("#c79e66"), blue = tint("#2c6fb3"), red = tint("#c04a30"), gold = tint("#e2b23d");
      function tower(cx) {
        var g = ctx.createLinearGradient(cx - 150, 0, cx + 150, 0); g.addColorStop(0, lt(st, 0.12)); g.addColorStop(1, st2); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 150, 0); ctx.lineTo(cx - 126, -560); ctx.lineTo(cx + 126, -560); ctx.lineTo(cx + 150, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = dk(st2, 0.25); ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = st2; ctx.fillRect(cx - 138, -586, 276, 28); ctx.fillStyle = blue; ctx.fillRect(cx - 130, -500, 260, 20); ctx.fillStyle = red; ctx.fillRect(cx - 132, -470, 264, 16); ctx.fillStyle = gold; ctx.fillRect(cx - 134, -444, 268, 12);
        ctx.fillStyle = "rgba(90,50,20,.5)"; for (var r = 0; r < 4; r++) for (var q = 0; q < 6; q++) { ctx.fillRect(cx - 110 + q * 38, -400 + r * 56, 16, 8); ctx.fillRect(cx - 104 + q * 38, -390 + r * 56, 6, 22); }
        ctx.fillStyle = "#7a5230"; ctx.fillRect(cx - 100, -760, 6, 180); ctx.fillStyle = red; ctx.beginPath(); ctx.moveTo(cx - 94, -760); ctx.quadraticCurveTo(cx - 60, -748 + Math.sin(S.time * 3) * 4, cx - 30, -760); ctx.lineTo(cx - 30, -722); ctx.quadraticCurveTo(cx - 60, -716, cx - 94, -724); ctx.fill();
      }
      tower(-250); tower(250);
      ctx.fillStyle = st; ctx.fillRect(-120, -410, 240, 410); ctx.fillStyle = st2; ctx.fillRect(-132, -440, 264, 34); ctx.fillStyle = blue; ctx.fillRect(-120, -400, 240, 14);
      var gate = ctx.createLinearGradient(0, -330, 0, 0); gate.addColorStop(0, "#1a0f08"); gate.addColorStop(1, "#4a3220"); ctx.fillStyle = gate; ctx.fillRect(-74, -330, 148, 330);
      ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(0, -300, 36, Math.PI, 0); ctx.fill(); ctx.fillStyle = blue; ctx.beginPath(); ctx.arc(0, -300, 22, Math.PI, 0); ctx.fill(); ctx.fillStyle = red; ctx.fillRect(-54, -300, 8, 300); ctx.fillRect(46, -300, 8, 300);
      ctx.save(); ctx.globalCompositeOperation = "lighter"; var fg = S.rgrad(0, -140, 6, 150, [[0, "rgba(255,170,70,.45)"], [1, "rgba(255,170,70,0)"]]); ctx.fillStyle = fg; ctx.fillRect(-160, -300, 320, 320); ctx.restore();
      ctx.restore();
    });
  }

  function columns(p, x0, baseY, n, gap, h) {
    layer(p, function () {
      for (var i = 0; i < n; i++) {
        var x = x0 + i * gap, w = h * 0.16, g = ctx.createLinearGradient(x - w, 0, x + w, 0);
        g.addColorStop(0, lt(tint("#e8cf9a"), 0.18)); g.addColorStop(0.6, tint("#dcbd84")); g.addColorStop(1, dk(tint("#b98a55"), 0.12));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w, baseY); ctx.lineTo(x - w * 0.8, baseY - h); ctx.lineTo(x + w * 0.8, baseY - h); ctx.lineTo(x + w, baseY); ctx.closePath(); ctx.fill();
        ctx.fillStyle = tint("#2c6fb3"); ctx.fillRect(x - w * 0.82, baseY - h * 0.22, w * 1.64, 9);
        ctx.fillStyle = tint("#e2b23d"); ctx.fillRect(x - w * 0.82, baseY - h * 0.22 + 9, w * 1.64, 5);
        ctx.fillStyle = tint("#4c9a58"); ctx.beginPath(); ctx.ellipse(x, baseY - h - 6, w * 1.4, h * 0.075, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = tint("#d4b070"); ctx.fillRect(x - w * 1.5, baseY - h - h * 0.06, w * 3, h * 0.06);
        ctx.fillStyle = dk(tint("#c79e66"), 0.1); ctx.fillRect(x - w * 1.3, baseY - 8, w * 2.6, 8);
      }
    });
  }

  function brazier(p, x, baseY) {
    layer(p, function () {
      ctx.fillStyle = tint("#6a4a2a"); ctx.fillRect(x - 4, baseY - 60, 8, 60);
      ctx.fillStyle = tint("#c79a3a"); ctx.beginPath(); ctx.moveTo(x - 22, baseY - 70); ctx.lineTo(x + 22, baseY - 70); ctx.lineTo(x + 12, baseY - 52); ctx.lineTo(x - 12, baseY - 52); ctx.closePath(); ctx.fill();
      var fl = Math.sin(S.time * 14 + x) * 3;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      var gl = S.rgrad(x, baseY - 90, 4, 120, [[0, "rgba(255,170,60,.55)"], [1, "rgba(255,170,60,0)"]]);
      ctx.fillStyle = gl; ctx.fillRect(x - 130, baseY - 220, 260, 260);
      ctx.restore();
      ctx.fillStyle = "#ff9a2a"; ctx.beginPath(); ctx.moveTo(x - 16, baseY - 70); ctx.quadraticCurveTo(x - 12 + fl, baseY - 100, x + fl, baseY - 120); ctx.quadraticCurveTo(x + 16 + fl, baseY - 96, x + 16, baseY - 70); ctx.fill();
      ctx.fillStyle = "#ffe27a"; ctx.beginPath(); ctx.moveTo(x - 8, baseY - 70); ctx.quadraticCurveTo(x + fl * 0.5, baseY - 100, x + 8, baseY - 70); ctx.fill();
    });
  }

  function cityline(p, baseY, seed) {
    layer(p, function () {
      var v = S.viewRect(p), R = rng(seed || 4), x = v.l - 40, wall = tint("#e2c794"), roof = tint("#b9774a"), fog = 0.42;
      ctx.fillStyle = mix(wall, cur.haze, fog); ctx.fillRect(v.l - 60, baseY + 2, v.r - v.l + 120, 600);
      while (x < v.r + 60) {
        var w = 34 + R() * 46, h = 20 + R() * 34, k = R();
        ctx.fillStyle = mix(wall, cur.haze, fog + R() * 0.1); ctx.fillRect(x, baseY - h, w, h + 8);
        ctx.fillStyle = mix(dk(wall, 0.2), cur.haze, fog); ctx.fillRect(x + w * 0.72, baseY - h, w * 0.28, h + 8);
        if (k > 0.78) {
          ctx.fillStyle = mix(roof, cur.haze, fog); ctx.beginPath(); ctx.arc(x + w / 2, baseY - h, w * 0.46, Math.PI, 0); ctx.fill(); ctx.fillRect(x + w / 2 - 1.5, baseY - h - w * 0.62, 3, w * 0.2);
        } else if (k > 0.6) {
          ctx.fillStyle = mix(roof, cur.haze, fog); ctx.beginPath(); ctx.moveTo(x - 2, baseY - h); ctx.lineTo(x + w / 2, baseY - h - w * 0.5); ctx.lineTo(x + w + 2, baseY - h); ctx.fill();
        }
        if (R() > 0.5) { ctx.fillStyle = S.alpha("#3a2418", 0.5); ctx.fillRect(x + w * 0.3, baseY - h * 0.65, 5, 8); }
        x += w + 2 + R() * 6;
      }
      var tx = S.cam.x * p + 160;
      ctx.fillStyle = mix(tint("#d6b57c"), cur.haze, fog);
      for (var s2 = 0; s2 < 4; s2++) ctx.fillRect(tx - 50 + s2 * 9, baseY - 30 - s2 * 22, 100 - s2 * 18, 24);
    });
  }

  // 3. Water (`sea`)
  function sea(p, horizonY, c1, c2) {
    layer(p, function () {
      var v = S.viewRect(p);
      var g = S.vgrad(horizonY, horizonY + 900, [
        [0, cur.night ? "#162852" : lt(tint(c1 || "#46b4e6"), 0.15)],
        [0.15, tint(c1 || "#2a86c8")],
        [0.6, tint(c2 || "#185a9c")],
        [1, dk(tint(c2 || "#0f4f92"), 0.15)]
      ]);
      ctx.fillStyle = g; ctx.fillRect(v.l, horizonY, v.r - v.l, v.b - horizonY + 800);

      // horizon haze blend
      var hz = S.vgrad(horizonY - 70, horizonY + 60, [[0, S.alpha(cur.haze, 0)], [0.5, S.alpha(cur.haze, 0.65)], [1, S.alpha(cur.haze, 0)]]);
      ctx.fillStyle = hz; ctx.fillRect(v.l, horizonY - 70, v.r - v.l, 130);

      // Sun/Moon specular glitter path
      if (!cur.night) {
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        var R = rng(5);
        for (var i = 0; i < 80; i++) {
          var t = R(), y = horizonY + 8 + t * t * 750, w = 10 + t * 90 * R();
          var x = S.cam.x * p * 0 + (cur.sun[0] - 0.5) * S.VW * 0.9 + (R() - 0.5) * (35 + t * 300) + S.cam.x * p;
          var tw = 0.4 + 0.6 * Math.sin(S.time * 3.5 + i * 1.5);
          ctx.fillStyle = S.alpha(cur.sunCol, 0.35 * tw * (1 - t * 0.35));
          ctx.fillRect(x, y, w, 2 + t * 3.5);
        }
        ctx.restore();
      }

      // Rich wave lines with foam crests
      var R2 = rng(9);
      ctx.lineCap = "round";
      for (var j = 0; j < 100; j++) {
        var tt = R2(), yy = horizonY + 16 + tt * tt * 850, xx = v.l + R2() * (v.r - v.l), ww = 20 + tt * 120, ph = Math.sin(S.time * 1.4 + j) * 7 * tt;
        ctx.strokeStyle = S.alpha(cur.night ? "#9ac2ff" : "#e0f6ff", 0.15 + 0.2 * tt);
        ctx.lineWidth = 1.5 + tt * 3.5;
        ctx.beginPath(); ctx.moveTo(xx - ww / 2 + ph, yy);
        ctx.quadraticCurveTo(xx + ph, yy - 5 - tt * 10, xx + ww / 2 + ph, yy);
        ctx.stroke();
        // foam highlight
        if (tt > 0.65) {
          ctx.strokeStyle = S.alpha("#ffffff", 0.4 * tt);
          ctx.lineWidth = 1 + tt;
          ctx.beginPath(); ctx.moveTo(xx - ww * 0.2 + ph, yy - 2); ctx.lineTo(xx + ww * 0.2 + ph, yy - 2); ctx.stroke();
        }
      }
    });
  }

  function ship(p, x, y, sc, t, opts) {
    opts = opts || {};
    layer(p, function () {
      ctx.save(); var bob = Math.sin(t * 1.4) * 5, roll = Math.sin(t * 1.1) * 0.035; ctx.translate(x, y + bob); ctx.rotate(roll); ctx.scale(sc * (opts.flip ? -1 : 1), sc);
      var wood = tint("#7a4a28"), wood2 = tint("#a06a3a"), dark = dk(wood, 0.35), cream = tint("#f6ead0"), red = tint("#b5242c"), gold = tint("#e2b23d");
      [[-70, 330], [40, 380], [150, 290]].forEach(function (m) { ctx.fillStyle = dk(wood2, 0.2); ctx.fillRect(m[0] - 5, -m[1], 10, m[1] + 10); });
      function sail(cx, top, w, h, ph) {
        var bl = 16 + Math.sin(t * 1.6 + ph) * 5; var g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, lt(cream, 0.1)); g.addColorStop(1, dk(cream, 0.2)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - w / 2, top); ctx.lineTo(cx + w / 2, top); ctx.quadraticCurveTo(cx + w / 2 + bl, top + h * 0.5, cx + w / 2 - 6, top + h); ctx.quadraticCurveTo(cx, top + h + bl * 1.1, cx - w / 2 + 6, top + h); ctx.quadraticCurveTo(cx - w / 2 - bl, top + h * 0.5, cx - w / 2, top); ctx.fill(); ctx.strokeStyle = dk(cream, 0.35); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = dk(wood2, 0.2); ctx.fillRect(cx - w / 2 - 6, top - 5, w + 12, 8);
      }
      sail(-70, -310, 118, 150, 0); sail(-70, -150, 130, 120, 1); sail(40, -360, 140, 170, 2); sail(40, -170, 150, 130, 3); sail(150, -270, 104, 120, 4);
      var hg = ctx.createLinearGradient(0, -20, 0, 70); hg.addColorStop(0, lt(wood2, 0.1)); hg.addColorStop(1, dk(wood, 0.25)); ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(-230, -34); ctx.quadraticCurveTo(-216, 70, -120, 80); ctx.lineTo(120, 80); ctx.quadraticCurveTo(216, 70, 262, -50); ctx.lineTo(250, -46); ctx.quadraticCurveTo(230, -20, 190, -26); ctx.lineTo(-170, -26); ctx.quadraticCurveTo(-196, -30, -230, -34); ctx.closePath(); ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
      // wake & foam
      ctx.save(); ctx.translate(x, y + 78 * sc); ctx.fillStyle = "rgba(255,255,255,.6)"; for (var f = 0; f < 14; f++) { var fx = (f - 7) * 36 * sc + Math.sin(t * 2 + f) * 6, fw = (22 + (f % 3) * 10) * sc; ctx.beginPath(); ctx.ellipse(fx, Math.sin(t * 2.3 + f * 1.3) * 3, fw, 5 * sc, 0, 0, 6.283); ctx.fill(); } ctx.restore();
    });
  }

  function ruins() { }

  // 4. Shadow blobs under every object
  function shadowBlob(p, x, y, w, h, alpha) {
    layer(p, function () {
      ctx.save();
      var a = alpha != null ? alpha : 0.45;
      var g = S.rgrad(x, y, 2, Math.max(w, h), [[0, "rgba(0,0,0," + a + ")"], [1, "rgba(0,0,0,0)"]]);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, 6.283); ctx.fill();
      ctx.restore();
    });
  }

  function vignetteGrade(strength) {
    var VW = S.VW, VH = S.VH;
    var g = S.rgrad(VW / 2, VH * 0.45, VH * 0.35, VH * 0.85, [[0, "rgba(10,5,25,0)"], [1, "rgba(10,5,25," + (0.48 * (strength == null ? 1 : strength)) + ")"]]); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    var b = S.vgrad(VH * 0.7, VH, [[0, "rgba(10,5,20,0)"], [1, "rgba(10,5,20,.58)"]]); ctx.fillStyle = b; ctx.fillRect(0, VH * 0.7, VW, VH * 0.3);
    ctx.save(); ctx.globalCompositeOperation = "soft-light"; ctx.fillStyle = S.alpha(cur.amb === "#ffffff" ? "#ffd9a0" : cur.amb, 0.3); ctx.fillRect(0, 0, VW, VH); ctx.restore();
  }

  var grainCv = null;
  function grain() {
    if (!grainCv) { grainCv = document.createElement("canvas"); grainCv.width = 256; grainCv.height = 256; var g = grainCv.getContext("2d"), im = g.createImageData(256, 256), R = rng(77); for (var i = 0; i < im.data.length; i += 4) { var v = 128 + (R() - 0.5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }
    ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = "overlay"; var ox = (S.time * 977 | 0) % 256, oy = (S.time * 613 | 0) % 256; for (var x = -ox; x < S.VW; x += 256) for (var y = -oy; y < S.VH; y += 256) ctx.drawImage(grainCv, x, y); ctx.restore();
  }

  function dust(n, col, speed, size, seed) {
    var R = rng(seed || 2); ctx.save(); ctx.fillStyle = col; for (var i = 0; i < n; i++) { var x = ((R() * S.VW + S.time * speed * (0.4 + R())) % (S.VW + 40)) - 20, y = (R() * S.VH * 0.9 + Math.sin(S.time * 0.8 + i) * 14) % S.VH; ctx.globalAlpha = 0.18 + R() * 0.3; ctx.beginPath(); ctx.arc(x, y, size * (0.5 + R()), 0, 6.283); ctx.fill(); } ctx.restore();
  }

  return {
    TOD: TOD, setTod: setTod, get cur() { return cur; },
    sky: sky, clouds: clouds, ridge: ridge, dunes: dunes, ground: ground,
    pyramid: pyramid, sphinx: sphinx, obelisk: obelisk, palm: palm, acacia: acacia, rock: rock,
    temple: temple, columns: columns, brazier: brazier, cityline: cityline, sea: sea, ship: ship, ruins: ruins,
    shadowBlob: shadowBlob, vignetteGrade: vignetteGrade, grain: grain, dust: dust
  };
})();
