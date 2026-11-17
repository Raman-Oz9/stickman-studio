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

const Mitten: React.FC<{ at: Vec; dir: number }> = ({ at, dir }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${dir})`} stroke={INK} strokeWidth="5" strokeLinejoin="round">
    <ellipse cx="10" cy="0" rx="17" ry="14" fill="#fbf7ef" />
    <ellipse cx="6" cy="-13" rx="8" ry="6" fill="#fbf7ef" transform="rotate(-25 6 -13)" />
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
              <circle cx={s * ex + lx} cy={ey + ly} r={expression === "focused" || expression === "angry" ? 5.5 : 6.5} fill={INK} />
            )}
          </g>
        );
      })}
      {mouth()}
    </g>
  );
};

export type InkStickmanProps = {
  x: number; y: number; scale?: number; facing?: 1 | -1;
  skin: string; cloth: string; trim?: string; hair?: string;
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
  expression = "smile", frame = 0, look: lookIn = 0, gaze = null, lean = 0, build = "lean",
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
        <g transform={`translate(0 ${breathe * 0.5}) translate(0 ${SH_Y}) rotate(${headRot}) translate(0 ${-SH_Y})`}>
          <ellipse cx="-62" cy={HEAD_Y + 2} rx="9" ry="13" fill={skin} stroke={INK} strokeWidth="5" />
          <ellipse cx="62" cy={HEAD_Y + 2} rx="9" ry="13" fill={skin} stroke={INK} strokeWidth="5" />
          <circle cx="0" cy={HEAD_Y} r={HEAD_R} fill={skin} stroke={INK} strokeWidth="6.5" />
          {hair ? <path d={`M ${-HEAD_R + 2} ${HEAD_Y - 14} Q ${-HEAD_R + 6} ${HEAD_Y - HEAD_R - 6} 0 ${HEAD_Y - HEAD_R - 4} Q ${HEAD_R - 6} ${HEAD_Y - HEAD_R - 6} ${HEAD_R - 2} ${HEAD_Y - 14} Q 30 ${HEAD_Y - 44} 0 ${HEAD_Y - 42} Q -30 ${HEAD_Y - 44} ${-HEAD_R + 2} ${HEAD_Y - 14} Z`} fill={hair} stroke={INK} strokeWidth="5" strokeLinejoin="round" /> : null}
          <Face expression={expression} blink={blink} look={look} lookY={lookY} />
        </g>
      </g>
      <Limb a={[10, HIP_Y]} b={legF.joint} c={legF.end} w={21} color={jeans} />
      <Shoe at={legF.end} />
      <Limb a={shF} b={armF.joint} c={armF.end} w={13} color={skin} />
      <Mitten at={armF.end} dir={ang(armF)} />
    </g>
  );
};
