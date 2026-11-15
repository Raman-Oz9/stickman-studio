// Real 3D props for the story world: low-poly toon models built from three.js primitives (or Kenney GLBs where the pack has the
// thing), shaded with the same two-tone material as the town so they sit in the scene like Blender-rendered set pieces.
import * as THREE from "three";
import { twoTone } from "../bridge/shade";
import { kitClone, Kit } from "../bridge/build";

const mats = new Map<string, THREE.Material>();
const M = (c: string) => { let m = mats.get(c); if (!m) { m = twoTone(new THREE.MeshLambertMaterial({ color: c })); mats.set(c, m); } return m; };
type G = THREE.BufferGeometry;
const mk = (g: G, c: string, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
  const m = new THREE.Mesh(g, M(c)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz); m.castShadow = true; m.receiveShadow = true; return m;
};
const S = (r: number, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h);
const B = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
const C = (rt: number, rb: number, h: number, n = 20) => new THREE.CylinderGeometry(rt, rb, h, n);
const grp = (...c: THREE.Object3D[]) => { const g = new THREE.Group(); c.forEach((x) => g.add(x)); return g; };

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
const phone = () => grp(mk(B(0.5, 1, 0.08), "#2a2a34", 0, 0.5, 0), mk(B(0.42, 0.84, 0.09), "#8fd3f4", 0, 0.52, 0));
const flower = () => { const g = grp(mk(C(0.025, 0.025, 0.6, 6), GREEN, 0, 0.3, 0)); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.add(mk(S(0.14, 10, 8), "#f06aa0", Math.cos(a) * 0.16, 0.64, Math.sin(a) * 0.16, 1, 0.5, 1)); } g.add(mk(S(0.1, 10, 8), "#ffd23a", 0, 0.66, 0)); return g; };
const fire = () => grp(mk(new THREE.ConeGeometry(0.4, 1, 10), "#f06a1e", 0, 0.5, 0), mk(new THREE.ConeGeometry(0.25, 0.7, 10), "#ffd23a", 0, 0.38, 0.05));
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
const PROC: Record<string, () => THREE.Object3D> = { knife, dagger, katana, axe, spear, trident, mace, club, hammer, torch, bow, arrow, pistol, rifle, shotgun, shield, bomb, grenade, cannonball, cannon3, horse, horsewhite: horseWhite, donkey, camel, elephant, lion, wolf, sheep, deer, rabbit, goat, tiger, bear3, parrot, eagle, duck, owl, penguin, shark, whale, snake, frog, dragon, oldcar, policecar, taxi, truck, bus, tractor, motorbike, bicycle, train, plane, jet, helicopter, rocket, ufo, balloon, sailboat, steamship, submarine, chariot, wagon, tank, canoe, scooter, firetruck, ambulance, coin, coinPile, purse: () => purse(), moneybag: moneyBag, mango, apple, seed, egg, chicken, cow, dog, cat, pig, fish, crown, sword, key, heart, gem, bread, cake, book, phone, flower, fire, car, house, castle, sun, flag };
// Kenney models (the packs download in the workflow): noun -> glb
const KEN: Record<string, string> = { chest: "chest", barrel: "barrel", crate: "crate", cart: "cart", ship: "ship-medium", pirateship: "ship-pirate-medium", boat: "boat-row-large", fountain: "fountain-round",
  tent: "tent_detailedClosed", campfire: "campfire_logs", statue: "statue_head", rock: "rock_largeA", pumpkin: "crop_pumpkin", carrot: "crop_carrot", melon: "crop_melon", bottle: "bottle", sign: "sign", lantern: "lantern",
  bear: "bear", windmill: "windmill", stall: "stall-red", fence: "fence", tree: "tree_oak", pillar: "pillar-stone", well: "fountain-round", log: "log", bench: "bench", stump: "stump_old", mushroom: "mushroom_redTall",
  bridge: "bridge_stone", stairs: "stairs-stone", wall: "castle-wall", gate: "castle-gate", tower: "tower-b", bookcase: "bookcaseClosed", table: "table", chair: "chair", bed: "bed", lamp: "lampRoundFloor", tv: "televisionModern", laptop: "laptop" };
