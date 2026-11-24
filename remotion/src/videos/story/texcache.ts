// Generated-texture cache (remotion/public/tex/*.jpg). Preloaded once before render so world code can read it synchronously.
// Textures are real CC0 PBR-style albedo maps (ambientCG / Kenney / GitHub kits). Tiling is set per-material so floors
// never look flat: each surface carries its own repeat count and UV offset (macro-variation) to break visible repetition.
import * as THREE from "three";
import { staticFile } from "remotion";
export const TEX: Record<string, THREE.Texture> = {};
const NAMES = [
  "grass","sand_dune","rock","forest_floor","gravel","snow","dry_dirt","cobblestone",
  "mud_brick","limestone","marble","wood_planks","carpet_red","water_deep","roof_tiles",
  "thatch","sky_day","sky_sunset","sky_night","greek_marble","islamic_tile",
  "egyptian_temple_wall","ship_sail_cloth",
  "gold_metal","royal_fabric","wood_dark","stone_throne","canvas_tent","sail_cloth",
  "temple_wall","hieroglyph_wall","silk","wool","leather","linen","armor_metal"
];
export const loadTextures = (): Promise<void> =>
  Promise.all(NAMES.map((n) => new Promise<void>((res) => {
    new THREE.TextureLoader().load(staticFile(`tex/${n}.jpg`), (t) => {
      t.wrapS = t.wrapT = n.startsWith("sky") ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; TEX[n] = t; res();
    }, undefined, () => res());
  }))).then(() => undefined);
export const groundTexName = (kind: string, season?: string): string => {
  if (season === "winter" || kind === "ice") return "snow";
  if (kind === "desert" || kind === "dunes") return "sand_dune";
  if (kind === "mountain" || kind === "canyon") return "rock";
  if (kind === "forest" || kind === "jungle" || kind === "swamp") return "forest_floor";
  if (kind === "ocean-floor") return "gravel";
  return "grass";
};

/** Apply a tiled texture with macro-variation: distinct repeat counts and UV offsets per surface so large planes
 * (grass, sand, rock, cobble, plaster, roof tiles, wood) never read as flat single-colour blocks. */
export const texMat = (texName: string, baseColor: string, u = 24, v = 24, ox = 0, oy = 0): THREE.MeshLambertMaterial => {
  const m = new THREE.MeshLambertMaterial({ color: baseColor });
  const t = TEX[texName];
  if (t) {
    const tc = t.clone();
    tc.needsUpdate = true;
    tc.repeat.set(u, v);
    tc.offset.set(ox, oy);
    m.map = tc;
  }
  return m;
};
