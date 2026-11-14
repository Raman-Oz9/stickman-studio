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
const quad = (body: string, head: string, o: { spots?: string; ears?: string; tail?: string; long?: number; tall?: number; snout?: string; horns?: boolean } = {}) => {
  const L = o.long ?? 1, H = o.tall ?? 1, g = grp(
    mk(S(0.5), body, 0, 0.75 * H, 0, 0.8, 0.7 * H, 1.2 * L), mk(S(0.3), head, 0, 1.0 * H, 0.65 * L), mk(S(0.14), o.snout ?? head, 0, 0.93 * H, 0.9 * L, 1.1, 0.8, 1),
    mk(S(0.035, 8, 6), "#222", 0.12, 1.08 * H, 0.86 * L), mk(S(0.035, 8, 6), "#222", -0.12, 1.08 * H, 0.86 * L));
  for (const [x, z] of [[0.22, 0.4 * L], [-0.22, 0.4 * L], [0.22, -0.4 * L], [-0.22, -0.4 * L]]) g.add(mk(C(0.08, 0.07, 0.5 * H, 8), body, x, 0.25 * H, z), mk(B(0.14, 0.06, 0.18), "#3a3a44", x, 0.02, z + 0.02));
  g.add(mk(S(0.1), o.ears ?? head, 0.2, 1.28 * H, 0.55 * L, 0.6, 1.3, 0.5), mk(S(0.1), o.ears ?? head, -0.2, 1.28 * H, 0.55 * L, 0.6, 1.3, 0.5));
  g.add(mk(C(0.04, 0.03, 0.4, 6), o.tail ?? body, 0, 0.95 * H, -0.62 * L, 1, 1, 1, -0.9));
  if (o.spots) { g.add(mk(S(0.25), o.spots, 0.2, 0.85 * H, 0.1, 0.6, 0.8, 1), mk(S(0.22), o.spots, -0.25, 0.8 * H, -0.3, 0.6, 0.8, 1)); }
  if (o.horns) g.add(mk(new THREE.ConeGeometry(0.05, 0.2, 6), "#f0e6c8", 0.18, 1.35 * H, 0.6 * L), mk(new THREE.ConeGeometry(0.05, 0.2, 6), "#f0e6c8", -0.18, 1.35 * H, 0.6 * L));
  return g;
};
const cow = () => quad("#fff", "#fff", { spots: "#3a3a44", snout: "#f2b6c0", long: 1.15, tall: 1.15, horns: true });
const dog = () => quad("#c58a52", "#c58a52", { ears: "#8a5a2b", tail: "#c58a52" });
const cat = () => quad("#9aa0a8", "#9aa0a8", { long: 0.85, tall: 0.8 });
const pig = () => quad("#f4b6c2", "#f4b6c2", { snout: "#f08aa0", long: 0.95, tall: 0.85 });
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
const car = () => grp(mk(B(1.8, 0.45, 0.9), "#d2362e", 0, 0.42, 0), mk(B(0.9, 0.38, 0.8), "#d2362e", -0.1, 0.8, 0), mk(B(0.75, 0.3, 0.82), "#bfe6f5", -0.1, 0.82, 0), ...[[0.6, 0.45], [0.6, -0.45], [-0.6, 0.45], [-0.6, -0.45]].map(([x, z]) => mk(C(0.22, 0.22, 0.14, 16), "#333", x, 0.22, z, 1, 1, 1, Math.PI / 2)));
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

const PROC: Record<string, () => THREE.Object3D> = { coin, coinPile, purse: () => purse(), moneybag: moneyBag, mango, apple, seed, egg, chicken, cow, dog, cat, pig, fish, crown, sword, key, heart, gem, bread, cake, book, phone, flower, fire, car, house, castle, sun, flag };
// Kenney models (the packs download in the workflow): noun -> glb
const KEN: Record<string, string> = { chest: "chest", barrel: "barrel", crate: "crate", cannon: "cannon", cart: "cart", ship: "ship-medium", pirateship: "ship-pirate-medium", boat: "boat-row-large", fountain: "fountain-round",
  tent: "tent_detailedClosed", campfire: "campfire_logs", statue: "statue_head", rock: "rock_largeA", pumpkin: "crop_pumpkin", carrot: "crop_carrot", melon: "crop_melon", bottle: "bottle", sign: "sign", lantern: "lantern",
  bear: "bear", windmill: "windmill", stall: "stall-red", fence: "fence", tree: "tree_oak", pillar: "pillar-stone", well: "fountain-round", log: "log", bench: "bench", stump: "stump_old", mushroom: "mushroom_redTall",
  bridge: "bridge_stone", stairs: "stairs-stone", wall: "castle-wall", gate: "castle-gate", tower: "tower-b", bookcase: "bookcaseClosed", table: "table", chair: "chair", bed: "bed", lamp: "lampRoundFloor", tv: "televisionModern", laptop: "laptop" };
