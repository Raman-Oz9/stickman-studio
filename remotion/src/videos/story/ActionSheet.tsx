import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Performer2D } from "./Performer2D";
import { VERBS } from "./pose2d";
import { outfitFor, resolveRole } from "./outfits";
import { inkStyleOf } from "./inkOutfit";

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
        const cx = 180 + (i % 3) * 360, cy = 330 + Math.floor(i / 3) * 440;
        const t = TIMES[v] ?? 1.1, p = v === "pickUp" ? 0.55 : v === "place" ? 0.3 : v === "throw" ? 0.55 : v === "fall" ? 0.8 : 0.6;
        return (
          <svg key={v} viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
            <rect x={cx - 170} y={cy - 235} width={340} height={430} rx="14" fill="#f6ecd3" stroke="#1d1a20" strokeWidth="3" />
            <line x1={cx - 160} y1={cy + 150} x2={cx + 160} y2={cy + 150} stroke="#8a7a58" strokeWidth="3" />
            <g transform={`translate(${cx - 90} ${cy + 150}) scale(0.5)`}>
              <Performer2D x={170} y={0} scale={1} yaw={30} skin={o.skin ?? "#f6ead9"} cloth={o.dress ?? o.jacket} hair={o.hair} verb={v} p={p} t={t} frame={20} target={[260, -330]} />
            </g>
            <text x={cx} y={cy + 185} textAnchor="middle" fontSize="30" fontFamily="Arial Black,sans-serif" fill="#1d1a20">{v}</text>
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const WARD: [string, string, string][] = [
  ["man", "roman", "citizen"], ["king", "roman", "emperor"], ["soldier", "roman", "legionary"], ["woman", "greek", "greek woman"],
  ["king", "egypt", "pharaoh"], ["man", "prehistoric", "stone age"], ["knight", "medieval", "knight"], ["king", "medieval", "king"],
  ["soldier", "viking", "viking"], ["man", "pirate", "pirate"], ["soldier", "samurai", "samurai"], ["king", "china", "emperor"],
  ["woman", "victorian", "victorian"], ["man", "wildwest", "cowboy"], ["soldier", "ww2", "ww2"], ["merchant", "arabian", "trader"],
  ["man", "space", "astronaut"], ["businessman", "modern", "business"], ["scientist", "modern", "scientist"], ["woman", "modern", "woman"],
  ["wizard", "medieval", "wizard"], ["peasant", "medieval", "peasant"], ["queen", "medieval", "queen"], ["king", "india", "maharaja"],
];
export const WARD_PAGES = 2;
export const WardrobeSheet: React.FC = () => {
  const page = Math.min(WARD_PAGES - 1, useCurrentFrame());
  return (
    <AbsoluteFill style={{ background: "#d9e4ee" }}>
      {WARD.slice(page * 12, page * 12 + 12).map(([role, era, label], i) => {
        const cx = 180 + (i % 3) * 360, cy = 330 + Math.floor(i / 3) * 440, idx = i + page * 12;
        const o = outfitFor(role, idx % 3, era), ink = inkStyleOf(role, idx % 3, era, resolveRole(role, era));
        return (
          <svg key={role + era + i} viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
            <rect x={cx - 170} y={cy - 235} width={340} height={430} rx="14" fill="#f4f8fb" stroke="#1d1a20" strokeWidth="3" />
            <g transform={`translate(${cx - 90} ${cy + 150}) scale(0.5)`}>
              <Performer2D x={170} y={0} scale={1} yaw={0} skin={o.skin ?? "#f6ead9"} cloth={ink.top} hair={o.hair} ink={ink} verb="idle" p={0.5} t={1} frame={20} />
            </g>
            <text x={cx} y={cy + 185} textAnchor="middle" fontSize="28" fontFamily="Arial Black,sans-serif" fill="#1d1a20">{label}</text>
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

export const TURN_PAGES = 1;
export const TurnSheet: React.FC = () => {
  const o = outfitFor("king", 0, "medieval"), ink = inkStyleOf("king", 0, "medieval", resolveRole("king", "medieval"));
  const k = outfitFor("soldier", 1, "roman"), ink2 = inkStyleOf("soldier", 1, "roman", resolveRole("soldier", "roman"));
  const yaws = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <AbsoluteFill style={{ background: "#dfe8f0" }}>
      {yaws.map((yw, i) => {
        const cx = 135 + (i % 4) * 270, cy = 420 + Math.floor(i / 4) * 560;
        return (
          <svg key={yw} viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
            <rect x={cx - 128} y={cy - 250} width={256} height={520} rx="12" fill="#f4f8fb" stroke="#1d1a20" strokeWidth="3" />
            <g transform={`translate(${cx} ${cy + 230}) scale(0.42)`}><Performer2D x={0} y={0} yaw={yw} skin={o.skin ?? "#f6ead9"} cloth={ink.top} hair={o.hair} ink={ink} verb="swing" p={0.4} t={0.9} frame={20} prop="sword" /></g>
            <text x={cx} y={cy + 262} textAnchor="middle" fontSize="26" fontFamily="Arial Black,sans-serif" fill="#1d1a20">{yw}°</text>
            <g transform={`translate(${cx} ${cy + 230 + 560}) scale(0.42)`} />
          </svg>
        );
      })}
      {yaws.map((yw, i) => {
        const cx = 135 + (i % 4) * 270, cy = 420 + 2 * 560 + Math.floor(i / 4) * 0;
        return i < 4 ? (
          <svg key={"b" + yw} viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
            <rect x={cx - 128} y={cy - 250} width={256} height={520} rx="12" fill="#f4f8fb" stroke="#1d1a20" strokeWidth="3" />
            <g transform={`translate(${cx} ${cy + 230}) scale(0.42)`}><Performer2D x={0} y={0} yaw={yw * 2} skin={k.skin ?? "#f6ead9"} cloth={ink2.top} hair={k.hair} ink={ink2} verb="walk" p={0.5} t={0.4} frame={20} /></g>
            <text x={cx} y={cy + 262} textAnchor="middle" fontSize="26" fontFamily="Arial Black,sans-serif" fill="#1d1a20">walk {yw * 2}°</text>
          </svg>
        ) : null;
      })}
    </AbsoluteFill>
  );
};
