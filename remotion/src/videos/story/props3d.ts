// Real 3D props for the story world: low-poly toon models built from three.js primitives (or Kenney GLBs where the pack has the
// thing), shaded with the same two-tone material as the town so they sit in the scene like Blender-rendered set pieces.
import * as THREE from "three";
import { twoTone } from "../bridge/shade";
import { kitClone, Kit } from "../bridge/build";
import { MORPH } from "../bridge/world";

const mats = new Map<string, THREE.Material>();
const M = (c: string) => { let m = mats.get(c); if (!m) { m = twoTone(new THREE.MeshLambertMaterial({ color: c })); mats.set(c, m); } return m; };
type G = THREE.BufferGeometry;
export const mk = (g: G, c: string, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
  const m = new THREE.Mesh(g, M(c)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz); m.castShadow = true; m.receiveShadow = true; return m;
};
export const S = (r: number, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h);
export const B = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
export const C = (rt: number, rb: number, h: number, n = 20) => new THREE.CylinderGeometry(rt, rb, h, n);
export const grp = (...c: THREE.Object3D[]) => { const g = new THREE.Group(); c.forEach((x) => g.add(x)); return g; };

const GOLD = "#f5c32c", GOLD2 = "#fbe27a", BROWN = "#8a5a2b", RED = "#e23b3b", GREEN = "#4aa84a", WHITE = "#fff6e6", ORANGE = "#f5a623";

// ---------------- procedural models (natural size, any scale: normalised later) ----------------
const coin = () => grp(mk(C(0.5, 0.5, 0.12, 28), GOLD, 0, 0, 0, 1, 1, 1, Math.PI / 2), mk(C(0.36, 0.36, 0.14, 28), GOLD2, 0, 0, 0, 1, 1, 1, Math.PI / 2));
const coinPile = () => { const g = new THREE.Group(); for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.22 * Math.sqrt(i); g.add(mk(C(0.3, 0.3, 0.07, 22), i % 2 ? GOLD : GOLD2, Math.cos(a) * r, 0.04 + Math.floor(i / 5) * 0.07, Math.sin(a) * r, 1, 1, 1, 0, 0, (i % 3 - 1) * 0.08)); } return g; };
const purse = (c = "#8c4a2b") => grp(mk(S(0.5), c, 0, 0.42, 0, 1, 0.85, 1), mk(C(0.2, 0.3, 0.2, 14), c, 0, 0.88, 0), mk(new THREE.TorusGeometry(0.2, 0.04, 8, 18), GOLD, 0, 0.98, 0, 1, 1, 1, Math.PI / 2), mk(S(0.12, 14, 10), GOLD, 0, 0.4, 0.46, 1, 1, 0.5));
const moneyBag = () => grp(mk(S(0.5), "#c9a36a", 0, 0.42, 0, 1, 0.95, 1), mk(C(0.14, 0.26, 0.3, 14), "#c9a36a", 0, 0.92, 0), mk(C(0.2, 0.16, 0.14, 14), "#a67c3e", 0, 1.1, 0), mk(S(0.16, 14, 10), GOLD, 0, 0.45, 0.46, 1, 1, 0.4));
const mango = () => grp(mk(S(0.5), ORANGE, 0, 0.5, 0, 0.82, 1, 0.78), mk(S(0.28, 14, 10), "#ee7b1e", 0.12, 0.42, 0.22, 0.8, 1.1, 0.5), mk(S(0.12, 10, 8), GREEN, 0.02, 1.02, 0, 1.8, 0.5, 0.9));
const apple = () => grp(mk(S(0.5), RED, 0, 0.45, 0, 1, 0.9, 1), mk(C(0.04, 0.04, 0.22, 8), BROWN, 0, 0.98, 0), mk(S(0.14, 10, 8), GREEN, 0.14, 1.02, 0, 1.8, 0.4, 0.9));
const seed = () => grp(mk(S(0.5, 16, 12), BROWN, 0, 0.3, 0, 0.55, 0.9, 0.5, 0, 0, -0.4), mk(S(0.2, 10, 8), "#a87a43", -0.05, 0.4, 0.14, 0.3, 0.7, 0.3, 0, 0, -0.4));
const egg = () => grp(mk(S(0.5, 18, 14), "#fbf3e0", 0, 0.55, 0, 0.78, 1.05, 0.78));
const chicken = () => grp(
  mk(S(0.5), WHITE, 0, 0.62, 0, 0.95, 0.85, 1.25),           // body
  mk(S(0.28), WHITE, 0, 1.12, 0.52),                         // head
  mk(new THREE.ConeGeometry(0.1, 0.3, 10), ORANGE, 0, 1.08, 0.82, 1, 1, 1, Math.PI / 2),   // beak
  mk(S(0.07, 8, 6), RED, 0, 1.46, 0.5), mk(S(0.08, 8, 6), RED, 0, 1.42, 0.62), mk(S(0.08, 8, 6), RED, 0, 1.4, 0.4), // comb
  mk(S(0.07, 8, 6), RED, 0, 0.92, 0.78, 0.8, 1.6, 0.8),      // wattle
  mk(S(0.045, 8, 6), "#222", 0.15, 1.18, 0.74), mk(S(0.045, 8, 6), "#222", -0.15, 1.18, 0.74),
  mk(S(0.3), "#f1dcb5", 0.46, 0.66, 0, 0.35, 0.8, 1.1), mk(S(0.3), "#f1dcb5", -0.46, 0.66, 0, 0.35, 0.8, 1.1),  // wings
  mk(new THREE.ConeGeometry(0.28, 0.55, 8), "#f1dcb5", 0, 0.86, -0.7, 1, 1, 0.5, -0.9),   // tail
  mk(C(0.03, 0.03, 0.34, 6), ORANGE, 0.16, 0.17, 0.05), mk(C(0.03, 0.03, 0.34, 6), ORANGE, -0.16, 0.17, 0.05),
  mk(B(0.2, 0.03, 0.26), ORANGE, 0.16, 0.02, 0.1), mk(B(0.2, 0.03, 0.26), ORANGE, -0.16, 0.02, 0.1));
const HOOF = "#3a2f2a";
const legG = (x: number, z: number, len: number, r: number, col: string, idx: number, hipY: number) => { const g = new THREE.Group(); g.position.set(x, hipY, z); g.userData.leg = idx; g.add(mk(C(r, r * 0.78, len, 8), col, 0, -len / 2, 0), mk(B(r * 2, r * 0.7, r * 2.6), HOOF, 0, -len, r * 0.45)); return g; };
type Q = { body: string; head?: string; belly?: string; L?: number; H?: number; legH?: number; legR?: number; neck?: number; headL?: number; ears?: "short" | "long" | "big" | "none"; earC?: string; tail?: "long" | "short" | "tuft" | "none"; mane?: string; spots?: string; snout?: string; horns?: string; antlers?: boolean; trunk?: boolean; humps?: number; fluff?: boolean; stripes?: string; tusks?: boolean };
/** articulated four-legged animal: forward +z, legs are pivot groups (userData.leg) the world swings while it moves */
const quad2 = (q: Q) => {
  const L = q.L ?? 1, H = q.H ?? 1, lh = (q.legH ?? 0.55) * H, lr = q.legR ?? 0.075, by = lh + 0.3 * H, head = q.head ?? q.body, g = new THREE.Group(), nk = q.neck ?? 0.35, hl = q.headL ?? 1;
  g.add(mk(S(0.5), q.body, 0, by, 0, 0.62, 0.6 * H, 1.25 * L));
  if (q.belly) g.add(mk(S(0.4), q.belly, 0, by - 0.12 * H, 0.05, 0.5, 0.35 * H, 1.0 * L));
  if (q.fluff) for (let i = 0; i < 9; i++) g.add(mk(S(0.28), q.body, Math.sin(i * 2.4) * 0.28, by + (i % 3) * 0.1 * H, (i / 8 - 0.5) * 1.1 * L, 1, 1, 1));
  if (q.humps) for (let i = 0; i < q.humps; i++) g.add(mk(S(0.3), q.body, 0, by + 0.42 * H, (i - (q.humps - 1) / 2) * 0.6 * L, 0.75, 1.0, 0.8));
  const hz = 0.62 * L + nk * 0.5, hy = by + 0.18 * H + nk * 0.7 * H;
  g.add(mk(C(0.16, 0.24, nk * 1.3 * H, 10), q.mane && !q.trunk ? q.body : q.body, 0, by + 0.1 * H + nk * 0.35 * H, 0.55 * L + nk * 0.2, 1, 1, 1, 0.55 * (nk > 0.5 ? 1 : 0.6)));
  g.add(mk(S(0.22 * hl ** 0.3), head, 0, hy, hz, 0.8, 0.85, 1.1 * hl), mk(S(0.12), q.snout ?? head, 0, hy - 0.05 * H, hz + 0.2 * hl, 0.9, 0.75, 1.1));
  g.add(mk(S(0.032, 8, 6), "#1a1a1e", 0.1, hy + 0.06, hz + 0.1 * hl), mk(S(0.032, 8, 6), "#1a1a1e", -0.1, hy + 0.06, hz + 0.1 * hl));
  const ew = q.ears === "long" ? [0.07, 0.42] : q.ears === "big" ? [0.3, 0.34] : [0.07, 0.17];
  if (q.ears !== "none") g.add(mk(S(1), q.earC ?? head, 0.11, hy + 0.2 * H, hz - 0.06, ew[0], ew[1], 0.06 + (q.ears === "big" ? 0.04 : 0)), mk(S(1), q.earC ?? head, -0.11, hy + 0.2 * H, hz - 0.06, ew[0], ew[1], 0.06 + (q.ears === "big" ? 0.04 : 0)));
  if (q.mane) { for (let i = 0; i < 6; i++) g.add(mk(S(0.1), q.mane, 0, by + 0.35 * H + nk * 0.7 * H * (1 - i / 6) + 0.15, 0.5 * L + nk * 0.28 - i * 0.05, 0.6, 1.2, 1.2)); if (q.tail !== "none") g.add(mk(S(0.14), q.mane, 0, hy + 0.14, hz - 0.1, 0.7, 0.8, 1)); }
  if (q.horns) g.add(mk(new THREE.ConeGeometry(0.05, 0.22, 6), q.horns, 0.14, hy + 0.2 * H, hz - 0.04, 1, 1, 1, 0, 0, -0.5), mk(new THREE.ConeGeometry(0.05, 0.22, 6), q.horns, -0.14, hy + 0.2 * H, hz - 0.04, 1, 1, 1, 0, 0, 0.5));
  if (q.antlers) for (const sg of [-1, 1]) { g.add(mk(C(0.025, 0.03, 0.5, 6), "#d9c9a0", sg * 0.12, hy + 0.4 * H, hz - 0.04, 1, 1, 1, 0, 0, -sg * 0.45)); g.add(mk(C(0.02, 0.025, 0.3, 6), "#d9c9a0", sg * 0.25, hy + 0.55 * H, hz - 0.04, 1, 1, 1, 0, 0, -sg * 0.9)); }
  if (q.trunk) { for (let i = 0; i < 4; i++) g.add(mk(C(0.11 - i * 0.015, 0.13 - i * 0.015, 0.3, 8), head, 0, hy - 0.08 - i * 0.2, hz + 0.28 + i * 0.07 + Math.max(0, i - 2) * 0.1, 1, 1, 1, -0.18 - i * 0.08)); }
  if (q.tusks) for (const sg of [-1, 1]) g.add(mk(new THREE.ConeGeometry(0.05, 0.5, 6), "#f4eed8", sg * 0.15, hy - 0.2, hz + 0.3, 1, 1, 1, 1.9, 0, sg * 0.2));
  if (q.spots) { g.add(mk(S(0.25), q.spots, 0.2, by + 0.05, 0.1 * L, 0.6, 0.8 * H, 1), mk(S(0.22), q.spots, -0.25, by, -0.3 * L, 0.6, 0.8 * H, 1)); }
  if (q.stripes) for (let i = 0; i < 5; i++) g.add(mk(B(0.64, 0.05, 0.08), q.stripes, 0, by + 0.2 * H, (i - 2) * 0.28 * L));
  if (q.tail !== "none") g.add(mk(C(0.04, q.tail === "long" ? 0.09 : 0.05, (q.tail === "short" ? 0.25 : 0.55) * H, 6), q.mane ?? q.body, 0, by + 0.1 * H, -0.62 * L, 1, 1, 1, 0.5));
  const lx = 0.2 * (q.trunk ? 1.4 : 1), lz = 0.42 * L;
  [[lx, lz, 0], [-lx, lz, 1], [lx, -lz, 3], [-lx, -lz, 2]].forEach(([x, z, i]) => g.add(legG(x, z, lh, lr * (q.trunk ? 1.8 : 1), q.body, i, lh + 0.02)));
  return g;
};
const horse = () => quad2({ body: "#8a5a2b", mane: "#2a1f1a", L: 1.25, H: 1.35, legH: 0.7, neck: 0.8, headL: 1.5, ears: "short", tail: "long", legR: 0.065, belly: "#9a6a3a" });
const horseWhite = () => quad2({ body: "#f1efe8", mane: "#d8d4c8", L: 1.25, H: 1.35, legH: 0.7, neck: 0.8, headL: 1.5, ears: "short", tail: "long", legR: 0.065 });
const donkey = () => quad2({ body: "#9a9aa2", L: 1.0, H: 1.0, legH: 0.55, neck: 0.45, headL: 1.3, ears: "long", tail: "tuft", snout: "#d8d8dc", mane: "#6a6a72" });
const camel = () => quad2({ body: "#c9a15a", L: 1.3, H: 1.4, legH: 0.8, neck: 1.0, headL: 1.2, ears: "short", tail: "short", humps: 2, legR: 0.07 });
const elephant = () => quad2({ body: "#9aa0ab", L: 1.2, H: 1.5, legH: 0.55, neck: 0.15, headL: 1.4, ears: "big", tail: "short", trunk: true, tusks: true, legR: 0.1 });
const lion = () => quad2({ body: "#d9a441", mane: "#7a4a1f", L: 1.0, H: 0.9, legH: 0.5, neck: 0.3, ears: "short", tail: "tuft", snout: "#e8c47a" });
const wolf = () => quad2({ body: "#7a7a84", L: 1.0, H: 0.95, legH: 0.55, neck: 0.3, headL: 1.3, ears: "short", tail: "long", snout: "#9a9aa4" });
const sheep = () => quad2({ body: "#f4f2ec", head: "#3a3a44", L: 0.8, H: 0.8, legH: 0.4, neck: 0.25, ears: "short", tail: "short", fluff: true });
const deer = () => quad2({ body: "#a8703a", L: 1.0, H: 1.15, legH: 0.75, neck: 0.65, ears: "short", tail: "short", antlers: true, legR: 0.045, belly: "#e8d4b0" });
const rabbit = () => quad2({ body: "#d8d4cc", L: 0.55, H: 0.55, legH: 0.25, neck: 0.12, ears: "long", tail: "short", legR: 0.06 });
const goat = () => quad2({ body: "#e8e4dc", L: 0.85, H: 0.85, legH: 0.5, neck: 0.3, ears: "short", tail: "short", horns: "#6b5a3a" });
const cow = () => quad2({ body: "#fff", spots: "#3a3a44", L: 1.15, H: 1.15, legH: 0.5, neck: 0.25, ears: "short", horns: "#f0e6c8", snout: "#f2b6c0", tail: "tuft" });
const dog = () => quad2({ body: "#c58a52", L: 0.9, H: 0.85, legH: 0.5, neck: 0.25, ears: "short", earC: "#8a5a2b", tail: "long", snout: "#e0b080" });
const cat = () => quad2({ body: "#9aa0a8", L: 0.8, H: 0.75, legH: 0.42, neck: 0.2, ears: "short", tail: "long", legR: 0.05 });
const pig = () => quad2({ body: "#f4b6c2", L: 0.95, H: 0.85, legH: 0.35, neck: 0.15, ears: "short", tail: "short", snout: "#f08aa0" });
const tiger = () => quad2({ body: "#e8832a", stripes: "#2a1f1a", L: 1.05, H: 0.95, legH: 0.5, neck: 0.3, ears: "short", tail: "long", snout: "#f4e8d0" });
const bear3 = () => quad2({ body: "#6b4a2f", L: 1.0, H: 1.1, legH: 0.45, neck: 0.15, ears: "short", tail: "none", legR: 0.12, snout: "#a07a50" });
const bird = (body: string, belly: string, beak: string, big = 1, long = false, crest?: string) => {
  const g = grp(mk(S(0.5), body, 0, 0.6, 0, 0.8, 0.9, 1.15), mk(S(0.3), belly, 0, 0.52, 0.2, 0.7, 0.7, 0.9), mk(S(0.25), body, 0, 1.08, 0.46), mk(new THREE.ConeGeometry(0.08, 0.28, 8), beak, 0, 1.04, 0.74, 1, 1, 1, Math.PI / 2), mk(S(0.035, 8, 6), "#111", 0.13, 1.14, 0.62), mk(S(0.035, 8, 6), "#111", -0.13, 1.14, 0.62), mk(new THREE.ConeGeometry(0.2, long ? 0.9 : 0.5, 8), crest ?? body, 0, 0.5, -0.8, 1, 1, 0.4, -1.2));
  if (crest) g.add(mk(S(0.1), crest, 0, 1.36, 0.42, 0.7, 1.6, 0.7));
  for (const sg of [-1, 1]) { const w = new THREE.Group(); w.position.set(sg * 0.38, 0.8, 0); w.userData.wing = sg; w.add(mk(S(0.5), crest ?? body, sg * 0.45 * big, 0, 0, 1.1 * big, 0.12, 0.7)); g.add(w); }
  g.add(mk(C(0.025, 0.025, 0.25, 6), beak, 0.12, 0.15, 0.05), mk(C(0.025, 0.025, 0.25, 6), beak, -0.12, 0.15, 0.05)); return g;
};
const parrot = () => bird("#d2362e", "#f0c84a", "#2a2a34", 0.9, true, "#2f6fb5");
const eagle = () => bird("#6b4a2f", "#f4f2ec", "#f0c84a", 1.8);
const duck = () => bird("#f4e8c0", "#fff6d8", "#f5a623", 0.8);
const owl = () => bird("#8a6a4a", "#d8c8a8", "#f0c84a", 0.9);
const penguin = () => grp(mk(S(0.5), "#2a2a34", 0, 0.6, 0, 0.75, 1.05, 0.7), mk(S(0.4), "#f4f2ec", 0, 0.55, 0.15, 0.7, 0.9, 0.5), mk(S(0.25), "#2a2a34", 0, 1.3, 0.05), mk(new THREE.ConeGeometry(0.07, 0.2, 8), "#f5a623", 0, 1.26, 0.3, 1, 1, 1, Math.PI / 2), mk(S(0.03, 8, 6), "#fff", 0.1, 1.34, 0.22), mk(S(0.03, 8, 6), "#fff", -0.1, 1.34, 0.22));
const shark = () => grp(mk(S(0.5), "#7a8a9a", 0, 0.5, 0, 0.55, 0.55, 1.9), mk(S(0.4), "#e8eef2", 0, 0.38, 0.1, 0.5, 0.3, 1.5), mk(new THREE.ConeGeometry(0.2, 0.6, 4), "#6a7a8a", 0, 1.0, -0.1, 0.5, 1, 1.3), mk(new THREE.ConeGeometry(0.3, 0.7, 4), "#6a7a8a", 0, 0.65, -1.0, 0.4, 1, 1.3, -0.7), mk(S(0.045, 8, 6), "#111", 0.2, 0.58, 0.7));
const whale = () => grp(mk(S(0.5), "#3a5f8a", 0, 0.55, 0, 0.8, 0.7, 1.9), mk(S(0.35), "#dfe8f0", 0, 0.38, 0.15, 0.6, 0.3, 1.4), mk(new THREE.ConeGeometry(0.4, 0.7, 4), "#34567c", 0, 0.8, -1.05, 1.8, 1, 0.3, -0.6), mk(S(0.045, 8, 6), "#fff", 0.38, 0.62, 0.7));
const snake = () => { const g = new THREE.Group(); for (let i = 0; i < 16; i++) g.add(mk(S(0.14 - i * 0.003, 10, 8), i % 2 ? "#4aa84a" : "#3a8f3a", Math.sin(i * 0.8) * 0.28, 0.12, (i - 8) * 0.2)); g.add(mk(S(0.16, 10, 8), "#3a8f3a", 0, 0.14, 1.75, 1, 0.8, 1.3), mk(S(0.03, 8, 6), "#e23b3b", 0.07, 0.2, 1.88)); return g; };
const frog = () => grp(mk(S(0.5), "#4aa84a", 0, 0.35, 0, 1, 0.65, 1.1), mk(S(0.16), "#fff", 0.2, 0.7, 0.35), mk(S(0.16), "#fff", -0.2, 0.7, 0.35), mk(S(0.07), "#111", 0.2, 0.72, 0.45), mk(S(0.07), "#111", -0.2, 0.72, 0.45));
const dragon = () => { const g = quad2({ body: "#3a9f5a", L: 1.3, H: 1.2, legH: 0.45, neck: 0.8, headL: 1.4, ears: "none", tail: "long", horns: "#f0e6c8", snout: "#4ab86a", belly: "#d8e8a0" });
  for (const sg of [-1, 1]) { const w = new THREE.Group(); w.position.set(sg * 0.3, 1.2, 0.0); w.userData.wing = sg; w.add(mk(new THREE.ConeGeometry(0.6, 1.5, 3), "#c0353a", sg * 0.75, 0.2, 0, 1, 1, 0.1, 0, 0, -sg * 1.57)); g.add(w); } return g; };
