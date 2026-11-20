import React from "react";
import { twoBone } from "./actions";

// Articulated flat-2D ink stickman. Local space: origin = ground point between the feet,
// +x = forward (mirrored by `facing`), -y = up. Limbs are solved with two-bone IK so hands
// land exactly on targets (coin hand-offs, pointing) and knees/elbows bend the right way.
export type Expression = "smile" | "joy" | "focused" | "shock" | "angry" | "sad" | "happy" | "afraid" | "surprised" | "thinking";
export type Vec = [number, number];
export type CharacterBuild = "lean" | "stocky";
const BUILD_PROPORTIONS: Record<CharacterBuild, { torso: number; shoulder: number; arm: number; legSpread: number; legLength: number; legWidth: number; head: number; hand: number; shoe: number }> = {
  // Adult silhouettes: smaller craniums, longer legs, broader shoulder-to-head ratio.
  lean: { torso: 1.0, shoulder: 1.04, arm: 1.04, legSpread: 1.0, legLength: 1.12, legWidth: 1.05, head: 0.64, hand: 1.08, shoe: 1.0 },
  stocky: { torso: 1.14, shoulder: 1.14, arm: 1.08, legSpread: 1.15, legLength: 1.08, legWidth: 1.25, head: 0.68, hand: 1.12, shoe: 1.04 },
};

const INK = "#29212a";
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const shadeColor = (hex: string, factor: number): string => {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const channel = (shift: number) => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor))).toString(16).padStart(2, "0");
  return `#${channel(16)}${channel(8)}${channel(0)}`;
};
const seeded = (seed: number, n: number): number => {
  const v = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const buildHeadPath = (rx: number, ry: number, seed: number): string => {
  // Flatter temples and a narrower lower face create a more mature jaw silhouette.
  const nTop = 1.38 + 0.12 * (seeded(seed, 2) - 0.5);
  const nBot = 2.18 + 0.14 * (seeded(seed, 3) - 0.5);
  const egg = -0.12 + 0.06 * (seeded(seed, 4) - 0.5);
  const asym = 0.06 + 0.04 * seeded(seed, 5);
  const rot = (8 * (seeded(seed, 7) - 0.5) * Math.PI) / 180;
  const pts: Vec[] = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t);
    const e = 2 / (sn < 0 ? nTop : nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(sn) * Math.abs(sn) ** e;
    X *= (1 + egg * Y) * (1 + asym * Math.sign(X));
    const noise = 1 + 0.006 * (Math.cos(2 * t + seeded(seed, 11) * Math.PI * 2) + 0.7 * Math.cos(3 * t + seeded(seed, 12) * Math.PI * 2));
    const px = rx * X * noise, py = ry * Y * noise;
    pts.push([px * Math.cos(rot) - py * Math.sin(rot), -486 + px * Math.sin(rot) + py * Math.cos(rot)]);
  }
  return `M ${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L ")} Z`;
};

const HIP: Vec = [0, -236];
const SHOULDER_Y = -402;
const SHOULDER_X = 46;
const UPPER = 92;
const FORE = 88;
const THIGH = 120;
const SHIN = 118;

function ik(s: Vec, t: Vec, l1: number, l2: number, bend: 1 | -1): { joint: Vec; end: Vec } {
  // Reuse the established 2D contact/action solver so character posing and prop contacts share one IK convention.
  const [, joint, end] = twoBone(s, t, l1, l2, bend);
  return { joint, end };
}

const line = (a: Vec, b: Vec, c: Vec) => `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`;

