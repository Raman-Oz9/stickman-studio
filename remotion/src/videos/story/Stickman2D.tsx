import React from "react";
import { twoBone } from "./actions";

// Articulated flat-2D ink stickman. Local space: origin = ground point between the feet,
// +x = forward (mirrored by `facing`), -y = up. Limbs are solved with two-bone IK so hands
// land exactly on targets (coin hand-offs, pointing) and knees/elbows bend the right way.
export type Expression = "smile" | "joy" | "focused" | "shock" | "angry" | "sad";
export type Vec = [number, number];
export type CharacterBuild = "lean" | "stocky";
const BUILD_PROPORTIONS: Record<CharacterBuild, { torso: number; shoulder: number; arm: number; legSpread: number; legLength: number; legWidth: number; head: number; hand: number; shoe: number }> = {
  lean: { torso: 0.94, shoulder: 0.96, arm: 0.94, legSpread: 0.98, legLength: 1, legWidth: 0.94, head: 0.98, hand: 0.96, shoe: 0.96 },
  stocky: { torso: 1.12, shoulder: 1.08, arm: 1.06, legSpread: 1.3, legLength: 1, legWidth: 1.08, head: 1.04, hand: 1.04, shoe: 1.04 },
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
  const nTop = 1.75 + 0.3 * (seeded(seed, 2) - 0.5);
  const nBot = 2.3 + 0.3 * (seeded(seed, 3) - 0.5);
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
  // Round the IK corner with a quadratic fillet, then draw one continuous inked limb.
  // This preserves the elbow/knee direction without separate outlined joint discs or sharp hinges.
  const u1: Vec = [(b[0] - a[0]), (b[1] - a[1])];
  const u2: Vec = [(c[0] - b[0]), (c[1] - b[1])];
  const l1 = Math.max(1, Math.hypot(u1[0], u1[1])), l2 = Math.max(1, Math.hypot(u2[0], u2[1]));
  u1[0] /= l1; u1[1] /= l1; u2[0] /= l2; u2[1] /= l2;
  const corner = Math.min(w * 0.72, l1 * 0.32, l2 * 0.32);
  const p1: Vec = [b[0] - u1[0] * corner, b[1] - u1[1] * corner];
  const p2: Vec = [b[0] + u2[0] * corner, b[1] + u2[1] * corner];
  const d = `M ${a[0]} ${a[1]} L ${p1[0]} ${p1[1]} Q ${b[0]} ${b[1]} ${p2[0]} ${p2[1]} L ${c[0]} ${c[1]}`;
  const cuff: Vec = [mix(a[0], b[0], sleeveFrac), mix(a[1], b[1], sleeveFrac)];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 8} />
      <path d={d} stroke={color} strokeWidth={w} />
      <path d={`M ${mix(a[0], b[0], .22)} ${mix(a[1], b[1], .22)} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} stroke="#fff0ce" strokeWidth="3" opacity=".16" />
      {sleeve ? (
        <g>
          <path d={`M ${a[0]} ${a[1]} L ${cuff[0]} ${cuff[1]}`} stroke={INK} strokeWidth={w + 8} />
          <path d={`M ${a[0]} ${a[1]} L ${cuff[0]} ${cuff[1]}`} stroke={sleeve} strokeWidth={w - 1} />
          <path d={`M ${cuff[0] - 5} ${cuff[1] - 5} L ${cuff[0] + 5} ${cuff[1] + 5}`} stroke={INK} strokeWidth="3.5" opacity=".48" />
        </g>
      ) : null}
    </g>
  );
};

const Shoe: React.FC<{ at: Vec; scale?: number }> = ({ at, scale = 1 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) scale(${scale})`}>
    <path d="M -25 -13 Q -9 -25 10 -17 Q 25 -12 42 -9 Q 64 -6 70 8 Q 73 21 57 25 L -23 24 Q -42 20 -38 5 Q -35 -5 -25 -13Z" fill={INK} stroke="#1f1a22" strokeWidth="5" strokeLinejoin="round" />
    <path d="M -25 17 Q 12 22 60 16" fill="none" stroke="#7b6253" strokeWidth="4" strokeLinecap="round" />
    <path d="M -6 -14 Q 11 -7 27 -8" fill="none" stroke="#f0c779" strokeWidth="4" strokeLinecap="round" opacity=".78" />
    <path d="M 2 -2 Q 16 2 30 0" fill="none" stroke="#fff0ce" strokeWidth="2.5" opacity=".24" />
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
    <path d="M -8 -4 Q -24 -18 -31 -7 Q -35 4 -18 13 L -7 8Z" fill={skin} strokeWidth="6" />
    <path d="M -3 -7 Q 6 -12 14 -7 M -2 2 Q 7 -2 15 3" fill="none" stroke="#633c34" strokeWidth="2.8" opacity=".5" />
    <path d="M 0 14 Q 12 19 24 13" fill="none" stroke="#fff0ce" strokeWidth="2.5" opacity=".25" />
  </g>
);

