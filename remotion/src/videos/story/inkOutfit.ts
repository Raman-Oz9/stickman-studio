import { outfitFor } from "./outfits";

// Maps the shared role/era outfit table to a drawn 2D garment kind, so a Roman gets a toga and laurel, an astronaut a
// pressure suit and helmet, a caveman a pelt, a pharaoh a kilt and nemes, a knight plate armour, and so on.
export type Garment = "tee" | "tunic" | "robe" | "armor" | "suit" | "dress" | "spacesuit" | "fur" | "kilt" | "coat" | "toga" | "wetsuit";
export type InkStyle = {
  kind: Garment; top: string; bottom: string; shoes: string; accent: string; trim: string;
  hat: string | null; hatColor: string; sleeves: boolean; bareLegs: boolean; skin: string; hair?: string; shine: number;
};
const ROBE = new Set(["wizard", "witch", "monk", "judge", "philosopher", "pharaoh_", "sultan", "maharaja", "emperor_china", "shogun", "japanese_commoner", "desert_trader", "king", "queen", "emperor", "grandma", "victorian_lady"]);
const KINDS: Record<string, Garment> = {
  roman_citizen: "toga", greek_citizen: "toga", roman_emperor: "toga", philosopher: "toga", gladiator: "armor",
  legionary: "armor", centurion: "armor", hoplite: "armor", knight: "armor", guard: "armor", samurai: "armor", egyptian_guard: "kilt",
  pharaoh: "kilt", egyptian: "kilt", caveman: "fur", astronaut: "spacesuit",
  roman_woman: "dress", greek_woman: "dress", frontier_woman: "dress", flapper: "dress", queen: "dress", princess: "dress", pirate_woman: "dress", mother: "dress", girl: "dress", woman: "dress", nurse: "dress", policewoman: "dress", businesswoman: "dress",
  viking: "coat", viking_chief: "coat", pirate: "coat", pirate_captain: "coat", cowboy: "coat", sheriff: "coat", outlaw: "coat", ww2_soldier: "coat", sailor: "coat", detective: "coat", ninja: "coat", gangster: "suit", gentleman: "suit",
  businessman: "suit", doctor: "suit", teacher: "suit", judge: "robe", police: "suit", pilot: "suit", scientist: "suit",
  peasant: "tunic", farmer: "tunic", worker: "tunic", merchant: "tunic", prince: "tunic", chef: "tunic",
};
const HATS: Record<string, string> = {
  crown: "crown", helmet: "helmet", cap: "cap", tophat: "tophat", shako: "shako", hair: "", sombrero: "straw", turban: "turban",
};
export const inkStyleOf = (role: string, v: number, era: string | undefined, resolved: string): InkStyle => {
  const o = outfitFor(role, v, era), k = resolved;
  let kind: Garment = KINDS[k] ?? (ROBE.has(k) ? "robe" : o.dress ? "dress" : "tee");
  if (era === "space" && k !== "astronaut") kind = "spacesuit";
  let hat: string | null = o.hat ? HATS[o.hat] ?? o.hat : null;
  if (k === "pharaoh" || k === "egyptian_guard") hat = "nemes";
  else if (k === "roman_emperor" || k === "roman_citizen" && v % 3 === 0 || k === "centurion") hat = k === "centurion" ? "helmet" : "laurel";
  else if (kind === "spacesuit") hat = "spacehelm";
  else if (kind === "fur") hat = null;
  else if (k === "sultan" || k === "maharaja" || k === "desert_trader") hat = "turban";
  else if (k === "monk") hat = "hood";
  const metal = kind === "armor";
  return {
    kind, top: kind === "toga" ? "#f4efe2" : kind === "kilt" ? o.skin ?? "#c99067" : o.dress ?? o.jacket, bottom: kind === "kilt" ? "#f4efe2" : o.pants, shoes: o.boots === "#241726" ? "#3a2a22" : o.boots,
    accent: o.belt ?? o.sash ?? "#e8c45a", trim: o.sash ?? o.buttons ?? "#e8c45a", hat, hatColor: o.cap ?? (hat === "crown" || hat === "laurel" || hat === "nemes" ? "#e8c45a" : o.jacket),
    sleeves: !["toga", "tunic", "kilt", "fur", "tee", "dress"].includes(kind) || kind === "dress" && false, bareLegs: ["toga", "dress", "fur", "kilt", "tunic"].includes(kind) && !(kind === "tunic" && v % 2 === 0), skin: o.skin ?? "#f6ead9", hair: o.hair, shine: metal || kind === "spacesuit" || kind === "wetsuit" ? 0.6 : 0.34,
  };
};
