// HYBRID: a real 3D world (terrain, buildings, sky, planets, camera moves from camera.ts) with the 2D ink cast standing in it.
// Each cast member's ground point is projected through the SAME camera the 3D world uses, so the characters stay planted,
// scale with depth, and the whole shot parallaxes like a normal 3D scene while the people stay clean hand-inked 2D.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { loadKit } from "../bridge/world";
import { Kit } from "../bridge/build";
import { Inner, getBoard } from "./Story";
import { StoryWorld } from "./world";
import { Board, CastDef, SceneDef, sceneAt, totalFrames, FPS } from "./types";
import { camAt, focusOf } from "./camera";
import { Performer2D } from "./Performer2D";
import { castPerf } from "./castPerf";
import { outfitFor, resolveRole } from "./outfits";
import { sailingHeroAt } from "./worldgen";
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
  const era = String(s.era ?? "").toLowerCase();
  const cur: SceneDef = { ...s, cast: s.cast.map((d) => { const p = posOf(d, u); return { ...d, x: p.x, z: p.z }; }) };
  const c = camAt(cur, i, u, t, dur);
  if(s.world?.kind==="sea"){
    const [sx,sy,sz]=sailingHeroAt(local/FPS),phase=u,angle=-Math.PI/2+Math.max(0,Math.min(1,(phase-.18)/.62))*Math.PI*2;
    if(phase<.18)c.pos.set(sx-4,48,sz+112);
    else if(phase<.82)c.pos.set(sx+Math.cos(angle)*30,10+Math.sin(angle*2)*2,sz+Math.sin(angle)*30);
    else c.pos.set(sx+32,13,sz+42);
    c.look.set(sx,sy,sz);c.fov=phase<.18?58:phase<.82?48:52;
  }
  const cam = new THREE.PerspectiveCamera(c.fov, 1080 / 1920, 0.15, 1500);
  cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.look); cam.rotateZ(c.roll); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const proj = (x: number, y: number, z: number) => { const v = new THREE.Vector3(x, y, z).project(cam); return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, behind: v.z > 1 }; };

  const rq = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), rl = Math.hypot(rq.x, rq.z) || 1, rightXZ: [number, number] = [rq.x / rl, rq.z / rl];
  type Who = { d: CastDef; x: number; z: number; idx: number; extra: boolean; moving: boolean; eraW?: string; army?: 1 | 2 };
  const who: Who[] = s.cast.map((d, idx) => { const p = posOf(d, u); return { d, x: p.x, z: p.z, idx, extra: false, moving: p.moving }; });
  const F = focusOf(s);
  const battle = /charged|attacked|fought|clashed|held the line|crushed|battle|war|charge|attack|fight|clash/i.test(String(s.narration ?? s.caption ?? "")) || (s.extrasRole === "soldier" && (s.extras ?? 0) >= 6);
  const landing = s.world?.kind === "sea" && (s.extrasRole === "soldier" || /army|soldier|troop|warrior|disembark/i.test(String(s.caption ?? "")));
  const nEx = Math.min(16, battle ? Math.max(12, s.extras ?? 12) : landing ? Math.max(8, s.extras ?? 8) : s.extras ?? 4);
  const eRole = landing || battle ? "soldier" : s.extrasRole ?? "townsfolk";
  const rank = eRole === "soldier";
  const half = battle ? Math.floor(nEx / 2) : 0;
  for (let k = 0; k < nEx; k++) {
    let ex: number, ez: number, hd: number, drift: number, w0: number, armyNum: 1 | 2 = 1, eEra = s.era;
    if (battle) {
      if (k < half) {
        const row = Math.floor(k / 4), col = k % 4;
        ex = -3.5 + col * 1.0 + (hh(k, 40) - 0.5) * 0.2;
        ez = F.z - 2.2 + row * 1.5 + (hh(k, 41) - 0.5) * 0.2;
        hd = 0; drift = 0; w0 = 0.05; armyNum = 1; eEra = s.era;
      } else {
        const hk = k - half;
        const row = Math.floor(hk / 4), col = hk % 4;
        ex = +1.5 + col * 1.0 + (hh(k, 42) - 0.5) * 0.2;
        ez = F.z - 2.2 + row * 1.5 + (hh(k, 43) - 0.5) * 0.2;
        hd = 0; drift = 0; w0 = 0.05; armyNum = 2; eEra = s.extrasEra ?? (era === "greek" ? "arabian" : "barbarian");
      }
    } else if (rank) {
      const row = Math.floor(k / 5), col = k % 5;
      if(s.world?.kind==="sea"){
        const [shipX,,shipZ]=sailingHeroAt(local/FPS);
        ex=shipX-8+col*2.1+(hh(k,40)-.5)*.35;ez=shipZ+row*2.1+(hh(k,41)-.5)*.3;hd=0;drift=22;w0=.08+(k%4)*.035;
      }else{
        ex = F.x - 4 + col * 2 + (hh(k, 40) - 0.5) * 0.5; ez = F.z - 3.2 - row * 1.8 + (hh(k, 41) - 0.5) * 0.4; hd = Math.PI * 0.5; drift = 2.2; w0 = 0.1;
      }
    } else {
      const a = hh(k, 20) * Math.PI * 2, r = 5.5 + hh(k, 21) * 4; ex = F.x * 0.3 + Math.sin(a) * r; ez = F.z * 0.3 + Math.cos(a) * r; hd = a + (hh(k, 23) - 0.5) * 1.4; drift = 1.2 + hh(k, 22) * 2.2; w0 = hh(k, 24) * 0.42;
    }
    if (!battle && Math.hypot(ex - c.pos.x, ez - c.pos.z) < 4.5) continue;
    const kk = Math.min(1, Math.max(0, (u - w0) / (0.96 - w0))), e = kk * kk * (3 - 2 * kk);
    who.push({ d: { id: "x" + k, role: eRole, x: ex, z: ez, expr: rank || battle ? "stern" : "smile" } as CastDef, x: ex + Math.cos(hd) * drift * e, z: ez + Math.sin(hd) * drift * e, idx: 20 + k, extra: true, moving: kk > 0.001 && kk < 0.999, eraW: eEra, army: armyNum });
  }
  const placed = who.map((w) => {
    const g = proj(w.x, 0, w.z), g1 = proj(w.x, 1, w.z), sc = (w.d.scale ?? 1) * (ROLE_SCALE[w.d.role] ?? 1);
    const pxm = Math.abs(g.y - g1.y);
    let kk0 = (pxm * 1.75 * sc) / CHAR_UNITS; if (g.y > 500) kk0 = Math.min(kk0, (g.y - 110) / CHAR_UNITS); kk0 = Math.min(kk0, 2.4);
    return { ...w, g, k: kk0, depth: c.pos.distanceTo(new THREE.Vector3(w.x, 0, w.z)) };
  }).filter((w) => !w.g.behind && w.k > 0.05 && w.g.x > -400 && w.g.x < 1480).sort((a, b) => b.depth - a.depth);

  const golden = (s.light ?? (s.tod === "dawn" || s.tod === "dusk" ? "golden" : "day")) === "golden";
  const darkGround=(s.tod==="night"||(s.env??[]).includes("night")||s.world?.timeOfDay==="night");
  const textNarr = String(s.narration ?? s.caption ?? "");
  const sadMood = /sad|defeat|loss|died|mourn|ruin|fall|grief|tragedy|tear/i.test(textNarr);

  // Depth-based desaturation / atmospheric tint for far cast members & background
  const baseFilter = sadMood
    ? "hue-rotate(185deg) saturate(0.82) contrast(1.04) brightness(0.92)"
    : golden
    ? "sepia(.25) saturate(1.15) brightness(.97)"
    : "saturate(1.06) contrast(1.03)";

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", filter: baseFilter }}>
      <defs>
        <radialGradient id="castGroundShadow"><stop offset="0%" stopColor="#101820" stopOpacity=".36"/><stop offset="100%" stopColor="#101820" stopOpacity="0"/></radialGradient>
        <filter id="softBloom"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {placed.map((w) => {
        const eraW = w.extra && w.eraW ? w.eraW : (w.extra && s.extrasEra ? s.extrasEra : s.era);
        const o = outfitFor(w.d.role, w.idx, eraW);
        const hv = ((): [number, number] => {
          if (battle && w.extra) return w.army === 1 ? [1, 0] : [-1, 0];
          if (w.d.to && w.moving) return [w.d.to.x - w.d.x, w.d.to.z - w.d.z];
          const other = placed.filter((q) => q !== w && !q.extra).sort((a, b) => Math.hypot(a.x - w.x, a.z - w.z) - Math.hypot(b.x - w.x, b.z - w.z))[0];
          if (other && Math.hypot(other.x - w.x, other.z - w.z) > 0.05) return [other.x - w.x, other.z - w.z];
          return [NaN, NaN];
        })();
        const tcx = c.pos.x - w.x, tcz = c.pos.z - w.z, tl = Math.hypot(tcx, tcz) || 1, tc: [number, number] = [tcx / tl, tcz / tl];
        let yaw = (w.idx % 2 ? -1 : 1) * 28;                       // idle: a natural three-quarter turn toward the lens
        if (battle && w.extra) {
          yaw = w.army === 1 ? 65 : -65;
        } else if (!Number.isNaN(hv[0])) { const hl = Math.hypot(hv[0], hv[1]) || 1, hx = hv[0] / hl, hz = hv[1] / hl; yaw = (Math.atan2(hx * rightXZ[0] + hz * rightXZ[1], hx * tc[0] + hz * tc[1]) * 180) / Math.PI; }
        const pf = (() => {
          if (battle && w.extra) {
            const vIdx = (w.idx + Math.floor(u * 8 + t * 3)) % 4;
            const verb = vIdx === 0 ? "swing" : vIdx === 1 ? "stab" : vIdx === 2 ? "block" : "fall";
            const pVal = (u * 1.5 + w.idx * 0.2) % 1;
            return { verb, p: pVal, t, prop: null, holdProp: "sword" };
          }
          return w.extra ? { verb: w.moving ? "walk" : "talk", p: u, t, prop: null, holdProp: null } : castPerf(w.d, s, u, t);
        })();
        // Subtle depth fade (distance haze desaturation & opacity nudge)
        const farDist = Math.max(0, Math.min(1, (w.depth - 15) / 60));
        const depthStyle = farDist > 0.1 ? { opacity: 1 - farDist * 0.22, filter: `grayscale(${(farDist * 35).toFixed(0)}%)` } : undefined;

        return <g key={w.d.id + w.idx} style={depthStyle}>
          <ellipse cx={w.g.x} cy={w.g.y+1} rx={Math.max(8,w.k*18)} ry={Math.max(2,w.k*4)} fill="url(#castGroundShadow)" opacity={darkGround ? 0.72 : 1}/>
          <Performer2D x={w.g.x} y={w.g.y} scale={w.k} yaw={yaw} skin={o.skin ?? "#f6ead9"} cloth={o.dress ?? o.jacket} hair={o.hair} ink={inkStyleOf(w.d.role, w.idx, eraW, resolveRole(w.d.role, eraW))}
            verb={pf.verb} p={pf.p} t={pf.t} phase={t * 1.15 + w.idx * 0.17} frame={f + w.idx * 13} prop={null} holdProp={null}
            expr={w.d.expr ? EXPR[w.d.expr] ?? null : null} build={w.idx % 2 ? "stocky" : "lean"} seed={w.idx * 17 + 7} />
        </g>;
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
    loadKit().then((k) => { setKit(k); continueRender(handle); });
  }, [handle, board]);
  const { i, local, n } = sceneAt(board, f);
  const scene = board.scenes[i];
  const capFull = scene.caption;
  const era = String(scene.era ?? "").toLowerCase();
  const nightGrade = (scene.env ?? []).includes("night") || scene.tod === "night" || (scene.env ?? []).includes("space");
  const golden = (scene.light ?? (scene.tod === "dawn" || scene.tod === "dusk" ? "golden" : "day")) === "golden";
  const historicCaption = /ancient|egypt|greek|roman|renaissance|medieval|viking/.test(era);
  const captionFont = historicCaption ? "Georgia, 'Times New Roman', serif" : "Arial Black, Impact, Liberation Sans, DejaVu Sans, sans-serif";
  const captionGlow = nightGrade ? "0 0 18px rgba(116,184,255,.28), 0 7px 0 rgba(0,0,0,.38)" : "0 7px 0 rgba(0,0,0,.35)";
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
      <ThreeCanvas width={1080} height={1920} gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }} camera={{ fov: 40, near: 0.15, far: 1500 }}>
        <Inner kit={kit} board={board} />
      </ThreeCanvas>
      <Cast2D board={board} f={f} />

      {/* Cinematic Post-Processing finishing pass: soft bloom, subtle vignette, film grain & light rays */}
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <defs>
          <radialGradient id="cinematicVignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#050812" stopOpacity="0.42" />
          </radialGradient>
          <linearGradient id="sunsetRays" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb347" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#ffcc00" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
          </linearGradient>
          <filter id="filmGrainNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.035 0" />
          </filter>
        </defs>
        {/* Soft Vignette */}
        <rect width="1080" height="1920" fill="url(#cinematicVignette)" />
        {/* Light rays overlay for Golden Hour / Dawn / Dusk */}
        {golden && <rect width="1080" height="1920" fill="url(#sunsetRays)" style={{ mixBlendMode: "screen" }} />}
        {/* Film Grain Texture */}
        <rect width="1080" height="1920" filter="url(#filmGrainNoise)" />
      </svg>

      {cap ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 228, display: "flex", justifyContent: "center", padding: "0 52px", pointerEvents: "none" }}><span style={{ display: "inline-block", maxWidth: "100%", textAlign: "center", fontFamily: captionFont, fontWeight: 900, fontSize: cap.length > 12 ? 66 : 76, lineHeight: 1.06, letterSpacing: historicCaption ? "0.5px" : "-0.8px", color: "#fff", WebkitTextStroke: "9px #17131b", paintOrder: "stroke fill", textShadow: captionGlow, padding: "7px 18px 10px", borderRadius: 12, background: "rgba(15,19,24,.24)", boxShadow: "0 5px 18px rgba(0,0,0,.12)", transform: `scale(${popK.toFixed(3)})` }}>{cap}</span></div> : null}
    </AbsoluteFill>
  );
};
