import * as THREE from "three";
import { SceneDef, CastDef } from "./types";
const SH = {
  wide: { d: 15, h: 2.7, fov: 42, ly: 1.1, cInf: 4 },
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
export const camAt = (s: SceneDef, i: number, u: number, t: number): Cam => {
  const P = SH[s.shot], F = focusOf(s);
  let d = P.d * (s.shot === "medium" || s.shot === "wide" ? Math.max(1, (F.spread + 1.2) / (s.shot === "wide" ? 7 : 2.4)) : 1);
  let az = s.az ?? ((i % 2 ? 1 : -1) * (14 + (i * 23) % 40));
  const mv = s.move ?? (s.shot === "wide" ? "pull" : "push");
  const k = ease(Math.min(1, Math.max(0, u)));
  if (mv === "push") d *= 1 - 0.2 * k;
  else if (mv === "pull") d *= 0.82 + 0.18 * k;
  else if (mv === "orbit") az += 16 * (k - 0.5);
  const a = (az * Math.PI) / 180;
  const scale = F.tgt?.scale ?? 1;
  const look = new THREE.Vector3(F.x, P.ly * scale, F.z);
  const pos = new THREE.Vector3(F.x + Math.sin(a) * d, P.h * scale, F.z + Math.cos(a) * d);
  if (s.shot === "over" && s.cast.length > 1) { // behind the nearer shoulder, looking at the target
    const other = s.cast.find((c) => c.id !== s.target) ?? s.cast[0];
    const dx = F.x - other.x, dz = F.z - other.z, l = Math.hypot(dx, dz) || 1;
    pos.set(other.x - (dx / l) * 1.3 + (dz / l) * 0.45, P.h, other.z - (dz / l) * 1.3 - (dx / l) * 0.45);
    pos.addScaledVector(new THREE.Vector3(-dx / l, 0, -dz / l), -d * 0.1 * k);
  }
  pos.x += Math.sin(t * 1.3 + i) * 0.025; pos.y += Math.sin(t * 1.7 + i * 2) * 0.015; // handheld life
  const roll = ((s.roll ?? 0) * Math.PI) / 180 * k;
  return { pos, look, fov: P.fov, roll, cInf: P.cInf };
};
