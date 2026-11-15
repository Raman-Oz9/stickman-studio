// Real 3D rigged characters (Kenney CC0 "blocky characters": 27 skeletal clips each) replace the flat cards.
// Every frame is rendered statelessly: clips are sampled at absolute times (walk time = distance travelled, so feet never slide),
// crossfaded by weight, and the hand node's world position is exposed so held weapons / props sit in the real hand.
import * as THREE from "three";
import { Kit } from "../bridge/build";
import { KIT_ANIMS } from "../bridge/world";
import { mk, B, C, S, cone, grp } from "./props3d";

export const CHAR_MODELS = "abcdefghijklmnopqr".split("").map((c) => "character-" + c);
const CLIPS = ["idle", "walk", "sprint", "sit", "drive", "die", "pick-up", "emote-yes", "emote-no", "holding-right", "holding-both", "holding-right-shoot", "attack-melee-right", "attack-kick-right", "interact-right", "interact-left"];
const ONCE = new Set(["die", "pick-up", "emote-no", "interact-right", "interact-left", "attack-kick-right"]);
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

export type Pose = { clip: string; w: number; t: number };
export type RigIn = {
  key: string; role: string; v?: number; x: number; y: number; z: number; yaw: number; h: number;
  dist: number; moving: boolean; run: boolean; sit: boolean; drive: boolean; act?: string; doType?: string; doT?: number; hold: boolean; absT: number; idx: number; dead?: boolean; mirror?: boolean;
};

class Rig {
  root = new THREE.Group(); mixer: THREE.AnimationMixer; acts = new Map<string, THREE.AnimationAction>(); hat: THREE.Object3D | null = null; hNat = 1;
  armR: THREE.Object3D | null = null; armL: THREE.Object3D | null = null; armLen = 0.4; role = "";
  constructor(src: THREE.Object3D, clips: THREE.AnimationClip[]) {
    const inner = src.clone(true); this.root.add(inner);
    inner.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(inner), sz = box.getSize(new THREE.Vector3());
    this.hNat = Math.max(0.01, sz.y); inner.position.y = -box.min.y;
    inner.traverse((n) => {
      const m = n as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
      if (n.name === "arm-right") this.armR = n; if (n.name === "arm-left") this.armL = n;
    });
    this.mixer = new THREE.AnimationMixer(inner);
    for (const c of clips) if (CLIPS.includes(c.name)) { const a = this.mixer.clipAction(c); a.play(); a.paused = true; a.setEffectiveWeight(0); this.acts.set(c.name, a); }
    this.armLen = this.hNat * 0.36;
  }
  /** hat / crown / helmet from primitives on the head node, sized from the head's own bounds */
  dress(role: string, kit: Kit) {
    if (this.role === role) return; this.role = role;
    if (this.hat) { this.hat.parent?.remove(this.hat); this.hat = null; }
    const head = this.root.getObjectByName("head"); if (!head) return;
    const h = hatFor(role); if (!h) return;
    this.root.updateMatrixWorld(true);
    const hb = new THREE.Box3().setFromObject(head), top = hb.max.y, cw = hb.getSize(new THREE.Vector3()).x;
    const w = new THREE.Group(); w.add(h); const k = cw / 0.62; w.scale.setScalar(k);   // hat recipes are built for a 0.62 wide head
    const p = new THREE.Vector3((hb.min.x + hb.max.x) / 2, top, (hb.min.z + hb.max.z) / 2); head.worldToLocal(p); w.position.copy(p);
    const inv = new THREE.Vector3(); head.getWorldScale(inv); w.scale.divide(inv);
    head.add(w); this.hat = w;
  }
  hand(side: 1 | -1, out: THREE.Vector3) {
    const a = side > 0 ? this.armR : this.armL; this.root.updateMatrixWorld(true);
    if (!a) return out.setFromMatrixPosition(this.root.matrixWorld).add(new THREE.Vector3(0, this.hNat * 0.5, 0));
    const ws = new THREE.Vector3(); a.getWorldScale(ws);
    void ws; return out.set(0, -this.armLen, 0).applyMatrix4(a.matrixWorld);
  }
}

