// 3D STICKMAN: round white head with a face, thick black limbs, a coloured vest / dress / coat and a role hat.
// Procedural skeleton animated in code (no clips): every frame is a pure function of (pose, time), so renders are stateless.
// Walk phase = distance travelled (feet never slide) and the lowest foot is always planted on the ground.
// The hand node's world position is exposed so weapons / props sit in the stickman's real hand.
import * as THREE from "three";
import { Kit } from "../bridge/build";
import { mk, B, C, S, cone, grp } from "./props3d";

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const INK = "#08080b", SKIN = "#fffaf0";
const sin = Math.sin, cos = Math.cos, clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = (t: number) => t * t * (3 - 2 * t);

export type Pose = { clip: string; w: number; t: number };
export type RigIn = {
  key: string; role: string; v?: number; x: number; y: number; z: number; yaw: number; h: number;
  dist: number; moving: boolean; run: boolean; sit: boolean; drive: boolean; act?: string; doType?: string; doT?: number; hold: boolean; absT: number; idx: number; dead?: boolean; mirror?: boolean;
};

// ---- skeleton dimensions (native units, total height 1.84) ----
const THIGH = 0.45, SHIN = 0.45, UPA = 0.3, FORE = 0.3, TORSO = 0.52, HEADR = 0.19, LIMB = 0.042;
export const NATIVE_H = THIGH + SHIN + TORSO + 0.06 + HEADR * 2;

type P = { tx: number; tz: number; ty: number; hx: number; hy: number; aL: [number, number, number]; aR: [number, number, number]; lL: [number, number, number]; lR: [number, number, number]; rx: number; ry: number; sit: number; lift: number };
const base = (): P => ({ tx: 0, tz: 0, ty: 0, hx: 0, hy: 0, aL: [0, 0.1, 0.12], aR: [0, 0.1, 0.12], lL: [0, 0, 0.03], lR: [0, 0, 0.03], rx: 0, ry: 0, sit: 0, lift: 0 });   // arms [fwd, out, elbow], legs [fwd, knee, out]

