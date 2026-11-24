// Extra locations: PL.space (Mars), PL.ocean (deep sea)
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
  function space() {
    S.layer(0, function () { var v = S.viewRect(0); ctx.fillStyle = S.vgrad(v.t, v.b, [[0, "#04060f"], [0.55, "#120b2a"], [1, "#3a1a30"]]); ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); });
    stars(0.03, 90, 11); stars(0.07, 40, 23);
    S.layer(0.04, function () { var cols = ["rgba(120,60,180,.22)", "rgba(40,110,190,.18)", "rgba(190,70,110,.16)"]; for (var i = 0; i < 3; i++) { ctx.fillStyle = S.rgrad(-500 + i * 520, -520 + i * 60, 10, 460, [[0, cols[i]], [1, "rgba(0,0,0,0)"]]); ctx.fillRect(-1300, -1100, 2600, 1400); } });
    planet(0.08, 470, -560, 190, "#c8693a", "#5a1f18", true);
    planet(0.06, -520, -700, 60, "#8fa7c4", "#2a3550", false);
    S.layer(0.12, function () { ctx.fillStyle = "#3a2030"; ctx.beginPath(); ctx.moveTo(-1500, -80); for (var x = -1500; x <= 1500; x += 60) ctx.lineTo(x, -80 - 70 * Math.max(0, S.noise1(x * 0.004, 3)) - 30 * Math.abs(Math.sin(x * 0.011))); ctx.lineTo(1500, 200); ctx.lineTo(-1500, 200); ctx.fill(); });
    W.ground(1, -50, "#a8553a", "#7d3a2c", {}); 
    S.layer(0.8, function () { var r = rng(5); for (var i = 0; i < 16; i++) { var x = -1400 + r() * 2800, s = 18 + r() * 40; ctx.fillStyle = "#6b3226"; ctx.beginPath(); ctx.ellipse(x, -40, s, s * 0.55, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = "rgba(255,170,120,.25)"; ctx.beginPath(); ctx.ellipse(x - s * 0.3, -50, s * 0.5, s * 0.2, 0, 0, 6.283); ctx.fill(); } });
  }
  function ocean(o) {
    S.layer(0, function () { var v = S.viewRect(0); ctx.fillStyle = S.vgrad(v.t, v.b, [[0, "#1a8fc0"], [0.35, "#0d5a8c"], [0.75, "#06243f"], [1, "#030d1c"]]); ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); });
    S.layer(0.1, function () { for (var i = 0; i < 6; i++) { var x = -900 + i * 380 + Math.sin(S.time * 0.3 + i) * 40; var g = ctx.createLinearGradient(x, -1000, x + 240, 300); g.addColorStop(0, "rgba(170,235,255,.28)"); g.addColorStop(1, "rgba(170,235,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 50, -1000); ctx.lineTo(x + 70, -1000); ctx.lineTo(x + 330, 300); ctx.lineTo(x + 90, 300); ctx.fill(); } });
    S.layer(0.18, function () { // distant whale
      var wx = ((S.time * 38) % 3200) - 1600, wy = -320 + Math.sin(S.time * 0.5) * 20; ctx.fillStyle = "#14405e"; ctx.beginPath(); ctx.moveTo(wx - 260, wy); ctx.quadraticCurveTo(wx - 120, wy - 90, wx + 120, wy - 40); ctx.quadraticCurveTo(wx + 240, wy - 20, wx + 300, wy - 70); ctx.quadraticCurveTo(wx + 290, wy, wx + 330, wy + 40); ctx.quadraticCurveTo(wx + 230, wy + 20, wx + 120, wy + 40); ctx.quadraticCurveTo(wx - 60, wy + 100, wx - 260, wy); ctx.fill(); ctx.fillStyle = "#cfe6f2"; ctx.beginPath(); ctx.arc(wx - 190, wy - 12, 5, 0, 6.283); ctx.fill(); });
    S.layer(0.35, function () { ctx.fillStyle = "#0a2a45"; ctx.beginPath(); ctx.moveTo(-1500, -60); for (var x = -1500; x <= 1500; x += 50) ctx.lineTo(x, -60 - 90 * Math.max(0, S.noise1(x * 0.005, 8))); ctx.lineTo(1500, 200); ctx.lineTo(-1500, 200); ctx.fill(); });
    W.ground(1, -50, "#bfae88", "#8a7a5a", {});
    S.layer(0.7, function () { var r = rng(9); for (var i = 0; i < 14; i++) { var x = -1400 + r() * 2800, h = 120 + r() * 160, sw = Math.sin(S.time * 1.2 + i) * 14; ctx.strokeStyle = i % 2 ? "#1f7a4a" : "#2c9a5a"; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, -45); ctx.quadraticCurveTo(x + sw, -45 - h / 2, x + sw * 1.6, -45 - h); ctx.stroke(); }
      for (i = 0; i < 7; i++) { x = -1300 + r() * 2600; ctx.fillStyle = ["#e06a7a", "#e8a23a", "#c04a9a"][i % 3]; for (var k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + k * 16 - 32, -50 - (k % 2) * 12, 16, 0, 6.283); ctx.fill(); } } });
    S.layer(0.9, function () { var r = rng(2); for (var i = 0; i < 10; i++) { var fx = ((S.time * (30 + i * 7) + r() * 2600) % 2800) - 1400, fy = -420 + r() * 300 + Math.sin(S.time + i) * 12; ctx.fillStyle = ["#f2a03a", "#f0d048", "#5ad0e0"][i % 3]; ctx.beginPath(); ctx.ellipse(fx, fy, 22, 10, 0, 0, 6.283); ctx.moveTo(fx - 18, fy); ctx.lineTo(fx - 36, fy - 10); ctx.lineTo(fx - 36, fy + 10); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(fx + 12, fy - 2, 2.5, 0, 6.283); ctx.fill(); } });
    S.layer(1.1, function () { var r = rng(4); for (var i = 0; i < 26; i++) { var bx = -700 + r() * 1400, by = 200 - ((S.time * (50 + r() * 60) + r() * 1500) % 1500), rr = 3 + r() * 7; ctx.strokeStyle = "rgba(220,245,255,.6)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(bx + Math.sin(S.time + i) * 10, by, rr, 0, 6.283); ctx.stroke(); } });
    S.layer(1, function () { var v = S.viewRect(1); ctx.fillStyle = "rgba(10,60,110,.18)"; ctx.fillRect(v.l, v.t, v.r - v.l, v.b - v.t); });
  }
  return { space: space, ocean: ocean };
})();
