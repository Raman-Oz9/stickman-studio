// Studio engine: FX library (snow, embers, fireflies, puff, ripples, speed lines, shockwave, dust motes, confetti, bubbles, shooting stars, aurora, shimmer)
var FX = (function () {
  var S = ST, ctx = S.ctx, rng = S.rng;

  return {
    snow: function (opts, dt) {
      opts = opts || {};
      var p = opts.p != null ? opts.p : 0.9;
      var count = opts.count || 60;
      var seed = opts.seed || 101;
      S.layer(p, function () {
        var v = S.viewRect(p);
        var r = rng(seed);
        for (var i = 0; i < count; i++) {
          var rx = r(), ry = r();
          var x = v.l + rx * (v.r - v.l);
          var speed = 40 + r() * 60;
          var y = v.t + ((ry * (v.b - v.t) + S.time * speed) % (v.b - v.t + 100)) - 50;
          var drift = Math.sin(S.time * 1.5 + i) * 15;
          var sz = 2 + r() * 3.5;
          ctx.fillStyle = S.alpha("#ffffff", 0.6 + r() * 0.3);
          ctx.beginPath();
          ctx.arc(x + drift, y, sz, 0, 6.283);
          ctx.fill();
        }
      });
    },

    embers: function (opts, dt) {
      opts = opts || {};
      var p = opts.p != null ? opts.p : 1;
      var count = opts.count || 40;
      var seed = opts.seed || 202;
      S.layer(p, function () {
        var v = S.viewRect(p);
        var r = rng(seed);
        for (var i = 0; i < count; i++) {
          var rx = r(), ry = r();
          var x = (opts.cx || 0) + (rx - 0.5) * 400 + Math.sin(S.time * 2 + i) * 20;
          var speed = 50 + r() * 70;
          var y = (opts.cy || 0) + 50 - ((S.time * speed + ry * 500) % 600);
          var sz = 1.5 + r() * 3;
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = S.alpha(i % 2 === 0 ? "#ff8a22" : "#ffd25a", 0.7 + r() * 0.3);
          ctx.beginPath();
          ctx.arc(x, y, sz, 0, 6.283);
          ctx.fill();
          ctx.restore();
        }
      });
    },

    fireflies: function (opts, dt) {
      opts = opts || {};
      var p = opts.p != null ? opts.p : 1;
      var count = opts.count || 30;
      var seed = opts.seed || 303;
      S.layer(p, function () {
        var v = S.viewRect(p);
        var r = rng(seed);
        for (var i = 0; i < count; i++) {
          var rx = r(), ry = r();
          var x = v.l + rx * (v.r - v.l) + Math.sin(S.time * 0.8 + i * 1.3) * 40;
          var y = v.t + ry * (v.b - v.t) * 0.8 + Math.cos(S.time * 1.1 + i) * 25;
          var alphaPulse = 0.3 + 0.5 * Math.sin(S.time * 3 + i * 2);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = S.alpha("#a8ff78", alphaPulse);
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, 6.283);
          ctx.fill();
          ctx.restore();
        }
      });
    },

    puff: function (x, y, opts) {
      if (typeof x === "object" && x !== null) {
        opts = x;
        x = opts.x || 0;
        y = opts.y || 0;
      }
      x = x || 0;
      y = y || 0;
      var age = (opts && opts.age != null) ? opts.age : ((S.time * 3) % 1);
      var r = 8 + age * 28;
      var alpha = Math.max(0, 1 - age);
      S.layer(1, function () {
        ctx.fillStyle = S.alpha("#e2d3b8", alpha * 0.45);
        ctx.beginPath();
        ctx.arc(x, y - age * 12, r, 0, 6.283);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - 14 * age, y - 6 - age * 8, r * 0.6, 0, 6.283);
        ctx.fill();
      });
    },

    waterRipples: function (opts, dt) {
      opts = opts || {};
      var cx = opts.x || 0, cy = opts.y || 0;
      var count = opts.count || 3;
      S.layer(1, function () {
        for (var i = 0; i < count; i++) {
          var phase = ((S.time * 1.2 + i * 0.7) % 3);
          var r = 10 + phase * 35;
          var a = Math.max(0, 1 - phase / 3);
          ctx.strokeStyle = S.alpha("#ffffff", a * 0.5);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, 6.283);
          ctx.stroke();
        }
      });
    },

    speedLines: function (opts, dt) {
      opts = opts || {};
      var intensity = opts.intensity || 0.6;
      var VW = S.VW, VH = S.VH;
      ctx.save();
      ctx.strokeStyle = S.alpha("#ffffff", intensity * 0.35);
      ctx.lineWidth = 2;
      var r = rng(404);
      for (var i = 0; i < 24; i++) {
        var x = r() * VW, y = r() * VH;
        var len = 60 + r() * 120;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y);
        ctx.stroke();
      }
      ctx.restore();
    },

    shockwaveRing: function (opts, dt) {
      opts = opts || {};
      var cx = opts.x || 0, cy = opts.y || 0;
      var phase = (S.time * 2.5) % 1;
      var r = 20 + phase * 180;
      var a = Math.max(0, 1 - phase);
      S.layer(1, function () {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = S.alpha("#ffdf8a", a * 0.8);
        ctx.lineWidth = 4 * a;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 6.283);
        ctx.stroke();
        ctx.restore();
      });
    },

    dustMotes: function (opts, dt) {
      opts = opts || {};
      var p = opts.p != null ? opts.p : 0.9;
      var count = opts.count || 35;
      var seed = opts.seed || 505;
      S.layer(p, function () {
        var v = S.viewRect(p);
        var r = rng(seed);
        for (var i = 0; i < count; i++) {
          var rx = r(), ry = r();
          var x = v.l + rx * (v.r - v.l) + Math.sin(S.time + i) * 10;
          var y = v.t + ry * (v.b - v.t) + Math.cos(S.time * 0.7 + i) * 10;
          var a = 0.2 + 0.5 * Math.abs(Math.sin(S.time * 2 + i * 1.5));
          ctx.fillStyle = S.alpha("#fff8dc", a);
          ctx.beginPath();
          ctx.arc(x, y, 1.5 + r() * 2, 0, 6.283);
          ctx.fill();
        }
      });
    },

    confetti: function (opts, dt) {
      opts = opts || {};
      var count = opts.count || 50;
      var seed = opts.seed || 606;
      var VW = S.VW, VH = S.VH;
      ctx.save();
      var r = rng(seed);
      var cols = ["#e8b53a", "#b3262d", "#2c6fb3", "#2a9a5a", "#e8782c", "#9a4ac0"];
      for (var i = 0; i < count; i++) {
        var rx = r(), ry = r();
        var x = (rx * VW + S.time * (20 + r() * 40)) % VW;
        var y = (ry * VH + S.time * (80 + r() * 100)) % VH;
        var sz = 4 + r() * 6;
        ctx.fillStyle = cols[i % cols.length];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(S.time * (2 + r() * 3) + i);
        ctx.fillRect(-sz / 2, -sz / 4, sz, sz / 2);
        ctx.restore();
      }
      ctx.restore();
    },

    bubbles: function (opts, dt) {
      opts = opts || {};
      var p = opts.p != null ? opts.p : 1;
      var count = opts.count || 25;
      var seed = opts.seed || 707;
      S.layer(p, function () {
        var v = S.viewRect(p);
        var r = rng(seed);
        for (var i = 0; i < count; i++) {
          var rx = r(), ry = r();
          var x = v.l + rx * (v.r - v.l) + Math.sin(S.time * 2 + i) * 15;
          var speed = 60 + r() * 80;
          var y = v.b - ((S.time * speed + ry * 800) % (v.b - v.t + 100));
          var sz = 3 + r() * 6;
          ctx.strokeStyle = S.alpha("#aef0ff", 0.7);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, sz, 0, 6.283);
          ctx.stroke();
          ctx.fillStyle = S.alpha("#ffffff", 0.5);
          ctx.beginPath();
          ctx.arc(x - sz * 0.3, y - sz * 0.3, sz * 0.3, 0, 6.283);
          ctx.fill();
        }
      });
    },

    shootingStars: function (opts, dt) {
      opts = opts || {};
      var seed = opts.seed || 808;
      var VW = S.VW, VH = S.VH;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      var r = rng(seed);
      for (var i = 0; i < 3; i++) {
        var phase = ((S.time * 0.4 + i * 2.3) % 4);
        if (phase < 1) {
          var sx = VW * (0.2 + r() * 0.6) + phase * 300, sy = VH * (0.1 + r() * 0.3) + phase * 200;
          var grad = ctx.createLinearGradient(sx, sy, sx - 120, sy - 80);
          grad.addColorStop(0, "rgba(255,255,255,0.9)");
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - 120, sy - 80);
          ctx.stroke();
        }
      }
      ctx.restore();
    },

    auroraRibbon: function (opts, dt) {
      opts = opts || {};
      var VW = S.VW, VH = S.VH;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < 3; i++) {
        var baseY = VH * (0.2 + i * 0.08);
        var g = ctx.createLinearGradient(0, baseY - 80, 0, baseY + 120);
        g.addColorStop(0, "rgba(50,255,160,0)");
        g.addColorStop(0.5, S.alpha(i % 2 === 0 ? "#4ade80" : "#22d3ee", 0.18));
        g.addColorStop(1, "rgba(34,211,238,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        for (var x = 0; x <= VW; x += 40) {
          var y = baseY + Math.sin(x * 0.005 + S.time * 0.5 + i) * 35 + Math.cos(x * 0.01 - S.time * 0.7) * 20;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(VW, VH);
        ctx.lineTo(0, VH);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    },

    heatShimmer: function (opts, dt) {
      opts = opts || {};
      var VW = S.VW, VH = S.VH;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      for (var y = VH * 0.6; y < VH; y += 30) {
        ctx.beginPath();
        for (var x = 0; x <= VW; x += 30) {
          var dy = Math.sin(x * 0.02 + S.time * 4 + y) * 4;
          if (x === 0) ctx.moveTo(x, y + dy);
          else ctx.lineTo(x, y + dy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  };
})();

FX.ripples = FX.waterRipples;
FX.shockwave = FX.shockwaveRing;
FX.dust = FX.dustMotes;
FX.lightShafts = FX.dustMotes;
FX.bubblesRising = FX.bubbles;
FX.shootingStar = FX.shootingStars;
FX.aurora = FX.auroraRibbon;
FX.shimmer = FX.heatShimmer;
