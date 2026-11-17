import React from "react";
import type { Expression, Vec } from "./Stickman2D";

// "Ink Explainer" stickman: plain round head with a minimal face, tee torso, thin outlined arms,
// white mitten hands, straight jeans legs, white sneakers. Local space: origin = ground between
// the feet, +x = forward, -y = up. Two-bone IK puts hands exactly on targets; knees bend forward.
const INK = "#1d1a20";
const HIP_Y = -204, SH_Y = -336, SH_X = 40, HEAD_Y = -430, HEAD_R = 64;
const UPPER = 84, FORE = 82, THIGH = 102, SHIN = 100;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function ik(s: Vec, t: Vec, l1: number, l2: number, bend: 1 | -1): { joint: Vec; end: Vec } {
  const dx = t[0] - s[0], dy = t[1] - s[1];
  const dist = Math.max(10, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.5));
  const base = Math.atan2(dy, dx);
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist)))) * bend;
  return { joint: [s[0] + Math.cos(base + a) * l1, s[1] + Math.sin(base + a) * l1], end: [s[0] + Math.cos(base) * dist, s[1] + Math.sin(base) * dist] };
}

const Limb: React.FC<{ a: Vec; b: Vec; c: Vec; w: number; color: string }> = ({ a, b, c, w, color }) => {
  const d = `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 9} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
};

const Hat: React.FC<{ hat: string; hair?: string }> = ({ hat, hair }) => {
  switch (hat.toLowerCase()) {
    case "crown":
      return (
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M -38 -485 L -45 -530 L -18 -505 L 0 -540 L 18 -505 L 45 -530 L 38 -485 Z" fill="#f4c430" />
          <path d="M -36 -485 Q 0 -478 36 -485 L 34 -470 Q 0 -465 -34 -470 Z" fill="#8c2a35" />
          <circle cx="-18" cy="-512" r="4" fill="#e8f4f6" />
          <circle cx="0" cy="-522" r="4" fill="#d2362e" />
          <circle cx="18" cy="-512" r="4" fill="#2f6fb5" />
        </g>
      );
    case "tophat":
      return (
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M -54 -485 L 54 -485 L 50 -475 L -50 -475 Z" fill="#1d1a20" />
          <path d="M -32 -475 L -32 -540 Q 0 -548 32 -540 L 32 -475 Z" fill="#242129" />
          <path d="M -32 -488 L 32 -488 L 32 -478 L -32 -478 Z" fill="#8c2a35" />
        </g>
      );
    case "helmet":
    case "roman":
      return (
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M -52 -470 Q 0 -545 52 -470 Q 0 -485 -52 -470 Z" fill="#8d97a6" />
          <path d="M 0 -545 L 0 -575 Q 15 -575 18 -545 Z" fill="#c0353a" />
        </g>
      );
    case "viking":
      return (
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M -50 -470 Q 0 -525 50 -470 Z" fill="#606875" />
          <path d="M -42 -490 Q -65 -540 -75 -520 Q -60 -480 -38 -480 Z" fill="#f8f4eb" />
          <path d="M 42 -490 Q 65 -540 75 -520 Q 60 -480 38 -480 Z" fill="#f8f4eb" />
        </g>
      );
    case "straw":
    case "cowboy":
      return (
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <ellipse cx="0" cy="-475" rx="64" ry="12" fill="#d9b36c" />
          <path d="M -32 -475 Q 0 -520 32 -475 Z" fill="#c49a45" />
        </g>
      );
    case "cap":
      return (
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M -45 -475 Q 0 -505 45 -475 Q 35 -465 -45 -465 Z" fill="#24366b" />
          <path d="M 10 -468 L 52 -465 L 48 -460 L 10 -462 Z" fill="#1d1a20" />
        </g>
      );
    case "tricorn":
      return (
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M -60 -475 Q 0 -490 60 -475 Q 45 -520 0 -505 Q -45 -520 -60 -475 Z" fill="#242129" />
          <circle cx="0" cy="-485" r="5" fill="#f4c430" />
        </g>
      );
    case "turban":
      return (
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <ellipse cx="0" cy="-480" rx="55" ry="24" fill="#e8dcc0" />
          <path d="M -45 -480 Q 0 -510 45 -480" fill="none" stroke={INK} strokeWidth="4" />
          <circle cx="0" cy="-492" r="6" fill="#d2362e" />
        </g>
      );
    case "laurel":
      return (
        <g stroke={INK} strokeWidth="4.5" strokeLinejoin="round" fill="#5e8c45">
          <path d="M -48 -475 Q -55 -515 0 -525 Q 55 -515 48 -475" fill="none" stroke="#5e8c45" strokeWidth="5" />
          {[-35, -20, -5, 10, 25, 40].map(dx => (
            <ellipse key={dx} cx={dx} cy={-505 + Math.abs(dx)*0.15} rx="7" ry="4" transform={`rotate(${dx * 0.8} ${dx} ${-505})`} fill="#7ab35a" stroke={INK} strokeWidth="3.5" />
          ))}
        </g>
      );
    default:
      return hair ? (
        <g>
          <path d="M -63 -438 C -70 -472 -48 -500 -18 -500 C 2 -524 39 -512 51 -485 C 69 -477 70 -452 63 -438 Q 37 -455 19 -457 Q -2 -449 -17 -461 Q -36 -447 -63 -438 Z" fill={hair} stroke={INK} strokeWidth="5.5" strokeLinejoin="round" />
          <path d="M -25 -483 Q 7 -509 42 -484 Q 14 -492 0 -469" fill="none" stroke="#fff3d5" strokeWidth="4" strokeLinecap="round" opacity=".28" />
        </g>
      ) : null;
  }
};

const Monocle: React.FC = () => (
  <g>
    <circle cx="24" cy={HEAD_Y - 8} r="15" fill="none" stroke="#f4c430" strokeWidth="4.5" />
    <path d="M 33 -430 Q 36 -390 28 -340 Q 24 -310 32 -280" fill="none" stroke="#f4c430" strokeWidth="3" strokeLinecap="round" />
  </g>
);

const Barrel: React.FC = () => (
  <g>
    <path d="M -54 -310 Q -64 -230 -52 -180 Q -60 -140 -50 -100 L 50 -100 Q 60 -140 52 -180 Q 64 -230 54 -310 Z" fill="#9e6d42" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
    <path d="M -28 -310 L -24 -100 M 0 -310 L 0 -100 M 28 -310 L 24 -100" fill="none" stroke="#78502d" strokeWidth="3.5" opacity=".7" />
    <path d="M -56 -280 L 56 -280 M -53 -210 L 53 -210 M -51 -130 L 51 -130" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
    <path d="M -56 -280 L 56 -280 M -53 -210 L 53 -210 M -51 -130 L 51 -130" fill="none" stroke="#d4a63a" strokeWidth="3.5" strokeLinecap="round" />
  </g>
);

const InkBird: React.FC<{ frame: number }> = ({ frame }) => {
  const bob = Math.sin(frame / 6) * 6;
  return (
    <g transform={`translate(-80, ${-380 + bob})`} stroke={INK} strokeWidth="4" strokeLinejoin="round" fill="#1d1a20">
      <ellipse cx="0" cy="0" rx="14" ry="11" />
      <circle cx="8" cy="-5" r="9" />
      <circle cx="12" cy="-7" r="2.5" fill="#fff" />
      <circle cx="13" cy="-7" r="1.2" />
      <path d="M 16 -5 L 24 -3 L 16 -1 Z" fill="#f4c430" />
      <path d="M -8 11 L -12 20 M -3 11 L -5 19" fill="none" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M -12 -3 Q -20 -12 -16 -18 Q -10 -10 -8 -4" fill="#1d1a20" />
    </g>
  );
};
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${dir})`} stroke={INK} strokeWidth="5" strokeLinejoin="round">
    <ellipse cx="10" cy="0" rx="17" ry="14" fill="#fbf7ef" />
    {grip ? (
      <>
        <path d="M 0 -8 Q -13 -20 -18 -9 Q -20 1 -8 5" fill="#fbf7ef" />
        <path d="M 13 -9 Q 25 -12 25 -3 Q 25 2 18 3" fill="none" />
        <path d="M 13 -1 Q 25 -2 22 7 Q 19 11 12 7" fill="none" />
        <path d="M 6 7 Q 15 14 8 16" fill="none" />
      </>
    ) : <ellipse cx="6" cy="-13" rx="8" ry="6" fill="#fbf7ef" transform="rotate(-25 6 -13)" />}
  </g>
);