const ALIAS: Record<string, string> = { "gold coin": "coin", coins: "coin", "gold coins": "coin", gold: "coin", money: "coin", cash: "coin", wallet: "purse", handbag: "purse", bag: "purse", pouch: "purse", sack: "moneybag", "money bag": "moneybag",
  hen: "chicken", rooster: "chicken", chick: "chicken", puppy: "dog", kitten: "cat", palace: "castle", kingdom: "castle", fort: "castle", cottage: "house", home: "house", hut: "house", jewel: "gem", diamond: "gem", ruby: "gem", sapphire: "gem",
  sword_: "sword", blade: "sword", loaf: "bread", cookie: "bread", ship_: "ship", "pirate ship": "pirateship", treasure: "chest", "treasure chest": "chest", "apple tree": "appletree", seeds: "seed", sapling: "tree", oak: "tree", plant: "tree", rocks: "rock",
  stone: "rock", boulder: "rock", flame: "fire", love: "heart", trophy: "crown", automobile: "car", vehicle: "car", cow_: "cow", bull: "cow", ox: "cow", piglet: "pig", mangoes: "mango", apples: "apple", eggs: "egg", keys: "key", crowns: "crown", swords: "sword", chickens: "chicken",
  village: "house", pumpkins: "pumpkin", carrots: "carrot", flowers: "flower", trees: "tree", cows: "cow", dogs: "dog", cats: "cat", pigs: "pig", fishes: "fish", books: "book", barrels: "barrel", ships: "ship", boats: "boat", cannons: "cannon", kings_crown: "crown", cake_: "cake" };
/** default real-world-ish heights (m) in cartoon proportions, used when the storyboard gives none and for held items */
export const DEFAULT_H: Record<string, number> = { coin: 0.3, coinPile: 0.3, purse: 0.34, moneybag: 0.5, mango: 0.26, apple: 0.24, seed: 0.2, egg: 0.2, chicken: 0.7, cow: 1.6, dog: 0.8, cat: 0.5, pig: 0.9, fish: 0.4, crown: 0.4, sword: 1.0, key: 0.4,
  heart: 0.5, gem: 0.35, bread: 0.3, cake: 0.5, book: 0.3, phone: 0.3, flower: 0.5, fire: 0.9, car: 1.5, house: 5, castle: 8, appletree: 5, tree: 5, chest: 0.7, barrel: 0.9, crate: 0.8, cannon: 1.0, ship: 4 };

const norm = (n: string) => n.trim().toLowerCase().replace(/[^a-z ]+/g, "").replace(/\s+/g, " ");
export const canon = (name: string, pile = false): string => {
  const n = norm(name), nn = n.replace(/ /g, ""), last = n.split(" ").pop() ?? n;
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
  put(name: string, x: number, y: number, z: number, h: number, sc = 1, yaw = 0, tumble = 0, pile = false) {
    const c = canon(name, pile); if (!this.has(name, pile)) return false;
    const list = this.pool.get(c) ?? []; this.pool.set(c, list);
    const i = this.used.get(c) ?? 0; this.used.set(c, i + 1);
    if (list.length <= i) { const t = this.tpl.get(c)!; const inst = t.clone(true); (inst.userData as { hNat?: number }).hNat = t.userData.hNat; this.root.add(inst); list.push(inst); }
    const o = list[i], k = (h * sc) / o.userData.hNat;
    o.visible = true; o.position.set(x, y + (h * sc) / 2, z); o.scale.setScalar(k); o.rotation.set(tumble, yaw, 0);
    return true;
  }
  end() { for (const [c, list] of this.pool) for (let i = this.used.get(c) ?? 0; i < list.length; i++) list[i].visible = false; }
}