const withWheels = (g: THREE.Group, pts: [number, number][], r: number, w = 0.14) => { for (const [x, z] of pts) { const wh = new THREE.Group(); wh.position.set(x, r, z); wh.userData.wheel = r; wh.add(mk(C(r, r, w, 18), "#2a2a30", 0, 0, 0, 1, 1, 1, 0, 0, Math.PI / 2), mk(C(r * 0.55, r * 0.55, w + 0.02, 14), "#c9ccd2", 0, 0, 0, 1, 1, 1, 0, 0, Math.PI / 2), mk(B(r * 1.5, 0.03, 0.03), "#888", 0, 0, 0)); g.add(wh); } return g; };
const car = (col = "#d2362e") => withWheels(grp(mk(B(0.95, 0.42, 2.3), col, 0, 0.5, 0), mk(B(0.85, 0.34, 1.1), col, 0, 0.88, -0.1), mk(B(0.8, 0.28, 1.0), "#bfe6f5", 0, 0.9, -0.1), mk(S(0.09, 8, 6), "#fff6c0", 0.3, 0.55, 1.15), mk(S(0.09, 8, 6), "#fff6c0", -0.3, 0.55, 1.15), mk(B(0.9, 0.08, 0.06), "#2a2a30", 0, 0.38, 1.17)), [[0.5, 0.75], [-0.5, 0.75], [0.5, -0.75], [-0.5, -0.75]], 0.26);
const oldcar = () => withWheels(grp(mk(B(0.9, 0.5, 1.6), "#2a2a34", 0, 0.62, 0.15), mk(B(0.85, 0.2, 0.7), "#2a2a34", 0, 0.5, 1.15), mk(B(0.84, 0.7, 0.8), "#2a2a34", 0, 1.1, -0.25), mk(B(0.8, 0.4, 0.7), "#bfe6f5", 0, 1.15, -0.25), mk(B(0.1, 0.05, 1.8), "#8a6a3a", 0.5, 0.35, 0.2), mk(B(0.1, 0.05, 1.8), "#8a6a3a", -0.5, 0.35, 0.2), mk(S(0.1, 8, 6), "#fff6c0", 0.3, 0.7, 1.55), mk(S(0.1, 8, 6), "#fff6c0", -0.3, 0.7, 1.55)), [[0.5, 1.0], [-0.5, 1.0], [0.5, -0.7], [-0.5, -0.7]], 0.34, 0.12);
const policecar = () => { const g = car("#f4f2ec"); g.add(mk(B(0.9, 0.2, 2.0), "#24366b", 0, 0.45, 0), mk(B(0.5, 0.1, 0.18), "#e23b3b", 0.15, 1.12, -0.1), mk(B(0.3, 0.1, 0.18), "#2f6fd0", -0.2, 1.12, -0.1)); return g; };
const taxi = () => car("#f5c32c");
const truck = () => withWheels(grp(mk(B(1.0, 0.8, 0.9), "#2f5fb5", 0, 0.85, 1.05), mk(B(0.9, 0.4, 0.5), "#bfe6f5", 0, 1.2, 1.2), mk(B(1.1, 0.8, 1.9), "#e8e4dc", 0, 0.95, -0.6)), [[0.5, 1.1], [-0.5, 1.1], [0.5, -1.1], [-0.5, -1.1], [0.5, -0.3], [-0.5, -0.3]], 0.3);
const bus = () => withWheels(grp(mk(B(1.1, 1.2, 3.4), "#f5a623", 0, 0.95, 0), mk(B(1.12, 0.35, 3.0), "#bfe6f5", 0, 1.25, 0), mk(B(1.12, 0.1, 3.4), "#d2362e", 0, 0.5, 0)), [[0.55, 1.1], [-0.55, 1.1], [0.55, -1.1], [-0.55, -1.1]], 0.3);
const tractor = () => withWheels(grp(mk(B(0.8, 0.7, 1.5), "#2f9f5a", 0, 0.85, 0.5), mk(B(0.7, 0.8, 0.7), "#2f9f5a", 0, 1.4, -0.3), mk(C(0.06, 0.06, 0.6, 8), "#555", 0.2, 1.4, 1.1)), [[0.5, 0.9], [-0.5, 0.9]], 0.3);
const tractorBig = () => tractor();
const motorbike = () => withWheels(grp(mk(B(0.25, 0.3, 1.0), "#d2362e", 0, 0.7, 0), mk(B(0.2, 0.1, 0.6), "#2a2a30", 0, 0.92, -0.2), mk(C(0.03, 0.03, 0.6, 6), "#888", 0, 0.9, 0.6, 1, 1, 1, 0.3)), [[0, 0.6], [0, -0.6]], 0.3, 0.1);
const bicycle = () => withWheels(grp(mk(B(0.04, 0.04, 0.9), "#d2362e", 0, 0.55, 0, 1, 1, 1, 0.3), mk(B(0.04, 0.5, 0.04), "#d2362e", 0, 0.6, -0.2), mk(B(0.12, 0.04, 0.22), "#2a2a30", 0, 0.9, -0.3), mk(B(0.4, 0.03, 0.03), "#888", 0, 0.95, 0.4)), [[0, 0.5], [0, -0.5]], 0.32, 0.04);
const train = () => withWheels(grp(mk(C(0.5, 0.5, 2.0, 18), "#2a2a34", 0, 0.9, 0.3, 1, 1, 1, Math.PI / 2), mk(B(1.0, 1.3, 0.9), "#c0353a", 0, 1.2, -0.9), mk(C(0.14, 0.2, 0.5, 12), "#2a2a34", 0, 1.6, 1.0), mk(new THREE.ConeGeometry(0.5, 0.5, 4), "#555", 0, 0.35, 1.5, 1, 1, 1, Math.PI / 2, 0, 0), mk(B(1.1, 0.1, 1.0), "#f0c84a", 0, 1.9, -0.9), mk(B(1.0, 0.8, 1.7), "#c0353a", 0, 0.9, -2.2)), [[0.45, 0.8], [-0.45, 0.8], [0.45, 0.2], [-0.45, 0.2], [0.45, -0.9], [-0.45, -0.9]], 0.33);
const spin = (o: THREE.Object3D, axis: "x" | "y" | "z") => { o.userData.spin = axis; return o; };
const plane = () => { const g = grp(mk(C(0.3, 0.2, 3.2, 14), "#d8dce4", 0, 0.8, 0, 1, 1, 1, Math.PI / 2), mk(B(4.0, 0.08, 0.7), "#2f5fb5", 0, 0.8, 0.2), mk(B(1.4, 0.07, 0.5), "#2f5fb5", 0, 0.9, -1.4), mk(B(0.07, 0.6, 0.5), "#c0353a", 0, 1.15, -1.4), mk(S(0.2), "#bfe6f5", 0, 1.0, 0.7, 1, 0.8, 1.4), mk(S(0.12), "#2a2a30", 0, 0.8, 1.65));
  g.add(spin(grp(mk(B(1.6, 0.08, 0.05), "#2a2a30"), mk(B(0.08, 1.6, 0.05), "#2a2a30")), "z")); g.children[g.children.length - 1].position.set(0, 0.8, 1.75); return g; };
