import React from "react";

// Articulated flat-2D ink stickman. Local space: origin = ground point between the feet,
// +x = forward (mirrored by `facing`), -y = up. Limbs are solved with two-bone IK so hands
// land exactly on targets (coin hand-offs, pointing) and knees/elbows bend the right way.
export type Expression = "smile" | "joy" | "focused" | "shock" | "angry" | "sad";
export type Vec = [number, number];

const INK = "#29212a";
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const HIP: Vec = [0, -236];
const SHOULDER_Y = -402;
const SHOULDER_X = 46;
const UPPER = 92;
const FORE = 88;
const THIGH = 120;
const SHIN = 118;

function ik(s: Vec, t: Vec, l1: number, l2: number, bend: 1 | -1): { joint: Vec; end: Vec } {
  const dx = t[0] - s[0], dy = t[1] - s[1];
  const dist = Math.max(8, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.5));
  const base = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
  const a = Math.acos(Math.max(-1, Math.min(1, cosA))) * bend;
  const joint: Vec = [s[0] + Math.cos(base + a) * l1, s[1] + Math.sin(base + a) * l1];
  const end: Vec = [s[0] + Math.cos(base) * dist, s[1] + Math.sin(base) * dist];
  return { joint, end };
}

const line = (a: Vec, b: Vec, c: Vec) => `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`;

const Limb: React.FC<{ a: Vec; b: Vec; c: Vec; w: number; color: string; sleeve?: string; sleeveFrac?: number }> = ({ a, b, c, w, color, sleeve, sleeveFrac = 0.62 }) => {
  const d = line(a, b, c);
  const sx = mix(a[0], b[0], sleeveFrac), sy = mix(a[1], b[1], sleeveFrac);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 12} />
      <path d={d} stroke={color} strokeWidth={w} />
      {sleeve ? <path d={`M ${a[0]} ${a[1]} L ${sx} ${sy}`} stroke={sleeve} strokeWidth={w + 2} /> : null}
    </g>
  );
};

