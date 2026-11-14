// Virtual cinematographer (Stickman Studio "Cinematic Camera & Storytelling" spec, docs/CINEMATIC_CAMERA_SKILL.txt).
// A scene is cut into 1-2 segments. Each segment is a list of camera keyframes {u, level, focus, az} interpolated with
// ease-in/ease-out: progressive push-ins through levels (environment > character > upper body > face > eyes), pull-backs
// from detail to context, pans between characters, descends from an elevated view, and a quick reaction push-in + hold.
import * as THREE from "three";
import { SceneDef, CastDef } from "./types";

type Lvl = { d: number; h: number; ly: number; fov: number; c: number };
const LV: Record<string, Lvl> = {
  env: { d: 11.5, h: 2.7, ly: 1.1, fov: 42, c: 4 },
  char: { d: 6.4, h: 1.5, ly: 1.2, fov: 40, c: 11 },
  upper: { d: 4.4, h: 1.6, ly: 1.5, fov: 38, c: 14 },
  face: { d: 2.9, h: 1.7, ly: 1.72, fov: 36, c: 16 },
  eyes: { d: 2.0, h: 1.74, ly: 1.76, fov: 33, c: 18 },
  low: { d: 6.0, h: 0.5, ly: 1.75, fov: 46, c: 10 },
  lowface: { d: 3.6, h: 0.7, ly: 1.75, fov: 42, c: 14 },
  high: { d: 10, h: 10.5, ly: 0.3, fov: 48, c: 5 },
  over: { d: 4.0, h: 1.75, ly: 1.45, fov: 38, c: 14 },
};
export type Cam = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number; cInf: number };
type KF = { u: number; lv: string; who?: string; az: number; pull?: number };   // who = cast id, undefined = group centre
type Seg = { u0: number; u1: number; kfs: KF[]; ease?: "io" | "out" };

const sm = (t: number) => t * t * (3 - 2 * t);                    // ease in/out
const out = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);        // fast start, gentle settle (reaction push-in)
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export const focusOf = (s: SceneDef, who?: string): { x: number; z: number; spread: number; tgt?: CastDef } => {
  const t = s.cast.find((c) => c.id === who);
  const xs = s.cast.map((c) => c.x), zs = s.cast.map((c) => c.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const spread = Math.max(...xs) - Math.min(...xs);
  return t ? { x: t.x, z: t.z, spread, tgt: t } : { x: cx, z: cz, spread };
};

const other = (s: SceneDef, id?: string) => s.cast.find((c) => c.id !== id)?.id ?? id;

/** Plan the camera for a scene. Mirrored in remotion/scripts/story_audio.py (cut times) - keep in sync. */
export const segsOf = (s: SceneDef, i: number, dur: number): Seg[] => {
  const base = s.az ?? ((i % 2 ? 1 : -1) * (14 + (i * 23) % 40));
  const tgt = s.target ?? s.cast[0].id, two = s.cast.length > 1, alt = two ? other(s, tgt) : tgt;
  const react = s.cast.find((c) => c.at2 != null && c.expr2);
  if (react && dur > 1.8) {
    // normal push-in up to the beat, then the quick reaction push-in (0.5 s) that lands on the face and holds
    const cut = clamp(react.at2!, 0.3, 0.72), qd = Math.min(0.5 / dur / (1 - cut), 0.6);
    return [
      { u0: 0, u1: cut, kfs: [{ u: 0, lv: s.shot === "wide" ? "env" : "char", who: s.shot === "wide" ? undefined : tgt, az: base }, { u: 1, lv: "upper", who: tgt, az: base * 0.6 }] },
      { u0: cut, u1: 1, ease: "out", kfs: [{ u: 0, lv: "upper", who: react.id, az: base * -0.4 }, { u: qd, lv: "face", who: react.id, az: base * -0.4 }, { u: 1, lv: "eyes", who: react.id, az: base * -0.3 }] },
    ];
  }
  const mv = s.move;
  const one = (kfs: KF[]): Seg[] => (dur > 4.6 && !mv
    ? [{ u0: 0, u1: 0.56, kfs }, { u0: 0.56, u1: 1, kfs: [{ u: 0, lv: "upper", who: alt, az: base + 20 }, { u: 1, lv: s.shot === "close" ? "eyes" : "face", who: alt, az: base + 8 }] }]
    : [{ u0: 0, u1: 1, kfs }]);
  if (mv === "hold") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: s.shot === "wide" ? "env" : "upper", who: s.shot === "wide" ? undefined : tgt, az: base }, { u: 1, lv: s.shot === "wide" ? "env" : "upper", who: s.shot === "wide" ? undefined : tgt, az: base + 3 }] }];
  if (mv === "orbit") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "char", who: tgt, az: base - 18 }, { u: 1, lv: "upper", who: tgt, az: base + 18 }] }];
  if (mv === "pan" || (!mv && two && s.shot === "medium"))      // pan from one character to the other, settle closer
    return one([{ u: 0, lv: "char", who: tgt, az: base }, { u: 0.55, lv: "char", who: alt, az: base }, { u: 1, lv: "upper", who: alt, az: base * 0.7 }]);
  if (mv === "descend" || s.shot === "high")                   // elevated view that descends towards the subject
    return one([{ u: 0, lv: "high", az: base }, { u: 0.55, lv: "env", az: base }, { u: 1, lv: "char", who: tgt, az: base * 0.7 }]);
  if (mv === "pull" || (!mv && s.shot === "wide" && i > 0))   // detail-to-context: start on the subject, reveal the place
    return one([{ u: 0, lv: "upper", who: tgt, az: base }, { u: 0.45, lv: "char", who: tgt, az: base }, { u: 1, lv: "env", az: base * 0.6 }]);
  if (mv === "reveal" || (!mv && i === 0))                    // progressive push-in: environment > character > upper body
    return one([{ u: 0, lv: "env", az: base }, { u: 0.5, lv: "char", who: tgt, az: base * 0.8 }, { u: 1, lv: "upper", who: tgt, az: base * 0.5 }]);
  if (s.shot === "close")                                     // slow dramatic push: face to eyes
    return one([{ u: 0, lv: "face", who: tgt, az: base }, { u: 1, lv: "eyes", who: tgt, az: base * 0.7 }]);
  if (s.shot === "low")
    return one([{ u: 0, lv: "low", who: tgt, az: base }, { u: 1, lv: "lowface", who: tgt, az: base * 0.6 }]);
  if (s.shot === "over")
    return one([{ u: 0, lv: "over", who: tgt, az: base }, { u: 1, lv: "over", who: tgt, az: base }]);
  return one([{ u: 0, lv: "char", who: tgt, az: base }, { u: 0.5, lv: "upper", who: tgt, az: base * 0.7 }, { u: 1, lv: "face", who: tgt, az: base * 0.5 }]);
};