function poseOf(i: RigIn): P {
  const p = base(), t = i.doT ?? i.absT, T = i.absT, a = i.act, dt = i.doType, off = i.idx * 0.43;
  const breath = sin((T + off) * 2.1);
  if (i.dead) { const k = sm(clamp((i.doT ?? 0) / 0.7)); p.rx = -1.45 * k; p.ry = 0.12 * k; p.aL = [-1.2 * k, 0.9 * k, 0.4]; p.aR = [-0.8 * k, 1.1 * k, 0.4]; p.lift = 0.13 * k; return p; }
  if (i.drive) { p.sit = 1; p.lL = [1.45, 1.5, 0.05]; p.lR = [1.45, 1.5, 0.05]; p.aL = [1.2, 0.18, 0.5]; p.aR = [1.2, 0.18, 0.5]; p.tx = 0.08 + 0.02 * breath; p.hy = 0.25 * sin(T * 0.7 + off); return p; }
  if (i.sit) { p.sit = 1; p.lL = [1.1, 1.0, 0.42]; p.lR = [1.1, 1.0, 0.42]; p.aL = [0.5, 0.3, 0.4]; p.aR = [0.5, 0.3, 0.4]; p.tx = 0.05 + 0.02 * breath; return p; }
  if (dt === "steal" || dt === "grab" || dt === "take" || dt === "pickup" || dt === "collect" || dt === "pick") {
    const k = clamp(t / 1.2), b = sin(Math.PI * clamp(k * 1.05)); p.tx = 0.95 * b; p.lL = [0.5 * b, 0.9 * b, 0.05]; p.lR = [0.2 * b, 0.7 * b, 0.05];
    p.aR = [0.9 + 1.2 * b - 2.4 * sm(clamp((k - 0.6) / 0.4)), 0.1, 0.3 + 0.4 * b]; p.aL = [0.2 + 0.7 * b, 0.25, 0.3]; p.hx = 0.3 * b; return p;
  }
  if (dt === "dig" || dt === "throw") { const c = (t * 1.1) % 1, k = c < 0.55 ? sm(c / 0.55) : 1 - sm((c - 0.55) / 0.45); p.tx = 0.3 * k - 0.1; p.aR = [-2.6 + 3.2 * k, 0.1, 0.3]; p.aL = [-2.2 + 2.9 * k, 0.15, 0.4]; p.lL = [0.35 * k, 0.4 * k, 0.1]; p.lR = [-0.3 * k, 0.3, 0.1]; return p; }
  if (dt === "write" || dt === "place" || dt === "handOver" || dt === "drink" || dt === "pull" || dt === "push" || dt === "open" || dt === "lean") {
    const wr = dt === "write" ? 0.12 * sin(T * 11) : 0; p.tx = 0.22; p.hx = 0.35; p.aR = [-1.25 + wr, 0.15, 0.95 + wr]; p.aL = [-0.9, 0.25, 1.0]; p.lL = [0.06, 0.08, 0.06]; p.lR = [-0.06, 0.08, 0.06]; return p;
  }
  if (a === "shoot") { const rec = Math.max(0, sin(T * 14)) * 0.07; p.tx = -0.04; p.aR = [-1.52 - rec, 0.04, 0.02]; p.aL = [-1.3, -0.22, 0.45]; p.hx = -0.05; p.lL = [0.3, 0.2, 0.18]; p.lR = [-0.35, 0.25, 0.18]; return p; }
  if (a === "aim") { p.aR = [-1.5, 0.04, 0.02]; p.aL = [-1.3, -0.2, 0.45]; p.lL = [0.25, 0.15, 0.15]; p.lR = [-0.3, 0.2, 0.15]; return p; }
  if (a === "swing" || a === "stab") { const c = (T * 1.2) % 1, k = c < 0.45 ? sm(c / 0.45) : 1 - sm((c - 0.45) / 0.55); p.tx = 0.38 * k - 0.12; p.ty = 0.5 * (0.5 - k); p.aR = [-2.9 + 3.2 * k, 0.08, 0.25 + 0.5 * k]; p.aL = [-0.3, 0.5, 0.5]; p.lL = [0.5 * k, 0.5 * k, 0.1]; p.lR = [-0.4, 0.3, 0.1]; return p; }
  if (a === "kick") { const c = (T * 1.1) % 1, k = sin(Math.PI * c); p.lR = [1.3 * k, 0.2, 0.05]; p.lL = [-0.1, 0.25, 0.05]; p.tx = -0.25 * k; p.aL = [0.9 * k, 0.9, 0.3]; p.aR = [-0.6 * k, 0.7, 0.3]; return p; }
  if (i.moving) {
    if (i.run) {
      const ph = (i.dist / 3.4) * Math.PI * 2, s = sin(ph), c = cos(ph);
      p.tx = 0.3; p.lL = [0.95 * s, 0.35 + 1.15 * Math.max(0, -c), 0.02]; p.lR = [-0.95 * s, 0.35 + 1.15 * Math.max(0, c), 0.02];
      p.aL = [-0.95 * s, 0.08, 1.35]; p.aR = [0.95 * s, 0.08, 1.35]; p.ty = 0.18 * s; p.lift = 0.05 * Math.abs(sin(ph * 2 + 0.6)) * 2; p.hx = -0.12; return p;
    }
    const ph = (i.dist / 1.95) * Math.PI * 2, s = sin(ph), c = cos(ph);
    p.tx = 0.07; p.lL = [0.62 * s, 0.1 + 0.85 * Math.max(0, -c), 0.03]; p.lR = [-0.62 * s, 0.1 + 0.85 * Math.max(0, c), 0.03];
    p.aL = [-0.5 * s, 0.09, 0.2 + 0.25 * Math.max(0, s)]; p.aR = [0.5 * s, 0.09, 0.2 + 0.25 * Math.max(0, -s)]; p.ty = 0.1 * s; p.tz = 0.03 * c; return p;
  }
  if (a === "cheer" || a === "wave" || a === "nod") {
    const w = sin(T * 9 + off); p.aR = [0, 2.75 + 0.15 * w, 0.1]; p.aL = [0, a === "wave" ? 0.15 : 2.75 - 0.15 * w, 0.1]; if (a === "wave") p.aR = [-0.2, 2.5, 0.9 + 0.5 * w];
    p.lift = a === "cheer" ? 0.12 * Math.abs(sin(T * 6)) : 0; p.hx = 0.08 * sin(T * 9); p.lL = [0, 0.08 + p.lift * 2, 0.1]; p.lR = [0, 0.08 + p.lift * 2, 0.1]; return p;
  }
  if (a === "point") { p.aR = [-1.55, 0.05, 0.02]; p.tx = 0.05; return p; }
  if (i.hold) { p.aR = [-1.0, 0.12, 0.5]; p.tx = 0.03; p.lL = [0.05, 0.04, 0.06]; p.lR = [-0.05, 0.04, 0.06]; return p; }
  // idle: breathing, weight shift, small talking gestures
  const sw = sin((T + off) * 0.9), g = sin((T + off) * 2.6), g2 = sin((T + off) * 1.7 + 1);
  p.tx = 0.02 + 0.015 * breath; p.tz = 0.03 * sw; p.hy = 0.22 * sin((T + off) * 0.6); p.hx = 0.04 * g2;
  p.aR = [-0.35 - 0.3 * Math.max(0, g), 0.12 + 0.05 * g2, 0.4 + 0.35 * Math.max(0, g)]; p.aL = [-0.12 - 0.1 * Math.max(0, g2), 0.14, 0.2];
  p.lL = [0.04 + 0.04 * sw, 0.03, 0.05]; p.lR = [-0.04 - 0.04 * sw, 0.05, 0.05]; return p;
}

