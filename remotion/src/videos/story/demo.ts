import { Board } from "./types";
export const DEMO: Board = {
  title: "The King Who Lost His Crown",
  scenes: [
    { dur: 3.5, shot: "wide", move: "pull", extras: 10, caption: "The king woke up to a quiet village.",
      cast: [{ id: "king", role: "king", x: 0, z: 0, expr: "smile" }, { id: "k", role: "knight", x: 1.6, z: 0.6, expr: "neutral" }] },
    { dur: 3.2, shot: "medium", target: "king", cast: [{ id: "king", role: "king", x: -0.7, z: 0, expr: "neutral", expr2: "shock", at2: 0.55, look: "partner" }, { id: "k", role: "knight", x: 0.9, z: 0.2, expr: "nervous", look: "partner" }], caption: "\"My crown... it's gone!\"" },
    { dur: 2.6, shot: "close", target: "king", move: "push", cast: [{ id: "king", role: "king", x: 0, z: 0, expr: "shock", expr2: "pained", at2: 0.6 }], caption: "Not a single soul had seen it." },
    { dur: 3.0, shot: "over", target: "k", cast: [{ id: "king", role: "king", x: -0.9, z: 0, expr: "stern", look: "partner" }, { id: "k", role: "knight", x: 0.8, z: 0.1, expr: "nervous", expr2: "grin", at2: 0.6, look: "partner" }], caption: "Until a farmer's kid grinned." },
    { dur: 2.8, shot: "low", target: "kid", move: "push", light: "golden", cast: [{ id: "kid", role: "kid", x: 0, z: 0, expr: "grin", expr2: "laugh", at2: 0.5 }, { id: "farm", role: "farmer", x: 1.3, z: -0.4, expr: "smile_closed" }], caption: "He was wearing it as a hat." },
    { dur: 3.4, shot: "wide", move: "push", light: "golden", extras: 12, cast: [{ id: "king", role: "king", x: -1.2, z: 0, expr: "laugh" }, { id: "kid", role: "kid", x: 0.2, z: 0.4, expr: "laugh" }, { id: "k", role: "knight", x: 1.5, z: 0, expr: "relief" }], caption: "The kingdom laughed all night." },
  ],
};
