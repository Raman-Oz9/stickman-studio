// Studio engine: 8 polished background builders (space, ocean, castle, city, forest, snow, volcano, jungle)
var PL = (function () {
  var S = ST, ctx = S.ctx, rng = S.rng, W = WD;

  function stars(p, n, seed, tw) {
    var r = rng(seed); S.layer(p, function () { var v = S.viewRect(p); for (var i = 0; i < n; i++) { var x = v.l + r() * (v.r - v.l), y = v.t + r() * (v.b - v.t) * 0.9, b = 0.35 + r() * 0.65, sz = 0.8 + r() * 2.2; ctx.fillStyle = "rgba(255,255,240," + (b * (0.75 + 0.25 * Math.sin(S.time * 2 + i))) + ")"; ctx.beginPath(); ctx.arc(x, y, sz, 0, 6.283); ctx.fill(); } });
  }

  function planet(p, x, y, R, c1, c2, ring) {
    S.layer(p, function () {
      if (ring) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35); ctx.strokeStyle = "rgba(230,205,160,.55)"; ctx.lineWidth = R * 0.16; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.7, R * 0.38, 0, Math.PI, 6.283); ctx.stroke(); ctx.restore(); }
      var g = S.rgrad(x - R * 0.4, y - R * 0.4, R * 0.1, R * 1.1, [[0, S.lt(c1, 0.3)], [0.5, c1], [1, c2]]); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.283); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 6.283); ctx.clip(); ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = R * 0.1; for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(x, y + i * R * 0.3, R * 1.1, R * 0.12, 0.1, 0, 6.283); ctx.stroke(); } ctx.restore();
      ctx.fillStyle = S.rgrad(x + R * 0.5, y + R * 0.4, R * 0.3, R * 1.3, [[0, "rgba(0,0,10,0)"], [1, "rgba(0,0,20,.65)"]]); ctx.beginPath(); ctx.arc(x, y, R, 0, 6.283); ctx.fill();
      if (ring) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35); ctx.strokeStyle = "rgba(230,205,160,.6)"; ctx.lineWidth = R * 0.16; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.7, R * 0.38, 0, 0, Math.PI); ctx.stroke(); ctx.restore(); }
    });
  }

  function space(opt) {
    opt = opt || {};

    // 1. Sky background, angled Milky Way dust band & cosmic nebulae
    S.layer(0, function () {
      var v = S.viewRect(0);
      var bgGrad = S.vgrad(v.t, v.b, [
        [0, "#010207"],
        [0.45, "#080614"],
        [0.75, "#15091a"],
        [1, "#240e16"]
      ]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t);

      // Milky Way dust band
      ctx.save();
      ctx.translate(0, -250);
      ctx.rotate(-0.24);
      var mwGrad = S.vgrad(-350, 350, [
        [0, "rgba(0,0,0,0)"],
        [0.2, "rgba(140,50,160,0.14)"],
        [0.45, "rgba(190,90,140,0.22)"],
        [0.55, "rgba(80,140,210,0.18)"],
        [0.8, "rgba(210,120,70,0.12)"],
        [1, "rgba(0,0,0,0)"]
      ]);
      ctx.fillStyle = mwGrad;
      ctx.fillRect(v.l - 400, -350, v.r - v.l + 800, 700);

      var cols = ["rgba(210,130,220,0.25)", "rgba(100,180,240,0.2)", "rgba(240,160,110,0.18)"];
      for (var i = 0; i < 4; i++) {
        var g = S.rgrad(-600 + i * 420, -50 + (i % 2) * 60, 20, 380, [
          [0, cols[i % 3]],
          [1, "rgba(0,0,0,0)"]
        ]);
        ctx.fillStyle = g;
        ctx.fillRect(-1400, -400, 2800, 800);
      }
      ctx.restore();
    });

    // Realistic multi-tier star field with spectral tints & twinkling
    S.layer(0.02, function () {
      var v = S.viewRect(0.02);
      var r = rng(101);
      for (var i = 0; i < 220; i++) {
        var sx = v.l + r() * (v.r - v.l);
        var sy = v.t + r() * (v.b - v.t) * 0.88;
        var b = 0.3 + r() * 0.7;
        var sz = 0.6 + r() * 1.4;
        var tw = Math.sin(S.time * (1.5 + r() * 2) + i) * 0.25 + 0.75;
        var tintCol = i % 7 === 0 ? "rgba(180,220,255," : (i % 11 === 0 ? "rgba(255,200,170," : "rgba(255,255,245,");
        ctx.fillStyle = tintCol + (b * tw * 0.85).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, 6.283);
        ctx.fill();
      }
    });

    S.layer(0.04, function () {
      var v = S.viewRect(0.04);
      var r = rng(303);
      for (var i = 0; i < 45; i++) {
        var sx = v.l + r() * (v.r - v.l);
        var sy = v.t + r() * (v.b - v.t) * 0.82;
        var sz = 1.2 + r() * 1.8;
        var tw = Math.sin(S.time * 2.5 + i * 1.3) * 0.3 + 0.7;
        ctx.fillStyle = "rgba(255,255,255," + (0.7 * tw).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, 6.283);
        ctx.fill();
        if (i % 6 === 0) {
          ctx.strokeStyle = "rgba(220,240,255," + (0.45 * tw).toFixed(3) + ")";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - sz * 3, sy); ctx.lineTo(sx + sz * 3, sy);
          ctx.moveTo(sx, sy - sz * 3); ctx.lineTo(sx, sy + sz * 3);
          ctx.stroke();
        }
      }
    });

    // 2. Two Small Moons (Phobos & Deimos) - NO ring artefact
    // Phobos (larger moon)
    S.layer(0.05, function () {
      var mx = 380, my = -560, mr = 26;
      ctx.save();
      ctx.beginPath();
      var r = rng(77);
      for (var a = 0; a < 6.283; a += 0.3) {
        var rad = mr + (r() - 0.5) * 4;
        var px = mx + Math.cos(a) * rad;
        var py = my + Math.sin(a) * rad;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      var phGrad = S.rgrad(mx - mr * 0.3, my - mr * 0.3, 3, mr * 1.1, [
        [0, "#aa9b92"],
        [0.6, "#685950"],
        [1, "#2a201c"]
      ]);
      ctx.fillStyle = phGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(30,20,15,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "rgba(40,28,24,0.55)";
      ctx.beginPath(); ctx.arc(mx - 6, my - 4, 6, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.arc(mx + 8, my + 6, 4, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.arc(mx - 10, my + 8, 3, 0, 6.283); ctx.fill();
      ctx.restore();
    });

    // Deimos (smaller moon)
    S.layer(0.07, function () {
      var dx = -460, dy = -640, dr = 14;
      ctx.save();
      ctx.beginPath();
      var r = rng(88);
      for (var a = 0; a < 6.283; a += 0.4) {
        var rad = dr + (r() - 0.5) * 2.5;
        var px = dx + Math.cos(a) * rad;
        var py = dy + Math.sin(a) * rad;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      var deGrad = S.rgrad(dx - dr * 0.3, dy - dr * 0.3, 2, dr * 1.1, [
        [0, "#beafaa"],
        [0.65, "#7a6a62"],
        [1, "#332622"]
      ]);
      ctx.fillStyle = deGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(30,20,15,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });

    // 3. Martian Atmosphere & Horizon Dust Haze
    S.layer(0.08, function () {
      var v = S.viewRect(0.08);
      var hzGrad = S.vgrad(-300, 100, [
        [0, "rgba(220,90,50,0)"],
        [0.65, "rgba(200,80,45,0.18)"],
        [1, "rgba(160,50,30,0.35)"]
      ]);
      ctx.fillStyle = hzGrad;
      ctx.fillRect(v.l, -300, v.r - v.l, 400);

      // Distant canyon rim plateau line
      ctx.fillStyle = "#361313";
      ctx.beginPath();
      ctx.moveTo(v.l - 40, -130);
      for (var x = v.l - 40; x <= v.r + 40; x += 50) {
        var h = -130 - S.noise1(x * 0.003, 7) * 45 - Math.sin(x * 0.008) * 20;
        ctx.lineTo(x, h);
      }
      ctx.lineTo(v.r + 40, 200);
      ctx.lineTo(v.l - 40, 200);
      ctx.closePath();
      ctx.fill();
    });

    // 4. Visible Giant Canyon & Natural Rock Arch Bridge
    S.layer(0.18, function () {
      var v = S.viewRect(0.18);
      // Deep canyon: two visible depth walls (far rim + near rim) with shadowed floor
      // Far depth wall — receding, atmospheric haze tone
      ctx.fillStyle = "#5c241c";
      ctx.beginPath();
      ctx.moveTo(v.l - 40, -140);
      for (var x = v.l - 40; x <= v.r + 40; x += 40) {
        var fy = -140 - S.noise1(x * 0.004, 12) * 55 - Math.sin(x * 0.006) * 15;
        ctx.lineTo(x, fy);
      }
      ctx.lineTo(v.r + 40, 40);
      ctx.lineTo(v.l - 40, 40);
      ctx.closePath();
      ctx.fill();

      // Deep canyon floor between the walls (dark rocky bottom)
      ctx.fillStyle = "#2a0d0b";
      ctx.beginPath();
      ctx.moveTo(v.l - 40, -30);
      for (var x = v.l - 40; x <= v.r + 40; x += 40) {
        var lf = -30 - S.noise1(x * 0.006, 22) * 22;
        ctx.lineTo(x, lf);
      }
      ctx.lineTo(v.r + 40, 160);
      ctx.lineTo(v.l - 40, 160);
      ctx.closePath();
      ctx.fill();

      // Near depth wall — dark foreground rim of the gorge
      ctx.fillStyle = "#3a1110";
      ctx.beginPath();
      ctx.moveTo(v.l - 40, -60);
      for (var x = v.l - 40; x <= v.r + 40; x += 40) {
        var ny = -60 - S.noise1(x * 0.005, 14) * 70 - Math.sin(x * 0.008) * 20;
        ctx.lineTo(x, ny);
      }
      ctx.lineTo(v.r + 40, 180);
      ctx.lineTo(v.l - 40, 180);
      ctx.closePath();
      ctx.fill();

      // Stratified cliff face wall layers with depth shadows
      ctx.fillStyle = "#381110";
      ctx.beginPath();
      ctx.moveTo(-1500, -60);
      for (var x = -1500; x <= 1500; x += 40) {
        var cliffY = -60 - Math.max(0, S.noise1(x * 0.006, 18)) * 80 - (x > -200 && x < 400 ? 50 : 0);
        ctx.lineTo(x, cliffY);
      }
      ctx.lineTo(1500, 250);
      ctx.lineTo(-1500, 250);
      ctx.closePath();
      ctx.fill();

      // Canyon rock strata lines (ink-style geological stripes)
      ctx.strokeStyle = "rgba(180,70,50,0.22)";
      ctx.lineWidth = 3;
      for (var sy = -80; sy <= 20; sy += 18) {
        ctx.beginPath();
        ctx.moveTo(v.l - 40, sy + Math.sin(sy * 0.1) * 5);
        ctx.lineTo(v.r + 40, sy + Math.cos(sy * 0.1) * 5);
        ctx.stroke();
      }

      // Natural Rock Arch
      var ax = -420, ay = -70, aw = 320, ah = 170;
      ctx.save();
      ctx.fillStyle = "#5c201a";
      ctx.beginPath();
      ctx.moveTo(ax - aw * 0.5, ay + 60);
      ctx.quadraticCurveTo(ax - aw * 0.48, ay - ah, ax, ay - ah);
      ctx.quadraticCurveTo(ax + aw * 0.48, ay - ah, ax + aw * 0.5, ay + 60);
      ctx.lineTo(ax + aw * 0.32, ay + 60);
      ctx.quadraticCurveTo(ax + aw * 0.28, ay - ah * 0.55, ax, ay - ah * 0.55);
      ctx.quadraticCurveTo(ax - aw * 0.28, ay - ah * 0.55, ax - aw * 0.32, ay + 60);
      ctx.closePath();
      ctx.fill();

      // Rock arch ink highlights
      ctx.strokeStyle = "#8d3429";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ax - aw * 0.5, ay + 20);
      ctx.quadraticCurveTo(ax - aw * 0.48, ay - ah, ax, ay - ah);
      ctx.quadraticCurveTo(ax + aw * 0.48, ay - ah, ax + aw * 0.5, ay + 20);
      ctx.stroke();

      // Arch inner shadow edge
      ctx.strokeStyle = "rgba(35,10,10,0.65)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax - aw * 0.32, ay + 60);
      ctx.quadraticCurveTo(ax - aw * 0.28, ay - ah * 0.55, ax, ay - ah * 0.55);
      ctx.quadraticCurveTo(ax + aw * 0.28, ay - ah * 0.55, ax + aw * 0.32, ay + 60);
      ctx.stroke();
      ctx.restore();
    });

    // 5. Layered Martian Sand Dunes
    W.dunes(0.35, -45, 90, 15, "#c8553d", "#7a271c", 0.0035);

    // Dust haze overlay
    S.layer(0.45, function () {
      var v = S.viewRect(0.45);
      var midHaze = S.vgrad(-80, 80, [
        [0, "rgba(210,95,55,0)"],
        [0.5, "rgba(200,85,45,0.22)"],
        [1, "rgba(160,60,35,0)"]
      ]);
      ctx.fillStyle = midHaze;
      ctx.fillRect(v.l, -80, v.r - v.l, 160);
    });

    // Dust haze layer 2 — near-ground atmospheric haze for depth
    S.layer(0.55, function () {
      var v = S.viewRect(0.55);
      var nearHaze = S.vgrad(v.b - 120, v.b, [
        [0, "rgba(200,90,50,0)"],
        [0.5, "rgba(190,80,45,0.16)"],
        [1, "rgba(150,50,28,0.3)"]
      ]);
      ctx.fillStyle = nearHaze;
      ctx.fillRect(v.l, v.b - 120, v.r - v.l, 120);
    });

    // 6. Launch Site with Gantry Tower, Rocket, Engine Exhaust Glow & Smoke Trail
    S.layer(0.65, function () {
      var lx = 480, ly = -50;

      // Launch Pad Base
      ctx.fillStyle = "#2d2426";
      ctx.beginPath();
      ctx.moveTo(lx - 160, ly);
      ctx.lineTo(lx - 130, ly - 20);
      ctx.lineTo(lx + 130, ly - 20);
      ctx.lineTo(lx + 160, ly);
      ctx.lineTo(lx + 180, ly + 40);
      ctx.lineTo(lx - 180, ly + 40);
      ctx.closePath();
      ctx.fill();

      // Industrial hazard warning stripes on launch platform
      ctx.fillStyle = "#d49b28";
      ctx.fillRect(lx - 120, ly - 18, 240, 6);
      ctx.fillStyle = "#1a181c";
      for (var hz = lx - 115; hz < lx + 115; hz += 24) {
        ctx.fillRect(hz, ly - 18, 10, 6);
      }

      // Flame trench under rocket
      ctx.fillStyle = "#140e10";
      ctx.fillRect(lx - 55, ly - 20, 110, 30);

      // Gantry Service Tower
      var gx = lx + 85, gy = ly - 20, gw = 44, gh = 340;
      ctx.fillStyle = "#2a303c";
      ctx.fillRect(gx - gw / 2, gy - gh, 8, gh);
      ctx.fillRect(gx + gw / 2 - 8, gy - gh, 8, gh);

      ctx.strokeStyle = "#465268";
      ctx.lineWidth = 2.5;
      for (var ty = gy - gh; ty < gy; ty += 34) {
        ctx.beginPath(); ctx.moveTo(gx - gw / 2, ty); ctx.lineTo(gx + gw / 2, ty); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx - gw / 2, ty); ctx.lineTo(gx + gw / 2, ty + 34); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx + gw / 2, ty); ctx.lineTo(gx - gw / 2, ty + 34); ctx.stroke();
      }

      // Umbilical service arms
      ctx.fillStyle = "#5a6880";
      ctx.fillRect(gx - gw / 2 - 45, gy - gh + 70, 45, 10);
      ctx.fillRect(gx - gw / 2 - 50, gy - gh + 180, 50, 12);
      ctx.fillRect(gx - gw / 2 - 40, gy - gh + 270, 40, 10);

      // Flashing red beacon on gantry tip
      var beaconFlash = Math.sin(S.time * 6) * 0.5 + 0.5;
      ctx.fillStyle = "rgba(255,40,40," + (0.5 + 0.5 * beaconFlash).toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(gx, gy - gh - 6, 7, 0, 6.283); ctx.fill();
      var bGlow = S.rgrad(gx, gy - gh - 6, 2, 28, [
        [0, "rgba(255,50,50,0.8)"],
        [1, "rgba(255,0,0,0)"]
      ]);
      ctx.fillStyle = bGlow;
      ctx.fillRect(gx - 30, gy - gh - 36, 60, 60);

      // Rocket
      var rx = lx, ry = ly - 20, rw = 36, rh = 260;
      var rkGrad = S.hgrad(rx - rw / 2, rx + rw / 2, [
        [0, "#b0b8c4"],
        [0.35, "#f0f4f8"],
        [0.7, "#d0d8e2"],
        [1, "#687488"]
      ]);
      ctx.fillStyle = rkGrad;
      ctx.beginPath();
      ctx.moveTo(rx, ry - rh);
      ctx.quadraticCurveTo(rx + rw * 0.5, ry - rh + 50, rx + rw / 2, ry - rh + 90);
      ctx.lineTo(rx + rw / 2, ry - 20);
      ctx.lineTo(rx - rw / 2, ry - 20);
      ctx.lineTo(rx - rw / 2, ry - rh + 90);
      ctx.quadraticCurveTo(rx - rw * 0.5, ry - rh + 50, rx, ry - rh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1e2430";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Rocket detail markings
      ctx.fillStyle = "#c84028";
      ctx.fillRect(rx - rw / 2 + 1, ry - rh + 110, rw - 2, 18);
      ctx.fillStyle = "#202634";
      ctx.fillRect(rx - rw / 2 + 1, ry - rh + 175, rw - 2, 8);

      // Tail Fins
      ctx.fillStyle = "#343c4d";
      ctx.beginPath();
      ctx.moveTo(rx - rw / 2, ry - 80);
      ctx.lineTo(rx - rw / 2 - 24, ry - 10);
      ctx.lineTo(rx - rw / 2, ry - 20);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rx + rw / 2, ry - 80);
      ctx.lineTo(rx + rw / 2 + 24, ry - 10);
      ctx.lineTo(rx + rw / 2, ry - 20);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Nozzle
      ctx.fillStyle = "#181a20";
      ctx.beginPath();
      ctx.moveTo(rx - 14, ry - 20);
      ctx.lineTo(rx - 18, ry - 4);
      ctx.lineTo(rx + 18, ry - 4);
      ctx.lineTo(rx + 14, ry - 20);
      ctx.closePath(); ctx.fill();

      // Engine Exhaust Plume & Shock Cone Glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      var exGlow = S.rgrad(rx, ry + 25, 10, 160, [
        [0, "rgba(255,255,240,1)"],
        [0.25, "rgba(255,200,60,0.9)"],
        [0.6, "rgba(255,90,20,0.6)"],
        [1, "rgba(200,30,0,0)"]
      ]);
      ctx.fillStyle = exGlow;
      ctx.fillRect(rx - 180, ry - 40, 360, 240);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(rx - 16, ry - 4);
      ctx.lineTo(rx, ry + 75 + Math.sin(S.time * 20) * 8);
      ctx.lineTo(rx + 16, ry - 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffcc33";
      ctx.beginPath();
      ctx.moveTo(rx - 22, ry - 4);
      ctx.lineTo(rx, ry + 110 + Math.sin(S.time * 15) * 12);
      ctx.lineTo(rx + 22, ry - 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Exhaust Smoke Trail
      var smkSeed = rng(44);
      for (var sm = 0; sm < 24; sm++) {
        var smx = rx + (smkSeed() - 0.5) * 280 + Math.sin(S.time * 1.5 + sm) * 20;
        var smy = ry + 10 + smkSeed() * 50 + Math.cos(S.time * 1.2 + sm) * 10;
        var smr = 28 + smkSeed() * 45;
        var smkGrad = S.rgrad(smx, smy, 4, smr, [
          [0, sm % 2 === 0 ? "rgba(240,170,100,0.65)" : "rgba(180,90,60,0.55)"],
          [0.65, "rgba(90,40,30,0.4)"],
          [1, "rgba(50,20,15,0)"]
        ]);
        ctx.fillStyle = smkGrad;
        ctx.beginPath();
        ctx.arc(smx, smy, smr, 0, 6.283);
        ctx.fill();
      }
    });

    // 7. Foreground Martian Ground Surface & Dust Fog
    S.layer(0.8, function () {
      var r = rng(55);
      for (var i = 0; i < 18; i++) {
        var rx = -1400 + r() * 2800, rs = 20 + r() * 45;
        ctx.fillStyle = "#3a1310";
        ctx.beginPath();
        ctx.ellipse(rx, -40, rs, rs * 0.5, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = "rgba(210,110,75,0.3)";
        ctx.beginPath();
        ctx.ellipse(rx - rs * 0.3, -48, rs * 0.5, rs * 0.22, 0, 0, 6.283);
        ctx.fill();
      }
    });

    W.ground(1, -50, "#8b2c1d", "#3a100b", {});

    S.layer(1, function () {
      var v = S.viewRect(1);
      var fgDust = S.vgrad(v.b - 240, v.b, [
        [0, "rgba(180,70,40,0)"],
        [0.7, "rgba(160,55,30,0.18)"],
        [1, "rgba(130,40,20,0.32)"]
      ]);
      ctx.fillStyle = fgDust;
      ctx.fillRect(v.l, v.b - 240, v.r - v.l, 240);
    });
  }

  function ocean(opt) {
    S.layer(0, function () { var v = S.viewRect(0); ctx.fillStyle = S.vgrad(v.t, v.b, [[0, "#1a8fc0"], [0.35, "#0d5a8c"], [0.75, "#06243f"], [1, "#030d1c"]]); ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); });
    S.layer(0.1, function () { for (var i = 0; i < 6; i++) { var x = -900 + i * 380 + Math.sin(S.time * 0.3 + i) * 40; var g = ctx.createLinearGradient(x, -1000, x + 240, 300); g.addColorStop(0, "rgba(170,235,255,.28)"); g.addColorStop(1, "rgba(170,235,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 50, -1000); ctx.lineTo(x + 70, -1000); ctx.lineTo(x + 330, 300); ctx.lineTo(x + 90, 300); ctx.fill(); } });
    S.layer(0.18, function () {
      var wx = ((S.time * 38) % 3200) - 1600, wy = -320 + Math.sin(S.time * 0.5) * 20;
      ctx.fillStyle = "#14405e"; ctx.beginPath(); ctx.moveTo(wx - 260, wy); ctx.quadraticCurveTo(wx - 120, wy - 90, wx + 120, wy - 40); ctx.quadraticCurveTo(wx + 240, wy - 20, wx + 300, wy - 70); ctx.quadraticCurveTo(wx + 290, wy, wx + 330, wy + 40); ctx.quadraticCurveTo(wx + 230, wy + 20, wx + 120, wy + 40); ctx.quadraticCurveTo(wx - 60, wy + 100, wx - 260, wy); ctx.fill();
      ctx.fillStyle = "#cfe6f2"; ctx.beginPath(); ctx.arc(wx - 190, wy - 12, 5, 0, 6.283); ctx.fill();
    });
    S.layer(0.35, function () { ctx.fillStyle = "#0a2a45"; ctx.beginPath(); ctx.moveTo(-1500, -60); for (var x = -1500; x <= 1500; x += 50) ctx.lineTo(x, -60 - 90 * Math.max(0, S.noise1(x * 0.005, 8))); ctx.lineTo(1500, 200); ctx.lineTo(-1500, 200); ctx.fill(); });
    W.ground(1, -50, "#bfae88", "#8a7a5a", {});
    S.layer(0.7, function () {
      var r = rng(9); for (var i = 0; i < 14; i++) { var x = -1400 + r() * 2800, h = 120 + r() * 160, sw = Math.sin(S.time * 1.2 + i) * 14; ctx.strokeStyle = i % 2 ? "#1f7a4a" : "#2c9a5a"; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, -45); ctx.quadraticCurveTo(x + sw, -45 - h / 2, x + sw * 1.6, -45 - h); ctx.stroke(); }
      for (i = 0; i < 7; i++) { var x2 = -1300 + r() * 2600; ctx.fillStyle = ["#e06a7a", "#e8a23a", "#c04a9a"][i % 3]; for (var k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x2 + k * 16 - 32, -50 - (k % 2) * 12, 16, 0, 6.283); ctx.fill(); } }
    });
    S.layer(0.9, function () { var r = rng(2); for (var i = 0; i < 10; i++) { var fx = ((S.time * (30 + i * 7) + r() * 2600) % 2800) - 1400, fy = -420 + r() * 300 + Math.sin(S.time + i) * 12; ctx.fillStyle = ["#f2a03a", "#f0d048", "#5ad0e0"][i % 3]; ctx.beginPath(); ctx.ellipse(fx, fy, 22, 10, 0, 0, 6.283); ctx.moveTo(fx - 18, fy); ctx.lineTo(fx - 36, fy - 10); ctx.lineTo(fx - 36, fy + 10); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(fx + 12, fy - 2, 2.5, 0, 6.283); ctx.fill(); } });
    S.layer(1.1, function () { var r = rng(4); for (var i = 0; i < 26; i++) { var bx = -700 + r() * 1400, by = 200 - ((S.time * (50 + r() * 60) + r() * 1500) % 1500), rr = 3 + r() * 7; ctx.strokeStyle = "rgba(220,245,255,.6)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(bx + Math.sin(S.time + i) * 10, by, rr, 0, 6.283); ctx.stroke(); } });
    S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "rgba(10,60,110,.18)"; ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); });
  }

  function castle(opt) {
    W.sky(); W.clouds(5, 0.05, -820, 5);
    // Layer 1: Distant mountain ridge and watchtowers (parallax 0.15, atmospheric haze)
    W.ridge(0.15, -160, 130, 4, "#4a6a5a", "#7ca87c", 0.003, 0.45);
    S.layer(0.15, function () {
      ctx.fillStyle = S.alpha(W.cur.haze || "#f4e6c4", 0.22);
      ctx.fillRect(-1600, -350, 3200, 450);
      var r = rng(42);
      for (var i = 0; i < 5; i++) {
        var tx = -1200 + i * 550 + r() * 100;
        ctx.fillStyle = "#5a5f6a";
        ctx.fillRect(tx, -280, 50, 230);
        ctx.fillStyle = "#3e424a";
        ctx.beginPath(); ctx.moveTo(tx - 10, -280); ctx.lineTo(tx + 25, -330); ctx.lineTo(tx + 60, -280); ctx.closePath(); ctx.fill();
      }
    });

    // Layer 2: Mid-ground castle citadel, fortified walls, true-scale gate (170w x 400h), towers (parallax 0.45)
    S.layer(0.45, function () {
      // Cast shadows under castle towers/walls
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath(); ctx.ellipse(-90, -45, 290, 26, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(160, -45, 310, 26, 0, 0, 6.283); ctx.fill();

      ctx.fillStyle = "#8a8f9a";
      ctx.fillRect(-240, -420, 160, 420); // Citadel wall
      ctx.fillRect(70, -500, 180, 500);  // Grand keep tower (true scale >= 500-600h)
      ctx.fillStyle = "#6e737e";
      ctx.fillRect(-250, -450, 180, 40);
      ctx.fillRect(60, -530, 200, 40);
      for (var i = 0; i < 5; i++) {
        ctx.fillRect(-240 + i * 34, -478, 20, 28);
        ctx.fillRect(70 + i * 38, -562, 22, 28);
      }
      // Grand arch door (true scale: 170w x 400h proportion)
      ctx.fillStyle = "#2a1e16";
      ctx.beginPath(); ctx.arc(160, -90, 85, Math.PI, 0, false); ctx.lineTo(220, 0); ctx.lineTo(100, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#1a120c"; ctx.lineWidth = 4; ctx.stroke();

      ctx.fillStyle = "#ffd966";
      ctx.fillRect(-180, -280, 18, 30); ctx.fillRect(-110, -280, 18, 30);
      ctx.fillRect(120, -340, 20, 34); ctx.fillRect(190, -340, 20, 34);

      ctx.fillStyle = "#b5242c";
      ctx.fillRect(-154, -550, 5, 110);
      ctx.beginPath(); ctx.moveTo(-149, -550); ctx.lineTo(-95, -535 + Math.sin(S.time * 3) * 5); ctx.lineTo(-149, -520); ctx.fill();
      ctx.fillRect(164, -620, 5, 110);
      ctx.fillStyle = "#2c6fb3";
      ctx.beginPath(); ctx.moveTo(169, -620); ctx.lineTo(225, -605 + Math.sin(S.time * 3.5) * 6); ctx.lineTo(169, -590); ctx.fill();
    });

    // Layer 3: Foreground houses & fortifications (true scale house: 560w x 620 wall+roof proportion, parallax 0.75)
    S.layer(0.75, function () {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath(); ctx.ellipse(-480, -45, 190, 19, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(450, -45, 210, 21, 0, 0, 6.283); ctx.fill();

      for (var i = 0; i < 2; i++) {
        var hx = i === 0 ? -520 : 380, hw = 260, hh = 220;
        ctx.fillStyle = "#a87d54";
        ctx.fillRect(hx, -hh, hw, hh);
        ctx.fillStyle = "#8a3a24";
        ctx.beginPath(); ctx.moveTo(hx - 25, -hh); ctx.lineTo(hx + hw / 2, -hh - 130); ctx.lineTo(hx + hw + 25, -hh); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#3a2212";
        ctx.fillRect(hx + hw / 2 - 22, -110, 44, 110); // door
        ctx.fillStyle = "#ffb84d";
        ctx.fillRect(hx + 35, -hh + 35, 34, 34); // window
      }
    });

    W.ground(1, -50, "#85a363", "#557038");

    S.layer(1, function () {
      var v = S.viewRect(1);
      ctx.fillStyle = "#b59868";
      ctx.beginPath(); ctx.moveTo(-180, -50); ctx.lineTo(180, -50); ctx.lineTo(340, 300); ctx.lineTo(-340, 300); ctx.closePath(); ctx.fill();
      var R = rng(79);
      ctx.fillStyle = "#4a6230";
      for (var i = 0; i < 18; i++) {
        var sx = -1000 + R() * 2000, sy = -45 + R() * 320;
        ctx.beginPath(); ctx.ellipse(sx, sy, 14 + R() * 20, 7 + R() * 9, 0, 0, 6.283); ctx.fill();
      }
    });
  }

  function city(opt) {
    W.sky(); W.clouds(3, 0.04, -820, 4);
    // Layer 1: Distant skyscrapers with atmospheric haze (parallax 0.15)
    W.ridge(0.15, -150, 100, 3, "#252b38", "#3a4254", 0.003, 0.4);
    S.layer(0.15, function () {
      ctx.fillStyle = S.alpha(W.cur.haze || "#f4e6c4", 0.25);
      ctx.fillRect(-1600, -400, 3200, 500);
      var r = rng(18), x = -1400;
      while (x < 1400) {
        var w = 70 + r() * 90, h = 250 + r() * 250;
        ctx.fillStyle = "#222733";
        ctx.fillRect(x, -h, w, h + 100);
        x += w + 10;
      }
    });

    // Layer 2: Mid-ground major bank/big buildings (520+ w x 640+ h, columns >= 600 tall per scale bible, parallax 0.45)
    S.layer(0.45, function () {
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath(); ctx.ellipse(-280, -45, 340, 28, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(320, -45, 360, 28, 0, 0, 6.283); ctx.fill();

      var r = rng(14), x = -1200;
      while (x < 1200) {
        var w = 110 + r() * 140, h = 550 + r() * 150; // true scale height 550-700h
        ctx.fillStyle = "#1e222d";
        ctx.fillRect(x, -h, w, h + 150);
        ctx.fillStyle = "rgba(255,235,160,.65)";
        for (var wy = -h + 30; wy < -40; wy += 26) {
          for (var wx = x + 14; wx < x + w - 14; wx += 20) {
            if (r() > 0.25) ctx.fillRect(wx, wy, 10, 14);
          }
        }
        x += w + 16;
      }
    });

    W.ground(1, -50, "#424756", "#252833");

    // Layer 3: Foreground street level with street lamps (760 high), curbs, storefronts, and cast shadows (parallax 0.75)
    S.layer(0.75, function () {
      var v = S.viewRect(1);
      ctx.fillStyle = "#2d323d";
      ctx.fillRect(v.l, -50, v.r - v.l, 600);
      ctx.strokeStyle = "#e8c850"; ctx.lineWidth = 6; ctx.setLineDash([35, 35]);
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 500); ctx.stroke(); ctx.setLineDash([]);
      for (var lx = -900; lx <= 900; lx += 450) {
        // Cast shadow under street lamp
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(lx, -45, 25, 12, 0, 0, 6.283); ctx.fill();

        ctx.fillStyle = "#1a1c22"; ctx.fillRect(lx - 6, -760, 12, 760); // street lamp height 760 per scale bible
        ctx.fillStyle = "#e2b23d"; ctx.beginPath(); ctx.arc(lx, -760, 18, 0, 6.283); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        var gl = S.rgrad(lx, -730, 6, 220, [[0, "rgba(255,230,150,.65)"], [1, "rgba(255,230,150,0)"]]);
        ctx.fillStyle = gl; ctx.fillRect(lx - 140, -800, 280, 350);
        ctx.restore();
      }
    });
  }

  function forest(opt) {
    W.sky(); W.clouds(6, 0.05, -820, 6);
    // Layer 1: Distant hazy pine ridges with atmospheric haze (parallax 0.15)
    W.ridge(0.15, -180, 140, 7, "#2c4a38", "#467256", 0.003, 0.5);
    S.layer(0.15, function () {
      ctx.fillStyle = S.alpha(W.cur.haze || "#f4e6c4", 0.25);
      ctx.fillRect(-1600, -350, 3200, 450);
    });

    // Layer 2: Mid-ground pine forest layer (trunk 330, canopy 400 true scale context, parallax 0.45)
    S.layer(0.45, function () {
      var r = rng(19);
      for (var i = 0; i < 28; i++) {
        var tx = -1500 + i * 110 + r() * 30, th = 330 + r() * 180;
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath(); ctx.ellipse(tx, -45, th * 0.22, 14, 0, 0, 6.283); ctx.fill();

        ctx.fillStyle = "#253f2e";
        ctx.beginPath(); ctx.moveTo(tx, -50); ctx.lineTo(tx - th * 0.32, -50 - th * 0.45); ctx.lineTo(tx, -50 - th); ctx.lineTo(tx + th * 0.32, -50 - th * 0.45); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#1b2f21";
        ctx.fillRect(tx - th * 0.06, -50, th * 0.12, 50);
      }
    });

    W.ground(1, -50, "#3e5c38", "#243820", { grass: "#689e5a" });

    // Layer 3: Foreground giant ancient trees, mossy rocks, and cast shadows (parallax 0.75)
    S.layer(0.75, function () {
      var r = rng(22);
      for (var i = 0; i < 14; i++) {
        var x = -1300 + r() * 2600, w = 60 + r() * 80, h = 90 + r() * 120;
        ctx.fillStyle = "rgba(0,0,0,0.32)";
        ctx.beginPath(); ctx.ellipse(x, -45, w * 0.8, 18, 0, 0, 6.283); ctx.fill();

        ctx.fillStyle = "#2d442a";
        ctx.beginPath(); ctx.ellipse(x, -40, w, h * 0.5, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = "rgba(120,180,100,.35)";
        ctx.beginPath(); ctx.ellipse(x - w * 0.2, -50 - h * 0.2, w * 0.4, h * 0.25, 0, 0, 6.283); ctx.fill();
      }
    });
  }

  function snow(opt) {
    W.sky(); W.clouds(4, 0.05, -820, 5);
    // Layer 1: Distant snow mountain peaks and glaciers with atmospheric haze (parallax 0.15)
    S.layer(0.15, function () {
      var v = S.viewRect(0.15), pts = [], step = 60;
      for (var x = v.l - 60; x <= v.r + 60; x += step) {
        pts.push([x, -180 - (S.noise1(x * 0.003, 15) * 0.5 + 0.5) * 320]);
      }
      var g = S.vgrad(-460, 100, [[0, "#d8e8fc"], [0.6, "#7892be"], [1, "#425a82"]]);
      ctx.fillStyle = g;
      S.smooth(pts.concat([[v.r + 60, 600], [v.l - 60, 600]]), true); ctx.fill();
      ctx.fillStyle = S.alpha(W.cur.haze || "#f4e6c4", 0.2);
      ctx.fillRect(v.l, -400, v.r - v.l, 500);
    });

    // Layer 2: Mid-ground snow-laden fir trees (trunk 330, canopy 400 true scale context, parallax 0.45)
    S.layer(0.45, function () {
      var r = rng(31);
      for (var i = 0; i < 20; i++) {
        var tx = -1300 + i * 140 + r() * 40, th = 240 + r() * 160;
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath(); ctx.ellipse(tx, -45, th * 0.25, 14, 0, 0, 6.283); ctx.fill();

        ctx.fillStyle = "#3b4f63";
        ctx.beginPath(); ctx.moveTo(tx, -50); ctx.lineTo(tx - th * 0.38, -50 - th * 0.55); ctx.lineTo(tx, -50 - th); ctx.lineTo(tx + th * 0.38, -50 - th * 0.55); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#e6f0fa";
        ctx.beginPath(); ctx.moveTo(tx, -50 - th); ctx.lineTo(tx - th * 0.28, -50 - th * 0.75); ctx.lineTo(tx + th * 0.28, -50 - th * 0.75); ctx.closePath(); ctx.fill();
      }
    });

    W.ground(1, -50, "#e8f2fc", "#c5d7ed");

    // Layer 3: Foreground snow drifts, icy rocks, and blue-gray cast shadows (parallax 0.75)
    S.layer(0.75, function () {
      var r = rng(45);
      for (var i = 0; i < 14; i++) {
        var rx = -1300 + r() * 2600, rw = 50 + r() * 70, rh = 30 + r() * 40;
        ctx.fillStyle = "rgba(70,95,130,0.3)";
        ctx.beginPath(); ctx.ellipse(rx, -42, rw * 0.9, 16, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#d2e2f6";
        ctx.beginPath(); ctx.ellipse(rx, -45, rw, rh, 0, 0, 6.283); ctx.fill();
      }
    });

    S.layer(1.2, function () {
      var r = rng(45);
      for (var i = 0; i < 120; i++) {
        var sx = ((r() * S.VW + S.time * (40 + r() * 40)) % S.VW);
        var sy = ((S.time * (120 + r() * 180) + r() * S.VH) % S.VH) - 100;
        ctx.fillStyle = "rgba(255,255,255,.85)";
        ctx.beginPath(); ctx.arc(sx, sy, 1.5 + r() * 2.5, 0, 6.283); ctx.fill();
      }
    });
  }

  function jungle(opt) {
    W.sky(); W.clouds(5, 0.05, -820, 6);
    // Layer 1: Distant tropical mountain ridges with humid atmospheric haze (parallax 0.15)
    W.ridge(0.15, -160, 130, 13, "#1b3826", "#2f5c40", 0.003, 0.5);
    S.layer(0.15, function () {
      ctx.fillStyle = S.alpha(W.cur.haze || "#f4e6c4", 0.25);
      ctx.fillRect(-1600, -350, 3200, 450);
    });

    // Layer 2: Mid-ground towering jungle canopy trees (trunk 330+, canopy 400+ true scale context, parallax 0.45)
    S.layer(0.45, function () {
      var r = rng(66);
      for (var i = 0; i < 22; i++) {
        var jx = -1400 + i * 130 + r() * 40, jh = 280 + r() * 200;
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.ellipse(jx, -45, jh * 0.22, 16, 0, 0, 6.283); ctx.fill();

        ctx.fillStyle = "#183020";
        ctx.fillRect(jx - 18, -50 - jh, 36, jh);
        ctx.fillStyle = "#2c5c38";
        ctx.beginPath(); ctx.arc(jx, -50 - jh, jh * 0.5, 0, 6.283); ctx.fill();
      }
    });

    W.ground(1, -50, "#2c4a30", "#182b1c", { grass: "#488a52" });

    // Layer 3: Foreground giant ferns, hanging vines, mossy roots, and cast shadows (parallax 0.75)
    S.layer(0.75, function () {
      var r = rng(77);
      for (var i = 0; i < 16; i++) {
        var fx = -1300 + r() * 2600;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.ellipse(fx, -45, 50, 18, 0, 0, 6.283); ctx.fill();

        ctx.fillStyle = "#356840";
        for (var f = 0; f < 5; f++) {
          ctx.beginPath();
          ctx.ellipse(fx + (f - 2) * 24, -45 - f * 9, 40, 14, (f - 2) * 0.25, 0, 6.283);
          ctx.fill();
        }
      }
    });
  }

  function volcano(opt) {
    W.sky(); W.clouds(7, 0.05, -820, 5);
    S.layer(0.08, function () {
      var g = S.vgrad(-400, 0, [[0, "#3a120c"], [0.5, "#5c2415"], [1, "#240a08"]]);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-900, 0); ctx.lineTo(-120, -380); ctx.lineTo(120, -380); ctx.lineTo(900, 0); ctx.closePath(); ctx.fill();
      var lg = ctx.createLinearGradient(-40, -380, 40, -100);
      lg.addColorStop(0, "#ffcc44"); lg.addColorStop(0.3, "#ff4411"); lg.addColorStop(1, "#881100");
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.moveTo(-60, -380); ctx.lineTo(60, -380); ctx.lineTo(110, 0); ctx.lineTo(30, 0); ctx.closePath(); ctx.fill();
      var gl = S.rgrad(0, -380, 10, 160, [[0, "rgba(255,160,50,.8)"], [1, "rgba(255,160,50,0)"]]);
      ctx.fillStyle = gl; ctx.fillRect(-200, -500, 400, 300);
    });
    W.ground(1, -50, "#381a15", "#1c0d0a");
    S.layer(1.1, function () {
      var r = rng(55);
      for (var i = 0; i < 70; i++) {
        var ex = ((r() * S.VW + Math.sin(S.time + i) * 80) % S.VW);
        var ey = S.VH - ((S.time * (80 + r() * 120) + r() * S.VH) % S.VH);
        ctx.fillStyle = i % 2 ? "#ffaa33" : "#ff4422";
        ctx.beginPath(); ctx.arc(ex, ey, 1 + r() * 2.5, 0, 6.283); ctx.fill();
      }
    });
  }

  return {
    space: space,
    ocean: ocean,
    castle: castle,
    city: city,
    forest: forest,
    snow: snow,
    volcano: volcano,
    jungle: jungle
  };
})();