const Limb: React.FC<{ a: Vec; b: Vec; c: Vec; w: number; color: string; sleeve?: string; sleeveFrac?: number }> = ({ a, b, c, w, color, sleeve, sleeveFrac = 0.62 }) => {
  // Sculpt the two-bone chain as one tapered anatomical silhouette rather than
  // two constant-width tubes joined by a visible mechanical hinge.
  const u1: Vec = [b[0] - a[0], b[1] - a[1]];
  const u2: Vec = [c[0] - b[0], c[1] - b[1]];
  const l1 = Math.max(1, Math.hypot(u1[0], u1[1])), l2 = Math.max(1, Math.hypot(u2[0], u2[1]));
  u1[0] /= l1; u1[1] /= l1; u2[0] /= l2; u2[1] /= l2;
  const n1: Vec = [-u1[1], u1[0]], n2: Vec = [-u2[1], u2[0]];
  const bis: Vec = [n1[0] + n2[0], n1[1] + n2[1]];
  const bl = Math.max(0.001, Math.hypot(bis[0], bis[1]));
  bis[0] /= bl; bis[1] /= bl;
  const pt = (v: Vec, n: Vec, amount: number, sign = 1): Vec => [v[0] + n[0] * amount * sign, v[1] + n[1] * amount * sign];
  const a1 = pt(a, n1, w * 0.43), a2 = pt(a, n1, w * 0.43, -1);
  const j1 = pt(b, n1, w * 0.48), j2 = pt(b, n2, w * 0.48);
  const j3 = pt(b, n2, w * 0.48, -1), j4 = pt(b, n1, w * 0.48, -1);
  const c1 = pt(c, n2, w * 0.27), c2 = pt(c, n2, w * 0.27, -1);
  const crown = pt(b, bis, w * 0.66), underside = pt(b, bis, w * 0.66, -1);
  const d = `M ${a1[0]} ${a1[1]} L ${j1[0]} ${j1[1]} Q ${crown[0]} ${crown[1]} ${j2[0]} ${j2[1]} L ${c1[0]} ${c1[1]} Q ${c[0] + u2[0] * w * .18} ${c[1] + u2[1] * w * .18} ${c2[0]} ${c2[1]} L ${j3[0]} ${j3[1]} Q ${underside[0]} ${underside[1]} ${j4[0]} ${j4[1]} L ${a2[0]} ${a2[1]} Q ${a[0] - u1[0] * w * .18} ${a[1] - u1[1] * w * .18} ${a1[0]} ${a1[1]} Z`;
  const cuff: Vec = [mix(a[0], b[0], sleeveFrac), mix(a[1], b[1], sleeveFrac)];
  const cuffPath = `M ${a[0]} ${a[1]} L ${cuff[0]} ${cuff[1]}`;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d={d} fill={color} stroke={INK} strokeWidth={Math.max(4, w * .19)} />
      <path d={`M ${a1[0] + n1[0] * 2} ${a1[1] + n1[1] * 2} Q ${j1[0]} ${j1[1]} ${c1[0]} ${c1[1]}`} fill="none" stroke="#fff0ce" strokeWidth={Math.max(2, w * .075)} opacity=".22" />
      <path d={`M ${j3[0]} ${j3[1]} Q ${underside[0]} ${underside[1]} ${j4[0]} ${j4[1]}`} fill="none" stroke={shadeColor(color, .62)} strokeWidth={Math.max(2, w * .12)} opacity=".72" />
      {sleeve ? (
        <g>
          <path d={cuffPath} fill="none" stroke={INK} strokeWidth={w * .91 + 5} />
          <path d={cuffPath} fill="none" stroke={sleeve} strokeWidth={w * .91} />
          <path d={`M ${cuff[0] - n1[0] * w * .36} ${cuff[1] - n1[1] * w * .36} L ${cuff[0] + n1[0] * w * .36} ${cuff[1] + n1[1] * w * .36}`} stroke={INK} strokeWidth="3.5" opacity=".5" />
        </g>
      ) : null}
    </g>
  );
};