const Shoe: React.FC<{ at: Vec }> = ({ at }) => (
  <path d={`M ${at[0] - 20} ${at[1] - 12} L ${at[0] + 8} ${at[1] - 12} Q ${at[0] + 44} ${at[1] - 10} ${at[0] + 46} ${at[1] + 6} L ${at[0] + 46} ${at[1] + 12} L ${at[0] - 20} ${at[1] + 12} Z`} fill="#fbf7ef" stroke={INK} strokeWidth="5.5" strokeLinejoin="round" />
);

const Face: React.FC<{ expression: Expression; blink: boolean; look: number; lookY: number }> = ({ expression, blink, look, lookY }) => {
  const ey = HEAD_Y - 8, ex = 24;
  const lx = look * 4, ly = lookY * 3;
  const brow = (s: -1 | 1) => {
    const x = s * ex;
    switch (expression) {
      case "angry": return `M ${x - s * 14} ${ey - 24} L ${x + s * 14} ${ey - 12}`;
      case "shock": return `M ${x - 13} ${ey - 30} Q ${x} ${ey - 38} ${x + 13} ${ey - 30}`;
      case "sad": return `M ${x + s * 13} ${ey - 14} L ${x - s * 13} ${ey - 26}`;
      case "joy": return `M ${x - 13} ${ey - 28} Q ${x} ${ey - 36} ${x + 13} ${ey - 28}`;
      default: return `M ${x - 13} ${ey - 24} Q ${x} ${ey - 29} ${x + 13} ${ey - 24}`;
    }
  };
  const angryBrow = (s: -1 | 1) => `M ${s * ex + s * 14} ${ey - 24} L ${s * ex - s * 12} ${ey - 11}`;
  const mouth = () => {
    const y = HEAD_Y + 28;
    switch (expression) {
      case "joy": return <path d={`M -26 ${y - 8} Q 0 ${y + 30} 26 ${y - 8} Z`} fill="#8c2a35" stroke={INK} strokeWidth="5" strokeLinejoin="round" />;
      case "shock": return <ellipse cx="0" cy={y + 4} rx="11" ry="15" fill="#8c2a35" stroke={INK} strokeWidth="5" />;
      case "angry": return <path d={`M -18 ${y + 8} Q 0 ${y - 6} 18 ${y + 8}`} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />;
      case "sad": return <path d={`M -16 ${y + 8} Q 0 ${y - 4} 16 ${y + 8}`} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />;
      case "focused": return <path d={`M -14 ${y} L 14 ${y}`} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />;
      default: return <path d={`M -20 ${y - 2} Q 0 ${y + 14} 20 ${y - 2}`} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />;
    }
  };
  return (
    <g>
      {[-1, 1].map((s) => {
        const sd = s as -1 | 1;
        const closed = blink || expression === "joy";
        return (
          <g key={s}>
            <path d={expression === "angry" ? angryBrow(sd) : brow(sd)} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
            {closed ? (
              <path d={expression === "joy" ? `M ${s * ex - 12} ${ey + 3} Q ${s * ex} ${ey - 11} ${s * ex + 12} ${ey + 3}` : `M ${s * ex - 11} ${ey} Q ${s * ex} ${ey + 7} ${s * ex + 11} ${ey}`} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
            ) : expression === "shock" ? (
              <g><circle cx={s * ex} cy={ey} r="13" fill="#fff" stroke={INK} strokeWidth="4.5" /><circle cx={s * ex + lx} cy={ey + ly} r="4.5" fill={INK} /></g>
            ) : (
              <g><ellipse cx={s * ex} cy={ey} rx="11" ry="13" fill="#fffaf1" stroke={INK} strokeWidth="3.5" /><circle cx={s * ex + lx} cy={ey + ly} r={expression === "focused" || expression === "angry" ? 5.5 : 6.5} fill={INK} /><circle cx={s * ex + lx - 2} cy={ey + ly - 2} r="2.1" fill="#fff" /></g>
            )}
          </g>
        );
      })}
      <path d="M -1 -420 Q 8 -413 2 -407" fill="none" stroke="#8a5b49" strokeWidth="3.5" strokeLinecap="round" opacity=".72" />
      <ellipse cx="-39" cy="-408" rx="10" ry="5" fill="#d77f73" opacity=".18" />
      <ellipse cx="39" cy="-408" rx="10" ry="5" fill="#d77f73" opacity=".18" />
      {mouth()}
    </g>
  );
};