// ------------------------------------------------------------------ outfits
type Out = { shirt: string; skirt?: string; hat?: () => THREE.Object3D | null; extra?: (r: Rig) => void; hair?: string; brow?: number; patch?: boolean; mask?: boolean; glasses?: boolean; cape?: string };
const PAL = ["#e0553d", "#3d7fe0", "#3fb56a", "#e0a63d", "#9a5bd6", "#e06fa6", "#2fb5b5", "#7a8a3a"];

const crown = () => grp(mk(C(0.3, 0.27, 0.16, 10), "#f2c230", 0, 0.08, 0), ...[0, 1, 2, 3, 4].map((i) => mk(cone(0.05, 0.14, 6), "#f2c230", Math.cos(i * 1.2566) * 0.26, 0.23, Math.sin(i * 1.2566) * 0.26)), mk(S(0.045, 8, 6), "#d6304a", 0, 0.2, 0.29));
const cowboy = () => grp(mk(C(0.55, 0.55, 0.04, 14), "#8a5a2b", 0, 0.02, 0), mk(C(0.27, 0.3, 0.22, 12), "#8a5a2b", 0, 0.14, 0), mk(C(0.285, 0.285, 0.05, 12), "#4a2f18", 0, 0.07, 0));
const helmet = () => grp(mk(S(0.34, 12, 8), "#7d8a5a", 0, 0.02, 0), mk(B(0.06, 0.3, 0.5), "#5e6a42", 0, 0.14, 0));
const tricorn = () => grp(mk(B(0.62, 0.05, 0.62), "#232027", 0, 0.03, 0), mk(C(0.3, 0.33, 0.18, 3), "#232027", 0, 0.14, 0), mk(S(0.045, 6, 5), "#e8e0c8", 0, 0.12, 0.31));
const straw = () => grp(mk(C(0.52, 0.52, 0.03, 14), "#e0c56e", 0, 0.02, 0), mk(C(0.25, 0.28, 0.17, 12), "#e0c56e", 0, 0.1, 0), mk(C(0.285, 0.285, 0.04, 12), "#b8403a", 0, 0.05, 0));
const wizard = () => grp(mk(C(0.55, 0.55, 0.03, 14), "#3b2f8a", 0, 0.02, 0), mk(cone(0.28, 0.65, 12), "#3b2f8a", 0, 0.36, 0), mk(S(0.05, 6, 5), "#f2c230", 0, 0.46, 0.14));
const chef = () => grp(mk(C(0.3, 0.3, 0.1, 12), "#f5f5f5", 0, 0.05, 0), mk(S(0.3, 12, 8), "#f5f5f5", 0, 0.22, 0));
const cap = (c: string) => () => grp(mk(S(0.32, 12, 8), c, 0, 0.0, 0), mk(B(0.34, 0.03, 0.22), c, 0, -0.02, 0.34));
const turban = () => grp(mk(S(0.35, 12, 8), "#f0e7d0", 0, 0.05, 0), mk(S(0.06, 6, 5), "#2a9d8f", 0, 0.12, 0.33));
const nemes = () => grp(mk(C(0.33, 0.36, 0.2, 10), "#2a6fb5", 0, 0.08, 0), mk(B(0.12, 0.3, 0.1), "#f2c230", 0, 0.0, 0.33));
const beanie = () => grp(mk(S(0.33, 12, 8), "#1b1b22", 0, 0.0, 0), mk(S(0.05, 6, 5), "#1b1b22", 0, 0.3, 0));
const bun = () => grp(mk(S(0.09, 8, 6), "#3a2a20", 0, 0.1, -0.3));