const pose = (s: SceneDef, kf: KF) => {
  const L = LV[kf.lv], F = focusOf(s, kf.who);
  const sp = Math.max(1, (F.spread + 1.2) / (kf.lv === "env" ? 7 : 2.4));
  const wide = kf.lv === "env" || kf.lv === "char" || kf.lv === "high";
  const sc = F.tgt?.scale ?? 1;
  return { d: L.d * (wide && !kf.who ? sp : 1), h: L.h * (kf.lv === "high" ? 1 : sc), ly: L.ly * sc, fov: L.fov, c: L.c, az: kf.az, x: F.x, z: F.z, high: kf.lv === "high" };
};

export const camAt = (s: SceneDef, i: number, u: number, t: number, dur = 3): Cam => {
  const segs = segsOf(s, i, dur);
  const g = segs.find((x) => u < x.u1) ?? segs[segs.length - 1];
  const lu = clamp((u - g.u0) / Math.max(1e-4, g.u1 - g.u0));
  const k = g.kfs;
  let a = k[0], b = k[k.length - 1], f = 1;
  for (let j = 0; j < k.length - 1; j++) if (lu <= k[j + 1].u) { a = k[j]; b = k[j + 1]; f = clamp((lu - k[j].u) / Math.max(1e-4, k[j + 1].u - k[j].u)); break; }
  const e = g.ease === "out" && a === k[0] ? out(f) : sm(f);
  const A = pose(s, a), B = pose(s, b);
  const L = (p: number, q: number) => p + (q - p) * e;
  const d = Math.exp(L(Math.log(A.d), Math.log(B.d)));            // distance interpolates geometrically: feels like a constant-speed dolly
  const az = (L(A.az, B.az) * Math.PI) / 180, fov = L(A.fov, B.fov), h = L(A.h, B.h);
  const fx = L(A.x, B.x), fz = L(A.z, B.z);
  const look = new THREE.Vector3(fx, L(A.ly, B.ly), fz);
  const pos = new THREE.Vector3(fx + Math.sin(az) * d, h, fz + Math.cos(az) * d);
  const mixHigh = A.high || B.high;
  if (!mixHigh) look.y -= Math.tan((fov * Math.PI) / 360) * d * 0.2;  // headroom: lift the subject above the caption band
  const over = a.lv === "over" && s.cast.length > 1;
  if (over) {
    const tg = focusOf(s, a.who), ot = s.cast.find((c) => c.id !== a.who) ?? s.cast[0];
    const dx = tg.x - ot.x, dz = tg.z - ot.z, l = Math.hypot(dx, dz) || 1;
    pos.set(ot.x - (dx / l) * 1.3 + (dz / l) * 0.45, LV.over.h, ot.z - (dz / l) * 1.3 - (dx / l) * 0.45);
    pos.addScaledVector(new THREE.Vector3(-dx / l, 0, -dz / l), -0.4 * lu);
  }
  pos.x += Math.sin(t * 1.3 + i) * 0.025; pos.y += Math.sin(t * 1.7 + i * 2) * 0.015;
  const roll = (((s.roll ?? 0) * Math.PI) / 180) * sm(lu);
  return { pos, look, fov, roll, cInf: L(A.c, B.c) };
};
