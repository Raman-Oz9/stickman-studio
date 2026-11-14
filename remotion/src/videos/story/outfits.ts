import { Outfit, INK, SKINS, KID, PARENT, soldier, townsfolk } from "../bridge/toon";

const hex2 = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const shift = (h: string, k: number) => { // rotate hue a little so v-variants of one role differ
  if (!h || h[0] !== "#" || h.length < 7) return h;
  const [r, g, b] = hex2(h).map((x) => x / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let hh = d === 0 ? 0 : mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hh = (hh * 60 + k + 360) % 360; const l = (mx + mn) / 2, s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((hh / 60) % 2) - 1)), m = l - c / 2;
  const [r1, g1, b1] = hh < 60 ? [c, x, 0] : hh < 120 ? [x, c, 0] : hh < 180 ? [0, c, x] : hh < 240 ? [0, x, c] : hh < 300 ? [x, 0, c] : [c, 0, x];
  return "#" + [r1 + m, g1 + m, b1 + m].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
};
const HAIR = ["#2a1f1a", "#5a3b2a", "#c9a15a", "#8a3a22", "#1a1a1e", "#9a9aa2"];
const WHITE = "#f1efe8", NAVY = "#24366b";

const BASE: Record<string, Outfit> = {
  // royalty and court
  king: { jacket: "#7a2438", pants: "#3b2f4a", boots: INK, hat: "crown", belt: "#e8c45a", buttons: "#e8c45a", sash: "#2f5fb5", moustache: "#6b4a2a", build: "stout" },
  queen: { jacket: "#2f5fb5", pants: "#2f3a6a", boots: INK, hat: "crown", belt: "#e8c45a", buttons: "#e8c45a", dress: "#2f5fb5" },
  prince: { jacket: "#2f5fb5", pants: "#3b2f4a", boots: INK, hat: "crown", belt: "#e8c45a", buttons: "#e8c45a", hair: "#c9a15a" },
  princess: { jacket: "#e07aa8", pants: "#b0507a", boots: INK, hat: "crown", belt: "#e8c45a", buttons: "#e8c45a", dress: "#e07aa8" },
  knight: { jacket: "#8d97a6", pants: "#4a505c", boots: INK, hat: "helmet", cap: "#aeb6c2", belt: "#5a3b2a", buttons: "#d9dde0", sash: "#c0353a", sword: true },
  wizard: { jacket: "#4b3a8c", pants: "#2f2a4a", boots: INK, hat: "tophat", moustache: "#e8e4dc", belt: "#e8c45a", build: "stout" },
  witch: { jacket: "#3a2a55", pants: "#241a38", boots: INK, hat: "tophat", dress: "#3a2a55", hair: "#1a1a1e" },
  // law and crime
  police: { jacket: NAVY, pants: "#1c2850", boots: INK, hat: "cap", cap: NAVY, belt: "#111", buttons: "#e8c45a", sash: undefined },
  policewoman: { jacket: NAVY, pants: "#1c2850", boots: INK, hat: "cap", cap: NAVY, belt: "#111", buttons: "#e8c45a", dress: NAVY },
  detective: { jacket: "#8a7552", pants: "#4a4034", boots: "#3a2c20", hat: "cap", cap: "#6b5a3e", belt: "#3a2c20", buttons: "#3a2c20", moustache: "#3a2c20" },
  thief: { jacket: "#2a2a34", pants: "#1c1c24", boots: INK, hat: "cap", cap: "#15151b", belt: "#555", buttons: "#555" },
  judge: { jacket: "#1c1c24", pants: "#1c1c24", boots: INK, hat: "hair", hair: "#e8e4dc", belt: "#e8e4dc", buttons: "#e8e4dc", build: "stout" },
  // work
  doctor: { jacket: WHITE, pants: "#4a8fa0", boots: INK, hat: "hair", hair: "#2a1f1a", buttons: "#4a8fa0" },
  nurse: { jacket: "#e8f3f6", pants: "#e8f3f6", boots: INK, hat: "bonnet", dress: "#e8f3f6" },
  scientist: { jacket: WHITE, pants: "#3a3a44", boots: INK, hat: "hair", hair: "#d8d8de", buttons: "#9aa" },
  chef: { jacket: WHITE, pants: "#2f2f38", boots: INK, hat: "tophat", belt: "#c0353a", buttons: "#9aa", moustache: "#3a2c20", build: "stout" },
  teacher: { jacket: "#7a5a8c", pants: "#3a3a44", boots: INK, hat: "hair", hair: "#5a3b2a", buttons: "#d8c8e8" },
  businessman: { jacket: "#2a3140", pants: "#2a3140", boots: INK, hat: "hair", hair: "#2a1f1a", sash: "#c0353a", buttons: "#9aa" },
  businesswoman: { jacket: "#5a2f55", pants: "#3a2a44", boots: INK, hat: "hair", hair: "#2a1f1a", dress: "#5a2f55" },
  worker: { jacket: "#e8832a", pants: "#3a4a6a", boots: "#4a3426", hat: "helmet", cap: "#f2c433", belt: "#555", buttons: "#f2c433" },
  farmer: { jacket: "#6f8f3a", pants: "#5a4630", boots: "#4a3426", hat: "straw", belt: "#e3d2b8" },
  peasant: { jacket: "#8a6a3a", pants: "#5a4630", boots: "#4a3426", hat: "straw", belt: "#e3d2b8" },
  merchant: { jacket: "#b5653f", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", moustache: "#4a3020", build: "stout" },
  pirate: { jacket: "#7a2a2a", pants: "#2a2a34", boots: INK, hat: "tricorn", belt: "#e8c45a", buttons: "#e8c45a", sash: "#c0353a", moustache: "#1a1a1e", sword: true },
  sailor: { jacket: "#e8e8f0", pants: NAVY, boots: INK, hat: "cap", cap: "#e8e8f0", sash: NAVY },
  athlete: { jacket: "#d2362e", pants: "#f1efe8", boots: "#f1efe8", hat: "hair", hair: "#2a1f1a" },
  musician: { jacket: "#8a2f6a", pants: "#1c1c24", boots: INK, hat: "hair", hair: "#5a3b2a", buttons: "#e8c45a" },
  student: { jacket: "#3a8f6a", pants: "#3a4a6a", boots: "#f1efe8", hat: "hair", hair: "#2a1f1a" },
  // everyday people
  man: { jacket: "#4a7fb0", pants: "#3a3a44", boots: "#4a3426", hat: "hair", hair: "#2a1f1a" },
  woman: { jacket: "#c0507a", pants: "#7a2f50", boots: INK, hat: "hair", hair: "#5a3b2a", dress: "#c0507a" },
  grandpa: { jacket: "#8a7a5a", pants: "#4a4034", boots: "#4a3426", hat: "hair", hair: "#e8e4dc", moustache: "#e8e4dc" },
  grandma: { jacket: "#8a5a8c", pants: "#5a3a5c", boots: INK, hat: "bonnet", dress: "#8a5a8c" },
  mother: { ...PARENT, dress: "#c05a4a", jacket: "#c05a4a" },
  father: { ...PARENT, jacket: "#3a6f9a", pants: "#3a3a44" },
  kid: KID,
  girl: { ...PARENT, jacket: "#e2453c", hair: "#2a1f1a", build: "kid", dress: "#e2453c" },
  boy: { ...KID, jacket: "#2f7fd0" },
  baby: { ...KID, jacket: "#f4d6e8", build: "kid" },

  // ---- history & culture ----
  roman_citizen: { jacket: "#efe6d0", pants: "#efe6d0", boots: "#8a5a2b", hat: "laurel", dress: "#efe6d0", sash: "#7a2f8a", hair: "#3a2a1f" },
  roman_woman: { jacket: "#c9a0d8", pants: "#c9a0d8", boots: "#8a5a2b", hat: "hair", dress: "#c9a0d8", hair: "#2a1f1a", sash: "#f0c84a" },
  roman_emperor: { jacket: "#f4efe2", pants: "#f4efe2", boots: "#8a5a2b", hat: "laurel", dress: "#f4efe2", sash: "#7a2f8a", belt: "#f0c84a", buttons: "#f0c84a", build: "stout" },
  legionary: { jacket: "#b03a2e", pants: "#b03a2e", boots: "#8a5a2b", hat: "roman", cap: "#b8863a", belt: "#6b4a2a", buttons: "#d4a63a", sash: "#d4a63a", sword: true },
  centurion: { jacket: "#a02a24", pants: "#a02a24", boots: "#8a5a2b", hat: "roman", cap: "#d4a63a", belt: "#f0c84a", buttons: "#f0c84a", sash: "#f0c84a", sword: true, moustache: "#2a1f1a" },
  gladiator: { jacket: "#b8863a", pants: "#6b4a2a", boots: "#6b4a2a", hat: "roman", cap: "#8d97a6", belt: "#3a2a1f", buttons: "#8d97a6", sword: true, build: "stout" },
  greek_citizen: { jacket: "#f4f2ec", pants: "#f4f2ec", boots: "#8a5a2b", hat: "laurel", dress: "#f4f2ec", sash: "#3a6fb5", hair: "#3a2a1f" },
  philosopher: { jacket: "#e8e2d0", pants: "#e8e2d0", boots: "#8a5a2b", hat: "laurel", dress: "#e8e2d0", moustache: "#e8e4dc", hair: "#e8e4dc" },
  hoplite: { jacket: "#c0353a", pants: "#c0353a", boots: "#8a5a2b", hat: "roman", cap: "#b8863a", belt: "#b8863a", buttons: "#b8863a", sword: true, sash: "#b8863a" },
  greek_woman: { jacket: "#f4f2ec", pants: "#f4f2ec", boots: "#8a5a2b", hat: "hair", dress: "#f4f2ec", hair: "#2a1f1a", sash: "#d4a63a" },
  cowboy: { jacket: "#c9a070", pants: "#3a5a8a", boots: "#5a3a22", hat: "cowboy", cap: "#9a6a3a", belt: "#d4a63a", buttons: "#d4a63a", sash: "#c0353a" },
  sheriff: { jacket: "#8a6a4a", pants: "#4a3a2a", boots: "#3a2a1f", hat: "cowboy", cap: "#6b4a2a", belt: "#2a1f1a", buttons: "#f0c84a", moustache: "#3a2a1f" },
  outlaw: { jacket: "#2a2a34", pants: "#3a3a44", boots: "#1c1c24", hat: "cowboy", cap: "#1c1c24", belt: "#6b4a2a", buttons: "#555", sash: "#c0353a", moustache: "#1a1a1e" },
  frontier_woman: { jacket: "#8a5a8c", pants: "#8a5a8c", boots: "#5a3a22", hat: "bonnet", dress: "#8a5a8c" },
  viking: { jacket: "#7a5a3a", pants: "#3a3a44", boots: "#4a3426", hat: "viking", cap: "#aeb6c2", belt: "#2a1f1a", buttons: "#d4a63a", sword: true, moustache: "#c9803a", build: "stout" },
  viking_chief: { jacket: "#4a5a8a", pants: "#3a3a44", boots: "#4a3426", hat: "viking", cap: "#d4a63a", belt: "#d4a63a", buttons: "#d4a63a", sword: true, moustache: "#a05a2a", build: "stout", sash: "#c0353a" },
  pharaoh: { jacket: "#f0c84a", pants: "#f4f2ec", boots: "#d4a63a", hat: "nemes", cap: "#2f6fb5", dress: "#f4f2ec", sash: "#2f6fb5", belt: "#f0c84a", buttons: "#f0c84a" },
  egyptian: { jacket: "#f4f2ec", pants: "#f4f2ec", boots: "#8a5a2b", hat: "hair", hair: "#1a1a1e", dress: "#f4f2ec", sash: "#d4a63a" },
  egyptian_guard: { jacket: "#d4a63a", pants: "#f4f2ec", boots: "#8a5a2b", hat: "nemes", cap: "#d4a63a", belt: "#2f6fb5", buttons: "#2f6fb5", sword: true },
  samurai: { jacket: "#2f3a6a", pants: "#1c2240", boots: "#2a1f1a", hat: "samurai", cap: "#2f3a6a", belt: "#c0353a", buttons: "#d4a63a", sword: true, sash: "#c0353a" },
  shogun: { jacket: "#7a2438", pants: "#1c1c24", boots: "#2a1f1a", hat: "samurai", cap: "#d4a63a", belt: "#f0c84a", buttons: "#f0c84a", sword: true, build: "stout" },
  ninja: { jacket: "#15151b", pants: "#15151b", boots: "#15151b", hat: "bandana", cap: "#15151b", belt: "#c0353a", buttons: "#15151b", sword: true },
  japanese_commoner: { jacket: "#6a8a9a", pants: "#4a5a6a", boots: "#8a5a2b", hat: "straw", belt: "#e3d2b8" },
  caveman: { jacket: "#b8864a", pants: "#8a6a3a", boots: "#6b4a2a", hat: "hair", hair: "#4a3020", moustache: "#4a3020", build: "stout", dress: "#b8864a" },
  astronaut: { jacket: "#f4f2ec", pants: "#f4f2ec", boots: "#9aa0a8", hat: "astro", belt: "#2f6fb5", buttons: "#c0353a", sash: "#2f6fb5" },
  gangster: { jacket: "#2a2a34", pants: "#2a2a34", boots: INK, hat: "fedora", cap: "#3a3a44", belt: "#111", buttons: "#9aa", moustache: "#2a1f1a", sash: "#c0353a" },
  flapper: { jacket: "#8a2f6a", pants: "#8a2f6a", boots: INK, hat: "bandana", cap: "#f0c84a", dress: "#8a2f6a", hair: "#1a1a1e" },
  gentleman: { jacket: "#3a3a44", pants: "#2a2a34", boots: INK, hat: "tophat", moustache: "#3a2a1f", sash: "#c0353a", buttons: "#d4a63a" },
  victorian_lady: { jacket: "#7a2f50", pants: "#7a2f50", boots: INK, hat: "bonnet", dress: "#7a2f50" },
  ww2_soldier: { jacket: "#5a6a3a", pants: "#4a5a30", boots: "#3a2a1f", hat: "helmet", cap: "#5a6a3a", belt: "#4a3a2a", buttons: "#8a8a6a", rifle: true },
  sultan: { jacket: "#c9a15a", pants: "#8a2f6a", boots: "#8a5a2b", hat: "turban", cap: "#efe6d0", dress: "#c9a15a", sash: "#8a2f6a", belt: "#f0c84a", moustache: "#2a1f1a", build: "stout" },
  desert_trader: { jacket: "#e8dcc0", pants: "#e8dcc0", boots: "#8a5a2b", hat: "turban", cap: "#c0353a", dress: "#e8dcc0", moustache: "#2a1f1a" },
  maharaja: { jacket: "#2f6fb5", pants: "#f4f2ec", boots: "#d4a63a", hat: "turban", cap: "#f0c84a", dress: "#2f6fb5", belt: "#f0c84a", buttons: "#f0c84a", build: "stout" },
  mexican: { jacket: "#c0353a", pants: "#2a2a34", boots: "#5a3a22", hat: "sombrero", cap: "#d9a441", sash: "#2f9f5a", moustache: "#2a1f1a" },
  pirate_captain: { jacket: "#2f3a6a", pants: "#2a2a34", boots: INK, hat: "tricorn", belt: "#f0c84a", buttons: "#f0c84a", sash: "#c0353a", sword: true, moustache: "#1a1a1e", build: "stout" },
  pirate_woman: { jacket: "#c0353a", pants: "#2a2a34", boots: INK, hat: "bandana", cap: "#f0c84a", dress: "#c0353a", belt: "#6b4a2a", sword: true, hair: "#8a3a22" },
  emperor_china: { jacket: "#d2362e", pants: "#f0c84a", boots: "#2a1f1a", hat: "crown", dress: "#d2362e", sash: "#f0c84a", belt: "#f0c84a", buttons: "#f0c84a", moustache: "#2a1f1a", build: "stout" },
  pilot: { jacket: "#8a6a3a", pants: "#6a5a3a", boots: "#3a2a1f", hat: "cap", cap: "#6b4a2a", belt: "#3a2a1f", buttons: "#d4a63a", sash: "#f4f2ec" },
  monk: { jacket: "#8a6a3a", pants: "#8a6a3a", boots: "#5a3a22", hat: "hair", hair: "#8a6a3a", dress: "#8a6a3a", belt: "#e3d2b8" },
  guard: { jacket: "#3f6fb5", pants: "#2f3a52", boots: INK, hat: "helmet", cap: "#aeb6c2", belt: "#5a3b2a", buttons: "#e8c45a", rifle: true },
};
const ALIAS: Record<string, string> = {
  cop: "police", officer: "police", policeman: "police", sheriff: "police", burglar: "thief", robber: "thief", criminal: "thief", bandit: "thief", crook: "thief",
  lady: "woman", female: "woman", wife: "mother", mom: "mother", dad: "father", husband: "father", son: "boy", daughter: "girl", child: "kid", old_man: "grandpa", old_woman: "grandma",
  captain: "sailor", fisherman: "sailor", cook: "chef", baker: "chef", professor: "scientist", lawyer: "businessman", boss: "businessman", ceo: "businessman", builder: "worker", miner: "worker",
  emperor: "king", ruler: "king", sultan: "king", soldier_: "guard", villager: "peasant", shopkeeper: "merchant", trader: "merchant", player: "athlete", singer: "musician",
};
const ERA_KEEP = new Set(Object.keys({ roman_emperor: 1, legionary: 1, centurion: 1, pharaoh: 1, samurai: 1, shogun: 1, ninja: 1, astronaut: 1, ww2_soldier: 1, pirate_captain: 1, viking_chief: 1, sultan: 1, maharaja: 1, emperor_china: 1, sheriff: 1, outlaw: 1, hoplite: 1, egyptian_guard: 1 }));
export const ROLES = Object.keys(BASE).concat(["soldier", "townsfolk"]);

const ERA: Record<string, Record<string, string>> = {
  roman: { man: "roman_citizen", peasant: "roman_citizen", townsfolk: "roman_citizen", merchant: "roman_citizen", woman: "roman_woman", mother: "roman_woman", king: "roman_emperor", queen: "roman_woman", soldier: "legionary", guard: "legionary", knight: "centurion", police: "legionary" },
  greek: { man: "greek_citizen", peasant: "greek_citizen", townsfolk: "greek_citizen", merchant: "greek_citizen", woman: "greek_woman", mother: "greek_woman", king: "roman_emperor", queen: "greek_woman", soldier: "hoplite", guard: "hoplite", knight: "hoplite", wizard: "philosopher", teacher: "philosopher" },
  wildwest: { man: "cowboy", peasant: "cowboy", townsfolk: "cowboy", farmer: "cowboy", merchant: "cowboy", woman: "frontier_woman", mother: "frontier_woman", soldier: "sheriff", guard: "sheriff", police: "sheriff", king: "sheriff", thief: "outlaw", knight: "sheriff" },
  viking: { man: "viking", peasant: "viking", townsfolk: "viking", soldier: "viking", guard: "viking", knight: "viking", king: "viking_chief", woman: "egyptian", merchant: "viking" },
  egypt: { man: "egyptian", peasant: "egyptian", townsfolk: "egyptian", merchant: "egyptian", woman: "egyptian", mother: "egyptian", king: "pharaoh", queen: "pharaoh", soldier: "egyptian_guard", guard: "egyptian_guard", knight: "egyptian_guard" },
  samurai: { man: "japanese_commoner", peasant: "japanese_commoner", townsfolk: "japanese_commoner", farmer: "japanese_commoner", soldier: "samurai", guard: "samurai", knight: "samurai", king: "shogun", thief: "ninja" },
  pirate: { man: "pirate", peasant: "pirate", townsfolk: "pirate", soldier: "pirate", guard: "pirate", king: "pirate_captain", knight: "pirate_captain", woman: "pirate_woman", thief: "pirate" },
  space: { man: "astronaut", woman: "astronaut", peasant: "astronaut", townsfolk: "astronaut", soldier: "astronaut", guard: "astronaut", scientist: "astronaut", king: "astronaut", thief: "astronaut" },
  ww2: { man: "ww2_soldier", soldier: "ww2_soldier", guard: "ww2_soldier", knight: "ww2_soldier", townsfolk: "man" },
  "1920s": { man: "gangster", townsfolk: "gentleman", merchant: "gentleman", woman: "flapper", mother: "flapper", thief: "gangster", king: "gentleman" },
  victorian: { man: "gentleman", townsfolk: "gentleman", merchant: "gentleman", woman: "victorian_lady", mother: "victorian_lady", king: "gentleman", queen: "victorian_lady" },
  arabian: { man: "desert_trader", peasant: "desert_trader", townsfolk: "desert_trader", merchant: "desert_trader", king: "sultan", soldier: "desert_trader", guard: "desert_trader", woman: "egyptian" },
  india: { man: "desert_trader", townsfolk: "desert_trader", king: "maharaja", merchant: "desert_trader" },
  prehistoric: { man: "caveman", peasant: "caveman", townsfolk: "caveman", soldier: "caveman", guard: "caveman", king: "caveman", woman: "caveman", kid: "kid" },
  china: { king: "emperor_china", man: "japanese_commoner", peasant: "japanese_commoner", townsfolk: "japanese_commoner" },
};
export const outfitFor = (role: string, v = 0, era?: string): Outfit => {
  const base = ALIAS[role] ?? role;
  const r = (era && ERA[era]?.[base]) || base;
  if (r === "soldier") return soldier(v);
  if (r === "townsfolk") return townsfolk(v);
  const o = { ...(BASE[r] ?? townsfolk(v)) } as Outfit;
  const k = (v % 6) * 22; // variant: other skin, other hair, shifted clothing colours (kings and police keep their signature colours)
  const keep = ERA_KEEP.has(r) || ["king", "queen", "police", "policewoman", "knight", "doctor", "nurse", "chef", "scientist"].includes(r);
  if (v > 0 && !keep) { o.jacket = shift(o.jacket, k); o.pants = shift(o.pants, -k / 2); if (o.dress) o.dress = o.jacket; }
  if (o.hat === "hair" && v > 0 && o.hair && o.hair !== "#e8e4dc") o.hair = HAIR[v % HAIR.length];
  return { ...o, skin: o.skin ?? SKINS[v % 4] };
};
