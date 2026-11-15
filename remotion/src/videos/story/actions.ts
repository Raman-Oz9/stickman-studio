// Universal physical-action layer. ONE rule: the WORLD-space contact point is the master; the hand is the slave.
// Per frame: progress -> easing -> sample contactCurve -> contact point -> hand IK target (card plane) -> prop placed so its
// active point sits exactly on the contact point. Characters are 2D cards in a 3D world, so the arm chain is solved with an
// analytic two-bone IK in the card plane (toon.ts `reach`), and props are real 3D objects placed at the solved hand.
import * as THREE from "three";

export type ActionType = "write" | "dig" | "carry" | "place" | "drink" | "pull" | "push" | "climb" | "throw" | "handOver" | "lean" | "open" | "custom";
export type Hands = "left" | "right" | "both";
export type Easing = { phase: string; curve: "linear" | "easeIn" | "easeOut" | "easeInOut"; until: number };   // until: end of phase as fraction 0..1
export type Action = {
  type: ActionType; startTime: number; duration: number;
  contactCurve: THREE.Vector3[];                    // world-space contact points over time (Catmull-Rom sampled)
  prop: string | null; propActive: number;          // propActive: height fraction (0 base .. 1 top) of the prop's "business end"
  propSize: number; propTilt: (p: number) => number;
  hands: Hands; gripOffsets: { left?: [number, number]; right?: [number, number] };   // card-plane metres (right, up)
  secondary: { headLookAt: boolean; torsoLean: number; shoulderLift: number; followThrough: number };
  easing: Easing[];
  released?: (p: number) => boolean;                // throw: from here the prop flies free
  extra?: { dirt?: boolean; paper?: boolean };
};
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const EASE = { linear: (k: number) => k, easeIn: (k: number) => k * k, easeOut: (k: number) => 1 - (1 - k) * (1 - k), easeInOut: (k: number) => (k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k)) };

// ---------------- contactCurve generators ----------------
/** write: ordered strokes on the paper plane with lifts between them (pen rises, travels, lands) */
export const writeCurve = (o: THREE.Vector3, w = 0.5, rows = 4): THREE.Vector3[] => {
  const pts: THREE.Vector3[] = [];
  for (let r = 0; r < rows; r++) {
    const y = o.y, z = o.z - r * 0.06, dir = r % 2 ? -1 : 1;
    for (let i = 0; i <= 5; i++) pts.push(V(o.x + dir * (-w / 2 + (w * i) / 5), y + 0.004 * Math.sin(i * 2.4), z));
    pts.push(V(o.x + dir * (w / 2), y + 0.07, z - 0.03));    // lift
  }
  return pts;
};
/** dig: raise, strike (fast down), scoop, lift, toss (blade ends up beside the hole) */
export const digCurve = (o: THREE.Vector3): THREE.Vector3[] => [V(o.x - 0.1, o.y + 0.95, o.z), V(o.x - 0.15, o.y + 1.15, o.z), V(o.x, o.y + 0.02, o.z), V(o.x + 0.12, o.y - 0.12, o.z), V(o.x + 0.2, o.y + 0.5, o.z), V(o.x + 0.55, o.y + 0.85, o.z), V(o.x + 0.8, o.y + 0.7, o.z)];
/** carry: grip point travelling with a gentle step bob */
export const carryCurve = (a: THREE.Vector3, b: THREE.Vector3, bob = 0.03): THREE.Vector3[] => Array.from({ length: 9 }, (_, i) => a.clone().lerp(b, i / 8).add(V(0, bob * Math.sin(i * 2.1), 0)));
/** place: lift slightly, arc over, lower so the object's BASE touches the surface */
export const placeCurve = (from: THREE.Vector3, target: THREE.Vector3): THREE.Vector3[] => [from.clone(), from.clone().lerp(target, 0.35).add(V(0, 0.28, 0)), from.clone().lerp(target, 0.7).add(V(0, 0.2, 0)), target.clone().add(V(0, 0.03, 0)), target.clone()];
/** drink: cup rim from rest to the mouth bone, hold, back down */
export const drinkCurve = (rest: THREE.Vector3, mouth: THREE.Vector3): THREE.Vector3[] => [rest.clone(), rest.clone().lerp(mouth, 0.5).add(V(0, 0.1, 0)), mouth.clone(), mouth.clone().add(V(0, 0.02, 0)), mouth.clone(), rest.clone()];
/** push / pull / lean / open / climb: reach to the surface point, press along the normal, return */
export const pressCurve = (hand0: THREE.Vector3, surf: THREE.Vector3, along: THREE.Vector3, k = 0.4): THREE.Vector3[] => [hand0.clone(), surf.clone(), surf.clone().addScaledVector(along, k * 0.5), surf.clone().addScaledVector(along, k), surf.clone().addScaledVector(along, k)];
export const climbCurve = (base: THREE.Vector3, h: number): THREE.Vector3[] => Array.from({ length: 8 }, (_, i) => base.clone().add(V(i % 2 ? 0.12 : -0.12, 0.8 + (h * i) / 8, 0)));
/** throw: wind up behind, whip forward, release point */
export const throwCurve = (o: THREE.Vector3, dir: THREE.Vector3): THREE.Vector3[] => [o.clone().add(V(0, 1.1, 0)), o.clone().addScaledVector(dir, -0.35).add(V(0, 1.35, 0)), o.clone().addScaledVector(dir, 0.1).add(V(0, 1.5, 0)), o.clone().addScaledVector(dir, 0.5).add(V(0, 1.4, 0))];
/** hand over: from the giver's hand to the receiver's hand, meeting mid-way */
export const handOverCurve = (g: THREE.Vector3, r: THREE.Vector3): THREE.Vector3[] => [g.clone(), g.clone().lerp(r, 0.5).add(V(0, 0.05, 0)), r.clone()];

