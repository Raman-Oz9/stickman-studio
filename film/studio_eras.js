// Era outfits: extra character kinds + ERAS table (hero first, companion second)
(function () {
  var K = CH.KIND;
  var S = ST, ctx = S.ctx, dk = S.dk, lt = S.lt, tint = S.tint;

  K.roman = { skin: "#e3b68e", hair: "#4a3020", style: "helm", tunic: "#9a2424", trim: "#d8a73a", armor: "#c8963c", helm: "#c8963c", crest: "#9a2424", shield: "#9a2424", eye: "#3a2a1a", shoe: "#5a3a22", cape: "#8c1c22", w: 1 };
  K.hoplite = { skin: "#e3b68e", hair: "#3a2a1c", style: "helm", tunic: "#823a24", trim: "#d8a73a", armor: "#d0a040", helm: "#d0a040", crest: "#823a24", shield: "#2a52be", eye: "#3a2a1a", shoe: "#4a3a2a", w: 1 };
  K.knight = { skin: "#e3b68e", hair: "#4a3020", style: "helm", tunic: "#3a5f9a", trim: "#d8d8e0", armor: "#aab4c2", helm: "#b9c3d0", crest: "#2c4a80", shield: "#2c4a80", eye: "#3a2a1a", shoe: "#4a3a2a", cape: "#2c4a80", w: 1.06 };
  K.viking = { skin: "#e8c2a0", hair: "#b07a3a", style: "curly", tunic: "#7a4a2a", trim: "#d8a73a", armor: "#8a6a4a", helm: "#7a5a3a", eye: "#3b78a8", shoe: "#4a3220", cape: "#3a5a3a", beard: "#b07a3a", w: 1.08 };
  K.samurai = { skin: "#e3b68e", hair: "#1a1a1a", style: "helm", tunic: "#1a1a1a", trim: "#d8a73a", armor: "#b3262d", helm: "#2a2a2a", crest: "#d8a73a", shield: "#b3262d", eye: "#2a1a10", shoe: "#2a1a1a", cape: "#b3262d", w: 1.05 };
  K.suit = { skin: "#e3b68e", hair: "#3a2a1c", style: "curly", tunic: "#1f3350", trim: "#c9d2dc", eye: "#3a2a1a", shoe: "#1a1a1a", w: 1 };
  K.suit2 = { skin: "#c8946a", hair: "#16100d", style: "bob", dress: "#a8324a", trim: "#f2e8d8", trim2: "#f2e8d8", eye: "#2a1a10", shoe: "#2a1a1a", female: true, w: 0.88 };
  K.astro = { skin: "#e3b68e", hair: "#4a3020", style: "helm", tunic: "#eef1f5", trim: "#e8782c", armor: "#dfe5ec", helm: "#f4f6f9", crest: "#e8782c", shield: "#9aa7b5", eye: "#3a2a1a", shoe: "#8a97a6", cape: "#e8782c", w: 1.08 };
  K.astro2 = { skin: "#c8946a", hair: "#241a14", style: "helm", tunic: "#dfe5ec", trim: "#2f7fd0", armor: "#c9d2dc", helm: "#eef1f5", crest: "#2f7fd0", shield: "#9aa7b5", eye: "#2a1a10", shoe: "#8a97a6", cape: "#2f7fd0", w: 1.08 };
  K.diver = { skin: "#e3b68e", hair: "#4a3020", style: "helm", tunic: "#2d3c52", trim: "#d8a73a", armor: "#3b4f6b", helm: "#c8963c", crest: "#d8a73a", shield: "#c8963c", eye: "#3a2a1a", shoe: "#1f2937", cape: "#1f2937", w: 1.05 };
  K.diver2 = { skin: "#c8946a", hair: "#241a14", style: "helm", tunic: "#8a3b2a", trim: "#d8a73a", armor: "#a24a35", helm: "#d0a040", crest: "#d8a73a", shield: "#c8963c", eye: "#2a1a10", shoe: "#1f2937", cape: "#5c2a20", w: 1.05 };
  K.sci = { skin: "#e3b68e", hair: "#8a8a8a", style: "curly", tunic: "#f4f6f9", trim: "#2f7fd0", eye: "#3a2a1a", shoe: "#2a2a2a", w: 1 };
  K.pharaoh = { skin: "#d9a67c", hair: "#1a1a1a", style: "turban", tunic: "#e2b23d", trim: "#2c6fb3", trim2: "#e8c14a", armor: "#e2b23d", helm: "#e2b23d", eye: "#2a1a10", shoe: "#d8a73a", head: "uraeus", w: 1.02 };
  K.peasant = { skin: "#d9a67c", hair: "#5a4030", style: "curly", tunic: "#8a6d45", trim: "#c8a568", eye: "#3a2a1a", shoe: "#4a3220", w: 1 };
  K.merchant = { skin: "#c8946a", hair: "#3a2a1a", style: "turban", tunic: "#5a3a7a", trim: "#d8a73a", trim2: "#e8c14a", eye: "#2a1a10", shoe: "#4a3220", w: 1.02 };
  K.pirate = { skin: "#c8946a", hair: "#241a14", style: "helm", tunic: "#9a2424", trim: "#d8a73a", armor: "#3a2a1c", helm: "#1f1f1f", eye: "#2a1a10", shoe: "#2a1a1a", cape: "#1f1f1f", w: 1.04 };

  var oldFront = CH.headFrontLayer;
  CH.headFrontLayer = function (k, ex) {
    oldFront(k, ex);
    var R = CH.HEAD_R || 44;
    function ball(x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); }
    if (k.style === "glass_helmet") {
      ctx.fillStyle = "rgba(200,220,240,0.35)";
      ctx.beginPath();
      ctx.arc(0, -4, R + 6, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = tint("#c8d4e0");
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(-14, -20, 10, 4, -0.4, 0, 6.283);
      ctx.fill();
    } else if (k.style === "brass_helmet") {
      ctx.fillStyle = tint("#c8963c");
      ctx.beginPath();
      ctx.arc(0, -4, R + 4, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = dk(tint("#c8963c"), 0.4);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "rgba(180,210,230,0.7)";
      ctx.beginPath();
      ctx.arc(0, -2, 14, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = tint("#5a4020");
      ctx.lineWidth = 3;
      ctx.stroke();
      for (var i = 0; i < 6; i++) {
        var a = i * Math.PI / 3;
        ball(Math.cos(a) * 17, -2 + Math.sin(a) * 17, 2, tint("#402810"));
      }
    } else if (k.style === "kabuto") {
      var hm = tint(k.helm || "#2a2a2a");
      ctx.fillStyle = hm;
      ctx.beginPath();
      ctx.moveTo(-R - 4, 4);
      ctx.quadraticCurveTo(-R - 6, -R - 10, 0, -R - 16);
      ctx.quadraticCurveTo(R + 6, -R - 10, R + 4, 4);
      ctx.lineTo(R + 14, 10);
      ctx.lineTo(-R - 14, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = dk(hm, 0.4);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = tint(k.trim || "#d8a73a");
      ctx.beginPath();
      ctx.moveTo(-12, -R - 14);
      ctx.quadraticCurveTo(0, -R - 36, 12, -R - 14);
      ctx.lineTo(0, -R - 22);
      ctx.closePath();
      ctx.fill();
    } else if (k.style === "roman_helm") {
      var hm = tint(k.helm || "#c8963c");
      ctx.fillStyle = hm;
      ctx.beginPath();
      ctx.arc(0, -4, R + 3, Math.PI, 6.283);
      ctx.lineTo(R + 8, 12);
      ctx.lineTo(-R - 8, 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = dk(hm, 0.4);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      var cr = tint(k.crest || "#9a2424");
      ctx.fillStyle = cr;
      ctx.fillRect(-6, -R - 20, 12, 28);
    } else if (k.style === "hoplite_helm") {
      var hm = tint(k.helm || "#d0a040");
      ctx.fillStyle = hm;
      ctx.beginPath();
      ctx.arc(0, -2, R + 4, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = dk(hm, 0.4);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      var cr = tint(k.crest || "#823a24");
      ctx.fillStyle = cr;
      ctx.beginPath();
      ctx.moveTo(-16, -R - 10);
      ctx.quadraticCurveTo(-30, -R - 35, -45, -R - 30);
      ctx.quadraticCurveTo(-10, -R - 15, -6, -R - 10);
      ctx.fill();
    } else if (k.style === "pirate_hat") {
      ctx.fillStyle = "#1f1f1f";
      ctx.beginPath();
      ctx.moveTo(-R - 12, -8);
      ctx.quadraticCurveTo(0, -R - 24, R + 12, -8);
      ctx.quadraticCurveTo(R + 4, -R - 32, 0, -R - 26);
      ctx.quadraticCurveTo(-R - 4, -R - 32, -R - 12, -8);
      ctx.fill();
      ctx.strokeStyle = tint("#d8a73a");
      ctx.lineWidth = 2;
      ctx.stroke();
      ball(0, -R - 16, 4, tint("#f2f2f2"));
    } else if (k.style === "peasant_cap") {
      ctx.fillStyle = tint(k.trim || "#c8a568");
      ctx.beginPath();
      ctx.arc(0, -R + 6, R - 2, Math.PI, 6.283);
      ctx.fill();
    }
  };

  window.ERAS = {
    ancient: ["roman", "hoplite", "pharaoh", "peasant", "merchant", "alex", "queen"],
    medieval: ["knight", "viking", "samurai", "pirate", "peasant"],
    modern: ["suit", "suit2", "sci", "merchant"],
    space: ["astro", "astro2"],
    ocean: ["diver", "diver2", "pirate"]
  };
})();
