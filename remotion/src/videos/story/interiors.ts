// Interior sets (palace, cave, gold mine, house, jail): enclosed rooms built from primitives, shown only when a scene asks for
// an interior. They replace the plaza for that scene, are sized for the cinematic camera (30 m+ halls), and flicker with torchlight.
import * as THREE from "three";
import { mk, S, B, C, cone, grp } from "./props3d";

export type InteriorKind = "palace" | "cave" | "mine" | "house" | "jail" | "shop";
export const INTERIOR_ALIAS: Record<string, InteriorKind> = { palace: "palace", throne: "palace", throneroom: "palace", castle: "palace", kingdom: "palace", hall: "palace", cave: "cave", cavern: "cave", mine: "mine", goldmine: "mine", tunnel: "mine", house: "house", home: "house", room: "house", cabin: "house", kitchen: "house", bedroom: "house", shop: "shop", store: "shop", market: "shop", barbershop: "shop", jail: "jail", prison: "jail", dungeon: "jail", cell: "jail" };
export const DIM: Record<InteriorKind, number> = { palace: 0.95, cave: 0.5, mine: 0.55, house: 0.92, jail: 0.6, shop: 0.95 };
export const FOG: Record<InteriorKind, string> = { palace: "#d9c9a8", cave: "#1b1626", mine: "#221a14", house: "#d8c4a4", jail: "#1d2128", shop: "#e0cfae" };

let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const shell = (w: number, h: number, z0: number, z1: number, wall: string, floor: string, ceil: string) => {
  const g = new THREE.Group(), L = z1 - z0, zc = (z0 + z1) / 2;
  g.add(mk(B(w, 0.3, L), floor, 0, -0.15, zc), mk(B(w, 0.5, 0.5), wall, 0, h / 2, z0, 1, h / 0.5, 1), mk(B(w, 0.5, 0.5), wall, 0, h / 2, z1, 1, h / 0.5, 1), mk(B(0.5, 0.5, L), wall, -w / 2, h / 2, zc, 1, h / 0.5, 1), mk(B(0.5, 0.5, L), wall, w / 2, h / 2, zc, 1, h / 0.5, 1));
  const c = mk(B(w, 0.4, L), ceil, 0, h + 0.2, zc); c.castShadow = false; g.add(c); return g;
};
const flame = (g: THREE.Group, x: number, y: number, z: number) => { const f = mk(cone(0.2, 0.55, 8), "#ffb02e", x, y + 0.35, z); (g.userData.flames ??= []).push(f); g.add(mk(C(0.04, 0.05, 0.6, 6), "#4a3020", x, y, z), f); };
const torchRow = (g: THREE.Group, xs: number[], zs: number[], y = 3.2) => { for (const x of xs) for (const z of zs) flame(g, x, y, z); };

