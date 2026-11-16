import React from "react";

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
    {/* One continuous palm silhouette with four distinct finger tips and a working thumb. */}
    <path d="M -11 -13 C -19 -24 -11 -34 -3 -32 C 4 -31 7 -23 7 -16 L 12 -29 C 15 -37 25 -34 25 -25 L 23 -15 L 29 -24 C 34 -30 42 -23 38 -14 L 32 -5 Q 43 -8 45 2 Q 46 13 34 17 Q 26 25 11 22 L -8 15 Q -21 8 -17 -3Z" fill={skin} strokeWidth="7" />
    <path d="M -8 -5 Q -24 -18 -31 -7 Q -34 4 -18 11 L -8 8Z" fill={skin} strokeWidth="6" />
    {grip ? (
      <g fill="none" stroke="#633c34" strokeWidth="3.2">
        <path d="M 9 -13 Q 23 -9 22 -1" />
        <path d="M 16 -8 Q 30 -5 28 4" />
        <path d="M 11 3 Q 23 10 31 8" />
        <path d="M -12 2 Q -5 8 3 7" />
      </g>
    ) : (
      <g fill="none" stroke="#633c34" strokeWidth="3">
        <path d="M 8 -17 Q 14 -11 15 -3" />
        <path d="M 24 -13 Q 29 -7 27 0" />
        <path d="M 34 -7 Q 38 -1 34 5" />
      </g>
    )}
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
};

export const Stickman: React.FC<StickmanProps> = ({
  x, y, scale = 1, facing = 1, skin, cloth, trim, hair = "#2e2423", walk = 0, stand = 1,
  frontHand = null, backHand = null, grip, expression = "smile", frame = 0, look = 0, lean = 0, build = "lean",
}) => {
  const body = BUILD_PROPORTIONS[build];
  const breathe = Math.sin(frame / 9) * 2.5;
  const blink = frame % 96 < 5 ? 1 : 0;
  const swing = Math.sin(walk * Math.PI * 2);
  const lift = (p: number) => Math.max(0, Math.sin(p * Math.PI * 2)) * 34 * (1 - stand);

  const hip: Vec = [HIP[0], HIP[1] + breathe * 0.4];
  const trousers = shadeColor(cloth, 0.72);
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
          <path d="M 0 -556 C -43 -556 -72 -526 -70 -484 C -69 -443 -42 -416 0 -414 C 42 -416 69 -443 70 -484 C 72 -526 43 -556 0 -556Z" fill={skin} stroke={INK} strokeWidth="10" />
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
