import React from "react";
import type { Expression, Vec } from "./Stickman2D";
import type { InkStyle } from "./inkOutfit";
import { Backpack, GarmentDefs, HatLayer, LowerGarment, Shine, TorsoExtras, coversHair } from "./InkGarments";

// "Ink Explainer" stickman: plain round head with a minimal face, tee torso, thin outlined arms,
// white mitten hands, straight jeans legs, white sneakers. Local space: origin = ground between
// the feet, +x = forward, -y = up. Two-bone IK puts hands exactly on targets; knees bend forward.
const INK = "#1d1a20";
const HIP_Y = -204, SH_Y = -336, SH_X = 40, HEAD_Y = -444, HEAD_R = 64;
const UPPER = 84, FORE = 82, THIGH = 102, SHIN = 100;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const Limb: React.FC<{ a: Vec; b: Vec; c: Vec; w: number; color: string }> = ({ a, b, c, w, color }) => {
  const d = `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 9} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
};

const Mitten: React.FC<{ at: Vec; dir: number; grip?: boolean }> = ({ at, dir, grip = false }) => (
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

const Face: React.FC<{ expression: Expression; blink: boolean; look: number; lookY: number; isTalking?: boolean; frame?: number }> = ({ expression, blink, look, lookY, isTalking = false, frame = 0 }) => {
  const ey = HEAD_Y - 6, ex = 22;
  const lx = look * 5, ly = lookY * 4;
  const brow = (s: -1 | 1) => {
    const x = s * ex;
    switch (expression) {
      case "angry":
        return s === 1 ? `M ${x - 16} ${ey - 24} L ${x + 16} ${ey - 16}` : `M ${x - 16} ${ey - 16} L ${x + 16} ${ey - 24}`;
      case "shock":
      case "surprised":
      case "afraid":
        return `M ${x - 15} ${ey - 34} Q ${x} ${ey - 42} ${x + 15} ${ey - 34}`;
      case "sad":
        return `M ${x - 14} ${ey - 18} Q ${x} ${ey - 28} ${x + 14} ${ey - 18}`;
      case "joy":
      case "happy":
      case "smile":
        return `M ${x - 14} ${ey - 28} Q ${x} ${ey - 36} ${x + 14} ${ey - 28}`;
      case "focused":
      case "thinking":
        return `M ${x - 14} ${ey - 28} Q ${x} ${ey - 33} ${x + 14} ${ey - 28}`;
      default:
        return `M ${x - 14} ${ey - 27} Q ${x} ${ey - 33} ${x + 14} ${ey - 27}`;
    }
  };
  const mouthY = HEAD_Y + 34;
  const mouth = () => {
    if (isTalking) {
      const ph = Math.floor(frame / 4) % 4;
      if (ph === 0) return <ellipse cx="0" cy={mouthY + 2} rx="12" ry="14" fill="#8c2a35" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />;
      if (ph === 1) return <path d={`M -14 ${mouthY} Q 0 ${mouthY + 18} 14 ${mouthY} Z`} fill="#8c2a35" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />;
      if (ph === 2) return <ellipse cx="0" cy={mouthY + 4} rx="10" ry="8" fill="#8c2a35" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />;
      return <path d={`M -12 ${mouthY + 2} Q 0 ${mouthY + 6} 12 ${mouthY + 2}`} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
    }
    switch (expression) {
      case "joy":
      case "happy":
      case "smile":
        return <path d={`M -22 ${mouthY - 4} Q 0 ${mouthY + 24} 22 ${mouthY - 4} Z`} fill="#8c2a35" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />;
      case "shock":
      case "surprised":
      case "afraid":
        return <ellipse cx="0" cy={mouthY + 4} rx="12" ry="16" fill="#8c2a35" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />;
      case "angry":
        return <path d={`M -18 ${mouthY + 6} Q 0 ${mouthY - 4} 18 ${mouthY + 6} Z`} fill="#8c2a35" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />;
      case "sad":
        return <path d={`M -16 ${mouthY + 8} Q 0 ${mouthY - 4} 16 ${mouthY + 8}`} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
      case "focused":
      case "thinking":
        return <path d={`M -14 ${mouthY + 2} L 14 ${mouthY + 2}`} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
      default:
        return <path d={`M -18 ${mouthY} Q 0 ${mouthY + 12} 18 ${mouthY}`} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
    }
  };
  return (
    <g>
      {[-1, 1].map((s) => {
        const sd = s as -1 | 1;
        const closed = blink || expression === "joy";
        return (
          <g key={s}>
            <path d={brow(sd)} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
            {closed ? (
              <path d={expression === "joy" ? `M ${s * ex - 12} ${ey + 3} Q ${s * ex} ${ey - 11} ${s * ex + 12} ${ey + 3}` : `M ${s * ex - 12} ${ey} Q ${s * ex} ${ey + 8} ${s * ex + 12} ${ey}`} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
            ) : (
              <g>
                <ellipse cx={s * ex} cy={ey} rx="13" ry="16" fill="#fffaf1" stroke={INK} strokeWidth="3.8" />
                <circle cx={s * ex + lx} cy={ey + ly} r="6.5" fill={INK} />
                <circle cx={s * ex + lx - 2.5} cy={ey + ly - 2.5} r="2.5" fill="#fff" />
              </g>
            )}
          </g>
        );
      })}
      <path d={`M 0 ${ey + 2} Q 3 ${ey + 12} -1 ${ey + 16}`} fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="-38" cy="-406" rx="9" ry="4.5" fill="#d77f73" opacity=".16" />
      <ellipse cx="38" cy="-406" rx="9" ry="4.5" fill="#d77f73" opacity=".16" />
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
  footFront?: Vec | null; footBack?: Vec | null; hipDrop?: number; hipX?: number; rot?: number; headTilt?: number; open?: number;
  yaw?: number; style?: InkStyle; held?: React.ReactNode; heldAng?: number; seat?: boolean; extra?: React.ReactNode;
  isTalking?: boolean;
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

type V3 = [number, number, number];
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const nrm = (a: V3): V3 => { const l = len3(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
// two-bone IK in 3D; the elbow/knee is pushed toward the pole direction
const ik3 = (R: V3, T: V3, l1: number, l2: number, P: V3): { j: V3; e: V3 } => {
  const d0 = sub(T, R), dist = Math.max(8, Math.min(len3(d0), l1 + l2 - 0.5)), u = nrm(d0);
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  let pv = sub(P, mul(u, dot(P, u))); if (len3(pv) < 1e-4) pv = [0, 0, 1]; pv = nrm(pv);
  return { j: add(add(R, mul(u, a)), mul(pv, h)), e: add(R, mul(u, dist)) };
};

// Full-turn 2.5D rig: a real 3D skeleton (X right, Y up, Z = the way the body faces) rotated by `yaw` about the vertical axis and
// projected, so arms hang from the shoulders at the sides, legs stand side by side in front view, and the whole figure can face
// any direction relative to the camera (0 = facing camera, 90 = facing screen-right, 180 = back to camera, 270 = facing left).
export const InkStickman: React.FC<InkStickmanProps> = ({
  x, y, scale = 1, facing = 1, yaw: yawIn, skin, cloth, hair: hairIn, walk = 0, stand = 1, frontHand = null, backHand = null,
  expression = "smile", frame = 0, look: lookIn = 0, gaze = null, lean = 0, build = "lean", grip = false,
  footFront = null, footBack = null, hipDrop = 0, hipX = 0, rot = 0, headTilt = 0, held = null, heldAng = 0, style: st, seat = false, extra = null,
  isTalking = false,
}) => {
  const th = (((yawIn ?? facing * 80) % 360) * Math.PI) / 180, cs = Math.cos(th), sn = Math.sin(th);
  const hair = st && coversHair(st.hat) ? undefined : hairIn;
  const wide = build === "stocky" ? 1.14 : 1;
  const breathe = Math.sin(frame / 9) * 2;
  const blink = frame % 100 < 4;
  const swing = Math.sin(walk * Math.PI * 2);
  const lift = (p: number) => Math.max(0, Math.sin(p * Math.PI * 2)) * 30 * (1 - stand);
  const jeans = "#3d5a86";
  if (st) { cloth = st.top; skin = skin || st.skin; }
  const botC = st?.bottom ?? jeans, legC = st ? (st.bareLegs ? skin : botC) : jeans, armC = st?.sleeves ? cloth : skin, shoeC = st ? st.shoes : "#fbf7ef";
  const tw = 46 * wide, SHX = tw + 6, HIPX = 24, HIPY3 = -HIP_Y, SHY3 = -SH_Y;
  const near = sn >= 0 ? -1 : 1;                           // the limb nearest the camera when the body turns sideways
  const P = (v: V3): Vec => [v[0] * cs + v[2] * sn, -v[1]];
  const D = (v: V3) => -v[0] * sn + v[2] * cs;
  const HY = HIPY3 - hipDrop;
  const lr = (lean * Math.PI) / 180;
  const shY = HY + (SHY3 - HIPY3) * Math.cos(lr) + breathe * -1, shZ = hipX + (SHY3 - HIPY3) * Math.sin(lr);
  const shoulder = (s: number): V3 => [s * SHX, shY, shZ];
  const hip = (s: number): V3 => [s * HIPX, HY, hipX];

  const hand3 = (v: Vec | null, s: number, hangZ: number): V3 => {
    if (!v) return [s * (SHX + 12), shY - 156, hangZ];
    const lx = v[0], Y = -v[1], f = cl(lx / 150), up = cl((Y - SHY3 - 20) / 60);
    const lat = mix(mix(SHX + 14, 26, f), SHX + 46, up);
    return [s * lat, Y, lx];
  };
  const foot3 = (v: Vec, s: number): V3 => [s * (HIPX + 2 - cl(Math.abs(v[0]) / 160) * 6), -v[1], v[0]];
  const nearFootRaw = footFront ?? [mix(18 + swing * 46, 22, stand), -lift(walk)];
  const farFootRaw = footBack ?? [mix(-18 - swing * 46, -20, stand), -lift(walk + 0.5)];
  const fN = foot3(nearFootRaw, near), fF = foot3(farFootRaw, -near);
  const legN = ik3(hip(near), fN, THIGH, SHIN, [0, 0.1, 1]), legF = ik3(hip(-near), fF, THIGH, SHIN, [0, 0.1, 1]);
  const armPole = (s: number): V3 => [s * 0.5, -1, -0.25];
  const hN = hand3(frontHand, near, swing * 34 * (1 - stand)), hF = hand3(backHand, -near, -swing * 34 * (1 - stand));
  const armN = ik3(shoulder(near), hN, UPPER, FORE, armPole(near)), armF = ik3(shoulder(-near), hF, UPPER, FORE, armPole(-near));
  const ang2 = (a: { j: V3; e: V3 }) => { const j = P(a.j), e = P(a.e); return (Math.atan2(e[1] - j[1], e[0] - j[0]) * 180) / Math.PI; };

  const gdx = gaze ? gaze[0] : 0, gdy = gaze ? gaze[1] - HEAD_Y : 0;
  const look = gaze ? cl(gdx / 180, -1, 1) * sn : lookIn;
  const lookY = gaze ? cl(gdy / 160, -1, 1) : 0;
  const headRot = look * 4 + lookY * 8 + headTilt * sn;
  const sx = Math.sqrt(cs * cs + 0.36 * sn * sn), hs = Math.sqrt(cs * cs + 0.81 * sn * sn);
  const front = cs > 0.05, back = cs < -0.2;
  const torso = `M ${-tw} ${SH_Y + 6} Q ${-tw - 6} ${SH_Y + 70} ${-tw + 2} ${HIP_Y + 4} L ${tw - 2} ${HIP_Y + 4} Q ${tw + 6} ${SH_Y + 70} ${tw} ${SH_Y + 6} Q 0 ${SH_Y - 12} ${-tw} ${SH_Y + 6} Z`;
  const headPath = `M 0 ${HEAD_Y - 100} C 62 ${HEAD_Y - 100} 90 ${HEAD_Y - 50} 88 ${HEAD_Y + 10} C 86 ${HEAD_Y + 66} 48 ${HEAD_Y + 94} 0 ${HEAD_Y + 94} C -48 ${HEAD_Y + 94} -86 ${HEAD_Y + 66} -88 ${HEAD_Y + 10} C -90 ${HEAD_Y - 50} -62 ${HEAD_Y - 100} 0 ${HEAD_Y - 100} Z`;
  const cx0 = hipX * sn, leanS = lean * sn;
  const hairC = hair ?? st?.hair ?? "#2a1f1a";
  const poseSgn = sn >= 0 ? 1 : -1;

  const limb = (a: { j: V3; e: V3 }, s: number, isFront: boolean) => {
    const R = P(shoulder(s)), J = P(a.j), E = P(a.e);
    return <g key={"arm" + s}><Limb a={R} b={J} c={E} w={13} color={isFront ? armC : shade(armC, 0.92)} />
      {isFront && held ? <g transform={`translate(${E[0]} ${E[1]}) scale(${poseSgn} 1) rotate(${heldAng})`}>{held}</g> : null}
      <Mitten at={E} dir={ang2(a)} grip={isFront ? grip : false} /></g>;
  };
  const leg = (l: { j: V3; e: V3 }, s: number, color: string, shoe: string, key: string) => {
    const R = P(hip(s)), J = P(l.j), E = P(l.e), a = Math.abs(sn), fw = P([0, 0, 1]);
    return <g key={key}><Limb a={R} b={J} c={E} w={21} color={color} />
      <ellipse cx={E[0] + fw[0] * 16} cy={E[1] + 4} rx={17 + 30 * a} ry={13} fill={shoe} stroke={INK} strokeWidth="5.5" /></g>;
  };
  const arms = [{ a: armN, s: near, f: true }, { a: armF, s: -near, f: false }].sort((p, q) => D(p.a.e) - D(q.a.e));
  const legsOrder = D(legN.e) < D(legF.e) ? [[legN, near, 0.85], [legF, -near, 1]] as const : [[legF, -near, 0.85], [legN, near, 1]] as const;
  const firstBehind = D(arms[0].a.e) < -8;
  const bpBehind = cs > -0.3;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
      <GarmentDefs />
      <defs>
        <filter id="inkShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id="headClip">
          <path d={headPath} />
        </clipPath>
        <radialGradient id="headShade" cx=".5" cy=".25" r=".75">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx0 + 10 * (sn >= 0 ? 1 : -1)}
        cy="6"
        rx={tw * 1.35 + 10 * Math.abs(sn)}
        ry="13"
        fill="#000000"
        opacity="0.35"
        filter="url(#inkShadow)"
        transform={`skewX(${-15 * (sn >= 0 ? 1 : -1)})`}
      />
      {seat ? <g stroke={INK} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"><rect x={cx0 - 52 - 14 * Math.abs(sn)} y={-HY + 14} width={104 + 28 * Math.abs(sn)} height="16" rx="5" fill="#9a6a42" /><path d={`M ${cx0 - 44} ${-HY + 30} V 0 M ${cx0 + 44} ${-HY + 30} V 0`} fill="none" />{Math.abs(cs) < 0.9 ? <path d={`M ${cx0 - 50 * poseSgn} ${-HY + 14} V ${-HY - 150}`} fill="none" /> : null}</g> : null}
      {firstBehind ? limb(arms[0].a, arms[0].s, arms[0].f) : null}
      {legsOrder.map(([l, s, k], i) => leg(l, s, shade(legC, k), shade(shoeC, k), "l" + i))}
      {st && bpBehind ? <g transform={`translate(${-58 * sn} ${hipDrop})`}><Backpack st={st} /></g> : null}
      <g transform={`translate(${cx0} ${hipDrop}) rotate(${leanS} 0 ${HIP_Y}) scale(${sx} 1)`}>
        <path d={torso} fill={cloth} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        {st ? <Shine d={torso} amt={st.shine} /> : null}
        {st && !back ? <TorsoExtras st={st} tw={tw} /> : null}
        <path d={`M ${-tw + 4} ${HIP_Y - 6} Q 0 ${HIP_Y + 6} ${tw - 4} ${HIP_Y - 6}`} fill="none" stroke={shade(cloth, 0.7)} strokeWidth="5" />
        {!back ? <path d={`M -18 ${SH_Y + 4} Q 0 ${SH_Y + 22} 18 ${SH_Y + 4}`} fill="none" stroke={shade(cloth, 0.7)} strokeWidth="5" /> : <path d={`M 0 ${SH_Y + 6} V ${HIP_Y - 10}`} fill="none" stroke={shade(cloth, 0.75)} strokeWidth="4" />}
        <g transform={`scale(${1 / sx} 1)`}>
          <g transform={`translate(0 ${breathe * 0.5}) translate(0 ${SH_Y}) rotate(${headRot}) translate(0 ${-SH_Y}) scale(${hs} 1)`}>
            <ellipse cx={-84 * Math.abs(cs)} cy={HEAD_Y + 6} rx="10" ry="15" fill={skin} stroke={INK} strokeWidth="5" />
            <ellipse cx={84 * Math.abs(cs)} cy={HEAD_Y + 6} rx="10" ry="15" fill={skin} stroke={INK} strokeWidth="5" />
            <path d={headPath} fill={back ? hairC : skin} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
            <path d={headPath} fill="url(#headShade)" stroke="none" clipPath="url(#headClip)" />
            {hair && !back ? <path d={`M -52 ${HEAD_Y - 28} Q 0 ${HEAD_Y - 20} 52 ${HEAD_Y - 28}`} fill="none" stroke={shade(skin, 0.75)} strokeWidth="3" /> : null}
            {back ? <path d={`M -70 ${HEAD_Y + 40} Q 0 ${HEAD_Y + 70} 70 ${HEAD_Y + 40}`} fill="none" stroke={shade(hairC, 0.6)} strokeWidth="5" /> : null}
            {hair && !back ? <g transform={`translate(0 ${HEAD_Y}) scale(1.38 1.5) translate(0 430)`}><path d="M -63 -438 C -70 -472 -48 -500 -18 -500 C 2 -524 39 -512 51 -485 C 69 -477 70 -452 63 -438 Q 37 -455 19 -457 Q -2 -449 -17 -461 Q -36 -447 -63 -438 Z" fill={hair} stroke={INK} strokeWidth="5.5" strokeLinejoin="round" /><path d="M -25 -483 Q 7 -509 42 -484 Q 14 -492 0 -469" fill="none" stroke="#fff3d5" strokeWidth="4" strokeLinecap="round" opacity=".28" /></g> : null}
            {!back ? <g transform={`translate(${sn * 44} 0) translate(0 ${HEAD_Y}) scale(${Math.max(0.34, cs) * 1.32} 1.32) translate(0 ${-HEAD_Y})`}><Face expression={expression} blink={blink} look={look} lookY={lookY} isTalking={isTalking} frame={frame} /></g> : null}
            {st ? <HatLayer hat={st.hat} color={st.hatColor} accent={st.accent} /> : null}
          </g>
        </g>
      </g>
      {st && !bpBehind ? <g transform={`translate(0 ${hipDrop})`}><Backpack st={st} /></g> : null}
      {st ? <g transform={`translate(${cx0} ${hipDrop}) scale(${sx} 1)`}><LowerGarment st={st} tw={tw} /></g> : null}
      {!firstBehind ? limb(arms[0].a, arms[0].s, arms[0].f) : null}
      {limb(arms[1].a, arms[1].s, arms[1].f)}
      {extra}
    </g>
  );
};