// ---------------- factory ----------------
export type Params = { start?: number; dur?: number; from?: THREE.Vector3; to?: THREE.Vector3; prop?: string; hands?: Hands; dir?: THREE.Vector3; propSize?: number };
export const createAction = (type: ActionType, p: Params): Action => {
  const from = p.from ?? V(), to = p.to ?? from.clone().add(V(0.5, 0, 0)), dir = (p.dir ?? to.clone().sub(from).setY(0).normalize());
  const base: Action = { type, startTime: p.start ?? 0, duration: p.dur ?? 2, contactCurve: [], prop: p.prop ?? null, propActive: 0.5, propSize: p.propSize ?? 0.4, propTilt: () => 0, hands: p.hands ?? "right", gripOffsets: {},
    secondary: { headLookAt: true, torsoLean: 0.1, shoulderLift: 0, followThrough: 4 }, easing: [{ phase: "all", curve: "easeInOut", until: 1 }] };
  switch (type) {
    case "write": return { ...base, prop: p.prop ?? "pen", propSize: 0.25, propActive: 0, contactCurve: writeCurve(from.clone().add(dir.clone().multiplyScalar(0.42)).add(V(0, 1.0, 0)), 0.3), propTilt: () => 0.5, extra: { paper: true }, easing: [{ phase: "write", curve: "linear", until: 1 }], secondary: { ...base.secondary, torsoLean: 0.18 } };
    case "dig": return { ...base, prop: p.prop ?? "shovel", propSize: 1.3, propActive: 0, hands: "both", contactCurve: digCurve(to), propTilt: (k) => (k < 0.2 ? -0.5 : k < 0.45 ? 0.2 : k < 0.7 ? 0.9 : 0.5), extra: { dirt: true },
      easing: [{ phase: "raise", curve: "easeOut", until: 0.22 }, { phase: "strike", curve: "easeIn", until: 0.4 }, { phase: "scoop", curve: "easeOut", until: 0.6 }, { phase: "lift", curve: "easeInOut", until: 0.8 }, { phase: "toss", curve: "easeIn", until: 1 }], secondary: { ...base.secondary, torsoLean: 0.3, shoulderLift: 0.1 } };
    case "carry": return { ...base, hands: "both", contactCurve: carryCurve(from.clone().add(V(0, 0.85, 0)), to.clone().add(V(0, 0.85, 0))), easing: [{ phase: "carry", curve: "easeInOut", until: 1 }] };
    case "place": return { ...base, propActive: 0, contactCurve: placeCurve(from.clone().add(V(0, 0.9, 0)), to), easing: [{ phase: "lift", curve: "easeOut", until: 0.4 }, { phase: "lower", curve: "easeIn", until: 1 }] };
    case "drink": return { ...base, prop: p.prop ?? "cup", propSize: 0.25, propActive: 1, contactCurve: drinkCurve(from.clone().add(V(0, 0.85, 0)), from.clone().add(dir.clone().multiplyScalar(0.1)).add(V(0, 1.38, 0))), propTilt: (k) => Math.sin(Math.PI * Math.min(1, k * 1.4)) * 0.8, easing: [{ phase: "up", curve: "easeOut", until: 0.4 }, { phase: "sip", curve: "linear", until: 0.7 }, { phase: "down", curve: "easeIn", until: 1 }] };
    case "push": case "pull": case "lean": case "open": return { ...base, hands: type === "push" ? "both" : "right", contactCurve: pressCurve(from.clone().add(V(0, 1.0, 0)), to.clone().add(V(0, 1.05, 0)), type === "pull" ? dir.clone().multiplyScalar(-1) : dir, type === "lean" ? 0.15 : 0.45), secondary: { ...base.secondary, torsoLean: type === "lean" ? 0.25 : 0.35 } };
    case "climb": return { ...base, hands: "both", contactCurve: climbCurve(to, 2.2) };
    case "throw": return { ...base, propSize: p.propSize ?? 0.3, contactCurve: throwCurve(from, dir), released: (k) => k > 0.55, easing: [{ phase: "windup", curve: "easeOut", until: 0.45 }, { phase: "release", curve: "easeIn", until: 1 }], secondary: { ...base.secondary, torsoLean: 0.3 } };
    case "handOver": return { ...base, hands: "both", contactCurve: handOverCurve(from.clone().add(V(0, 0.9, 0)), to.clone().add(V(0, 0.9, 0))) };
    default: return { ...base, contactCurve: [from.clone().add(V(0, 1, 0)), to.clone().add(V(0, 1, 0))] };
  }
};

