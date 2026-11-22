// Biomes + seasons: one parametric generator (kind, season) -> an enormous themed ground with its landscape dressing.
// Replaces the town plaza when a scene sets biome; composes with weather (env), time of day (tod) and season.
import * as THREE from "three";
import { mk, S, B, C, cone, grp } from "./props3d";

export type Biome = "desert" | "ice" | "forest" | "ocean" | "swamp" | "savanna" | "mountain" | "jungle" | "farm";
export type Season = "spring" | "summer" | "autumn" | "winter";
export const BIOMES: Record<string, Biome> = { desert: "desert", sahara: "desert", dunes: "desert", ice: "ice", arctic: "ice", polar: "ice", glacier: "ice", tundra: "ice", forest: "forest", woods: "forest", ocean: "ocean", sea: "ocean", coast: "ocean", harbor: "ocean", harbour: "ocean", dock: "ocean", lake: "ocean", swamp: "swamp", marsh: "swamp", wetland: "swamp", savanna: "savanna", plain: "savanna", plains: "savanna", steppe: "savanna", mountain: "mountain", mountains: "mountain", hills: "mountain", jungle: "jungle", rainforest: "jungle", farm: "farm", field: "farm", fields: "farm" };
export const FOGB: Record<Biome, string> = { desert: "#f1dcae", ice: "#dcebf8", forest: "#b9d5a8", ocean: "#bfdcf2", swamp: "#8a9a78", savanna: "#ecdcae", mountain: "#c9d6e6", jungle: "#a5c99a", farm: "#cfe6b8" };
const GROUND0: Record<Biome, string> = { desert: "#e9c887", ice: "#eaf5ff", forest: "#5fa84a", ocean: "#8a6a3f", swamp: "#4f5d3a", savanna: "#c9b86a", mountain: "#79866a", jungle: "#3f8f3a", farm: "#8fc45a" };
export const GROUNDC = GROUND0;
let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const leaf = (se: Season) => ({ spring: "#f4a6c8", summer: "#3f9f3f", autumn: "#e0832a", winter: "#e8f1f7" }[se]);
const grass = (se: Season, b: Biome) => (se === "winter" && b !== "desert" ? "#f2f7fb" : se === "autumn" && (b === "forest" || b === "farm" || b === "mountain") ? "#b59a45" : se === "spring" && b === "farm" ? "#9fd36a" : GROUND0[b]);
const treeAt = (g: THREE.Group, x: number, z: number, s: number, se: Season, pine = false) => {
  if (pine) { for (let i = 0; i < 3; i++) g.add(mk(cone(1.3 - i * 0.3, 1.8, 9), se === "winter" ? "#e8f1f7" : "#2f7a46", x, 1.6 + i * 1.1, z, s, s, s)); g.add(mk(C(0.14, 0.18, 1.3, 8), "#6b3f1c", x, 0.65, z, s, s, s)); return; }
  g.add(mk(C(0.16, 0.22, 2.2, 8), "#7a4b24", x, 1.1 * s, z, s, s, s));
  if (se === "winter") { g.add(mk(S(0.1, 6, 5), "#7a4b24", x, 2.4 * s, z)); for (const a of [-1, 1]) g.add(mk(C(0.04, 0.07, 1.2, 6), "#7a4b24", x + a * 0.5 * s, 2.5 * s, z, 1, 1, 1, 0, 0, a * 0.8)); return; }
  g.add(mk(S(1.1, 12, 9), leaf(se), x, 3 * s, z, s, s, s), mk(S(0.75, 10, 8), leaf(se), x + 0.7 * s, 2.5 * s, z + 0.2, s, s, s));
};
export const buildBiome = (b: Biome, se: Season, ground = true): THREE.Group => {
  const g = new THREE.Group(); seed = 3 + b.length;
  const water = b === "ocean";
  if (!water) { if (ground) g.add(mk(B(700, 0.3, 700), grass(se, b), 0, -0.16, 0)); } else {
    if (ground) {
      const waterGeo=new THREE.PlaneGeometry(700,700,36,36);waterGeo.rotateX(-Math.PI/2);
      const waterPos=waterGeo.attributes.position,waterCol=new Float32Array(waterPos.count*3);
      for(let i=0;i<waterPos.count;i++){const z=waterPos.getZ(i),c=new THREE.Color("#0d4268").lerp(new THREE.Color("#3b91b2"),(z+350)/700*.5+.2);waterCol[i*3]=c.r;waterCol[i*3+1]=c.g;waterCol[i*3+2]=c.b;}
      waterGeo.setAttribute("color",new THREE.BufferAttribute(waterCol,3));waterGeo.computeVertexNormals();
      const surface=new THREE.Mesh(waterGeo,new THREE.MeshPhongMaterial({color:"#ffffff",vertexColors:true,specular:"#9bd7e4",shininess:68}));
      surface.position.y=0;surface.userData.waterSurface={baseY:-.7,phase:.8};surface.receiveShadow=false;g.add(surface);
    }
    const waves: THREE.Mesh[] = []; if (ground) for (let i = 0; i < 46; i++) { const w = mk(B(5 + rnd() * 6, 0.16, 0.7), "#6fb7f0", -40 + rnd() * 80, -0.55, -40 + rnd() * 90); w.castShadow = false; waves.push(w); g.add(w); } g.userData.waves = waves;
    g.add(mk(B(22, 0.3, 30), "#8a5a2b", 0, -0.15, -10));                                 // dock the characters stand on, reaching out over the water
    for (let i = 0; i < 12; i++) g.add(mk(B(22, 0.02, 0.1), "#6b3f1c", 0, 0.01, -4.5 + i * 1.2), ...[-10, 10].map((x) => mk(C(0.22, 0.22, 1.4, 8), "#5a3b1e", x, -0.6, -5 + (i % 6) * 2.4)));
    for (const x of [-9, 9]) g.add(mk(C(0.2, 0.2, 1.6, 8), "#5a3b1e", x, 0.7, -4.6), mk(S(0.28, 8, 6), "#e6c35a", x, 1.5, -4.6));
    for (let i = 0; i < 7; i++) g.add(mk(B(0.9, 0.9, 0.9), "#a8743a", -8 + i * 2.2 + rnd(), 0.45, -3 + rnd() * 1.5, 1, 1, 1, 0, rnd()));   // crates and barrels on the dock
    if (ground) for (let i = 0; i < 3; i++) g.add(mk(cone(0.5, 1.1, 5), "#d8c9a8", -60 + i * 40, 0.2, -90, 6, 9, 6));
    return g;
  }
  if (b === "desert") {
    for (let i = 0; i < 26; i++) { const r = 48 + rnd() * 90, a = rnd() * 6.283, w = 10 + rnd() * 22; g.add(mk(S(1, 14, 10), i % 3 ? "#e9c887" : "#dcb774", Math.cos(a) * r, 0, Math.sin(a) * r - 10, w, 2 + rnd() * 5, w * 0.6, 0, rnd() * 3)); }
    for (let i = 0; i < 16; i++) { const x = (rnd() - 0.5) * 60, z = -6 - rnd() * 50, h = 1.5 + rnd() * 1.6; g.add(mk(C(0.25, 0.28, h, 8), "#4f9a52", x, h / 2, z), mk(C(0.14, 0.16, 0.9, 6), "#4f9a52", x + 0.4, h * 0.6, z, 1, 1, 1, 0, 0, 0.5), mk(C(0.14, 0.16, 0.7, 6), "#4f9a52", x - 0.4, h * 0.45, z, 1, 1, 1, 0, 0, -0.5)); }
    for (let i = 0; i < 12; i++) g.add(mk(new THREE.DodecahedronGeometry(0.5 + rnd() * 0.5, 0), "#b8996a", (rnd() - 0.5) * 50, 0.2, -3 - rnd() * 30, 1, 0.6, 1, rnd(), rnd() * 6, 0));
    for (let i = 0; i < 4; i++) { const x = (rnd() - 0.5) * 50, z = -12 - rnd() * 30; g.add(mk(C(0.14, 0.2, 3.4, 8), "#7a4b24", x, 1.7, z, 1, 1, 1, 0, 0, 0.12)); for (let k = 0; k < 6; k++) g.add(mk(S(0.2, 8, 6), "#3f9f3f", x + Math.cos(k) * 0.8, 3.5, z + Math.sin(k) * 0.8, 3, 0.35, 0.9, 0, k)); }
    g.add(mk(cone(2.4, 3, 4), "#d8b46a", 30, 1.5, -40, 1.5, 1.5, 1.5, 0, 0.8));                     // distant pyramid
  } else if (b === "ice") {
    for (let i = 0; i < 26; i++) { const x = (rnd() - 0.5) * 90, z = -8 - rnd() * 70, h = 1 + rnd() * 5; g.add(mk(cone(0.8 + rnd(), h, 5), i % 2 ? "#bfe3ff" : "#d9f0ff", x, h / 2, z, 1, 1, 1, 0, rnd() * 3)); }
    for (let i = 0; i < 10; i++) { const x = (rnd() - 0.5) * 40, z = -6 - rnd() * 20; g.add(mk(B(3 + rnd() * 3, 0.1, 2 + rnd() * 3), "#a9d6f5", x, 0.02, z, 1, 1, 1, 0, rnd() * 3)); }
    g.add(mk(S(1.5, 16, 10), "#f4fbff", 7, 0, -6, 1, 0.75, 1), mk(B(0.8, 0.9, 1), "#9ad0f0", 7, 0.5, -4.7));    // igloo
    for (let i = 0; i < 9; i++) treeAt(g, (rnd() - 0.5) * 70, -14 - rnd() * 40, 1.2, "winter", true);
  } else if (b === "swamp") {
    for (let i = 0; i < 9; i++) g.add(mk(C(1, 1, 0.08, 20), "#2f5560", (rnd() - 0.5) * 50, 0.02, -4 - rnd() * 40, 2 + rnd() * 4, 1, 2 + rnd() * 3));
    for (let i = 0; i < 70; i++) { const x = (rnd() - 0.5) * 60, z = -3 - rnd() * 40; g.add(mk(C(0.03, 0.04, 1.1 + rnd(), 5), "#7a8a3a", x, 0.6, z), mk(C(0.08, 0.08, 0.35, 6), "#6b4a2a", x, 1.1 + rnd() * 0.5, z)); }
    for (let i = 0; i < 12; i++) { const x = (rnd() - 0.5) * 60, z = -6 - rnd() * 40; g.add(mk(C(0.14, 0.26, 4.5, 7), "#4a3a2a", x, 2.2, z, 1, 1, 1, 0, 0, (rnd() - 0.5) * 0.3), mk(C(0.06, 0.1, 1.5, 6), "#4a3a2a", x + 0.5, 4, z, 1, 1, 1, 0, 0, -0.9)); }
    for (let i = 0; i < 8; i++) g.add(mk(S(0.35, 10, 8), "#8fe08a", (rnd() - 0.5) * 30, 0.6 + rnd(), -3 - rnd() * 20));   // wisps / fireflies
  } else if (b === "savanna") {
    for (let i = 0; i < 18; i++) { const x = (rnd() - 0.5) * 80, z = -6 - rnd() * 60; g.add(mk(C(0.14, 0.2, 2.8, 8), "#6b4a2a", x, 1.4, z, 1, 1, 1, 0, 0, 0.1), mk(S(1, 12, 8), "#7da23a", x, 3, z, 2.6, 0.45, 1.8)); }
    g.add(mk(C(1.1, 1.4, 5, 12), "#8a6a4a", -14, 2.5, -18), mk(S(1.6, 10, 8), "#6f9a3a", -14, 5.3, -18, 1.3, 0.5, 1.3));        // baobab
    for (let i = 0; i < 160; i++) g.add(mk(cone(0.07, 0.8 + rnd() * 0.6, 4), "#d9c65a", (rnd() - 0.5) * 60, 0.4, -1.5 - rnd() * 40, 1, 1, 1, 0, 0, (rnd() - 0.5) * 0.4));
    for (let i = 0; i < 8; i++) g.add(mk(new THREE.DodecahedronGeometry(0.7 + rnd(), 0), "#a89b82", (rnd() - 0.5) * 60, 0.3, -8 - rnd() * 40, 1.4, 0.6, 1));
  } else if (b === "mountain") {
    for (let i = 0; i < 9; i++) { const a = -2.6 + (i / 8) * 2.1, r = 55 + rnd() * 30, h = 18 + rnd() * 18; g.add(mk(cone(14 + rnd() * 8, h, 7), "#7b7f8e", Math.sin(a) * r, h / 2, -Math.cos(a) * r, 1, 1, 1, 0, rnd()), mk(cone(5, h * 0.35, 7), "#f4f7ff", Math.sin(a) * r, h * 0.84, -Math.cos(a) * r, 1, 1, 1, 0, 0)); }
    // High alpine anchor is exposed rock and snow; keep conifers out of the Himalayan skyline.
    for (let i = 0; i < 26; i++) { const x=(rnd()-.5)*82,z=-12-rnd()*58,r=.8+rnd()*1.8;g.add(mk(new THREE.DodecahedronGeometry(r,0),i%3?"#737e84":"#aebbc4",x,r*.4,z,1.3,.8,1.2)); }
    for (let i = 0; i < 14; i++) g.add(mk(new THREE.DodecahedronGeometry(0.8 + rnd(), 0), "#8a8f9c", (rnd() - 0.5) * 40, 0.4, -4 - rnd() * 30, 1.3, 0.7, 1));
  } else if (b === "jungle") {
    for (let i = 0; i < 46; i++) { const x = (rnd() - 0.5) * 70, z = -5 - rnd() * 40, h = 4 + rnd() * 5; g.add(mk(C(0.2, 0.3, h, 8), "#6b4a2a", x, h / 2, z), mk(S(2.2, 10, 8), "#2f8a3a", x, h, z, 1.2, 0.7, 1.2), mk(S(1.4, 10, 8), "#3fa04a", x + 1, h - 0.6, z + 0.4)); }
    for (let i = 0; i < 40; i++) g.add(mk(S(0.8, 8, 6), "#2f8a3a", (rnd() - 0.5) * 40, 0.3, -2 - rnd() * 20, 1.4, 0.5, 1));
    for (let i = 0; i < 10; i++) g.add(mk(S(0.18, 8, 6), ["#ff5d8f", "#ffd166", "#6ee7ff"][i % 3], (rnd() - 0.5) * 30, 0.7, -2 - rnd() * 14));
  } else if (b === "farm") {
    for (let r = 0; r < 8; r++) g.add(mk(B(40, 0.05, 1.1), "#7a5226", -2, 0.01, -6 - r * 1.6));
    for (let r = 0; r < 8; r++) for (let i = 0; i < 18; i++) g.add(mk(cone(0.15, 0.5, 5), se === "winter" ? "#e8f1f7" : se === "autumn" ? "#d9a441" : "#3fa04a", -16 + i * 1.9 + rnd() * 0.3, 0.3, -6 - r * 1.6));
    g.add(mk(B(5, 3, 4), "#b3262e", 14, 1.5, -12), mk(cone(3.9, 2, 4), "#7a4b24", 14, 4, -12, 1, 1, 0.8, 0, Math.PI / 4), mk(C(0.9, 0.9, 5.5, 14), "#d9d2c2", 20, 2.7, -12), mk(S(0.9, 12, 8), "#c9c2b2", 20, 5.6, -12));   // barn and silo
    for (let i = 0; i < 24; i++) g.add(mk(B(0.08, 0.9, 0.08), "#8a5a2b", -20 + i * 1.8, 0.45, -1.6), mk(B(1.8, 0.08, 0.06), "#8a5a2b", -19.1 + i * 1.8, 0.7, -1.6));   // fence
    for (let i = 0; i < 6; i++) treeAt(g, (rnd() - 0.5) * 60, -22 - rnd() * 20, 1.2, se);
  }
  if (b === "forest") for (let i = 0; i < 70; i++) { const x = (rnd() - 0.5) * 80, z = -5 - rnd() * 55; if (Math.abs(x) < 3 && z > -9) continue; treeAt(g, x, z, 1 + rnd() * 0.7, se, i % 4 === 0); }
  if (se === "spring" && b !== "desert") for (let i = 0; i < 40; i++) g.add(mk(S(0.1, 6, 5), ["#ff7aa8", "#ffe14d", "#ffffff"][i % 3], (rnd() - 0.5) * 24, 0.12, -1 + rnd() * 14));
  if (se === "autumn" && b !== "desert") for (let i = 0; i < 60; i++) g.add(mk(B(0.18, 0.02, 0.14), ["#d9822b", "#b3402a", "#e6b422"][i % 3], (rnd() - 0.5) * 30, 0.02, -2 + rnd() * 14, 1, 1, 1, 0, rnd() * 3));
  return g;
};
export const waveBob = (g: THREE.Object3D, t: number) => {
  (g.userData.waves as THREE.Mesh[] | undefined)?.forEach((w, i) => { w.position.y = -0.55 + 0.07 * Math.sin(t * 1.6 + i * 1.7); w.position.x += 0.004 * Math.sin(t + i); });
  g.traverse(o=>{const w=o.userData.waterSurface as {baseY:number;phase:number}|undefined;if(!w||!(o instanceof THREE.Mesh))return;const geo=o.geometry as THREE.BufferGeometry,pa=geo.attributes.position as THREE.BufferAttribute;if(!geo.userData.basePositions)geo.userData.basePositions=(pa.array as Float32Array).slice();const base=geo.userData.basePositions as Float32Array;for(let i=0;i<pa.count;i++){const x=base[i*3],z=base[i*3+2];pa.setY(i,w.baseY+Math.sin(x*.035+t*1.2+w.phase)*.22+Math.cos(z*.04-t*.8)*.14);}pa.needsUpdate=true;geo.computeVertexNormals();});
};
