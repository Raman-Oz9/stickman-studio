import React from "react";

const INK = "#1d1a20";
const STROKE_STYLE = {
  stroke: INK,
  strokeWidth: 4,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

export interface EffectProps {
  x: number;
  y: number;
  t: number;
  scale?: number;
  opacity?: number;
}

// 1. Dust Puff
export const DustPuff: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const p = (t % 45) / 45;
  const s = scale * (0.8 + 0.4 * p);
  const op = opacity * (1 - p * 0.6);
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={op}>
      <g {...STROKE_STYLE} fill="#e2e8f0">
        <circle cx={-15} cy={0} r={18} />
        <circle cx={15} cy={-5} r={22} />
        <circle cx={0} cy={-18} r={16} />
        <path d="M -30 10 Q 0 18 35 12" fill="none" />
      </g>
    </g>
  );
};

// 2. Speed Lines
export const SpeedLines: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const offset = (t * 6) % 30;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
        <line x1={-60 - offset} y1={-20} x2={-10 - offset} y2={-20} />
        <line x1={-80 - offset} y1={5} x2={-20 - offset} y2={5} />
        <line x1={-50 - offset} y1={30} x2={-5 - offset} y2={30} />
      </g>
    </g>
  );
};

// 3. Impact Star
export const ImpactStar: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const cycle = (t % 30) / 30;
  const s = scale * (0.7 + 0.5 * Math.sin(cycle * Math.PI));
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={opacity}>
      <g {...STROKE_STYLE} fill="#fde047">
        <path d="M 0 -45 L 12 -12 L 45 0 L 12 12 L 0 45 L -12 12 L -45 0 L -12 -12 Z" />
        <circle cx={0} cy={0} r={8} fill={INK} stroke="none" />
      </g>
    </g>
  );
};

// 4. Sweat Drops
export const SweatDrops: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const dropY = (t % 30) * 1.5;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <g {...STROKE_STYLE} fill="#38bdf8">
        <path d={`M -15 ${-10 + dropY} Q -22 ${-25 + dropY} -15 ${-32 + dropY} Q -8 ${-25 + dropY} -15 ${-10 + dropY} Z`} />
        <path d={`M 15 ${-2 + dropY * 0.7} Q 8 ${-15 + dropY * 0.7} 15 ${-22 + dropY * 0.7} Q 22 ${-15 + dropY * 0.7} 15 ${-2 + dropY * 0.7} Z`} />
      </g>
    </g>
  );
};

// 5. Sparkle
export const Sparkle: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const rot = (t * 4) % 360;
  const s = scale * (0.9 + 0.2 * Math.sin(t * 0.2));
  return (
    <g transform={`translate(${x}, ${y}) scale(${s}) rotate(${rot})`} opacity={opacity}>
      <g {...STROKE_STYLE} fill="#fef08a">
        <path d="M 0 -30 Q 0 0 30 0 Q 0 0 0 30 Q 0 0 -30 0 Q 0 0 0 -30 Z" />
        <circle cx={0} cy={0} r={4} fill={INK} stroke="none" />
      </g>
    </g>
  );
};

// 6. Floating Question Mark
export const QuestionMark: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const bob = Math.sin(t * 0.15) * 6;
  return (
    <g transform={`translate(${x}, ${y + bob}) scale(${scale})`} opacity={opacity}>
      <g {...STROKE_STYLE} fill="#f8fafc">
        <circle cx={0} cy={28} r={6} fill={INK} />
        <path d="M -12 -12 Q -12 -35 0 -38 Q 16 -40 18 -20 Q 20 -2 0 10 V 18" fill="none" strokeWidth={6} />
      </g>
    </g>
  );
};

// 7. Light Bulb
export const LightBulb: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const pulse = 1 + 0.08 * Math.sin(t * 0.2);
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale * pulse})`} opacity={opacity}>
      <g {...STROKE_STYLE} fill="#fef08a">
        <path d="M -18 -10 Q -24 -28 0 -36 Q 24 -28 18 -10 Q 18 8 10 14 V 22 H -10 V 14 Q -18 8 -18 -10 Z" />
        <rect x={-8} y={22} width={16} height={10} rx={2} fill="#94a3b8" />
        <path d="M -8 28 H 8 M -6 32 H 6" stroke={INK} strokeWidth={3} />
        <path d="M -32 -26 L -22 -20 M 32 -26 L 22 -20 M 0 -48 V -38" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

// 8. Anger Vein
export const AngerVein: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const pulse = 1 + 0.15 * Math.sin(t * 0.3);
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale * pulse})`} opacity={opacity}>
      <g stroke="#dc2626" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="#fee2e2">
        <path d="M -15 -10 L 0 -22 L 15 -10 L 8 8 L -8 8 Z" />
        <path d="M -18 -18 L -6 -12 M 18 -18 L 6 -12 M 0 -26 V -16" stroke={INK} strokeWidth={4} fill="none" />
      </g>
    </g>
  );
};

// 9. Zzz
export const Zzz: React.FC<EffectProps> = ({ x, y, t, scale = 1, opacity = 1 }) => {
  const phase = (t % 60) / 60;
  const dy = -phase * 35;
  const op = opacity * (1 - phase * 0.7);
  return (
    <g transform={`translate(${x}, ${y + dy}) scale(${scale})`} opacity={op}>
      <g fontFamily="Arial Black, sans-serif" fontWeight={900} fontSize={28} fill="#3b82f6" stroke={INK} strokeWidth={2}>
        <text x={0} y={0}>Z</text>
        <text x={18} y={-18} fontSize={22}>z</text>
        <text x={32} y={-34} fontSize={16}>z</text>
      </g>
    </g>
  );
};