const palace = () => {
  const g = shell(34, 13, -16, 26, "#e8dcc0", "#f2ead8", "#7a5a3a");
  g.add(mk(B(4, 0.06, 40), "#b3262e", 0, 0.03, 4), mk(B(4.4, 0.04, 40), "#e6c35a", 0, 0.02, 4));            // red carpet with gold edge
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const x = sx * 8, z = -12 + i * 6; g.add(mk(C(0.7, 0.8, 11, 18), "#f6f0e2", x, 5.5, z), mk(B(1.8, 0.5, 1.8), "#e6c35a", x, 0.25, z), mk(B(1.8, 0.5, 1.8), "#e6c35a", x, 11.2, z)); }
  for (let i = 0; i < 3; i++) { g.add(mk(B(10 - i * 2.2, 0.5, 5 - i * 1.1), "#b3262e", 0, 0.25 + i * 0.5, -12 + i * 0.4 - 0.2 * i)); }   // dais steps
  g.add(mk(B(2.4, 1.2, 1.8), "#e6c35a", 0, 2.1, -13.2), mk(B(2.4, 3.4, 0.4), "#e6c35a", 0, 3.7, -14), mk(B(2, 0.4, 1.5), "#b3262e", 0, 2.8, -13.2), mk(S(0.3, 10, 8), "#e23b3b", 0, 5.7, -14, 1, 1, 0.6), mk(cone(0.5, 1.2, 4), "#e6c35a", 0, 6.1, -14));
  for (const sx of [-1, 1]) for (const z of [-4, 6, 16]) { g.add(mk(B(0.1, 5, 2.4), "#9ec5ee", sx * 16.6, 6, z), mk(B(0.2, 0.3, 2.8), "#e6c35a", sx * 16.5, 8.6, z)); }   // tall windows with gold lintels
  for (const x of [-10, 0, 10]) { const ch = grp(mk(C(0.04, 0.04, 2.6, 6), "#555", 0, 0, 0), mk(new THREE.TorusGeometry(1.1, 0.1, 8, 24), "#e6c35a", 0, -1.3, 0, 1, 1, 1, Math.PI / 2), mk(S(0.2, 8, 6), "#ffe9a0", 0, -1.2, 0)); ch.position.set(x, 11, 2); g.add(ch); for (let k = 0; k < 6; k++) flame(g, x + Math.cos(k * 1.047) * 1.1, 9.7, 2 + Math.sin(k * 1.047) * 1.1); }
  for (const x of [-4, 4]) g.add(mk(B(1.6, 4.2, 0.1), "#b3262e", x, 8, -15.6), mk(B(0.6, 0.6, 0.12), "#e6c35a", x, 8.6, -15.5));
  torchRow(g, [-15.2, 15.2], [-8, 2, 12], 3.6); return g;
};
const rockRing = (g: THREE.Group, R: number, n: number, c1: string, c2: string, hMin: number, hMax: number) => {
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, r = R + rnd() * 3, h = hMin + rnd() * (hMax - hMin); g.add(mk(new THREE.DodecahedronGeometry(1, 0), i % 2 ? c1 : c2, Math.cos(a) * r, h / 2 - 1, Math.sin(a) * r * 1.1 + 4, 3.2 + rnd() * 2, h / 2, 3.2 + rnd() * 2, rnd(), rnd() * 6, rnd())); }
};
const cave = () => {
  const g = shell(40, 14, -18, 26, "#4a4256", "#5b5368", "#2e2838"); seed = 11;
  rockRing(g, 15, 22, "#5a526a", "#6b6279", 8, 14);
  for (let i = 0; i < 40; i++) { const x = -16 + rnd() * 32, z = -15 + rnd() * 38, h = 1.2 + rnd() * 3.2; g.add(mk(cone(0.5 + rnd() * 0.5, h, 7), "#3c364a", x, 14 - h / 2, z, 1, 1, 1, Math.PI)); }   // stalactites
  for (let i = 0; i < 14; i++) { const x = -12 + rnd() * 24, z = -12 + rnd() * 30; g.add(mk(new THREE.DodecahedronGeometry(0.5 + rnd() * 0.7, 0), "#6a6178", x, 0.3, z, 1, 0.6, 1, rnd(), rnd() * 6, 0)); }
  const cr = ["#6ee7ff", "#c77dff", "#ffd166"]; for (let k = 0; k < 9; k++) { const x = (k % 2 ? 1 : -1) * (5 + rnd() * 6), z = -10 + k * 3.5, c = cr[k % 3]; for (let j = 0; j < 3; j++) g.add(mk(cone(0.28, 1.2 + rnd() * 1.4, 6), c, x + j * 0.3, 0.8, z + rnd() * 0.5, 1, 1, 1, (rnd() - 0.5) * 0.7, 0, (rnd() - 0.5) * 0.7)); }   // glowing crystals
  torchRow(g, [-9, 9], [-6, 6, 16], 2.2); return g;
};
const mine = () => {
  const g = cave(); seed = 23;
  for (let i = 0; i < 6; i++) { const z = -10 + i * 6; g.add(mk(B(0.5, 6, 0.5), "#7a4b24", -4.2, 3, z), mk(B(0.5, 6, 0.5), "#7a4b24", 4.2, 3, z), mk(B(9.2, 0.5, 0.6), "#8a5a2b", 0, 6, z)); }   // timber supports
  for (const x of [-1, 1]) g.add(mk(B(0.14, 0.14, 42), "#6b6b75", x * 0.9, 0.08, 4));
  for (let i = 0; i < 40; i++) g.add(mk(B(2.4, 0.12, 0.35), "#6b4630", 0, 0.03, -16 + i));
  const cart = grp(mk(B(1.8, 0.9, 1.2), "#7a4b24", 0, 0.7, 0), mk(S(0.55, 10, 8), "#f5c32c", 0, 1.2, 0, 1.4, 0.7, 1), ...[-0.6, 0.6].flatMap((x) => [-0.4, 0.4].map((z) => mk(C(0.25, 0.25, 0.12, 12), "#333", x, 0.25, z, 1, 1, 1, 0, 0, Math.PI / 2)))); cart.position.set(0, 0, -2); g.add(cart);
  for (let i = 0; i < 14; i++) { const a = rnd() * 6.283, r = 10 + rnd() * 4; g.add(mk(new THREE.DodecahedronGeometry(0.4 + rnd() * 0.5, 0), "#f5c32c", Math.cos(a) * r * 0.9, 1 + rnd() * 6, Math.sin(a) * r + 4, 1, 1, 0.7, rnd(), rnd(), 0)); }   // gold veins in the walls
  for (let k = 0; k < 6; k++) g.add(mk(S(0.35, 8, 6), "#ffd54a", -5 + rnd() * 10, 0.2, -12 + rnd() * 6, 1.3, 0.6, 1));
  g.add(mk(B(3, 0.5, 2), "#f5c32c", 6.5, 0.25, -9), mk(S(1.2, 12, 8), "#f5c32c", 6.5, 0.7, -9, 1, 0.6, 1), mk(S(0.8, 12, 8), "#ffe27a", 7.6, 0.6, -8.4, 1, 0.6, 1));   // treasure heap
  return g;
};
const house = () => {
  const g = shell(26, 9, -8, 24, "#d9b98a", "#a7773d", "#6d4a2a");
  for (let i = 0; i < 10; i++) g.add(mk(B(26, 0.02, 0.06), "#7a5226", 0, 0.01, -7 + i * 3.1));
  g.add(mk(B(7, 0.04, 5), "#b04a4a", 0, 0.03, 4), mk(B(6, 0.04, 4), "#e8c97a", 0, 0.05, 4));
  g.add(mk(B(3, 0.7, 4.2), "#8a5a2b", -9, 0.55, -4), mk(B(2.8, 0.4, 4), "#f4efe4", -9, 1.0, -4), mk(B(2.6, 0.3, 1), "#4a7ab8", -9, 1.3, -5.4), mk(B(3, 1.6, 0.3), "#7a4b24", -9, 1.3, -6.2));   // bed
  g.add(mk(B(4, 0.2, 2.2), "#8a5a2b", 4, 1.7, 2), ...[[-1.7, -0.9], [1.7, -0.9], [-1.7, 0.9], [1.7, 0.9]].map(([x, z]) => mk(B(0.2, 1.7, 0.2), "#6b3f1c", 4 + x, 0.85, 2 + z)));   // table
  for (const [x, z] of [[2.2, 3.8], [5.8, 3.8], [2.2, 0.2], [5.8, 0.2]]) g.add(mk(B(0.9, 0.12, 0.9), "#7a4b24", x, 1.0, z), mk(B(0.9, 1.0, 0.12), "#7a4b24", x, 1.5, z + (z > 2 ? 0.45 : -0.45)));
  g.add(mk(B(4, 3.4, 1.2), "#9a9aa4", 9, 1.7, -7), mk(B(2.2, 1.8, 0.6), "#241a14", 9, 1.0, -6.5)); flame(g, 9, 0.6, -6.4);   // fireplace
  g.add(mk(B(3, 3, 0.15), "#a5d2f5", -3, 5, -7.8), mk(B(0.15, 3, 0.2), "#6d4a2a", -3, 5, -7.7), mk(B(3.2, 0.15, 0.2), "#6d4a2a", -3, 5, -7.7), mk(B(2, 3, 0.2), "#7a4b24", 3, 2, 23.6));
  g.add(mk(B(1.6, 5, 1.2), "#7a4b24", -12, 2.5, 6), ...[1, 2.2, 3.4, 4.5].map((y) => mk(B(1.5, 0.1, 1.1), "#9a6a34", -12, y, 6)));
  return g;
};
const jail = () => {
  const g = shell(30, 11, -10, 26, "#6b707c", "#585d69", "#3a3e48"); seed = 5;
  for (let i = -6; i <= 6; i++) g.add(mk(C(0.07, 0.07, 6, 8), "#2a2d34", i * 0.8 + 6, 3, 2), mk(C(0.07, 0.07, 6, 8), "#2a2d34", i * 0.8 - 8, 3, 2));
  g.add(mk(B(11, 0.2, 0.2), "#2a2d34", 6, 6, 2), mk(B(11, 0.2, 0.2), "#2a2d34", -8, 6, 2), mk(B(3, 0.5, 1.6), "#7a5a3a", 10, 0.7, -8), mk(S(0.7, 10, 8), "#777", -11, 0.35, -6, 1, 0.5, 1), mk(C(0.4, 0.4, 0.2, 10), "#444", 12, 0.1, -3));
  for (let i = 0; i < 18; i++) g.add(mk(B(1.2, 0.6, 0.1), "#5a5f6c", -14.6, 1 + (i % 6) * 1.6, -8 + Math.floor(i / 6) * 8 + rnd()));
  torchRow(g, [-14.5, 14.5], [-5, 10, 20], 4.2); return g;
};
const hue = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
const shop = (kind: string) => {
  const hc = new THREE.Color().setHSL(hue(kind) / 360, 0.55, 0.45).getStyle(), g = shell(26, 9, -10, 24, "#e3cfa6", "#9c6b3a", "#6d4a2a"), slots: number[][] = [];
  for (let i = 0; i < 12; i++) g.add(mk(B(26, 0.02, 0.06), "#7a5226", 0, 0.01, -9 + i * 2.8));
  g.add(mk(B(26, 0.4, 0.1), hc, 0, 7.6, -9.6), mk(B(9, 1.6, 0.25), "#f4efe4", 0, 7.6, -9.4), mk(B(8.6, 1.3, 0.1), hc, 0, 7.6, -9.25));            // painted sign band
  g.add(mk(B(11, 1.3, 1.7), "#7a4b24", 0, 0.65, -3), mk(B(11.4, 0.2, 2.0), "#a8743a", 0, 1.4, -3));                                                    // counter
  for (const x of [-9, 9]) g.add(mk(B(0.5, 6.6, 3.0), "#7a4b24", x, 3.3, -8));
  for (const y of [1.5, 3.1, 4.7]) { g.add(mk(B(19, 0.18, 1.5), "#8a5a2b", 0, y, -9)); for (let x = -8; x <= 8; x += 1.8) slots.push([x, y + 0.1, -9]); }
  for (let x = -4; x <= 4; x += 1.6) slots.push([x, 1.52, -3]);
  g.add(mk(B(2.4, 3.4, 0.2), "#7a4b24", 11, 2.2, -2), mk(B(1.8, 2.6, 0.1), "#cfe6f7", 11.1, 2.3, -2));
  if (/barber|hair|salon/.test(kind)) { for (const x of [-6, 6]) g.add(mk(B(1.2, 1.2, 1.2), "#222", x, 0.6, 2), mk(S(0.5, 10, 8), "#b3262e", x, 1.5, 2, 1.4, 0.6, 1.4), mk(B(1.4, 1.4, 0.2), "#b3262e", x, 2.4, 1.4), mk(B(3, 3.4, 0.2), "#cfe6f7", x, 4.4, -9.6), mk(B(3.3, 3.7, 0.12), "#e6c35a", x, 4.4, -9.7)); g.add(mk(C(0.25, 0.25, 3, 14), "#f4efe4", 10, 1.5, 6), mk(C(0.26, 0.26, 0.5, 14), "#b3262e", 10, 1.0, 6), mk(C(0.26, 0.26, 0.5, 14), "#2b5cb8", 10, 2.0, 6)); }
  if (/smith|forge|armor|weapon|sword/.test(kind)) { g.add(mk(B(1.4, 0.9, 0.8), "#2a2d34", -7, 0.45, 3), mk(B(2, 0.3, 0.7), "#2a2d34", -7, 1.1, 3), mk(cone(0.5, 0.8, 4), "#2a2d34", -5.9, 1.2, 3, 1, 1, 1, 0, 0, -Math.PI / 2), mk(B(3, 1.6, 2.4), "#6b6b75", 9, 0.8, 4), mk(B(2.2, 0.5, 1.8), "#241a14", 9, 1.65, 4)); flame(g, 9, 1.8, 4); flame(g, -2, 1.4, -3); }
  if (/mango|fruit|market|grocer|veg/.test(kind)) for (let i = 0; i < 4; i++) g.add(mk(B(2.2, 0.8, 1.4), "#a8743a", -7 + i * 4.6, 0.4, 5), mk(B(2.4, 0.1, 1.6), "#7a4b24", -7 + i * 4.6, 0.82, 5), mk(S(0.9, 10, 6), "#f5a623", -7 + i * 4.6, 1.0, 5, 1.2, 0.45, 0.8));
  g.add(mk(B(1.6, 0.1, 6), hc, -4, 0.05, 8), mk(B(1.6, 0.1, 6), hc, 4, 0.05, 8));
  torchRow(g, [-12.4, 12.4], [0, 14], 5); g.userData.slots = slots; return g;
};
export const buildInterior = (k: InteriorKind, kind = ""): THREE.Group => ({ palace, cave, mine, house, jail, shop: () => shop(kind) }[k])();
export const flicker = (g: THREE.Object3D, t: number) => { (g.userData.flames as THREE.Mesh[] | undefined)?.forEach((f, i) => { f.scale.set(1 + 0.2 * Math.sin(t * 14 + i), 1 + 0.35 * Math.sin(t * 17 + i * 2), 1 + 0.2 * Math.sin(t * 11 + i)); }); };

