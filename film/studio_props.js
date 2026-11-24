// Studio engine: flat-vector illustrated props with soft shading and dark outlines
var PR = (function () {
  var S = ST, ctx = S.ctx, dk = S.dk, lt = S.lt, mix = S.mix, tint = S.tint;

  var NOUNS = {
    crown: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      var g = tint("#f2c64a");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-36, 16); ctx.lineTo(-40, -16); ctx.lineTo(-20, -4); ctx.lineTo(-10, -32); ctx.lineTo(0, -10); ctx.lineTo(10, -32); ctx.lineTo(20, -4); ctx.lineTo(40, -16); ctx.lineTo(36, 16); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dk(g, 0.4); ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = "#d9232e"; ctx.beginPath(); ctx.arc(0, -2, 5, 0, 6.283); ctx.fill();
      ctx.restore();
    },
    spear: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.5);
      ctx.fillStyle = tint("#8a5a2b"); ctx.fillRect(-4, -60, 8, 120);
      ctx.fillStyle = tint("#dfe4ea"); ctx.beginPath(); ctx.moveTo(0, -84); ctx.lineTo(14, -60); ctx.lineTo(0, -44); ctx.lineTo(-14, -60); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dk("#7d8794", 0.3); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    },
    shield: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      var sh = tint("#b3262d");
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, 36, 0, 6.283); ctx.fill();
      ctx.strokeStyle = tint("#e2b23d"); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 33, 0, 6.283); ctx.stroke();
      ctx.fillStyle = tint("#e2b23d"); ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.283); ctx.fill();
      ctx.restore();
    },
    sword: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.78);
      ctx.fillStyle = tint("#8a5a2b"); ctx.fillRect(-4, -12, 8, 24);
      ctx.fillStyle = tint("#e2b23d"); ctx.fillRect(-20, -4, 40, 6);
      ctx.fillStyle = tint("#f3f6fa"); ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(6, -60); ctx.lineTo(0, -72); ctx.lineTo(-6, -60); ctx.closePath(); ctx.fill();
      ctx.restore();
    },
    scroll: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = "#efe0b8"; S.rrect(-30, -18, 60, 36, 6); ctx.fill();
      ctx.strokeStyle = "#a88d55"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = "#d4b875"; ctx.fillRect(-34, -22, 8, 44); ctx.fillRect(26, -22, 8, 44);
      ctx.restore();
    },
    "gold coins": function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      [[0, 6, 24], [-14, -8, 20], [14, -6, 20], [4, -22, 18]].forEach(function(c) {
        ctx.fillStyle = tint("#e8c14a"); ctx.beginPath(); ctx.ellipse(c[0], c[1], c[2], c[2]*0.6, 0, 0, 6.283); ctx.fill();
        ctx.strokeStyle = dk("#e8c14a", 0.35); ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = lt("#e8c14a", 0.3); ctx.beginPath(); ctx.ellipse(c[0]-3, c[1]-2, c[2]*0.5, c[2]*0.3, 0, 0, 6.283); ctx.fill();
      });
      ctx.restore();
    },
    ship: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#7a4a28"); ctx.beginPath(); ctx.moveTo(-40, 10); ctx.quadraticCurveTo(0, 30, 44, 10); ctx.lineTo(34, -4); ctx.lineTo(-30, -4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = tint("#f6ead0"); ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(24, -34); ctx.lineTo(0, -50); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#4a2a10"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -54); ctx.stroke();
      ctx.restore();
    },
    torch: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#7a5230"); ctx.fillRect(-6, -10, 12, 50);
      ctx.fillStyle = tint("#c79a3a"); ctx.fillRect(-10, -22, 20, 16);
      var fl = Math.sin(t * 12) * 4;
      ctx.fillStyle = "#ff9a2a"; ctx.beginPath(); ctx.moveTo(-12, -22); ctx.quadraticCurveTo(-8 + fl, -46, fl, -58); ctx.quadraticCurveTo(12 + fl, -42, 12, -22); ctx.fill();
      ctx.fillStyle = "#ffe27a"; ctx.beginPath(); ctx.moveTo(-6, -22); ctx.quadraticCurveTo(fl * 0.5, -40, 6, -22); ctx.fill();
      ctx.restore();
    },
    bow: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.strokeStyle = tint("#8a5a2b"); ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(0, 0, 36, -2.1, 2.1); ctx.stroke();
      ctx.strokeStyle = "#e0e0e0"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(Math.cos(-2.1)*36, Math.sin(-2.1)*36); ctx.lineTo(Math.cos(2.1)*36, Math.sin(2.1)*36); ctx.stroke();
      ctx.restore();
    },
    arrow: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.5);
      ctx.fillStyle = tint("#8a5a2b"); ctx.fillRect(-36, -2, 72, 4);
      ctx.fillStyle = tint("#dfe4ea"); ctx.beginPath(); ctx.moveTo(36, 0); ctx.lineTo(24, -6); ctx.lineTo(24, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = tint("#b5242c"); ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(-46, -6); ctx.lineTo(-42, 0); ctx.lineTo(-46, 6); ctx.closePath(); ctx.fill();
      ctx.restore();
    },
    helmet: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      var hm = tint("#c8963c");
      ctx.fillStyle = hm; ctx.beginPath(); ctx.arc(0, 4, 32, Math.PI, 0); ctx.fill();
      ctx.fillStyle = tint("#c0282e"); ctx.fillRect(-6, -44, 12, 34);
      ctx.strokeStyle = dk(hm, 0.4); ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();
    },
    flag: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#6a4a2a"); ctx.fillRect(-20, -50, 6, 100);
      ctx.fillStyle = tint("#b3262d");
      ctx.beginPath(); ctx.moveTo(-14, -46);
      ctx.quadraticCurveTo(16, -52 + Math.sin(t*5)*6, 42, -36 + Math.sin(t*5)*4);
      ctx.lineTo(38, -16);
      ctx.quadraticCurveTo(12, -26, -14, -18);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    },
    throne: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#8a5a2b"); S.rrect(-34, -46, 68, 92, 10); ctx.fill();
      ctx.fillStyle = tint("#b5242c"); S.rrect(-26, -38, 52, 76, 6); ctx.fill();
      ctx.fillStyle = tint("#e2b23d"); ctx.fillRect(-30, 20, 60, 14); ctx.fillRect(-34, 34, 68, 12);
      ctx.restore();
    },
    chest: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#7a4a28"); S.rrect(-30, -18, 60, 38, 6); ctx.fill();
      ctx.fillStyle = tint("#8a5a2b"); ctx.beginPath(); ctx.arc(0, -18, 30, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = tint("#e2b23d"); ctx.lineWidth = 3;
      ctx.strokeRect(-30, -18, 60, 38);
      ctx.fillStyle = tint("#e2b23d"); ctx.beginPath(); ctx.arc(0, 2, 7, 0, 6.283); ctx.fill();
      ctx.restore();
    },
    sun: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(t * 0.2);
      ctx.fillStyle = tint("#ffe0a0");
      for (var i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate(i * Math.PI / 4);
        ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(6, -42); ctx.lineTo(0, -50); ctx.lineTo(-6, -42); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, 6.283); ctx.fill();
      ctx.restore();
    },
    moon: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#eaf1ff");
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, 6.283); ctx.fill();
      ctx.fillStyle = tint("#142149");
      ctx.beginPath(); ctx.arc(10, -6, 26, 0, 6.283); ctx.fill();
      ctx.restore();
    },
    star: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(t * 0.5);
      ctx.fillStyle = tint("#ffe0a0");
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a = i * Math.PI * 2 / 5 - Math.PI / 2;
        var ai = a + Math.PI / 5;
        if (i === 0) ctx.moveTo(Math.cos(a)*30, Math.sin(a)*30);
        else ctx.lineTo(Math.cos(a)*30, Math.sin(a)*30);
        ctx.lineTo(Math.cos(ai)*12, Math.sin(ai)*12);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    },
    rocket: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.3);
      ctx.fillStyle = tint("#f3f6fa"); ctx.beginPath(); ctx.moveTo(0, -44); ctx.quadraticCurveTo(18, 0, 14, 30); ctx.lineTo(-14, 30); ctx.quadraticCurveTo(-18, 0, 0, -44); ctx.fill();
      ctx.fillStyle = tint("#b5242c"); ctx.beginPath(); ctx.moveTo(0, -44); ctx.quadraticCurveTo(12, -20, 0, -12); ctx.quadraticCurveTo(-12, -20, 0, -44); ctx.fill();
      ctx.fillStyle = tint("#2b78d8"); ctx.beginPath(); ctx.arc(0, -4, 7, 0, 6.283); ctx.fill();
      ctx.fillStyle = tint("#b5242c"); ctx.beginPath(); ctx.moveTo(14, 16); ctx.lineTo(26, 34); ctx.lineTo(12, 28); ctx.closePath(); ctx.moveTo(-14, 16); ctx.lineTo(-26, 34); ctx.lineTo(-12, 28); ctx.closePath(); ctx.fill();
      ctx.restore();
    },
    planet: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#46b4e6"); ctx.beginPath(); ctx.arc(0, 0, 26, 0, 6.283); ctx.fill();
      ctx.strokeStyle = tint("#e2b23d"); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 42, 14, 0.3, 0, 6.283); ctx.stroke();
      ctx.restore();
    },
    satellite: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#c8d6e5"); ctx.beginPath(); ctx.arc(0, 0, 16, 0, 6.283); ctx.fill();
      ctx.fillStyle = tint("#2b78d8"); ctx.fillRect(-38, -10, 22, 20); ctx.fillRect(16, -10, 22, 20);
      ctx.strokeStyle = tint("#576574"); ctx.lineWidth = 2; ctx.strokeRect(-38, -10, 22, 20); ctx.strokeRect(16, -10, 22, 20);
      ctx.restore();
    },
    fish: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t*3)*0.1);
      ctx.fillStyle = tint("#f0932b"); ctx.beginPath(); ctx.ellipse(0, 0, 24, 14, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-38, -14); ctx.lineTo(-30, 0); ctx.lineTo(-38, 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#1e272e"; ctx.beginPath(); ctx.arc(12, -4, 3, 0, 6.283); ctx.fill();
      ctx.restore();
    },
    whale: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#34495e"); ctx.beginPath(); ctx.ellipse(0, 0, 44, 24, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.moveTo(38, -4); ctx.lineTo(58, -20); ctx.lineTo(48, 0); ctx.lineTo(58, 16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = tint("#f1f2f6"); ctx.beginPath(); ctx.ellipse(0, 8, 36, 12, 0, 0, 3.14); ctx.fill();
      ctx.restore();
    },
    anchor: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.strokeStyle = tint("#576574"); ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, 28); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -32, 10, 0, 6.283); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 16, 22, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.restore();
    },
    key: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.5);
      ctx.strokeStyle = tint("#e8c14a"); ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(-16, 0, 12, 0, 6.283); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(32, 0); ctx.moveTo(20, 0); ctx.lineTo(20, -8); ctx.moveTo(12, 0); ctx.lineTo(12, -6); ctx.stroke();
      ctx.restore();
    },
    book: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#b3262d"); S.rrect(-32, -22, 64, 44, 4); ctx.fill();
      ctx.fillStyle = "#efe0b8"; ctx.fillRect(-28, -18, 56, 36);
      ctx.fillStyle = tint("#8a5a2b"); ctx.fillRect(-4, -22, 8, 44);
      ctx.restore();
    },
    map: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = "#efe0b8"; ctx.fillRect(-36, -24, 72, 48);
      ctx.strokeStyle = tint("#a88d55"); ctx.lineWidth = 2; ctx.strokeRect(-36, -24, 72, 48);
      ctx.fillStyle = tint("#8a5a2b"); ctx.fillRect(-42, -28, 8, 56); ctx.fillRect(34, -28, 8, 56);
      ctx.restore();
    },
    wheel: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(t * 0.3);
      ctx.strokeStyle = tint("#8a5a2b"); ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0, 0, 32, 0, 6.283); ctx.stroke();
      ctx.lineWidth = 3;
      for (var i = 0; i < 4; i++) {
        ctx.save(); ctx.rotate(i * Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(-32, 0); ctx.lineTo(32, 0); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = tint("#5a3a1a"); ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.283); ctx.fill();
      ctx.restore();
    },
    castle: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#c8d6e5"); ctx.fillRect(-40, -10, 80, 50);
      ctx.fillStyle = tint("#a4b0be"); ctx.fillRect(-44, -36, 24, 30); ctx.fillRect(20, -36, 24, 30);
      ctx.fillStyle = tint("#b3262d"); ctx.fillRect(-14, 6, 28, 34);
      ctx.restore();
    },
    tent: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#f7f2e8");
      ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(-44, 28); ctx.lineTo(44, 28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = tint("#b5242c");
      ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(-14, 28); ctx.lineTo(14, 28); ctx.closePath(); ctx.fill();
      ctx.restore();
    },
    horse: function(x, y, s, t) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = tint("#8a5a2b");
      ctx.beginPath(); ctx.ellipse(-4, 0, 32, 18, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.moveTo(22, -10); ctx.quadraticCurveTo(34, -32, 28, -44); ctx.lineTo(18, -26); ctx.closePath(); ctx.fill();
      ctx.fillRect(-22, 10, 6, 26); ctx.fillRect(16, 10, 6, 26);
      ctx.restore();
    }
  };

  function has(name) {
    return !!NOUNS[name];
  }

  function draw(name, x, y, s, t) {
    var fn = NOUNS[name];
    if (fn) {
      fn(x, y, s || 1, t || 0);
    }
  }

  return { draw: draw, has: has };
})();