const HAT: Record<string, () => THREE.Object3D | null> = {};
const flat = (col: string, w: number, h: number, d: number, x = 0, y = 0, z = 0) => mk(B(w, h, d), col, x, y, z);
const crown = () => grp(mk(C(0.3, 0.27, 0.16, 10), "#f2c230", 0, 0.08, 0), ...[0, 1, 2, 3, 4].map((i) => mk(cone(0.05, 0.14, 6), "#f2c230", Math.cos(i * 1.2566) * 0.26, 0.23, Math.sin(i * 1.2566) * 0.26)), mk(S(0.045, 8, 6), "#d6304a", 0, 0.2, 0.29));
const cowboy = () => grp(mk(C(0.55, 0.55, 0.04, 14), "#8a5a2b", 0, 0.02, 0), mk(C(0.27, 0.3, 0.22, 12), "#8a5a2b", 0, 0.14, 0), mk(C(0.285, 0.285, 0.05, 12), "#4a2f18", 0, 0.07, 0));
const helmet = () => grp(mk(S(0.34, 12, 8), "#8f98a6", 0, 0.02, 0), mk(B(0.06, 0.3, 0.5), "#6f7886", 0, 0.14, 0));
const tricorn = () => grp(mk(B(0.62, 0.05, 0.62), "#232027", 0, 0.03, 0), mk(C(0.3, 0.33, 0.18, 3), "#232027", 0, 0.14, 0), mk(S(0.045, 6, 5), "#e8e0c8", 0, 0.12, 0.31));
const straw = () => grp(mk(C(0.52, 0.52, 0.03, 14), "#e0c56e", 0, 0.02, 0), mk(C(0.25, 0.28, 0.17, 12), "#e0c56e", 0, 0.1, 0), mk(C(0.285, 0.285, 0.04, 12), "#b8403a", 0, 0.05, 0));
const wizard = () => grp(mk(C(0.55, 0.55, 0.03, 14), "#3b2f8a", 0, 0.02, 0), mk(cone(0.28, 0.65, 12), "#3b2f8a", 0, 0.36, 0), mk(S(0.05, 6, 5), "#f2c230", 0, 0.46, 0.14));
const chef = () => grp(mk(C(0.3, 0.3, 0.1, 12), "#f5f5f5", 0, 0.05, 0), mk(S(0.3, 12, 8), "#f5f5f5", 0, 0.22, 0));
const cap = (c: string) => () => grp(mk(S(0.32, 12, 8), c, 0, 0.02, 0), mk(B(0.34, 0.03, 0.22), c, 0, 0.0, 0.34));
const turban = () => grp(mk(S(0.35, 12, 8), "#f0e7d0", 0, 0.05, 0), mk(S(0.06, 6, 5), "#2a9d8f", 0, 0.12, 0.33));
const nemes = () => grp(mk(C(0.33, 0.36, 0.2, 10), "#2a6fb5", 0, 0.08, 0), mk(B(0.12, 0.3, 0.1), "#f2c230", 0, 0.0, 0.33));
const bandit = () => grp(mk(S(0.33, 12, 8), "#1b1b22", 0, 0.03, 0), mk(B(0.56, 0.12, 0.05), "#1b1b22", 0, -0.12, 0.31));
const HATS: [RegExp, () => THREE.Object3D | null][] = [
  [/king|queen|prince|princess|emperor|royal/, crown], [/pharaoh/, nemes], [/sheriff|cowboy|ranger|outlaw/, cowboy], [/thief|robber|bandit|burglar|criminal/, bandit], [/pirate|captain|sailor/, tricorn],
  [/soldier|guard|knight|warrior|army|police|cop|officer/, helmet], [/farmer|peasant|villager|gardener/, straw], [/wizard|witch|mage|sorcer/, wizard], [/chef|cook|baker/, chef],
  [/merchant|seller|trader|shopkeeper|vendor|arab|sultan|nomad/, turban], [/doctor|nurse/, cap("#e8f0f4")], [/driver|pilot|worker|miner|builder/, cap("#e0a22a")],
];
const hatFor = (role: string) => { const r = role.toLowerCase(); for (const [re, f] of HATS) if (re.test(r)) return f(); return null; };
void HAT; void flat;

