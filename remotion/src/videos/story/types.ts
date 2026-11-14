import type { Expr } from "../bridge/toon";
export type { Expr };
export type Shot = "wide" | "medium" | "close" | "low" | "over" | "high";
export type Move = "push" | "pull" | "orbit" | "hold" | "reveal" | "pan" | "descend";
export type CastDef = {
  id: string;
  role: string;            // king, knight, peasant, kid, merchant, soldier, wizard, girl ...
  x: number; z: number;    // metres on the ground, plaza centre = 0,0 (x right, z toward the default camera)
  expr?: Expr; expr2?: Expr; at2?: number; // second expression from this fraction of the scene (a reaction beat)
  mode?: "stand" | "stroll" | "sit";
  look?: "partner" | "left" | "right" | "cam";
  scale?: number; v?: number;
  hold?: string; holdAt?: number;   // sticker name held in the hand (from this fraction of the scene)
  act?: "wave" | "cheer" | "point" | "nod";
  to?: { x: number; z: number };     // walk here during the scene
  walkAt?: number;                   // fraction of the scene when the walk starts (default 0)
};
export type PropDef = {
  name: string;                      // sticker name (a noun: "mango", "chicken", "gold coins")
  x: number; z: number; y?: number;
  h?: number;                        // height in metres (default 1)
  anim?: "pop" | "grow" | "bounce" | "float" | "fall" | "spin" | "static";
  at?: number; until?: number;       // visible window as fractions of the scene
  count?: number; spread?: number;   // scatter copies (a pile of coins, a flock of chickens, falling rain)
  from?: { x: number; z: number };   // glide from here to x,z
};
export type SceneDef = {
  dur: number;                    // seconds
  light?: "day" | "golden";
  cast: CastDef[];
  shot: Shot; target?: string;    // the cast id the camera favours (default: centre of the group)
  az?: number;                    // camera azimuth in degrees around the group (0 = looking toward -z)
  move?: Move; roll?: number;
  props?: PropDef[];              // the things the narration talks about
  extras?: number;                // background townsfolk
  caption?: string;
  narration?: string;
};
export type Board = { title: string; scenes: SceneDef[]; stickers?: Record<string, string> };
export const FPS = 30;
export const framesOf = (b: Board) => b.scenes.map((s) => Math.max(1, Math.round(s.dur * FPS)));
export const totalFrames = (b: Board) => framesOf(b).reduce((a, c) => a + c, 0);
export const sceneAt = (b: Board, f: number) => {
  let a = 0;
  const fr = framesOf(b);
  for (let i = 0; i < fr.length; i++) { if (f < a + fr[i] || i === fr.length - 1) return { i, local: Math.min(f - a, fr[i] - 1), n: fr[i] }; a += fr[i]; }
  return { i: 0, local: 0, n: 1 };
};
