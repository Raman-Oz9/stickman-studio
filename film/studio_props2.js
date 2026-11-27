(function () {
  if (typeof ST === "undefined") return;

  function C() { return ST.ctx; }

  function groundShadow(rx, ry) {
    var ctx = C();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283);
    ctx.fill();
  }

  // ---- rocket: multi-stage, boosters, fins, panel lines, flag, windows, flame ----
  // true scale: ~10x a 330-unit person => ~3300 tall. Origin = base centre on the ground.
  function rocketDraw(x, y, t, s) {
    var ctx = C();
    t = t || 0;
    var k = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);

    groundShadow(280, 62);

    var H = 3000;   // body height
    var R = 150;    // body half width
    var NOSE = 700; // nose cone height

    // side boosters (behind body)
    var bw = 90, bh = 1900;
    for (var b = -1; b <= 1; b += 2) {
      var bx = b * (R + bw * 0.55);
      ctx.fillStyle = "#cfd8e2";
      ctx.beginPath();
      ctx.moveTo(bx, -bh);
      ctx.lineTo(bx + bw, -bh + 120);
      ctx.lineTo(bx + bw, 0);
      ctx.lineTo(bx - bw, 0);
      ctx.lineTo(bx - bw, -bh + 120);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#5a6470";
      ctx.stroke();
      // booster nozzle
      ctx.fillStyle = "#3a3f46";
      ctx.beginPath();
      ctx.moveTo(bx - bw * 0.7, 0);
      ctx.lineTo(bx + bw * 0.7, 0);
      ctx.lineTo(bx + bw * 0.45, 70);
      ctx.lineTo(bx - bw * 0.45, 70);
      ctx.closePath();
      ctx.fill();
    }

    // main body + nose cone
    ctx.fillStyle = "#eef3f8";
    ctx.beginPath();
    ctx.moveTo(-R, 0);
    ctx.lineTo(-R, -H);
    ctx.quadraticCurveTo(-R, -(H + NOSE * 0.55), 0, -(H + NOSE));
    ctx.quadraticCurveTo(R, -(H + NOSE * 0.55), R, -H);
    ctx.lineTo(R, 0);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#5a6470";
    ctx.stroke();

    // stage separation bands
    ctx.fillStyle = "#2a6ad0";
    ctx.fillRect(-R, -H * 0.46, R * 2, 60);
    ctx.fillRect(-R, -H * 0.78, R * 2, 60);

    // panel lines
    ctx.strokeStyle = "rgba(90,100,112,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -H);
    ctx.lineTo(0, 0);
    ctx.stroke();
    for (var i = 1; i <= 6; i++) {
      var py = -H * (i / 7);
      ctx.beginPath();
      ctx.moveTo(-R, py);
      ctx.lineTo(R, py);
      ctx.stroke();
    }

    // fins
    ctx.fillStyle = "#1c1c1c";
    for (var f = -1; f <= 1; f += 2) {
      ctx.beginPath();
      ctx.moveTo(f * R, -40);
      ctx.lineTo(f * (R + 190), 0);
      ctx.lineTo(f * R, -520);
      ctx.closePath();
      ctx.fill();
    }

    // flag on the nose
    ctx.strokeStyle = "#8a8f96";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -(H + NOSE));
    ctx.lineTo(0, -(H + NOSE + 220));
    ctx.stroke();
    ctx.fillStyle = "#ffd23a";
    ctx.beginPath();
    ctx.moveTo(0, -(H + NOSE + 220));
    ctx.lineTo(150, -(H + NOSE + 170));
    ctx.lineTo(0, -(H + NOSE + 120));
    ctx.closePath();
    ctx.fill();

    // windows with reflections
    var wy = -H * 0.86;
    for (var w = -1; w <= 1; w++) {
      var wx = w * 70;
      ctx.fillStyle = "#2b3a4a";
      ctx.beginPath();
      ctx.arc(wx, wy, 34, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = "#8a8f96";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(wx - 10, wy - 10, 12, 0, 6.283);
      ctx.fill();
    }

    // flame with cone shock diamonds
    var fl = 0.85 + 0.15 * Math.sin(t * 18);
    var fh = 900 * fl;
    ctx.fillStyle = "#ffb347";
    ctx.beginPath();
    ctx.moveTo(-R * 0.8, 0);
    ctx.quadraticCurveTo(-R * 0.5, fh * 0.6, 0, fh);
    ctx.quadraticCurveTo(R * 0.5, fh * 0.6, R * 0.8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff2c4";
    ctx.beginPath();
    ctx.moveTo(-R * 0.4, 0);
    ctx.quadraticCurveTo(-R * 0.25, fh * 0.45, 0, fh * 0.7);
    ctx.quadraticCurveTo(R * 0.25, fh * 0.45, R * 0.4, 0);
    ctx.closePath();
    ctx.fill();
    for (var d = 0; d < 4; d++) {
      var dy = fh * (0.18 + d * 0.16);
      var dr = 46 - d * 8;
      ctx.fillStyle = d % 2 ? "#ffd98a" : "#fff6d8";
      ctx.beginPath();
      ctx.moveTo(0, dy - dr);
      ctx.lineTo(dr * 0.6, dy);
      ctx.lineTo(0, dy + dr);
      ctx.lineTo(-dr * 0.6, dy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // ---- lander: descent stage, ascent stage, legs, window, antenna ----
  // true scale: ~7 m => ~1200 tall. Origin = ground between the feet.
  function landerDraw(x, y, t, s) {
    var ctx = C();
    t = t || 0;
    var k = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);

    groundShadow(420, 90);

    // legs
    ctx.strokeStyle = "#6b6f76";
    ctx.lineWidth = 22;
    ctx.lineCap = "round";
    for (var l = -1; l <= 1; l += 2) {
      ctx.beginPath();
      ctx.moveTo(l * 150, -420);
      ctx.lineTo(l * 330, 0);
      ctx.stroke();
      ctx.fillStyle = "#4a4e55";
      ctx.beginPath();
      ctx.ellipse(l * 330, 0, 70, 22, 0, 0, 6.283);
      ctx.fill();
    }

    // descent stage
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(-260, -420);
    ctx.lineTo(260, -420);
    ctx.lineTo(300, -700);
    ctx.lineTo(-300, -700);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#6b5a12";
    ctx.stroke();

    // ascent stage
    ctx.fillStyle = "#d8dde3";
    ctx.beginPath();
    ctx.moveTo(-200, -700);
    ctx.lineTo(200, -700);
    ctx.lineTo(170, -1000);
    ctx.lineTo(-170, -1000);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a6470";
    ctx.stroke();

    // window + reflection
    ctx.fillStyle = "#2b3a4a";
    ctx.beginPath();
    ctx.moveTo(-90, -760);
    ctx.lineTo(90, -760);
    ctx.lineTo(70, -880);
    ctx.lineTo(-70, -880);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(-60, -780);
    ctx.lineTo(-10, -780);
    ctx.lineTo(-30, -860);
    ctx.lineTo(-60, -860);
    ctx.closePath();
    ctx.fill();

    // antenna
    ctx.strokeStyle = "#8a8f96";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -1000);
    ctx.lineTo(0, -1180);
    ctx.stroke();
    ctx.fillStyle = "#e8eef4";
    ctx.beginPath();
    ctx.arc(0, -1200, 40, 0, 6.283);
    ctx.fill();
    ctx.strokeStyle = "#5a6470";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.restore();
  }

  // ---- rover: chassis, wheels, deck, solar panel, mast camera ----
  // true scale: ~3 m long => ~570 wide, ~440 tall. Origin = ground under the axles.
  function roverDraw(x, y, t, s) {
    var ctx = C();
    t = t || 0;
    var k = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);

    groundShadow(320, 60);

    // wheels
    var wr = 70;
    for (var w = -1; w <= 1; w += 2) {
      var wx = w * 190;
      ctx.fillStyle = "#3a3f46";
      ctx.beginPath();
      ctx.arc(wx, -wr, wr, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = "#1c1c1c";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = "#8a8f96";
      ctx.lineWidth = 5;
      for (var sp = 0; sp < 4; sp++) {
        var a = t * 3 + sp * 1.5708;
        ctx.beginPath();
        ctx.moveTo(wx, -wr);
        ctx.lineTo(wx + Math.cos(a) * (wr - 12), -wr + Math.sin(a) * (wr - 12));
        ctx.stroke();
      }
    }

    // chassis
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(-260, -140);
    ctx.lineTo(260, -140);
    ctx.lineTo(230, -260);
    ctx.lineTo(-230, -260);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#6b5a12";
    ctx.stroke();

    // instrument deck
    ctx.fillStyle = "#e8eef4";
    ctx.beginPath();
    ctx.moveTo(-200, -260);
    ctx.lineTo(200, -260);
    ctx.lineTo(170, -400);
    ctx.lineTo(-170, -400);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a6470";
    ctx.stroke();

    // solar panel
    ctx.fillStyle = "#2a4a8a";
    ctx.fillRect(-150, -400, 300, 40);
    ctx.strokeStyle = "#8a8f96";
    ctx.lineWidth = 3;
    ctx.strokeRect(-150, -400, 300, 40);

    // mast + camera
    ctx.strokeStyle = "#8a8f96";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, -400);
    ctx.lineTo(0, -520);
    ctx.stroke();
    ctx.fillStyle = "#e8eef4";
    ctx.beginPath();
    ctx.arc(0, -540, 30, 0, 6.283);
    ctx.fill();
    ctx.strokeStyle = "#5a6470";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.restore();
  }

  // ---- space station: truss, modules, solar arrays, windows, docking port ----
  // true scale: ~100 m => ~4000 wide. Origin = centre of the truss.
  function spaceStationDraw(x, y, t, s) {
    var ctx = C();
    t = t || 0;
    var k = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);

    // solar arrays
    for (var a = -1; a <= 1; a += 2) {
      ctx.fillStyle = "#2a4a8a";
      ctx.fillRect(a * 900, -260, 700, 520);
      ctx.strokeStyle = "#8a8f96";
      ctx.lineWidth = 6;
      ctx.strokeRect(a * 900, -260, 700, 520);
      ctx.strokeStyle = "rgba(200,220,255,0.35)";
      ctx.lineWidth = 3;
      for (var g = 1; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(a * 900 + g * 175, -260);
        ctx.lineTo(a * 900 + g * 175, 260);
        ctx.stroke();
      }
      for (var g2 = 1; g2 < 3; g2++) {
        ctx.beginPath();
        ctx.moveTo(a * 900, -260 + g2 * 173);
        ctx.lineTo(a * 900 + 700, -260 + g2 * 173);
        ctx.stroke();
      }
    }

    // truss
    ctx.fillStyle = "#b8c0c8";
    ctx.fillRect(-900, -60, 1800, 120);
    ctx.strokeStyle = "#5a6470";
    ctx.lineWidth = 5;
    ctx.strokeRect(-900, -60, 1800, 120);

    // main modules
    ctx.fillStyle = "#e8eef4";
    ctx.fillRect(-260, -420, 520, 840);
    ctx.strokeStyle = "#5a6470";
    ctx.lineWidth = 6;
    ctx.strokeRect(-260, -420, 520, 840);

    // windows with reflections
    for (var i = 0; i < 3; i++) {
      ctx.fillStyle = "#2b3a4a";
      ctx.beginPath();
      ctx.arc(-120 + i * 120, -300, 34, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(-130 + i * 120, -310, 12, 0, 6.283);
      ctx.fill();
    }

    // docking port
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(-90, 420, 180, 90);
    ctx.strokeStyle = "#6b5a12";
    ctx.lineWidth = 5;
    ctx.strokeRect(-90, 420, 180, 90);

    ctx.restore();
  }

  var P = {
    rocketDraw: rocketDraw,
    landerDraw: landerDraw,
    roverDraw: roverDraw,
    spaceStationDraw: spaceStationDraw
  };

  // public API for studio_story.js space scenes
  ST.rocketDraw = rocketDraw;
  ST.landerDraw = landerDraw;
  ST.roverDraw = roverDraw;
  ST.spaceStationDraw = spaceStationDraw;

  ST.props2 = {
    has: function (n) { return !!P[n]; },
    draw: function (name, x, y, t, s) {
      var f = P[name];
      if (f) f(x, y, t, s);
    }
  };
})();
