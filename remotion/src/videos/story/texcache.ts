// Generated-texture cache (remotion/public/tex/*.jpg). Preloaded once before render so world code can read it synchronously.
import * as THREE from "three";
import { staticFile } from "remotion";
export const TEX: Record<string, THREE.Texture> = {};
// Keep this catalogue in sync with gen_assets.py ITEMS + SKY; CI verifies exact coverage.
const NAMES = [
  "grass", "sand_dune", "rock", "forest_floor", "gravel", "snow", "dry_dirt",
  "cobblestone", "mud_brick", "limestone", "marble", "wood_planks", "carpet_red",
  "water_deep", "roof_tiles", "thatch", "egyptian_temple_wall", "roman_stone", "greek_marble",
  "islamic_tile", "pagoda_wood", "industrial_metal", "brick_wall", "concrete",
  "asphalt", "glass_facade", "ship_sail_cloth", "ancient_scroll_paper",
  "sky_day", "sky_sunset", "sky_night"
];
export const loadTextures = (): Promise<void> =>
  Promise.all(NAMES.map((n) => new Promise<void>((res) => {
    new THREE.TextureLoader().load(staticFile(`tex/${n}.jpg`), (t) => {
      t.wrapS = THREE.RepeatWrapping; t.wrapT = n.startsWith("sky_") ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
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
