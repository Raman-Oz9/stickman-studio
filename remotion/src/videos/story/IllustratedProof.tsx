import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Outfit } from "../bridge/toon";
import { GreatZimbabweBackdrop } from "./GreatZimbabweBackdrop";
import { InkStickman } from "./InkStickman";
import { outfitFor } from "./outfits";
import type { Expression, Vec } from "./Stickman2D";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixVec = (a: Vec, b: Vec, t: number): Vec => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const SCALE = 1.04;
const FEET_Y = 1510;
const REST: Vec = [50, -165];
const POINT: Vec = [160, -250];
const CARRY: Vec = [40, -190];
const CONTACT: Vec = [540, 1185];

const toLocal = (x: number, y: number, facing: 1 | -1, world: Vec): Vec =>
  [(world[0] - x) / (SCALE * facing), (world[1] - y) / SCALE];
const toWorld = (x: number, y: number, facing: 1 | -1, local: Vec): Vec =>
  [x + local[0] * SCALE * facing, y + local[1] * SCALE];

type ActorProps = {
  outfit: Outfit;
  x: number;
  facing: 1 | -1;
  frame: number;
  moving: boolean;
  hand: Vec;
  gaze: Vec;
  grip: boolean;
  expression: Expression;
};

const Actor: React.FC<ActorProps> = ({ outfit, x, facing, frame, moving, hand, gaze, grip, expression }) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
    <InkStickman
      x={x}
      y={FEET_Y}
      scale={SCALE}
      facing={facing}
      skin={outfit.skin ?? "#9b674d"}
      cloth={outfit.dress ?? outfit.jacket ?? "#b5653f"}
      hair={outfit.hair}
      walk={frame / 24}
      stand={moving ? 0 : 1}
      frontHand={hand}
      gaze={gaze}
      grip={grip}
      expression={expression}
      frame={frame}
      build="lean"
    />
  </svg>
);

export const IllustratedProof: React.FC = () => {
  const frame = useCurrentFrame();
  const giverOutfit = useMemo(() => outfitFor("merchant", 0, "medieval"), []);
  const receiverOutfit = useMemo(() => outfitFor("merchant", 1, "medieval"), []);

  // The guide walks into the scene and points at the city before the trade action begins.
  const walk = ease(frame / 38);
  const giverX = mix(320, 390, walk);
  const receiverX = 690;

  const giverContact = toLocal(giverX, FEET_Y, 1, CONTACT);
  const receiverContact = toLocal(receiverX, FEET_Y, -1, CONTACT);
  const pointOut = frame < 28
    ? mixVec(REST, POINT, ease(frame / 12))
    : mixVec(POINT, REST, ease((frame - 28) / 16));
  const reachGiver = ease((frame - 48) / 26) * (1 - ease((frame - 110) / 16));
  const giverHand = frame < 44 ? pointOut : mixVec(REST, giverContact, reachGiver);

  const reachReceiver = ease((frame - 70) / 24);
  const carryReceiver = ease((frame - 112) / 18);
  const receiverReach = mixVec(REST, receiverContact, reachReceiver);
  const receiverHand = mixVec(receiverReach, CARRY, carryReceiver);

  const giverWorld = toWorld(giverX, FEET_Y, 1, giverHand);
  const receiverWorld = toWorld(receiverX, FEET_Y, -1, receiverHand);
  const transfer = ease((frame - 84) / 28);
  const coinWorld: Vec = [
    mix(giverWorld[0], receiverWorld[0], transfer),
    mix(giverWorld[1], receiverWorld[1], transfer) - Math.sin(transfer * Math.PI) * 18,
  ];

  const giverGaze = toLocal(giverX, FEET_Y, 1, coinWorld);
  const receiverGaze = toLocal(receiverX, FEET_Y, -1, coinWorld);
  const push = ease(frame / 88);
  const pull = ease((frame - 112) / 68);
  const zoom = mix(1.02, 1.28, push * (1 - pull));
  const rawPanX = -24 * ease((frame - 84) / 28) * (1 - ease((frame - 120) / 28));
  const rawPanY = -42 * push * (1 - pull);
  const maxPanX = 540 * (zoom - 1);
  const maxPanYTop = 1920 * 0.58 * (zoom - 1);
  const maxPanYBottom = (1920 - 1920 * 0.58) * (zoom - 1);
  const panX = Math.max(-maxPanX, Math.min(maxPanX, rawPanX));
  const panY = Math.max(-maxPanYBottom, Math.min(maxPanYTop, rawPanY));

  const coinOpacity = clamp((frame - 66) / 8);
  const caption = frame < 42 ? "A CITY OF STONE" : frame < 130 ? "GOLD • IVORY • TRADE" : "A KINGDOM CONNECTED";
  const giverExpression: Expression = frame < 30 ? "focused" : frame < 92 ? "smile" : "joy";
  const receiverExpression: Expression = frame < 82 ? "focused" : frame < 112 ? "shock" : "joy";

  return (
    <AbsoluteFill style={{ background: "#b88e5d", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        inset: 0,
        transform: "translate(" + panX + "px," + panY + "px) scale(" + zoom + ")",
        transformOrigin: "50% 58%",
        filter: "saturate(1.12) contrast(1.06) brightness(1.04)",
      }}>
        <GreatZimbabweBackdrop frame={frame} variant={2} />
        <Actor
          outfit={giverOutfit}
          x={giverX}
          facing={1}
          frame={frame}
          moving={frame < 38}
          hand={giverHand}
          gaze={giverGaze}
          grip={frame >= 82 && frame < 112}
          expression={giverExpression}
        />
        <Actor
          outfit={receiverOutfit}
          x={receiverX}
          facing={-1}
          frame={frame + 9}
          moving={false}
          hand={receiverHand}
          gaze={receiverGaze}
          grip={frame >= 100}
          expression={receiverExpression}
        />
        {frame >= 66 ? (
          <svg width="88" height="88" viewBox="0 0 88 88" style={{
            position: "absolute",
            left: coinWorld[0] - 44,
            top: coinWorld[1] - 44,
            opacity: coinOpacity,
            transform: "rotate(" + (frame * 2.2) + "deg)",
            pointerEvents: "none",
          }}>
            <ellipse cx="44" cy="75" rx="28" ry="8" fill="#33241c" opacity=".28" />
            <circle cx="44" cy="43" r="29" fill="#8e5424" stroke="#3c2b23" strokeWidth="6" />
            <circle cx="44" cy="41" r="22" fill="#f2c65d" stroke="#fff0b0" strokeWidth="3" />
            <path d="M35 28H52L57 39 49 45 55 56H37L31 45 39 38Z" fill="#d99b35" stroke="#9c682c" strokeWidth="2" />
            <path d="M29 26Q42 16 55 25" fill="none" stroke="#fff7d6" strokeWidth="3" strokeLinecap="round" opacity=".9" />
          </svg>
        ) : null}
      </div>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 48%, rgba(12,8,14,0) 48%, rgba(12,8,14,.24) 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        left: 54,
        right: 54,
        bottom: 150,
        textAlign: "center",
        fontFamily: "Arial Black, Impact, sans-serif",
        fontWeight: 900,
        fontSize: 54,
        color: "#fff",
        WebkitTextStroke: "8px #211923",
        paintOrder: "stroke fill",
        textShadow: "0 6px 0 rgba(0,0,0,.32)",
      }}>{caption}</div>
    </AbsoluteFill>
  );
};
