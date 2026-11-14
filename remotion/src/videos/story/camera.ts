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
  feet: { d: 3.8, h: 0.8, ly: 0.35, fov: 42, c: 12 },
  prop: { d: 3.2, h: 1.3, ly: 0.5, fov: 36, c: 15 },
};
export type Cam = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number; cInf: number };
type KF = { u: number; lv: string; who?: string; az: number; lead?: number };   // who = cast id, undefined = group centre
type Seg = { u0: number; u1: number; kfs: KF[]; ease?: "io" | "out" };

const sm = (t: number) => t * t * (3 - 2 * t);                    // ease in/out
const out = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);        // fast start, gentle settle (reaction push-in)
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export const focusOf = (s: SceneDef, who?: string): { x: number; z: number; spread: number; tgt?: CastDef; y?: number; size?: number } => {
  if (who && who.startsWith("@")) {   // a prop: the camera points at the object itself
    const nm = who.slice(1).toLowerCase(), ps = s.props ?? [];   // exact, then fuzzy (planner may write "tree1" or "coins"), then the first prop
    const hd = s.cast.find((q) => q.hold && q.hold.toLowerCase() === nm);   // an item someone is carrying: follow the carrier live
    if (hd && !ps.find((q) => q.name === nm)) return { x: hd.x, z: hd.z, spread: 0, y: 0.95, size: 0.5 };
    const pd = ps.find((q) => q.name === nm) ?? ps.find((q) => q.name.includes(nm) || nm.includes(q.name)) ?? ps.find((q) => nm.replace(/[0-9]/g, "") && q.name.includes(nm.replace(/[0-9]/g, ""))) ?? ps[0];
    if (pd) return { x: pd.x, z: pd.z, spread: 0, y: (pd.y ?? 0) + (pd.h ?? 1) * 0.5, size: pd.h ?? 1 };
  }
  const t = s.cast.find((c) => c.id === who);
  const xs = s.cast.map((c) => c.x), zs = s.cast.map((c) => c.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const spread = Math.max(...xs) - Math.min(...xs);
  return t ? { x: t.x, z: t.z, spread, tgt: t } : { x: cx, z: cz, spread };
};

const other = (s: SceneDef, id?: string) => s.cast.find((c) => c.id !== id)?.id ?? id;

/** Plan the camera for a scene. Mirrored in remotion/scripts/story_audio.py (cut times) - keep in sync. */
/** how many ~2 s sub-shots a scene is cut into by the action camera (mirrored in story_audio.py) */
export const nSub = (dur: number) => Math.max(1, Math.min(6, Math.round(dur / 2.0)));
const GENERIC = new Set(["push", "pull", "reveal", "pan", "descend", "orbit", "hold", undefined]);
/** Action camera: a new subject and a fast, strong move every ~2 s (reference-video pacing). Subjects cycle through the speaker, every prop
 *  named in the scene (the camera points at it), the other characters. Moves alternate push-in / orbit / pull-back / prop close-up. */
const actionSegs = (s: SceneDef, i: number, dur: number): Seg[] => {
  const n = nSub(dur), base = s.az ?? ((i % 2 ? 1 : -1) * (16 + (i * 23) % 36));
  const tgt = s.target ?? s.cast[0].id, props = (s.props ?? []).filter((p, k, a) => a.findIndex((q) => q.name === p.name) === k);
  const subj: (string | undefined)[] = [tgt, ...props.map((p) => "@" + p.name), ...s.cast.filter((c) => c.id !== tgt).map((c) => c.id), tgt];
  const segs: Seg[] = [];
  for (let k = 0; k < n; k++) {
    const who = i === 0 && k === 0 && s.shot === "wide" ? undefined : subj[(k + (i % 2)) % subj.length], pr = who?.startsWith("@");
    const sw = (k % 2 ? -1 : 1) * (22 + 10 * ((i + k) % 3)), a0 = base + (k % 2 ? 30 : -30), u0 = k / n, u1 = (k + 1) / n;
    let kfs: KF[];
    if (pr) kfs = [{ u: 0, lv: "char", who: tgt, az: a0 }, { u: 0.45, lv: "prop", who, az: a0 + sw * 0.5 }, { u: 1, lv: "prop", who, az: a0 + sw }];
    else switch ((k + i) % 4) {
      case 0: kfs = [{ u: 0, lv: "char", who, az: a0 }, { u: 1, lv: "face", who, az: a0 + sw * 0.4 }]; break;               // fast push-in
      case 1: kfs = [{ u: 0, lv: "upper", who, az: a0 - sw }, { u: 1, lv: "upper", who, az: a0 + sw }]; break;               // orbit
      case 2: kfs = [{ u: 0, lv: "face", who, az: a0 }, { u: 1, lv: "env", az: a0 + sw * 0.5 }]; break;                       // pull-back reveal
      default: kfs = [{ u: 0, lv: "low", who, az: a0 }, { u: 1, lv: "upper", who, az: a0 - sw * 0.4 }];                        // hero low-angle rise
    }
    segs.push({ u0, u1, ease: "out", kfs });
  }
  return segs;
};

export const segsOf = (s: SceneDef, i: number, dur: number): Seg[] => {
  if (GENERIC.has(s.move) && !(s.cast.find((c) => c.at2 != null && c.expr2) && dur > 1.8) && !s.cast.some((c) => c.to)) return actionSegs(s, i, dur);
  return segsOld(s, i, dur);
};
const segsOld = (s: SceneDef, i: number, dur: number): Seg[] => {
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
  const walker = s.cast.find((q) => q.to && q.id === tgt) ?? s.cast.find((q) => q.to);
  const prop = s.focus ? "@" + s.focus : undefined;
  if (mv === "track" && walker) {       // side-on tracking shot that rides with the walker, leading the way he is heading
    const dx = walker.to!.x - walker.x, dz = walker.to!.z - walker.z, l = Math.hypot(dx, dz) || 1;
    const az = (Math.atan2(-dz / l, dx / l) * 180) / Math.PI + (s.az ?? 0) * 0.3;
    return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "char", who: walker.id, az }, { u: 1, lv: "upper", who: walker.id, az: az + 14 }] }];
  }
  if (mv === "crane") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "low", who: tgt, az: base }, { u: 0.5, lv: "char", who: tgt, az: base * 0.5 }, { u: 1, lv: "high", who: tgt, az: base * 0.2 }] }];
  if (mv === "tiltup") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "feet", who: tgt, az: base }, { u: 1, lv: "face", who: tgt, az: base * 0.7 }] }];
  if (mv === "tiltdown") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "face", who: tgt, az: base }, { u: 1, lv: "feet", who: tgt, az: base * 0.7 }] }];
  if (prop && !mv) {                      // the narration is about an object: show who, then glide onto the object itself
    return [{ u0: 0, u1: 0.42, kfs: [{ u: 0, lv: "char", who: tgt, az: base }, { u: 1, lv: "upper", who: tgt, az: base * 0.6 }] },
            { u0: 0.42, u1: 1, ease: "out", kfs: [{ u: 0, lv: "upper", who: tgt, az: base * 0.6 }, { u: 0.55, lv: "prop", who: prop, az: base * -0.3 }, { u: 1, lv: "prop", who: prop, az: base * -0.5 }] }];
  }
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
  const onProp = F.y !== undefined;
  const d0 = onProp ? Math.max(2.2, (F.size ?? 1) * 2.4) : L.d * (wide && !kf.who ? sp : 1);
  return { d: d0, h: onProp ? Math.max(0.7, F.y! * 0.9 + 0.4) : L.h * (kf.lv === "high" ? 1 : sc), ly: onProp ? F.y! : L.ly * sc, fov: L.fov, c: L.c, az: kf.az, x: F.x + (kf.lead ?? 0) * Math.sin(kf.az * 0), z: F.z, high: kf.lv === "high" };
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
