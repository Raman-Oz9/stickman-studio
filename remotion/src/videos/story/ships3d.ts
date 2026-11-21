// Lightweight procedural sailing ship (galleon): lofted curved hull with sheer, planked deck, bulwarks, stern castle with
// windows, forecastle, three masts with belly-shaped sails, flag, bowsprit + jib, rigging, cannons, gun ports, helm, barrels.
// Bow points +z. Everything is primitives/lofted geometry (a few KB), textured with the generated wood_planks image.
import * as THREE from "three";
import { TEX } from "./texcache";

const wood = (color: string, rx: number, ry: number, side: THREE.Side = THREE.FrontSide) => {
  const m = new THREE.MeshLambertMaterial({ color, side });
  if (TEX.wood_planks) { const t = TEX.wood_planks.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); m.map = t; }
  return m;
};
const flat = (color: string, side: THREE.Side = THREE.FrontSide) => new THREE.MeshLambertMaterial({ color, side });
const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => { const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; return o; };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const L = 7, BM = 1.25, DEPTH = 0.95, DECK = 0.55, N = 26, M = 7;
const tOf = (z: number) => (z + L / 2) / L;
const beam = (t: number) => BM * (t < 0.16 ? 0.7 + 0.3 * (t / 0.16) : t > 0.68 ? Math.max(0.03, 1 - Math.pow((t - 0.68) / 0.32, 1.6)) : 1);
const deckAt = (t: number) => DECK + 0.38 * Math.pow(Math.abs(t - 0.5) * 2, 2.2);
const keel = (t: number) => DEPTH * (0.78 + 0.22 * Math.sin(Math.PI * t)) * (t > 0.85 ? 1 - ((t - 0.85) / 0.15) * 0.55 : 1);

const grid = (pts: THREE.Vector3[][], uvf: (i: number, j: number) => [number, number]) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  pts.forEach((row, i) => row.forEach((p, j) => { pos.push(p.x, p.y, p.z); const u = uvf(i, j); uv.push(u[0], u[1]); }));
  const W = pts[0].length;
  for (let i = 0; i < pts.length - 1; i++) for (let j = 0; j < W - 1; j++) { const a = i * W + j, b = a + 1, c = a + W, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
};
const rope = (a: THREE.Vector3, b: THREE.Vector3, r = 0.014, col = "#2b1d12") => {
  const d = b.clone().sub(a), len = d.length(); const m = mesh(new THREE.CylinderGeometry(r, r, len, 5), flat(col));
  m.position.copy(a.clone().add(b).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.castShadow = false; return m;
};
const sail = (w: number, h: number, belly: number, band = true) => {
  const g = new THREE.PlaneGeometry(w, h, 10, 8), p = g.attributes.position, cols: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / w + 0.5, v = p.getY(i) / h + 0.5;
    p.setZ(i, belly * Math.sin(Math.PI * u) * (0.35 + 0.65 * Math.sin(Math.PI * (0.15 + 0.7 * (1 - v)))));
    const red = band && v > 0.4 && v < 0.55 && u > 0.42 && u < 0.58; const c = new THREE.Color(red ? "#b3261e" : "#f3ead2"); const shade = 0.88 + 0.12 * Math.sin(u * 9);
    cols.push(c.r * shade, c.g * shade, c.b * shade);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
  const o = mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); o.castShadow = false; return o;
};

