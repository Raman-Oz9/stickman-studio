// The REALM: one big connected world (town in the middle, roads out to the palace, farm, forest, desert, harbor + sea, swamp, jungle,
// savanna, ice, mountains with a gold mine and a cave). A scene sets `loc`; the whole realm slides so that location sits at the origin
// (all scene coordinates stay local), neighbours are visible in the distance, and `fly` scenes glide the camera between locations.
import * as THREE from "three";
import { twoTone } from "../bridge/shade";
import { mk, B, C, S, cone, grp } from "./props3d";
import { buildBiome, GROUNDC, Biome, Season } from "./terrain";

export const LOCS: Record<string, [number, number]> = {
  town: [0, 0], palace: [0, -430], farm: [-300, 90], forest: [-380, -250], desert: [0, 620], savanna: [420, 470], swamp: [-430, 390], jungle: [-660, 140],
  ice: [-700, -720], ocean: [640, 40], city: [380, -420], mountain: [0, -950], mine: [230, -900], cave: [-230, -900],
};
export const LOCALIAS: Record<string, string> = { babylon: "desert", egypt: "desert", persia: "desert", arabia: "desert", nile: "desert", india: "mountain", himalaya: "mountain", alps: "mountain", rome: "town", athens: "town", greece: "town", ocean: "ocean", atlantic: "ocean", pacific: "ocean", indianocean: "ocean", southernocean: "ocean", metropolis: "city", downtown: "city", skyline: "city", skyscraper: "city", skyscrapers: "city", urban: "city", cityscape: "city", harbor: "ocean", harbour: "ocean", sea: "ocean", coast: "ocean", dock: "ocean", lake: "ocean", beach: "ocean", castle: "palace", kingdom: "palace", mountains: "mountain", hills: "mountain", peak: "mountain", arctic: "ice", polar: "ice", glacier: "ice", tundra: "ice", sahara: "desert", dunes: "desert", woods: "forest", forest: "forest", marsh: "swamp", wetland: "swamp", plains: "savanna", steppe: "savanna", plain: "savanna", rainforest: "jungle", field: "farm", fields: "farm", village: "town", market: "town", street: "town" };
export const resolveLoc = (s: { loc?: string; biome?: string }): string => { const k = String(s.loc ?? s.biome ?? "town").toLowerCase().replace(/[^a-z]/g, ""); const a = LOCALIAS[k] ?? k; return LOCS[a] ? a : "town"; };
const KIND: Record<string, Biome | undefined> = { forest: "forest", desert: "desert", savanna: "savanna", swamp: "swamp", jungle: "jungle", ice: "ice", ocean: "ocean", farm: "farm", mountain: "mountain" };
const ROADS: [string, string][] = [["town", "palace"], ["town", "farm"], ["farm", "forest"], ["farm", "swamp"], ["farm", "jungle"], ["town", "desert"], ["desert", "savanna"], ["town", "ocean"], ["town", "city"], ["city", "ocean"], ["palace", "mountain"], ["mountain", "mine"], ["mountain", "cave"], ["forest", "ice"]];
const sm = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const lattice=(x:number,z:number,s:number)=>{const v=Math.sin(x*127.1+z*311.7+s*74.7)*43758.5453;return v-Math.floor(v);};
const valueNoise=(x:number,z:number,s:number)=>{const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),a=lattice(ix,iz,s),b=lattice(ix+1,iz,s),c=lattice(ix,iz+1,s),d=lattice(ix+1,iz+1,s);return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;};
const fbm=(x:number,z:number)=>valueNoise(x*.004,z*.004,1)*.55+valueNoise(x*.012,z*.012,2)*.3+valueNoise(x*.035,z*.035,3)*.15;
const segDist = (px: number, pz: number, a: number[], b: number[]) => { const dx = b[0] - a[0], dz = b[1] - a[1], k = Math.min(1, Math.max(0, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - a[0] - dx * k, pz - a[1] - dz * k); };
const roadD = (x: number, z: number) => { let d = 1e9; for (const [p, q] of ROADS) d = Math.min(d, segDist(x, z, LOCS[p], LOCS[q])); return d; };
const flatOf = (x: number, z: number) => { let f = 0; for (const k in LOCS) f = Math.max(f, 1 - sm(90, 170, Math.hypot(x - LOCS[k][0], z - LOCS[k][1]))); return Math.max(f, 1 - sm(10, 40, roadD(x, z))); };
const seaOf = (x: number, z: number) => sm(470, 560, x) * sm(-20, -50, z) * (1 - sm(-1100, -1000, z) * 0);   // sea fills the north-east, beyond the harbor
const heightAt = (x: number, z: number) => {
  const broad=fbm(x,z)-.5;
  const hill = 7 * (Math.sin(x * 0.006) * Math.cos(z * 0.007) + 0.5 * Math.sin(x * 0.017 + z * 0.013)) + 2.5 * Math.sin(x * 0.04) * Math.cos(z * 0.035) + broad*12 + Math.sin(x*.11+z*.08)*.55;
  const flat = flatOf(x, z), ridge = sm(700, 920, -z) * (38 + 30 * Math.abs(Math.sin(x * 0.011) * Math.cos(z * 0.013)) + 14 * Math.sin(x * 0.03 + z * 0.02));
  let h = (hill + ridge) * (1 - flat * (1 - sm(0.1, 0.9, ridge / 60) * 0)); h = hill * (1 - flat) + ridge * (1 - flat);
  const desertMask=sm(390,520,z)*(1-sm(120,260,Math.abs(x)));
  h += desertMask*(1-flat)*(5+4*Math.sin(x*.03+z*.012))*Math.max(0,Math.sin(x*.02+z*.02)+.3);
  h += desertMask*(1-flat)*(Math.sin(x*.075+z*.026)*1.9+Math.sin(x*.16+z*.05)*.45);
  const mountainMask=sm(650,820,-z)*(1-sm(180,340,Math.abs(x)));
  h += mountainMask*(1-flat)*(Math.pow(1-Math.abs(Math.sin(x*.013+z*.009)),2)*28+Math.abs(broad)*10);
  const sea = seaOf(x, z); return h * (1 - sea) - 9 * sea - 0.08;
};
const NOISE = (x: number, z: number) => 0.92 + 0.08 * Math.sin(x * 0.05) * Math.cos(z * 0.043) + 0.05 * Math.sin(x * 0.19 + z * 0.17);
const season = (c: THREE.Color, se: Season, h: number, b: boolean) => { if (se === "winter" && !b) c.lerp(new THREE.Color("#f4f8fc"), 0.85); else if (se === "autumn") c.lerp(new THREE.Color("#c99a3a"), 0.28); else if (se === "spring") c.lerp(new THREE.Color("#8fd16a"), 0.2); if (h > 34) c.lerp(new THREE.Color("#f4f8fc"), Math.min(1, (h - 34) / 14)); return c; };

const terrain = (se: Season) => {
  const N = 220, W = 3000, g = new THREE.PlaneGeometry(W, W, N, N); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), base = new THREE.Color("#6fb04c");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) - 100, z = pos.getZ(i) - 150; pos.setX(i, x); pos.setZ(i, z);
    const h = heightAt(x, z); pos.setY(i, h);
    let wsum = 0.1, r = base.r * 0.1, gg = base.g * 0.1, b = base.b * 0.1;
    for (const k in LOCS) { const kb = k === "town" ? undefined : KIND[k]; const c = new THREE.Color(kb ? GROUNDC[kb] : k === "palace" ? "#7fb85a" : k === "town" ? "#7fb85a" : "#79866a"); const d = Math.hypot(x - LOCS[k][0], z - LOCS[k][1]), w = Math.exp(-((d / 160) ** 2)); r += c.r * w; gg += c.g * w; b += c.b * w; wsum += w; }
    const c = season(new THREE.Color(r / wsum, gg / wsum, b / wsum), se, h, roadD(x, z) < 12 || false);
    const slope=Math.hypot(heightAt(x+4,z)-h,heightAt(x,z+4)-h)/4;
    if(slope>.28)c.lerp(new THREE.Color("#646d70"),Math.min(.68,(slope-.28)*1.4));
    if(Math.hypot(x-LOCS.mountain[0],z-LOCS.mountain[1])<240&&h>18)c.lerp(new THREE.Color("#edf3f6"),Math.min(.9,(h-18)/38));
    const rd = 1 - sm(7, 11, roadD(x, z)); if (rd > 0 && flatOf(x, z) > 0.5 && h > -1) c.lerp(new THREE.Color("#b99a6a"), rd * 0.95);   // dirt roads painted into the terrain
    if (h < 0.25 && h > -2.2) c.lerp(new THREE.Color("#e8d9a8"), 0.8);            // beach
    if (h <= -2.2) c.set("#2a6fa0");
    const n = (0.78 + 0.22 * (0.5 + 0.5 * Math.sin(x * 0.045 + Math.sin(z * 0.03) * 2) * Math.cos(z * 0.05 + Math.sin(x * 0.02) * 2)) + 0.05 * Math.sin(x * 0.31 + z * 0.27)) * 0.84; col[i * 3] = c.r * n; col[i * 3 + 1] = c.g * n; col[i * 3 + 2] = c.b * n;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, twoTone(new THREE.MeshLambertMaterial({ vertexColors: true }))); m.receiveShadow = true; return m;
};
const castle = () => {
  const g = new THREE.Group(), W = "#cfc7b8", Rr = "#b3262e";
  g.add(mk(B(150, 0.25, 40), "#b8ad98", 0, 0.05, 14));                                   // paved forecourt
  g.add(mk(B(110, 14, 3), W, 0, 7, 0), mk(B(40, 14, 3), W, -45, 7, 0), mk(B(40, 14, 3), W, 45, 7, 0));
  for (let i = -26; i <= 26; i++) g.add(mk(B(1.4, 1.6, 1.4), W, i * 2.1, 14.8, 0));       // battlements
  g.add(mk(B(14, 12, 3.6), "#2b1d14", 0, 6, 0.3), mk(C(7, 7, 3.6, 16), "#2b1d14", 0, 12, 0.3, 1, 1, 1, Math.PI / 2), mk(B(12, 10, 0.3), "#6b4a2a", 0, 5, 2.2));   // gate and doors
  for (const x of [-56, 56]) g.add(mk(C(6, 6.6, 28, 16), "#c3baa6", x, 14, 0), mk(cone(8, 11, 16), Rr, x, 33.5, 0));
  for (const x of [-22, 22]) g.add(mk(C(4.4, 4.8, 24, 14), "#c3baa6", x, 12, -2), mk(cone(6, 9, 14), Rr, x, 28.5, -2));
  g.add(mk(B(46, 36, 28), "#d4ccbb", 0, 18, -28), mk(cone(24, 14, 4), Rr, 0, 43, -28, 1, 1, 0.6, 0, Math.PI / 4));
  for (const x of [-16, 0, 16]) g.add(mk(C(3.2, 3.4, 40, 12), "#c9c0ad", x, 20, -44), mk(cone(4.6, 9, 12), Rr, x, 44.5, -44));
  for (const [x, h] of [[-22, 36], [22, 36], [0, 52]] as number[][]) g.add(mk(C(0.14, 0.14, 8, 6), "#3a2a1a", x, h + 4, -2), mk(B(0.1, 2.4, 4), "#e6c35a", x, h + 6, -0.2));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) g.add(mk(B(2, 3, 0.2), "#7aa7d6", -17 + c * 5, 10 + r * 6, -13.8));   // keep windows
  g.add(mk(B(150, 0.2, 9), "#2f86d6", 0, -0.3, 10), mk(B(14, 0.4, 10), "#6b4a2a", 0, 0.05, 10));                              // moat and drawbridge
  for (let i = 0; i < 6; i++) g.add(mk(B(2, 3.4, 0.3), Rr, -20 + i * 8, 7.5, 1.7));                                             // banners
  return g;
};
const mineMouth = () => grp(mk(new THREE.DodecahedronGeometry(1, 0), "#6a6070", 0, 12, -18, 34, 24, 12), mk(B(9, 9, 6), "#14100c", 0, 4.5, 2), mk(B(1, 10, 1.4), "#7a4b24", -5, 5, 2.4), mk(B(1, 10, 1.4), "#7a4b24", 5, 5, 2.4), mk(B(12, 1.2, 1.4), "#8a5a2b", 0, 10, 2.4),
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => mk(B(2.4, 0.12, 0.35), "#6b4630", 0, 0.08, 6 + i * 1.6)), mk(B(0.14, 0.14, 24), "#6b6b75", -0.9, 0.12, 12), mk(B(0.14, 0.14, 24), "#6b6b75", 0.9, 0.12, 12), mk(S(1.2, 10, 8), "#f5c32c", 8, 0.6, 5, 1.4, 0.7, 1));
const caveMouth = () => { const g = grp(mk(new THREE.DodecahedronGeometry(1, 0), "#5a526a", 0, 12, -18, 34, 24, 12), mk(C(6, 6, 0.3, 20), "#0c0a10", 0, 5, 2, 1, 1, 1, Math.PI / 2), mk(S(6, 14, 10), "#0c0a10", 0, 5, 1.2, 1, 1.15, 0.35)); for (let i = 0; i < 9; i++) g.add(mk(cone(0.5, 2.4, 6), "#4a4256", -5 + i * 1.25, 9.6, 2.3, 1, 1, 1, Math.PI)); for (let i = 0; i < 6; i++) g.add(mk(cone(0.5, 2 + (i % 3), 6), ["#6ee7ff", "#c77dff", "#ffd166"][i % 3], -8 + i * 3.2, 1, 6)); return g; };

