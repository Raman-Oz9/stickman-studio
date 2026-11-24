// The REALM: one big connected world (town in the middle, roads out to the palace, farm, forest, desert, harbor + sea, swamp, jungle,
// savanna, ice, mountains with a gold mine and a cave). A scene sets `loc`; the whole realm slides so that location sits at the origin
// (all scene coordinates stay local), neighbours are visible in the distance, and `fly` scenes glide the camera between locations.
import { TEX, texMat } from "./texcache";
import * as THREE from "three";
import { twoTone } from "../bridge/shade";
import { mk, mkTex, B, C, S, cone, grp } from "./props3d";
import { buildBiome, GROUNDC, Biome, Season } from "./terrain";

// Textured box helper: applies a real tiled PBR texture (wall plaster / roof tiles / wood / cobble) tinted by `col`,
// with its own repeat counts so large surfaces carry detail instead of reading as flat colour.
const tbox = (g: THREE.BufferGeometry, texName: string, col: string, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, ru = 1, rv = 1) =>
  mkTex(g, texName, col, x, y, z, sx, sy, sz, rx, ry, rz, ru, rv);

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
export const heightAt = (x: number, z: number) => {
  const broad=fbm(x,z)-.5;
  const hill = 7 * (Math.sin(x * 0.006) * Math.cos(z * 0.007) + 0.5 * Math.sin(x * 0.017 + z * 0.013)) + 2.5 * Math.sin(x * 0.04) * Math.cos(z * 0.035) + broad*12 + Math.sin(x*.11+z*.08)*.55;
  const flat = flatOf(x, z), ridge = sm(700, 920, -z) * (38 + 30 * Math.abs(Math.sin(x * 0.011) * Math.cos(z * 0.013)) + 14 * Math.sin(x * 0.03 + z * 0.02));
  let h = (hill + ridge) * (1 - flat * (1 - sm(0.1, 0.9, ridge / 60) * 0)); h = hill * (1 - flat) + ridge * (1 - flat);
  const desertMask=sm(390,520,z)*(1-sm(120,260,Math.abs(x)));
  h += desertMask*(1-flat)*(5+4*Math.sin(x*.03+z*.012))*Math.max(0,Math.sin(x*.02+z*.02)+.3);
  h += desertMask*(1-flat)*(Math.sin(x*.075+z*.026)*1.9+Math.sin(x*.16+z*.05)*.45);
  const mountainMask=sm(650,820,-z)*(1-sm(180,340,Math.abs(x)));
  h += mountainMask*(1-flat)*(Math.pow(1-Math.abs(Math.sin(x*.013+z*.009)),2)*28+Math.abs(broad)*10);
  const sea = seaOf(x, z);
  let townSink = 0;
  for (const k in LOCS) {
    const d = Math.hypot(x - LOCS[k][0], z - LOCS[k][1]);
    if (d < 80) townSink = Math.max(townSink, (1 - sm(0, 80, d)) * 0.25);
  }
  return (h * (1 - sea) - 9 * sea - 0.08) - townSink;
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
  g.add(tbox(B(150, 0.25, 40), "cobblestone", "#b8ad98", 0, 0.05, 14, 1, 1, 1, 0, 0, 0, 10, 4));   // paved forecourt w/ cobbles
  g.add(tbox(B(110, 14, 3), "limestone", W, 0, 7, 0, 1, 1, 1, 0, 0, 0, 10, 2), tbox(B(40, 14, 3), "limestone", W, -45, 7, 0, 1, 1, 1, 0, 0, 0, 4, 2), tbox(B(40, 14, 3), "limestone", W, 45, 7, 0, 1, 1, 1, 0, 0, 0, 4, 2));
  for (let i = -26; i <= 26; i++) g.add(mk(B(1.4, 1.6, 1.4), W, i * 2.1, 14.8, 0));       // battlements
  g.add(mk(B(14, 12, 3.6), "#2b1d14", 0, 6, 0.3), mk(C(7, 7, 3.6, 16), "#2b1d14", 0, 12, 0.3, 1, 1, 1, Math.PI / 2), mk(B(12, 10, 0.3), "#6b4a2a", 0, 5, 2.2));   // gate and doors
  for (const x of [-56, 56]) g.add(tbox(C(6, 6.6, 28, 16), "limestone", "#c3baa6", x, 14, 0, 1, 1, 1, 0, 0, 0, 3, 4), mk(cone(8, 11, 16), Rr, x, 33.5, 0));
  for (const x of [-22, 22]) g.add(tbox(C(4.4, 4.8, 24, 14), "limestone", "#c3baa6", x, 12, -2, 1, 1, 1, 0, 0, 0, 3, 4), mk(cone(6, 9, 14), Rr, x, 28.5, -2));
  g.add(tbox(B(46, 36, 28), "limestone", "#d4ccbb", 0, 18, -28, 1, 1, 1, 0, 0, 0, 8, 5), mk(cone(24, 14, 4), Rr, 0, 43, -28, 1, 1, 0.6, 0, Math.PI / 4));
  for (const x of [-16, 0, 16]) g.add(tbox(C(3.2, 3.4, 40, 12), "limestone", "#c9c0ad", x, 20, -44, 1, 1, 1, 0, 0, 0, 2, 5), mk(cone(4.6, 9, 12), Rr, x, 44.5, -44));
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
  const cobMat = new THREE.MeshLambertMaterial({ color: "#ffffff", flatShading: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  if (TEX.cobblestone) {
    const ct = TEX.cobblestone.clone();
    ct.needsUpdate = true;
    ct.repeat.set(28, 28);
    cobMat.map = ct;
  }
  const grassMat = new THREE.MeshLambertMaterial({ color: "#ffffff", flatShading: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  if (TEX.grass) {
    const gt = TEX.grass.clone();
    gt.needsUpdate = true;
    gt.repeat.set(32, 6);
    grassMat.map = gt;
  }
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(140, 0.08, 140), cobMat);
  floorMesh.position.set(0, 0.04, 0);
  floorMesh.receiveShadow = true;
  g.add(floorMesh);
  const roadX = new THREE.Mesh(new THREE.BoxGeometry(200, 0.06, 16), grassMat);
  roadX.position.set(0, 0.06, 0);
  roadX.receiveShadow = true;
  const roadZ = new THREE.Mesh(new THREE.BoxGeometry(16, 0.06, 200), grassMat);
  roadZ.position.set(0, 0.06, 0);
  roadZ.receiveShadow = true;
  g.add(roadX, roadZ);
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

    g.add(tbox(B(width, height, depth), "limestone", wc, hx, height / 2, hz, 1, 1, 1, 0, angle, 0, 3, 3));   // wall plaster w/ texture
    if (roofType === 0) {
      g.add(tbox(cone(Math.max(width, depth) * 0.7, 2.4, 4), "roof_tiles", rc, hx, height + 1.2, hz, 1, 1, 1, 0, angle + Math.PI / 4, 0, 3, 3));
    } else if (roofType === 1) {
      g.add(tbox(cone(Math.max(width, depth) * 0.65, 3.4, 8), "roof_tiles", rc, hx, height + 1.7, hz, 1, 1, 1, 0, angle, 0, 3, 3));
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

const buildAncientCity = () => {
  const g = new THREE.Group(); let sd = 5; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const wall = ["#d9c39a", "#cdb487", "#e3d0a8", "#c8a97a"];
  for (let i = 0; i < 46; i++) { const a = r() * 6.283, d = 12 + r() * 70, x = Math.cos(a) * d, z = Math.sin(a) * d, w = 5 + r() * 5, h = 3.5 + r() * 4.5, col = wall[i % 4];
    g.add(mk(B(w, h, w * (0.8 + r() * 0.5)), col, x, h / 2, z, 1, 1, 1, 0, r() * 1.5));
    if (i % 4 === 0) g.add(mk(S(w * 0.5, 12, 8), "#b9663f", x, h, z, 1, 0.7, 1)); else g.add(mk(B(w + 0.6, 0.5, w + 0.6), "#a88a5c", x, h + 0.25, z, 1, 1, 1, 0, 0)); }
  for (let k = 0; k < 4; k++) g.add(mk(B(26 - k * 5, 3, 26 - k * 5), k % 2 ? "#c9a86a" : "#d8b97c", 0, 1.5 + k * 3, 0));
  g.add(mk(B(5, 3.4, 5), "#e6d3a3", 0, 13.7, 0));
  for (let i = 0; i < 4; i++) { const a = i * 1.5708 + 0.785; g.add(mk(C(2.6, 2.9, 15, 10), "#cdb487", Math.cos(a) * 92, 7.5, Math.sin(a) * 92), mk(cone(3.4, 3, 10), "#a8643c", Math.cos(a) * 92, 16.5, Math.sin(a) * 92)); }
  for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; g.add(mk(B(12, 7, 3), "#cbb184", Math.cos(a) * 92, 3.5, Math.sin(a) * 92, 1, 1, 1, 0, -a + 1.5708)); }
  for (let i = 0; i < 14; i++) { const a = r() * 6.283, d = 6 + r() * 60, x = Math.cos(a) * d, z = Math.sin(a) * d; g.add(mk(C(0.25, 0.3, 4.2, 6), "#7a5a33", x, 2.1, z), mk(S(1.8, 8, 6), "#3f8f45", x, 4.6, z, 1, 0.35, 1)); }
  return g;
};
const buildStoneAge = () => {
  const g = new THREE.Group();
  g.add(
    mk(new THREE.DodecahedronGeometry(6, 1), "#7a706b", -14, 3, -10, 1.4, 0.9, 1.2),
    mk(C(3.5, 4.2, 0.2, 12), "#1c1512", -14, 2.5, -4, 1, 1, 1, Math.PI / 2, 0, 0)
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, r = 18 + (i % 2) * 8;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (i % 2 === 0) {
      g.add(
        mk(C(2.2, 2.5, 2.2, 10), "#9a7852", x, 1.1, z),
        mk(cone(2.8, 2.0, 10), "#7a522c", x, 3.2, z)
      );
    } else {
      g.add(
        mk(cone(2.4, 3.2, 6), "#c9b084", x, 1.6, z, 1, 1, 1, 0, i),
        mk(C(0.08, 0.08, 3.2, 6), "#5a3b1e", x, 1.6, z)
      );
    }
  }
  g.add(
    mk(B(1.2, 0.2, 0.3), "#5a3b1e", 0, 0.1, 0, 1, 1, 1, 0, 0, 0),
    mk(B(1.2, 0.2, 0.3), "#5a3b1e", 0, 0.1, 0, 1, 1, 1, 0, Math.PI / 3, 0),
    mk(cone(0.5, 1.2, 8), "#f06a1e", 0, 0.6, 0),
    mk(cone(0.3, 0.8, 8), "#ffd23a", 0, 0.5, 0)
  );
  return g;
};

const buildEgyptArchitecture = () => {
  const g = new THREE.Group();
  g.add(
    mk(B(22, 0.4, 18), "#e3d0a8", 0, 0.2, 0),
    mk(B(16, 6, 12), "#d9c39a", 0, 3.2, 0),
    mk(B(18, 7, 2), "#cdb487", 0, 3.5, 7)
  );
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      g.add(
        mk(C(0.7, 0.85, 6, 14), "#e8d8b0", i * 5, 3, j * 4),
        mk(B(1.8, 0.4, 1.8), "#d9c39a", i * 5, 6.2, j * 4)
      );
    }
  }
  for (const x of [-12, 12]) {
    g.add(
      mk(C(0.35, 0.5, 12, 4), "#d8c292", x, 6, -6, 1, 1, 1, 0, Math.PI / 4),
      mk(cone(0.38, 2.0, 4), "#f5c32c", x, 13, -6, 1, 1, 1, 0, Math.PI / 4)
    );
  }
  return g;
};

const buildGreekArchitecture = () => {
  const g = new THREE.Group();
  g.add(
    mk(B(20, 0.5, 12), "#f4f0e6", 0, 0.25, 0),
    mk(B(18, 0.4, 10), "#eee8dc", 0, 0.7, 0),
    mk(B(16, 0.4, 8), "#e8e2d0", 0, 1.1, 0),
    mk(B(14, 4.5, 6), "#dfd6be", 0, 3.5, 0)
  );
  for (let i = -6; i <= 6; i += 2) {
    g.add(mk(C(0.35, 0.38, 4.5, 14), "#f4f0e6", i, 3.2, 3.2));
    g.add(mk(C(0.35, 0.38, 4.5, 14), "#f4f0e6", i, 3.2, -3.2));
  }
  for (let j = -2; j <= 2; j += 2) {
    if (j !== 0) g.add(mk(C(0.35, 0.38, 4.5, 14), "#f4f0e6", 7, 3.2, j));
    if (j !== 0) g.add(mk(C(0.35, 0.38, 4.5, 14), "#f4f0e6", -7, 3.2, j));
  }
  g.add(
    mk(B(15, 0.6, 7), "#c8b99b", 0, 5.7, 0),
    mk(new THREE.ConeGeometry(9, 2.2, 3), "#b8a688", 0, 7.1, 0, 1, 0.35, 1.6, 0, Math.PI / 2, 0)
  );
  return g;
};

const buildRomanArchitecture = () => {
  const g = new THREE.Group();
  g.add(mk(C(12, 13, 6, 24), "#d8c39a", 0, 3, 0));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.add(
      mk(B(1.8, 5.5, 1.2), "#cdb78a", Math.sin(a) * 11.5, 2.8, Math.cos(a) * 11.5, 1, 1, 1, 0, -a),
      mk(B(1.8, 5.5, 1.2), "#b9a275", Math.sin(a) * 8.5, 2.8, Math.cos(a) * 8.5, 1, 1, 1, 0, -a)
    );
  }
  g.add(mk(C(7.5, 7.5, 0.2, 20), "#c8b385", 0, 0.2, 0));
  return g;
};

const buildIslamicArchitecture = () => {
  const g = new THREE.Group();
  g.add(
    mk(B(18, 5, 14), "#f4f0e6", 0, 2.5, 0),
    mk(S(6, 16, 12), "#3a7bc8", 0, 5.5, 0, 1, 1.2, 1),
    mk(C(0.15, 0.15, 3, 8), "#f5c32c", 0, 7.4, 0)
  );
  for (const [mx, mz] of [[-10, -8], [10, -8]]) {
    g.add(
      mk(C(1.2, 1.4, 12, 12), "#f4f0e6", mx, 6, mz),
      mk(C(0.8, 1.0, 3, 12), "#3a7bc8", mx, 13.5, mz),
      mk(cone(1.1, 2.2, 10), "#2e8b57", mx, 15.6, mz),
      mk(C(0.1, 0.1, 1.8, 6), "#f5c32c", mx, 17.2, mz)
    );
  }
  g.add(mk(C(2.2, 2.2, 0.4, 12), "#2a4a7c", 0, 2.2, 7.1, 1, 1, 1, Math.PI / 2, 0, 0));
  return g;
};

const buildAsianArchitecture = () => {
  const g = new THREE.Group();
  const levels = 5;
  for (let k = 0; k < levels; k++) {
    const f = 1 - k * 0.12, w = 10 * f, h = 2.4;
    const y = k * 3.2 + 1.2;
    g.add(
      mk(B(w, h, w), "#b83a2b", 0, y, 0),
      mk(B(w + 1.6, 0.4, w + 1.6), "#2a2a34", 0, y + h / 2, 0),
      mk(B(w + 2.2, 0.2, 0.6), "#2a2a34", 0, y + h / 2 + 0.15, (w + 1.6) / 2),
      mk(B(w + 2.2, 0.2, 0.6), "#2a2a34", 0, y + h / 2 + 0.15, -(w + 1.6) / 2),
      mk(B(0.6, 0.2, w + 2.2), "#2a2a34", (w + 1.6) / 2, y + h / 2 + 0.15, 0),
      mk(B(0.6, 0.2, w + 2.2), "#2a2a34", -(w + 1.6) / 2, y + h / 2 + 0.15, 0)
    );
  }
  g.add(
    mk(C(0.3, 0.3, 3, 8), "#f5c32c", 0, levels * 3.2 + 1.2, 0),
    mk(cone(0.8, 1.5, 8), "#f5c32c", 0, levels * 3.2 + 2.8, 0)
  );
  return g;
};

const buildColonialArchitecture = () => {
  const g = new THREE.Group();
  for (let i = -1; i <= 1; i += 2) {
    const x = i * 9;
    g.add(
      mk(B(8, 5, 12), "#c8b088", x, 2.5, 0),
      mk(cone(7, 3, 4), "#5a3b2a", x, 6.5, 0, 1, 1, 1, 0, Math.PI / 4),
      mk(B(8, 0.3, 3), "#8a5a2b", x, 0.15, 7.5),
      mk(C(0.15, 0.15, 3, 8), "#f4f2ec", x - 3.2, 1.5, 8.5),
      mk(C(0.15, 0.15, 3, 8), "#f4f2ec", x + 3.2, 1.5, 8.5),
      mk(B(7.6, 0.3, 2.8), "#5a3b2a", x, 3.1, 7.5)
    );
  }
  for (let z = -14; z <= 14; z += 3) {
    g.add(mk(B(0.2, 3.2, 0.2), "#7a522c", -16, 1.6, z), mk(B(0.2, 3.2, 0.2), "#7a522c", 16, 1.6, z));
  }
  return g;
};

const buildIndustrialArchitecture = () => {
  const g = new THREE.Group();
  g.add(
    mk(B(16, 7, 20), "#b94a3f", 0, 3.5, 0),
    mk(B(17, 0.8, 21), "#3a3d45", 0, 7.4, 0)
  );
  for (const [cx, cz] of [[-6, -6], [6, -6]]) {
    g.add(
      mk(C(1.2, 1.5, 18, 12), "#8b3a2b", cx, 9, cz),
      mk(S(0.8, 10, 8), "#d8dce4", cx, 19, cz, 1, 1.6, 1),
      mk(S(0.6, 10, 8), "#e8eaf0", cx + 0.4, 21, cz + 0.2, 0.8, 1.4, 0.8)
    );
  }
  return g;
};

const buildFuturisticArchitecture = () => {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2, r = 12 + (i % 2) * 6;
    const x = Math.sin(angle) * r, z = Math.cos(angle) * r;
    const h = 25 + (i * 8);
    g.add(
      mk(C(1.2, 2.4, h, 18), "#8ea4c8", x, h / 2, z),
      mk(new THREE.TorusGeometry(2.2, 0.15, 8, 24), "#35c3e8", x, h * 0.7, z, 1, 1, 1, Math.PI / 2, 0, 0),
      mk(new THREE.TorusGeometry(1.8, 0.12, 8, 24), "#00f0ff", x, h * 0.4, z, 1, 1, 1, Math.PI / 2, 0, 0)
    );
  }
  g.add(
    mk(C(0.8, 3.5, 45, 20), "#c9ced8", 0, 22.5, 0),
    mk(C(8, 8, 0.6, 24), "#3a3d45", 0, 18, 0),
    mk(S(1.5, 12, 10), "#00f0ff", 0, 46, 0)
  );
  return g;
};

