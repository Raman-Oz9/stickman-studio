// HYBRID: a real 3D world (terrain, buildings, sky, planets, camera moves from camera.ts) with the 2D ink cast standing in it.
// Each cast member's ground point is projected through the SAME camera the 3D world uses, so the characters stay planted,
// scale with depth, and the whole shot parallaxes like a normal 3D scene while the people stay clean hand-inked 2D.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { loadKit } from "../bridge/world";
import { loadStickers } from "../bridge/stickers";
import { Kit } from "../bridge/build";
import { Inner, getBoard } from "./Story";
import { StoryWorld } from "./world";
import { Board, CastDef, SceneDef, sceneAt, totalFrames, FPS } from "./types";
import { camAt, focusOf } from "./camera";
import { Performer2D } from "./Performer2D";
import { castPerf } from "./castPerf";
import { outfitFor, resolveRole } from "./outfits";
import { inkStyleOf } from "./inkOutfit";
import type { Expression } from "./Stickman2D";

StoryWorld.hideCast = true;
export const storyHybridFrames = (b: Board) => totalFrames(b);
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const ROLE_SCALE: Record<string, number> = { kid: 0.72, girl: 0.74 };
const EXPR: Record<string, Expression> = { smile: "smile", grin: "joy", laugh: "joy", shock: "shock", stern: "focused", neutral: "smile", nervous: "sad", pained: "sad", angry: "angry", sad: "sad", relief: "smile", dazed: "sad", whistle: "smile" };
const CHAR_UNITS = 560;   // InkStickman height in its own units (feet to top of head)

const posOf = (d: CastDef, u: number) => {
  if (!d.to) return { x: d.x, z: d.z, moving: false };
  const w0 = d.walkAt ?? 0, k = Math.min(1, Math.max(0, (u - w0) / Math.max(0.05, 0.96 - w0))), e = k * k * (3 - 2 * k);
  return { x: d.x + (d.to.x - d.x) * e, z: d.z + (d.to.z - d.z) * e, moving: k > 0.001 && k < 0.999 };
};

const Cast2D: React.FC<{ board: Board; f: number }> = ({ board, f }) => {
  const { i, local, n } = sceneAt(board, f), s: SceneDef = board.scenes[i];
  if (s.world?.mapMode) return null;
  const u = n > 1 ? local / (n - 1) : 0, dur = n / FPS, t = f / FPS;
  const cur: SceneDef = { ...s, cast: s.cast.map((d) => { const p = posOf(d, u); return { ...d, x: p.x, z: p.z }; }) };
  const c = camAt(cur, i, u, t, dur);
  const cam = new THREE.PerspectiveCamera(c.fov, 1080 / 1920, 0.15, 1500);
  cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.look); cam.rotateZ(c.roll); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const proj = (x: number, y: number, z: number) => { const v = new THREE.Vector3(x, y, z).project(cam); return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, behind: v.z > 1 }; };

  type Who = { d: CastDef; x: number; z: number; idx: number; extra: boolean; moving: boolean };
  const who: Who[] = s.cast.map((d, idx) => { const p = posOf(d, u); return { d, x: p.x, z: p.z, idx, extra: false, moving: p.moving }; });
  const F = focusOf(s);
  for (let k = 0; k < (s.extras ?? 4); k++) {
    const a = hh(k, 20) * Math.PI * 2, r = 8 + hh(k, 21) * 3.5, ex = F.x * 0.3 + Math.sin(a) * r, ez = F.z * 0.3 + Math.cos(a) * r;
    if (Math.hypot(ex - c.pos.x, ez - c.pos.z) < 6.5) continue;
    const drift = 1.2 + hh(k, 22) * 2.2, hd = a + (hh(k, 23) - 0.5) * 1.4, w0 = hh(k, 24) * 0.42, kk = Math.min(1, Math.max(0, (u - w0) / (0.96 - w0))), e = kk * kk * (3 - 2 * kk);
    who.push({ d: { id: "x" + k, role: "townsfolk", x: ex, z: ez, expr: "smile" } as CastDef, x: ex + Math.cos(hd) * drift * e, z: ez + Math.sin(hd) * drift * e, idx: 20 + k, extra: true, moving: kk > 0.001 && kk < 0.999 });
  }
  const placed = who.map((w) => {
    const g = proj(w.x, 0, w.z), g1 = proj(w.x, 1, w.z), sc = (w.d.scale ?? 1) * (ROLE_SCALE[w.d.role] ?? 1);
    const pxm = Math.abs(g.y - g1.y);
    return { ...w, g, k: (pxm * 1.75 * sc) / CHAR_UNITS, depth: c.pos.distanceTo(new THREE.Vector3(w.x, 0, w.z)) };
  }).filter((w) => !w.g.behind && w.k > 0.05 && w.g.x > -400 && w.g.x < 1480).sort((a, b) => b.depth - a.depth);
  const golden = (s.light ?? (s.tod === "dawn" || s.tod === "dusk" ? "golden" : "day")) === "golden";
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", filter: golden ? "sepia(.25) saturate(1.15) brightness(.97)" : "saturate(1.06) contrast(1.03)" }}>
      {placed.map((w) => {
        const o = outfitFor(w.d.role, w.idx, s.era);
        const other = placed.find((q) => q !== w && !q.extra);
        const toward = w.moving && w.d.to ? (proj(w.d.to.x, 0, w.d.to.z).x - w.g.x) : other ? other.g.x - w.g.x : 540 - w.g.x;
        const facing = (toward >= 0 ? 1 : -1) as 1 | -1;
        const pf = w.extra ? { verb: w.moving ? "walk" : "talk", p: u, t, prop: null, holdProp: null } : castPerf(w.d, s, u, t);
        return <Performer2D key={w.d.id + w.idx} x={w.g.x} y={w.g.y} scale={w.k} facing={facing} skin={o.skin ?? "#f6ead9"} cloth={o.dress ?? o.jacket} hair={o.hair} ink={inkStyleOf(w.d.role, w.idx, s.era, resolveRole(w.d.role, s.era))}
          verb={pf.verb} p={pf.p} t={pf.t} phase={t * 1.15 + w.idx * 0.17} frame={f + w.idx * 13} prop={pf.prop} holdProp={pf.holdProp}
          expr={w.d.expr ? EXPR[w.d.expr] ?? null : null} build={w.idx % 2 ? "stocky" : "lean"} seed={w.idx * 17 + 7} />;
      })}
    </svg>
  );
};

