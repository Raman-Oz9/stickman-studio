import type { Expr } from "../bridge/toon";
export type { Expr };
export type Shot = "wide" | "medium" | "close" | "low" | "over";
export type Move = "push" | "pull" | "orbit" | "hold";
export type CastDef = {
  id: string;
  role: string;            // king, knight, peasant, kid, merchant, soldier, wizard, girl ...
  x: number; z: number;    // metres on the ground, plaza centre = 0,0 (x right, z toward the default camera)
  expr?: Expr; expr2?: Expr; at2?: number; // second expression from this fraction of the scene (a reaction beat)
  mode?: "stand" | "stroll" | "sit";
  look?: "partner" | "left" | "right" | "cam";
  scale?: number; v?: number;
};
export type SceneDef = {
  dur: number;                    // seconds
  light?: "day" | "golden";
  cast: CastDef[];
  shot: Shot; target?: string;    // the cast id the camera favours (default: centre of the group)
  az?: number;                    // camera azimuth in degrees around the group (0 = looking toward -z)
  move?: Move; roll?: number;
  extras?: number;                // background townsfolk
  caption?: string;
  narration?: string;
};
export type Board = { title: string; scenes: SceneDef[] };
export const FPS = 30;
export const framesOf = (b: Board) => b.scenes.map((s) => Math.max(1, Math.round(s.dur * FPS)));
export const totalFrames = (b: Board) => framesOf(b).reduce((a, c) => a + c, 0);
export const sceneAt = (b: Board, f: number) => {
  let a = 0;
  const fr = framesOf(b);
  for (let i = 0; i < fr.length; i++) { if (f < a + fr[i] || i === fr.length - 1) return { i, local: Math.min(f - a, fr[i] - 1), n: fr[i] }; a += fr[i]; }
  return { i: 0, local: 0, n: 1 };
};