const jet = () => grp(mk(C(0.25, 0.12, 3.6, 14), "#c9ced8", 0, 0.8, 0, 1, 1, 1, Math.PI / 2), mk(new THREE.ConeGeometry(0.25, 0.8, 14), "#c9ced8", 0, 0.8, 2.1, 1, 1, 1, Math.PI / 2), mk(new THREE.ConeGeometry(1.8, 1.8, 3), "#9aa2b0", 0, 0.78, -0.4, 1, 1, 0.06, -Math.PI / 2, 0, Math.PI / 2), mk(B(0.07, 0.6, 0.6), "#c0353a", 0, 1.15, -1.5), mk(S(0.2), "#2f5fb5", 0, 1.0, 0.9, 0.7, 0.7, 1.6), mk(S(0.12), "#ff9a2a", 0, 0.8, -1.9));
const helicopter = () => { const g = grp(mk(S(0.6), "#d2362e", 0, 0.9, 0, 0.8, 0.8, 1.3), mk(S(0.4), "#bfe6f5", 0, 1.0, 0.55, 0.8, 0.8, 0.9), mk(C(0.07, 0.04, 1.8, 8), "#d2362e", 0, 1.0, -1.4, 1, 1, 1, Math.PI / 2), mk(B(0.05, 0.4, 0.3), "#d2362e", 0, 1.2, -2.2), mk(C(0.04, 0.04, 0.3, 6), "#555", 0, 1.65, 0), mk(B(0.08, 0.08, 1.0), "#555", 0.4, 0.28, 0), mk(B(0.08, 0.08, 1.0), "#555", -0.4, 0.28, 0));
  const rot = spin(grp(mk(B(3.4, 0.04, 0.16), "#2a2a30"), mk(B(0.16, 0.04, 3.4), "#2a2a30")), "y"); rot.position.set(0, 1.82, 0); g.add(rot);
  const tr = spin(grp(mk(B(0.6, 0.04, 0.08), "#2a2a30")), "x"); tr.position.set(0.1, 1.2, -2.25); g.add(tr); return g; };
const rocket = () => grp(mk(C(0.4, 0.4, 2.2, 18), "#f4f2ec", 0, 1.3, 0), mk(new THREE.ConeGeometry(0.4, 0.9, 18), "#d2362e", 0, 2.85, 0), mk(S(0.16), "#bfe6f5", 0, 1.8, 0.36, 1, 1, 0.5), ...[0, 1, 2].map((i) => mk(B(0.08, 0.7, 0.6), "#d2362e", Math.cos(i * 2.09) * 0.5, 0.5, Math.sin(i * 2.09) * 0.5, 1, 1, 1, 0, -i * 2.09)), mk(new THREE.ConeGeometry(0.3, 0.9, 12), new THREE.Color(3, 1.4, 0.2).getStyle(), 0, -0.2, 0, 1, -1, 1));
const ufo = () => grp(mk(S(0.5), "#9aa2b0", 0, 0.5, 0, 1.6, 0.35, 1.6), mk(S(0.4), "#8fe6c8", 0, 0.8, 0, 1, 0.9, 1), ...[0, 1, 2, 3, 4, 5].map((i) => mk(S(0.07, 8, 6), new THREE.Color(3, 2.5, 0.4).getStyle(), Math.cos(i * 1.05) * 0.78, 0.45, Math.sin(i * 1.05) * 0.78)));
const balloon = () => grp(mk(S(0.5), "#d2362e", 0, 2.1, 0, 1.1, 1.3, 1.1), mk(S(0.5), "#f5c32c", 0, 2.1, 0, 0.5, 1.31, 1.12), mk(B(0.5, 0.35, 0.5), "#8a5a2b", 0, 0.3, 0), mk(C(0.015, 0.015, 1.0, 4), "#555", 0.2, 1.0, 0.2), mk(C(0.015, 0.015, 1.0, 4), "#555", -0.2, 1.0, -0.2));
const hull = (col: string, len = 3.2) => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0.7, 0.55); s.lineTo(-0.7, 0.55); s.closePath(); return mk(new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }), col, 0, 0.1, -len / 2, 1, 1, 1, 0, 0, 0); };
const sailboat = () => grp(hull("#f4f2ec", 2.6), mk(C(0.04, 0.04, 2.6, 6), "#6b3f1c", 0, 1.6, 0.1), mk(new THREE.ConeGeometry(0.9, 2.2, 3), "#f4f2ec", 0, 1.8, -0.4, 0.05, 1, 1.0, 0, 0, 0), mk(new THREE.ConeGeometry(0.7, 1.8, 3), "#e8e4dc", 0, 1.5, 0.8, 0.05, 1, 1.0));
const steamship = () => grp(hull("#2a2a34", 4.2), mk(B(1.0, 0.5, 2.4), "#f4f2ec", 0, 0.9, 0), mk(C(0.2, 0.22, 0.9, 12), "#c0353a", 0, 1.6, -0.2), mk(C(0.2, 0.22, 0.9, 12), "#c0353a", 0, 1.6, 0.6), mk(C(0.21, 0.21, 0.12, 12), "#2a2a34", 0, 2.0, -0.2), mk(C(0.21, 0.21, 0.12, 12), "#2a2a34", 0, 2.0, 0.6));
const submarine = () => grp(mk(S(0.5), "#f5c32c", 0, 0.5, 0, 0.7, 0.6, 2.2), mk(C(0.2, 0.2, 0.5, 12), "#e0ab18", 0, 1.0, 0.1), mk(S(0.12), "#bfe6f5", 0.0, 0.55, 0.9, 1, 1, 0.5), spin(mk(B(0.5, 0.04, 0.08), "#555", 0, 0.5, -1.15), "z"));
const chariot = () => withWheels(grp(mk(B(0.9, 0.12, 0.8), "#b8863a", 0, 0.5, 0), mk(B(0.9, 0.5, 0.08), "#b8863a", 0, 0.8, -0.38), mk(B(0.08, 0.5, 0.8), "#b8863a", 0.45, 0.8, 0), mk(B(0.08, 0.5, 0.8), "#b8863a", -0.45, 0.8, 0), mk(C(0.04, 0.04, 1.8, 6), "#6b3f1c", 0, 0.5, 1.2, 1, 1, 1, Math.PI / 2)), [[0.55, 0], [-0.55, 0]], 0.42, 0.1);
const wagon = () => withWheels(grp(mk(B(1.0, 0.5, 1.8), "#8a5a2b", 0, 0.7, 0), mk(B(1.0, 0.7, 0.05), "#e8dcc0", 0, 1.2, 0, 1, 1, 1), mk(C(0.5, 0.5, 1.8, 14, ), "#e8dcc0", 0, 1.25, 0, 1, 0.9, 1, Math.PI / 2, 0, 0)), [[0.55, 0.6], [-0.55, 0.6], [0.55, -0.6], [-0.55, -0.6]], 0.36, 0.1);
const tank = () => grp(mk(B(1.2, 0.5, 2.4), "#5a6a3a", 0, 0.45, 0), mk(B(0.9, 0.35, 1.0), "#4a5a30", 0, 0.9, -0.1), mk(C(0.06, 0.06, 1.4, 8), "#3a4a28", 0, 0.92, 1.0, 1, 1, 1, Math.PI / 2), mk(B(0.3, 0.4, 2.5), "#2a2a30", 0.65, 0.3, 0), mk(B(0.3, 0.4, 2.5), "#2a2a30", -0.65, 0.3, 0));
const canoe = () => grp(hull("#b8863a", 2.2));
const scooter = () => withWheels(grp(mk(B(0.25, 0.1, 0.8), "#2f9f5a", 0, 0.25, 0), mk(C(0.02, 0.02, 0.9, 6), "#888", 0, 0.7, 0.4)), [[0, 0.4], [0, -0.4]], 0.15, 0.06);
const firetruck = () => { const g = truck(); g.add(mk(B(0.7, 0.08, 2.2), "#c9ccd2", 0, 1.5, -0.6, 1, 1, 1, 0.15)); return g; };
const ambulance = () => truck();
const fish = () => grp(mk(S(0.5), "#3fa7d6", 0, 0.5, 0, 1.3, 0.8, 0.5), mk(new THREE.ConeGeometry(0.35, 0.5, 4), "#2f8ab8", -0.8, 0.5, 0, 1, 1, 0.3, 0, 0, Math.PI / 2), mk(S(0.07, 8, 6), "#fff", 0.45, 0.58, 0.22));
const crown = () => { const g = grp(mk(C(0.5, 0.42, 0.34, 20), GOLD, 0, 0.17, 0)); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.add(mk(new THREE.ConeGeometry(0.11, 0.35, 8), GOLD, Math.cos(a) * 0.43, 0.5, Math.sin(a) * 0.43), mk(S(0.07, 8, 6), i % 2 ? RED : "#2f9fd8", Math.cos(a) * 0.43, 0.7, Math.sin(a) * 0.43)); } return g; };
const sword = () => grp(mk(B(0.14, 1.1, 0.04), "#cfd6dd", 0, 0.9, 0), mk(new THREE.ConeGeometry(0.1, 0.2, 4), "#cfd6dd", 0, 1.55, 0, 1, 1, 0.4), mk(B(0.5, 0.08, 0.1), BROWN, 0, 0.32, 0), mk(C(0.04, 0.04, 0.3, 8), "#6b3f1c", 0, 0.14, 0), mk(S(0.07, 8, 6), GOLD, 0, -0.02, 0));
const key = () => grp(mk(new THREE.TorusGeometry(0.22, 0.07, 8, 20), GOLD, 0, 0.85, 0), mk(C(0.05, 0.05, 0.9, 8), GOLD, 0, 0.3, 0), mk(B(0.2, 0.08, 0.06), GOLD, 0.1, 0.05, 0), mk(B(0.15, 0.08, 0.06), GOLD, 0.08, 0.2, 0));
const heartShape = () => { const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(-0.9, 0.1, -0.5, 0.7, 0, 0.3); s.bezierCurveTo(0.5, 0.7, 0.9, 0.1, 0, -0.5); return s; };
const heart = () => grp(mk(new THREE.ExtrudeGeometry(heartShape(), { depth: 0.25, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3 }), "#e23b6b", 0, 0.5, -0.12));
const gem = () => grp(mk(new THREE.OctahedronGeometry(0.5, 0), "#35c3e8", 0, 0.55, 0, 1, 1.15, 1));
const bread = () => grp(mk(S(0.5), "#d9a15a", 0, 0.3, 0, 1.5, 0.6, 0.85), mk(B(0.5, 0.02, 0.04), "#f0c27a", 0, 0.58, 0, 1, 1, 1, 0, 0.5));
const cake = () => grp(mk(C(0.6, 0.6, 0.35, 24), "#f4c6d8", 0, 0.18, 0), mk(C(0.62, 0.62, 0.12, 24), "#fff", 0, 0.4, 0), mk(C(0.04, 0.04, 0.3, 8), "#fff6c8", 0, 0.62, 0), mk(new THREE.ConeGeometry(0.05, 0.14, 8), "#ffa51e", 0, 0.84, 0));
const book = () => grp(mk(B(0.8, 0.14, 1.05), "#2f5fb5", 0, 0.07, 0), mk(B(0.74, 0.1, 0.98), "#fbf3e0", 0.03, 0.07, 0.01));
const phone = () => grp(mk(B(0.35, 0.7, 0.06), "#2a2a34", 0, 0.35, 0), mk(B(0.29, 0.58, 0.07), "#bfe6f5", 0, 0.35, 0));
const calculator = () => grp(mk(B(0.6, 0.8, 0.1), "#2a2a34", 0, 0.4, 0), mk(B(0.48, 0.28, 0.02), "#bfe6f5", 0, 0.6, 0.06));
const laptop = () => grp(mk(B(1.0, 0.06, 0.8), "#3a3d45", 0, 0.03, 0), mk(B(0.9, 0.7, 0.05), "#3a3d45", 0, 0.38, -0.38, 1, 1, 1, -0.3), mk(B(0.82, 0.6, 0.04), "#bfe6f5", 0, 0.38, -0.37, 1, 1, 1, -0.3));
const tablet = () => grp(mk(B(0.8, 1.1, 0.05), "#2a2a34", 0, 0.55, 0), mk(B(0.72, 1.0, 0.06), "#bfe6f5", 0, 0.55, 0));
const camera = () => grp(mk(B(0.8, 0.5, 0.4), "#2a2a34", 0, 0.35, 0), mk(C(0.22, 0.22, 0.25, 14), "#111", 0, 0.35, 0.22, 1, 1, 1, Math.PI / 2), mk(S(0.08), "#bfe6f5", 0, 0.35, 0.36));
const microphone = () => grp(mk(C(0.04, 0.04, 0.9, 8), "#555", 0, 0.45, 0), mk(S(0.22, 12, 10), "#b9bfc6", 0, 0.95, 0), mk(C(0.3, 0.3, 0.06, 12), "#2a2a34", 0, 0.03, 0));
const headphones = () => grp(mk(new THREE.TorusGeometry(0.35, 0.05, 8, 20, Math.PI), "#2a2a34", 0, 0.5, 0, 1, 1, 1, 0, 0, Math.PI / 2), mk(S(0.18, 10, 8), "#3a3d45", 0.35, 0.3, 0, 0.6, 1, 0.8), mk(S(0.18, 10, 8), "#3a3d45", -0.35, 0.3, 0, 0.6, 1, 0.8));
const satellitedish = () => grp(mk(C(0.05, 0.08, 0.8, 8), "#888", 0, 0.4, 0), mk(cone(0.7, 0.3, 14), "#e2e6ed", 0, 0.85, 0, 1, 1, 1, Math.PI), mk(C(0.03, 0.03, 0.3, 8), "#333", 0, 0.85, 0));
const drone = () => grp(mk(B(0.4, 0.12, 0.4), "#3a3d45", 0, 0.5, 0), mk(B(0.8, 0.04, 0.08), "#555", 0, 0.52, 0), mk(B(0.08, 0.04, 0.8), "#555", 0, 0.52, 0));
const robot = () => grp(mk(B(0.5, 0.7, 0.4), "#9aa0ab", 0, 0.65, 0), mk(B(0.4, 0.35, 0.35), "#7a828e", 0, 1.25, 0), mk(S(0.06), "#35c3e8", 0.1, 1.32, 0.18), mk(S(0.06), "#35c3e8", -0.1, 1.32, 0.18));
const printer3d = () => grp(mk(B(0.9, 0.2, 0.9), "#2a2a34", 0, 0.1, 0), mk(B(0.06, 0.8, 0.06), "#888", 0.38, 0.6, 0.38), mk(B(0.06, 0.8, 0.06), "#888", -0.38, 0.6, 0.38), mk(B(0.8, 0.06, 0.8), "#888", 0, 1.0, 0));
const microscope = () => grp(mk(B(0.5, 0.1, 0.6), "#3a3d45", 0, 0.05, 0), mk(B(0.12, 0.9, 0.15), "#555", -0.15, 0.5, 0), mk(C(0.08, 0.12, 0.6, 10), "#b9bfc6", 0.05, 0.75, 0.1, 1, 1, 1, 0, 0, -0.4));
const telescope = () => grp(mk(C(0.12, 0.22, 1.4, 14), "#e2e6ed", 0, 1.0, 0, 1, 1, 1, Math.PI / 2), mk(C(0.03, 0.03, 0.9, 6), "#444", 0, 0.45, 0));
const flower = () => { const g = grp(mk(C(0.025, 0.025, 0.6, 6), GREEN, 0, 0.3, 0)); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.add(mk(S(0.14, 10, 8), "#f06aa0", Math.cos(a) * 0.16, 0.64, Math.sin(a) * 0.16, 1, 0.5, 1)); } g.add(mk(S(0.1, 10, 8), "#ffd23a", 0, 0.66, 0)); return g; };
const fire = () => grp(mk(new THREE.ConeGeometry(0.4, 1, 10), "#f06a1e", 0, 0.5, 0), mk(new THREE.ConeGeometry(0.25, 0.7, 10), "#ffd23a", 0, 0.38, 0.05));
const coop = () => grp(
  mk(B(3.4, 2.1, 2.8), "#F4C65A", 0, 1.05, 0),
  mk(new THREE.ConeGeometry(2.5, 1.65, 4), "#D98D3D", 0, 2.92, 0, 1, 1, 1, 0, Math.PI / 4),
  mk(B(1.0, 1.15, .16), "#171717", 0, .58, 1.48),
  mk(B(.12, 2.0, .14), "#87583d", -1.45, 1.0, 1.48),
  mk(B(.12, 2.0, .14), "#87583d", 1.45, 1.0, 1.48),
  mk(B(3.2, .16, .18), "#87583d", 0, 2.0, 1.48)
);
const chalkboard = () => {
  const g = grp(
    mk(B(3.5, 2.45, .2), "#87583d", 0, 1.75, 0),
    mk(B(3.12, 2.08, .08), "#174d68", 0, 1.78, .15),
    mk(B(.16, 2.4, .16), "#87583d", -1.05, 1.2, .08),
    mk(B(.16, 2.4, .16), "#87583d", 1.05, 1.2, .08),
    mk(B(2.2, .09, .08), "#F1C24F", 0, .45, .16)
  );
  for(let i=0;i<3;i++)g.add(mk(B(1.8-i*.3,.045,.035),"#f7f2df",-.12,2.35-i*.48,.21));
  return g;
};
const house = () => grp(mk(B(1.6, 1.0, 1.3), "#f0d9a8", 0, 0.5, 0), mk(new THREE.ConeGeometry(1.35, 0.8, 4), "#c0353a", 0, 1.4, 0, 1, 1, 0.95, 0, Math.PI / 4), mk(B(0.34, 0.6, 0.06), BROWN, 0, 0.3, 0.66), mk(B(0.3, 0.3, 0.06), "#bfe6f5", -0.5, 0.65, 0.66), mk(B(0.3, 0.3, 0.06), "#bfe6f5", 0.5, 0.65, 0.66), mk(B(0.22, 0.5, 0.22), "#a07050", 0.5, 1.6, -0.2));
const castle = () => {
  const stone = "#b8bfc9", stone2 = "#a2aab6", roof = "#c0353a", g = grp(mk(B(3.2, 1.8, 2.2), stone, 0, 0.9, 0), mk(B(1.6, 1.0, 1.4), stone2, 0, 2.3, 0), mk(B(0.9, 1.1, 0.12), "#5a3b2a", 0, 0.55, 1.12), mk(C(0.45, 0.45, 0.12, 16, ), "#5a3b2a", 0, 1.1, 1.12, 1, 1, 1, Math.PI / 2));
  for (const [x, z] of [[-1.7, -1.2], [1.7, -1.2], [-1.7, 1.2], [1.7, 1.2]]) g.add(mk(C(0.55, 0.6, 2.6, 18), stone2, x, 1.3, z), mk(new THREE.ConeGeometry(0.75, 1.0, 18), roof, x, 3.1, z), mk(B(0.14, 0.34, 0.06), "#2a1830", x, 2.0, z + 0.58));
  g.add(mk(new THREE.ConeGeometry(0.9, 1.1, 4), roof, 0, 3.35, 0, 1, 1, 1, 0, Math.PI / 4), mk(C(0.025, 0.025, 0.7, 6), "#555", 0, 4.2, 0), mk(B(0.5, 0.28, 0.02), "#d2362e", 0.27, 4.4, 0));
  for (let i = -3; i <= 3; i++) g.add(mk(B(0.3, 0.26, 0.3), stone, i * 0.46, 1.93, 1.0), mk(B(0.3, 0.26, 0.3), stone, i * 0.46, 1.93, -1.0));
  return g;
};
const sun = () => grp(mk(S(0.5), "#ffd23a", 0, 0.5, 0));
const flag = () => grp(mk(C(0.03, 0.03, 1.4, 6), "#6b3f1c", 0, 0.7, 0), mk(B(0.7, 0.45, 0.02), "#d2362e", 0.37, 1.15, 0));