const Face: React.FC<{ expression: Expression; blink: number; look: number }> = ({ expression, blink, look }) => {
  const eyeY = -490, ex = 22;
  const shut = blink > 0.5;
  const big = expression === "shock" ? 1.35 : expression === "joy" ? 0.9 : 1;
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
      case "joy": return <path d="M -22 -452 Q 0 -418 22 -452 Z" fill="#7a2a33" stroke={INK} strokeWidth="5" strokeLinejoin="round" />;
      case "shock": return <ellipse cx="0" cy="-440" rx="11" ry="15" fill="#7a2a33" stroke={INK} strokeWidth="5" />;
      case "angry": return <path d="M -17 -437 Q 0 -450 17 -437" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />;
      case "sad": return <path d="M -16 -436 Q 0 -450 16 -436" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />;
      case "focused": return <path d="M -13 -441 L 13 -441" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />;
      default: return <path d="M -19 -446 Q 0 -427 19 -446" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />;
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
              <ellipse cx={s * ex} cy={eyeY} rx={13 * big} ry={(expression === "joy" ? 9 : 15) * big} fill="#fffaf0" stroke={INK} strokeWidth="5" />
              <circle cx={s * ex + look * 5} cy={eyeY + 1} r={(expression === "shock" ? 4.5 : 7.5)} fill={INK} />
              <circle cx={s * ex + look * 5 + 2.5} cy={eyeY - 3} r="2.4" fill="#fff" />
            </g>
          )}
        </g>
      ))}
      <ellipse cx="-38" cy="-456" rx="10" ry="6" fill="#e0707a" opacity={expression === "joy" || expression === "smile" ? 0.35 : 0.12} />
      <ellipse cx="38" cy="-456" rx="10" ry="6" fill="#e0707a" opacity={expression === "joy" || expression === "smile" ? 0.35 : 0.12} />
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
  lean?: number;              // torso lean in degrees (positive = forward)
  build?: CharacterBuild;     // distinct silhouette proportions, independent of outfit
  seed?: number;              // stable per-character silhouette variation
};

