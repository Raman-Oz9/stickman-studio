#!/usr/bin/env node
// Unit check: reference-style shot planning on remotion/story_alexander2.txt.
// For every sentence the board must carry a shot sequence (establishing wide -> medium -> close-up -> reaction)
// with per-scene focus word timings and every shot clamped to 1.5-3.5 s.
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const REMOTION = path.dirname(SCRIPTS_DIR);
const SCRIPT = path.join(REMOTION, "story_alexander2.txt");
const BOARD = path.join(SCRIPTS_DIR, ".plan_check_board.json");

const SHOTS = ["wide", "medium", "close", "low", "over", "high"];
const MOVES = ["push", "pull", "reveal", "pan", "descend", "orbit", "hold", "track", "crane", "tiltup", "tiltdown"];

const run = () => {
  execSync(`python3 "${path.join(SCRIPTS_DIR, "plan_story.py")}" "${SCRIPT}" "${BOARD}"`, {
    stdio: "pipe",
    env: { ...process.env, GEMINI_API_KEY: "", GROQ_API_KEY: "" },
  });
  const board = JSON.parse(fs.readFileSync(BOARD, "utf8"));
  fs.rmSync(BOARD, { force: true });
  return board;
};

const fail = (msg) => { console.error("FAIL:", msg); process.exitCode = 1; };
const ok = (msg) => { console.log("OK:", msg); };

const board = run();
const scenes = board.scenes ?? [];
if (!scenes.length) fail("no scenes planned");
console.log(`Planned ${scenes.length} scenes for ${path.basename(SCRIPT)}`);

for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  const label = `scene[${i}] (${s.caption ?? s.narration ?? ""})`;
  const isFly = !!s.fly;
  const hasNarration = (s.narration ?? "").trim();
  const dur = Number(s.dur ?? 0);

  if (!hasNarration) {
    ok(`${label}: skipped (fly/empty)`);
    continue;
  }

  if (!(dur >= 1.5 && dur <= 3.5)) fail(`${label}: scene dur ${dur} outside 1.5-3.5`);

  const shots = s.shots;
  if (!Array.isArray(shots) || shots.length === 0) { fail(`${label}: missing shots array`); continue; }

  for (const sh of shots) {
    if (!SHOTS.includes(sh.shot)) fail(`${label}: shot type "${sh.shot}" not in ${SHOTS.join(",")}`);
    if (!MOVES.includes(sh.move)) fail(`${label}: move "${sh.move}" not in ${MOVES.join(",")}`);
    const sd = Number(sh.dur ?? 0);
    if (!(sd >= 1.5 && sd <= 3.5)) fail(`${label}: shot ${sh.shot} dur ${sd} outside 1.5-3.5`);
    const hasPropFocus = typeof sh.focus === "string" && sh.focus.startsWith("@");
    const hasCastFocus = typeof sh.focus === "string" && !!s.cast?.some?.((c) => c.id === sh.focus);
    if (!hasPropFocus && !hasCastFocus) fail(`${label}: shot ${sh.shot} missing prop/cast focus`);
  }

  const words = s.words;
  if (!Array.isArray(words) || words.length === 0) { fail(`${label}: missing focus word timings`); }
  else {
    const first = words[0]?.t0 ?? -1;
    const last = words[words.length - 1]?.t1 ?? -1;
    if (Math.abs(first - 0) > 0.01) fail(`${label}: first word t0 ${first} != 0`);
    if (Math.abs(last - dur) > 0.05) fail(`${label}: last word t1 ${last} != scene dur ${dur}`);
    for (let w = 1; w < words.length; w++) {
      if (words[w].t0 < words[w - 1].t1 - 0.001) fail(`${label}: word timings not monotonic at "${words[w].w}"`);
    }
    const fw = s.focusWord;
    if (typeof fw !== "string") fail(`${label}: missing focusWord`);
    else if (!words.some((w) => w.w === fw)) fail(`${label}: focusWord "${fw}" not found in word timings`);
  }
}

const real = scenes.filter((s) => (s.narration ?? "").trim());
console.log(`Real (spoken) scenes: ${real.length}`);
for (let i = 0; i < real.length; i++) {
  const s = real[i];
  const n = (s.shots ?? []).length;
  const expectedN = s.dur >= 7.0 ? 4 : s.dur >= 4.5 ? 3 : s.dur >= 3.0 ? 2 : 1;
  if (n !== expectedN) fail(`spoken scene[${i}] (${s.caption}): expected ${expectedN} shots, got ${n}`);
}

if (process.exitCode) { console.log("PLAN CHECK FAILED"); process.exit(1); }
console.log("PLAN CHECK PASSED");