const Hand: React.FC<{ at: Vec; dir: number; skin: string; grip?: boolean }> = ({ at, dir, skin, grip }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${dir})`} stroke={INK} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
    <path d="M -4 -13 Q 14 -17 24 -9 Q 31 0 24 10 Q 12 17 -4 13 Z" fill={skin} />
    <path d={grip ? "M 8 -10 Q 21 -6 20 0 M 7 6 Q 18 8 20 2" : "M 9 -9 L 26 -6 M 9 -1 L 28 0 M 9 7 L 25 8"} fill="none" strokeWidth="4.5" />
    <path d="M 0 -12 Q 10 -26 20 -20" fill="none" stroke={INK} strokeWidth="9" />
    <path d="M 0 -12 Q 10 -26 20 -20" fill="none" stroke={skin} strokeWidth="4" />
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
};

export const Stickman: React.FC<StickmanProps> = ({
  x, y, scale = 1, facing = 1, skin, cloth, trim, hair = "#2e2423", walk = 0, stand = 1,
  frontHand = null, backHand = null, grip, expression = "smile", frame = 0, look = 0, lean = 0,
}) => {
  const breathe = Math.sin(frame / 9) * 2.5;
  const blink = frame % 96 < 5 ? 1 : 0;
  const swing = Math.sin(walk * Math.PI * 2);
  const lift = (p: number) => Math.max(0, Math.sin(p * Math.PI * 2)) * 34 * (1 - stand);

  const hip: Vec = [HIP[0], HIP[1] + breathe * 0.4];
  const footF: Vec = [mix(34 + swing * 62, 38, stand), -lift(walk)];
  const footB: Vec = [mix(-34 - swing * 62, -34, stand), -lift(walk + 0.5)];
  const legF = ik([12, hip[1]], footF, THIGH, SHIN, 1);
  const legB = ik([-12, hip[1]], footB, THIGH, SHIN, 1);

  const rest = (side: 1 | -1, p: number): Vec => [side * 22 + swing * side * 38 * (1 - stand) * (p ? -1 : 1), -402 + 150];
  const shF: Vec = [SHOULDER_X, SHOULDER_Y + breathe];
  const shB: Vec = [-SHOULDER_X, SHOULDER_Y + breathe];
  const tF = frontHand ?? [SHOULDER_X + 12, -232];
  const tB = backHand ?? [-SHOULDER_X - 8 + swing * 24 * (1 - stand), -226];
  const armF = ik(shF, tF, UPPER, FORE, 1);
  const armB = ik(shB, tB, UPPER, FORE, 1);

  const sy = SHOULDER_Y, hy = HIP[1];
  const torsoPath = `M -58 ${sy + 6} Q -66 ${sy + 60} -46 ${hy - 40} Q -62 ${hy + 4} -58 ${hy + 34} Q 0 ${hy + 52} 58 ${hy + 34} Q 62 ${hy + 4} 46 ${hy - 40} Q 66 ${sy + 60} 58 ${sy + 6} Q 0 ${sy - 24} -58 ${sy + 6} Z`;
  const handDir = (a: { joint: Vec; end: Vec }) => (Math.atan2(a.end[1] - a.joint[1], a.end[0] - a.joint[0]) * 180) / Math.PI;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="0" cy="6" rx="105" ry="20" fill="#3b2b2c" opacity=".2" />
      {/* back arm + back leg */}
      <Limb a={shB} b={armB.joint} c={armB.end} w={26} color={skin} sleeve={cloth} />
      <Hand at={armB.end} dir={handDir(armB)} skin={skin} />
      <Limb a={[-12, hip[1]]} b={legB.joint} c={legB.end} w={30} color={trim} sleeve={cloth} sleeveFrac={0.5} />
      <path d={`M ${legB.end[0] - 6} ${legB.end[1] - 8} q 26 -6 52 4 q 8 14 -2 22 h -58 q -8 -12 8 -18 Z`} fill={INK} />
      {/* torso */}
      <g transform={`rotate(${lean} 0 ${HIP[1]})`}>
        <path d={torsoPath} fill={INK} stroke={INK} strokeWidth="14" />
        <path d={torsoPath} fill={cloth} />
        <path d={`M -48 ${SHOULDER_Y + 22} Q 0 ${SHOULDER_Y + 46} 48 ${SHOULDER_Y + 22}`} fill="none" stroke={trim} strokeWidth="9" />
        <path d={`M -58 ${hy + 24} Q 0 ${hy + 42} 58 ${hy + 24}`} fill="none" stroke={trim} strokeWidth="9" />
        <path d={`M -45 ${hy - 36} Q 0 ${hy - 22} 45 ${hy - 36}`} fill="none" stroke={INK} strokeWidth="5" opacity=".5" />
        <path d={`M 0 ${SHOULDER_Y + 46} L 0 ${HIP[1] - 4}`} stroke={trim} strokeWidth="4" opacity=".65" />
        <circle cx={-SHOULDER_X} cy={sy + 8} r="17" fill={cloth} stroke={INK} strokeWidth="6" />
        <circle cx={SHOULDER_X} cy={sy + 8} r="17" fill={cloth} stroke={INK} strokeWidth="6" />
        {/* neck + head */}
        <path d={`M 0 ${SHOULDER_Y - 4} L 0 -440`} stroke={INK} strokeWidth="38" />
        <path d={`M 0 ${SHOULDER_Y - 4} L 0 -440`} stroke={skin} strokeWidth="26" />
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${look * 4})`}>
          <ellipse cx="-62" cy="-480" rx="11" ry="16" fill={skin} stroke={INK} strokeWidth="6" />
          <ellipse cx="62" cy="-480" rx="11" ry="16" fill={skin} stroke={INK} strokeWidth="6" />
          <ellipse cx="0" cy="-486" rx="62" ry="68" fill={skin} stroke={INK} strokeWidth="9" />
          <path d="M -64 -496 Q -66 -566 0 -568 Q 66 -566 64 -496 Q 40 -532 0 -528 Q -40 -532 -64 -496 Z" fill={hair} stroke={INK} strokeWidth="6" />
          <path d="M -50 -520 Q 0 -552 50 -520" fill="none" stroke={trim} strokeWidth="8" />
          <Face expression={expression} blink={blink} look={look} />
        </g>
      </g>
      {/* front leg + arm */}
      <Limb a={[12, hip[1]]} b={legF.joint} c={legF.end} w={30} color={trim} sleeve={cloth} sleeveFrac={0.5} />
      <path d={`M ${legF.end[0] - 6} ${legF.end[1] - 8} q 26 -6 52 4 q 8 14 -2 22 h -58 q -8 -12 8 -18 Z`} fill={INK} />
      <Limb a={shF} b={armF.joint} c={armF.end} w={26} color={skin} sleeve={cloth} />
      <Hand at={armF.end} dir={handDir(armF)} skin={skin} grip={grip} />
    </g>
  );
};
