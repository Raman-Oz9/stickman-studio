import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Performer2D } from "./Performer2D";
import { outfitFor, resolveRole } from "./outfits";
import { inkStyleOf } from "./inkOutfit";
import type { Expression, Vec } from "./Stickman2D";
import { IllustratedWorld2D } from "./IllustratedWorld2D";
import type { IllustratedWorldKind } from "./IllustratedWorld2D";
import { DigPatch, Ledger, PotteryVessel, TradeCoin } from "./IllustratedProps2D";

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const ease = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixVec = (a: Vec, b: Vec, t: number): Vec => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const toWorld = (x: number, y: number, scale: number, yaw: number, local: Vec): Vec => {
  const s = Math.sin(yaw * Math.PI / 180);
  return [x + local[0] * scale * s, y + local[1] * scale];
};
const toLocal = (x: number, y: number, scale: number, yaw: number, world: Vec): Vec => {
  const s = Math.sin(yaw * Math.PI / 180);
  return [(world[0] - x) / (scale * (Math.abs(s) < .001 ? 1 : s)), (world[1] - y) / scale];
};

type ActorProps = {
  roleIndex: number; x: number; y: number; scale: number; facing: 1 | -1; yaw: number;
  frame: number; t: number; phase: number; verb: string; p: number; prop?: string | null;
  handTarget?: Vec | null; target?: Vec | null; gaze?: Vec | null; expr: Expression;
  grip: boolean; renderHeld?: boolean; build?: "lean" | "stocky";
};

const Actor: React.FC<ActorProps> = ({ roleIndex, x, y, scale, facing, yaw, frame, t, phase, verb, p, prop, handTarget, target, gaze, expr, grip, renderHeld = true, build = "lean" }) => {
  const outfit = useMemo(() => outfitFor("merchant", roleIndex, "medieval"), [roleIndex]);
  const ink = useMemo(() => inkStyleOf("merchant", roleIndex, "medieval", resolveRole("merchant", "medieval")), [roleIndex]);
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      <Performer2D
        x={x} y={y} scale={scale} facing={facing} yaw={yaw}
        skin={ink.skin} cloth={ink.top} hair={outfit.hair} ink={ink}
        build={build} seed={roleIndex * 17 + 7} frame={frame}
        verb={verb} p={p} t={t} phase={phase} prop={prop}
        target={target ?? null} gaze={gaze ?? null} expr={expr}
        handTarget={handTarget ?? null} gripOverride={grip} renderHeld={renderHeld}
      />
    </svg>
  );
};

