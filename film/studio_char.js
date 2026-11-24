// Studio engine: illustrated, rigged characters (flat-vector, soft shading, rim light, expressive faces with teeth)
var CH = (function () {
  var S = ST, ctx = S.ctx, dk = S.dk, lt = S.lt, mix = S.mix, tint = S.tint;
  var KIND = {
    alex:  { skin: "#f2c7a3", hair: "#7b4a22", style: "curly", tunic: "#f6f0e4", trim: "#d8a73a", cape: "#b5242c", eye: "#3b78a8", shoe: "#6b4a2a", head: "laurel", armband: true, w: 1 },
    alexc: { skin: "#f2c7a3", hair: "#7b4a22", style: "curly", tunic: "#f6f0e4", trim: "#d8a73a", cape: "#b5242c", eye: "#3b78a8", shoe: "#6b4a2a", head: "crown", armband: true, w: 1 },
    queen: { skin: "#c98b5b", hair: "#16100d", style: "bob", dress: "#f7f2e8", trim: "#2c6fb3", trim2: "#e2b23d", eye: "#2a1a10", shoe: "#d8a73a", head: "uraeus", female: true, w: 0.86 },
    red:   { skin: "#e3b68e", hair: "#4a3020", style: "helm", tunic: "#b3262d", trim: "#d8a73a", armor: "#c8963c", helm: "#c8963c", crest: "#c0282e", shield: "#b3262d", eye: "#3a2a1a", shoe: "#5a3a22", cape: "#8c1c22", w: 1 },
    teal:  { skin: "#c8946a", hair: "#241a14", style: "turban", tunic: "#1f7a86", trim: "#d8a73a", armor: "#5b3c8e", helm: "#2f9aa6", shield: "#5b3c8e", eye: "#2a1a10", shoe: "#4a3220", cape: "#24545e", w: 1 },
    elder: { skin: "#d9a67c", hair: "#d9d9d9", style: "bald", tunic: "#6a4aa0", trim: "#d8a73a", eye: "#3a2a1a", shoe: "#5a3a22", beard: "#e0e0e0", w: 1 }
  };
  var HEAD_R = 44, UA = 58, FA = 56, TH = 60, SH = 60;

  function limb(x0, y0, x1, y1, w, col, edge, w1) {
    w1 = w1 == null ? w * 0.8 : w1; var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    function poly(a, b) { ctx.beginPath(); ctx.moveTo(x0 + nx * a / 2, y0 + ny * a / 2); ctx.lineTo(x1 + nx * b / 2, y1 + ny * b / 2); ctx.arc(x1, y1, b / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true); ctx.lineTo(x0 - nx * a / 2, y0 - ny * a / 2); ctx.arc(x0, y0, a / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true); ctx.closePath(); }
    ctx.fillStyle = edge || dk(col, 0.3); poly(w + 3, w1 + 3); ctx.fill();
    var g = ctx.createLinearGradient(x0 + nx * w / 2, y0 + ny * w / 2, x0 - nx * w / 2, y0 - ny * w / 2); g.addColorStop(0, lt(col, 0.16)); g.addColorStop(0.55, col); g.addColorStop(1, dk(col, 0.2)); ctx.fillStyle = g; poly(w, w1); ctx.fill();
  }
  function hand(x, y, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(-a); ctx.fillStyle = dk(col, 0.3); ctx.beginPath(); ctx.ellipse(0, 8, 10.5, 12.5, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 8, 8.8, 11, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = lt(col, 0.1); ctx.beginPath(); ctx.ellipse(-6, 4, 3.4, 6.6, 0.5, 0, 6.283); ctx.fill(); ctx.strokeStyle = dk(col, 0.35); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-3, 14); ctx.lineTo(-3, 19); ctx.moveTo(2, 15); ctx.lineTo(2, 20); ctx.stroke(); ctx.restore(); }
  function ball(x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); }

  // ---- pose solver: returns joint angles (0 = hanging down, + = swing toward facing side) ----
  function pose(c) {
    var t = c.t, P = { sf: 0.12, ef: 0.18, sb: -0.1, eb: 0.12, hf: 0, kf: 0, hb: 0, kb: 0, lean: 0, bob: 0, head: 0, drop: 0, rot: 0, crouch: 0 };
    var nm = c.pose;
    if (nm === "walk" || nm === "march") {
      var sp = nm === "march" ? 5.2 : 6.6, ph = t * sp + (c.phase || 0), s = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
      P.hf = s * 0.62; P.hb = s2 * 0.62; P.kf = Math.max(0, -Math.cos(ph)) * 0.9; P.kb = Math.max(0, Math.cos(ph)) * 0.9;
      P.sf = s2 * 0.5 + 0.1; P.sb = s * 0.5 - 0.1; P.ef = 0.35 + Math.max(0, s2) * 0.3; P.eb = 0.3 + Math.max(0, s) * 0.3; P.bob = Math.abs(Math.cos(ph)) * 7; P.lean = 0.05; P.head = Math.sin(ph) * 0.02;
      if (c.item === "spear") { P.sf = 0.35; P.ef = 0.25; }
    } else if (nm === "talk" || nm === "point") {
      var g = Math.sin(t * 3.2) * 0.5 + 0.5, g2 = Math.sin(t * 2.1 + 1) * 0.5 + 0.5;
      P.sf = 1.1 + g * 0.5; P.ef = 0.9 - g * 0.5; P.sb = 0.15 + g2 * 0.5; P.eb = 0.5 + g2 * 0.4; P.bob = Math.sin(t * 2.2) * 2.5; P.head = Math.sin(t * 2.6) * 0.07; P.lean = 0.03;
      if (nm === "point") { P.sf = 1.55; P.ef = 0.05; }
    } else if (nm === "fight") {
      var ph2 = (c.fphase || 0) + t * 3.4, th = Math.max(0, Math.sin(ph2)), th2 = Math.pow(th, 2);
      P.lean = 0.16 + th2 * 0.14; P.hf = 0.55; P.kf = 0.25; P.hb = -0.5; P.kb = 0.35;
      P.sf = 1.15 + th2 * 0.35 - Math.max(0, -Math.sin(ph2)) * 0.5; P.ef = 0.1; P.sb = 0.5; P.eb = 1.0; P.bob = Math.abs(Math.sin(ph2)) * 3; P.head = -0.05;
      c._thrust = th2;
    } else if (nm === "kneel") {
      P.hf = 1.25; P.kf = 1.25; P.hb = -0.25; P.kb = 1.5; P.crouch = 1; P.sf = 0.18; P.ef = 0.25; P.sb = -0.05; P.eb = 0.2; P.head = 0.18 + Math.sin(t * 1.5) * 0.015; P.bob = Math.sin(t * 1.7) * 1.5;
    } else if (nm === "cheer") {
      var up = Math.sin(t * 7) * 0.25; P.sf = 2.7 + up; P.ef = 0.2; P.sb = 2.6 - up; P.eb = 0.25; P.bob = Math.abs(Math.sin(t * 7)) * 8; P.head = -0.06;
    } else if (nm === "hold") { // arms raised forward holding something at head height
      P.sf = 1.9; P.ef = 0.55; P.sb = 1.85; P.eb = 0.6; P.bob = Math.sin(t * 1.6) * 2; P.head = 0.04;
    } else if (nm === "down") {
      var f = S.easeOut(c.fall || 0); P.rot = -f * 1.5; P.sf = 0.6 + f; P.ef = 0.4; P.sb = 0.9; P.eb = 0.3; P.hf = 0.3 * f; P.kf = 0.5 * f; P.hb = -0.2; P.kb = 0.8 * f; P.drop = f * 8;
    } else if (nm === "look") { // idle looking out, hand on hip/relaxed
      P.sf = 0.25; P.ef = 0.3; P.sb = -0.15; P.eb = 0.25; P.bob = Math.sin(t * 1.8) * 2; P.head = 0.04 + Math.sin(t * 0.6) * 0.03;
    } else if (nm === "sit") { P.hf = 1.45; P.kf = 1.45; P.hb = 1.35; P.kb = 1.5; P.sf = 0.4; P.ef = 0.6; P.sb = 0.35; P.eb = 0.6; P.crouch = 1; }
    else { P.bob = Math.sin(t * 2 + (c.phase || 0)) * 2.4; P.sf += Math.sin(t * 1.9 + (c.phase || 0)) * 0.03; P.sb -= Math.sin(t * 1.9) * 0.03; P.head = Math.sin(t * 0.8 + (c.phase || 0)) * 0.03; }
    return P;
  }

  // ---- face ----
  function face(c, k, P, ex, talkAmt) {
    var r = HEAD_R, skin = tint(k.skin), look = c.look || [1, 0], blink = (Math.sin(c.t * 1.3 + (c.phase || 0) * 3) > 0.985) || c.blink;
    var ox = 5, side = c.vw === "side";
    // eyes
    (side ? [1] : [-1, 1]).forEach(function (s) {
      var ex0 = side ? 20 : ox + s * 15.5, ey = -2;
      if (blink) { ctx.strokeStyle = dk(skin, 0.6); ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(ex0 - 7, ey); ctx.lineTo(ex0 + 7, ey + 1); ctx.stroke(); return; }
      var ew = s > 0 ? 9.5 : 8.5, eh = ex === "shock" ? 13 : ex === "sad" ? 10 : ex === "smug" ? 7 : ex === "happy" ? 8 : ex === "angry" ? 8.5 : 11;
      ctx.fillStyle = "#fffaf0"; ctx.beginPath(); ctx.ellipse(ex0, ey, ew, eh, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = dk(skin, 0.55); ctx.lineWidth = 1.6; ctx.stroke();
      var ix = ex0 + look[0] * 3.2, iy = ey + look[1] * 3 + (ex === "sad" ? 1.5 : 0);
      ctx.fillStyle = tint(k.eye); ctx.beginPath(); ctx.arc(ix, iy, 6.1, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#15100c"; ctx.beginPath(); ctx.arc(ix, iy, ex === "shock" ? 2.2 : 3.4, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ix + 2.2, iy - 2.4, 1.9, 0, 6.283); ctx.fill();
      // upper lid for smug / sad / angry
      if (ex === "smug" || ex === "sad" || ex === "angry") { ctx.fillStyle = skin; ctx.beginPath(); ctx.rect(ex0 - ew - 1, ey - eh - 1, ew * 2 + 2, ex === "smug" ? eh * 0.85 : eh * 0.45); ctx.fill(); ctx.strokeStyle = dk(skin, 0.6); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(ex0 - ew, ey - eh * (ex === "smug" ? -0.7 : -0.05)); ctx.lineTo(ex0 + ew, ey - eh * (ex === "smug" ? -0.7 : -0.05)); ctx.stroke(); }
    });
    // brows
    var bc = k.hair === "#d9d9d9" ? "#c8c8c8" : dk(k.hair, 0.1); ctx.strokeStyle = tint(bc); ctx.lineWidth = 4.2; ctx.lineCap = "round";
    var bl = [-14, -13], br = [-13, -14], by = -19;
    if (ex === "angry") { bl = [-8, 5]; br = [5, -8]; by = -17; } else if (ex === "sad") { bl = [5, -9]; br = [-9, 5]; by = -19; } else if (ex === "shock") { bl = [-6, -6]; br = [-6, -6]; by = -27; } else if (ex === "happy") { bl = [-4, -10]; br = [-10, -4]; by = -23; } else if (ex === "smug") { bl = [-6, -12]; br = [-1, 0]; by = -21; }
    if (side) { ctx.beginPath(); ctx.moveTo(8, by + bl[0]); ctx.quadraticCurveTo(20, by + Math.min(bl[0], bl[1]) - 4, 32, by + bl[1]); ctx.stroke(); } else
    ctx.beginPath(); ctx.moveTo(ox - 25, by + bl[0]); ctx.quadraticCurveTo(ox - 16, by + Math.min(bl[0], bl[1]) - 4, ox - 6, by + bl[1]); ctx.moveTo(ox + 6, by + br[0]); ctx.quadraticCurveTo(ox + 16, by + Math.min(br[0], br[1]) - 4, ox + 25, by + br[1]); ctx.stroke();
    // nose
    if (side) { ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(HEAD_R - 6, -4); ctx.quadraticCurveTo(HEAD_R + 12, 10, HEAD_R - 2, 17); ctx.lineTo(HEAD_R - 8, 16); ctx.closePath(); ctx.fill(); ctx.strokeStyle = dk(skin, 0.4); ctx.lineWidth = 2.2; ctx.stroke(); ctx.fillStyle = dk(skin, 0.1); ctx.beginPath(); ctx.ellipse(-4, 6, 9, 12, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = dk(skin, 0.4); ctx.beginPath(); ctx.arc(-4, 6, 4, 0.3, 4.2); ctx.stroke(); } else {
    ctx.strokeStyle = dk(skin, 0.38); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(ox + 1, 6); ctx.quadraticCurveTo(ox + 9, 13, ox + 2, 15); ctx.stroke(); }
    // cheeks
    ctx.fillStyle = "rgba(230,110,100,0.22)"; ctx.beginPath(); if (side) ctx.ellipse(22, 14, 7, 4.5, 0, 0, 6.283); else { ctx.ellipse(ox - 26, 12, 7, 4.5, 0, 0, 6.283); ctx.ellipse(ox + 26, 12, 7, 4.5, 0, 0, 6.283); } ctx.fill();
    // mouth
    var my = 24, mx = side ? 28 : ox + 1, open = talkAmt; if (side) { talkAmt = talkAmt * 0.8; }
    ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#5a2020";
    function mouthShape(w, h, teeth, tongue) {
      ctx.save(); ctx.beginPath(); ctx.moveTo(mx - w, my); ctx.quadraticCurveTo(mx, my - h * 0.35, mx + w, my); ctx.quadraticCurveTo(mx + w * 0.8, my + h * 1.5, mx, my + h * 1.6); ctx.quadraticCurveTo(mx - w * 0.8, my + h * 1.5, mx - w, my); ctx.closePath(); ctx.fillStyle = "#6b1c24"; ctx.fill(); ctx.clip();
      if (teeth) { ctx.fillStyle = "#fffdf6"; ctx.fillRect(mx - w, my - 2, w * 2, Math.min(h * 0.75 + 3, 11)); ctx.strokeStyle = "rgba(160,150,140,.55)"; ctx.lineWidth = 1; for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(mx + i * w * 0.38, my - 2); ctx.lineTo(mx + i * w * 0.38, my + Math.min(h * 0.75 + 1, 9)); ctx.stroke(); } }
      if (tongue) { ctx.fillStyle = "#e0707a"; ctx.beginPath(); ctx.ellipse(mx, my + h * 1.25, w * 0.55, h * 0.5, 0, 0, 6.283); ctx.fill(); }
      ctx.restore(); ctx.strokeStyle = "#5a2020"; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(mx - w, my); ctx.quadraticCurveTo(mx, my - h * 0.35, mx + w, my); ctx.quadraticCurveTo(mx + w * 0.8, my + h * 1.5, mx, my + h * 1.6); ctx.quadraticCurveTo(mx - w * 0.8, my + h * 1.5, mx - w, my); ctx.stroke();
    }
    if (ex === "angry") { if (open > 0.05 || c.pose === "fight") mouthShape(13, 6 + open * 9, true, open > 0.5); else { ctx.beginPath(); ctx.moveTo(mx - 10, my + 3); ctx.quadraticCurveTo(mx, my - 4, mx + 10, my + 3); ctx.stroke(); } }
    else if (ex === "sad") { if (open > 0.05) mouthShape(9, 4 + open * 7, false, open > 0.6); else { ctx.beginPath(); ctx.moveTo(mx - 9, my + 5); ctx.quadraticCurveTo(mx, my - 3, mx + 9, my + 5); ctx.stroke(); } }
    else if (ex === "shock") { mouthShape(7.5, 9 + open * 4, false, true); }
    else if (ex === "happy") { mouthShape(15, 7 + open * 8, true, open > 0.45); }
    else if (ex === "smug") { ctx.beginPath(); ctx.moveTo(mx - 8, my + 1); ctx.quadraticCurveTo(mx + 3, my + 8, mx + 13, my - 4); ctx.stroke(); }
    else { if (open > 0.05) mouthShape(11, 3.5 + open * 9, true, open > 0.55); else { ctx.beginPath(); ctx.moveTo(mx - 9, my); ctx.quadraticCurveTo(mx, my + 5, mx + 9, my); ctx.stroke(); } }
  }

  function leaf(x, y, a, len, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.38, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.38, 0, 0); ctx.fill(); ctx.restore(); }

  function headBackLayer(k) { // hair behind head
    var hair = tint(k.hair);
    if (k.style === "bob") { ctx.fillStyle = hair; S.rrect(-52, -48, 104, 108, 38); ctx.fill(); ctx.fillStyle = dk(hair, -0.0); }
    else if (k.style === "curly") { ctx.fillStyle = hair; for (var i = 0; i < 9; i++) { var a = Math.PI * (0.92 + i * 0.145); ball(Math.cos(a) * 41, Math.sin(a) * 40 + 2, 14, hair); } ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, 4, 43, 0, 6.283); ctx.fill(); }
    else if (k.style === "helm") { var cr = tint(k.crest); ctx.fillStyle = cr; ctx.beginPath(); ctx.moveTo(-8, -HEAD_R - 14); ctx.quadraticCurveTo(-60, -HEAD_R - 48, -70, -HEAD_R + 30); ctx.quadraticCurveTo(-40, -HEAD_R - 6, -8, -HEAD_R + 8); ctx.fill(); ctx.fillStyle = dk(cr, 0.25); ctx.beginPath(); ctx.moveTo(-14, -HEAD_R - 6); ctx.quadraticCurveTo(-50, -HEAD_R - 28, -58, -HEAD_R + 22); ctx.quadraticCurveTo(-38, -HEAD_R + 2, -14, -HEAD_R + 8); ctx.fill(); }
  }
  function headFrontLayer(k, ex) {
    var hair = tint(k.hair), R = HEAD_R;
    if (k.style === "curly") { for (var i = 0; i < 8; i++) { var a = Math.PI * (1.08 + i * 0.118); ball(Math.cos(a) * 31 + 4, Math.sin(a) * 30 - 8, 13, i % 2 ? hair : lt(hair, 0.12)); } ctx.fillStyle = dk(hair, 0.15); ctx.beginPath(); ctx.arc(-24, -22, 9, 0, 6.283); ctx.fill(); }
    else if (k.style === "bob") { ctx.fillStyle = hair; ctx.beginPath(); ctx.moveTo(-46, 4); ctx.quadraticCurveTo(-52, -52, 0, -54); ctx.quadraticCurveTo(52, -52, 46, 4); ctx.lineTo(40, -14); ctx.lineTo(-40, -14); ctx.closePath(); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.beginPath(); ctx.ellipse(-12, -40, 22, 5, -0.15, 0, 6.283); ctx.fill();
      ctx.fillStyle = tint(k.trim2); ctx.fillRect(-44, -26, 88, 7); ctx.fillStyle = tint(k.trim); for (var j = -3; j <= 3; j++) ctx.fillRect(j * 12 - 3, -26, 6, 7); }
    else if (k.style === "helm") { var hm = tint(k.helm); ctx.fillStyle = hm; ctx.beginPath(); ctx.moveTo(-47, 10); ctx.quadraticCurveTo(-52, -56, 0, -58); ctx.quadraticCurveTo(52, -56, 47, 10); ctx.lineTo(36, 14); ctx.lineTo(34, -17); ctx.lineTo(-34, -17); ctx.lineTo(-36, 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = dk(hm, 0.35); ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "rgba(255,245,200,.35)"; ctx.beginPath(); ctx.ellipse(-14, -42, 16, 6, -0.3, 0, 6.283); ctx.fill(); ctx.fillStyle = dk(hm, 0.3); ctx.fillRect(-4, -57, 8, 40); }
    else if (k.style === "turban") { var tb = tint(k.helm); ctx.fillStyle = tb; ctx.beginPath(); ctx.moveTo(-48, -2); ctx.quadraticCurveTo(-54, -62, 0, -64); ctx.quadraticCurveTo(54, -62, 48, -2); ctx.quadraticCurveTo(0, -18, -48, -2); ctx.fill(); ctx.strokeStyle = dk(tb, 0.35); ctx.lineWidth = 2.5; for (var q = 0; q < 4; q++) { ctx.beginPath(); ctx.moveTo(-46 + q * 4, -8 - q * 12); ctx.quadraticCurveTo(0, -22 - q * 12, 46 - q * 4, -8 - q * 12); ctx.stroke(); } ball(8, -50, 6, tint("#e8c14a")); }
    if (k.beard) { ctx.fillStyle = tint(k.beard); ctx.beginPath(); ctx.moveTo(-38, 10); ctx.quadraticCurveTo(-30, 62, 0, 66); ctx.quadraticCurveTo(30, 62, 38, 10); ctx.quadraticCurveTo(22, 30, 0, 26); ctx.quadraticCurveTo(-22, 30, -38, 10); ctx.fill(); }
    // regalia
    if (k.head === "laurel") { for (var l = 0; l < 11; l++) { var a2 = Math.PI * (1.04 + l * 0.092), px = Math.cos(a2) * 44 + 3, py = Math.sin(a2) * 42 - 6; leaf(px, py, a2 + Math.PI / 2 + 0.5, 16, l % 2 ? tint("#4a9a45") : tint("#68b857")); } for (var m = 0; m < 4; m++) ball(Math.cos(Math.PI * (1.2 + m * 0.2)) * 44 + 3, Math.sin(Math.PI * (1.2 + m * 0.2)) * 42 - 6, 3, tint("#e8c14a")); }
    if (k.head === "crown") { var g = tint("#f2c64a"), y0 = -HEAD_R - 2; ctx.fillStyle = S.vgrad ? ctx.createLinearGradient(0, y0 - 36, 0, y0 + 10) : g; var gr = ctx.createLinearGradient(0, y0 - 40, 0, y0 + 12); gr.addColorStop(0, lt(g, 0.35)); gr.addColorStop(1, dk(g, 0.15)); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-34, y0 + 10); ctx.lineTo(-36, y0 - 22); ctx.lineTo(-20, y0 - 6); ctx.lineTo(-10, y0 - 34); ctx.lineTo(0, y0 - 10); ctx.lineTo(10, y0 - 34); ctx.lineTo(20, y0 - 6); ctx.lineTo(36, y0 - 22); ctx.lineTo(34, y0 + 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = dk(g, 0.4); ctx.lineWidth = 2.5; ctx.stroke(); ball(0, y0 - 1, 5.5, "#d9232e"); ball(-18, y0 + 1, 3.6, "#2b78d8"); ball(18, y0 + 1, 3.6, "#2b78d8"); ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.arc(-26, y0 - 12, 3, 0, 6.283); ctx.fill(); }
    if (k.head === "uraeus") { var gg = tint("#e2b23d"); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(-6, -50); ctx.quadraticCurveTo(0, -80, 6, -50); ctx.fill(); ball(0, -44, 5, tint("#2c6fb3")); }
  }

  function bodyShape(k, P, ls) {
    var tun = tint(k.tunic || k.dress), gr = ctx.createLinearGradient(-32 * ls, 0, 32 * ls, 0); gr.addColorStop(0, lt(tun, 0.18)); gr.addColorStop(0.55, tun); gr.addColorStop(1, dk(tun, 0.26));
    var w = 30 * (k.w || 1), wh = 23 * (k.w || 1);
    if (k.dress) { // long sheath dress to the ankles, drawn in torso frame so it sways with lean
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-w, -100); ctx.quadraticCurveTo(-w + 2, -48, -wh - 2, -6); ctx.quadraticCurveTo(-wh - 12, 50, -wh - 34, 114); ctx.quadraticCurveTo(0, 126, wh + 34, 114); ctx.quadraticCurveTo(wh + 12, 50, wh + 2, -6); ctx.quadraticCurveTo(w - 2, -48, w, -100); ctx.quadraticCurveTo(0, -108, -w, -100); ctx.fill(); ctx.strokeStyle = dk(tun, 0.3); ctx.lineWidth = 2.2; ctx.stroke();
      ctx.fillStyle = tint(k.trim2); ctx.fillRect(-wh - 33, 104, wh * 2 + 66, 9); ctx.fillStyle = tint(k.trim); for (var i = -5; i <= 5; i++) ctx.fillRect(i * 11 - 3, 104, 6, 9);
      // broad collar
      var col = ctx.createLinearGradient(0, -108, 0, -74); col.addColorStop(0, tint(k.trim2)); col.addColorStop(1, dk(tint(k.trim2), 0.2)); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-w + 2, -102); ctx.quadraticCurveTo(0, -60, w - 2, -102); ctx.quadraticCurveTo(0, -94, -w + 2, -102); ctx.fill();
      ctx.strokeStyle = tint(k.trim); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w + 8, -92); ctx.quadraticCurveTo(0, -66, w - 8, -92); ctx.stroke(); ctx.strokeStyle = tint("#e8f4ff"); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w + 14, -88); ctx.quadraticCurveTo(0, -72, w - 14, -88); ctx.stroke();
      ctx.fillStyle = tint(k.trim2); ctx.fillRect(-wh, -8, wh * 2, 7);
    } else {
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-w, -100); ctx.quadraticCurveTo(-w - 2, -40, -wh - 3, 8); ctx.lineTo(wh + 3, 8); ctx.quadraticCurveTo(w + 2, -40, w, -100); ctx.quadraticCurveTo(0, -108, -w, -100); ctx.fill(); ctx.strokeStyle = dk(tun, 0.3); ctx.lineWidth = 2.2; ctx.stroke();
      if (k.armor) { var ar = tint(k.armor), ag = ctx.createLinearGradient(-30 * ls, 0, 30 * ls, 0); ag.addColorStop(0, lt(ar, 0.3)); ag.addColorStop(0.5, ar); ag.addColorStop(1, dk(ar, 0.32)); ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(-w + 2, -98); ctx.quadraticCurveTo(-w, -50, -wh + 2, -10); ctx.lineTo(wh - 2, -10); ctx.quadraticCurveTo(w, -50, w - 2, -98); ctx.quadraticCurveTo(0, -104, -w + 2, -98); ctx.fill(); ctx.strokeStyle = dk(ar, 0.45); ctx.lineWidth = 2.4; ctx.stroke(); ctx.strokeStyle = "rgba(255,240,190,.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -96); ctx.lineTo(0, -12); ctx.moveTo(-20, -70); ctx.quadraticCurveTo(0, -60, 20, -70); ctx.moveTo(-18, -44); ctx.quadraticCurveTo(0, -35, 18, -44); ctx.stroke(); }
      // belt + skirt strips
      ctx.fillStyle = tint(k.trim); ctx.fillRect(-wh - 4, -9, wh * 2 + 8, 10); ball(0, -4, 5, tint("#fff1b8"));
      var sk = tint(k.tunic); for (var j = -2; j <= 2; j++) { ctx.fillStyle = j % 2 ? dk(sk, 0.1) : sk; ctx.beginPath(); ctx.moveTo(j * 10 - 5, 0); ctx.lineTo(j * 10 + 5, 0); ctx.lineTo(j * 10 + 6, 30); ctx.lineTo(j * 10 - 6, 30); ctx.fill(); }
    }
  }

  function arm(sx, sy, a1, e, k, col, front, itemDraw) {
    var x1 = sx + Math.sin(a1) * UA, y1 = sy + Math.cos(a1) * UA, a2 = a1 + e, x2 = x1 + Math.sin(a2) * FA, y2 = y1 + Math.cos(a2) * FA;
    var sleeve = k.dress || k.armor ? null : null, skin = tint(k.skin);
    limb(sx, sy, x1, y1, 17, front ? skin : dk(skin, 0.16), null, 13);
    if (k.armband) { ctx.strokeStyle = tint("#e2b23d"); ctx.lineWidth = 5; ctx.lineCap = "butt"; ctx.beginPath(); ctx.moveTo(sx + (x1 - sx) * 0.55 - 8, sy + (y1 - sy) * 0.55); ctx.lineTo(sx + (x1 - sx) * 0.55 + 8, sy + (y1 - sy) * 0.55); ctx.stroke(); }
    limb(x1, y1, x2, y2, 13, front ? skin : dk(skin, 0.16), null, 10.5);
    ball(x1, y1, 6.8, front ? skin : dk(skin, 0.16)); hand(x2, y2, a2, front ? skin : dk(skin, 0.16));
    if (itemDraw) itemDraw(x2, y2, a2);
    // sleeve cap over the shoulder
    if (!k.dress) { var sl = tint(k.tunic); ctx.fillStyle = front ? sl : dk(sl, 0.2); ctx.beginPath(); ctx.arc(sx, sy + 1, 14, 0, 6.283); ctx.fill(); }
    return [x2, y2, a2];
  }

  function drawSpear(x, y, a, thrust) { ctx.save(); ctx.translate(x, y); ctx.rotate(-a + Math.PI / 2 - Math.PI / 2); ctx.rotate(0); ctx.restore(); }

  // ---- full character ----
  function draw(c) {
    var k = KIND[c.key], P = pose(c), face_ = c.face || 1, s = c.s || 1, view = c.view || "front"; c.vw = view;
    var ls = (S.LIGHT_DX || 1) * face_; // light side in local coords
    ctx.save(); ctx.translate(c.x, c.y);
    // soft contact shadow (before flipping)
    var shw = 62 * s; var sg = S.rgrad(0, 4, 2, shw, [[0, "rgba(20,10,30,0.45)"], [1, "rgba(20,10,30,0)"]]); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(0, 4 * s, shw, 15 * s, 0, 0, 6.283); ctx.fill();
    ctx.scale(face_ * s, s);
    if (P.rot) { ctx.rotate(P.rot); ctx.translate(0, -P.drop); }
    var legCol = tint(k.skin), shoe = tint(k.shoe || "#5a3a22");
    // lowest foot defines hip height
    var ext = function (h, kn) { return Math.cos(h) * TH + Math.cos(h - kn) * SH; };
    var hy = -Math.max(ext(P.hf, P.kf), ext(P.hb, P.kb)) + (P.bob ? -P.bob : 0) - 4; if (P.crouch) hy += 4;
    // cape (behind everything)
    if (k.cape) { var cp = tint(k.cape), sway = Math.sin(c.t * 2.4 + (c.phase || 0)) * 8 + (c.cloak || 0), wind = c.wind || 0; var cg = ctx.createLinearGradient(0, hy - 100, 0, hy + 90); cg.addColorStop(0, lt(cp, 0.1)); cg.addColorStop(1, dk(cp, 0.3)); ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(-8, hy - 104); ctx.quadraticCurveTo(-46 - wind * 0.4, hy - 40, -52 - sway - wind, hy + 78 + sway * 0.3); ctx.quadraticCurveTo(-24 - sway * 0.5, hy + 92, -4, hy + 70); ctx.lineTo(10, hy - 98); ctx.closePath(); ctx.fill(); ctx.strokeStyle = dk(cp, 0.4); ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.beginPath(); ctx.moveTo(-14, hy - 80); ctx.quadraticCurveTo(-36 - sway, hy, -42 - sway, hy + 60); ctx.stroke(); }
    // legs
    function leg(hxo, h, kn, back) { var hx = hxo, x1 = hx + Math.sin(h) * TH, y1 = hy + Math.cos(h) * TH, x2 = x1 + Math.sin(h - kn) * SH, y2 = y1 + Math.cos(h - kn) * SH, col = back ? dk(legCol, 0.16) : legCol; if (k.dress) { return; } limb(hx, hy, x1, y1, 21, col, null, 15); limb(x1, y1, x2, y2, 15, col, null, 11); ball(x1, y1, 7.5, col); ctx.fillStyle = back ? dk(shoe, 0.15) : shoe; ctx.beginPath(); ctx.ellipse(x2 + 8, y2 + 2, 15, 7.5, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = dk(shoe, 0.4); ctx.lineWidth = 2; ctx.stroke(); if (k.armor || k.cape) { ctx.strokeStyle = tint("#8a5a2b"); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x2 - 3, y2 - 18); ctx.lineTo(x2 + 9, y2 - 18); ctx.moveTo(x2 - 4, y2 - 10); ctx.lineTo(x2 + 10, y2 - 10); ctx.stroke(); } }
    leg(-10, P.hb, P.kb, true); if (k.dress) { /* feet peek out */ ctx.fillStyle = tint(k.shoe); ctx.beginPath(); ctx.ellipse(10, -2, 14, 6, 0, 0, 6.283); ctx.ellipse(-10, -2, 14, 6, 0, 0, 6.283); ctx.fill(); }
    // torso frame
    ctx.save(); ctx.translate(0, hy); ctx.rotate(P.lean); if (view === "side") ctx.scale(0.84, 1);
    var shY = -98;
    // back arm (+ shield)
    var backItem = null;
    if (c.shield && k.shield) backItem = function (x, y) { var sh = tint(k.shield), r = 46; ctx.save(); ctx.translate(x + 14, y - 4); var g = S.rgrad(-10, -12, 4, r, [[0, lt(sh, 0.3)], [1, dk(sh, 0.28)]]); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill(); ctx.strokeStyle = tint("#e2b23d"); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, r - 3, 0, 6.283); ctx.stroke(); ctx.strokeStyle = dk(sh, 0.45); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r + 1, 0, 6.283); ctx.stroke(); ball(0, 0, 10, tint("#e2b23d")); ball(0, 0, 5, dk(sh, 0.3)); for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; ctx.fillStyle = tint("#e2b23d"); ctx.beginPath(); ctx.arc(Math.cos(a) * 28, Math.sin(a) * 28, 3, 0, 6.283); ctx.fill(); } ctx.restore(); };
    arm(-10 * (k.w || 1), shY + 6, P.sb, P.eb, k, null, false, backItem);
    // torso
    bodyShape(k, P, ls);
    if (view === "back" && k.cape) { var cp2 = tint(k.cape), cg2 = ctx.createLinearGradient(-30, -100, 30, 20); cg2.addColorStop(0, lt(cp2, 0.12)); cg2.addColorStop(1, dk(cp2, 0.3)); ctx.fillStyle = cg2; ctx.beginPath(); ctx.moveTo(-34, -102); ctx.quadraticCurveTo(0, -112, 34, -102); ctx.quadraticCurveTo(46 + (c.wind || 0) * 0.3, -20, 40 + Math.sin(c.t * 2.4) * 6 + (c.wind || 0) * 0.5, 96); ctx.quadraticCurveTo(0, 108, -40 - Math.sin(c.t * 2.4) * 6, 96); ctx.quadraticCurveTo(-46, -20, -34, -102); ctx.fill(); ctx.strokeStyle = dk(cp2, 0.4); ctx.lineWidth = 2.2; ctx.stroke(); ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.beginPath(); ctx.moveTo(-10, -90); ctx.quadraticCurveTo(-18, -10, -22, 80); ctx.stroke(); }
    // neck
    var skinC = tint(k.skin); ctx.fillStyle = dk(skinC, 0.12); ctx.fillRect(-9, shY - 16, 18, 20);
    // head
    ctx.save(); ctx.translate(2, shY - 52); ctx.rotate(P.head);
    headBackLayer(k);
    var hg = S.rgrad(-14 * ls, -16, 6, HEAD_R + 8, [[0, lt(skinC, 0.22)], [0.7, skinC], [1, dk(skinC, 0.2)]]); ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0, 4, HEAD_R - 2, HEAD_R + 2, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = dk(skinC, 0.3); ctx.lineWidth = 2.2; ctx.stroke();
    // ears
    ball(-HEAD_R + 2, 8, 8, dk(skinC, 0.06)); ball(HEAD_R - 2, 8, 8, dk(skinC, 0.06));
    var backV = view === "back";
    var talkAmt = c.talk ? (0.5 + 0.5 * Math.abs(Math.sin(c.t * 10.5))) * (0.55 + 0.45 * Math.sin(c.t * 3.3 + 1)) : 0;
    var ex = c.ex || "neutral"; if (c.pose === "down" && (c.fall || 0) > 0.2) ex = "shock";
    if (backV) { var hc = (k.style === "helm" || k.style === "turban") ? tint(k.helm) : k.style === "bald" ? skinC : tint(k.hair); var bgx = S.rgrad(-10 * ls, -14, 6, HEAD_R + 8, [[0, lt(hc, 0.18)], [1, dk(hc, 0.3)]]); ctx.fillStyle = bgx; ctx.beginPath(); ctx.ellipse(0, 4, HEAD_R, HEAD_R + 3, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = dk(hc, 0.4); ctx.lineWidth = 2.4; ctx.stroke(); if (k.style === "curly") for (var cb = 0; cb < 12; cb++) { var ca = cb * 0.9; ball(Math.cos(ca) * 24, Math.sin(ca * 1.3) * 22 + 2, 11, cb % 2 ? hc : lt(hc, 0.12)); } if (k.style === "bob") { ctx.fillStyle = tint(k.trim2); ctx.fillRect(-44, -22, 88, 7); } if (k.head === "laurel" || k.head === "crown" || k.head === "uraeus") headFrontLayer({ head: k.head, style: "none", hair: k.hair, trim: k.trim, trim2: k.trim2 }, ex); }
    else { face(c, k, P, ex, talkAmt);
    headFrontLayer(k, ex); }
    // rim light on the sun side
    ctx.strokeStyle = "rgba(255,236,180,.55)"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); if (ls > 0) ctx.arc(0, 4, HEAD_R - 1, -1.3, 0.4); else ctx.arc(0, 4, HEAD_R - 1, Math.PI - 0.4, Math.PI + 1.3); ctx.stroke();
    ctx.restore();
    // front arm + held item
    var frontItem = null;
    if (c.item === "spear") frontItem = function (x, y, a) { ctx.save(); ctx.translate(x, y); var ang = Math.min(1.5, Math.max(0.7, a)); ctx.rotate(-ang + Math.PI / 2 - 0.0); ctx.rotate(0); ctx.restore(); ctx.save(); ctx.translate(x, y); ctx.rotate(a - Math.PI / 2 + 0.0); var th = (c._thrust || 0) * 26; ctx.fillStyle = tint("#7a5230"); ctx.fillRect(-90 + th, -3.5, 270, 7); ctx.fillStyle = dk(tint("#7a5230"), 0.3); ctx.fillRect(-90 + th, 0, 270, 3.5); var tipx = 180 + th, mt = tint("#dfe4ea"); ctx.fillStyle = mt; ctx.beginPath(); ctx.moveTo(tipx, -9); ctx.lineTo(tipx + 40, 0); ctx.lineTo(tipx, 9); ctx.lineTo(tipx + 8, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#7d8794"; ctx.lineWidth = 1.5; ctx.stroke(); ball(x * 0, 0, 0, "#000"); ctx.restore(); };
    else if (c.item === "sword") frontItem = function (x, y, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(a - Math.PI / 2 - 0.35 - (c._thrust || 0) * 0.6); ctx.fillStyle = tint("#8a5a2b"); ctx.fillRect(-14, -4, 26, 8); ctx.fillStyle = tint("#e2b23d"); ctx.fillRect(10, -14, 6, 28); var bg = ctx.createLinearGradient(0, -6, 0, 6); bg.addColorStop(0, "#f3f6fa"); bg.addColorStop(1, "#9aa6b4"); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(16, -6); ctx.lineTo(120, -4); ctx.lineTo(136, 0); ctx.lineTo(120, 4); ctx.lineTo(16, 6); ctx.closePath(); ctx.fill(); ctx.restore(); };
    else if (c.item === "crown") frontItem = function (x, y) { ctx.save(); ctx.translate(x, y - 10); var g = tint("#f2c64a"), gr = ctx.createLinearGradient(0, -30, 0, 8); gr.addColorStop(0, lt(g, 0.35)); gr.addColorStop(1, dk(g, 0.15)); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-30, 8); ctx.lineTo(-32, -18); ctx.lineTo(-17, -4); ctx.lineTo(-8, -30); ctx.lineTo(0, -8); ctx.lineTo(8, -30); ctx.lineTo(17, -4); ctx.lineTo(32, -18); ctx.lineTo(30, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = dk(g, 0.4); ctx.lineWidth = 2; ctx.stroke(); ball(0, 0, 4.5, "#d9232e"); ctx.restore(); };
    else if (c.item === "scroll") frontItem = function (x, y) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = "#efe0b8"; S.rrect(-20, -10, 40, 22, 8); ctx.fill(); ctx.strokeStyle = "#a88d55"; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); };
    var hand = arm(8 * (k.w || 1), shY + 6, P.sf, P.ef, k, null, true, frontItem);
    ctx.restore(); // torso frame
    // front leg
    if (!k.dress) leg(10, P.hf, P.kf, false);
    c._hand = hand; c._hy = hy;
    ctx.restore();
  }

  return { KIND: KIND, draw: draw, pose: pose, HEAD_R: HEAD_R };
})();