const winTex = (seed: number) => { const c = document.createElement("canvas"); c.width = 64; c.height = 128; const g = c.getContext("2d")!; g.fillStyle = "#3a4660"; g.fillRect(0, 0, 64, 128); let r = seed; const rn = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { g.fillStyle = rn() < 0.14 ? "#fff1b8" : rn() < 0.6 ? "#8fc4ee" : "#4a6fa0"; g.fillRect(x * 8 + 1, y * 8 + 1, 6, 5); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; };
export const buildTown = (se: Season) => {
  const g = new THREE.Group();
  let sd = 137; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  g.add(mk(B(140, 0.08, 140), "#b8a88a", 0, 0.02, 0));
  g.add(mk(B(200, 0.06, 14), "#a69575", 0, 0.03, 0), mk(B(14, 0.06, 200), "#a69575", 0, 0.03, 0));
  g.add(
    mk(C(1.2, 1.4, 1.4, 12), "#8a8f9c", 0, 0.7, 0),
    mk(C(1.0, 1.0, 0.2, 12), "#2a6fa0", 0, 1.3, 0),
    mk(C(0.12, 0.12, 2.2, 8), "#6b3f1c", -0.9, 1.1, 0),
    mk(C(0.12, 0.12, 2.2, 8), "#6b3f1c", 0.9, 1.1, 0),
    mk(B(2.2, 0.12, 0.3), "#6b3f1c", 0, 2.1, 0),
    mk(C(0.25, 0.2, 0.4, 8), "#8a5a2b", 0, 1.2, 0)
  );
  const stallPositions = [[-14, -14], [14, -14], [-14, 14], [14, 14], [0, -18], [0, 18]];
  const canopyColors = ["#e23b3b", "#f5c32c", "#3a86ff", "#2a9d8f", "#9b5de5", "#f15bb5"];
  stallPositions.forEach(([x, z], idx) => {
    const cc = canopyColors[idx % canopyColors.length];
    g.add(
      mk(B(2.8, 1.1, 1.8), "#8a5a2b", x, 0.55, z),
      mk(C(0.06, 0.06, 2.2, 6), "#5a3b1e", x - 1.2, 1.1, z - 0.7),
      mk(C(0.06, 0.06, 2.2, 6), "#5a3b1e", x + 1.2, 1.1, z - 0.7),
      mk(C(0.06, 0.06, 2.2, 6), "#5a3b1e", x - 1.2, 1.1, z + 0.7),
      mk(C(0.06, 0.06, 2.2, 6), "#5a3b1e", x + 1.2, 1.1, z + 0.7),
      mk(B(3.0, 0.35, 2.0), cc, x, 2.3, z, 1, 1, 1, 0.15),
      mk(B(0.6, 0.4, 0.5), "#d9a15a", x - 0.5, 0.95, z),
      mk(B(0.5, 0.35, 0.5), "#f0c27a", x + 0.5, 0.92, z)
    );
  });
  const wallColors = ["#f0d9a8", "#e8dcc4", "#c8b99b", "#d2c4a8", "#bfa888", "#d8cda8"];
  const roofColors = ["#c0353a", "#7a4b24", "#5a3b2a", "#8a5a2b", "#4a5568", "#2b3a4a"];
  for (let k = 0; k < 16; k++) {
    const angle = (k / 16) * Math.PI * 2 + 0.15;
    const r = 26 + (k % 4) * 7;
    const hx = Math.sin(angle) * r, hz = Math.cos(angle) * r;
    const width = 4.2 + (k % 3) * 1.4, depth = 4.2 + ((k + 1) % 2) * 1.2, height = 5 + (k % 5) * 2.4;
    const wc = wallColors[k % wallColors.length];
    const rc = roofColors[k % roofColors.length];
    const roofType = k % 3;

    g.add(mk(B(width, height, depth), wc, hx, height / 2, hz, 1, 1, 1, 0, angle));
    if (roofType === 0) {
      g.add(mk(cone(Math.max(width, depth) * 0.7, 2.4, 4), rc, hx, height + 1.2, hz, 1, 1, 1, 0, angle + Math.PI / 4));
    } else if (roofType === 1) {
      g.add(mk(cone(Math.max(width, depth) * 0.65, 3.4, 8), rc, hx, height + 1.7, hz, 1, 1, 1, 0, angle));
    } else {
      g.add(
        mk(B(width + 0.2, 0.4, depth + 0.2), "#7a7a84", hx, height + 0.2, hz, 1, 1, 1, 0, angle),
        mk(B(1.4, 1.2, 1.4), "#6a6a74", hx, height + 0.8, hz)
      );
    }
    const chimX = hx + Math.sin(angle) * 0.8, chimZ = hz + Math.cos(angle) * 0.8;
    g.add(
      mk(B(0.6, 2.2, 0.6), "#7a4b24", chimX, height + 2.1, chimZ),
      mk(S(0.35, 8, 6), "#d8dce4", chimX, height + 3.4, chimZ, 1, 1.4, 1),
      mk(S(0.28, 8, 6), "#e2e6ed", chimX + 0.2, height + 4.0, chimZ + 0.1, 0.8, 1.2, 0.8)
    );
    g.add(
      mk(B(0.9, 1.8, 0.1), "#3a251c", hx, 0.9, hz + depth / 2 * Math.cos(angle)),
      mk(B(0.5, 0.6, 0.08), "#bfe6f5", hx - width * 0.3 * Math.sin(angle), height * 0.6, hz),
      mk(B(width + 0.4, 0.8, 0.15), "#8a5a2b", hx, 0.4, hz + depth / 2 * Math.cos(angle) + 0.8)
    );
  }
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const rx = Math.sin(a) * 19, rz = Math.cos(a) * 19;
    g.add(
      mk(C(0.1, 0.1, 4.5, 6), "#2a2a30", rx, 2.25, rz),
      mk(S(0.35, 8, 6), "#ffe9a8", rx, 4.6, rz)
    );
    if (i % 2 === 0) {
      g.add(
        mk(C(0.4, 0.4, 0.8, 12), "#8a5a2b", rx * 0.8, 0.4, rz * 0.8),
        mk(B(0.6, 0.6, 0.6), "#6b4a2b", rx * 0.85 + 0.6, 0.3, rz * 0.85)
      );
    }
  }
  return g;
};
export const buildCity = () => {
  const g = new THREE.Group(); const tex = [1, 2, 3, 4].map((i) => winTex(i * 7919)); let sd = 31; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  g.add(mk(B(300, 0.3, 300), "#4a4d57", 0, 0.02, 0));                                                                          // asphalt
  for (const o of [-50, 0, 50]) { g.add(mk(B(300, 0.05, 1.2), "#e8e0b0", 0, 0.2, o + 25), mk(B(1.2, 0.05, 300), "#e8e0b0", o + 25, 0.2, 0)); }   // lane marks
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
    const cx = -125 + i * 50 + (i > 2 ? 0 : 0), cz = -125 + j * 50; if (Math.hypot(cx, cz) < 48) continue;
    const h = 24 + rnd() * 70 * (1 - Math.hypot(cx, cz) / 260) + (i === 2 && j === 2 ? 50 : 0), w = 14 + rnd() * 8, d = 14 + rnd() * 8, k = Math.floor(rnd() * 4);
    const t = tex[k].clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 8)));
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ map: t, color: ["#ffffff", "#cfe0ff", "#ffe6cf", "#dfe6ee"][k] })); m.position.set(cx, h / 2, cz); m.castShadow = m.receiveShadow = true; g.add(m);
    g.add(mk(B(w + 0.6, 0.8, d + 0.6), ["#8d93a1", "#a9a39a", "#6f7a8c"][k % 3], cx, h + 0.4, cz), mk(B(w * 0.4, 3, d * 0.4), "#7b8190", cx, h + 2.3, cz));   // roof slab + plant
    if (rnd() < 0.4) g.add(mk(C(0.15, 0.15, 9, 6), "#c9ccd4", cx + w * 0.25, h + 5, cz), mk(S(0.5, 8, 6), "#ff3b30", cx + w * 0.25, h + 9.5, cz));        // antenna + light
    g.add(mk(B(w * 0.3, 3.2, 0.5), "#1b2434", cx, 1.6, cz + d / 2 + 0.2));                                                                         // entrance
  }
  for (let i = 0; i < 40; i++) { const lane = rnd() < 0.5, o = [-25, 25, 75, -75][Math.floor(rnd() * 4)] + (rnd() - 0.5) * 3, a = (rnd() - 0.5) * 270, col = ["#e63946", "#f1c40f", "#3a86ff", "#ffffff", "#2a9d8f"][Math.floor(rnd() * 5)];
    g.add(grp(mk(B(2.2, 0.9, 4.4), col, 0, 0.65, 0), mk(B(1.8, 0.7, 2.2), "#cfe8f7", 0, 1.35, -0.2)).translateX(lane ? o : a).translateZ(lane ? a : o).rotateY(lane ? 0 : Math.PI / 2)); }                      // parked / traffic cars
  for (let i = 0; i < 24; i++) { const x = -135 + (i % 6) * 54, z = -135 + Math.floor(i / 6) * 54 + 25; g.add(mk(C(0.12, 0.12, 6, 6), "#3b3f48", x, 3, z), mk(S(0.45, 8, 6), "#ffe9a8", x, 6.1, z)); }       // street lights
  return g;
};
const dockStuff = () => grp(mk(B(14, 0.3, 40), "#8a5a2b", 0, -0.12, -22), ...Array.from({ length: 30 }, (_, i) => mk(B(14, 0.02, 0.1), "#6b3f1c", 0, 0.05, -2 - i * 1.3)), ...Array.from({ length: 8 }, (_, i) => mk(C(0.25, 0.25, 3, 8), "#5a3b1e", i % 2 ? 7 : -7, -1, -4 - Math.floor(i / 2) * 9)));

