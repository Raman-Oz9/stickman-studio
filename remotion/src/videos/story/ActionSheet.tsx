import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Performer2D } from "./Performer2D";
import { VERBS } from "./pose2d";
import { outfitFor } from "./outfits";

// Proof sheet: every verb of the action library, 12 per page (page = frame). Used by CI stills to check poses.
const PER = 12;
export const ACTION_PAGES = Math.ceil(VERBS.length / PER);
const TIMES: Record<string, number> = { pickUp: 0.5, place: 0.3, throw: 0.55, fall: 0.8, lie: 1.5, sleep: 1.5, jump: 0.3 };
export const ActionSheet: React.FC = () => {
  const page = Math.min(ACTION_PAGES - 1, useCurrentFrame());
  const verbs = VERBS.slice(page * PER, page * PER + PER);
  const o = outfitFor("merchant", page, "medieval");
  return (
    <AbsoluteFill style={{ background: "#e9d9b5" }}>
      {verbs.map((v, i) => {
        const cx = 180 + (i % 3) * 360, cy = 470 + Math.floor(i / 3) * 450;
        const t = TIMES[v] ?? 1.1, p = v === "pickUp" ? 0.55 : v === "place" ? 0.3 : v === "throw" ? 0.55 : v === "fall" ? 0.8 : 0.6;
        return (
          <svg key={v} viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
            <rect x={cx - 170} y={cy - 235} width={340} height={430} rx="14" fill="#f6ecd3" stroke="#1d1a20" strokeWidth="3" />
            <line x1={cx - 160} y1={cy + 150} x2={cx + 160} y2={cy + 150} stroke="#8a7a58" strokeWidth="3" />
            <g transform={`translate(${cx - 120} ${cy + 150}) scale(0.5)`}>
              <Performer2D x={170} y={0} scale={1} facing={1} skin={o.skin ?? "#f6ead9"} cloth={o.dress ?? o.jacket} hair={o.hair} verb={v} p={p} t={t} frame={20} target={[260, -330]} />
            </g>
            <text x={cx} y={cy + 185} textAnchor="middle" fontSize="30" fontFamily="Arial Black,sans-serif" fill="#1d1a20">{v}</text>
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};
