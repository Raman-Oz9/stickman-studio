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
    S.layer(0, function () { var v = S.viewRect(0); ctx.fillStyle = S.vgrad(v.t, v.b, [[0, "#02040a"], [0.55, "#0b0c1e"], [1, "#1a0f2b"]]); ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); });
    stars(0.03, 100, 11); stars(0.07, 50, 23);
    S.layer(0.04, function () { var cols = ["rgba(120,60,180,.22)", "rgba(40,110,190,.18)", "rgba(190,70,110,.16)"]; for (var i = 0; i < 3; i++) { ctx.fillStyle = S.rgrad(-500 + i * 520, -520 + i * 60, 10, 460, [[0, cols[i]], [1, "rgba(0,0,0,0)"]]); ctx.fillRect(-1300, -1100, 2600, 1400); } });
    planet(0.08, 470, -560, 190, "#c8693a", "#5a1f18", true);
    planet(0.06, -520, -700, 60, "#8fa7c4", "#2a3550", false);
    S.layer(0.12, function () { ctx.fillStyle = "#1a0e1c"; ctx.beginPath(); ctx.moveTo(-1500, -80); for (var x = -1500; x <= 1500; x += 60) ctx.lineTo(x, -80 - 70 * Math.max(0, S.noise1(x * 0.004, 3)) - 30 * Math.abs(Math.sin(x * 0.011))); ctx.lineTo(1500, 200); ctx.lineTo(-1500, 200); ctx.fill(); });
    W.ground(1, -50, "#3a1c24", "#1a0c10", {});
    S.layer(0.8, function () { var r = rng(5); for (var i = 0; i < 16; i++) { var x = -1400 + r() * 2800, s = 18 + r() * 40; ctx.fillStyle = "#2a151b"; ctx.beginPath(); ctx.ellipse(x, -40, s, s * 0.55, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = "rgba(180,120,200,.25)"; ctx.beginPath(); ctx.ellipse(x - s * 0.3, -50, s * 0.5, s * 0.2, 0, 0, 6.283); ctx.fill(); } });
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
