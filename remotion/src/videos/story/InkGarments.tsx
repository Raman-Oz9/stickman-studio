import React from "react";
import type { InkStyle } from "./inkOutfit";

const INK = "#1d1a20";
const HIP_Y = -204, SH_Y = -336, HEAD_Y = -444;
const dk = (hex: string, k: number) => { const n = parseInt(hex.slice(1), 16); const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0"); return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`; };
const S = { stroke: INK, strokeWidth: 5.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const Shine: React.FC<{ d: string; amt: number }> = ({ d, amt }) => <path d={d} fill="url(#inkShine)" opacity={amt} stroke="none" />;
export const GarmentDefs: React.FC = () => (
  <defs>
    <linearGradient id="inkShine" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset=".32" stopColor="#fff" stopOpacity=".05" /><stop offset=".7" stopColor="#000" stopOpacity=".12" /><stop offset="1" stopColor="#000" stopOpacity=".45" /></linearGradient>
    <linearGradient id="inkMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6f9fc" /><stop offset=".45" stopColor="#aeb8c4" /><stop offset="1" stopColor="#5f6a78" /></linearGradient>
    <radialGradient id="inkGlass" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".5" stopColor="#bfe6f5" stopOpacity=".2" /><stop offset="1" stopColor="#6fb4d8" stopOpacity=".3" /></radialGradient>
  </defs>
);

export const HEM: Record<string, number> = { tunic: -122, dress: -66, robe: -20, toga: -112, kilt: -128, coat: -108, armor: -150, fur: -150 };
export const TorsoExtras: React.FC<{ st: InkStyle; tw: number }> = ({ st, tw }) => {
  const k = st.kind, a = st.accent, t = st.trim;
  switch (k) {
    case "tunic": case "dress": return <g {...S}><rect x={-tw + 2} y={HIP_Y - 18} width={tw * 2 - 4} height="16" rx="5" fill={a} /><rect x="-9" y={HIP_Y - 18} width="18" height="16" rx="3" fill="#f1d07a" /></g>;
    case "toga": return <g {...S}><path d={`M ${-tw + 4} ${SH_Y + 8} L ${tw - 6} ${HIP_Y - 8} L ${tw - 6} ${HIP_Y + 6} L ${-tw + 30} ${SH_Y + 20} Z`} fill="#fffaf0" /><path d={`M ${-tw + 12} ${SH_Y + 14} L ${tw - 14} ${HIP_Y - 4}`} fill="none" stroke="#b5303a" strokeWidth="7" /></g>;
    case "armor": return <g {...S}><path d={`M ${-tw + 2} ${SH_Y + 4} Q 0 ${SH_Y - 8} ${tw - 2} ${SH_Y + 4} L ${tw - 8} ${HIP_Y - 4} L ${-tw + 8} ${HIP_Y - 4} Z`} fill="url(#inkMetal)" /><path d={`M 0 ${SH_Y + 8} V ${HIP_Y - 8} M ${-tw + 10} ${SH_Y + 50} H ${tw - 10} M ${-tw + 12} ${SH_Y + 90} H ${tw - 12}`} fill="none" strokeWidth="4" /><ellipse cx={-tw - 4} cy={SH_Y + 10} rx="26" ry="20" fill="url(#inkMetal)" /><ellipse cx={tw + 4} cy={SH_Y + 10} rx="26" ry="20" fill="url(#inkMetal)" /><path d={`M ${-tw + 2} ${HIP_Y - 14} H ${tw - 2}`} stroke={a} strokeWidth="9" fill="none" /></g>;
    case "suit": return <g {...S}><path d={`M -22 ${SH_Y + 2} L 0 ${SH_Y + 70} L 22 ${SH_Y + 2} Z`} fill="#fbf7ef" /><path d={`M -4 ${SH_Y + 12} L 4 ${SH_Y + 12} L 8 ${SH_Y + 80} L 0 ${SH_Y + 96} L -8 ${SH_Y + 80} Z`} fill={a === "#e8c45a" ? "#b5303a" : a} /><path d={`M -22 ${SH_Y + 2} L -4 ${SH_Y + 80} L -26 ${SH_Y + 96}`} fill="none" /><path d={`M 22 ${SH_Y + 2} L 4 ${SH_Y + 80} L 26 ${SH_Y + 96}`} fill="none" /></g>;
    case "coat": return <g {...S}><path d={`M -20 ${SH_Y + 2} L 0 ${HIP_Y - 8} L 20 ${SH_Y + 2} Z`} fill="#efe6cf" /><path d={`M ${-tw + 4} ${HIP_Y - 16} H ${tw - 4}`} stroke={a} strokeWidth="11" fill="none" /><rect x="-10" y={HIP_Y - 24} width="20" height="16" rx="3" fill="#e8c45a" /></g>;
    case "spacesuit": return <g {...S}><rect x="-26" y={SH_Y + 38} width="52" height="42" rx="8" fill="#d2d7de" /><circle cx="-12" cy={SH_Y + 52} r="5" fill="#d2362e" /><circle cx="4" cy={SH_Y + 52} r="5" fill="#2f8fe0" /><path d={`M -14 ${SH_Y + 68} H 16`} strokeWidth="4" /><path d={`M ${-tw + 4} ${SH_Y + 6} L ${-tw + 4} ${HIP_Y}`} stroke="#8c96a4" strokeWidth="4" fill="none" /><rect x={-tw + 2} y={HIP_Y - 14} width={tw * 2 - 4} height="12" rx="5" fill="#9aa4b2" /></g>;
    case "fur": return <g {...S}><path d={`M ${-tw} ${SH_Y + 10} L ${tw - 4} ${SH_Y + 30} L ${tw + 4} ${HIP_Y - 30} L ${tw - 18} ${HIP_Y - 8} L ${tw - 30} ${HIP_Y - 36} L ${tw - 46} ${HIP_Y - 4} L ${-tw + 14} ${HIP_Y - 32} L ${-tw + 4} ${HIP_Y - 2} Z`} fill="#8a5a36" /><circle cx="-14" cy={SH_Y + 60} r="7" fill="#5a3a22" stroke="none" /><circle cx="14" cy={SH_Y + 96} r="6" fill="#5a3a22" stroke="none" /><path d={`M -34 ${SH_Y + 4} Q 0 ${SH_Y + 40} 34 ${SH_Y + 4}`} fill="none" stroke="#f4ead2" strokeWidth="8" strokeDasharray="1 16" /></g>;
    case "kilt": return <g {...S}><path d={`M -48 ${SH_Y + 4} Q 0 ${SH_Y + 66} 48 ${SH_Y + 4} Q 0 ${SH_Y + 30} -48 ${SH_Y + 4} Z`} fill="#e8c45a" /><path d={`M -30 ${SH_Y + 12} Q 0 ${SH_Y + 44} 30 ${SH_Y + 12}`} fill="none" stroke="#2f5fb5" strokeWidth="6" /></g>;
    case "robe": return <g {...S}><path d={`M -22 ${SH_Y + 2} L 0 ${SH_Y + 60} L 22 ${SH_Y + 2}`} fill="none" /><path d={`M ${-tw + 2} ${HIP_Y - 22} H ${tw - 2}`} stroke={a} strokeWidth="12" fill="none" /></g>;
    default: return null;
  }
};

export const LowerGarment: React.FC<{ st: InkStyle; tw: number }> = ({ st, tw }) => {
  const hem = HEM[st.kind];
  if (hem === undefined) return null;
  const flare = st.kind === "robe" ? 38 : st.kind === "dress" ? 34 : st.kind === "armor" ? 18 : 14;
  const d = `M ${-tw + 2} ${HIP_Y - 8} L ${tw - 2} ${HIP_Y - 8} L ${tw + flare} ${hem} Q 0 ${hem + 14} ${-tw - flare} ${hem} Z`;
  const col = st.kind === "armor" || st.kind === "tunic" || st.kind === "coat" ? st.bottom : st.kind === "kilt" ? "#f4efe2" : st.kind === "toga" ? "#f4efe2" : st.top;
  return (
    <g {...S}>
      <path d={d} fill={col} />
      <Shine d={d} amt={st.shine} />
      {st.kind === "armor" ? [-2, -1, 0, 1, 2].map((i) => <path key={i} d={`M ${i * 22 - 11} ${HIP_Y - 8} V ${hem - 4}`} fill="none" strokeWidth="3.5" />) : null}
      {st.kind === "robe" || st.kind === "dress" || st.kind === "toga" || st.kind === "kilt" ? <path d={`M ${-tw - flare + 4} ${hem - 4} Q 0 ${hem + 10} ${tw + flare - 4} ${hem - 4}`} fill="none" stroke={dk(col, 0.7)} strokeWidth="6" /> : null}
      {st.kind === "kilt" ? <path d={`M ${-tw + 6} ${HIP_Y + 24} H ${tw - 6}`} stroke="#e8c45a" strokeWidth="7" fill="none" /> : null}
    </g>
  );
};

export const Backpack: React.FC<{ st: InkStyle }> = ({ st }) => st.kind === "spacesuit"
  ? <g {...S}><rect x="-86" y={SH_Y + 6} width="58" height="120" rx="14" fill="#cfd5dc" /><rect x="-76" y={SH_Y + 20} width="38" height="20" rx="5" fill="#8c96a4" /></g> : null;

export const coversHair = (hat: string | null) => !!hat && ["helmet", "hood", "turban", "nemes", "spacehelm", "shako", "straw", "cap", "tophat"].includes(hat);

export const HatLayer: React.FC<{ hat: string | null; color: string; accent: string }> = ({ hat, color, accent }) => {
  const Y = HEAD_Y;
  if (!hat) return null;
  switch (hat) {
    case "crown": return <g {...S}><path d={`M -58 ${Y - 80} L -62 ${Y - 132} L -30 ${Y - 104} L 0 ${Y - 144} L 30 ${Y - 104} L 62 ${Y - 132} L 58 ${Y - 80} Q 0 ${Y - 68} -58 ${Y - 80} Z`} fill="#f1c24f" /><Shine d={`M -58 ${Y - 80} L -62 ${Y - 132} L -30 ${Y - 104} L 0 ${Y - 144} L 30 ${Y - 104} L 62 ${Y - 132} L 58 ${Y - 80} Z`} amt={0.6} /><circle cx="0" cy={Y - 92} r="7" fill="#d2362e" /></g>;
    case "helmet": return <g {...S}><path d={`M -92 ${Y - 4} Q -96 ${Y - 118} 0 ${Y - 120} Q 96 ${Y - 118} 92 ${Y - 4} L 70 ${Y - 22} Q 0 ${Y - 40} -70 ${Y - 22} Z`} fill="url(#inkMetal)" /><path d={`M -6 ${Y - 120} Q 0 ${Y - 150} 40 ${Y - 140} Q 14 ${Y - 128} 8 ${Y - 118}`} fill={accent === "#e8c45a" ? "#c0353a" : accent} /></g>;
    case "cap": return <g {...S}><path d={`M -88 ${Y - 26} Q -88 ${Y - 104} 0 ${Y - 104} Q 88 ${Y - 104} 88 ${Y - 26} Q 0 ${Y - 48} -88 ${Y - 26} Z`} fill={color} /><path d={`M 30 ${Y - 40} Q 100 ${Y - 40} 112 ${Y - 22} Q 80 ${Y - 30} 36 ${Y - 28} Z`} fill={dk(color, 0.8)} /></g>;
    case "tophat": return <g {...S}><rect x="-52" y={Y - 170} width="104" height="92" rx="8" fill="#26222c" /><ellipse cx="0" cy={Y - 80} rx="96" ry="16" fill="#26222c" /><rect x="-52" y={Y - 104} width="104" height="14" fill={accent} /></g>;
    case "shako": return <g {...S}><path d={`M -50 ${Y - 76} L -42 ${Y - 160} L 42 ${Y - 160} L 50 ${Y - 76} Z`} fill={color} /><circle cx="0" cy={Y - 170} r="12" fill="#d2362e" /></g>;
    case "laurel": return <g {...S} strokeWidth="3.5">{Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1.05 + (i / 8) * 0.9); return <g key={i}><ellipse cx={Math.cos(a) * 86} cy={Y - 4 + Math.sin(a) * 92} rx="13" ry="6" transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * 86} ${Y - 4 + Math.sin(a) * 92})`} fill="#5a9a3c" /></g>; })}</g>;
    case "nemes": return <g {...S}><path d={`M -92 ${Y - 12} Q -92 ${Y - 116} 0 ${Y - 116} Q 92 ${Y - 116} 92 ${Y - 12} L 100 ${Y + 150} L 62 ${Y + 140} L 70 ${Y - 6} Q 0 ${Y - 52} -70 ${Y - 6} L -62 ${Y + 140} L -100 ${Y + 150} Z`} fill="#e8c45a" /><path d={`M -76 ${Y - 40} L -84 ${Y + 130} M -56 ${Y - 40} L -62 ${Y + 130} M 76 ${Y - 40} L 84 ${Y + 130} M 56 ${Y - 40} L 62 ${Y + 130}`} stroke="#2f5fb5" strokeWidth="6" fill="none" /><circle cx="0" cy={Y - 100} r="9" fill="#2f5fb5" /></g>;
    case "turban": return <g {...S}><path d={`M -90 ${Y - 8} Q -96 ${Y - 120} 0 ${Y - 124} Q 96 ${Y - 120} 90 ${Y - 8} Q 0 ${Y - 44} -90 ${Y - 8} Z`} fill={color === "#241726" ? "#f4efe2" : color} /><path d={`M -80 ${Y - 40} Q 0 ${Y - 80} 84 ${Y - 30} M -70 ${Y - 70} Q 0 ${Y - 104} 76 ${Y - 66}`} fill="none" strokeWidth="4" /><circle cx="0" cy={Y - 74} r="9" fill="#d2362e" /></g>;
    case "hood": return <g {...S}><path d={`M -98 ${Y + 40} Q -110 ${Y - 120} 0 ${Y - 124} Q 110 ${Y - 120} 98 ${Y + 40} L 64 ${Y + 20} Q 0 ${Y - 56} -64 ${Y + 20} Z`} fill={color} /></g>;
    case "straw": return <g {...S}><ellipse cx="0" cy={Y - 62} rx="126" ry="22" fill="#e2c277" /><path d={`M -62 ${Y - 62} Q -60 ${Y - 124} 0 ${Y - 126} Q 60 ${Y - 124} 62 ${Y - 62} Z`} fill="#e2c277" /><path d={`M -62 ${Y - 74} H 62`} stroke="#b5303a" strokeWidth="8" /></g>;
    case "spacehelm": return <g><ellipse cx="0" cy={Y + 6} rx="112" ry="124" fill="url(#inkGlass)" stroke={INK} strokeWidth="7" /><path d={`M -78 ${Y - 62} Q -50 ${Y - 100} -4 ${Y - 98}`} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity=".7" /><rect x="-80" y={Y + 108} width="160" height="26" rx="12" fill="#cfd5dc" stroke={INK} strokeWidth="6" /></g>;
    default: return null;
  }
};
