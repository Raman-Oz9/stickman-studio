// Noun icon library: PR.draw(name, x, y, s, t), PR.has(name)
var PR = (function () {
  var ctx = ST.ctx, dk = ST.dk, lt = ST.lt;
  function ol(fill, w) { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = w || 3; ctx.strokeStyle = dk(fill, 0.55); ctx.lineJoin = "round"; ctx.stroke(); }
  function grad(c, y0, y1) { var g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, lt(c, 0.25)); g.addColorStop(1, dk(c, 0.2)); return g; }
  function shadow(rx, ry) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(0, ry + 6, rx, ry, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
  }

  var L = {
    // --- Furniture ---
    desk: function () {
      shadow(140, 16);
      ctx.fillStyle = "#6b4a2a";
      ctx.fillRect(-120, -20, 18, 50);
      ctx.fillRect(102, -20, 18, 50);
      ctx.beginPath();
      ctx.rect(-140, -50, 280, 30);
      ol(grad("#a06a34", -50, -20));
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-60, -42, 60, 16);
      ctx.fillStyle = "#d8a73a";
      ctx.beginPath();
      ctx.arc(-30, -34, 4, 0, 6.283);
      ctx.fill();
    },
    bed: function () {
      shadow(180, 20);
      ctx.beginPath();
      ctx.rect(-180, -70, 360, 90);
      ol(grad("#8a5a2c", -70, 20));
      ctx.fillStyle = "#f6f0e4";
      ctx.fillRect(-170, -85, 340, 80);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#c9c0b0";
      ctx.strokeRect(-170, -85, 340, 80);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(-155, -80, 70, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#2c6fb3";
      ctx.fillRect(-70, -85, 230, 80);
      ctx.fillStyle = dk("#2c6fb3", 0.3);
      ctx.fillRect(40, -85, 120, 80);
    },
    chair: function () {
      shadow(55, 12);
      ctx.fillStyle = "#6b4a2a";
      ctx.fillRect(-35, -20, 12, 90);
      ctx.fillRect(23, -20, 12, 90);
      ctx.fillRect(-35, 30, 70, 14);
      ctx.beginPath();
      ctx.rect(-45, -30, 90, 16);
      ol(grad("#a06a34", -30, -14));
      ctx.beginPath();
      ctx.rect(-40, -110, 80, 82);
      ol(grad("#a06a34", -110, -30));
    },
    table: function () {
      shadow(150, 16);
      ctx.fillStyle = "#6b4a2a";
      ctx.fillRect(-130, -10, 16, 60);
      ctx.fillRect(114, -10, 16, 60);
      ctx.beginPath();
      ctx.rect(-150, -35, 300, 28);
      ol(grad("#a06a34", -35, -7));
    },
    chest: function () {
      shadow(65, 14);
      ctx.beginPath();
      ctx.rect(-60, -20, 120, 60);
      ol(grad("#8a5a2c", -20, 40));
      ctx.beginPath();
      ctx.moveTo(-60, -20);
      ctx.quadraticCurveTo(0, -70, 60, -20);
      ol(grad("#a06a34", -60, -20));
      ctx.fillStyle = "#e8b53a";
      ctx.fillRect(-10, -28, 20, 32);
      ctx.fillRect(-60, -10, 120, 8);
    },
    throne: function () {
      shadow(75, 16);
      ctx.beginPath();
      ctx.rect(-55, -90, 110, 110);
      ol(grad("#8c1c22", -90, 20));
      ctx.beginPath();
      ctx.rect(-65, 20, 130, 45);
      ol(grad("#d8a73a", 20, 65));
      ctx.fillStyle = "#d8a73a";
      ctx.fillRect(-65, 65, 22, 35);
      ctx.fillRect(43, 65, 22, 35);
    },

    // --- Vehicles ---
    car: function () {
      shadow(425, 22);
      [-260, 260].forEach(function (wx) {
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(wx, 45, 62, 0, 6.283);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#111";
        ctx.stroke();
        ctx.fillStyle = "#cfd8e2";
        ctx.beginPath();
        ctx.arc(wx, 45, 24, 0, 6.283);
        ctx.fill();
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(-390, 30);
      ctx.lineTo(390, 30);
      ctx.lineTo(350, -45);
      ctx.lineTo(210, -115);
      ctx.lineTo(-190, -115);
      ctx.lineTo(-340, -45);
      ctx.closePath();
      ol(grad("#2a7fd0", -115, 30));
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.moveTo(0, -115);
      ctx.lineTo(350, -45);
      ctx.lineTo(390, 30);
      ctx.lineTo(0, 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(-175, -105);
      ctx.lineTo(185, -105);
      ctx.lineTo(155, -45);
      ctx.lineTo(-145, -45);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#8a99ad";
      ctx.stroke();
      ctx.fillStyle = "#ffd84a";
      ctx.beginPath();
      ctx.arc(376, -10, 12, 0, 6.283);
      ctx.fill();
      ctx.stroke();
    },
    truck: function () {
      shadow(550, 25);
      [-360, -220, 320].forEach(function (wx) {
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(wx, 60, 68, 0, 6.283);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#111";
        ctx.stroke();
      });
      ctx.fillStyle = "#b3262d";
      ctx.fillRect(-520, -140, 420, 180);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#6b1518";
      ctx.strokeRect(-520, -140, 420, 180);
      ctx.fillStyle = "#d8dce2";
      ctx.fillRect(-100, -220, 620, 260);
      ctx.strokeRect(-100, -220, 620, 260);
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.rect(-480, -120, 120, 80);
      ctx.fill();
      ctx.stroke();
    },
    bus: function () {
      shadow(650, 28);
      [-420, 420].forEach(function (wx) {
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(wx, 80, 72, 0, 6.283);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#111";
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.roundRect(-650, -210, 1300, 270, 24);
      ol(grad("#f2c230", -210, 60));
      ctx.fillStyle = "#1e293b";
      for (var i = -5; i <= 5; i++) {
        ctx.fillRect(i * 110 - 40, -180, 80, 110);
      }
    },
    plane: function () {
      shadow(400, 30);
      ctx.fillStyle = "#cfd8e2";
      ctx.beginPath();
      ctx.moveTo(-60, -40);
      ctx.lineTo(80, -180);
      ctx.lineTo(160, -140);
      ctx.lineTo(40, -10);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#5a6470";
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 550, 110, 0, 0, 6.283);
      ol(grad("#eef3f8", -110, 110));
      ctx.beginPath();
      ctx.moveTo(-480, -40);
      ctx.lineTo(-580, -190);
      ctx.lineTo(-440, -80);
      ctx.closePath();
      ol("#b3262d");
      ctx.fillStyle = "#2b3a4a";
      ctx.beginPath();
      ctx.arc(380, -20, 28, 0, 6.283);
      ctx.fill();
      ctx.stroke();
    },
    ship: function () {
      shadow(550, 30);
      ctx.beginPath();
      ctx.moveTo(-580, 20);
      ctx.lineTo(580, 20);
      ctx.lineTo(420, 120);
      ctx.lineTo(-420, 120);
      ctx.closePath();
      ol(grad("#7a4a22", 20, 120));
      ctx.fillStyle = "#6b4a2a";
      ctx.fillRect(-15, -280, 24, 300);
      ctx.fillRect(240, -240, 20, 260);
      ctx.beginPath();
      ctx.moveTo(10, -260);
      ctx.quadraticCurveTo(240, -180, 10, -20);
      ctx.closePath();
      ol("#f6f0e4");
      ctx.beginPath();
      ctx.moveTo(-25, -240);
      ctx.quadraticCurveTo(-220, -160, -25, -30);
      ctx.closePath();
      ol("#e8e0d0");
    },
    fleet: null, boat: null, airplane: null,

    // --- Tools ---
    hammer: function () {
      shadow(30, 8);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-6, -70, 14, 150);
      ctx.fillStyle = "#cfd6de";
      ctx.beginPath();
      ctx.rect(-45, -95, 90, 34);
      ol("#cfd6de");
    },
    shovel: function () {
      shadow(30, 8);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-6, -110, 12, 220);
      ctx.beginPath();
      ctx.moveTo(-35, -120);
      ctx.lineTo(35, -120);
      ctx.lineTo(24, -60);
      ctx.lineTo(0, -40);
      ctx.lineTo(-24, -60);
      ctx.closePath();
      ol("#cfd6de");
    },
    pickaxe: function () {
      shadow(30, 8);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-6, -60, 12, 180);
      ctx.beginPath();
      ctx.moveTo(-90, -90);
      ctx.quadraticCurveTo(0, -110, 90, -90);
      ctx.lineTo(60, -70);
      ctx.quadraticCurveTo(0, -85, -60, -70);
      ctx.closePath();
      ol("#cfd6de");
    },
    torch: function () {
      shadow(30, 8);
      ctx.fillStyle = "#7a4a22";
      ctx.fillRect(-8, -20, 16, 90);
      ctx.beginPath();
      ctx.moveTo(0, -85);
      ctx.quadraticCurveTo(40, -40, 0, -20);
      ctx.quadraticCurveTo(-40, -40, 0, -85);
      ol("#ff8a1e");
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.quadraticCurveTo(18, -35, 0, -25);
      ctx.quadraticCurveTo(-18, -35, 0, -60);
      ol("#ffd84a", 2);
    },
    anchor: function () {
      shadow(40, 10);
      ctx.strokeStyle = "#3a4452";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(0, 60);
      ctx.moveTo(-24, -30);
      ctx.lineTo(24, -30);
      ctx.moveTo(-55, 30);
      ctx.quadraticCurveTo(-45, 75, 0, 68);
      ctx.quadraticCurveTo(45, 75, 55, 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -70, 12, 0, 6.283);
      ctx.stroke();
    },
    key: function () {
      shadow(25, 8);
      ctx.beginPath();
      ctx.arc(-30, 0, 24, 0, 6.283);
      ol("#e8b53a");
      ctx.fillStyle = "#fff4cc";
      ctx.beginPath();
      ctx.arc(-30, 0, 9, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "#e8b53a";
      ctx.fillRect(-10, -6, 75, 12);
      ctx.fillRect(40, 6, 10, 18);
      ctx.fillRect(56, 6, 10, 12);
    },

    // --- Weapons ---
    sword: function () {
      shadow(30, 8);
      ctx.save();
      ctx.rotate(0.6);
      ctx.beginPath();
      ctx.moveTo(-8, -90);
      ctx.lineTo(8, -90);
      ctx.lineTo(8, 30);
      ctx.lineTo(-8, 30);
      ctx.closePath();
      ol("#d7dee6");
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-10, 50, 20, 34);
      ctx.beginPath();
      ctx.rect(-35, 30, 70, 12);
      ol("#d8a73a", 3);
      ctx.restore();
    },
    spear: function () {
      shadow(30, 8);
      ctx.save();
      ctx.rotate(-0.7);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-5, -80, 10, 180);
      ctx.beginPath();
      ctx.moveTo(0, -125);
      ctx.lineTo(20, -75);
      ctx.lineTo(0, -85);
      ctx.lineTo(-20, -75);
      ctx.closePath();
      ol("#cfd6de");
      ctx.restore();
    },
    bow: function () {
      shadow(30, 8);
      ctx.strokeStyle = "#8a5a2c";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-15, -80);
      ctx.quadraticCurveTo(60, 0, -15, 80);
      ctx.stroke();
      ctx.strokeStyle = "#eee";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, -80);
      ctx.lineTo(-15, 80);
      ctx.stroke();
    },
    arrow: function () {
      shadow(30, 8);
      ctx.save();
      ctx.rotate(-0.5);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-75, -4, 150, 8);
      ctx.beginPath();
      ctx.moveTo(65, -12);
      ctx.lineTo(95, 0);
      ctx.lineTo(65, 12);
      ctx.closePath();
      ol("#cfd6de", 2);
      ctx.restore();
    },
    shield: function () {
      shadow(45, 10);
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, 6.283);
      ol("#b3262d");
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, 6.283);
      ol("#d8a73a", 3);
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, 6.283);
      ol("#f4d27a", 2);
    },
    helmet: function () {
      shadow(40, 10);
      ctx.beginPath();
      ctx.arc(0, 10, 50, Math.PI, 0);
      ctx.lineTo(50, 40);
      ctx.lineTo(-50, 40);
      ctx.closePath();
      ol("#c8963c");
      ctx.beginPath();
      ctx.moveTo(-8, -40);
      ctx.quadraticCurveTo(0, -75, 24, -55);
      ctx.lineTo(8, -35);
      ctx.closePath();
      ol("#c0282e", 2);
    },

    // --- Instruments ---
    guitar: function () {
      shadow(60, 12);
      ctx.save();
      ctx.rotate(0.4);
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(-8, -120, 16, 110);
      ctx.beginPath();
      ctx.ellipse(0, 30, 50, 65, 0, 0, 6.283);
      ol("#d8a73a");
      ctx.fillStyle = "#fff4cc";
      ctx.beginPath();
      ctx.arc(0, 25, 14, 0, 6.283);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    },
    flute: function () {
      shadow(40, 8);
      ctx.save();
      ctx.rotate(-0.8);
      ctx.fillStyle = "#cfd6de";
      ctx.fillRect(-80, -6, 160, 12);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#5a6470";
      ctx.strokeRect(-80, -6, 160, 12);
      for (var i = -40; i <= 40; i += 20) {
        ctx.beginPath();
        ctx.arc(i, 0, 2, 0, 6.283);
        ctx.fillStyle = "#111";
        ctx.fill();
      }
      ctx.restore();
    },
    drum: function () {
      shadow(55, 12);
      ctx.beginPath();
      ctx.ellipse(0, -35, 55, 22, 0, 0, 6.283);
      ol("#e2e8f0");
      ctx.beginPath();
      ctx.rect(-55, -35, 110, 70);
      ol("#b3262d");
      ctx.beginPath();
      ctx.ellipse(0, 35, 55, 22, 0, 0, 6.283);
      ol("#cfd6de");
    },
    violin: function () {
      shadow(50, 10);
      ctx.save();
      ctx.rotate(0.3);
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(-6, -90, 12, 80);
      ctx.beginPath();
      ctx.ellipse(0, 25, 38, 55, 0, 0, 6.283);
      ol("#a06a34");
      ctx.restore();
    },

    // --- Food ---
    apple: function () {
      shadow(20, 6);
      ctx.fillStyle = "#8a5a2c";
      ctx.fillRect(-2, -32, 4, 16);
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, 6.283);
      ol("#b3262d");
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(-8, -8, 7, 0, 6.283);
      ctx.fill();
    },
    bread: function () {
      shadow(45, 10);
      ctx.beginPath();
      ctx.ellipse(0, 0, 50, 28, 0, 0, 6.283);
      ol("#c98a3a");
      ctx.strokeStyle = "#8a5a2c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-30, -10);
      ctx.lineTo(30, -10);
      ctx.stroke();
    },
    cake: function () {
      shadow(45, 10);
      ctx.beginPath();
      ctx.rect(-45, -20, 90, 50);
      ol("#f4d27a");
      ctx.fillStyle = "#b3262d";
      ctx.fillRect(-45, -20, 90, 16);
      ctx.fillStyle = "#fff";
      for (var i = -35; i <= 35; i += 20) {
        ctx.beginPath();
        ctx.arc(i, -4, 8, 0, 6.283);
        ctx.fill();
      }
    },

    // --- Money ---
    gold: function () {
      shadow(35, 10);
      [[-25, 15], [15, 18], [-6, -4], [28, 0], [0, -26]].forEach(function (p) {
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], 26, 13, 0, 0, 6.283);
        ol("#f2c230", 3);
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], 15, 7, 0, 0, 6.283);
        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    },
    money: function () {
      shadow(45, 10);
      ctx.beginPath();
      ctx.rect(-45, -28, 90, 56);
      ol("#2f9a52");
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, 6.283);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#1b5e20";
      ctx.stroke();
    },

    // --- Books ---
    book: function () {
      shadow(45, 10);
      ctx.beginPath();
      ctx.rect(-45, -55, 90, 110);
      ol("#2c6fb3");
      ctx.fillStyle = "#f6efe0";
      ctx.fillRect(-38, -48, 76, 10);
      ctx.fillStyle = "#e8b53a";
      ctx.fillRect(-24, -16, 48, 6);
      ctx.fillRect(-24, 4, 48, 6);
    },
    scroll: function () {
      shadow(45, 10);
      ctx.beginPath();
      ctx.rect(-50, -36, 100, 72);
      ol("#f3e2b3");
      ctx.strokeStyle = "rgba(90,60,30,.5)";
      ctx.lineWidth = 3;
      for (var i = -20; i <= 20; i += 14) {
        ctx.beginPath();
        ctx.moveTo(-35, i);
        ctx.lineTo(35, i);
        ctx.stroke();
      }
      [-50, 50].forEach(function (x) {
        ctx.beginPath();
        ctx.ellipse(x, 0, 9, 42, 0, 0, 6.283);
        ol("#c9a063", 3);
      });
    },
    map: function () {
      shadow(55, 10);
      ctx.beginPath();
      ctx.rect(-60, -40, 120, 80);
      ol("#f0deaa");
      ctx.strokeStyle = "#b3262d";
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 7]);
      ctx.beginPath();
      ctx.moveTo(-45, 20);
      ctx.quadraticCurveTo(-15, -35, 25, -5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#b3262d";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(38, -26);
      ctx.lineTo(50, -14);
      ctx.stroke();
    },

    // --- Phones ---
    phone: function () {
      shadow(25, 8);
      ctx.beginPath();
      ctx.roundRect(-25, -50, 50, 100, 8);
      ol("#1e293b");
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(-20, -40, 40, 75);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 39, 4, 0, 6.283);
      ctx.fill();
    },

    // --- Computers ---
    computer: function () {
      shadow(75, 12);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(-20, 35, 40, 15);
      ctx.beginPath();
      ctx.ellipse(0, 50, 70, 10, 0, 0, 6.283);
      ol("#cbd5e1", 2);
      ctx.beginPath();
      ctx.roundRect(-80, -60, 160, 100, 8);
      ol("#334155");
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(-72, -52, 144, 84);
    },
    laptop: function () {
      shadow(75, 12);
      ctx.beginPath();
      ctx.roundRect(-75, 20, 150, 14, 4);
      ol("#94a3b8");
      ctx.save();
      ctx.translate(0, 20);
      ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.roundRect(-70, -85, 140, 90, 6);
      ol("#334155");
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(-64, -78, 128, 76);
      ctx.restore();
    },

    // --- Other Classic Props ---
    crown: function () {
      shadow(50, 10);
      var c = "#e8b53a";
      ctx.beginPath();
      ctx.moveTo(-50, 30);
      ctx.lineTo(-58, -30);
      ctx.lineTo(-28, -6);
      ctx.lineTo(0, -44);
      ctx.lineTo(28, -6);
      ctx.lineTo(58, -30);
      ctx.lineTo(50, 30);
      ctx.closePath();
      ol(grad(c, -44, 30));
      [[-30, "#d33"], [0, "#2a7fd0"], [30, "#2a9a5a"]].forEach(function (g) {
        ctx.beginPath();
        ctx.arc(g[0], 12, 8, 0, 6.283);
        ol(g[1], 2);
      });
      [-58, 0, 58].forEach(function (x, i) {
        ctx.beginPath();
        ctx.arc(x, i === 1 ? -46 : -32, 7, 0, 6.283);
        ol("#fff1b0", 2);
      });
    },
    rocket: function () {
      shadow(40, 10);
      ctx.save();
      ctx.rotate(0.6);
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.quadraticCurveTo(30, -30, 24, 34);
      ctx.lineTo(-24, 34);
      ctx.quadraticCurveTo(-30, -30, 0, -70);
      ol("#eef1f5");
      ctx.beginPath();
      ctx.arc(0, -16, 11, 0, 6.283);
      ol("#4fb0e8", 3);
      ctx.beginPath();
      ctx.moveTo(24, 10);
      ctx.lineTo(48, 44);
      ctx.lineTo(24, 34);
      ol("#e03a3a");
      ctx.beginPath();
      ctx.moveTo(-24, 10);
      ctx.lineTo(-48, 44);
      ctx.lineTo(-24, 34);
      ol("#e03a3a");
      ctx.beginPath();
      ctx.moveTo(-14, 38);
      ctx.quadraticCurveTo(0, 90, 14, 38);
      ol("#ff9a2a", 2);
      ctx.restore();
    },
    planet: function () {
      shadow(45, 10);
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, 6.283);
      ol("#c8693a");
      ctx.beginPath();
      ctx.ellipse(0, 0, 76, 16, -0.4, 0, 6.283);
      ctx.strokeStyle = "#e8c98a";
      ctx.lineWidth = 6;
      ctx.stroke();
    },
    star: function () {
      shadow(40, 10);
      ctx.beginPath();
      for (var i = 0; i < 10; i++) {
        var r = i % 2 ? 22 : 54, a = -1.5708 + i * 0.6283;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ol("#ffd84a");
    },
    moon: function () {
      shadow(40, 10);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0.9, 5.4);
      ctx.arc(18, -6, 38, 5.0, 1.2, true);
      ctx.closePath();
      ol("#f2eccb");
    },
    sun: function () {
      shadow(40, 10);
      ctx.strokeStyle = "#ff9a2a";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      for (var i = 0; i < 12; i++) {
        var a = i * 0.5236;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 52, Math.sin(a) * 52);
        ctx.lineTo(Math.cos(a) * 70, Math.sin(a) * 70);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, 6.283);
      ol("#ffd23a");
    },
    whale: function () {
      shadow(60, 12);
      ctx.beginPath();
      ctx.moveTo(-66, 4);
      ctx.quadraticCurveTo(-30, -50, 30, -22);
      ctx.quadraticCurveTo(54, -12, 68, -42);
      ctx.quadraticCurveTo(70, -8, 74, 6);
      ctx.quadraticCurveTo(54, 4, 30, 24);
      ctx.quadraticCurveTo(-30, 48, -66, 4);
      ol("#2f6f9a");
      ctx.beginPath();
      ctx.arc(-44, -2, 4, 0, 6.283);
      ctx.fillStyle = "#fff";
      ctx.fill();
    },
    fish: function () {
      shadow(30, 8);
      ctx.beginPath();
      ctx.ellipse(0, 0, 44, 24, 0, 0, 6.283);
      ol("#f2a03a");
      ctx.beginPath();
      ctx.moveTo(38, 0);
      ctx.lineTo(66, -22);
      ctx.lineTo(66, 22);
      ctx.closePath();
      ol("#e8782c");
      ctx.beginPath();
      ctx.arc(-22, -5, 5, 0, 6.283);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-22, -5, 2, 0, 6.283);
      ctx.fillStyle = "#111";
      ctx.fill();
    },
    castle: function () {
      shadow(55, 12);
      ctx.beginPath();
      ctx.rect(-50, -10, 100, 50);
      ol("#b8b2a6");
      [-62, 38].forEach(function (x) {
        ctx.beginPath();
        ctx.rect(x, -40, 24, 80);
        ol("#c9c3b6");
        ctx.beginPath();
        ctx.moveTo(x - 4, -40);
        ctx.lineTo(x + 12, -66);
        ctx.lineTo(x + 28, -40);
        ctx.closePath();
        ol("#b3262d");
      });
      ctx.beginPath();
      ctx.arc(0, 40, 16, Math.PI, 0);
      ctx.lineTo(16, 40);
      ctx.closePath();
      ol("#4a3a2a", 2);
    },
    pyramid: function () {
      shadow(60, 12);
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(66, 40);
      ctx.lineTo(-66, 40);
      ctx.closePath();
      ol("#e2c27a");
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(66, 40);
      ctx.lineTo(10, 40);
      ctx.closePath();
      ctx.fillStyle = "rgba(120,80,30,.35)";
      ctx.fill();
    },
    flag: function () {
      shadow(25, 8);
      ctx.fillStyle = "#6b4a2a";
      ctx.fillRect(-26, -62, 6, 124);
      ctx.beginPath();
      ctx.moveTo(-20, -58);
      ctx.quadraticCurveTo(10, -44, 40, -58);
      ctx.lineTo(40, -14);
      ctx.quadraticCurveTo(10, -28, -20, -14);
      ctx.closePath();
      ol("#b3262d");
    },
    tent: function () {
      shadow(55, 12);
      ctx.beginPath();
      ctx.moveTo(0, -52);
      ctx.lineTo(60, 36);
      ctx.lineTo(-60, 36);
      ctx.closePath();
      ol("#e8d8b0");
      ctx.beginPath();
      ctx.moveTo(0, -52);
      ctx.lineTo(16, 36);
      ctx.lineTo(-16, 36);
      ctx.closePath();
      ol("#4a3a2a", 2);
    },
    horse: function () {
      shadow(50, 12);
      ctx.beginPath();
      ctx.moveTo(-50, 20);
      ctx.quadraticCurveTo(-40, -20, -10, -20);
      ctx.lineTo(10, -52);
      ctx.quadraticCurveTo(26, -64, 34, -44);
      ctx.lineTo(30, -26);
      ctx.quadraticCurveTo(50, -10, 46, 30);
      ctx.lineTo(34, 30);
      ctx.lineTo(28, 6);
      ctx.lineTo(-26, 8);
      ctx.lineTo(-34, 36);
      ctx.lineTo(-46, 36);
      ctx.closePath();
      ol("#8a5a30");
    },
    satellite: function () {
      shadow(55, 12);
      ctx.fillStyle = "#4a6fa8";
      ctx.fillRect(-70, -14, 40, 28);
      ctx.fillRect(30, -14, 40, 28);
      ctx.beginPath();
      ctx.rect(-22, -22, 44, 44);
      ol("#cfd6de");
      ctx.beginPath();
      ctx.arc(0, -34, 8, 0, 6.283);
      ol("#e8782c", 2);
    }
  };

  L.fleet = L.ship;
  L.boat = L.ship;
  L.airplane = L.plane;
  L.army = L.spear;
  L.empire = L.crown;
  L.temple = L.castle;
  L.eagle = null;
  L.sand = null;
  L.storm = null;
  L.stars = L.star;
  L.treasure = L.chest;
  L.rockets = L.rocket;
  L.submarine = null;
  L.smartphone = L.phone;
  L.cellphone = L.phone;
  L.laptop = L.computer;
  L.pc = L.computer;
  L.lute = L.guitar;

  Object.keys(L).forEach(function (k) { if (!L[k]) delete L[k]; });

  return {
    has: function (n) { return !!L[n]; },
    draw: function (n, x, y, s, t) {
      if (!L[n]) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale((s || 1) * 1.1, (s || 1) * 1.1);
      ctx.rotate(Math.sin((t || 0) * 2.2) * 0.04);
      L[n]();
      ctx.restore();
    }
  };
})();
