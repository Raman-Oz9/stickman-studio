#!/usr/bin/env node
// Check script: verifies that every battle scene has two distinct eras of extras (side A and side B).
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const REMOTION = path.dirname(SCRIPTS_DIR);
const SCRIPT = path.join(REMOTION, "story_alexander2.txt");
const BOARD = path.join(SCRIPTS_DIR, ".verify_sides_board.json");

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

let battleScenesCount = 0;
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  const text = ((s.narration ?? "") + " " + (s.caption ?? "")).toLowerCase();
  const isBattle = /charged|attacked|fought|clashed|held the line|crushed|battle|war|charge|attack|fight|clash/i.test(text);
  if (!isBattle) continue;

  battleScenesCount++;
  const label = `scene[${i}] (${s.caption ?? s.narration ?? ""})`;
  const era = s.era;
  const extrasEra = s.extrasEra;

  if (!era) fail(`${label}: missing main era`);
  if (!extrasEra) fail(`${label}: missing extrasEra (enemy army missing)`);
  if (era === extrasEra) fail(`${label}: era (${era}) equals extrasEra (${extrasEra}); battle scene must have two distinct sides`);
  ok(`${label}: verified battle scene with era "${era}" and extrasEra "${extrasEra}" (${s.extras ?? 0} extras)`);
}

console.log(`Checked ${battleScenesCount} battle scenes.`);
if (process.exitCode) {
  console.log("VERIFY SIDES FAILED");
  process.exit(1);
}
console.log("VERIFY SIDES PASSED");