// ---- shop front: facade, striped awning, door, display windows and a painted sign with the shop's name ----
const signTex = (text: string, bg: string) => {
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256; const x = cv.getContext("2d")!;
  x.fillStyle = bg; x.fillRect(0, 0, 1024, 256); x.strokeStyle = "#f6e7b4"; x.lineWidth = 14; x.strokeRect(14, 14, 996, 228);
  x.fillStyle = "#fff6d6"; x.textAlign = "center"; x.textBaseline = "middle"; let fs = 120; x.font = `bold ${fs}px Georgia, serif`; while (x.measureText(text).width > 900 && fs > 40) { fs -= 6; x.font = `bold ${fs}px Georgia, serif`; }
  x.fillText(text.toUpperCase(), 512, 135); const t = new THREE.CanvasTexture(cv); t.anisotropy = 4; return t;
};
export const buildShopFront = (label: string) => {
  const hc = new THREE.Color().setHSL(hue(label.toLowerCase()) / 360, 0.5, 0.42), g = new THREE.Group(), css = "#" + hc.getHexString();
  g.add(mk(B(14, 8, 6), "#e8d9b8", 0, 4, 0), mk(B(14.4, 0.6, 6.4), "#7a4b24", 0, 8.2, 0), mk(B(3, 5, 0.3), "#5a3b1e", 0, 2.5, 3.1), mk(B(0.3, 0.3, 0.3), "#e6c35a", 1.1, 2.5, 3.3));
  for (const x of [-4.6, 4.6]) g.add(mk(B(4, 3.4, 0.2), "#cfe6f7", x, 3.1, 3.05), mk(B(4.4, 0.4, 0.5), "#7a4b24", x, 1.3, 3.2), mk(B(4.4, 0.3, 0.3), "#7a4b24", x, 4.9, 3.1));
  for (let i = 0; i < 10; i++) g.add(mk(B(1.4, 0.2, 2.6), i % 2 ? "#f4efe4" : css, -6.3 + i * 1.4, 6.0, 4.2, 1, 1, 1, 0.42, 0, 0));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), new THREE.MeshBasicMaterial({ map: signTex(label, css), toneMapped: false })); sign.position.set(0, 7.1, 3.35); g.add(sign);
  for (let i = 0; i < 4; i++) g.add(mk(B(1, 0.9, 1), "#a8743a", -6 + i * 1.5, 0.45, 4.6 + (i % 2) * 0.5, 1, 1, 1, 0, 0.2 * i), mk(S(0.35, 10, 8), "#f5a623", -6 + i * 1.5, 1.1, 4.6 + (i % 2) * 0.5));
  return g;
};