export const buildGalleon = (): THREE.Object3D => {
  const G = new THREE.Group();
  // ---- hull (lofted half-ellipse sections, sheer rising to bow and stern)
  const hull: THREE.Vector3[][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, w = beam(t), yd = deckAt(t), kb = keel(t), z = -L / 2 + t * L, row: THREE.Vector3[] = [];
    for (let j = 0; j <= M; j++) { const a = (j / M) * Math.PI; row.push(V(w * Math.cos(a), yd - (yd + kb) * Math.pow(Math.sin(a), 0.85), z)); }
    hull.push(row);
  }
  G.add(mesh(grid(hull, (i, j) => [(i / N) * 7, (j / M) * 1.6]), wood("#7a4a26", 1, 1, THREE.DoubleSide)));
  // transom (flat stern plate)
  { const row = hull[0], g = new THREE.BufferGeometry(), pos: number[] = [], idx: number[] = []; row.forEach((p) => pos.push(p.x, p.y, p.z)); pos.push(0, deckAt(0) * 0.5, -L / 2); row.forEach((_, j) => { if (j < M) idx.push(j, j + 1, row.length); }); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); G.add(mesh(g, flat("#5a3519", THREE.DoubleSide))); }
  // gold wale stripe along each side
  for (const s of [-1, 1]) {
    const rows: THREE.Vector3[][] = [];
    for (let i = 2; i <= N - 1; i++) { const t = i / N, w = beam(t), y = deckAt(t) - 0.28, z = -L / 2 + t * L, a1 = Math.acos(1 - 0.0), wy = (k: number) => V(s * w * 1.012 * (1 + 0.0 * a1), y - k * 0.1, z); rows.push([wy(0), wy(1)]); }
    G.add(mesh(grid(rows, () => [0, 0]), flat("#d9a441", THREE.DoubleSide)));
  }
  // ---- deck + bulwarks
  const deck: THREE.Vector3[][] = [];
  for (let i = 0; i <= N; i++) { const t = i / N, w = beam(t) * 0.985, y = deckAt(t) + 0.01, z = -L / 2 + t * L; deck.push([V(-w, y, z), V(0, y, z), V(w, y, z)]); }
  G.add(mesh(grid(deck, (i, j) => [j * 1.6, (i / N) * 6]), wood("#c79a62", 1, 1, THREE.DoubleSide)));
  for (const s of [-1, 1]) {
    const wall: THREE.Vector3[][] = [], top: THREE.Vector3[][] = [];
    for (let i = 1; i < N; i++) { const t = i / N, w = beam(t), y = deckAt(t), z = -L / 2 + t * L; wall.push([V(s * w, y, z), V(s * w * 0.99, y + 0.34, z)]); top.push([V(s * w * 1.03, y + 0.34, z), V(s * w * 0.9, y + 0.36, z)]); }
    G.add(mesh(grid(wall, (i, j) => [i * 0.3, j]), wood("#5e3a1d", 1, 1, THREE.DoubleSide))); G.add(mesh(grid(top, () => [0, 0]), flat("#3d2512", THREE.DoubleSide)));
    // gun ports + cannons
    for (const z of [-1.1, -0.35, 0.4, 1.15, 1.9]) {
      const t = tOf(z), w = beam(t), y = deckAt(t);
      const port = mesh(new THREE.BoxGeometry(0.04, 0.2, 0.24), flat("#1a1008")); port.position.set(s * (w * 1.0 + 0.0), y - 0.16, z); G.add(port);
      const can = mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.55, 10), flat("#26262c")); can.rotation.z = Math.PI / 2; can.position.set(s * (w * 0.8), y + 0.12, z); G.add(can);
      const car = mesh(new THREE.BoxGeometry(0.4, 0.1, 0.22), flat("#4a2f1a")); car.position.set(s * (w * 0.72), y + 0.05, z); G.add(car);
    }
  }
  // ---- stern castle, windows, lantern, forecastle
  const sy = deckAt(0.04);
  const castle = mesh(new THREE.BoxGeometry(BM * 1.62, 0.8, 1.5), wood("#8a5a2f", 2, 1)); castle.position.set(0, sy + 0.4, -L / 2 + 1.0); G.add(castle);
  const castleTop = mesh(new THREE.BoxGeometry(BM * 1.7, 0.07, 1.6), flat("#4b2e17")); castleTop.position.set(0, sy + 0.84, -L / 2 + 1.0); G.add(castleTop);
  for (const x of [-0.52, 0, 0.52]) { const wn = mesh(new THREE.BoxGeometry(0.26, 0.26, 0.05), flat("#f7d77a")); wn.position.set(x, sy + 0.45, -L / 2 + 0.24); G.add(wn); const fr = mesh(new THREE.BoxGeometry(0.32, 0.32, 0.03), flat("#d9a441")); fr.position.set(x, sy + 0.45, -L / 2 + 0.235); G.add(fr); }
  const lant = mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: "#ffd35a" })); lant.position.set(0, sy + 1.05, -L / 2 + 0.35); G.add(lant);
  const lp = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 5), flat("#2b1d12")); lp.position.set(0, sy + 0.93, -L / 2 + 0.35); G.add(lp);
  const fy = deckAt(0.8), fore = mesh(new THREE.BoxGeometry(BM * 1.05, 0.5, 1.0), wood("#8a5a2f", 1.5, 1)); fore.position.set(0, fy + 0.15, L / 2 - 1.15); G.add(fore);
  // ---- masts, yards, sails
  const masts: { z: number; h: number; yards: [number, number, number][] }[] = [
    { z: 0.45, h: 5.3, yards: [[3.0, 2.5, 1.9], [4.5, 1.8, 1.15]] }, { z: 1.95, h: 4.3, yards: [[2.5, 2.0, 1.5], [3.7, 1.4, 0.95]] }, { z: -1.75, h: 3.7, yards: [[2.7, 1.7, 1.3]] },
  ];
  masts.forEach((m, k) => {
    const base = deckAt(tOf(m.z)), mast = mesh(new THREE.CylinderGeometry(0.06, 0.1, m.h, 8), flat("#4a2f1a")); mast.position.set(0, base + m.h / 2, m.z); G.add(mast);
    m.yards.forEach(([yy, w, h], q) => {
      const yd = mesh(new THREE.CylinderGeometry(0.035, 0.035, w + 0.2, 6), flat("#3d2512")); yd.rotation.z = Math.PI / 2; yd.position.set(0, base + yy, m.z); G.add(yd);
      const s = sail(w * 0.94, h, 0.32, q === 0 && k === 0); s.position.set(0, base + yy - h / 2 - 0.02, m.z + 0.05); s.userData.flap = k * 1.7 + q; G.add(s);
    });
    if (k === 0) { // crow's nest + flag
      const nest = mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.22, 10, 1, true), wood("#5e3a1d", 1, 1, THREE.DoubleSide)); nest.position.set(0, base + 4.0, m.z); G.add(nest);
      const fg = new THREE.PlaneGeometry(0.7, 0.38); fg.translate(0.35, 0, 0); const fl = mesh(fg, flat("#b3261e", THREE.DoubleSide)); fl.position.set(0, base + m.h - 0.1, m.z); fl.userData.flap = 0.5; fl.castShadow = false; G.add(fl);
    }
    // shrouds to the rails
    const ty = base + m.h * 0.78, rail = deckAt(tOf(m.z)) + 0.34, bw = beam(tOf(m.z));
    for (const s of [-1, 1]) for (const dz of [-0.18, 0.18]) G.add(rope(V(0, ty, m.z), V(s * bw * 0.97, rail, m.z + dz)));
  });
  // ---- bowsprit, jib and stays
  const bsy = deckAt(0.9) + 0.1, tip = V(0, bsy + 0.55, L / 2 + 1.35);
  { const bs = mesh(new THREE.CylinderGeometry(0.045, 0.07, 2.1, 7), flat("#4a2f1a")); const a = V(0, bsy, L / 2 - 0.45), d = tip.clone().sub(a); bs.position.copy(a.clone().add(tip).multiplyScalar(0.5)); bs.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); G.add(bs); }
  { const fb = deckAt(tOf(1.95)), top = V(0, fb + 4.3 * 0.97, 1.95), low = V(0, bsy + 0.1, L / 2 - 0.5); const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([tip.x, tip.y, tip.z, top.x, top.y - 0.4, top.z + 0.1, low.x, low.y, low.z], 3)); g.setIndex([0, 1, 2]); g.computeVertexNormals(); const j = mesh(g, flat("#f3ead2", THREE.DoubleSide)); j.castShadow = false; j.userData.flap = 2.2; G.add(j);
    G.add(rope(V(0, deckAt(tOf(0.45)) + 5.3, 0.45), V(0, deckAt(tOf(1.95)) + 4.3, 1.95)), rope(V(0, deckAt(tOf(1.95)) + 4.3, 1.95), tip), rope(V(0, deckAt(tOf(0.45)) + 5.3, 0.45), V(0, deckAt(tOf(-1.75)) + 3.7, -1.75))); }
  // ---- helm wheel, barrels, crates on deck
  { const wh = mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 16), flat("#8a5a2f")); wh.position.set(0, deckAt(0.3) + 0.5, -L / 2 + 1.95); G.add(wh); const st = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), flat("#4a2f1a")); st.position.set(0, deckAt(0.3) + 0.25, -L / 2 + 1.95); G.add(st); }
  for (const [x, z] of [[0.55, -0.4], [0.75, -0.15], [-0.65, 0.9]] as [number, number][]) { const b = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.34, 10), wood("#8a5a2f", 1, 1)); b.position.set(x, deckAt(tOf(z)) + 0.17, z); G.add(b); }
  for (const [x, z] of [[-0.6, -0.5], [0.0, 1.2]] as [number, number][]) { const c = mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), wood("#b98b55", 1, 1)); c.position.set(x, deckAt(tOf(z)) + 0.15, z); c.rotation.y = 0.4; G.add(c); }
  return G;
};
