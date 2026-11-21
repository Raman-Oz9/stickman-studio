// Story-aware surface materials for hand-built 3D set props.
// Textures are preloaded by StoryHybrid's texcache; missing files leave the original toon material untouched.
import * as THREE from "three";
import { TEX } from "./texcache";

type SurfaceRule = { texture: string; matches: (color: THREE.Color) => boolean };
const warmWood = (c: THREE.Color) => c.r > c.g * 1.06 && c.g > c.b * 1.04 && c.r < 0.9 && c.g < 0.78;
const warmStone = (c: THREE.Color) => {
  const hi = Math.max(c.r, c.g, c.b), lo = Math.min(c.r, c.g, c.b);
  return hi > 0.42 && hi < 0.98 && hi - lo < 0.28;
};
const reddish = (c: THREE.Color) => c.r > c.g * 1.22 && c.r > c.b * 1.2 && c.r > 0.22;
const RULES: Record<string, SurfaceRule> = {
  // timber frames, furniture, carts and ship hulls
  bed: { texture: "wood_planks", matches: warmWood },
  deathbed: { texture: "wood_planks", matches: warmWood },
  royalbed: { texture: "wood_planks", matches: warmWood },
  table: { texture: "wood_planks", matches: warmWood },
  chair: { texture: "wood_planks", matches: warmWood },
  wagon: { texture: "wood_planks", matches: warmWood },
  cart: { texture: "wood_planks", matches: warmWood },
  galleon: { texture: "wood_planks", matches: warmWood },
  ship: { texture: "wood_planks", matches: warmWood },
  romanship: { texture: "wood_planks", matches: warmWood },
  trireme: { texture: "wood_planks", matches: warmWood },
  junk: { texture: "wood_planks", matches: warmWood },
  vikinglongship: { texture: "wood_planks", matches: warmWood },
  // ancient masonry and carved stone
  pyramid: { texture: "limestone", matches: warmStone },
  sphinx: { texture: "limestone", matches: warmStone },
  obelisk: { texture: "limestone", matches: warmStone },
  aqueduct: { texture: "roman_stone" in TEX ? "roman_stone" : "limestone", matches: warmStone },
  colosseum: { texture: "limestone", matches: warmStone },
  tower: { texture: "limestone", matches: warmStone },
  greektemple: { texture: "marble", matches: warmStone },
  temple: { texture: "marble", matches: warmStone },
  // clay construction
  hut: { texture: "mud_brick", matches: warmStone },
  house: { texture: "mud_brick", matches: warmStone },
  // upholstery and woven coverings
  throne: { texture: "carpet_red", matches: reddish },
  carpet: { texture: "carpet_red", matches: reddish },
};

const materialCache = new Map<string, THREE.Material>();
const texturedMaterial = (source: THREE.Material, texture: THREE.Texture): THREE.Material => {
  const key = source.uuid + ":" + texture.uuid;
  const cached = materialCache.get(key);
  if (cached) return cached;
  const material = source.clone() as THREE.MeshLambertMaterial;
  if (!("color" in material) || !(material as THREE.MeshLambertMaterial).color) return source;
  material.map = texture;
  // The generated image is the albedo; do not multiply it by the old flat colour tint.
  material.color.set("#ffffff");
  material.needsUpdate = true;
  materialCache.set(key, material);
  return material;
};

/** Apply a category texture only to matching untextured toon surfaces; keep Kenney-authored maps intact. */
export const applyPropTextures = (root: THREE.Object3D, canonicalName: string): void => {
  const rule = RULES[canonicalName];
  if (!rule) return;
  const texture = TEX[rule.texture];
  if (!texture) return; // absent texture: preserve the procedural colour fallback
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const apply = (material: THREE.Material): THREE.Material => {
      const m = material as THREE.MeshLambertMaterial;
      if (m.map || !m.color || !rule.matches(m.color)) return material;
      return texturedMaterial(material, texture);
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(apply) : apply(mesh.material);
  });
};