const O: [RegExp, Out][] = [
  [/king|emperor|sultan/, { shirt: "#8f1d2c", hat: crown, cape: "#b3202f", brow: 0.12 }],
  [/queen|princess/, { shirt: "#7d3fbf", skirt: "#7d3fbf", hat: crown, hair: "#3a2a20" }],
  [/pharaoh/, { shirt: "#f2c230", hat: nemes, cape: "#2a6fb5" }],
  [/sheriff|cowboy|marshal/, { shirt: "#a8793a", hat: cowboy, brow: 0.25, extra: (r) => { const st = mk(S(0.045, 5, 3), "#f2c230", 0.07, 0.38, 0.1); st.scale.set(1.3, 1.3, 0.3); r.torso.add(st); } }],
  [/police|cop|officer|guard|detective|ranger/, { shirt: "#2e56a8", hat: cap("#1e3a78"), brow: 0.2 }],
  [/pirate|captain|sailor|buccaneer/, { shirt: "#b5352c", hat: tricorn, patch: true, brow: 0.3 }],
  [/thief|robber|bandit|burglar|criminal|outlaw|crook|smuggler/, { shirt: "#23232b", hat: beanie, mask: true, brow: 0.35 }],
  [/ninja|assassin|spy/, { shirt: "#1a1a22", mask: true, brow: 0.35 }],
  [/soldier|knight|warrior|army|hunter|archer|general/, { shirt: "#5a7a3e", hat: helmet, brow: 0.2 }],
  [/farmer|peasant|villager|gardener|fisher/, { shirt: "#3b6fb5", hat: straw }],
  [/wizard|witch|mage|sorcer|sage/, { shirt: "#3b2f8a", skirt: "#3b2f8a", hat: wizard, brow: 0.1 }],
  [/chef|cook|baker/, { shirt: "#f4f4f4", hat: chef }],
  [/scientist|doctor|professor|teacher|engineer|inventor/, { shirt: "#f1f4f6", glasses: true }],
  [/nurse/, { shirt: "#e8f4f6", hat: cap("#ffffff"), hair: "#3a2a20" }],
  [/merchant|seller|trader|shopkeeper|vendor|arab|nomad/, { shirt: "#2a9d8f", hat: turban }],
  [/businessman|banker|boss|manager|lawyer|politician|president|mayor|agent|ceo|judge|governor/, { shirt: "#2b2f3a", extra: (r) => { const tie = mk(B(0.05, 0.28, 0.03), "#d6304a", 0, 0.32, 0.105); r.torso.add(tie); } }],
  [/driver|pilot|worker|miner|builder/, { shirt: "#e0a22a", hat: cap("#e0a22a") }],
  [/girl|woman|lady|mother|mom|wife|maid|sister|daughter|aunt|female|bride|waitress/, { shirt: "#e06fa6", skirt: "#e06fa6", hair: "#3a2a20" }],
];
const outfitFor = (role: string): Out => { const r = role.toLowerCase(); for (const [re, o] of O) if (re.test(r)) return o; const h = hash(r); return { shirt: PAL[h % PAL.length], hat: h % 5 === 0 ? cap(PAL[(h >> 3) % PAL.length]) : undefined, brow: 0 }; };