// ---------------- per-frame update (exact order) ----------------
const curves = new WeakMap<Action, THREE.CatmullRomCurve3>();
export type Tick = { progress: number; eased: number; phase: string; contact: THREE.Vector3; active: boolean; done: boolean };
export const updateAction = (a: Action, t: number): Tick => {
  const progress = Math.min(1, Math.max(0, (t - a.startTime) / Math.max(0.01, a.duration)));                    // 1
  let from = 0, eased = progress, phase = a.easing[a.easing.length - 1].phase;                                    // 2: per-phase easing, continuous across phases
  for (const e of a.easing) if (progress <= e.until + 1e-9) { phase = e.phase; const k = (progress - from) / Math.max(1e-6, e.until - from); eased = from + (e.until - from) * EASE[e.curve](Math.min(1, Math.max(0, k))); break; } else from = e.until;
  let c = curves.get(a); if (!c) { c = new THREE.CatmullRomCurve3(a.contactCurve.length > 1 ? a.contactCurve : [a.contactCurve[0] ?? V(), (a.contactCurve[0] ?? V()).clone().add(V(0.01, 0, 0))], false, "centripetal"); curves.set(a, c); }
  const contact = c.getPointAt(Math.min(0.9999, Math.max(0, eased)));                                             // 3
  return { progress, eased, phase, contact, active: t >= a.startTime && t <= a.startTime + a.duration, done: t >= a.startTime + a.duration };
};

// ---------------- world contact -> card-plane hand target (steps 4-5) ----------------
/** metres right of / above the body in the card's plane; `mir` = -1 when the card is drawn mirrored */
export const handTarget = (contact: THREE.Vector3, body: THREE.Vector3, camRight: THREE.Vector3, grip?: [number, number], mir = 1) => {
  const d = contact.clone().sub(body);
  return { x: (d.dot(camRight) + (grip?.[0] ?? 0)) * mir, y: contact.y + (grip?.[1] ?? 0) };
};
/** analytic two-bone IK in 2D (shoulder S, target T, bone lengths l1,l2): returns [S, elbow, hand]; elbow bends away from the body (bendDown = +1 elbow low) */
export const twoBone = (S: [number, number], T: [number, number], l1: number, l2: number, bend = 1): [[number, number], [number, number], [number, number]] => {
  let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy) || 1e-6; const maxd = (l1 + l2) * 0.999;
  if (d > maxd) { dx *= maxd / d; dy *= maxd / d; d = maxd; }                       // out of reach: stretch to the limit
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), mx = S[0] + (dx / d) * a, my = S[1] + (dy / d) * a;
  return [S, [mx - bend * (dy / d) * h, my + bend * (dx / d) * h], [S[0] + dx, S[1] + dy]];
};
/** prop alignment: prop base so its active point sits on the contact point (propPos = contact - orient * activeOffset) */
export const propBase = (a: Action, contact: THREE.Vector3): THREE.Vector3 => contact.clone().sub(V(0, a.propActive * a.propSize, 0));

// ---------------- multi-action queue with blending (last 0.2 s) ----------------
export class ActionQueue {
  private q: Action[] = [];
  add(a: Action) { this.q.push(a); this.q.sort((x, y) => x.startTime - y.startTime); return this; }
  /** the action active at t, plus the contact point blended toward the next action's first contact in the last 0.2 s (no pop) */
  at(t: number): { action: Action; tick: Tick; contact: THREE.Vector3 } | null {
    let cur: Action | null = null; for (const a of this.q) if (t >= a.startTime && t <= a.startTime + a.duration) cur = a;
    if (!cur) { const last = [...this.q].reverse().find((a) => t > a.startTime + a.duration); if (!last) return null; cur = last; }
    const tick = updateAction(cur, t), nxt = this.q.find((a) => a.startTime >= cur!.startTime + cur!.duration - 1e-6 && a !== cur), contact = tick.contact.clone();
    if (nxt) { const rem = cur.startTime + cur.duration - t; if (rem < 0.2 && rem >= 0) contact.lerp(nxt.contactCurve[0], 1 - rem / 0.2); }
    return { action: cur, tick, contact };
  }
}
/** ballistic free flight after release: p(t) = p0 + v t + g t^2 / 2 */
export const ballistic = (p0: THREE.Vector3, v: THREE.Vector3, t: number) => p0.clone().addScaledVector(v, t).add(V(0, -4.9 * t * t, 0));