export const IllustratedProof: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = Math.min(4, Math.floor(frame / 120));
  const local = frame - scene * 120;
  const p = clamp(local / 119);
  const t = frame / 30;
  const phase = t * 1.15;
  const kind: IllustratedWorldKind = scene === 0 ? "savanna" : scene === 1 ? "market" : scene === 2 || scene === 4 ? "workshop" : "quarry";

  const zoomStart = [1.04, 1.06, 1.12, 1.12, 1.28][scene];
  const zoomEnd = [1.18, 1.27, 1.34, 1.26, 1.05][scene];
  const zoom = mix(zoomStart, zoomEnd, ease(p));
  const panStartX = [-10, -25, -48, -20, 35][scene];
  const panEndX = [-30, -38, -72, 24, 0][scene];
  const panStartY = [-12, -20, -35, -24, -50][scene];
  const panEndY = [-42, -55, -88, -44, 0][scene];
  const maxPanX = 540 * (zoom - 1);
  const maxPanYTop = 1920 * .58 * (zoom - 1);
  const maxPanYBottom = (1920 - 1920 * .58) * (zoom - 1);
  const panX = clamp(mix(panStartX, panEndX, ease(p)), -maxPanX, maxPanX);
  const panY = clamp(mix(panStartY, panEndY, ease(p)), -maxPanYBottom, maxPanYTop);
  const cameraStyle: React.CSSProperties = {
    position: "absolute", inset: 0,
    transform: "translate(" + panX + "px," + panY + "px) scale(" + zoom + ")",
    transformOrigin: "50% 58%",
    filter: "saturate(1.08) contrast(1.07) brightness(1.025)",
  };

  const giverX = 350, receiverX = 730, tradeY = 1510, actorScale = 1;
  const rest: Vec = [16, -176], carry: Vec = [40, -190], contact: Vec = [540, 1260];
  const giverContact = toLocal(giverX, tradeY, actorScale, 90, contact);
  const receiverContact = toLocal(receiverX, tradeY, actorScale, 270, contact);
  const giverReach = ease((p - .08) / .22);
  const giverRetract = ease((p - .72) / .18);
  const giverHand = mixVec(rest, giverContact, giverReach * (1 - giverRetract));
  const receiverReach = ease((p - .24) / .22);
  const receiverAtContact = mixVec(rest, receiverContact, receiverReach);
  const receiverCarry = ease((p - .68) / .16);
  const receiverHand = mixVec(receiverAtContact, carry, receiverCarry);
  const giverWorld = toWorld(giverX, tradeY, actorScale, 90, giverHand);
  const receiverWorld = toWorld(receiverX, tradeY, actorScale, 270, receiverHand);
  const transfer = ease((p - .4) / .3);
  const coinBase = p < .4 ? giverWorld : p < .7 ? mixVec(giverWorld, receiverWorld, transfer) : receiverWorld;
  const coinWorld: Vec = [coinBase[0], coinBase[1] - Math.sin(transfer * Math.PI) * 16];
  const giverGaze = toLocal(giverX, tradeY, actorScale, 90, coinWorld);
  const receiverGaze = toLocal(receiverX, tradeY, actorScale, 270, coinWorld);

  const writeHand: Vec = [130 + p * 140, -250 + Math.sin(p * Math.PI * 4) * 5];
  const digK = Math.abs(Math.sin(t * 4.2));
  const digHand: Vec = [112, -250 + digK * 30];
  const placeReach = ease(p / .58);
  const placeReturn = ease((p - .76) / .18);
  const placeHand = mixVec(mixVec([140, -250], [250, -190], placeReach), [40, -190], placeReturn);
  const placeHandWorld = toWorld(360, 1510, 1, 90, placeHand);
  const placeRelease = ease((p - .62) / .12);
  const potWorld: Vec = [mix(placeHandWorld[0] + 24, 700, placeRelease), mix(placeHandWorld[1] + 95, 1415, placeRelease)];

  const captions = ["A CITY OF STONE", "GOLD • IVORY • TRADE", "WORDS BECOME RECORDS", "STONE FROM THE EARTH", "CRAFTED BY HAND"];
  const caption = captions[scene];

  return (
    <AbsoluteFill style={{ background: "#263b40", overflow: "hidden" }}>
      <div style={cameraStyle}>
        <IllustratedWorld2D frame={frame} kind={kind} />
        {scene === 0 ? (
          <Actor roleIndex={0} x={mix(250, 405, ease(local / 72))} y={1510} scale={1.14} facing={1} yaw={90}
            frame={frame} t={t} phase={phase} verb={local < 72 ? "walk" : "point"} p={local < 72 ? local / 72 : .65}
            target={[260, -320]} gaze={[250, -410]} expr={local < 82 ? "focused" : "joy"} grip={false} />
        ) : null}
        {scene === 1 ? (
          <>
            <Actor roleIndex={0} x={giverX} y={tradeY} scale={1.04} facing={1} yaw={90}
              frame={frame} t={t} phase={phase} verb="handOver" p={p} prop="goldcoin"
              handTarget={giverHand} target={giverContact} gaze={giverGaze}
              expr={p < .45 ? "focused" : "joy"} grip={p > .36 && p < .76} renderHeld={false} />
            <Actor roleIndex={1} x={receiverX} y={tradeY} scale={1.04} facing={-1} yaw={270}
              frame={frame + 7} t={t} phase={phase + .15} verb="receive" p={p} prop="goldcoin"
              handTarget={receiverHand} target={receiverContact} gaze={receiverGaze}
              expr={p < .55 ? "focused" : "joy"} grip={p > .62} renderHeld={false} />
            {p > .18 ? <TradeCoin x={coinWorld[0]} y={coinWorld[1]} size={82} rotation={frame * 2.2} /> : null}
          </>
        ) : null}
        {scene === 2 ? (
          <>
            <Ledger x={390} y={1150} progress={p} />
            <Actor roleIndex={2} x={320} y={1510} scale={1.08} facing={1} yaw={90}
              frame={frame} t={t} phase={phase} verb="write" p={p} prop="quill"
              handTarget={writeHand} target={[230, -270]} gaze={[210, -330]}
              expr="focused" grip={true} renderHeld={true} />
          </>
        ) : null}
        {scene === 3 ? (
          <>
            <DigPatch x={370} y={1360} progress={p} frame={local} />
            <Actor roleIndex={1} x={330} y={1510} scale={1.08} facing={1} yaw={90}
              frame={frame} t={t} phase={phase} verb="dig" p={p} prop="shovel"
              handTarget={digHand} target={[240, -90]} gaze={[230, -120]}
              expr="focused" grip={true} renderHeld={true} />
          </>
        ) : null}
        {scene === 4 ? (
          <>
            <PotteryVessel x={potWorld[0]} y={potWorld[1]} scale={.9} rotation={-3 + Math.sin(p * Math.PI) * 3} />
            <Actor roleIndex={2} x={360} y={1510} scale={1.08} facing={1} yaw={90}
              frame={frame} t={t} phase={phase} verb="place" p={p} prop="pottery"
              handTarget={placeHand} target={[240, -130]} gaze={[230, -150]}
              expr={p < .62 ? "focused" : "joy"} grip={p < .64} renderHeld={false} />
          </>
        ) : null}
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, rgba(10,8,13,0) 52%, rgba(10,8,13,.22) 100%)" }} />
      <div style={{
        position: "absolute", left: 54, right: 54, bottom: 112, textAlign: "center",
        fontFamily: "Arial Black, Impact, sans-serif", fontWeight: 900, fontSize: 52, lineHeight: 1.05,
        color: "#fff", WebkitTextStroke: "8px #211923", paintOrder: "stroke fill",
        textShadow: "0 6px 0 rgba(0,0,0,.32)",
      }}>{caption}</div>
    </AbsoluteFill>
  );
};