// ------------------------------------------------------------------ rig
class Rig {
  root = new THREE.Group(); pelvis = new THREE.Group(); torso = new THREE.Group(); head = new THREE.Group(); body = new THREE.Group();
  shL = new THREE.Group(); shR = new THREE.Group(); elL = new THREE.Group(); elR = new THREE.Group(); handL = new THREE.Group(); handR = new THREE.Group();
  hpL = new THREE.Group(); hpR = new THREE.Group(); knL = new THREE.Group(); knR = new THREE.Group();
  hNat = NATIVE_H; role = ""; dyn: THREE.Object3D[] = [];
  constructor() {
    const line = (len: number, r = LIMB, col = INK) => grp(mk(C(r, r, len, 10), col, 0, -len / 2, 0));
    this.root.add(this.body); this.body.add(this.pelvis);
    // torso: coloured vest on a black spine, head on a neck
    this.pelvis.add(this.torso);
    this.torso.add(mk(C(0.085, 0.075, TORSO, 14), INK, 0, TORSO / 2, 0));
    const hd = this.head; hd.position.set(0, TORSO + 0.06, 0); this.torso.add(hd);
    hd.add(mk(S(HEADR, 24, 18), SKIN, 0, HEADR, 0));
    hd.add(mk(S(0.026, 8, 6), INK, 0.068, HEADR + 0.03, HEADR - 0.012), mk(S(0.026, 8, 6), INK, -0.068, HEADR + 0.03, HEADR - 0.012));
    hd.add(mk(B(0.075, 0.014, 0.012), INK, 0, HEADR - 0.075, HEADR - 0.004));
    // arms
    for (const [sh, el, hn, sx] of [[this.shL, this.elL, this.handL, 0.055], [this.shR, this.elR, this.handR, -0.055]] as const) {
      sh.position.set(sx, TORSO - 0.04, 0); this.torso.add(sh); sh.add(line(UPA), mk(S(LIMB * 1.15, 8, 6), INK, 0, 0, 0));
      el.position.set(0, -UPA, 0); sh.add(el); el.add(line(FORE), mk(S(LIMB * 1.15, 8, 6), INK, 0, 0, 0));
      hn.position.set(0, -FORE, 0); el.add(hn); hn.add(mk(S(0.052, 10, 8), INK, 0, 0, 0));
    }
    // legs (hips on the pelvis)
    for (const [hp, kn, sx] of [[this.hpL, this.knL, 0.07], [this.hpR, this.knR, -0.07]] as const) {
      hp.position.set(sx, 0, 0); this.pelvis.add(hp); hp.add(line(THIGH, LIMB * 1.1), mk(S(LIMB * 1.2, 8, 6), INK, 0, 0, 0));
      kn.position.set(0, -THIGH, 0); hp.add(kn); kn.add(line(SHIN, LIMB * 1.1), mk(S(LIMB * 1.15, 8, 6), INK, 0, 0, 0));
      const ft = mk(S(0.058, 10, 8), INK, 0, -SHIN + 0.02, 0.055, 0.85, 0.6, 1.9); kn.add(ft);
    }
    this.root.traverse((n) => { const m = n as THREE.Mesh; if (m.isMesh) { m.castShadow = true; } });
  }
  dress(role: string) {
    if (this.role === role) return; this.role = role;
    for (const d of this.dyn) d.parent?.remove(d); this.dyn = [];
    const o = outfitFor(role), add = (par: THREE.Object3D, ...c: THREE.Object3D[]) => { for (const x of c) { par.add(x); this.dyn.push(x); } };
    add(this.torso, mk(C(0.115, 0.095, TORSO * 0.88, 16), o.shirt, 0, TORSO * 0.47, 0));
    if (o.skirt) add(this.pelvis, mk(cone(0.26, 0.55, 18), o.skirt, 0, -0.22, 0));
    if (o.cape) add(this.torso, mk(B(0.34, 0.62, 0.035), o.cape, 0, 0.26, -0.13));
    if (o.hair) add(this.head, mk(S(HEADR * 1.06, 14, 10), o.hair, 0, HEADR + 0.04, -0.035, 1, 0.9, 1), mk(S(0.07, 8, 6), o.hair, 0, HEADR + 0.02, -0.2));
    if (o.brow) add(this.head, mk(B(0.085, 0.017, 0.014), INK, 0.07, HEADR + 0.085, HEADR - 0.004, 1, 1, 1, 0, 0, -o.brow * 2), mk(B(0.085, 0.017, 0.014), INK, -0.07, HEADR + 0.085, HEADR - 0.004, 1, 1, 1, 0, 0, o.brow * 2));
    if (o.mask) add(this.head, mk(B(0.4, 0.085, 0.4), "#14141a", 0, HEADR + 0.03, 0));
    if (o.patch) add(this.head, mk(S(0.045, 8, 6), "#14141a", 0.068, HEADR + 0.03, HEADR + 0.0, 1, 1, 0.4));
    if (o.glasses) add(this.head, mk(new THREE.TorusGeometry(0.045, 0.01, 6, 16), INK, 0.068, HEADR + 0.03, HEADR + 0.01), mk(new THREE.TorusGeometry(0.045, 0.01, 6, 16), INK, -0.068, HEADR + 0.03, HEADR + 0.01));
    const hat = o.hat?.();
    if (hat) { const w = new THREE.Group(); w.add(hat); w.scale.setScalar(0.62); w.position.set(0, HEADR * 2 - 0.01, 0); add(this.head, w); }
    o.extra?.(this);
    if (this.dyn.length) this.root.traverse((n) => { const m = n as THREE.Mesh; if (m.isMesh) m.castShadow = true; });
  }
  apply(p: P) {
    // legs first so the pelvis can be dropped to plant the lowest foot
    const L = p.lL, R = p.lR;
    this.hpL.rotation.set(-L[0], 0, L[2]); this.knL.rotation.set(L[1], 0, 0); this.hpR.rotation.set(-R[0], 0, -R[2]); this.knR.rotation.set(R[1], 0, 0);
    const drop = (l: [number, number, number]) => THIGH * cos(l[0]) + SHIN * cos(l[0] - l[1]);
    this.pelvis.position.set(0, p.sit ? 0.5 : Math.max(drop(L), drop(R)) + p.lift, 0);
    this.body.rotation.set(p.rx, p.ry, 0); this.body.position.set(0, p.rx !== 0 ? 0.2 * Math.abs(sin(p.rx)) : 0, 0);
    this.torso.rotation.set(p.tx, p.ty, p.tz); this.head.rotation.set(p.hx - p.tx * 0.5, p.hy, 0);
    this.shL.rotation.set(-p.aL[0], 0, p.aL[1]); this.elL.rotation.set(-p.aL[2], 0, 0);
    this.shR.rotation.set(-p.aR[0], 0, -p.aR[1]); this.elR.rotation.set(-p.aR[2], 0, 0);
  }
  hand(side: 1 | -1, out: THREE.Vector3) { this.root.updateMatrixWorld(true); return (side > 0 ? this.handR : this.handL).getWorldPosition(out); }
}

export class Rigs {
  private pool = new Map<string, Rig>(); private seen = new Set<string>();
  constructor(private root: THREE.Object3D, _kit?: Kit) { void _kit; }
  get ready() { return true; }
  begin() { this.seen.clear(); }
  put(i: RigIn): Rig {
    let r = this.pool.get(i.key); if (!r) { r = new Rig(); this.root.add(r.root); this.pool.set(i.key, r); }
    this.seen.add(i.key); r.dress(i.role); r.root.visible = true;
    r.apply(poseOf(i));
    r.root.position.set(i.x, i.y, i.z); r.root.rotation.set(0, i.yaw, 0); r.root.scale.setScalar(i.h / NATIVE_H);
    return r;
  }
  end() { for (const [k, r] of this.pool) if (!this.seen.has(k)) r.root.visible = false; }
}
void cone; void B; void S; void C;
