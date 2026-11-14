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
  pirate: { jacket: "#7a2a2a", pants: "#2a2a34", boots: INK, hat: "cap", cap: "#15151b", belt: "#e8c45a", buttons: "#e8c45a", sash: "#c0353a", moustache: "#1a1a1e", sword: true },
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
  guard: { jacket: "#3f6fb5", pants: "#2f3a52", boots: INK, hat: "helmet", cap: "#aeb6c2", belt: "#5a3b2a", buttons: "#e8c45a", rifle: true },
};
const ALIAS: Record<string, string> = {
  cop: "police", officer: "police", policeman: "police", sheriff: "police", burglar: "thief", robber: "thief", criminal: "thief", bandit: "thief", crook: "thief",
  lady: "woman", female: "woman", wife: "mother", mom: "mother", dad: "father", husband: "father", son: "boy", daughter: "girl", child: "kid", old_man: "grandpa", old_woman: "grandma",
  captain: "sailor", fisherman: "sailor", cook: "chef", baker: "chef", professor: "scientist", lawyer: "businessman", boss: "businessman", ceo: "businessman", builder: "worker", miner: "worker",
  emperor: "king", ruler: "king", sultan: "king", soldier_: "guard", villager: "peasant", shopkeeper: "merchant", trader: "merchant", player: "athlete", singer: "musician",
};
export const ROLES = Object.keys(BASE).concat(["soldier", "townsfolk"]);

export const outfitFor = (role: string, v = 0): Outfit => {
  const r = ALIAS[role] ?? role;
  if (r === "soldier") return soldier(v);
  if (r === "townsfolk") return townsfolk(v);
  const o = { ...(BASE[r] ?? townsfolk(v)) } as Outfit;
  const k = (v % 6) * 22; // variant: other skin, other hair, shifted clothing colours (kings and police keep their signature colours)
  const keep = ["king", "queen", "police", "policewoman", "knight", "doctor", "nurse", "chef", "scientist"].includes(r);
  if (v > 0 && !keep) { o.jacket = shift(o.jacket, k); o.pants = shift(o.pants, -k / 2); if (o.dress) o.dress = o.jacket; }
  if (o.hat === "hair" && v > 0 && o.hair && o.hair !== "#e8e4dc") o.hair = HAIR[v % HAIR.length];
  return { ...o, skin: o.skin ?? SKINS[v % 4] };
};