const Shoe: React.FC<{ at: Vec; scale?: number }> = ({ at, scale = 1 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) scale(${scale})`}>
    <path d="M -19 -16 Q -5 -21 7 -14 L 25 -10 Q 39 -7 46 2 L 51 10 Q 48 17 35 18 L -23 17 Q -33 14 -30 4 L -26 -8Z" fill="#29232a" stroke="#17151a" strokeWidth="4" strokeLinejoin="round" />
    <path d="M -27 11 Q 7 15 44 9" fill="none" stroke="#b49a7d" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M -8 -12 L 1 -7 L 15 -6 M -3 -2 L 10 0" fill="none" stroke="#d0b58e" strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
    <path d="M -18 3 L 29 3" fill="none" stroke="#fff0ce" strokeWidth="1.6" opacity=".15" />
  </g>
);

const Hand: React.FC<{ at: Vec; dir: number; skin: string; grip?: boolean; size?: number }> = ({ at, dir, skin, grip, size = 0.78 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${dir}) scale(${size})`} stroke={INK} strokeLinejoin="round" strokeLinecap="round">
    {/* Four individually shaped fingers sit behind the palm; the thumb crosses the palm edge. */}
    {grip ? (
      <g fill="none" stroke={skin} strokeWidth="8">
        <path d="M 8 -9 Q 25 -13 23 -2 Q 21 4 12 2" />
        <path d="M 12 -1 Q 29 -3 25 8 Q 21 14 12 8" />
        <path d="M 9 7 Q 23 10 18 18 Q 13 21 8 14" />
        <path d="M 4 12 Q 13 17 10 23" />
      </g>
    ) : (
      <g fill={skin} strokeWidth="5.5">
        <path d="M 5 -9 Q 5 -23 14 -26 Q 23 -28 25 -18 L 22 -4 Q 17 2 10 -2Z" />
        <path d="M 10 -3 Q 17 -19 27 -18 Q 36 -15 31 -5 L 23 7 Q 16 10 10 4Z" />
        <path d="M 10 5 Q 21 -7 30 0 Q 35 7 26 14 L 17 18 Q 10 15 8 9Z" />
        <path d="M 4 11 Q 13 7 20 15 Q 23 22 14 25 L 5 20Z" />
      </g>
    )}
    <path d="M -10 -13 Q 1 -23 14 -15 Q 26 -5 19 11 Q 13 24 -3 20 Q -17 13 -15 -2Z" fill={skin} strokeWidth="7" />
    <path d="M -8 -5 Q -20 -17 -30 -8 Q -36 2 -20 13 L -7 9Z" fill={skin} strokeWidth="6" />
    <path d="M -8 -5 Q -1 -10 8 -7 M -7 2 Q 1 -1 9 3 M 0 9 Q 8 12 15 8" fill="none" stroke={shadeColor(skin, .62)} strokeWidth="3" opacity=".78" />
    <path d="M 5 -15 Q 15 -20 22 -14 M 12 -3 Q 22 -8 29 -3 M 11 8 Q 19 6 25 11" fill="none" stroke={INK} strokeWidth="2.2" opacity=".42" />
    <path d="M -2 14 Q 9 18 18 13" fill="none" stroke="#fff0ce" strokeWidth="2" opacity=".2" />
  </g>
);