export const buildRealm = (se: Season) => {
  const R = new THREE.Group(); R.add(terrain(se));
  const waterGeo=new THREE.PlaneGeometry(1800,1500,48,40);waterGeo.rotateX(-Math.PI/2);
  const waterPos=waterGeo.attributes.position,waterCol=new Float32Array(waterPos.count*3);
  for(let i=0;i<waterPos.count;i++){const z=waterPos.getZ(i),c=new THREE.Color("#0b3c60").lerp(new THREE.Color("#367fa0"),(z+750)/1500*.45+.2);waterCol[i*3]=c.r;waterCol[i*3+1]=c.g;waterCol[i*3+2]=c.b;}
  waterGeo.setAttribute("color",new THREE.BufferAttribute(waterCol,3));waterGeo.computeVertexNormals();
  const water=new THREE.Mesh(waterGeo,new THREE.MeshPhongMaterial({color:"#ffffff",vertexColors:true,specular:"#9bd7e4",shininess:72}));water.position.set(1480,0,-520);water.userData.waterSurface={baseY:-1.6,phase:.6};water.receiveShadow=false;R.add(water);
  const waves: THREE.Mesh[] = []; let sd = 9; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) { const w = mk(B(8 + rnd() * 14, 0.2, 0.9), "#9ed3f7", 560 + rnd() * 900, -1.4, 0 - rnd() * 900); w.castShadow = false; waves.push(w); R.add(w); }
  R.userData.waves = waves;
  for (const k in KIND) { const b = KIND[k]!; if (k === "mountain" || k === "ocean") continue; const d = buildBiome(b, se, false); d.position.set(LOCS[k][0], 0, LOCS[k][1]); R.add(d); }
  const mt = buildBiome("mountain", se, false); mt.position.set(LOCS.mountain[0], 0, LOCS.mountain[1] + 40); mt.scale.set(1.5, 1.5, 1.5); R.add(mt);
  for(let i=0;i<7;i++){const x=-210+i*70,h=62+Math.sin(i*1.7)*12,r=34+(i%3)*5;R.add(mk(cone(r,h,7),i%2?"#737e84":"#626d73",LOCS.mountain[0]+x,h/2,LOCS.mountain[1]-145),mk(cone(r*.34,h*.28,7),"#edf4f7",LOCS.mountain[0]+x,h*.84,LOCS.mountain[1]-145));}
  const pyramidSpecs:[number,number,number,number][]=[[-82,40,34,-48],[0,62,50,-82],[88,88,68,-54]];
  for(const [px,ph,pw,pz] of pyramidSpecs){const py=new THREE.Group(),levels=6;for(let k=0;k<levels;k++){const f=1-k/levels,w=pw*f+.8,h=ph/levels;py.add(mk(B(w,h,w),k%2?"#d5b47c":"#e0c18a",0,k*h+h/2,0));}py.position.set(LOCS.desert[0]+px,0,LOCS.desert[1]+pz);py.rotation.y=Math.PI/4;R.add(py);}
  const sphinx=grp(mk(B(13,3.8,28),"#c8ad7d",0,1.9,0),mk(S(3.2,14,10),"#d2b889",0,4.7,9,1,1.15,1),mk(B(5.4,2.8,4.2),"#315477",0,4.3,7));sphinx.position.set(LOCS.desert[0]+12,0,LOCS.desert[1]+12);R.add(sphinx);
  const oc = buildBiome("ocean", se, false); oc.position.set(LOCS.ocean[0], 0, LOCS.ocean[1]); R.add(oc);
  const tw = buildTown(se); tw.name = "townPlaza"; tw.position.set(LOCS.town[0], 0, LOCS.town[1]); R.add(tw);
  const ct = buildCity(); ct.name = "modernCity"; ct.position.set(LOCS.city[0], 0, LOCS.city[1]); R.add(ct);
  const pc = castle(); pc.position.set(LOCS.palace[0], 0, LOCS.palace[1] - 28); R.add(pc);
  const mm = mineMouth(); mm.position.set(LOCS.mine[0], 0, LOCS.mine[1] - 14); R.add(mm);
  const cm = caveMouth(); cm.position.set(LOCS.cave[0], 0, LOCS.cave[1] - 14); R.add(cm);
  for (const [lx, lz] of [[-60, -240], [90, -520], [-110, 260], [260, 240], [-250, 20]]) { for (let i = 0; i < 14; i++) { const x = lx + (rnd() - 0.5) * 140, z = lz + (rnd() - 0.5) * 140; if (flatOf(x, z) > 0.98 || seaOf(x, z) > 0.2 || Math.hypot(x-LOCS.mountain[0],z-LOCS.mountain[1])<240) continue; const y = heightAt(x, z); R.add(mk(C(0.4, 0.6, 5, 7), "#6b4a2a", x, y + 2.5, z), mk(S(3, 9, 7), se === "autumn" ? "#e0832a" : se === "winter" ? "#e8f1f7" : "#3f9f3f", x, y + 6.5, z)); } }
  return R;
};
export const realmWaves = (R: THREE.Object3D, t: number) => {
  (R.userData.waves as THREE.Mesh[] | undefined)?.forEach((w, i) => { w.position.y = -1.4 + 0.12 * Math.sin(t * 1.4 + i * 1.3); w.position.x += 0.01 * Math.sin(t * 0.7 + i); });
  R.traverse(o=>{const w=o.userData.waterSurface as {baseY:number;phase:number}|undefined;if(!w||!(o instanceof THREE.Mesh))return;const geo=o.geometry as THREE.BufferGeometry,pa=geo.attributes.position as THREE.BufferAttribute;if(!geo.userData.basePositions)geo.userData.basePositions=(pa.array as Float32Array).slice();const base=geo.userData.basePositions as Float32Array;for(let i=0;i<pa.count;i++){const x=base[i*3],z=base[i*3+2];pa.setY(i,w.baseY+Math.sin(x*.035+t*1.15+w.phase)*.2+Math.cos(z*.04-t*.85)*.13);}pa.needsUpdate=true;geo.computeVertexNormals();});
};
export const anchorAt = (a: string, b: string | undefined, u: number): [number, number] => { const A = LOCS[a] ?? LOCS.town, B2 = b ? LOCS[b] ?? A : A, k = u * u * (3 - 2 * u); return [A[0] + (B2[0] - A[0]) * k, A[1] + (B2[1] - A[1]) * k]; };