export const buildEraArchitecture = (era: string, se: Season) => {
  const e = era.toLowerCase();
  if (/stone|prehistoric|cave|primitive/i.test(e)) return buildStoneAge();
  if (/egypt|nile/i.test(e)) return buildEgyptArchitecture();
  if (/greek|athens|classical/i.test(e)) return buildGreekArchitecture();
  if (/roman|rome|colosseum/i.test(e)) return buildRomanArchitecture();
  if (/islamic|arabic|persia|babylon|arabia|ottoman|moorish/i.test(e)) return buildIslamicArchitecture();
  if (/china|chinese|asian|japan|japanese|dynasty|pagoda/i.test(e)) return buildAsianArchitecture();
  if (/colonial|pioneer|frontier|spanish|american/i.test(e)) return buildColonialArchitecture();
  if (/industrial|factory|victorian|steam|coal|1920s/i.test(e)) return buildIndustrialArchitecture();
  if (/future|futuristic|sci|space|cyber/i.test(e)) return buildFuturisticArchitecture();
  if (/modern|city|urban|skyscraper/i.test(e)) return buildCity();
  if (/medieval|castle|kingdom|knight/i.test(e)) return castle();
  return buildAncientCity();
};

export const buildRealm = (se: Season, era: string = "ancient") => {
  const R = new THREE.Group(); R.add(terrain(se));
  const waterGeo=new THREE.PlaneGeometry(1800,1500,48,40);waterGeo.rotateX(-Math.PI/2);
  const waterPos=waterGeo.attributes.position,waterCol=new Float32Array(waterPos.count*3);
  for(let i=0;i<waterPos.count;i++){const z=waterPos.getZ(i),c=new THREE.Color("#0b3c60").lerp(new THREE.Color("#367fa0"),(z+750)/1500*.45+.2);waterCol[i*3]=c.r;waterCol[i*3+1]=c.g;waterCol[i*3+2]=c.b;}
  waterGeo.setAttribute("color",new THREE.BufferAttribute(waterCol,3));waterGeo.computeVertexNormals();
  const wmat=new THREE.MeshPhongMaterial({color:"#ffffff",vertexColors:true,specular:"#9bd7e4",shininess:72});if(TEX.water_deep){const wt=TEX.water_deep.clone();wt.needsUpdate=true;wt.repeat.set(90,75);wmat.map=wt;}const water=new THREE.Mesh(waterGeo,wmat);water.position.set(1480,0,-520);water.userData.waterSurface={baseY:-1.6,phase:.6};water.receiveShadow=false;R.add(water);
  const waves: THREE.Mesh[] = []; let sd = 9; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) { const w = mk(B(8 + rnd() * 14, 0.2, 0.9), "#9ed3f7", 560 + rnd() * 900, -1.4, 0 - rnd() * 900); w.castShadow = false; waves.push(w); R.add(w); }
  R.userData.waves = waves;
  for (const k in KIND) { const b = KIND[k]!; if (k === "mountain" || k === "ocean") continue; const d = buildBiome(b, se, false); d.position.set(LOCS[k][0], 0, LOCS[k][1]); R.add(d); }
  const mt = buildBiome("mountain", se, false); mt.position.set(LOCS.mountain[0], 0, LOCS.mountain[1] + 40); mt.scale.set(1.5, 1.5, 1.5); R.add(mt);
  for(let i=0;i<7;i++){const x=-210+i*70,h=62+Math.sin(i*1.7)*12,r=34+(i%3)*5;R.add(mk(cone(r,h,7),i%2?"#737e84":"#626d73",LOCS.mountain[0]+x,h/2,LOCS.mountain[1]-145),mk(cone(r*.34,h*.28,7),"#edf4f7",LOCS.mountain[0]+x,h*.84,LOCS.mountain[1]-145));}
  const pyramidSpecs:[number,number,number,number][]=[[-82,40,34,-48],[0,62,50,-82],[88,88,68,-54]];
  for(const [px,ph,pw,pz] of pyramidSpecs){const py=new THREE.Group();py.add(mk(B(pw*1.12,1.2,pw*1.12),"#bfa070",0,.6,0),mk(cone(pw*.7071,ph,4),"#e3c78f",0,ph/2+1.2,0,1,1,1,0,Math.PI/4),mk(cone(pw*.7071*1.003,ph*.16,4),"#6f5a3a",0,ph*.08+1.2,0,1,1,1,0,Math.PI/4),mk(cone(pw*.7071*.1,ph*.1,4),"#e8c14a",0,ph+1.2-ph*.05,0,1,1,1,0,Math.PI/4));for(let k=1;k<=5;k++){const f=1-k/6.4;py.add(mk(cone(pw*.7071*f*1.004,ph*.012,4),"#cdb27a",0,1.2+ph*(1-f)*.99,0,1,1,1,0,Math.PI/4));}py.position.set(LOCS.desert[0]+px,0,LOCS.desert[1]+pz);R.add(py);}
  const sphinx=grp(mk(B(13,3.8,28),"#c8ad7d",0,1.9,0),mk(S(3.2,14,10),"#d2b889",0,4.7,9,1,1.15,1),mk(B(5.4,2.8,4.2),"#315477",0,4.3,7));sphinx.position.set(LOCS.desert[0]+12,0,LOCS.desert[1]+12);R.add(sphinx);

  const egyptTemple=()=>{const g=new THREE.Group(),st="#dcc392",st2="#c9ab72",blue="#2a6fb0",red="#b8452c",gold="#e0b441";
    for(const sx of [-1,1]){g.add(mk(B(11,24,9),st,sx*11,12,0),mk(B(12.4,1.6,10.4),st2,sx*11,24.6,0),mk(B(11.2,1.2,9.2),blue,sx*11,20.5,0.06),mk(B(11.2,.9,9.2),red,sx*11,18.9,0.06),mk(B(11.2,.9,9.2),gold,sx*11,17.7,0.06));
      g.add(mk(B(3.2,1.4,.3),"#2b1d12",sx*11,9,4.6),mk(B(.3,7,3),"#7b5a2c",sx*11-5.7,10,4.2));
      g.add(mk(cone(1.4,22,4),"#d9bf86",sx*24,11,10,1,1,1,0,Math.PI/4),mk(cone(.5,1.8,4),gold,sx*24,22.9,10,1,1,1,0,Math.PI/4));}
    g.add(mk(B(10,5,9),st,0,21.5,0),mk(B(8,0.8,9.4),gold,0,19,0),mk(B(8,13,.4),"#2b1d12",0,6.5,4.4));
    g.add(mk(B(46,.3,24),st2,0,.15,12));
    for(let i=0;i<8;i++){const x=-14+i*4;g.add(mk(C(1.05,1.25,10.5,12),i%2?"#e6cf9c":"#dcc392",x,6.8,14),mk(S(1.55,10,8),"#4c9a58",x,12.5,14,1,.7,1),mk(B(3.2,.7,3.2),st2,x,13.6,14),mk(B(2.8,.5,2.8),blue,x,3.0,14));}
    g.add(mk(B(46,1.2,5),st2,0,14.4,14));
    return g;};
  {const et=egyptTemple();et.position.set(LOCS.desert[0]-70,0,LOCS.desert[1]-14);R.add(et);}
  const oc = buildBiome("ocean", se, false); oc.position.set(LOCS.ocean[0], 0, LOCS.ocean[1]); R.add(oc);
  const tw = buildTown(se); tw.name = "townPlaza"; tw.position.set(LOCS.town[0], 0, LOCS.town[1]); R.add(tw);
  const arch = buildEraArchitecture(era, se); arch.name = "eraArchitecture"; arch.position.set(LOCS.city[0], 0, LOCS.city[1]); R.add(arch);
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