// ---------------- weapons (long axis = +y; guns have the grip along +z so rotating x by 90deg points the barrel forward) ----------------
const STEEL = "#cfd6dd", DARK = "#2a2a30", WOOD = "#6b3f1c";
const knife = () => grp(mk(B(0.1, 0.42, 0.02), STEEL, 0, 0.5, 0), mk(new THREE.ConeGeometry(0.05, 0.14, 4), STEEL, 0, 0.78, 0, 1, 1, 0.3), mk(B(0.18, 0.04, 0.05), DARK, 0, 0.27, 0), mk(C(0.04, 0.045, 0.26, 8), WOOD, 0, 0.12, 0));
const dagger = () => grp(mk(B(0.12, 0.55, 0.025), STEEL, 0, 0.62, 0), mk(new THREE.ConeGeometry(0.06, 0.16, 4), STEEL, 0, 0.97, 0, 1, 1, 0.3), mk(B(0.3, 0.06, 0.07), GOLD, 0, 0.32, 0), mk(C(0.04, 0.04, 0.3, 8), "#5a2f1c", 0, 0.14, 0), mk(S(0.06, 8, 6), GOLD, 0, -0.02, 0));
const katana = () => grp(mk(B(0.07, 1.5, 0.02), "#e8eef4", 0, 1.15, 0), mk(new THREE.ConeGeometry(0.035, 0.12, 4), "#e8eef4", 0, 1.96, 0, 1, 1, 0.3), mk(C(0.15, 0.15, 0.03, 14), GOLD, 0, 0.38, 0), mk(C(0.04, 0.04, 0.5, 8), "#1c1c24", 0, 0.12, 0));
const axe = () => grp(mk(C(0.04, 0.045, 1.3, 8), WOOD, 0, 0.65, 0), mk(B(0.5, 0.36, 0.06), "#aab2bd", 0.22, 1.18, 0), mk(B(0.08, 0.4, 0.1), DARK, 0, 1.18, 0));
const spear = () => grp(mk(C(0.03, 0.035, 2.2, 8), WOOD, 0, 1.1, 0), mk(new THREE.ConeGeometry(0.08, 0.35, 4), STEEL, 0, 2.35, 0, 1, 1, 0.4));
const trident = () => grp(mk(C(0.03, 0.035, 2.0, 8), "#c9a15a", 0, 1.0, 0), ...[-0.14, 0, 0.14].map((x) => mk(new THREE.ConeGeometry(0.04, 0.35, 4), STEEL, x, 2.15, 0, 1, 1, 0.4)), mk(B(0.34, 0.05, 0.05), STEEL, 0, 1.98, 0));
const mace = () => grp(mk(C(0.04, 0.045, 0.9, 8), WOOD, 0, 0.45, 0), mk(S(0.2, 12, 10), "#7a828e", 0, 1.0, 0), ...[0, 1, 2, 3, 4, 5].map((i) => mk(new THREE.ConeGeometry(0.05, 0.14, 5), "#7a828e", Math.cos(i * 1.05) * 0.22, 1.0, Math.sin(i * 1.05) * 0.22, 1, 1, 1, 0, 0, -Math.cos(i * 1.05) * 1.57)));
const club = () => grp(mk(C(0.1, 0.045, 1.0, 10), "#8a5a2b", 0, 0.5, 0));
const hammer = () => grp(mk(C(0.04, 0.045, 1.0, 8), WOOD, 0, 0.5, 0), mk(B(0.4, 0.22, 0.22), "#7a828e", 0, 1.05, 0));
const torch = () => grp(mk(C(0.05, 0.04, 0.8, 8), WOOD, 0, 0.4, 0), mk(new THREE.ConeGeometry(0.14, 0.4, 8), new THREE.Color(3, 1.3, 0.2).getStyle(), 0, 0.98, 0), mk(new THREE.ConeGeometry(0.08, 0.26, 8), new THREE.Color(4, 3, 0.8).getStyle(), 0, 0.94, 0));
const bow = () => { const g = new THREE.Group(); for (let i = 0; i < 12; i++) { const a = -1.15 + (i / 11) * 2.3; g.add(mk(C(0.025, 0.025, 0.24, 5), WOOD, Math.sin(a) * 0.06 - 0.12 * Math.cos(a) * 0 + Math.cos(a) * 0.35 - 0.35, Math.sin(a) * 0.62 + 0.7, 0, 1, 1, 1, 0, 0, a)); } g.add(mk(B(0.012, 1.1, 0.012), "#e8dcc0", -0.17, 0.7, 0)); return g; };
const arrow = () => grp(mk(C(0.012, 0.012, 0.9, 5), "#c9a15a", 0, 0.45, 0), mk(new THREE.ConeGeometry(0.035, 0.12, 4), STEEL, 0, 0.95, 0), mk(B(0.07, 0.12, 0.01), "#d2362e", 0, 0.05, 0), mk(B(0.01, 0.12, 0.07), "#d2362e", 0, 0.05, 0));
const pistol = () => grp(mk(B(0.1, 0.62, 0.12), "#3a3a44", 0, 0.38, 0), mk(C(0.035, 0.035, 0.28, 8), "#2a2a30", 0, 0.78, -0.02), mk(B(0.1, 0.1, 0.32), "#5a3a22", 0, 0.12, 0.17, 1, 1, 1, -0.2), mk(B(0.03, 0.07, 0.1), "#555", 0, 0.28, 0.1));
const rifle = () => grp(mk(B(0.09, 0.9, 0.11), "#4a4a52", 0, 0.7, 0), mk(C(0.03, 0.03, 1.0, 8), "#2a2a30", 0, 1.5, 0), mk(B(0.1, 0.5, 0.15), "#6b3f1c", 0, 0.15, 0.04), mk(C(0.04, 0.04, 0.3, 8), "#1c1c24", 0, 0.95, -0.1), mk(B(0.08, 0.2, 0.12), "#4a4a52", 0, 0.5, 0.1));
const shotgun = () => grp(mk(C(0.04, 0.04, 1.1, 8), "#2a2a30", 0.03, 1.0, 0), mk(C(0.04, 0.04, 1.1, 8), "#2a2a30", -0.03, 1.0, 0), mk(B(0.12, 0.55, 0.14), "#7a4a2a", 0, 0.3, 0.04), mk(B(0.09, 0.2, 0.12), "#555", 0, 0.62, 0.1));
const shield = () => grp(mk(C(0.5, 0.5, 0.08, 24), "#c0353a", 0, 0, 0, 1, 1, 1, Math.PI / 2), mk(C(0.42, 0.42, 0.1, 24), "#f4f2ec", 0, 0, 0, 1, 1, 1, Math.PI / 2), mk(S(0.14, 12, 10), "#b8863a", 0, 0, 0.06, 1, 1, 0.6));
const bomb = () => grp(mk(S(0.5), "#2a2a30", 0, 0.5, 0), mk(C(0.05, 0.05, 0.25, 6), "#8a5a2b", 0, 1.08, 0), mk(S(0.1, 8, 6), new THREE.Color(5, 3, 0.6).getStyle(), 0, 1.25, 0));
const grenade = () => grp(mk(S(0.5), "#4a5a30", 0, 0.5, 0, 0.8, 1, 0.8), mk(B(0.2, 0.12, 0.1), "#888", 0, 1.02, 0), mk(new THREE.TorusGeometry(0.1, 0.02, 6, 12), "#bbb", 0.16, 1.1, 0));
const cannonball = () => grp(mk(S(0.5), "#2a2a30", 0, 0.5, 0));
const cannon3 = () => withWheels(grp(mk(C(0.3, 0.22, 1.8, 14), "#2a2a30", 0, 0.8, 0, 1, 1, 1, Math.PI / 2), mk(B(0.7, 0.2, 1.1), "#6b3f1c", 0, 0.55, -0.1)), [[0.4, -0.1], [-0.4, -0.1]], 0.36, 0.1);
export const PROC: Record<string, () => THREE.Object3D> = { knife, dagger, katana, axe, spear, trident, mace, club, hammer, torch, bow, arrow, pistol, rifle, shotgun, shield, bomb, grenade, cannonball, cannon3, horse, horsewhite: horseWhite, donkey, camel, elephant, lion, wolf, sheep, deer, rabbit, goat, tiger, bear3, parrot, eagle, duck, owl, penguin, shark, whale, snake, frog, dragon, oldcar, policecar, taxi, truck, bus, tractor, motorbike, bicycle, train, plane, jet, helicopter, rocket, ufo, balloon, sailboat, steamship, submarine, chariot, wagon, tank, canoe, scooter, firetruck, ambulance, coin, coinPile, purse: () => purse(), moneybag: moneyBag, mango, apple, seed, egg, chicken, cow, dog, cat, pig, fish, crown, sword, key, heart, gem, bread, cake, book, phone, flower, fire, car, house, castle, sun, flag };

