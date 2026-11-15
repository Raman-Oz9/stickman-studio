import type { Expr } from "../bridge/toon";
export type { Expr };
export type Shot = "wide" | "medium" | "close" | "low" | "over" | "high";
export type Move = "push" | "pull" | "orbit" | "hold" | "reveal" | "pan" | "descend" | "track" | "crane" | "tiltup" | "tiltdown";
export type CastDef = {
  id: string;
  role: string;            // king, knight, peasant, kid, merchant, soldier, wizard, girl ...
  x: number; z: number;    // metres on the ground, plaza centre = 0,0 (x right, z toward the default camera)
  expr?: Expr; expr2?: Expr; at2?: number; // second expression from this fraction of the scene (a reaction beat)
  mode?: "stand" | "stroll" | "sit";
  look?: "partner" | "left" | "right" | "cam";
  scale?: number; v?: number;
  holdH?: number;
  do?: { type: string; at?: number; dur?: number; prop?: string; to?: string; x?: number; z?: number };   // universal physical action (write|dig|carry|place|drink|pull|push|climb|throw|handOver|lean|open): the hand follows a real contact point
  mount?: string;                    // rides this 3D animal or vehicle (horse, camel, car, motorbike, chariot...) which moves with them
  hold?: string; holdAt?: number;   // sticker name held in the hand (from this fraction of the scene)
  act?: "wave" | "cheer" | "point" | "nod" | "run" | "swing" | "stab" | "shoot" | "aim";   // swing/stab/shoot/aim: use the held weapon
  holdUntil?: number;                // drop the held item at this fraction (it was stolen, thrown...)
  aim?: string;                      // cast id or "@prop" the weapon points at
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
  to?: { x: number; z: number };     // drive / fly / swim / walk from x,z to here at constant speed between `at` and `until` (vehicles and animals)
  flip?: boolean;                    // face the other way when static
};
export type SceneDef = {
  era?: string;                   // costume set for generic roles: roman|greek|wildwest|viking|egypt|samurai|pirate|space|ww2|1920s|victorian|arabian|india|prehistoric|china

  loc?: string; fly?: { from: string; to: string }; front?: string;   // loc: which place of the realm this scene is in; fly: glide between two places; front: shop front sign text
  biome?: string; season?: string; tod?: string;   // terrain (desert|ice|forest|ocean|swamp|savanna|mountain|jungle|farm), season (spring|summer|autumn|winter), time of day (dawn|noon|dusk|night)
  shop?: string; stock?: string[];  // interior "shop": what kind of shop, and the goods on its shelves/counter
  interior?: string;               // palace|cave|mine|house|jail: replaces the plaza with an enclosed interior set (only when the script is inside one)
  env?: ("rain" | "storm" | "snow" | "night" | "space" | "fog" | "wind")[];   // ambient weather / sky for the whole scene
  fx?: { type: "lightning" | "explosion" | "fire" | "smoke" | "sparkle"; at: number; until?: number; x?: number; z?: number; h?: number }[];  // timed effects (fractions of the scene)
  dur: number;                    // seconds
  light?: "day" | "golden";
  cast: CastDef[];
  shot: Shot; target?: string;    // the cast id the camera favours (default: centre of the group)
  az?: number;                    // camera azimuth in degrees around the group (0 = looking toward -z)
  move?: Move; roll?: number;
  focus?: string;                 // name of a prop the camera glides onto (e.g. the stolen purse)
  props?: PropDef[];              // the things the narration talks about
  extras?: number;                // background townsfolk
  caption?: string;
  narration?: string;
};
export type Board = { title: string; scenes: SceneDef[]; stickers?: Record<string, string>; models?: Record<string, import("./props3d").Recipe> };
export const FPS = 30;
export const framesOf = (b: Board) => b.scenes.map((s) => Math.max(1, Math.round(s.dur * FPS)));
export const totalFrames = (b: Board) => framesOf(b).reduce((a, c) => a + c, 0);
export const sceneAt = (b: Board, f: number) => {
  let a = 0;
  const fr = framesOf(b);
  for (let i = 0; i < fr.length; i++) { if (f < a + fr[i] || i === fr.length - 1) return { i, local: Math.min(f - a, fr[i] - 1), n: fr[i] }; a += fr[i]; }
  return { i: 0, local: 0, n: 1 };
};
