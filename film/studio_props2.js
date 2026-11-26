// True-scale prop library: window.PROPS2 following docs/SCALE.md
var PROPS2 = (function () {
  var ctx = ST.ctx, dk = ST.dk, lt = ST.lt, tint = ST.tint;

  function contactShadow(w, h) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h || w * 0.22, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
  }

  function ol(fill, w) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = w || 3;
    ctx.strokeStyle = dk(fill, 0.55);
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  var P = {
    bench: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(160, 18);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-130, -50, 16, 50);
      ctx.fillRect(114, -50, 16, 50);
      ctx.fillStyle = tint("#a06a38");
      ctx.fillRect(-150, -60, 300, 18);
      ctx.strokeStyle = "#5a3a18"; ctx.lineWidth = 2.5; ctx.strokeRect(-150, -60, 300, 18);
      ctx.fillRect(-140, -130, 280, 56);
      ctx.strokeRect(-140, -130, 280, 56);
      ctx.restore();
    },
    tree: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(140, 22);
      ctx.fillStyle = "#6a4a2a";
      ctx.fillRect(-30, -330, 60, 330);
      ctx.strokeStyle = "#3a2212"; ctx.lineWidth = 3; ctx.strokeRect(-30, -330, 60, 330);
      var g = ctx.createRadialGradient(0, -420, 20, 0, -400, 220);
      g.addColorStop(0, tint("#7fbe56"));
      g.addColorStop(0.7, tint("#4c9a38"));
      g.addColorStop(1, tint("#2d6420"));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, -400, 190, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = "#1b3a12"; ctx.lineWidth = 3.5; ctx.stroke();
      ctx.restore();
    },
    bush: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(90, 15);
      var g = ctx.createRadialGradient(0, -60, 10, 0, -50, 90);
      g.addColorStop(0, tint("#78bc48"));
      g.addColorStop(1, tint("#387828"));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, -50, 80, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = "#1e4214"; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    },
    house: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(290, 25);
      ctx.fillStyle = tint("#e8dfcb");
      ctx.fillRect(-260, -310, 520, 310);
      ctx.strokeStyle = "#6a5a40"; ctx.lineWidth = 3.5; ctx.strokeRect(-260, -310, 520, 310);
      ctx.fillStyle = tint("#b53a2c");
      ctx.beginPath();
      ctx.moveTo(-290, -310);
      ctx.lineTo(0, -520);
      ctx.lineTo(290, -310);
      ctx.closePath();
      ol(tint("#b53a2c"), 3.5);
      ctx.fillStyle = "#5a3a20";
      ctx.fillRect(-45, -190, 90, 190);
      ctx.strokeRect(-45, -190, 90, 190);
      [-150, 150].forEach(function(wx) {
        ctx.fillStyle = "#4fb0e8";
        ctx.fillRect(wx - 40, -250, 80, 90);
        ctx.strokeStyle = "#222"; ctx.lineWidth = 2.5; ctx.strokeRect(wx - 40, -250, 80, 90);
      });
      ctx.restore();
    },
    shop: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(330, 26);
      ctx.fillStyle = tint("#d8c8a8");
      ctx.fillRect(-310, -320, 620, 320);
      ctx.strokeStyle = "#5a4830"; ctx.lineWidth = 3.5; ctx.strokeRect(-310, -320, 620, 320);
      ctx.fillStyle = "#c9302c";
      ctx.beginPath();
      ctx.moveTo(-330, -320);
      ctx.lineTo(330, -320);
      ctx.lineTo(290, -250);
      ctx.lineTo(-290, -250);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7a1a16"; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = "#f4f4f4";
      for (var i = -240; i < 240; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, -320); ctx.lineTo(i + 35, -320); ctx.lineTo(i + 30, -250); ctx.lineTo(i - 5, -250); ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = "#27506f";
      ctx.fillRect(-220, -220, 180, 220);
      ctx.strokeRect(-220, -220, 180, 220);
      ctx.fillStyle = "#5a3a20";
      ctx.fillRect(60, -250, 140, 250);
      ctx.strokeRect(60, -250, 140, 250);
      ctx.restore();
    },
    fence: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(210, 16);
      ctx.fillStyle = tint("#c8a068");
      ctx.fillRect(-200, -90, 400, 16);
      ctx.fillRect(-200, -40, 400, 16);
      for (var px = -180; px <= 180; px += 45) {
        ctx.beginPath();
        ctx.moveTo(px - 12, 0);
        ctx.lineTo(px - 12, -120);
        ctx.lineTo(px, -145);
        ctx.lineTo(px + 12, -120);
        ctx.lineTo(px + 12, 0);
        ctx.closePath();
        ol(tint("#d8b278"), 2.5);
      }
      ctx.restore();
    },
    bin: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(50, 12);
      ctx.fillStyle = "#5a6470";
      ctx.beginPath();
      ctx.moveTo(-35, 0); ctx.lineTo(-25, -140); ctx.lineTo(25, -140); ctx.lineTo(35, 0); ctx.closePath();
      ol("#7d8794", 3);
      ctx.fillStyle = "#3a424a";
      ctx.fillRect(-42, -154, 84, 18);
      ctx.strokeRect(-42, -154, 84, 18);
      ctx.restore();
    },
    bus: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(580, 32);
      ctx.fillStyle = "#f2b53a";
      ST.rrect(-550, -320, 1100, 320, 24);
      ol("#f2b53a", 4);
      ctx.fillStyle = "#27506f";
      ctx.fillRect(-500, -270, 140, 180);
      ctx.strokeRect(-500, -270, 140, 180);
      for (var wx = -320; wx < 450; wx += 110) {
        ctx.fillRect(wx, -270, 85, 180);
        ctx.strokeRect(wx, -270, 85, 180);
      }
      [-340, 340].forEach(function(wx) {
        ctx.fillStyle = "#1c1c1c";
        ctx.beginPath(); ctx.arc(wx, 0, 62, 0, 6.283); ol("#111", 3);
        ctx.fillStyle = "#c9ccd0";
        ctx.beginPath(); ctx.arc(wx, 0, 28, 0, 6.283); ol("#8a97a6", 2);
      });
      ctx.restore();
    },
    truck: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(550, 30);
      ctx.fillStyle = "#2a6ad0";
      ST.rrect(-520, -280, 350, 280, 16);
      ol("#2a6ad0", 3.5);
      ctx.fillStyle = "#e8eef4";
      ST.rrect(-160, -320, 680, 320, 10);
      ol("#cbd5e1", 3.5);
      [-320, 280].forEach(function(wx) {
        ctx.fillStyle = "#1c1c1c";
        ctx.beginPath(); ctx.arc(wx, 0, 56, 0, 6.283); ol("#111", 3);
        ctx.fillStyle = "#c9ccd0";
        ctx.beginPath(); ctx.arc(wx, 0, 24, 0, 6.283); ol("#8a97a6", 2);
      });
      ctx.restore();
    },
    bicycle: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(140, 14);
      ctx.strokeStyle = "#222"; ctx.lineWidth = 6; ctx.lineCap = "round";
      [-90, 90].forEach(function(wx) {
        ctx.beginPath(); ctx.arc(wx, 0, 70, 0, 6.283); ctx.stroke();
        ctx.fillStyle = "#e8eef4"; ctx.fill();
        ctx.beginPath(); ctx.arc(wx, 0, 70, 0, 6.283); ol("#444", 2.5);
      });
      ctx.beginPath();
      ctx.moveTo(-90, 0); ctx.lineTo(-20, -90); ctx.lineTo(60, -90); ctx.lineTo(90, 0);
      ctx.moveTo(-20, -90); ctx.lineTo(20, -140); ctx.lineTo(-10, -140); ctx.stroke();
      ctx.restore();
    },
    billboard: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(180, 20);
      ctx.fillStyle = "#5a6470";
      ctx.fillRect(-15, -600, 30, 600);
      ctx.strokeRect(-15, -600, 30, 600);
      ctx.fillStyle = "#f6f2e8";
      ctx.fillRect(-250, -620, 500, 240);
      ctx.strokeStyle = "#222"; ctx.lineWidth = 4; ctx.strokeRect(-250, -620, 500, 240);
      ctx.fillStyle = "#b3262d";
      ctx.fillRect(-220, -590, 220, 70);
      ctx.fillStyle = "#2c6fb3";
      ctx.fillRect(20, -590, 200, 160);
      ctx.restore();
    },
    traffic: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(40, 12);
      ctx.fillStyle = "#3a424a";
      ctx.fillRect(-8, -760, 16, 760);
      ctx.strokeRect(-8, -760, 16, 760);
      ctx.fillStyle = "#1c1c1c";
      ST.rrect(-35, -620, 70, 180, 12);
      ol("#2a2f36", 3);
      ["#e03a3a", "#ffd23a", "#2a9a5a"].forEach(function(col, idx) {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(0, -580 + idx * 52, 18, 0, 6.283); ol(col, 2);
      });
      ctx.restore();
    },
    sofa: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(190, 18);
      ctx.fillStyle = tint("#3a6a9a");
      ST.rrect(-180, -90, 360, 90, 16);
      ol(tint("#3a6a9a"), 3);
      ctx.fillStyle = tint("#2d5580");
      ST.rrect(-180, -180, 360, 110, 16);
      ol(tint("#2d5580"), 3);
      [-170, 130].forEach(function(ax) {
        ctx.fillStyle = tint("#427ab0");
        ST.rrect(ax, -140, 40, 90, 12);
        ol(tint("#427ab0"), 3);
      });
      ctx.restore();
    },
    table: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(150, 16);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-120, -130, 16, 130);
      ctx.fillRect(104, -130, 16, 130);
      ctx.fillStyle = tint("#a06a38");
      ST.rrect(-140, -146, 280, 24, 6);
      ol(tint("#a06a38"), 3);
      ctx.restore();
    },
    chair: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(70, 12);
      ctx.fillStyle = "#7a4a22";
      ctx.fillRect(-50, -120, 12, 120);
      ctx.fillRect(38, -120, 12, 120);
      ctx.fillStyle = tint("#9a5a2c");
      ST.rrect(-60, -132, 120, 18, 4);
      ol(tint("#9a5a2c"), 2.5);
      ctx.fillRect(-50, -220, 100, 96);
      ol(tint("#9a5a2c"), 2.5);
      ctx.restore();
    },
    tv: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(60, 10);
      ctx.fillStyle = "#1c1c1c";
      ST.rrect(-50, -110, 100, 80, 8);
      ol("#2a2f36", 3);
      ctx.fillStyle = "#27506f";
      ctx.fillRect(-42, -100, 84, 60);
      ctx.fillStyle = "#333";
      ctx.fillRect(-20, -30, 40, 10);
      ctx.fillRect(-8, -20, 16, 20);
      ctx.restore();
    },
    fridge: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(100, 16);
      ctx.fillStyle = "#e8eef4";
      ST.rrect(-90, -360, 180, 360, 10);
      ol("#cfd6de", 3.5);
      ctx.strokeStyle = "#b9c0c8"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-90, -130); ctx.lineTo(90, -130); ctx.stroke();
      ctx.fillStyle = "#8a97a6";
      ctx.fillRect(60, -260, 12, 80);
      ctx.fillRect(60, -90, 12, 60);
      ctx.restore();
    },
    bed: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      contactShadow(190, 20);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-180, -130, 360, 130);
      ctx.strokeStyle = "#5a3a18"; ctx.lineWidth = 3; ctx.strokeRect(-180, -130, 360, 130);
      ctx.fillStyle = "#6a3a18";
      ctx.fillRect(-195, -200, 30, 200);
      ctx.strokeRect(-195, -200, 30, 200);
      ctx.fillStyle = "#f6f2e8";
      ctx.fillRect(-160, -118, 320, 106);
      ctx.fillStyle = "#3a6a9a";
      ctx.fillRect(-20, -118, 180, 106);
      ctx.fillStyle = "#fff";
      ST.rrect(-140, -106, 100, 50, 12);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  };

  P.trafficlight = P.traffic_light = P.traffic;
  P.television = P.tv;
  P.refrigerator = P.fridge;

  return {
    has: function (n) { return !!P[n]; },
    draw: function (name, x, y, s, t) {
      if (!P[name]) return;
      ctx.save();
      ctx.translate(x, y);
      if (s) ctx.scale(s, s);
      P[name](ctx, 0, 0, t || 0);
      ctx.restore();
    },
    bench: function (ctx, x, y, t) { P.bench(ctx, x, y, t); },
    tree: function (ctx, x, y, t) { P.tree(ctx, x, y, t); },
    bush: function (ctx, x, y, t) { P.bush(ctx, x, y, t); },
    house: function (ctx, x, y, t) { P.house(ctx, x, y, t); },
    shop: function (ctx, x, y, t) { P.shop(ctx, x, y, t); },
    fence: function (ctx, x, y, t) { P.fence(ctx, x, y, t); },
    bin: function (ctx, x, y, t) { P.bin(ctx, x, y, t); },
    bus: function (ctx, x, y, t) { P.bus(ctx, x, y, t); },
    truck: function (ctx, x, y, t) { P.truck(ctx, x, y, t); },
    bicycle: function (ctx, x, y, t) { P.bicycle(ctx, x, y, t); },
    billboard: function (ctx, x, y, t) { P.billboard(ctx, x, y, t); },
    "traffic light": function (ctx, x, y, t) { P.traffic(ctx, x, y, t); },
    traffic: function (ctx, x, y, t) { P.traffic(ctx, x, y, t); },
    sofa: function (ctx, x, y, t) { P.sofa(ctx, x, y, t); },
    table: function (ctx, x, y, t) { P.table(ctx, x, y, t); },
    chair: function (ctx, x, y, t) { P.chair(ctx, x, y, t); },
    tv: function (ctx, x, y, t) { P.tv(ctx, x, y, t); },
    fridge: function (ctx, x, y, t) { P.fridge(ctx, x, y, t); },
    bed: function (ctx, x, y, t) { P.bed(ctx, x, y, t); }
  };
})();