export const Stickman: React.FC<StickmanProps> = ({
  x, y, scale = 1, facing = 1, skin, cloth, trim, hair = "#2e2423", walk = 0, stand = 1,
  frontHand = null, backHand = null, grip, expression = "smile", frame = 0, look = 0, lean = 0, build = "lean", seed = 17,
}) => {
  const body = BUILD_PROPORTIONS[build];
  const breathe = Math.sin(frame / 9) * 2.5;
  const blink = frame % 96 < 5 ? 1 : 0;
  const swing = Math.sin(walk * Math.PI * 2);
  const lift = (p: number) => Math.max(0, Math.sin(p * Math.PI * 2)) * 34 * (1 - stand);

  const hip: Vec = [HIP[0], HIP[1] + breathe * 0.4];
  const trousers = shadeColor(cloth, 0.72);
  const headPath = buildHeadPath(70, 70, seed);
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
  const torsoPath = `M ${-58 * tw} ${sy + 6} Q ${-66 * tw} ${sy + 60} ${-46 * tw} ${hy - 40} Q ${-62 * tw} ${hy + 4} ${-58 * tw} ${hy + 34} Q 0 ${hy + 52} ${58 * tw} ${hy + 34} Q ${62 * tw} ${hy + 4} ${46 * tw} ${hy - 40} Q ${66 * tw} ${sy + 60} ${58 * tw} ${sy + 6} Q 0 ${sy - 24} ${-58 * tw} ${sy + 6} Z`;
  const handDir = (a: { joint: Vec; end: Vec }) => (Math.atan2(a.end[1] - a.joint[1], a.end[0] - a.joint[0]) * 180) / Math.PI;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="0" cy="6" rx="105" ry="20" fill="#3b2b2c" opacity=".2" />
      {/* back arm + back leg */}
      <Limb a={shB} b={armB.joint} c={armB.end} w={20 * body.arm} color={skin} sleeve={cloth} />
      <Hand at={armB.end} dir={handDir(armB)} skin={skin} size={0.78 * body.hand} />
      <Limb a={[-12 * body.torso, hip[1]]} b={legB.joint} c={legB.end} w={21 * body.legWidth} color={trousers} />
      <Shoe at={legB.end} scale={0.82 * body.shoe} />
      {/* torso */}
      <g transform={`rotate(${lean} 0 ${HIP[1]})`}>
        <path d={torsoPath} fill={INK} stroke={INK} strokeWidth="14" />
        <path d={torsoPath} fill={cloth} />
        <path d={`M ${-48 * tw} ${SHOULDER_Y + 22} Q 0 ${SHOULDER_Y + 46} ${48 * tw} ${SHOULDER_Y + 22}`} fill="none" stroke={trim} strokeWidth="9" />
        <path d={`M ${-58 * tw} ${hy + 24} Q 0 ${hy + 42} ${58 * tw} ${hy + 24}`} fill="none" stroke={trim} strokeWidth="9" />
        <path d={`M ${-45 * tw} ${hy - 36} Q 0 ${hy - 22} ${45 * tw} ${hy - 36}`} fill="none" stroke={INK} strokeWidth="5" opacity=".5" />
        <path d={`M 0 ${SHOULDER_Y + 46} L 0 ${HIP[1] - 4}`} stroke={trim} strokeWidth="4" opacity=".65" />
        <path d={`M ${-66 * tw} ${sy + 12} Q ${-54 * tw} ${sy - 7} ${-35 * tw} ${sy + 3} M ${35 * tw} ${sy + 3} Q ${54 * tw} ${sy - 7} ${66 * tw} ${sy + 12}`} fill="none" stroke={INK} strokeWidth="5" opacity=".48" />
        {/* neck + head */}
        <path d={`M 0 ${SHOULDER_Y - 4} L 0 -440`} stroke={INK} strokeWidth="38" />
        <path d={`M 0 ${SHOULDER_Y - 4} L 0 -440`} stroke={skin} strokeWidth="26" />
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${look * 4}) translate(0 -486) scale(${body.head}) translate(0 486)`}>
          <ellipse cx="-64" cy="-480" rx="13" ry="18" fill={skin} stroke={INK} strokeWidth="7" />
          <ellipse cx="64" cy="-480" rx="13" ry="18" fill={skin} stroke={INK} strokeWidth="7" />
          <path d={headPath} fill={skin} stroke={INK} strokeWidth="10" strokeLinejoin="round" />
          <path d="M -70 -493 Q -79 -568 -16 -579 Q 42 -592 72 -535 Q 78 -514 68 -490 Q 46 -526 12 -528 Q -28 -533 -70 -493Z" fill={hair} stroke={INK} strokeWidth="7" />
          <path d="M -52 -531 Q -30 -550 -4 -546 M 2 -546 Q 34 -556 55 -530" fill="none" stroke="#51403a" strokeWidth="5" opacity=".7" />
          <path d="M -52 -520 Q 0 -550 52 -520" fill="none" stroke={trim} strokeWidth="9" />
          <Face expression={expression} blink={blink} look={look} />
        </g>
      </g>
      {/* front leg + arm */}
      <Limb a={[12 * body.torso, hip[1]]} b={legF.joint} c={legF.end} w={21 * body.legWidth} color={trousers} />
      <Shoe at={legF.end} scale={0.86 * body.shoe} />
      <Limb a={shF} b={armF.joint} c={armF.end} w={20 * body.arm} color={skin} sleeve={cloth} />
      <Hand at={armF.end} dir={handDir(armF)} skin={skin} grip={grip} size={0.78 * body.hand} />
    </g>
  );
};