export type InkStickmanProps = {
  x: number; y: number; scale?: number; facing?: 1 | -1;
  skin: string; cloth: string; trim?: string; hair?: string; hat?: string;
  monocle?: boolean; barrel?: boolean;
  walk?: number; stand?: number;
  frontHand?: Vec | null; backHand?: Vec | null; grip?: boolean;
  expression?: Expression; frame?: number; look?: number; gaze?: Vec | null; lean?: number;
  build?: "lean" | "stocky"; seed?: number;
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

export const InkStickman: React.FC<InkStickmanProps> = ({
  x, y, scale = 1, facing = 1, skin, cloth, hair, walk = 0, stand = 1, frontHand = null, backHand = null,
  expression = "smile", frame = 0, look: lookIn = 0, gaze = null, lean = 0, build = "lean", grip = false,
}) => {
  const wide = build === "stocky" ? 1.14 : 1;
  const breathe = Math.sin(frame / 9) * 2;
  const blink = frame % 100 < 4;
  const swing = Math.sin(walk * Math.PI * 2);
  const lift = (p: number) => Math.max(0, Math.sin(p * Math.PI * 2)) * 30 * (1 - stand);
  const jeans = "#3d5a86";

  const footF: Vec = [mix(18 + swing * 46, 22, stand), -lift(walk)];
  const footB: Vec = [mix(-18 - swing * 46, -20, stand), -lift(walk + 0.5)];
  const legF = ik([10, HIP_Y], footF, THIGH, SHIN, -1);
  const legB = ik([-10, HIP_Y], footB, THIGH, SHIN, -1);

  const shF: Vec = [SH_X * wide, SH_Y + breathe], shB: Vec = [-SH_X * wide, SH_Y + breathe];
  const armF = ik(shF, frontHand ?? [SH_X * wide + 10, SH_Y + 150], UPPER, FORE, 1);
  const armB = ik(shB, backHand ?? [-SH_X * wide - 6, SH_Y + 152 + swing * 6 * (1 - stand)], UPPER, FORE, 1);
  const ang = (a: { joint: Vec; end: Vec }) => (Math.atan2(a.end[1] - a.joint[1], a.end[0] - a.joint[0]) * 180) / Math.PI;

  const gdx = gaze ? gaze[0] : 0, gdy = gaze ? gaze[1] - HEAD_Y : 0;
  const look = gaze ? Math.max(-1, Math.min(1, gdx / 180)) : lookIn;
  const lookY = gaze ? Math.max(-1, Math.min(1, gdy / 160)) : 0;
  const headRot = look * 4 + lookY * 8;
  const tw = 46 * wide;
  const torso = `M ${-tw} ${SH_Y + 6} Q ${-tw - 6} ${SH_Y + 70} ${-tw + 2} ${HIP_Y + 4} L ${tw - 2} ${HIP_Y + 4} Q ${tw + 6} ${SH_Y + 70} ${tw} ${SH_Y + 6} Q 0 ${SH_Y - 12} ${-tw} ${SH_Y + 6} Z`;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <ellipse cx="0" cy="6" rx="82" ry="14" fill="#2b2128" opacity=".22" />
      <Limb a={shB} b={armB.joint} c={armB.end} w={13} color={skin} />
      <Mitten at={armB.end} dir={ang(armB)} />
      <Limb a={[-10, HIP_Y]} b={legB.joint} c={legB.end} w={21} color={shade(jeans, 0.85)} />
      <Shoe at={legB.end} />
      <g transform={`rotate(${lean} 0 ${HIP_Y})`}>
        <path d={torso} fill={cloth} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <path d={`M ${-tw + 4} ${HIP_Y - 6} Q 0 ${HIP_Y + 6} ${tw - 4} ${HIP_Y - 6}`} fill="none" stroke={shade(cloth, 0.7)} strokeWidth="5" />
        <path d={`M -18 ${SH_Y + 4} Q 0 ${SH_Y + 22} 18 ${SH_Y + 4}`} fill="none" stroke={shade(cloth, 0.7)} strokeWidth="5" />
        <path d="M 0 -288 l 10 10 -10 10 -10 -10 Z" fill="#e3b15d" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <g transform={`translate(0 ${breathe * 0.5}) translate(0 ${SH_Y}) rotate(${headRot}) translate(0 ${-SH_Y})`}>
          <ellipse cx="-62" cy={HEAD_Y + 2} rx="9" ry="13" fill={skin} stroke={INK} strokeWidth="5" />
          <ellipse cx="62" cy={HEAD_Y + 2} rx="9" ry="13" fill={skin} stroke={INK} strokeWidth="5" />
          <circle cx="0" cy={HEAD_Y} r={HEAD_R} fill={skin} stroke={INK} strokeWidth="6.5" />
          {hair ? <g><path d="M -63 -438 C -70 -472 -48 -500 -18 -500 C 2 -524 39 -512 51 -485 C 69 -477 70 -452 63 -438 Q 37 -455 19 -457 Q -2 -449 -17 -461 Q -36 -447 -63 -438 Z" fill={hair} stroke={INK} strokeWidth="5.5" strokeLinejoin="round" /><path d="M -25 -483 Q 7 -509 42 -484 Q 14 -492 0 -469" fill="none" stroke="#fff3d5" strokeWidth="4" strokeLinecap="round" opacity=".28" /></g> : null}
          <Face expression={expression} blink={blink} look={look} lookY={lookY} />
        </g>
      </g>
      <Limb a={[10, HIP_Y]} b={legF.joint} c={legF.end} w={21} color={jeans} />
      <Shoe at={legF.end} />
      <Limb a={shF} b={armF.joint} c={armF.end} w={13} color={skin} />
      <Mitten at={armF.end} dir={ang(armF)} grip={grip} />
    </g>
  );
};
