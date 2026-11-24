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
    W.ridge(0.08, -150, 110, 4, "#5a7a5a", "#7ca87c", 0.003, 0.45);
    S.layer(0.2, function () {
      ctx.fillStyle = "#8a8f9a";
      ctx.fillRect(-220, -320, 140, 320);
      ctx.fillRect(80, -380, 160, 380);
      ctx.fillStyle = "#6e737e";
      ctx.fillRect(-230, -350, 160, 40);
      ctx.fillRect(70, -410, 180, 40);
      for (var i = 0; i < 5; i++) {
        ctx.fillRect(-220 + i * 30, -376, 18, 26);
        ctx.fillRect(80 + i * 34, -436, 20, 26);
      }
      ctx.fillStyle = "#2a1e16";
      ctx.beginPath(); ctx.arc(160, -80, 40, Math.PI, 0, false); ctx.lineTo(200, 0); ctx.lineTo(120, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffd966";
      ctx.fillRect(-160, -220, 16, 26); ctx.fillRect(-100, -220, 16, 26);
      ctx.fillRect(120, -280, 18, 28); ctx.fillRect(180, -280, 18, 28);
      ctx.fillStyle = "#b5242c";
      ctx.fillRect(-154, -450, 4, 100);
      ctx.beginPath(); ctx.moveTo(-150, -450); ctx.lineTo(-100, -435 + Math.sin(S.time * 3) * 4); ctx.lineTo(-150, -420); ctx.fill();
      ctx.fillRect(164, -510, 4, 100);
      ctx.fillStyle = "#2c6fb3";
      ctx.beginPath(); ctx.moveTo(168, -510); ctx.lineTo(218, -495 + Math.sin(S.time * 3.5) * 5); ctx.lineTo(168, -480); ctx.fill();
    });
    S.layer(0.4, function () {
      for (var i = 0; i < 4; i++) {
        var hx = -650 + i * 340 + (i > 1 ? 200 : 0);
        ctx.fillStyle = "#a87d54";
        ctx.fillRect(hx, -140, 120, 140);
        ctx.fillStyle = "#8a3a24";
        ctx.beginPath(); ctx.moveTo(hx - 15, -140); ctx.lineTo(hx + 60, -220); ctx.lineTo(hx + 135, -140); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#3a2212";
        ctx.fillRect(hx + 45, -80, 30, 80);
        ctx.fillStyle = "#ffb84d";
        ctx.fillRect(hx + 20, -110, 22, 22);
      }
    });
    W.ground(1, -50, "#85a363", "#557038");
    S.layer(1, function () {
      var v = S.viewRect(1);
      ctx.fillStyle = "#b59868";
      ctx.beginPath(); ctx.moveTo(-180, -50); ctx.lineTo(180, -50); ctx.lineTo(320, 300); ctx.lineTo(-320, 300); ctx.closePath(); ctx.fill();
    });
  }

  function city(opt) {
    W.sky(); W.clouds(3, 0.04, -820, 4);
    S.layer(0.08, function () {
      var r = rng(8), x = -1400;
      while (x < 1400) {
        var w = 50 + r() * 90, h = 180 + r() * 250;
        ctx.fillStyle = "#32384a";
        ctx.fillRect(x, -h, w, h + 100);
        ctx.fillStyle = "rgba(255,220,130,.4)";
        for (var wy = -h + 20; wy < -20; wy += 24) {
          for (var wx = x + 10; wx < x + w - 10; wx += 16) {
            if (r() > 0.3) ctx.fillRect(wx, wy, 8, 12);
          }
        }
        x += w + 6;
      }
    });
    S.layer(0.2, function () {
      var r = rng(14), x = -1200;
      while (x < 1200) {
        var w = 70 + r() * 110, h = 300 + r() * 320;
        ctx.fillStyle = "#1e222d";
        ctx.fillRect(x, -h, w, h + 150);
        ctx.fillStyle = "rgba(255,235,160,.65)";
        for (var wy = -h + 25; wy < -30; wy += 22) {
          for (var wx = x + 12; wx < x + w - 12; wx += 18) {
            if (r() > 0.25) ctx.fillRect(wx, wy, 9, 11);
          }
        }
        x += w + 12;
      }
    });
    W.ground(1, -50, "#424756", "#252833");
    S.layer(1, function () {
      var v = S.viewRect(1);
      ctx.fillStyle = "#2d323d";
      ctx.fillRect(v.l, -50, v.r - v.l, 600);
      ctx.strokeStyle = "#e8c850"; ctx.lineWidth = 6; ctx.setLineDash([35, 35]);
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 500); ctx.stroke(); ctx.setLineDash([]);
      for (var lx = -900; lx <= 900; lx += 450) {
        ctx.fillStyle = "#1a1c22"; ctx.fillRect(lx - 4, -220, 8, 220);
        ctx.fillStyle = "#e2b23d"; ctx.beginPath(); ctx.arc(lx, -220, 14, 0, 6.283); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        var gl = S.rgrad(lx, -200, 4, 180, [[0, "rgba(255,230,150,.55)"], [1, "rgba(255,230,150,0)"]]);
        ctx.fillStyle = gl; ctx.fillRect(lx - 120, -240, 240, 300);
        ctx.restore();
      }
    });
  }

  function forest(opt) {
    W.sky(); W.clouds(6, 0.05, -820, 6);
    W.ridge(0.08, -160, 130, 7, "#2c4a38", "#467256", 0.003, 0.5);
    W.ridge(0.15, -135, 90, 11, "#365c44", "#528a64", 0.005, 0.4);
    S.layer(0.3, function () {
      var r = rng(19);
      for (var i = 0; i < 22; i++) {
        var tx = -1400 + i * 130 + r() * 40, th = 220 + r() * 160;
        ctx.fillStyle = "#253f2e";
        ctx.beginPath(); ctx.moveTo(tx, -50); ctx.lineTo(tx - th * 0.3, -50 - th * 0.4); ctx.lineTo(tx, -50 - th); ctx.lineTo(tx + th * 0.3, -50 - th * 0.4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#1b2f21";
        ctx.fillRect(tx - th * 0.05, -50, th * 0.1, 40);
      }
    });
    W.ground(1, -50, "#3e5c38", "#243820", { grass: "#689e5a" });
    S.layer(0.8, function () {
      var r = rng(22);
      for (var i = 0; i < 18; i++) {
        var x = -1300 + r() * 2600, w = 40 + r() * 60, h = 60 + r() * 90;
        ctx.fillStyle = "#2d442a";
        ctx.beginPath(); ctx.ellipse(x, -35, w, h * 0.5, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = "rgba(120,180,100,.3)";
        ctx.beginPath(); ctx.ellipse(x - w * 0.2, -45 - h * 0.2, w * 0.4, h * 0.25, 0, 0, 6.283); ctx.fill();
      }
    });
  }

  function snow(opt) {
    W.sky(); W.clouds(4, 0.05, -820, 5);
    S.layer(0.06, function () {
      var v = S.viewRect(0.06), pts = [], step = 60;
      for (var x = v.l - 60; x <= v.r + 60; x += step) {
        pts.push([x, -140 - (S.noise1(x * 0.003, 15) * 0.5 + 0.5) * 280]);
      }
      var g = S.vgrad(-420, 100, [[0, "#eef6ff"], [0.6, "#8fa3cf"], [1, "#546e96"]]);
      ctx.fillStyle = g;
      S.smooth(pts.concat([[v.r + 60, 600], [v.l - 60, 600]]), true); ctx.fill();
      ctx.fillStyle = "#ffffff";
      for (var i = 1; i < pts.length - 1; i += 2) {
        ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i - 1][0] - 20, pts[i - 1][1] + 60); ctx.lineTo(pts[i + 1][0] + 20, pts[i + 1][1] + 60); ctx.closePath(); ctx.fill();
      }
    });
    S.layer(0.25, function () {
      var r = rng(31);
      for (var i = 0; i < 16; i++) {
        var tx = -1200 + i * 160 + r() * 50, th = 180 + r() * 120;
        ctx.fillStyle = "#3b4f63";
        ctx.beginPath(); ctx.moveTo(tx, -50); ctx.lineTo(tx - th * 0.35, -50 - th * 0.5); ctx.lineTo(tx, -50 - th); ctx.lineTo(tx + th * 0.35, -50 - th * 0.5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#e6f0fa";
        ctx.beginPath(); ctx.moveTo(tx, -50 - th); ctx.lineTo(tx - th * 0.25, -50 - th * 0.7); ctx.lineTo(tx + th * 0.25, -50 - th * 0.7); ctx.closePath(); ctx.fill();
      }
    });
    W.ground(1, -50, "#e8f2fc", "#c5d7ed");
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

  function jungle(opt) {
    W.sky(); W.clouds(5, 0.05, -820, 6);
    W.ridge(0.08, -150, 120, 13, "#1b3826", "#2f5c40", 0.003, 0.5);
    W.ridge(0.16, -125, 90, 17, "#244a32", "#3e7050", 0.005, 0.4);
    S.layer(0.3, function () {
      var r = rng(66);
      for (var i = 0; i < 18; i++) {
        var jx = -1300 + i * 150 + r() * 40, jh = 240 + r() * 180;
        ctx.fillStyle = "#183020";
        ctx.fillRect(jx - 15, -50 - jh, 30, jh);
        ctx.fillStyle = "#2c5c38";
        ctx.beginPath(); ctx.arc(jx, -50 - jh, jh * 0.45, 0, 6.283); ctx.fill();
        if (i % 2 === 0) {
          ctx.strokeStyle = "#3a7a48"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(jx - 20, -50 - jh * 0.7);
          ctx.quadraticCurveTo(jx - 40 + Math.sin(S.time + i) * 10, -50 - jh * 0.3, jx - 10, -50);
          ctx.stroke();
        }
      }
    });
    W.ground(1, -50, "#2c4a30", "#182b1c", { grass: "#488a52" });
    S.layer(0.8, function () {
      var r = rng(77);
      for (var i = 0; i < 12; i++) {
        var fx = -1200 + r() * 2400;
        ctx.fillStyle = "#356840";
        for (var f = 0; f < 5; f++) {
          ctx.beginPath();
          ctx.ellipse(fx + (f - 2) * 22, -45 - f * 8, 36, 12, (f - 2) * 0.25, 0, 6.283);
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