// ---------------- terrain & buildings ----------------
export const cone = (r: number, h: number, n = 24) => new THREE.ConeGeometry(r, h, n);
const mountain = () => grp(mk(cone(3, 4, 7), "#7b7f8e", 0, 2, 0, 1, 1, 1, 0, 0.3), mk(cone(1.1, 1.4, 7), "#f4f7ff", 0, 3.3, 0, 1, 1, 1, 0, 0.3), mk(cone(1.6, 2.2, 6), "#6d7180", 1.7, 1.1, 0.6), mk(cone(1.3, 1.8, 6), "#8a8e9c", -1.8, 0.9, 0.5));
const hill = () => grp(mk(S(1.6, 24, 12), "#6fbf4a", 0, 0, 0, 1.6, 0.7, 1.3), mk(S(0.35, 10, 8), "#3f8f3a", 0.9, 0.9, 0.5), mk(S(0.3, 10, 8), "#3f8f3a", -0.6, 1.0, 0.2));
const volcano = () => grp(mk(C(0.7, 2.6, 3.2, 14), "#5a4a47", 0, 1.6, 0), mk(C(0.62, 0.7, 0.2, 14), "#ff6a1a", 0, 3.25, 0), mk(S(0.35, 10, 8), "#ff4a10", 0, 3.4, 0, 1, 0.6, 1), mk(C(0.1, 0.18, 2.4, 8), "#ff7a22", 0.45, 1.8, 1.6, 1, 1, 1, 0.5, 0, 0));
const pyramid = () => grp(mk(cone(2.6, 3.4, 4), "#e3c27a", 0, 1.7, 0, 1, 1, 1, 0, Math.PI / 4), mk(B(0.5, 0.8, 0.1), "#3a2a1a", 0, 0.4, 1.85));
const lighthouse = () => grp(mk(C(0.45, 0.7, 3.4, 18), "#f3f0ea", 0, 1.7, 0), mk(C(0.47, 0.6, 0.7, 18), "#d2362e", 0, 1.2, 0), mk(C(0.5, 0.5, 0.3, 18), "#333", 0, 3.5, 0), mk(C(0.32, 0.32, 0.5, 14), "#ffe78a", 0, 3.85, 0), mk(cone(0.5, 0.5, 16), "#d2362e", 0, 4.35, 0));
const windmill = () => { const g = grp(mk(C(0.5, 0.85, 2.4, 14), "#e8dcc4", 0, 1.2, 0), mk(cone(0.7, 0.8, 14), "#a0522d", 0, 2.8, 0), mk(B(0.4, 0.7, 0.1), "#5a3b2a", 0, 0.4, 0.8)); const arm = new THREE.Group(); arm.position.set(0, 2.5, 0.62); arm.userData.spin = "z"; for (let i = 0; i < 4; i++) { const pv = new THREE.Group(); pv.rotation.z = (i * Math.PI) / 2; pv.add(mk(B(0.32, 1.5, 0.05), "#f2ede0", 0, 0.8, 0)); arm.add(pv); } g.add(arm); return g; };
const tent = () => grp(mk(cone(1.3, 1.5, 4), "#d9a441", 0, 0.75, 0, 1, 1, 1, 0, Math.PI / 4), mk(B(0.5, 0.8, 0.05), "#3a2a1a", 0, 0.4, 0.92));
const tower = () => grp(mk(C(0.7, 0.8, 3.6, 16), "#b8bfc9", 0, 1.8, 0), mk(C(0.9, 0.8, 0.4, 16), "#a2aab6", 0, 3.8, 0), mk(cone(1.0, 1.0, 16), "#c0353a", 0, 4.5, 0), mk(B(0.3, 0.5, 0.05), "#2a1830", 0, 2.4, 0.78));
const temple = () => { const g = grp(mk(B(4, 0.25, 2.6), "#e9e2d2", 0, 0.12, 0), mk(B(3.8, 0.3, 2.4), "#f3eee2", 0, 2.35, 0), mk(cone(2.2, 0.9, 4), "#e9e2d2", 0, 3.0, 0, 1.0, 1, 0.5, 0, Math.PI / 4)); for (let i = -3; i <= 3; i++) for (const z of [-0.95, 0.95]) g.add(mk(C(0.14, 0.16, 2.1, 12), "#f6f1e6", i * 0.55, 1.3, z)); return g; };
const colosseum = () => { const g = new THREE.Group(); for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; for (let r = 0; r < 3; r++) g.add(mk(B(0.75, 0.9, 0.5), r % 2 ? "#d8c39a" : "#cdb78a", Math.cos(a) * 2.2, 0.45 + r * 0.9, Math.sin(a) * 2.2, 1, 1, 1, 0, -a + Math.PI / 2)); } g.add(mk(C(1.8, 1.8, 0.1, 24), "#d9b36a", 0, 0.05, 0)); return g; };
const bridgeM = () => grp(mk(B(4, 0.2, 1), "#8a5a2b", 0, 0.7, 0), mk(B(4, 0.08, 0.06), "#6b3f1c", 0, 1.1, 0.45), mk(B(4, 0.08, 0.06), "#6b3f1c", 0, 1.1, -0.45), mk(B(0.3, 0.7, 0.9), "#9aa0ab", -1.7, 0.35, 0), mk(B(0.3, 0.7, 0.9), "#9aa0ab", 1.7, 0.35, 0));
const piratesail = () => grp(mk(B(0.9, 0.5, 2.6), "#5a3b2a", 0, 0.35, 0, 1, 1, 1, 0, 0), mk(B(0.5, 0.5, 1.2), "#6b4630", 0, 0.8, -1.3), mk(C(0.05, 0.05, 2.6, 8), "#3a2a1a", 0, 1.8, 0.2), mk(B(0.04, 1.4, 1.3), "#f2ecd8", 0.02, 1.9, 0.2), mk(B(0.04, 0.3, 0.4), "#111", 0.05, 3.0, 0.2), mk(cone(0.45, 0.8, 8), "#5a3b2a", 0, 0.4, 1.6, 1, 1, 1, Math.PI / 2, 0, 0));
const tree = () => grp(mk(C(0.14, 0.2, 1.6, 10), "#7a4b24", 0, 0.8, 0), mk(S(0.9, 14, 10), "#3f9f3f", 0, 2.0, 0), mk(S(0.6, 12, 8), "#52b552", 0.5, 1.6, 0.2), mk(S(0.55, 12, 8), "#52b552", -0.5, 1.7, -0.2));
const rock = () => grp(mk(new THREE.DodecahedronGeometry(0.8, 0), "#8a8f9c", 0, 0.55, 0, 1.2, 0.8, 1), mk(new THREE.DodecahedronGeometry(0.4, 0), "#9aa0ab", 0.8, 0.25, 0.3));