const Face: React.FC<{ expression: Expression; blink: number; look: number; lookY?: number }> = ({ expression, blink, look, lookY = 0 }) => {
  const eyeY = -493, ex = 21;
  const shut = blink > 0.5;
  const big = expression === "shock" ? 0.7 : expression === "joy" ? 0.62 : 0.58;
  const brow = (side: -1 | 1) => {
    const x = side * ex;
    switch (expression) {
      case "angry": return `M ${x - side * 14} ${eyeY - 24} L ${x + side * 14} ${eyeY - 14}`;
      case "shock": return `M ${x - 14} ${eyeY - 34} Q ${x} ${eyeY - 42} ${x + 14} ${eyeY - 34}`;
      case "sad": return `M ${x - side * 14} ${eyeY - 14} L ${x + side * 14} ${eyeY - 25}`;
      case "joy": return `M ${x - 14} ${eyeY - 28} Q ${x} ${eyeY - 38} ${x + 14} ${eyeY - 28}`;
      case "focused": return `M ${x - 14} ${eyeY - 25} L ${x + 14} ${eyeY - 25}`;
      default: return `M ${x - 14} ${eyeY - 27} Q ${x} ${eyeY - 33} ${x + 14} ${eyeY - 27}`;
    }
  };
  const mouth = () => {
    switch (expression) {
      case "joy": return <path d="M -16 -444 Q 0 -432 16 -444" fill="none" stroke="#6d3035" strokeWidth="5" strokeLinecap="round" />;
      case "shock": return <ellipse cx="0" cy="-440" rx="7" ry="10" fill="#6d3035" stroke={INK} strokeWidth="4" />;
      case "angry": return <path d="M -17 -437 Q 0 -450 17 -437" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />;
      case "sad": return <path d="M -16 -436 Q 0 -450 16 -436" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />;
      case "focused": return <path d="M -13 -441 L 13 -441" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />;
      default: return <path d="M -15 -444 Q 0 -439 15 -445" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
    }
  };
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={brow(s as -1 | 1)} fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          {shut ? (
            <path d={`M ${s * ex - 13} ${eyeY} Q ${s * ex} ${eyeY + 8} ${s * ex + 13} ${eyeY}`} fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          ) : (
            <g>
              <path d={`M ${s * ex - 7} ${eyeY} Q ${s * ex} ${eyeY - 5} ${s * ex + 7} ${eyeY}`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
              <ellipse cx={s * ex} cy={eyeY + 1} rx={6 * big} ry={(expression === "joy" ? 4 : 6) * big} fill="#fffaf0" stroke={INK} strokeWidth="3.5" />
              <circle cx={s * ex + look * 3.5} cy={eyeY + 1 + lookY * 2.5} r={(expression === "shock" ? 3.2 : 3.4)} fill={INK} />
              
            </g>
          )}
        </g>
      ))}
      {/* Defined bridge and nostrils replace the tiny generic cartoon nose. */}
      <path d="M -1 -484 Q 1 -470 5 -458 Q 1 -454 -5 -457" fill="none" stroke="#633c34" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity=".88" />
      <path d="M -8 -456 Q -4 -453 -1 -456 M 4 -456 Q 7 -453 10 -456" fill="none" stroke="#633c34" strokeWidth="2.3" opacity=".72" />
      <path d="M -29 -464 Q -23 -460 -18 -462 M 18 -462 Q 23 -460 29 -464" fill="none" stroke="#633c34" strokeWidth="2" opacity=".42" />
      <path d="M -11 -444 Q 0 -441 11 -444" fill="none" stroke="#633c34" strokeWidth="2.5" opacity=".68" />
      {mouth()}
    </g>
  );
};

export type StickmanProps = {
  x: number; y: number; scale?: number; facing?: 1 | -1;
  skin: string; cloth: string; trim: string; hair?: string;
  walk?: number;              // walk-cycle phase (0..1 loops); ignored when `stand`
  stand?: number;             // 0 = walking, 1 = planted stance
  frontHand?: Vec | null;     // hand target in local space (forward arm)
  backHand?: Vec | null;
  grip?: boolean;
  expression?: Expression;
  frame?: number;             // drives blink + idle breathing
  look?: number;              // -1..1 eye direction
  gaze?: Vec | null;          // local-space point the character looks at (head + eyes follow it)
  lean?: number;              // torso lean in degrees (positive = forward)
  build?: CharacterBuild;     // distinct silhouette proportions, independent of outfit
  seed?: number;              // stable per-character silhouette variation
};