export const StoryHybrid: React.FC = () => {
  const f = useCurrentFrame();
  const board = useMemo(getBoard, []);
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("hybrid kit"));
  useEffect(() => {
    const urls: Record<string, string> = {};
    Object.entries(board.stickers ?? {}).forEach(([nm, u]) => { urls[nm] = staticFile(u); });
    Promise.all([loadKit(), loadStickers(urls)]).then(([k]) => { setKit(k); continueRender(handle); });
  }, [handle, board]);
  const { i, local, n } = sceneAt(board, f);
  const capFull = board.scenes[i].caption;
  let cap = capFull, popK = 1;
  if (capFull) {
    const ws = capFull.split(/\s+/).filter(Boolean), ch: string[] = [];
    for (let k = 0; k < ws.length;) { const take = ws[k].length + (ws[k + 1]?.length ?? 99) <= 11 ? 2 : 1; ch.push(ws.slice(k, k + take).join(" ")); k += take; }
    const wts = ch.map((q) => q.length + 2), tot = wts.reduce((a, b) => a + b, 0), uu = Math.min(0.999, Math.max(0, (local - 2) / Math.max(1, n - 6)));
    let acc = 0, idx = 0; for (; idx < ch.length - 1; idx++) { if (uu < (acc + wts[idx]) / tot) break; acc += wts[idx]; }
    const start = (acc / tot) * Math.max(1, n - 6) + 2; cap = ch[idx]; popK = 1 + 0.22 * Math.max(0, 1 - (local - start) / 5);
  }
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }} camera={{ fov: 40, near: 0.15, far: 1500 }}>
        <Inner kit={kit} board={board} />
      </ThreeCanvas>
      <Cast2D board={board} f={f} />
      {cap ? <div style={{ position: "absolute", left: 60, right: 60, bottom: 220, textAlign: "center", fontFamily: "Arial Black, Impact, Liberation Sans, DejaVu Sans, sans-serif", fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: "#fff", WebkitTextStroke: "10px #1a1020", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,.35)", transform: `scale(${popK.toFixed(3)})` }}>{cap}</div> : null}
    </AbsoluteFill>
  );
};
