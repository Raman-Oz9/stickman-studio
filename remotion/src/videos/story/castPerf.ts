import type { CastDef, SceneDef } from "./types";
import { verbFromText } from "./pose2d";
const clamp = (v: number) => Math.max(0, Math.min(1, v));
// Which library verb is this cast member performing right now, and how far through it are they?
export const castPerf = (d: CastDef, s: SceneDef, u: number, t: number) => {
  let verb = "talk";
  const a = d.act as string | undefined;
  const text = String(s.narration ?? s.caption ?? "").toLowerCase();
  const isBattle = /charged|attacked|fought|clashed|held the line|crushed|battle|war|charge|attack|fight|clash/i.test(text);
  if (d.do && d.do.type !== "custom") verb = d.do.type;
  else if (a && ["swing", "stab", "shoot", "aim", "run", "wave", "point", "nod", "cheer", "lie", "sleep", "fall"].includes(a)) {
    verb = a === "fall" ? "lie" : a;
  } else if (isBattle) {
    if (d.mode === "lie" || d.id?.startsWith("fallen")) verb = "lie";
    else verb = "swing";
  } else if (d.mode === "sit") verb = "sit";
  else if (d.to && u < 0.98) verb = "walk";
  else verb = verbFromText(text) ?? "talk";
  const dl = d.do?.dur ?? 0, len = dl > 1 ? dl / Math.max(1, s.dur) : dl > 0 ? dl : 0.6;
  const p = d.do ? clamp((u - (d.do.at ?? 0.1)) / Math.max(0.05, len)) : u;
  const holdProp = d.hold ?? (isBattle ? "sword" : null);
  return { verb, p, t, prop: d.do?.prop ?? null, holdProp };
};