export const Stickman: React.FC<StickmanProps> = ({
  x, y, scale = 1, facing = 1, skin, cloth, trim, hair = "#2e2423", walk = 0, stand = 1,
  frontHand = null, backHand = null, grip, expression = "smile", frame = 0, look: lookIn = 0, gaze = null, lean = 0, build = "lean", seed = 17,
}) => {
  const body = BUILD_PROPORTIONS[build];
  const gdx = gaze ? gaze[0] : 0, gdy = gaze ? gaze[1] + 486 : 0;
  const look = gaze ? Math.max(-1, Math.min(1, gdx / 180)) : lookIn;
  const lookY = gaze ? Math.max(-1, Math.min(1, gdy / 160)) : 0;
  const tilt = lookY * 9;
  const breathe = Math.sin(frame / 9) * 2.5;
  const blink = frame % 96 < 5 ? 1 : 0;
  const swing = Math.sin(walk * Math.PI * 2);
  const lift = (p: number) => Math.max(0, Math.sin(p * Math.PI * 2)) * 34 * (1 - stand);

  const hip: Vec = [HIP[0], HIP[1] + breathe * 0.4];
  const trousers = shadeColor(cloth, 0.72);
  const headPath = buildHeadPath(60, 75, seed);
  const footF: Vec = [mix(34 * body.legSpread + swing * 62 * body.legSpread, 38 * body.legSpread, stand), -lift(walk)];
  const footB: Vec = [mix(-34 * body.legSpread - swing * 62 * body.legSpread, -34 * body.legSpread, stand), -lift(walk + 0.5)];
  const legF = ik([12 * body.torso, hip[1]], footF, THIGH * body.legLength, SHIN * body.legLength, 1);
  const legB = ik([-12 * body.torso, hip[1]], footB, THIGH * body.legLength, SHIN * body.legLength, 1);

  const rest = (side: 1 | -1, p: number): Vec => [side * 22 + swing * side * 38 * (1 - stand) * (p ? -1 : 1), -402 + 150];
  const shoulderX = SHOULDER_X * body.shoulder;
  const shF: Vec = [shoulderX, SHOULDER_Y + breathe];
  const shB: Vec = [-shoulderX, SHOULDER_Y + breathe];
  const tF = frontHand ?? [shoulderX + 12 * body.arm, -232];
  const tB = backHand ?? [-shoulderX - 8 * body.arm + swing * 24 * (1 - stand), -226];
  const armF = ik(shF, tF, UPPER * body.arm, FORE * body.arm, 1);
  const armB = ik(shB, tB, UPPER * body.arm, FORE * body.arm, 1);

  const sy = SHOULDER_Y, hy = HIP[1];
  const tw = body.torso;
  const torsoPath = `M ${-64 * tw} ${sy + 5} Q ${-78 * tw} ${sy + 20} ${-72 * tw} ${sy + 66} L ${-58 * tw} ${sy + 112} L ${-48 * tw} ${hy - 42} Q ${-45 * tw} ${hy - 12} ${-50 * tw} ${hy + 18} Q ${-55 * tw} ${hy + 34} ${-62 * tw} ${hy + 42} Q 0 ${hy + 54} ${62 * tw} ${hy + 42} Q ${55 * tw} ${hy + 34} ${50 * tw} ${hy + 18} Q ${45 * tw} ${hy - 12} ${48 * tw} ${hy - 42} L ${58 * tw} ${sy + 112} L ${72 * tw} ${sy + 66} Q ${78 * tw} ${sy + 20} ${64 * tw} ${sy + 5} Q 0 ${sy - 24} ${-64 * tw} ${sy + 5} Z`;
  const handDir = (a: { joint: Vec; end: Vec }) => (Math.atan2(a.end[1] - a.joint[1], a.end[0] - a.joint[0]) * 180) / Math.PI;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="0" cy="6" rx="105" ry="20" fill="#3b2b2c" opacity=".2" />
      {/* back arm + back leg */}
      <Limb a={shB} b={armB.joint} c={armB.end} w={23 * body.arm} color={skin} sleeve={cloth} />
      <Hand at={armB.end} dir={handDir(armB)} skin={skin} size={0.78 * body.hand} />
      <Limb a={[-12 * body.torso, hip[1]]} b={legB.joint} c={legB.end} w={25 * body.legWidth} color={trousers} />
      <Shoe at={legB.end} scale={0.82 * body.shoe} />
      {/* torso */}
      <g transform={`rotate(${lean} 0 ${HIP[1]})`}>
        <path d={torsoPath} fill={INK} stroke={INK} strokeWidth="14" />
        <path d={torsoPath} fill={cloth} />
        <path d={`M ${-54 * tw} ${SHOULDER_Y + 25} Q ${-24 * tw} ${SHOULDER_Y + 58} 0 ${SHOULDER_Y + 52} Q ${24 * tw} ${SHOULDER_Y + 58} ${54 * tw} ${SHOULDER_Y + 25}`} fill="none" stroke={trim} strokeWidth="6" opacity=".82" />
        {/* Tailored tunic construction: defined shoulder seams, tapered waist, side folds and weighted hem. */}
        <path d={`M ${-56 * tw} ${sy + 74} Q ${-35 * tw} ${sy + 105} ${-28 * tw} ${hy + 16} M ${56 * tw} ${sy + 74} Q ${35 * tw} ${sy + 105} ${28 * tw} ${hy + 16}`} fill="none" stroke={INK} strokeWidth="4.5" opacity=".38" />
        <path d={`M ${-44 * tw} ${hy + 35} Q 0 ${hy + 58} ${44 * tw} ${hy + 35}`} fill="none" stroke={INK} strokeWidth="5" opacity=".52" />
        <path d={`M ${-24 * tw} ${sy + 120} Q ${-8 * tw} ${sy + 145} ${-18 * tw} ${hy + 8} M ${24 * tw} ${sy + 120} Q ${8 * tw} ${sy + 145} ${18 * tw} ${hy + 8}`} fill="none" stroke={trim} strokeWidth="3" opacity=".38" />
        <path d={`M ${-56 * tw} ${hy + 24} Q 0 ${hy + 40} ${56 * tw} ${hy + 24}`} fill="none" stroke={trim} strokeWidth="7" />
        <path d={`M ${-38 * tw} ${hy - 34} Q 0 ${hy - 20} ${38 * tw} ${hy - 34}`} fill="none" stroke={INK} strokeWidth="4" opacity=".42" />
        <path d={`M ${-42 * tw} ${sy + 80} Q ${-24 * tw} ${sy + 104} 0 ${sy + 98} Q ${24 * tw} ${sy + 104} ${42 * tw} ${sy + 80}`} fill="none" stroke={INK} strokeWidth="4" opacity=".28" />
        <path d={`M 0 ${SHOULDER_Y + 46} L 0 ${HIP[1] - 4}`} stroke={trim} strokeWidth="4" opacity=".65" />
        <path d={`M ${-66 * tw} ${sy + 12} Q ${-54 * tw} ${sy - 7} ${-35 * tw} ${sy + 3} M ${35 * tw} ${sy + 3} Q ${54 * tw} ${sy - 7} ${66 * tw} ${sy + 12}`} fill="none" stroke={INK} strokeWidth="5" opacity=".48" />
        {/* neck + head */}
        <path d={`M 0 ${SHOULDER_Y - 4} L 0 -440`} stroke={INK} strokeWidth="44" />
        <path d={`M 0 ${SHOULDER_Y - 4} L 0 -440`} stroke={skin} strokeWidth="30" />
        <path d={`M -18 ${SHOULDER_Y - 20} Q 0 ${SHOULDER_Y + 2} 18 ${SHOULDER_Y - 20}`} fill="none" stroke={shadeColor(skin, .68)} strokeWidth="5" opacity=".8" />
        <g transform={`translate(0 ${breathe * 0.6}) translate(0 -440) rotate(${look * 4 + tilt}) translate(0 440) translate(0 -486) scale(${body.head}) translate(0 486)`}>
          <ellipse cx="-64" cy="-480" rx="13" ry="18" fill={skin} stroke={INK} strokeWidth="7" />
          <ellipse cx="64" cy="-480" rx="13" ry="18" fill={skin} stroke={INK} strokeWidth="7" />
          <path d={headPath} fill={skin} stroke={INK} strokeWidth="10" strokeLinejoin="round" />
          <path d="M -63 -496 Q -78 -554 -28 -578 Q 18 -598 58 -562 L 75 -526 L 64 -493 Q 42 -524 10 -529 Q -28 -533 -63 -496Z" fill={hair} stroke={INK} strokeWidth="7" />
          <path d="M -48 -540 Q -24 -556 -4 -550 M 4 -550 Q 30 -559 49 -538" fill="none" stroke="#51403a" strokeWidth="4" opacity=".72" />
          <path d="M -55 -520 Q -28 -533 0 -529 Q 29 -533 55 -520" fill="none" stroke={trim} strokeWidth="5" opacity=".8" />
          <Face expression={expression} blink={blink} look={look} lookY={lookY} />
        </g>
      </g>
      {/* front leg + arm */}
      <Limb a={[12 * body.torso, hip[1]]} b={legF.joint} c={legF.end} w={25 * body.legWidth} color={trousers} />
      <Shoe at={legF.end} scale={0.86 * body.shoe} />
      <Limb a={shF} b={armF.joint} c={armF.end} w={23 * body.arm} color={skin} sleeve={cloth} />
      <Hand at={armF.end} dir={handDir(armF)} skin={skin} grip={grip} size={0.78 * body.hand} />
    </g>
  );
};
