import React from "react";
const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const TradeCoin: React.FC<{ x: number; y: number; size?: number; rotation?: number }> = ({ x, y, size = 78, rotation = 0 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: "rotate(" + rotation + "deg)", overflow: "visible" }}>
    <ellipse cx="50" cy="87" rx="34" ry="9" fill="#241d22" opacity=".3" />
    <circle cx="50" cy="48" r="38" fill="#8b552b" stroke="#292128" strokeWidth="7" />
    <circle cx="50" cy="45" r="31" fill="#e4ad4f" stroke="#fff0b6" strokeWidth="4" />
    <circle cx="50" cy="45" r="24" fill="none" stroke="#9a642f" strokeWidth="2.5" />
    <path d="M39 28H59L64 42 54 50 61 64H39L32 50 42 42Z" fill="#bd8034" stroke="#87552c" strokeWidth="2" />
    <path d="M29 25Q48 12 68 26" fill="none" stroke="#fff4cf" strokeWidth="4" strokeLinecap="round" opacity=".8" />
  </svg>
);

export const Ledger: React.FC<{ x: number; y: number; progress: number }> = ({ x, y, progress }) => {
  const p = clamp(progress);
  return (
    <svg viewBox="0 0 430 300" width="430" height="300" style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <defs>
        <linearGradient id="ledger-paper" x2="0" y2="1"><stop stopColor="#f6e8c5" /><stop offset="1" stopColor="#d5b987" /></linearGradient>
        <pattern id="ledger-fibre" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M2 5l5 -1M12 15l4 -2" stroke="#8d7353" strokeWidth="1" opacity=".22" /></pattern>
      </defs>
      <ellipse cx="220" cy="278" rx="195" ry="18" fill="#211b20" opacity=".22" />
      <path d="M15 15Q20 4 34 8L405 20Q420 20 416 36L402 275Q400 290 385 287L22 274Q8 270 10 254Z" fill="#3d2c28" opacity=".5" transform="translate(7 8)" />
      <path d="M15 15Q20 4 34 8L405 20Q420 20 416 36L402 275Q400 290 385 287L22 274Q8 270 10 254Z" fill="url(#ledger-paper)" stroke="#33272a" strokeWidth="8" />
      <path d="M15 15Q20 4 34 8L405 20Q420 20 416 36L402 275Q400 290 385 287L22 274Q8 270 10 254Z" fill="url(#ledger-fibre)" opacity=".8" />
      <path d="M52 53L360 63M48 222L352 232" stroke="#9d815b" strokeWidth="3" opacity=".55" />
      <path d="M56 83C85 60 100 105 130 84S177 108 205 83S250 105 286 82" fill="none" stroke="#664b3d" strokeWidth="4" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
      <path d="M57 123Q95 110 130 126T205 123T280 126T354 122" fill="none" stroke="#664b3d" strokeWidth="3.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - clamp((p - .18) / .72)} />
      <path d="M58 159Q90 145 128 162T205 159T275 161" fill="none" stroke="#664b3d" strokeWidth="3.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - clamp((p - .38) / .62)} />
      <path d="M58 194Q85 181 112 196T168 194" fill="none" stroke="#664b3d" strokeWidth="3.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - clamp((p - .62) / .38)} />
      <circle cx="365" cy="242" r="18" fill="#a44f3c" stroke="#63352d" strokeWidth="4" />
      <path d="M354 242l11 -10 11 10 -11 10Z" fill="#e7b66c" />
      <path d="M28 26Q80 22 116 28" fill="none" stroke="#fff9e7" strokeWidth="4" opacity=".6" />
    </svg>
  );
};