// ---------------- LLM-designed recipes: new things the planner invents, built from primitives ----------------
export type Recipe = { h?: number; saddle?: number; fly?: number; parts: { s: string; c: string; p?: number[]; z?: number[]; r?: number[] }[] };
const geoOf = (s: string): G => s === "sphere" ? S(0.5, 16, 12) : s === "cyl" ? C(0.5, 0.5, 1, 18) : s === "cone" ? cone(0.5, 1, 18) : s === "torus" ? new THREE.TorusGeometry(0.4, 0.1, 8, 20) : s === "pyramid" ? cone(0.7, 1, 4) : B(1, 1, 1);
export const registerRecipes = (models?: Record<string, Recipe>) => {
  for (const [name, r] of Object.entries(models ?? {})) {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, ""); if (!key || !r?.parts?.length) continue;
    PROC[key] = () => { const g = new THREE.Group(); for (const q of r.parts.slice(0, 60)) { const z = q.z ?? [1, 1, 1], p = q.p ?? [0, 0, 0], ro = q.r ?? [0, 0, 0]; g.add(mk(geoOf(q.s), /^#[0-9a-f]{3,8}$/i.test(q.c) ? q.c : "#999999", +p[0] || 0, +p[1] || 0, +p[2] || 0, +z[0] || 1, +z[1] || 1, +z[2] || 1, +ro[0] || 0, +ro[1] || 0, +ro[2] || 0)); } return g; };
    DEFAULT_H[key] = r.h ?? 1; if (r.saddle !== undefined) SADDLE[key] = r.saddle; if (r.fly) FLY[key] = r.fly;
    ALIAS[key] = key;
  }
};
// Kenney models (the packs download in the workflow): noun -> glb
const KEN: Record<string, string> = { chest: "chest", barrel: "barrel", crate: "crate", cart: "cart", ship: "ship-medium", pirateship: "ship-pirate-medium", boat: "boat-row-large", fountain: "fountain-round",
  tent: "tent_detailedClosed", campfire: "campfire_logs", statue: "statue_head", rock: "rock_largeA", pumpkin: "crop_pumpkin", carrot: "crop_carrot", melon: "crop_melon", bottle: "bottle", sign: "sign", lantern: "lantern",
  bear: "bear", windmill: "windmill", stall: "stall-red", fence: "fence", tree: "tree_oak", pillar: "pillar-stone", well: "fountain-round", log: "log", bench: "bench", stump: "stump_old", mushroom: "mushroom_redTall",
  bridge: "bridge_stone", stairs: "stairs-stone", wall: "castle-wall", gate: "castle-gate", tower: "tower-watch", bookcase: "bookcaseClosed", table: "table", chair: "chair", bed: "bed", lamp: "lampRoundFloor", tv: "televisionModern", laptop: "laptop" };
const ALIAS: Record<string, string> = { gun: "pistol", revolver: "pistol", handgun: "pistol", firearm: "pistol", musket: "rifle", "machine gun": "rifle", knives: "knife", axes: "axe", spears: "spear", bows: "bow", arrows: "arrow", pistols: "pistol", rifles: "rifle", shields: "shield", bombs: "bomb", cannon: "cannon3", torches: "torch", clubs: "club", hammers: "hammer", maces: "mace", katanas: "katana", daggers: "dagger", grenades: "grenade", cannonballs: "cannonball", stallion: "horse", pony: "horse", mare: "horse", "white horse": "horsewhite", lamb: "sheep", stag: "deer", bunny: "rabbit", parakeet: "parrot", hawk: "eagle", falcon: "eagle", bird: "parrot", lioness: "lion", elephants: "elephant", camels: "camel", horses: "horse", wolves: "wolf",
  "old car": "oldcar", "vintage car": "oldcar", "model t": "oldcar", "police car": "policecar", cab: "taxi", lorry: "truck", airplane: "plane", aeroplane: "plane", biplane: "plane", aircraft: "plane", airliner: "jet", "fighter jet": "jet", chopper: "helicopter", spaceship: "rocket", spacecraft: "rocket", shuttle: "rocket", "flying saucer": "ufo", "hot air balloon": "balloon",
  "sailing ship": "sailboat", yacht: "sailboat", "sail boat": "sailboat", ferry: "steamship", "cruise ship": "steamship", steamer: "steamship", "steam ship": "steamship", "u boat": "submarine", locomotive: "train", carriage: "wagon", stagecoach: "wagon", motorcycle: "motorbike", bike: "bicycle", "fire truck": "firetruck", "fire engine": "firetruck", jeep: "car", van: "bus", cars: "car", planes: "plane", trains: "train", helicopters: "helicopter", rockets: "rocket", pirateships: "pirateship", "gold coin": "coin", coins: "coin", "gold coins": "coin", gold: "coin", money: "coin", cash: "coin", wallet: "purse", handbag: "purse", bag: "purse", pouch: "purse", sack: "moneybag", "money bag": "moneybag",
  hen: "chicken", rooster: "chicken", chick: "chicken", "chicken coop": "coop", henhouse: "coop", blackboard: "chalkboard", "lesson board": "chalkboard", puppy: "dog", kitten: "cat", palace: "castle", kingdom: "castle", fort: "castle", cottage: "house", home: "house", hut: "house", jewel: "gem", diamond: "gem", ruby: "gem", sapphire: "gem",
  sword_: "sword", blade: "sword", loaf: "bread", cookie: "bread", ship_: "ship", "pirate ship": "pirateship", treasure: "chest", "treasure chest": "chest", "apple tree": "appletree", seeds: "seed", sapling: "tree", oak: "tree", plant: "tree", rocks: "rock",
  stone: "rock", boulder: "rock", flame: "fire", love: "heart", trophy: "crown", automobile: "car", vehicle: "car", cow_: "cow", bull: "cow", ox: "cow", piglet: "pig", mangoes: "mango", apples: "apple", eggs: "egg", keys: "key", crowns: "crown", swords: "sword", chickens: "chicken",
  village: "house", pumpkins: "pumpkin", carrots: "carrot", flowers: "flower", trees: "tree", cows: "cow", dogs: "dog", cats: "cat", pigs: "pig", fishes: "fish", books: "book", barrels: "barrel", ships: "ship", boats: "boat", cannons: "cannon", kings_crown: "crown", cake_: "cake" };
/** default real-world-ish heights (m) in cartoon proportions, used when the storyboard gives none and for held items */
export const DEFAULT_H: Record<string, number> = { knife: 0.45, dagger: 0.55, katana: 1.1, axe: 0.9, spear: 1.8, trident: 1.8, mace: 0.8, club: 0.8, hammer: 0.8, torch: 0.7, bow: 1.0, arrow: 0.8, pistol: 0.4, rifle: 1.0, shotgun: 0.9, shield: 0.8, bomb: 0.4, grenade: 0.25, cannonball: 0.3, cannon3: 1.2, horse: 2.2, horsewhite: 2.2, donkey: 1.5, camel: 2.7, elephant: 3.2, lion: 1.3, wolf: 1.1, sheep: 0.9, deer: 1.9, rabbit: 0.5, goat: 1.0, tiger: 1.2, bear3: 1.6, parrot: 0.6, eagle: 0.9, duck: 0.5, owl: 0.6, penguin: 0.8, shark: 1.0, whale: 2.2, snake: 0.6, frog: 0.4, dragon: 3.6,
  oldcar: 1.8, policecar: 1.5, taxi: 1.5, truck: 2.3, bus: 2.5, tractor: 1.9, motorbike: 1.2, bicycle: 1.1, train: 2.7, plane: 2.2, jet: 1.8, helicopter: 2.4, rocket: 5, ufo: 1.4, balloon: 4, sailboat: 3.6, steamship: 3.4, submarine: 1.3, chariot: 1.5, wagon: 1.9, tank: 1.3, canoe: 0.6, scooter: 1.0, firetruck: 2.7, ambulance: 2.3, pirateship: 6, boat: 1.2, coin: 0.3, coinPile: 0.3, purse: 0.34, moneybag: 0.5, mango: 0.26, apple: 0.24, seed: 0.2, egg: 0.2, chicken: 0.7, cow: 1.6, dog: 0.8, cat: 0.5, pig: 0.9, fish: 0.4, crown: 0.4, sword: 1.0, key: 0.4,
  heart: 0.5, gem: 0.35, bread: 0.3, cake: 0.5, book: 0.3, phone: 0.3, flower: 0.5, fire: 0.9, coop: 3.2, chalkboard: 2.5, car: 1.5, house: 8, castle: 14, appletree: 5, tree: 5, chest: 0.7, barrel: 0.9, crate: 0.8, cannon: 1.0, ship: 4 };

/** things that have a front: they face their direction of travel (or sit side-on to the lens) */
export const GUNS = new Set(["pistol", "rifle", "shotgun"]);
export const MELEE = new Set(["sword", "knife", "dagger", "katana", "axe", "spear", "trident", "mace", "club", "hammer", "torch"]);
export const WEAPONS = new Set([...GUNS, ...MELEE, "bow", "shield", "bomb", "grenade", "arrow"]);
export const ORIENT = new Set(["cannon3", "horse", "horsewhite", "donkey", "camel", "elephant", "lion", "wolf", "sheep", "deer", "rabbit", "goat", "tiger", "bear3", "cow", "dog", "cat", "pig", "chicken", "parrot", "eagle", "duck", "owl", "penguin", "shark", "whale", "snake", "frog", "dragon", "fish",
  "car", "oldcar", "policecar", "taxi", "truck", "bus", "tractor", "motorbike", "bicycle", "train", "plane", "jet", "helicopter", "rocket", "ufo", "sailboat", "steamship", "submarine", "chariot", "wagon", "tank", "canoe", "scooter", "firetruck", "ambulance", "pirateship", "ship", "boat", "cart", "bear"]);
/** where a rider's hips sit, as a fraction of the mount's height */
export const SADDLE: Record<string, number> = { horse: 0.6, horsewhite: 0.6, donkey: 0.62, camel: 0.74, elephant: 0.72, car: 0.5, oldcar: 0.52, policecar: 0.5, taxi: 0.5, truck: 0.5, bus: 0.5, tractor: 0.6, motorbike: 0.55, bicycle: 0.58, plane: 0.42, jet: 0.45, helicopter: 0.4, chariot: 0.42, wagon: 0.5, dragon: 0.62, tank: 0.7, scooter: 0.3, firetruck: 0.5, ambulance: 0.5, sailboat: 0.45, steamship: 0.55, submarine: 0.6, canoe: 0.35, rocket: 0.5, ufo: 0.5, balloon: 0.3, train: 0.55, lion: 0.62, tiger: 0.62, bear3: 0.65, wolf: 0.6, cow: 0.62, deer: 0.62, goat: 0.6, pig: 0.55, shark: 0.5, whale: 0.55, eagle: 0.5 };
/** enclosed vehicles: the rider is raised so head and shoulders show above the roofline */
export const CLOSED = new Set(["car", "oldcar", "policecar", "taxi", "truck", "bus", "firetruck", "ambulance", "tractor", "helicopter", "plane", "jet", "tank", "ufo", "rocket", "train", "submarine", "steamship"]);
/** cruising altitude (m) for flying mounts: they lift off when ridden */
export const FLY: Record<string, number> = { plane: 2.2, jet: 2.6, helicopter: 1.5, rocket: 3, ufo: 2, balloon: 2, dragon: 1.4, eagle: 1.5 };
const norm = (n: string) => n.trim().toLowerCase().replace(/[^a-z ]+/g, "").replace(/\s+/g, " ");
export const canon = (name: string, pile = false): string => {
  const n0 = norm(name); if (ALIAS[n0] && (ALIAS[n0] in PROC || ALIAS[n0] in KEN)) return ALIAS[n0];
  const n = n0, nn = n.replace(/ /g, ""), last = n.split(" ").pop() ?? n;
  const hit = (k: string) => (ALIAS[k] ?? k);
  for (const c of [n, nn, last, n.replace(/s$/, ""), last.replace(/s$/, "")]) { const a = hit(c); if (a in PROC || a in KEN || a === "appletree") return a === "coin" && pile ? "coinPile" : a; }
  return nn || "unknownprop";
};

const keywordProp=(key:string):THREE.Object3D=>{
  const k=key.toLowerCase();
  if(/ship|boat|galleon|vessel/.test(k))return grp(mk(B(1.3,.55,3.8),"#6b4630",0,.35,0),mk(C(.04,.04,3.2,7),"#4a2f1a",0,2,0),mk(B(.05,2.2,1.6),"#f4ecd2",0,2.1,0));
  if(/horse|camel|elephant|cow|dog|bird|fish|animal|beast/.test(k))return grp(mk(S(.5,12,9),k.includes("elephant")?"#9299a2":"#9a7049",0,.75,0,1.35,.85,1.8),mk(S(.28,10,8),"#b58a61",0,1.15,.85),...[-1,1].flatMap(x=>[-1,1].map(z=>mk(C(.09,.12,.7,6),"#5b493a",x*.42,.35,z*.55))),mk(S(.1,8,6),"#24252a",.16,1.2,1.1));
  if(/table|desk|altar/.test(k))return grp(mk(B(2,.18,1.4),"#8a5a2b",0,1,0),...[-1,1].flatMap(x=>[-1,1].map(z=>mk(B(.13,.9,.13),"#6b3f1c",x*.82,.48,z*.52))));
  if(/chair|seat/.test(k))return grp(mk(B(1,.18,1),"#8a5a2b",0,.7,0),mk(B(1,1.3,.16),"#8a5a2b",0,1.4,-.42),...[-1,1].flatMap(x=>[-1,1].map(z=>mk(B(.1,.65,.1),"#6b3f1c",x*.4,.32,z*.4))));
  if(/bed|cot|mattress/.test(k))return grp(mk(B(2.3,.3,3.6),"#6b4630",0,.5,0),mk(B(2.2,.3,3.5),"#e8e2d6",0,.8,0),mk(B(2,.35,.65),"#f2eee5",0,1.1,1.25),mk(B(2.3,1,.18),"#8a5a2b",0,.95,-1.75));
  if(/crown|coronet/.test(k))return crown();
  if(/sword|blade|weapon/.test(k))return sword();
  if(/shield/.test(k))return shield();
  if(/spear|lance/.test(k))return spear();
  if(/book|journal|ledger/.test(k))return book();
  if(/scroll|parchment|document/.test(k))return grp(mk(B(.9,.07,1.5),"#e5d1a2",0,.1,0),mk(C(.12,.12,1.6,10),"#8a5a2b",0,.12,-.78,1,1,1,Math.PI/2),mk(C(.12,.12,1.6,10),"#8a5a2b",0,.12,.78,1,1,1,Math.PI/2));
  if(/tent|camp/.test(k))return tent();
  if(/fire|flame/.test(k))return grp(mk(C(.12,.16,.9,7),"#6b3f1c",0,.12,0),mk(new THREE.ConeGeometry(.4,1.1,8),"#f06a1e",0,.75,0),mk(new THREE.ConeGeometry(.22,.72,8),"#ffd23a",0,.62,.05));
  if(/house|hut|building|palace/.test(k))return grp(mk(B(1.6,1.2,1.4),"#b99b70",0,.6,0),mk(cone(1.2,.9,4),"#7b4932",0,1.65,0,1,1,.9,0,Math.PI/4),mk(B(.35,.7,.08),"#33251c",0,.35,.74));
  return grp(mk(B(.72,.78,.62),"#9a9da4",0,.42,0),mk(C(.22,.22,.42,10),"#b58a43",0,.98,0),mk(S(.22,10,8),"#d9c79d",0,1.42,0),mk(B(.95,.12,.12),"#5f6875",0,.4,.36));
};
const KFIX: Record<string, number> = {};
export const BACK: Record<string, number> = {};
export class Props3D {
  private tpl = new Map<string, THREE.Object3D | null>(); private pool = new Map<string, THREE.Object3D[]>(); private used = new Map<string, number>();
  constructor(private root: THREE.Object3D, private kit: Kit) {}
  private build(c: string): THREE.Object3D | null {
    let o: THREE.Object3D | null = null;
    if (c === "appletree") {
      const t = kitClone(this.kit, "tree_oak", 5);
      if (t) { o = new THREE.Group(); o.add(t); const R = [[0.9, 3.4, 0.7], [-1.0, 3.9, 0.5], [0.3, 4.4, 1.0], [-0.5, 3.1, -1.0], [1.3, 3.8, -0.4], [-1.3, 3.3, 0.9], [0.1, 3.6, 1.3]]; for (const [x, y, z] of R) o.add(mk(S(0.22, 12, 10), RED, x, y, z)); }
    } else if (c in KEN) o = kitClone(this.kit, KEN[c], 1);
    if (!o && c in PROC) o = PROC[c]();
    if (!o) o = keywordProp(c);
    if (o && (c === "coin" || c === "goldcoin" || c === "silvercoin")) { const bx = new THREE.Box3().setFromObject(o), m = Math.max(bx.max.x - bx.min.x, bx.max.z - bx.min.z, 0.001); const g2 = new THREE.Group(); o.scale.multiplyScalar(1 / m); g2.add(o); o = g2; }   // flat discs: normalise by diameter, not thickness
    if (c in KEN && c in KFIX && o) { const g = new THREE.Group(); o.rotation.y = KFIX[c]; g.add(o); o = g; }
    const box = new THREE.Box3().setFromObject(o), sz = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const w = new THREE.Group(), inner = new THREE.Group();
    inner.add(o); inner.position.set(-ctr.x, -ctr.y, -ctr.z); inner.scale.setScalar(1);
    w.add(inner); (w as THREE.Group).userData.hNat = Math.max(0.001, sz.y);
    return w;
  }
  has(name: string, pile = false) { const c = canon(name, pile); if (!c) return false; if (!this.tpl.has(c)) this.tpl.set(c, this.build(c)); return !!this.tpl.get(c); }
  begin() { this.used.clear(); }
  /** put one instance: base at y, height h metres (before the pop/grow scale sc), yaw/tumble rotations */
  put(name: string, x: number, y: number, z: number, h: number, sc = 1, yaw = 0, tumble = 0, pile = false, an?: { dist: number; t: number; mv: boolean; rx?: number; rz?: number }) {
    const c = canon(name, pile); if (!this.has(name, pile)) return false;
    const list = this.pool.get(c) ?? []; this.pool.set(c, list);
    const i = this.used.get(c) ?? 0; this.used.set(c, i + 1);
    if (list.length <= i) { const t = this.tpl.get(c)!; const inst = t.clone(true); (inst.userData as { hNat?: number }).hNat = t.userData.hNat; this.root.add(inst); list.push(inst); }
    const o = list[i], k = (h * sc) / o.userData.hNat;
    o.visible = true; o.position.set(x, y + (h * sc) / 2, z); o.scale.setScalar(k); o.rotation.order = "YXZ"; o.rotation.set(an?.rx ?? tumble, yaw, an?.rz ?? 0);
    if(an?.mv&&["galleon","ship","boat","sailboat","steamship","romanship","vikinglongship"].includes(c)){o.position.y+=Math.sin(an.t*1.7)*.12;o.rotation.x+=Math.sin(an.t*1.1)*.025;o.rotation.z+=Math.cos(an.t*1.35)*.018;}
    if (c === "horse" && MORPH.horse && an) {   // morph-target gallop: phase = distance travelled
      const M = MORPH.horse, ts = M.times, T = ts[ts.length - 1] || 1, ph = an.mv ? ((an.dist / 2.4) % 1) * T : 0.35 * T;
      let mm = o.userData.mm as THREE.Mesh | undefined; if (!mm) { o.traverse((n) => { const m2 = n as THREE.Mesh; if (!mm && m2.isMesh && m2.morphTargetInfluences) mm = m2; }); o.userData.mm = mm; }
      if (mm?.morphTargetInfluences) { let j = 0; while (j < ts.length - 2 && ts[j + 1] < ph) j++; const f = Math.min(1, Math.max(0, (ph - ts[j]) / Math.max(1e-6, ts[j + 1] - ts[j]))); for (let k = 0; k < M.n; k++) mm.morphTargetInfluences[k] = M.values[j * M.n + k] * (1 - f) + M.values[(j + 1) * M.n + k] * f; }
    }
    if (an) o.traverse((n) => {   // articulated parts: legs swing with distance travelled, wheels roll, wings flap, rotors and props spin
      const d = n.userData;
      if (d.leg !== undefined) n.rotation.x = an.mv ? Math.sin((an.dist / Math.max(0.2, 1.3 * h * sc)) * 6.283 + (d.leg === 0 || d.leg === 3 ? 0 : Math.PI)) * 0.75 : 0;
      else if (d.wing !== undefined) n.rotation.z = d.wing * Math.sin(an.t * (an.mv ? 13 : 6)) * 0.7;
      else if (d.wheel) n.rotation.x = -an.dist / (d.wheel * k);
      else if (d.spin) n.rotation[d.spin as "x" | "y" | "z"] = an.t * 32;
    });
    return true;
  }
  end() { for (const [c, list] of this.pool) for (let i = this.used.get(c) ?? 0; i < list.length; i++) list[i].visible = false; }
}

Object.assign(PROC, { mountain, hill, volcano, pyramid, lighthouse, windmill, tent, tower, temple, colosseum, bridge: bridgeM, piratehut: piratesail, rock, tree3: tree });
Object.assign(DEFAULT_H, { mountain: 14, hill: 3, volcano: 12, pyramid: 9, lighthouse: 10, windmill: 7, tent: 2.6, tower: 8, temple: 6, colosseum: 7, bridge: 3, piratehut: 5, rock: 1.2, tree3: 4 });
Object.assign(ALIAS, { mountains: "mountain", peak: "mountain", cliff: "mountain", hills: "hill", mound: "hill", dune: "hill", eruption: "volcano", pyramids: "pyramid", beacon: "lighthouse", mill: "windmill", camp: "tent", turret: "tower", watchtower: "tower", parthenon: "temple", shrine: "temple", arena: "colosseum", stadium: "colosseum", boulder: "rock", stone: "rock", rocks: "rock", bridges: "bridge" });
// tools for the action layer (long axis +y, business end at the bottom for shovel/pen)
const shovel = () => grp(mk(C(0.03, 0.03, 1.0, 8), "#8a5a2b", 0, 0.8, 0), mk(B(0.22, 0.04, 0.3), "#8a5a2b", 0, 1.3, 0), mk(B(0.3, 0.32, 0.03), "#9aa0ab", 0, 0.16, 0, 1, 1, 1, 0, 0, 0), mk(cone(0.15, 0.2, 4), "#9aa0ab", 0, -0.04, 0, 1, 1, 0.2, Math.PI, Math.PI / 4));
const pen = () => grp(mk(C(0.04, 0.04, 0.8, 8), "#2b5cb8", 0, 0.5, 0), mk(cone(0.04, 0.2, 8), "#222", 0, 0.0, 0, 1, 1, 1, Math.PI));
const cup = () => grp(mk(C(0.5, 0.38, 0.9, 16), "#f4efe4", 0, 0.45, 0), mk(C(0.44, 0.44, 0.06, 16), "#6b3f1c", 0, 0.84, 0), mk(new THREE.TorusGeometry(0.28, 0.06, 8, 14), "#f4efe4", 0.55, 0.45, 0));
const ball = () => grp(mk(S(0.5, 16, 12), "#e23b3b", 0, 0.5, 0), mk(new THREE.TorusGeometry(0.5, 0.04, 6, 20), "#ffffff", 0, 0.5, 0, 1, 1, 1, Math.PI / 2));
const bucket = () => grp(mk(C(0.5, 0.38, 0.7, 16), "#6b7a8f", 0, 0.35, 0), mk(new THREE.TorusGeometry(0.45, 0.03, 6, 18), "#444", 0, 0.78, 0, 1, 1, 1, 0, 0, 0));
const pickaxe = () => grp(mk(C(0.04, 0.04, 1.2, 8), "#8a5a2b", 0, 0.6, 0), mk(B(0.9, 0.08, 0.1), "#9aa0ab", 0, 1.2, 0));
Object.assign(PROC, { shovel, spade: shovel, pen, cup, mug: cup, ball, bucket, pickaxe });
Object.assign(DEFAULT_H, { shovel: 1.3, pen: 0.25, cup: 0.25, ball: 0.3, bucket: 0.4, pickaxe: 1.2 });
Object.assign(ALIAS, { spade: "shovel", mug: "cup", glass: "cup", pail: "bucket", football: "ball" });
const pad = () => grp(mk(B(0.72, 1, 0.06), "#f4efe4", 0, 0.5, 0), mk(B(0.72, 0.08, 0.07), "#2b5cb8", 0, 1.0, 0), ...[0.25, 0.4, 0.55, 0.7].map((y) => mk(B(0.5, 0.012, 0.065), "#9ab", 0, y, 0.001)));
Object.assign(PROC, { pad }); Object.assign(DEFAULT_H, { pad: 0.4 }); Object.assign(ALIAS, { notebook: "pad", paper: "pad", letter: "pad", scroll: "pad" });
Object.assign(ALIAS, { cave: "mountain", caves: "mountain", mine: "mountain", ravine: "mountain", canyon: "mountain" });
// pirate galleon: curved hull, three masts with square sails, skull flag, cannons, bowsprit (long axis +z = bow)
const galleon = () => {
  const g = grp(mk(B(1.5, 0.7, 4.6), "#6b4630", 0, 0.45, 0), mk(B(1.3, 0.2, 4.4), "#8a5a2b", 0, 0.88, 0), mk(B(1.2, 0.8, 1.1), "#5a3b2a", 0, 1.2, -1.8), mk(B(1.0, 0.5, 0.9), "#6b4630", 0, 0.95, 1.8), mk(cone(0.6, 1.1, 6), "#6b4630", 0, 0.4, 2.8, 1, 1, 1, Math.PI / 2), mk(C(0.04, 0.04, 1.6, 6), "#3a2a1a", 0, 1.1, 3.4, 1, 1, 1, 1.2, 0, 0));
  for (const [z, h] of [[1.2, 3.6], [-0.2, 4.2], [-1.4, 3.2]] as [number, number][]) g.add(mk(C(0.05, 0.06, h, 7), "#3a2a1a", 0, h / 2 + 0.8, z), mk(B(1.5, 1.0, 0.05), "#f4ecd2", 0, h * 0.62 + 0.8, z + 0.08), mk(B(1.2, 0.8, 0.05), "#eadfbd", 0, h * 0.9 + 0.5, z + 0.08), mk(B(1.6, 0.06, 0.06), "#3a2a1a", 0, h * 0.62 + 1.3, z));
  g.add(mk(B(0.04, 0.5, 0.7), "#161616", 0.03, 5.15, -0.2), mk(S(0.12, 8, 6), "#f4f4f4", 0.06, 5.2, -0.2));
  for (const x of [-0.78, 0.78]) for (const z of [-1, 0, 1]) g.add(mk(C(0.1, 0.12, 0.5, 8), "#222", x, 0.75, z, 1, 1, 1, 0, 0, Math.PI / 2));
  return g;
};
Object.assign(PROC, { galleon }); Object.assign(DEFAULT_H, { galleon: 5.4 }); Object.assign(SADDLE, { galleon: 0.17, steamship: 0.2, sailboat: 0.3, canoe: 0.3 });
Object.assign(ALIAS, { ship: "galleon", pirateship: "galleon", piratesship: "galleon", boat: "galleon", vessel: "galleon", frigate: "galleon", warship: "galleon" });

// paper currency
const note = (c1: string, c2: string) => grp(mk(B(1, 0.5, 0.02), c1, 0, 0.25, 0), mk(B(0.9, 0.4, 0.025), c2, 0, 0.25, 0), mk(C(0.15, 0.15, 0.03, 16), c1, 0, 0.25, 0, 1, 1, 1, Math.PI / 2), mk(B(0.12, 0.3, 0.03), c1, -0.34, 0.25, 0), mk(B(0.12, 0.3, 0.03), c1, 0.34, 0.25, 0));
const cashstack = () => { const g = new THREE.Group(); for (let i = 0; i < 9; i++) g.add(mk(B(0.6, 0.04, 0.3), i % 2 ? "#4fa36a" : "#5bb577", 0.01 * (i % 3), 0.02 + i * 0.04, 0.01 * (i % 2), 1, 1, 1, 0, 0.05 * i)); g.add(mk(B(0.1, 0.4, 0.34), "#f4efe4", 0, 0.2, 0)); return g; };
const banknote = () => note("#2f7a46", "#9fd8ae");
const dollar = () => note("#3d6b3a", "#b9dfb0");
Object.assign(PROC, { banknote, dollar, cash: cashstack, cashstack });
Object.assign(DEFAULT_H, { banknote: 0.5, dollar: 0.5, cash: 0.3, cashstack: 0.3 });
Object.assign(ALIAS, { note: "banknote", notes: "banknote", bill: "banknote", bills: "banknote", money: "cashstack", papermoney: "cashstack", currency: "cashstack", naira: "banknote", dollars: "cashstack", cashbag: "moneybag", stackofcash: "cashstack" });

// Stone-age and ancient-era props
const cavefire = () => grp(mk(B(1.2, 0.15, 1.2), "#3a2f2a", 0, 0.08, 0), ...[0, 1, 2, 3, 4].map(i => mk(C(0.08, 0.09, 0.6, 6), "#5a3a22", Math.cos(i*1.25)*0.3, 0.15, Math.sin(i*1.25)*0.3, 1, 1, 1, 0.4, 0, (i%2?0.5:-0.5))), mk(new THREE.ConeGeometry(0.35, 0.8, 10), "#f06a1e", 0, 0.5, 0), mk(new THREE.ConeGeometry(0.2, 0.6, 10), "#ffd23a", 0, 0.4, 0.05));
const mammoth = () => quad2({ body: "#6b5442", mane: "#543d2b", L: 1.5, H: 1.6, legH: 0.65, neck: 0.5, headL: 1.4, ears: "big", tail: "short", trunk: true, tusks: true, legR: 0.14, fluff: true });
const huntingtools = () => grp(mk(C(0.025, 0.03, 1.6, 8), "#6b3f1c", 0, 0.8, 0), mk(new THREE.ConeGeometry(0.06, 0.25, 4), STEEL, 0, 1.65, 0, 1, 1, 0.4), mk(B(0.18, 0.06, 0.22), "#5a3a22", 0.4, 0.5, 0), mk(new THREE.ConeGeometry(0.08, 0.2, 4), "#cfd6dd", 0.52, 0.55, 0, 1, 1, 1, 0, 0, -1.2));
const hut = () => grp(mk(C(1.1, 1.3, 1.2, 16), "#b08d57", 0, 0.6, 0), mk(cone(1.4, 1.1, 16), "#6e4e2b", 0, 1.75, 0), mk(B(0.35, 0.65, 0.08), "#4a3520", 0, 0.32, 1.0));
const obelisk = () => grp(mk(C(0.4, 0.5, 3.8, 4), "#d9d0c1", 0, 1.9, 0, 1, 1, 1, 0, Math.PI / 4), mk(cone(0.42, 0.7, 4), "#d9d0c1", 0, 4.15, 0, 1, 1, 1, 0, Math.PI / 4));
const sphinx = () => grp(mk(B(1.6, 1.0, 3.2), "#d4c3a3", 0, 0.5, 0), mk(S(0.7, 14, 10), "#d4c3a3", 0, 1.3, 1.3), mk(B(1.1, 0.2, 0.6), "#234975", 0, 1.55, 1.1, 1, 1, 1, -0.2), mk(B(1.4, 0.15, 1.8), "#c8b797", 0, 0.08, 0));
const aqueduct = () => grp(mk(B(3.6, 0.5, 1.4), "#b8b2a5", 0, 2.25, 0), mk(B(3.4, 0.2, 1.2), "#b8b2a5", 0, 1.95, 0), ...[-1.2, 0, 1.2].map(x => grp(mk(B(0.6, 1.8, 1.1), "#b8b2a5", x, 1.0, 0), mk(C(0.4, 0.4, 1.2, 12), "#1a1a20", x, 0.8, 0, 1, 1, 1, Math.PI / 2))));
const romanship = () => grp(hull("#8a5a2b", 4.0), mk(C(0.05, 0.05, 3.2, 8), "#5a3a22", 0, 2.0, 0), mk(B(0.04, 2.2, 1.8), "#f4f2ec", 0.05, 2.2, 0), ...[-1.2, -0.4, 0.4, 1.2].map(z => mk(B(0.3, 0.08, 0.08), "#3a2a1a", 0.65, 0.6, z)), mk(new THREE.ConeGeometry(0.5, 1.2, 4), "#c0353a", 0, 0.8, 2.1, 1, 1, 1, Math.PI / 2));
const greektemple = () => grp(mk(B(4.2, 0.3, 2.8), "#f5f0e6", 0, 0.15, 0), mk(B(3.8, 0.2, 2.4), "#f5f0e6", 0, 2.5, 0), mk(cone(2.3, 1.2, 4), "#c0353a", 0, 3.3, 0, 1, 1, 0.5, 0, Math.PI / 4), ...([-1.6, -0.8, 0, 0.8, 1.6].flatMap(x => [-1.1, 1.1].map(z => mk(C(0.12, 0.14, 2.2, 12), "#faf6ed", x, 1.3, z)))));
const trireme = () => grp(hull("#7a4f28", 4.4), mk(C(0.05, 0.05, 3.6, 8), "#4a2f1a", 0, 2.2, -0.2), mk(B(0.04, 2.6, 2.0), "#faf6ed", 0.02, 2.3, -0.2), ...([-1.5, -0.7, 0.1, 0.9].map(z => mk(B(0.8, 0.06, 0.08), "#d2362e", 0.55, 0.9, z))), mk(new THREE.ConeGeometry(0.55, 1.4, 4), "#b8863a", 0, 0.85, 2.3, 1, 1, 1, Math.PI / 2));
const junk = () => grp(hull("#8a5a2b", 3.8), mk(B(3.4, 0.9, 1.5), "#a06a3a", 0, 0.8, 0), mk(C(0.06, 0.06, 3.8, 8), "#5a3a22", -0.4, 2.2, -0.4), mk(C(0.05, 0.05, 3.2, 8), "#5a3a22", 0.5, 1.9, 0.8), mk(B(0.06, 2.6, 1.8), "#e8d4a0", -0.38, 2.4, -0.4), mk(B(0.06, 2.2, 1.5), "#e8d4a0", 0.48, 2.1, 0.8));
const pagoda = () => { const g = new THREE.Group(); const c = "#c0353a", w = "#f4f0e6"; for (let i = 0; i < 4; i++) { const y = 0.5 + i * 0.9; g.add(mk(B(1.8 - i * 0.2, 0.75, 1.8 - i * 0.2), w, 0, y, 0)); g.add(mk(B(2.2 - i * 0.2, 0.14, 2.2 - i * 0.2), c, 0, y + 0.42, 0)); } g.add(mk(C(0.05, 0.05, 1.0, 8), GOLD, 0, 4.1, 0), mk(S(0.15), GOLD, 0, 4.6, 0)); return g; };
const catapult = withWheels(grp(mk(B(1.0, 0.4, 1.8), "#6b3f1c", 0, 0.5, 0), mk(C(0.08, 0.08, 1.4, 8), "#4a2f1a", 0, 1.1, -0.4, 1, 1, 1, Math.PI / 2), mk(B(0.15, 1.8, 0.15), "#8a5a2b", 0, 1.2, 0.3, 1, 1, 1, -0.4), mk(S(0.35, 10, 8), "#2a2a30", 0, 2.0, 0.7)), [[0.55, 0.4], [-0.55, 0.4], [0.55, -0.4], [-0.55, -0.4]], 0.35, 0.12);
const vikinglongship = () => grp(hull("#5a3b2a", 4.2), mk(new THREE.ConeGeometry(0.4, 1.2, 4), "#8a5a2b", 0, 0.7, 2.2, 1, 1, 1, Math.PI / 2), mk(new THREE.ConeGeometry(0.4, 1.2, 4), "#8a5a2b", 0, 0.7, -2.2, 1, 1, 1, -Math.PI / 2), mk(C(0.05, 0.05, 3.4, 8), "#3a2414", 0, 1.9, 0), mk(B(0.04, 2.2, 1.8), "#d2362e", 0.02, 2.0, 0), ...([-1.6, -0.8, 0, 0.8, 1.6].map(z => mk(C(0.12, 0.12, 0.15, 12), "#f5c32c", 0.72, 0.45, z, 1, 1, 1, Math.PI / 2))));

const bed3 = () => grp(mk(B(2.5,.32,4.2),"#6b4630",0,.62,0),mk(B(2.35,.34,4),"#e8e2d6",0,.95,0),mk(B(2.2,.42,.75),"#f2eee5",0,1.25,1.45),mk(B(2.5,1.25,.22),"#8a5a2b",0,1.1,-2.05),...[-1,1].flatMap(x=>[-1,1].map(z=>mk(C(.09,.12,.75,8),"#6b4630",x*1.08,.35,z*1.78))));
const throne3 = () => grp(mk(B(1.8,.35,1.7),"#7b3c25",0,.8,0),mk(B(1.8,2.2,.3),"#8b4b2e",0,1.95,-.72),mk(B(.28,1.05,1.5),"#b58a43",-.92,1.25,0),mk(B(.28,1.05,1.5),"#b58a43",.92,1.25,0),...[-.62,.62].flatMap(x=>[-.55,.55].map(z=>mk(C(.09,.12,.75,8),"#b58a43",x,.38,z))),mk(new THREE.ConeGeometry(.16,.45,5),"#f5c32c",0,3.28,-.7));
const table3 = () => grp(mk(B(2.5,.22,1.65),"#8a5a2b",0,1.1,0),...[-1,1].flatMap(x=>[-1,1].map(z=>mk(B(.16,1,.16),"#6b3f1c",x*1.05,.5,z*.62))));
const chair3 = () => grp(mk(B(1.2,.2,1.2),"#8a5a2b",0,.75,0),mk(B(1.2,1.5,.18),"#8a5a2b",0,1.55,-.52),...[-1,1].flatMap(x=>[-1,1].map(z=>mk(B(.12,.72,.12),"#6b3f1c",x*.48,.36,z*.48))));
const scroll3 = () => grp(mk(B(1,.08,1.8),"#e5d1a2",0,.1,0),mk(C(.13,.13,1.9,12),"#8a5a2b",0,.13,-.92,1,1,1,Math.PI/2),mk(C(.13,.13,1.9,12),"#8a5a2b",0,.13,.92,1,1,1,Math.PI/2),...[-.45,-.2,.05,.3].map(x=>mk(B(.7,.015,.025),"#8a6a3a",x,.15,0)));
const bird3 = () => grp(mk(S(.48,14,10),"#3f6f9f",0,.65,0,.9,.8,1.2),mk(S(.25,10,8),"#d9d5c8",0,.55,.32,.8,.7,.7),mk(new THREE.ConeGeometry(.08,.22,5),"#d49a32",0,.7,.62,1,1,1,Math.PI/2),mk(S(.035,8,6),"#111",.14,.82,.48));
const campfire3 = () => grp(...[0,1,2].map(i=>mk(C(.13,.16,1.7,7),"#6b3f1c",0,.12,0,1,1,1,0,0,i*Math.PI/3)),mk(new THREE.ConeGeometry(.48,1.25,8),"#f06a1e",0,.8,0),mk(new THREE.ConeGeometry(.25,.82,8),"#ffd23a",0,.66,.05));
Object.assign(PROC, { bed: bed3, deathbed: bed3, royalbed: bed3, throne: throne3, table: table3, chair: chair3, scroll: scroll3, bird: bird3, birds: bird3, campfire: campfire3 });
Object.assign(DEFAULT_H, { bed: 1.4, deathbed: 1.4, royalbed: 1.6, throne: 3.2, table: 1.1, chair: 1.8, scroll: .35, bird: .9, birds: .9, campfire: 1.4 });
Object.assign(ALIAS, { "royal bed": "royalbed", "death bed": "deathbed", "king bed": "royalbed", "camp fire": "campfire", carriage: "wagon", scroll: "scroll" });
Object.assign(PROC, { cavefire, mammoth, huntingtools, hut, obelisk, sphinx, aqueduct, romanship, greektemple, trireme, junk, pagoda, catapult, vikinglongship });
Object.assign(DEFAULT_H, { cavefire: 0.9, mammoth: 2.8, huntingtools: 0.8, hut: 2.5, obelisk: 4.5, sphinx: 2.2, aqueduct: 3.5, romanship: 4.0, greektemple: 5.0, trireme: 4.2, junk: 4.0, pagoda: 5.5, catapult: 1.8, vikinglongship: 4.2 });
Object.assign(ALIAS, {
  "cave fire": "cavefire",
  "woolly mammoth": "mammoth",
  mammoths: "mammoth",
  "spear hunters tools": "huntingtools",
  "hunting tools": "huntingtools",
  "hunter tools": "huntingtools",
  huts: "hut",
  stonehut: "hut",
  mudhut: "hut",
  roundhouse: "hut",
  "egyptian obelisk": "obelisk",
  "egyptian sphinx": "sphinx",
  "roman aqueduct": "aqueduct",
  "roman ship": "romanship",
  galley: "romanship",
  "greek temple": "greektemple",
  "chinese junk": "junk",
  "viking longship": "vikinglongship",
  longship: "vikinglongship",
  catapults: "catapult"
});
for (const k of ["mammoth", "romanship", "trireme", "junk", "vikinglongship", "catapult"]) ORIENT.add(k);
Object.assign(SADDLE, { mammoth: 0.65, romanship: 0.5, trireme: 0.5, junk: 0.5, vikinglongship: 0.5 });

// ---- real (Kenney CC0) models override the hand-built ones whenever the kit is loaded; hand-built stay as fallback ----
const VEH: Record<string, [string, number, number]> = {   // canon: [kenney file, height m, saddle]
  car: ["sedan", 1.5, 0.5], sedan: ["sedan", 1.5, 0.5], oldcar: ["vehicle-vintage-racer", 1.3, 0.5], taxi: ["taxi", 1.5, 0.5], policecar: ["police", 1.6, 0.5], suv: ["suv", 1.9, 0.5], van: ["van", 2.1, 0.5],
  truck: ["truck", 2.8, 0.5], firetruck: ["firetruck", 3.1, 0.5], ambulance: ["ambulance", 2.3, 0.5], tractor: ["tractor", 2.4, 0.6], racecar: ["race", 1.1, 0.4], sportscar: ["sedan-sports", 1.2, 0.4], monstertruck: ["vehicle-monster-truck", 2.6, 0.5],
  kart: ["kart-oodi", 0.9, 0.3], train: ["train-locomotive-a", 3.6, 0.6], tram: ["train-tram-modern", 3.6, 0.6], garbagetruck: ["garbage-truck", 3, 0.5], delivery: ["delivery", 2.4, 0.5],
  galleon: ["ship-pirate-large", 7, 0.3], ship: ["ship-large", 7, 0.3], boat: ["boat-row-large", 1.2, 0.3], canoe: ["canoe", 0.7, 0.3], ghostship: ["ship-ghost", 7, 0.3], wreck: ["ship-wreck", 5, 0.3], pirateship: ["ship-pirate-large", 7, 0.3],
  spaceship: ["craft_racer", 2.2, 0.4], spacecar: ["craft_speederA", 1.4, 0.4], ufo: ["craft_speederB", 1.6, 0.4], cargoship: ["craft_cargoA", 3, 0.4], miner: ["craft_miner", 2.4, 0.4],
};
const ANI: Record<string, [string, number]> = {
  cow: ["animal-cow", 1.5], deer: ["animal-deer", 1.9], dog: ["animal-dog", 0.8], elephant: ["animal-elephant", 3.2], giraffe: ["animal-giraffe", 5], lion: ["animal-lion", 1.3], tiger: ["animal-tiger", 1.3], monkey: ["animal-monkey", 0.9],
  pig: ["animal-pig", 0.8], penguin: ["animal-penguin", 0.8], fox: ["animal-fox", 0.7], rabbit: ["animal-bunny", 0.5], bunny: ["animal-bunny", 0.5], cat: ["animal-cat", 0.5], panda: ["animal-panda", 1.2], polarbear: ["animal-polar", 1.6],
  parrot: ["animal-parrot", 0.5], bee: ["animal-bee", 0.3], crab: ["animal-crab", 0.4], fish: ["animal-fish", 0.5], hog: ["animal-hog", 0.9], koala: ["animal-koala", 0.7], chicken: ["animal-chick", 0.5], beaver: ["animal-beaver", 0.6],
};
const GEAR: Record<string, [string, number]> = {
  coin: ["item-coin-gold", 0.22], goldcoin: ["item-coin-gold", 0.22], silvercoin: ["item-coin-silver", 0.22], sword: ["weapon-sword", 1.0], spear: ["weapon-spear", 1.9], shield: ["shield-round", 0.9], axe: ["tool-axe", 0.9], pickaxe: ["tool-pickaxe", 0.9], shovel: ["tool-shovel", 1.1],
  anvil: ["workbench-anvil", 0.9], skyscraper: ["building-skyscraper-a", 60], skyscrapera: ["building-skyscraper-b", 70], skyscraperb: ["building-skyscraper-c", 55], skyscraperc: ["building-skyscraper-d", 65], skyscraperd: ["building-skyscraper-e", 80],
  taxistand: ["sign", 2], apple: ["apple", 0.18], banana: ["banana", 0.2], bread: ["bread", 0.25], cheese: ["cheese", 0.2], burger: ["burger", 0.2], cake: ["cake", 0.3], donut: ["donut-sprinkles", 0.15], fish3: ["fish-large", 0.4], corn: ["corn", 0.3],
  broccoli: ["broccoli", 0.25], cabbage: ["cabbage", 0.25], grapes: ["grapes", 0.2], cherries: ["cherries", 0.18], honey: ["honey", 0.25], cookie: ["cookie", 0.12], egg: ["egg", 0.1], watermelon: ["crop_melon", 0.3],
};
for (const [c, [f, h, sd]] of Object.entries(VEH)) { KEN[c] = f; KFIX[c] = Math.PI / 2; DEFAULT_H[c] = h; SADDLE[c] = sd; }
for (const [c, [f, h]] of Object.entries(ANI)) { KEN[c] = f; KFIX[c] = Math.PI / 2; DEFAULT_H[c] = h; if (h >= 0.8) SADDLE[c] = 0.82 + 0.37 / h; }
for (const c of ["sedan", "suv", "van", "racecar", "sportscar", "monstertruck", "garbagetruck", "delivery", "tram", "spaceship", "spacecar", "miner", "ghostship", "ship", "galleon", "pirateship"]) CLOSED.add(c);
for (const [c, [f, h]] of Object.entries(GEAR)) { KEN[c] = f; DEFAULT_H[c] = h; }
Object.assign(ALIAS, { limousine: "sedan", automobile: "car", vehicle: "car", jeep: "suv", pickup: "truck", lorry: "truck", cab: "taxi", "police car": "policecar", cop: "policecar", "fire truck": "firetruck", racingcar: "racecar", "race car": "racecar", "sports car": "sportscar", locomotive: "train", subway: "tram", streetcar: "tram", steamship: "ship", vessel: "ship", sailboat: "boat", rowboat: "boat", "pirate ship": "pirateship",
  cattle: "cow", ox: "cow", bull: "cow", hound: "dog", puppy: "dog", kitten: "cat", hen: "chicken", rooster: "chicken", pigeon: "parrot", puppy3: "dog", hare: "rabbit", skyscrapers: "skyscraper", tower2: "skyscraper", highrise: "skyscraper", coins: "coin", sovereign: "coin", swords: "sword", axes: "axe" });
KEN.horse = "horse"; KEN.horsewhite = "horse"; KFIX.horse = 0; KFIX.horsewhite = 0; BACK.horse = 0.6; BACK.horsewhite = 0.6;
SADDLE.horse = 0.79; SADDLE.horsewhite = 0.79;
