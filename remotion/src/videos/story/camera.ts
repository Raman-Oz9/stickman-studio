import * as THREE from "three";
import { SceneDef, CastDef } from "./types";
const SH = {
  wide: { d: 11.5, h: 2.7, fov: 42, ly: 1.1, cInf: 4 },
  medium: { d: 6.4, h: 1.5, fov: 40, ly: 1.2, cInf: 11 },
  close: { d: 2.9, h: 1.7, fov: 36, ly: 1.72, cInf: 16 },
  low: { d: 6.0, h: 0.5, fov: 46, ly: 1.75, cInf: 10 },
  over: { d: 4.0, h: 1.75, fov: 38, ly: 1.45, cInf: 14 },
};
export type Cam = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number; cInf: number };
const ease = (t: number) => t * t * (3 - 2 * t);
export const focusOf = (s: SceneDef): { x: number; z: number; spread: number; tgt?: CastDef } => {
  const t = s.cast.find((c) => c.id === s.target);
  const xs = s.cast.map((c) => c.x), zs = s.cast.map((c) => c.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const spread = Math.max(...xs) - Math.min(...xs);
  return t ? { x: t.x, z: t.z, spread, tgt: t } : { x: cx, z: cz, spread };
};
type Seg = { u0: number; u1: number; shot: SceneDef["shot"]; target?: string; az: number; move: "push" | "pull" | "orbit" | "hold" };
// Cut a scene into beats so something new happens every ~2.4 s: opening shot, then push-ins on faces, and a hard punch-in on the reaction.
export const segsOf = (s: SceneDef, i: number, dur: number): Seg[] => {
  const base = s.az ?? ((i % 2 ? 1 : -1) * (14 + (i * 23) % 40));
  const react = s.cast.find((c) => c.at2 != null && c.expr2);
  const tgt = s.target ?? s.cast[0].id;
  const two = s.cast.length > 1;
  if (react && dur > 1.8) {
    const cut = Math.min(0.75, Math.max(0.3, react.at2!));
    const first: Seg = { u0: 0, u1: cut, shot: s.shot === "close" ? "medium" : s.shot, target: s.target, az: base, move: s.move ?? "push" };
    const second: Seg = { u0: cut, u1: 1, shot: "close", target: react.id, az: base * -0.5, move: "push" };
    return [first, second];
  }
  const n = Math.max(1, Math.round(dur / 2.4));
  if (n === 1) return [{ u0: 0, u1: 1, shot: s.shot, target: s.target, az: base, move: s.move ?? (s.shot === "wide" ? "pull" : "push") }];
  const seq: SceneDef["shot"][] = s.shot === "wide" ? ["wide", "medium", "close", "low", "close"]
    : s.shot === "close" ? ["close", "medium", "close", "low", "close"] : [s.shot, "close", "medium", "close", "low"];
  return Array.from({ length: n }, (_, k) => {
    let sh = seq[k % seq.length]; if (sh === "over" && !two) sh = "medium";
    const t = k % 2 && two ? (s.cast.find((c) => c.id !== tgt)?.id ?? tgt) : tgt;
    return { u0: k / n, u1: (k + 1) / n, shot: sh, target: t, az: base + (k % 2 ? -1 : 1) * 12 * k, move: sh === "wide" && k === 0 ? "pull" : "push" } as Seg;
  });
};
export const camAt = (s: SceneDef, i: number, u: number, t: number, dur = 3): Cam => {
  const segs = segsOf(s, i, dur);
  const g = segs.find((x) => u < x.u1) ?? segs[segs.length - 1];
  const lu = Math.min(1, Math.max(0, (u - g.u0) / Math.max(1e-4, g.u1 - g.u0)));
  const P = SH[g.shot], F = focusOf({ ...s, target: g.target });
  const sp = Math.max(1, (F.spread + 1.2) / (g.shot === "wide" ? 7 : 2.4));
  let d = P.d * (g.shot === "medium" || g.shot === "wide" ? sp : 1);
  let az = g.az;
  const k = ease(lu);
  const amt = g.shot === "close" ? 0.42 : g.shot === "wide" ? 0.18 : 0.3;
  if (g.move === "push") d *= 1 - amt * k;
  else if (g.move === "pull") d *= 0.8 + 0.2 * k;
  else if (g.move === "orbit") az += 16 * (k - 0.5);
  if (g.move === "push" && g.shot !== "wide") az += 7 * (k - 0.5); // slight drift while pushing, not a flat zoom
  const a = (az * Math.PI) / 180;
  const scale = F.tgt?.scale ?? 1;
  const look = new THREE.Vector3(F.x, P.ly * scale, F.z);
  const pos = new THREE.Vector3(F.x + Math.sin(a) * d, P.h * scale, F.z + Math.cos(a) * d);
  if (g.shot === "over" && s.cast.length > 1) {
    const other = s.cast.find((c) => c.id !== g.target) ?? s.cast[0];
    const dx = F.x - other.x, dz = F.z - other.z, l = Math.hypot(dx, dz) || 1;
    pos.set(other.x - (dx / l) * 1.3 + (dz / l) * 0.45, P.h, other.z - (dz / l) * 1.3 - (dx / l) * 0.45);
    pos.addScaledVector(new THREE.Vector3(-dx / l, 0, -dz / l), -d * 0.1 * k);
  }
  pos.x += Math.sin(t * 1.3 + i) * 0.03; pos.y += Math.sin(t * 1.7 + i * 2) * 0.02;
  const roll = ((s.roll ?? 0) * Math.PI) / 180 * k;
  return { pos, look, fov: P.fov, roll, cInf: P.cInf };
};