export const DigPatch: React.FC<{ x: number; y: number; progress: number; frame: number }> = ({ x, y, progress, frame }) => {
  const p = clamp(progress);
  const lift = Math.sin(frame / 5) * 8;
  return (
    <svg viewBox="0 0 500 270" width="500" height="270" style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <ellipse cx="245" cy="226" rx="230" ry="28" fill="#211b20" opacity=".2" />
      <path d="M8 150Q90 120 165 145Q245 115 330 145Q410 118 492 150V250H8Z" fill="#8d6945" stroke="#33272a" strokeWidth="8" />
      <path d="M8 150Q90 120 165 145Q245 115 330 145Q410 118 492 150" fill="none" stroke="#d3a46a" strokeWidth="8" />
      <ellipse cx="230" cy="168" rx={54 + p * 42} ry={17 + p * 10} fill="#382c29" stroke="#292128" strokeWidth="8" />
      <ellipse cx="230" cy="164" rx={38 + p * 34} ry={9 + p * 6} fill="#171e20" />
      <path d="M35 148Q85 80 145 120Q170 140 190 148Z" fill="#b28a58" stroke="#44332b" strokeWidth="7" />
      <path d="M285 148Q345 72 410 126Q438 145 466 150Z" fill="#a98050" stroke="#44332b" strokeWidth="7" />
      <path d="M58 120l24 -18 19 12 -12 20Z" fill="#d1b07a" stroke="#48352d" strokeWidth="5" />
      <path d="M388 111l22 -18 24 15 -13 21Z" fill="#d1b07a" stroke="#48352d" strokeWidth="5" />
      <g opacity={p}>
        <path d={"M215 150Q" + (205 + lift) + " 105 170 93Q185 126 215 150Z"} fill="#c89b5d" stroke="#48352d" strokeWidth="5" />
        <path d={"M244 150Q" + (260 - lift) + " 100 286 94Q278 130 244 150Z"} fill="#d4aa6d" stroke="#48352d" strokeWidth="5" />
        <path d="M230 151l-5 -32 20 -12 12 22Z" fill="#e1bd80" stroke="#48352d" strokeWidth="5" />
      </g>
      <path d="M0 250H500" stroke="#30282a" strokeWidth="10" opacity=".5" />
    </svg>
  );
};

export const PotteryVessel: React.FC<{ x: number; y: number; scale?: number; rotation?: number }> = ({ x, y, scale = 1, rotation = 0 }) => (
  <svg viewBox="0 0 180 200" width={180 * scale} height={200 * scale} style={{ position: "absolute", left: x - 90 * scale, top: y - 100 * scale, transform: "rotate(" + rotation + "deg)", overflow: "visible" }}>
    <ellipse cx="90" cy="190" rx="67" ry="10" fill="#211b20" opacity=".25" />
    <path d="M52 24Q44 43 30 65Q15 100 32 147Q43 183 90 186Q137 183 148 147Q165 100 150 65Q136 43 128 24Q110 39 90 36Q70 39 52 24Z" fill="#bd6d49" stroke="#292128" strokeWidth="8" />
    <path d="M52 24Q44 43 30 65Q15 100 32 147Q43 183 90 186Q137 183 148 147Q165 100 150 65Q136 43 128 24Q110 39 90 36Q70 39 52 24Z" fill="#e6a56c" opacity=".24" />
    <ellipse cx="90" cy="25" rx="43" ry="14" fill="#f0c58a" stroke="#292128" strokeWidth="8" />
    <ellipse cx="90" cy="27" rx="27" ry="7" fill="#4a302a" />
    <path d="M37 88Q90 105 143 88M33 126Q90 145 147 126" fill="none" stroke="#713d32" strokeWidth="7" />
    <path d="M44 78Q90 92 136 78M41 116Q90 133 139 116" fill="none" stroke="#f3c98e" strokeWidth="4" opacity=".75" />
    <path d="M50 42Q35 92 48 135" fill="none" stroke="#f9d7a5" strokeWidth="7" strokeLinecap="round" opacity=".55" />
    <path d="M130 50Q148 100 131 145" fill="none" stroke="#703d32" strokeWidth="6" strokeLinecap="round" opacity=".42" />
  </svg>
);

export const CraftTable: React.FC<{ x: number; y: number; width?: number }> = ({ x, y, width = 500 }) => (
  <svg viewBox="0 0 500 250" width={width} height={width / 2} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <ellipse cx="250" cy="235" rx="235" ry="15" fill="#211b20" opacity=".24" />
    <path d="M8 4H492L470 42H30Z" fill="#b27a49" stroke="#292128" strokeWidth="9" />
    <path d="M30 42H470V158H30Z" fill="#684631" stroke="#292128" strokeWidth="9" />
    <path d="M64 158H112V242H64ZM388 158H436V242H388Z" fill="#54392e" stroke="#292128" strokeWidth="8" />
    <path d="M24 18H476M45 58H455" stroke="#e4bb7c" strokeWidth="5" opacity=".58" />
    <path d="M50 92H450M50 126H450" stroke="#3e2d28" strokeWidth="3" opacity=".35" />
  </svg>
);