export class Rigs {
  private pool = new Map<string, Rig>(); private seen = new Set<string>(); private tmp = new THREE.Vector3();
  constructor(private root: THREE.Object3D, private kit: Kit) {}
  get ready() { return CHAR_MODELS.some((m) => this.kit[m] && KIT_ANIMS[m]?.length); }
  begin() { this.seen.clear(); }
  model(role: string, v = 0) { const r = role.toLowerCase(); const dm = /^char-([a-r])$/.exec(r); if (dm) return "character-" + dm[1]; return CHAR_MODELS[(hash(r) + v * 5) % CHAR_MODELS.length]; }
  /** pose one character and return its rig so the caller can read hand positions */
  put(i: RigIn): Rig | null {
    const m = this.model(i.role, i.v ?? 0); if (!this.kit[m]) return null;
    const pk = i.key + "|" + m; let r = this.pool.get(pk);
    if (!r) { r = new Rig(this.kit[m], KIT_ANIMS[m] ?? []); this.root.add(r.root); this.pool.set(pk, r); }
    this.seen.add(pk); r.dress(i.role, this.kit);
    r.root.visible = true; r.root.position.set(i.x, i.y, i.z); r.root.rotation.set(0, i.yaw, 0); r.root.scale.setScalar(i.h / r.hNat);
    const list: Pose[] = this.poses(i);
    const w = new Map(list.map((p) => [p.clip, p])); const dur = (n: string) => r!.acts.get(n)?.getClip().duration ?? 1;
    for (const [n, a] of r.acts) {
      const p = w.get(n);
      if (!p || p.w <= 0.001) { a.setEffectiveWeight(0); continue; }
      const d = dur(n); a.setEffectiveWeight(p.w); a.time = ONCE.has(n) ? Math.min(d * 0.999, Math.max(0, p.t)) : ((p.t % d) + d) % d;
    }
    r.mixer.update(0);
    return r;
  }
  end() { for (const [k, r] of this.pool) if (!this.seen.has(k)) r.root.visible = false; }
  private poses(i: RigIn): Pose[] {
    const off = i.idx * 0.43;
    if (i.dead) return [{ clip: "die", w: 1, t: i.doT ?? 0 }];
    if (i.drive) return [{ clip: "drive", w: 1, t: 0 }];
    if (i.sit) return [{ clip: "sit", w: 1, t: 0 }];
    const a = i.act, dt = i.doType, t = i.doT ?? i.absT;
    if (dt === "steal" || dt === "grab" || dt === "take" || dt === "pickup" || dt === "collect" || dt === "pick") return [{ clip: "pick-up", w: 1, t }];
    if (dt === "dig" || dt === "throw") return [{ clip: "attack-melee-right", w: 1, t: t * 1.1 }];
    if (dt === "write" || dt === "place" || dt === "handOver" || dt === "drink" || dt === "pull" || dt === "push" || dt === "open" || dt === "lean") return [{ clip: "interact-right", w: 1, t }];
    if (a === "shoot") return [{ clip: "holding-right-shoot", w: 1, t: i.absT }];
    if (a === "aim") return [{ clip: "holding-right", w: 1, t: 0 }];
    if (a === "swing" || a === "stab") return [{ clip: "attack-melee-right", w: 1, t: i.absT * 1.15 }];
    if (i.moving) return i.run ? [{ clip: "sprint", w: 1, t: i.dist / 3.2 }] : [{ clip: "walk", w: 1, t: i.dist / 1.25 }];
    if (a === "cheer" || a === "wave" || a === "nod") return [{ clip: "emote-yes", w: 1, t: i.absT * 1.0 + off }];
    if (a === "point") return [{ clip: "holding-right", w: 1, t: 0 }];
    if (i.hold) return [{ clip: "holding-right", w: 1, t: 0 }];
    return [{ clip: "idle", w: 1, t: i.absT + off }];
  }
}