const ALIAS: Record<string, string> = { gun: "pistol", revolver: "pistol", handgun: "pistol", firearm: "pistol", musket: "rifle", "machine gun": "rifle", knives: "knife", axes: "axe", spears: "spear", bows: "bow", arrows: "arrow", pistols: "pistol", rifles: "rifle", shields: "shield", bombs: "bomb", cannon: "cannon3", torches: "torch", clubs: "club", hammers: "hammer", maces: "mace", katanas: "katana", daggers: "dagger", grenades: "grenade", cannonballs: "cannonball", stallion: "horse", pony: "horse", mare: "horse", "white horse": "horsewhite", lamb: "sheep", stag: "deer", bunny: "rabbit", parakeet: "parrot", hawk: "eagle", falcon: "eagle", bird: "parrot", lioness: "lion", elephants: "elephant", camels: "camel", horses: "horse", wolves: "wolf",
  "old car": "oldcar", "vintage car": "oldcar", "model t": "oldcar", "police car": "policecar", cab: "taxi", lorry: "truck", airplane: "plane", aeroplane: "plane", biplane: "plane", aircraft: "plane", airliner: "jet", "fighter jet": "jet", chopper: "helicopter", spaceship: "rocket", spacecraft: "rocket", shuttle: "rocket", "flying saucer": "ufo", "hot air balloon": "balloon",
  "sailing ship": "sailboat", yacht: "sailboat", "sail boat": "sailboat", ferry: "steamship", "cruise ship": "steamship", steamer: "steamship", "steam ship": "steamship", "u boat": "submarine", locomotive: "train", carriage: "wagon", stagecoach: "wagon", motorcycle: "motorbike", bike: "bicycle", "fire truck": "firetruck", "fire engine": "firetruck", jeep: "car", van: "bus", cars: "car", planes: "plane", trains: "train", helicopters: "helicopter", rockets: "rocket", pirateships: "pirateship", "gold coin": "coin", coins: "coin", "gold coins": "coin", gold: "coin", money: "coin", cash: "coin", wallet: "purse", handbag: "purse", bag: "purse", pouch: "purse", sack: "moneybag", "money bag": "moneybag",
  hen: "chicken", rooster: "chicken", chick: "chicken", puppy: "dog", kitten: "cat", palace: "castle", kingdom: "castle", fort: "castle", cottage: "house", home: "house", hut: "house", jewel: "gem", diamond: "gem", ruby: "gem", sapphire: "gem",
  sword_: "sword", blade: "sword", loaf: "bread", cookie: "bread", ship_: "ship", "pirate ship": "pirateship", treasure: "chest", "treasure chest": "chest", "apple tree": "appletree", seeds: "seed", sapling: "tree", oak: "tree", plant: "tree", rocks: "rock",
  stone: "rock", boulder: "rock", flame: "fire", love: "heart", trophy: "crown", automobile: "car", vehicle: "car", cow_: "cow", bull: "cow", ox: "cow", piglet: "pig", mangoes: "mango", apples: "apple", eggs: "egg", keys: "key", crowns: "crown", swords: "sword", chickens: "chicken",
  village: "house", pumpkins: "pumpkin", carrots: "carrot", flowers: "flower", trees: "tree", cows: "cow", dogs: "dog", cats: "cat", pigs: "pig", fishes: "fish", books: "book", barrels: "barrel", ships: "ship", boats: "boat", cannons: "cannon", kings_crown: "crown", cake_: "cake" };
/** default real-world-ish heights (m) in cartoon proportions, used when the storyboard gives none and for held items */
export const DEFAULT_H: Record<string, number> = { knife: 0.45, dagger: 0.55, katana: 1.1, axe: 0.9, spear: 1.8, trident: 1.8, mace: 0.8, club: 0.8, hammer: 0.8, torch: 0.7, bow: 1.0, arrow: 0.8, pistol: 0.4, rifle: 1.0, shotgun: 0.9, shield: 0.8, bomb: 0.4, grenade: 0.25, cannonball: 0.3, cannon3: 1.2, horse: 2.2, horsewhite: 2.2, donkey: 1.5, camel: 2.7, elephant: 3.2, lion: 1.3, wolf: 1.1, sheep: 0.9, deer: 1.9, rabbit: 0.5, goat: 1.0, tiger: 1.2, bear3: 1.6, parrot: 0.6, eagle: 0.9, duck: 0.5, owl: 0.6, penguin: 0.8, shark: 1.0, whale: 2.2, snake: 0.6, frog: 0.4, dragon: 3.6,
  oldcar: 1.8, policecar: 1.5, taxi: 1.5, truck: 2.3, bus: 2.5, tractor: 1.9, motorbike: 1.2, bicycle: 1.1, train: 2.7, plane: 2.2, jet: 1.8, helicopter: 2.4, rocket: 5, ufo: 1.4, balloon: 4, sailboat: 3.6, steamship: 3.4, submarine: 1.3, chariot: 1.5, wagon: 1.9, tank: 1.3, canoe: 0.6, scooter: 1.0, firetruck: 2.7, ambulance: 2.3, pirateship: 6, boat: 1.2, coin: 0.3, coinPile: 0.3, purse: 0.34, moneybag: 0.5, mango: 0.26, apple: 0.24, seed: 0.2, egg: 0.2, chicken: 0.7, cow: 1.6, dog: 0.8, cat: 0.5, pig: 0.9, fish: 0.4, crown: 0.4, sword: 1.0, key: 0.4,
  heart: 0.5, gem: 0.35, bread: 0.3, cake: 0.5, book: 0.3, phone: 0.3, flower: 0.5, fire: 0.9, car: 1.5, house: 5, castle: 8, appletree: 5, tree: 5, chest: 0.7, barrel: 0.9, crate: 0.8, cannon: 1.0, ship: 4 };

