// Era outfits: extra character kinds + ERAS table (hero first, companion second)
(function () {
  var K = CH.KIND;
  K.astro = { skin: "#e3b68e", hair: "#4a3020", style: "helm", tunic: "#eef1f5", trim: "#e8782c", armor: "#dfe5ec", helm: "#f4f6f9", crest: "#e8782c", shield: "#9aa7b5", eye: "#3a2a1a", shoe: "#8a97a6", cape: "#e8782c", w: 1.08 };
  K.astro2 = { skin: "#c8946a", hair: "#241a14", style: "helm", tunic: "#dfe5ec", trim: "#2f7fd0", armor: "#c9d2dc", helm: "#eef1f5", crest: "#2f7fd0", shield: "#9aa7b5", eye: "#2a1a10", shoe: "#8a97a6", cape: "#2f7fd0", w: 1.08 };
  K.diver = { skin: "#e3b68e", hair: "#4a3020", style: "helm", tunic: "#2d3c52", trim: "#d8a73a", armor: "#3b4f6b", helm: "#c8963c", crest: "#d8a73a", shield: "#c8963c", eye: "#3a2a1a", shoe: "#1f2937", cape: "#1f2937", w: 1.05 };
  K.diver2 = { skin: "#c8946a", hair: "#241a14", style: "helm", tunic: "#8a3b2a", trim: "#d8a73a", armor: "#a24a35", helm: "#d0a040", crest: "#d8a73a", shield: "#c8963c", eye: "#2a1a10", shoe: "#1f2937", cape: "#5c2a20", w: 1.05 };
  K.suit = { skin: "#e3b68e", hair: "#3a2a1c", style: "curly", tunic: "#1f3350", trim: "#c9d2dc", cape: null, eye: "#3a2a1a", shoe: "#1a1a1a", w: 1 };
  K.suit2 = { skin: "#c8946a", hair: "#16100d", style: "bob", dress: "#a8324a", trim: "#f2e8d8", trim2: "#f2e8d8", eye: "#2a1a10", shoe: "#2a1a1a", female: true, w: 0.88 };
  K.knight = { skin: "#e3b68e", hair: "#4a3020", style: "helm", tunic: "#3a5f9a", trim: "#d8d8e0", armor: "#aab4c2", helm: "#b9c3d0", crest: "#2c4a80", shield: "#2c4a80", eye: "#3a2a1a", shoe: "#4a3a2a", cape: "#2c4a80", w: 1.06 };
  K.viking = { skin: "#e8c2a0", hair: "#b07a3a", style: "curly", tunic: "#7a4a2a", trim: "#d8a73a", armor: "#8a6a4a", eye: "#3b78a8", shoe: "#4a3220", cape: "#3a5a3a", beard: "#b07a3a", w: 1.08 };
  K.sci = { skin: "#e3b68e", hair: "#8a8a8a", style: "curly", tunic: "#f4f6f9", trim: "#2f7fd0", eye: "#3a2a1a", shoe: "#2a2a2a", w: 1 };
  window.ERAS = { ancient: ["alex", "red"], medieval: ["knight", "viking"], modern: ["suit", "suit2"], space: ["astro", "astro2"], ocean: ["diver", "diver2"] };
})();
