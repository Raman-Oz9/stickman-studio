// Storyboard-driven story short: one ThreeCanvas, one StoryWorld, scenes selected by frame. Same post chain as the Bridge.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { loadStickers } from "../bridge/stickers";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { loadKit } from "../bridge/world";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../bridge/grade";
import { Kit } from "../bridge/build";
import { StoryWorld } from "./world";
import { Board, sceneAt, totalFrames, FPS } from "./types";
import { DEMO } from "./demo";

export const getBoard = (): Board => ((getInputProps() as { board?: Board }).board) ?? DEMO;
export const storyFrames = (b: Board) => totalFrames(b);

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass; const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3();

const Inner: React.FC<{ kit: Kit; board: Board }> = ({ kit, board }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new StoryWorld(kit, board.models), [kit, board]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera), lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }), bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  useEffect(() => () => { (fx.ink as { dispose?: () => void }).dispose?.(); }, [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={((getInputProps() as { post?: { msaa?: number } }).post?.msaa) ?? 4}>
      <primitive object={fx.ink} dispose={null} />
      <primitive object={fx.lens.pre} dispose={null} />
      <primitive object={fx.lens.main} dispose={null} />
      <primitive object={fx.bloom} dispose={null} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
    </EffectComposer>
  ), [fx]);
  const { i, local, n } = sceneAt(board, f);
  const cam = camera as THREE.PerspectiveCamera;
  const r = world.update(board.scenes[i], i, local, n, cam, scene, f / FPS);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, r.focus.clone().sub(cam.position).dot(fwd));
  fx.lens.cInf = r.cInf;
  gradeFor(fx.grade, r.light);
  return (<><primitive object={world.root} dispose={null} />{post}</>);
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;

export const StoryShort: React.FC = () => {
  const f = useCurrentFrame();
  const board = useMemo(getBoard, []);
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("story kit"));
  useEffect(() => {
    const urls: Record<string, string> = {};
    Object.entries(board.stickers ?? {}).forEach(([n, u]) => { urls[n] = staticFile(u); });
    Promise.all([loadKit(), loadStickers(urls)]).then(([k]) => { setKit(k); continueRender(handle); });
  }, [handle, board]);
  const { i, local, n } = sceneAt(board, f);
  const capFull = board.scenes[i].caption;
  // word-by-word captions (2-word chunks weighted by length, like the reference), each chunk pops in
  let cap = capFull, popK = 1;
  if (capFull) {
    const ws = capFull.split(/\s+/).filter(Boolean), ch: string[] = [];
    for (let k = 0; k < ws.length;) { const take = ws[k].length + (ws[k + 1]?.length ?? 99) <= 11 ? 2 : 1; ch.push(ws.slice(k, k + take).join(" ")); k += take; }
    const wts = ch.map((c) => c.length + 2), tot = wts.reduce((a, b) => a + b, 0), u = Math.min(0.999, Math.max(0, (local - 2) / Math.max(1, n - 6)));
    let acc = 0, idx = 0, start = 0; for (; idx < ch.length - 1; idx++) { if (u < (acc + wts[idx]) / tot) break; acc += wts[idx]; }
    start = (acc / tot) * Math.max(1, n - 6) + 2; cap = ch[idx]; popK = 1 + 0.22 * Math.max(0, 1 - (local - start) / 5);
  }
  // whip: a fast blur + slight zoom over the first and last frames of each shot (the cut hides inside it)
  const whipIn = i > 0 ? Math.max(0, 1 - local / 6) : 0, whipOut = Math.max(0, 1 - (n - 1 - local) / 3);
  const wb = Math.max(whipIn * 22, whipOut * 16), wz = 1 + whipIn * 0.1 + whipOut * 0.06;
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <AbsoluteFill style={{ filter: wb > 0.5 ? `blur(${wb.toFixed(1)}px)` : undefined, transform: wz > 1.001 ? `scale(${wz.toFixed(3)})` : undefined }}>
      <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.15, far: 1500 }}>
        <Inner kit={kit} board={board} />
      </ThreeCanvas>
      </AbsoluteFill>
      {cap ? (
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 220, textAlign: "center", fontFamily: "Arial Black, Impact, Liberation Sans, DejaVu Sans, sans-serif", fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: "#fff", WebkitTextStroke: "10px #1a1020", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,.35)", transform: `scale(${popK.toFixed(3)})` }}>{cap}</div>
      ) : null}
    </AbsoluteFill>
  );
};