/** things that have a front: they face their direction of travel (or sit side-on to the lens) */
export const GUNS = new Set(["pistol", "rifle", "shotgun"]);
export const MELEE = new Set(["sword", "knife", "dagger", "katana", "axe", "spear", "trident", "mace", "club", "hammer", "torch"]);
export const WEAPONS = new Set([...GUNS, ...MELEE, "bow", "shield", "bomb", "grenade", "arrow"]);
export const ORIENT = new Set(["cannon3", "horse", "horsewhite", "donkey", "camel", "elephant", "lion", "wolf", "sheep", "deer", "rabbit", "goat", "tiger", "bear3", "cow", "dog", "cat", "pig", "chicken", "parrot", "eagle", "duck", "owl", "penguin", "shark", "whale", "snake", "frog", "dragon", "fish",
  "car", "oldcar", "policecar", "taxi", "truck", "bus", "tractor", "motorbike", "bicycle", "train", "plane", "jet", "helicopter", "rocket", "ufo", "sailboat", "steamship", "submarine", "chariot", "wagon", "tank", "canoe", "scooter", "firetruck", "ambulance", "pirateship", "ship", "boat", "cart", "bear"]);
/** where a rider's hips sit, as a fraction of the mount's height */
export const SADDLE: Record<string, number> = { horse: 0.6, horsewhite: 0.6, donkey: 0.62, camel: 0.74, elephant: 0.72, car: 0.5, oldcar: 0.52, policecar: 0.5, taxi: 0.5, truck: 0.5, bus: 0.5, tractor: 0.6, motorbike: 0.55, bicycle: 0.58, plane: 0.42, jet: 0.45, helicopter: 0.4, chariot: 0.42, wagon: 0.5, dragon: 0.62, tank: 0.7, scooter: 0.3 };
const norm = (n: string) => n.trim().toLowerCase().replace(/[^a-z ]+/g, "").replace(/\s+/g, " ");
export const canon = (name: string, pile = false): string => {
  const n0 = norm(name); if (ALIAS[n0] && (ALIAS[n0] in PROC || ALIAS[n0] in KEN)) return ALIAS[n0];
  const n = n0, nn = n.replace(/ /g, ""), last = n.split(" ").pop() ?? n;
  const hit = (k: string) => (ALIAS[k] ?? k);
  for (const c of [n, nn, last, n.replace(/s$/, ""), last.replace(/s$/, "")]) { const a = hit(c); if (a in PROC || a in KEN || a === "appletree") return a === "coin" && pile ? "coinPile" : a; }
  return "";
};

export class Props3D {
  private tpl = new Map<string, THREE.Object3D | null>(); private pool = new Map<string, THREE.Object3D[]>(); private used = new Map<string, number>();
  constructor(private root: THREE.Object3D, private kit: Kit) {}
  private build(c: string): THREE.Object3D | null {
    let o: THREE.Object3D | null = null;
    if (c === "appletree") {
      const t = kitClone(this.kit, "tree_oak", 5);
      if (t) { o = new THREE.Group(); o.add(t); const R = [[0.9, 3.4, 0.7], [-1.0, 3.9, 0.5], [0.3, 4.4, 1.0], [-0.5, 3.1, -1.0], [1.3, 3.8, -0.4], [-1.3, 3.3, 0.9], [0.1, 3.6, 1.3]]; for (const [x, y, z] of R) o.add(mk(S(0.22, 12, 10), RED, x, y, z)); }
    } else if (c in KEN) o = kitClone(this.kit, KEN[c], 1);
    else if (c in PROC) o = PROC[c]();
    if (!o) return null;
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
