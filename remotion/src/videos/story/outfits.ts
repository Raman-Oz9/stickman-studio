import { Outfit, INK, SKINS, KID, PARENT, soldier, townsfolk, OFFICER } from "../bridge/toon";
const BASE: Record<string, Outfit> = {
  king: { jacket: "#7a2438", pants: "#3b2f4a", boots: INK, hat: "crown", belt: "#e8c45a", buttons: "#e8c45a", sash: "#2f5fb5", moustache: "#6b4a2a", build: "stout" },
  queen: { jacket: "#2f5fb5", pants: "#2f3a6a", boots: INK, hat: "crown", belt: "#e8c45a", buttons: "#e8c45a", dress: "#2f5fb5" },
  knight: { jacket: "#8d97a6", pants: "#4a505c", boots: INK, hat: "helmet", cap: "#aeb6c2", belt: "#5a3b2a", buttons: "#d9dde0", sash: "#c0353a", sword: true },
  peasant: { jacket: "#8a6a3a", pants: "#5a4630", boots: "#4a3426", hat: "straw", belt: "#e3d2b8" },
  farmer: { jacket: "#6f8f3a", pants: "#5a4630", boots: "#4a3426", hat: "straw", belt: "#e3d2b8" },
  wizard: { jacket: "#4b3a8c", pants: "#2f2a4a", boots: INK, hat: "tophat", moustache: "#e8e4dc", belt: "#e8c45a", build: "stout" },
  merchant: { jacket: "#b5653f", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", moustache: "#4a3020", build: "stout" },
  kid: KID,
  girl: { ...PARENT, jacket: "#e2453c", hair: "#2a1f1a", build: "kid" },
  parent: PARENT,
  guard: { ...OFFICER, sash: undefined, moustache: undefined, hat: "helmet", cap: "#aeb6c2", jacket: "#3f6fb5", build: "adult", sword: false, rifle: true },
};
export const outfitFor = (role: string, v = 0): Outfit => {
  if (role === "soldier") return soldier(v);
  if (role === "townsfolk") return townsfolk(v);
  const o = BASE[role] ?? townsfolk(v);
  return { ...o, skin: o.skin ?? SKINS[v % 4] };
};
