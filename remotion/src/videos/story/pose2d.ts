import type { Expression, Vec } from "./Stickman2D";

// Action library: ANY verb in the narration becomes a body pose. Local space: origin = ground between the feet,
// +x = forward (facing), -y = up. Shoulder (40,-336), head (0,-430), hip (0,-204). All hand targets are reachable.
export type Pose = {
  handF: Vec | null; handB: Vec | null; footF: Vec | null; footB: Vec | null;
  hipDrop: number; hipX: number; lean: number; rot: number; dx: number; dy: number; headTilt: number;
  grip: boolean; expr?: Expression; gaze?: Vec | null; stand: number; walkRate: number;
  hold?: { prop: string; ang: number } | null;     // prop drawn in the front hand
  fly?: { prop: string; from: Vec; to: Vec; p: number } | null;   // thrown prop in flight (local coords)
  chair?: boolean;                                  // sit: draw a seat under the hips
};
export type Verb = string;
export type PerformIn = { verb: Verb; p: number; t: number; phase: number; prop?: string | null; target?: Vec | null };

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = (v: number) => { const t = cl(v); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mv = (a: Vec, b: Vec, t: number): Vec => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const win = (p: number, a: number, b: number) => sm((p - a) / Math.max(0.001, b - a));   // 0 before a, 1 after b
const pulse = (p: number, a: number, b: number, c: number, d: number) => win(p, a, b) * (1 - win(p, c, d));

const HANG_F: Vec = [16, -176], HANG_B: Vec = [-16, -176];
const base = (): Pose => ({ handF: null, handB: null, footF: null, footB: null, hipDrop: 0, hipX: 0, lean: 0, rot: 0, dx: 0, dy: 0, headTilt: 0, grip: false, stand: 1, walkRate: 0, hold: null, fly: null });

export const VERBS = [
  "idle", "talk", "walk", "run", "point", "wave", "cheer", "nod", "clap", "shrug", "think", "cry", "shout", "salute", "bow", "pray", "hug",
  "pickUp", "carry", "place", "handOver", "receive", "drink", "eat", "read", "write", "type", "look", "dig", "hammer", "chop", "push", "pull", "open", "lean", "climb",
  "throw", "swing", "stab", "shoot", "aim", "block", "sit", "kneel", "lie", "sleep", "fall", "jump", "dance", "sneak", "stir", "pour", "show", "lift", "knock", "paint",
  "row", "swim", "fish", "ride", "stretch", "sneeze", "scratchHead", "count", "measure", "spy",
] as const;

// Spoken verbs -> library verb (used by the planner and by Story2D for boards that only carry loose words).
export const VERB_ALIASES: [RegExp, Verb][] = [
  [/\b(ran|run|runs|running|fled|flee|sprint|dash|rush|chase|chasing|escape)/, "run"],
  [/\b(walk|walked|stroll|march|marched|wander|went|travel|journey|arrive|came)/, "walk"],
  [/\b(creep|crept|sneak|snuck|tiptoe)/, "sneak"],
  [/\b(point|pointed|show|showed|indicate|gesture)/, "point"],
  [/\b(wave|waved|greet|hello|farewell)/, "wave"],
  [/\b(cheer|celebrat|rejoic|victory|triumph|won)/, "cheer"],
  [/\b(dance|danced)/, "dance"],
  [/\b(clap|applaud)/, "clap"],
  [/\b(think|thought|wonder|ponder|idea|plan|decid|imagin|remember)/, "think"],
  [/\b(cry|cried|weep|wept|mourn|grief|sob)/, "cry"],
  [/\b(shout|yell|scream|roar|cry out|command|order|declare|proclaim|announce|preach)/, "shout"],
  [/\b(salute|honou?r|swear)/, "salute"],
  [/\b(bow|bowed|kneel|submit|surrender)/, "bow"],
  [/\b(pray|prayed|worship|beg)/, "pray"],
  [/\b(hug|embrace|kiss)/, "hug"],
  [/\b(pick|picked|grab|grabbed|took|take|collect|gather|stole|steal|snatch|lift|lifted|raise)/, "pickUp"],
  [/\b(carry|carried|bring|brought|haul|deliver|bear)/, "carry"],
  [/\b(put|placed|place|set down|lay|laid|drop|dropped|deposit|plant|planted|bury|buried|store)/, "place"],
  [/\b(gave|give|hand|handed|pay|paid|offer|sell|sold|trade|traded|buy|bought|gift|present)/, "handOver"],
  [/\b(drink|drank|sip|sipped|swallow|gulp)/, "drink"],
  [/\b(eat|ate|eating|feast|bite|chew|dine|taste|hungry|food)/, "eat"],
  [/\b(read|reading|study|studied|scroll|learn|learned)/, "read"],
  [/\b(write|wrote|written|draw|drew|sign|signed|record|note|paint|painted|carve|carved|inscri)/, "write"],
  [/\b(type|typed|code|coding|program|invent|invented|design|designed)/, "type"],
  [/\b(look|looked|watch|watched|stare|stared|gaze|observe|spot|spotted|search|scan|discover|found|find|saw|see)/, "look"],
  [/\b(dig|dug|mine|mined|excavat|farm|farmed|harvest|plow|till)/, "dig"],
  [/\b(build|built|hammer|forge|forged|craft|crafted|repair|fix|fixed|construct|made|make|work|worked)/, "hammer"],
  [/\b(chop|cut|cutting|saw|slice|harvest|log)/, "chop"],
  [/\b(push|pushed|shove|shoved|roll|rolled|drag|dragged)/, "push"],
  [/\b(pull|pulled|tow|towed|yank|paddle)/, "pull"],
  [/\b(row|rowed)/, "row"],
  [/\b(swim|swam|swimming)/, "swim"],
  [/\b(fish|fished|fishing)/, "fish"],
  [/\b(ride|rode|riding)/, "ride"],
  [/\b(stretch|stretched|stretching|yawn|yawned)/, "stretch"],
  [/\b(sneeze|sneezed|sneezing|cough|coughed)/, "sneeze"],
  [/\b(scratch|scratched|scratching|scratch head)/, "scratchHead"],
  [/\b(count|counted|counting)/, "count"],
  [/\b(measure|measured|measuring)/, "measure"],
  [/\b(spy|spied|spying|peep|peeped)/, "spy"],
  [/\b(open|opened|unlock|unlocked|enter|entered|knock|knocked)/, "open"],
  [/\b(climb|climbed|scale|scaled|ascend|ascended|mount|mounted)/, "climb"],
  [/\b(throw|threw|toss|tossed|hurl|hurled|launch|launched|cast|fling|kick|kicked)/, "throw"],
  [/\b(fight|fought|attack|attacked|slash|slashed|swing|swung|strike|struck|battle|duel|kill|killed|conquer|invade|invaded|defeat|destroy|destroyed|rebel|war)/, "swing"],
  [/\b(stab|stabbed|spear|pierce|assassinat|murder)/, "stab"],
  [/\b(shoot|shot|fire|fired|aim|aimed|arrow)/, "aim"],
  [/\b(defend|block|blocked|guard|guarded|protect|protected|shield)/, "block"],
  [/\b(sit|sat|seated|rest|rested|throne|ruled|reign|reigned|ruler|govern|governed|wait|waited|meet|met|meeting|talk|talked|discuss|discussed|negotiat)/, "sit"],
  [/\b(sleep|slept|dream|dreamed|died|dead|death|dying)/, "sleep"],
  [/\b(fall|fell|collapse|collapsed|crash|crashed|trip|tripped|slip|slipped)/, "fall"],
  [/\b(jump|jumped|leap|leapt|hop|hopped|bounce|burst|explode|surprise)/, "jump"],
  [/\b(stir|stirred|cook|cooked|bake|baked|brew|brewed|mix|mixed)/, "stir"],
  [/\b(pour|poured|water|watered|spill)/, "pour"],
  [/\b(shrug|confus|unsure|maybe|perhaps|whatever)/, "shrug"],
];
export const verbFromText = (s: string): Verb | null => { const l = s.toLowerCase(); for (const [re, v] of VERB_ALIASES) if (re.test(l)) return v; return null; };

const swingArm = (s: number, amp: number, y = -176): Vec => [16 + s * amp, y + Math.abs(s) * -6];

export const perform = ({ verb, p, t, phase, prop, target }: PerformIn): Pose => {
  const o = base();
  const s = Math.sin(phase * Math.PI * 2);
  const osc = Math.sin(t * 9);
  const tg: Vec = target ?? [190, -300];
  const dirT = (): Vec => { const dx = tg[0] - 40, dy = tg[1] + 336, d = Math.max(1, Math.hypot(dx, dy)); return [dx / d, dy / d]; };
  switch (verb) {
    case "walk": case "sneak": {
      const k = verb === "sneak" ? 0.55 : 1;
      o.stand = 0; o.walkRate = 1; o.handF = swingArm(s, 42 * k); o.handB = swingArm(-s, 42 * k, -176);
      if (verb === "sneak") { o.hipDrop = 26; o.lean = 12; o.expr = "focused"; }
      break;
    }
    case "run": {
      o.stand = 0; o.walkRate = 1.9; o.lean = 15;
      o.handF = [60 + s * 62, -262 + Math.abs(s) * -10]; o.handB = [60 - s * 62, -262 + Math.abs(s) * -10];
      o.footF = [30 + s * 92, -Math.max(0, Math.cos(phase * Math.PI * 2)) * 64]; o.footB = [-30 - s * 92, -Math.max(0, -Math.cos(phase * Math.PI * 2)) * 64];
      o.hipDrop = 10 + Math.abs(s) * -10; o.expr = "focused"; break;
    }
    case "talk": case "idle": case "shout": {
      const loud = verb === "shout" ? 1 : verb === "talk" ? 0.55 : 0.12;
      o.handF = mv(HANG_F, [90 + osc * 10, -272 + Math.sin(t * 5) * 22], loud);
      o.handB = mv(HANG_B, [40, -250 + Math.sin(t * 6.3) * 18], loud * 0.55);
      o.headTilt = Math.sin(t * 2.1) * 2.5 * loud; o.lean = -loud * 2;
      if (verb === "shout") { o.expr = "angry"; o.lean = 7; o.handF = [110, -430 + osc * 14]; o.handB = [-10, -250]; }
      break;
    }
    case "point": {
      const a = win(p, 0, 0.22) * (1 - win(p, 0.88, 1)), d = dirT();
      o.handF = mv(HANG_F, [40 + d[0] * 160, -336 + d[1] * 160], a); o.gaze = tg; o.grip = false; o.lean = 4 * a; o.handB = [-12, -190]; break;
    }
    case "show": case "present": {
      const a = win(p, 0, 0.25) * (1 - win(p, 0.9, 1));
      o.handF = mv(HANG_F, [128, -250], a); o.handB = mv(HANG_B, [90, -230], a * 0.7); o.expr = "smile"; o.gaze = tg; break;
    }
    case "wave": {
      const a = win(p, 0, 0.15) * (1 - win(p, 0.92, 1));
      o.handF = mv(HANG_F, [64 + Math.sin(t * 11) * 34, -470], a); o.expr = "joy"; o.headTilt = 4 * a; break;
    }
    case "cheer": case "dance": {
      const b = Math.abs(Math.sin(t * (verb === "dance" ? 5 : 7)));
      o.handF = [70 + osc * (verb === "dance" ? 40 : 6), -480 + b * -12]; o.handB = [-30 - osc * (verb === "dance" ? 40 : 6), -480 + b * -12];
      o.dy = -b * 34; o.expr = "joy"; o.lean = verb === "dance" ? osc * 8 : 0; o.headTilt = verb === "dance" ? osc * 6 : 0;
      o.footF = [24, -b * 34]; o.footB = [-22, -b * 28]; break;
    }
    case "clap": {
      const c = 0.5 + 0.5 * Math.sin(t * 12);
      o.handF = [72 - c * 14, -290]; o.handB = [34 + c * 14, -290]; o.expr = "joy"; o.dy = 0; break;
    }
    case "nod": { o.headTilt = Math.sin(t * 8) * 7 + 4; o.handF = HANG_F; o.handB = HANG_B; o.expr = "smile"; break; }
    case "shrug": {
      const a = win(p, 0, 0.25) * (1 - win(p, 0.85, 1));
      o.handF = mv(HANG_F, [96, -300], a); o.handB = mv(HANG_B, [-60, -300], a); o.expr = "sad"; o.headTilt = 7 * a; break;
    }
    case "think": {
      const a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [52, -392], a); o.handB = mv(HANG_B, [20, -262], a); o.expr = "focused"; o.gaze = [140, -520]; o.headTilt = -5 * a; o.lean = -2; break;
    }
    case "cry": {
      const a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [44 + Math.sin(t * 14) * 3, -424], a); o.handB = mv(HANG_B, [18, -420], a); o.expr = "sad"; o.headTilt = 8 * a; o.lean = 8 * a; o.dy = Math.sin(t * 14) * 2; break;
    }
    case "salute": { const a = win(p, 0, 0.2); o.handF = mv(HANG_F, [58, -462], a); o.expr = "focused"; o.lean = -3 * a; o.handB = [-14, -188]; break; }
    case "bow": { const a = pulse(p, 0, 0.3, 0.7, 1); o.lean = 46 * a; o.hipDrop = 8 * a; o.handF = mv(HANG_F, [96, -180], a); o.handB = mv(HANG_B, [50, -178], a); o.expr = "smile"; break; }
    case "pray": { const a = win(p, 0, 0.2); o.handF = mv(HANG_F, [64, -330], a); o.handB = mv(HANG_B, [38, -326], a); o.hipDrop = 70 * a; o.footF = [96, 0]; o.footB = [-70, -2]; o.headTilt = 12 * a; o.expr = "sad"; o.lean = 6 * a; break; }
    case "hug": { const a = win(p, 0, 0.3); o.handF = mv(HANG_F, [96, -300], a); o.handB = mv(HANG_B, [76, -270], a); o.lean = 8 * a; o.expr = "joy"; o.headTilt = 5 * a; break; }
    case "look": { o.gaze = tg; o.handF = HANG_F; o.handB = [-10, -184]; o.expr = "focused"; o.lean = 3; const d = dirT(); o.handF = mv(HANG_F, [50 + d[0] * 90, -380 + d[1] * 40], 0.7 * win(p, 0, 0.3)); o.headTilt = -3; break; }
    case "pickUp": case "lift": {
      const dn = win(p, 0, 0.35), up = win(p, 0.45, 0.85);
      o.hipDrop = 110 * dn * (1 - up); o.lean = 30 * dn * (1 - up); o.footF = [30 + 48 * dn * (1 - up), 0]; o.footB = [-26 - 22 * dn * (1 - up), 0];
      const low: Vec = [110, -34]; o.handF = mv(HANG_F, mv(low, [88, -230], up), dn); o.handB = mv(HANG_B, mv([70, -50], [56, -216], up), dn);
      o.grip = p > 0.38; o.hold = p > 0.42 ? { prop: prop ?? "box", ang: -10 } : null; o.gaze = p < 0.5 ? [110, -40] : null; o.expr = "focused"; break;
    }
    case "carry": {
      o.stand = 0; o.walkRate = 0.9; o.handF = [86, -236 + Math.abs(s) * -5]; o.handB = [56, -218]; o.grip = true; o.hold = { prop: prop ?? "box", ang: 0 }; o.lean = -5; break;
    }
    case "place": {
      const dn = win(p, 0, 0.45), rel = win(p, 0.5, 0.65), back = win(p, 0.65, 1);
      o.hipDrop = 90 * dn * (1 - back); o.lean = 26 * dn * (1 - back); o.footF = [30 + 40 * dn * (1 - back), 0]; o.footB = [-26 - 18 * dn * (1 - back), 0];
      const from: Vec = [88, -230]; o.handF = mv(from, [104, -40], dn); o.handF = mv(o.handF, HANG_F, back); o.handB = mv([56, -216], [76, -52], dn); o.handB = mv(o.handB, HANG_B, back);
      o.grip = rel < 0.5; o.hold = rel < 1 ? { prop: prop ?? "box", ang: 0 } : null; o.expr = "smile"; break;
    }
    case "handOver": case "receive": {
      const a = win(p, 0, 0.3) * (1 - win(p, 0.8, 1));
      o.handF = mv(HANG_F, [128, -250], a); o.handB = mv(HANG_B, [96, -236], a * 0.5); o.hold = verb === "handOver" && p < 0.6 ? { prop: prop ?? "coin", ang: 0 } : null; o.gaze = tg; o.expr = "smile"; break;
    }
    case "drink": {
      const up = win(p, 0, 0.3) * (1 - win(p, 0.75, 1));
      o.handF = mv(HANG_F, [58, -392], up); o.handB = mv(HANG_B, [-14, -188], up); o.hold = { prop: prop ?? "cup", ang: -72 * up };
      o.headTilt = -12 * up; o.expr = up > 0.6 ? "joy" : "smile"; o.grip = true; break;
    }
    case "eat": {
      const bite = 0.5 + 0.5 * Math.sin(t * 7), up = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [56, -396 + bite * -6], up); o.hold = { prop: prop ?? "bread", ang: -40 * up }; o.grip = true; o.handB = HANG_B;
      o.headTilt = bite * 3 * up; o.expr = "joy"; break;
    }
    case "read": {
      const a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [82, -296], a); o.handB = mv(HANG_B, [58, -270], a); o.hold = { prop: prop ?? "book", ang: -18 * a }; o.grip = true;
      o.gaze = [96, -316]; o.headTilt = 9 * a; o.expr = "focused"; o.lean = 3 * a; break;
    }
    case "write": case "paint": {
      const a = win(p, 0, 0.18);
      o.handF = mv(HANG_F, [104 + Math.sin(t * 13) * 10, -250 + Math.sin(t * 9) * 5], a); o.handB = mv(HANG_B, [82, -208], a);
      o.hold = { prop: prop ?? (verb === "paint" ? "brush" : "pen"), ang: -30 }; o.grip = true; o.gaze = [118, -238]; o.headTilt = 12 * a; o.lean = 10 * a; o.expr = "focused"; break;
    }
    case "type": {
      const a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [92 + Math.sin(t * 17) * 6, -226], a); o.handB = mv(HANG_B, [78 + Math.cos(t * 15) * 6, -220], a); o.gaze = [110, -230]; o.headTilt = 8 * a; o.expr = "focused"; o.lean = 6 * a; break;
    }
    case "dig": case "stir": case "pour": {
      const k = Math.abs(Math.sin(t * 4.2)), a = win(p, 0, 0.15);
      const tool = prop ?? (verb === "dig" ? "shovel" : verb === "stir" ? "spoon" : "cup");
      o.lean = (verb === "dig" ? 22 : 10) * a; o.hipDrop = (verb === "dig" ? 30 : 6) * a;
      o.handF = mv(HANG_F, verb === "dig" ? mv([112, -60], [70, -250], 1 - k) : [100, -230 + k * 10], a); o.handB = mv(HANG_B, verb === "dig" ? mv([84, -40], [44, -214], 1 - k) : [84, -216], a);
      o.hold = { prop: tool, ang: verb === "dig" ? 58 - (1 - k) * 56 : 18 }; o.grip = true; o.expr = "focused"; break;
    }
    case "hammer": case "chop": case "knock": {
      const k = Math.sin(t * 6.5) * 0.5 + 0.5, a = win(p, 0, 0.12);
      o.handF = mv(HANG_F, mv([140, -250], [48, -470], k), a); o.handB = mv(HANG_B, mv([110, -240], [20, -420], k), a);
      o.hold = { prop: prop ?? (verb === "chop" ? "axe" : "hammer"), ang: -30 + k * -40 }; o.grip = true; o.lean = 12 - k * 10; o.expr = "focused"; break;
    }
    case "push": {
      o.stand = 0; o.walkRate = 0.6; o.lean = 18; o.handF = [132, -300]; o.handB = [108, -286]; o.expr = "angry"; o.footF = [60 + s * 30, 0]; o.footB = [-60 - s * 30, 0]; break;
    }
    case "pull": {
      o.stand = 0; o.walkRate = 0.6; o.lean = -14; o.handF = [120, -270]; o.handB = [92, -258]; o.expr = "angry"; o.hold = prop ? { prop, ang: 0 } : null; o.grip = true; break;
    }
    case "open": {
      const a = win(p, 0, 0.25) * (1 - win(p, 0.75, 1)); o.handF = mv(HANG_F, [118, -226], a); o.grip = a > 0.5; o.lean = 4 * a; o.gaze = [120, -226]; o.handB = HANG_B; break;
    }
    case "lean": { o.lean = -12; o.handF = [18, -230]; o.handB = [-24, -180]; o.footF = [60, 0]; o.expr = "smile"; o.headTilt = -4; break; }
    case "climb": {
      const k = Math.sin(t * 5);
      o.handF = [70 + 0, -470 + k * 40]; o.handB = [34, -470 - k * 40]; o.footF = [40, -60 - k * 50 + 50]; o.footB = [-20, -60 + k * 50 + 50]; o.hipDrop = 0; o.lean = 4; o.grip = true; o.expr = "focused"; break;
    }
    case "throw": {
      const wind = win(p, 0.0, 0.35), rel = win(p, 0.35, 0.5), fin = win(p, 0.5, 0.75);
      o.lean = mix(-12, 14, rel) * (wind > 0 ? 1 : 0); o.handF = mv(mv(HANG_F, [-70, -380], wind), [160, -420], rel); o.handF = mv(o.handF, [120, -300], fin);
      o.handB = mv(HANG_B, [100, -330], wind); o.hold = p < 0.43 ? { prop: prop ?? "ball", ang: -20 } : null; o.expr = "angry"; o.gaze = tg;
      const fp = win(p, 0.43, 1);
      if (p >= 0.43) o.fly = { prop: prop ?? "ball", from: [150, -420], to: [Math.max(300, tg[0]), tg[1]], p: fp };
      o.footF = [40 * rel + 22, 0]; break;
    }
    case "swing": case "stab": case "block": {
      const sw = (Math.sin(t * 5.2) + 1) / 2;
      const weapon = prop ?? "sword";
      if (verb === "swing") { o.handF = mv([70, -480], [150, -190], sw); o.handB = mv([36, -440], [110, -200], sw); o.lean = mix(-10, 22, sw); o.hold = { prop: weapon, ang: mix(-110, 10, sw) }; }
      else if (verb === "stab") { const th = win(Math.sin(t * 4.4) * 0.5 + 0.5, 0.35, 0.8); o.handF = mv([20, -300], [168, -312], th); o.handB = mv([-4, -290], [118, -300], th); o.lean = mix(-4, 16, th); o.hold = { prop: weapon === "sword" ? "spear" : weapon, ang: 0 }; o.footF = [50 + th * 30, 0]; o.footB = [-50, 0]; }
      else { o.handF = [90, -330]; o.handB = [60, -312]; o.hold = { prop: "shield", ang: 0 }; o.lean = -4; o.footF = [44, 0]; o.footB = [-40, 0]; }
      o.grip = true; o.expr = "angry"; break;
    }
    case "shoot": case "aim": {
      const a = win(p, 0, 0.25); const w = prop ?? "bow";
      o.handF = mv(HANG_F, [176, -344], a); o.handB = mv(HANG_B, w === "bow" ? [60, -336] : [126, -332], a); o.hold = { prop: w, ang: 0 }; o.grip = true; o.gaze = tg; o.expr = "focused"; o.footF = [46, 0]; o.footB = [-40, 0]; break;
    }
    case "sit": {
      const a = win(p, 0, 0.18);
      o.hipDrop = 104 * a; o.hipX = -26 * a; o.footF = mv([22, 0], [118, 0], a); o.footB = mv([-20, 0], [84, 0], a);
      o.handF = mv(HANG_F, [92, -130], a); o.handB = mv(HANG_B, [60, -120], a); o.chair = a > 0.02; o.expr = "smile"; o.headTilt = Math.sin(t * 1.5) * 1.5; if (prop) { o.hold = { prop, ang: 0 }; o.handF = [88, -250]; } break;
    }
    case "kneel": { const a = win(p, 0, 0.2); o.hipDrop = 100 * a; o.footF = [100 * a + 22 * (1 - a), 0]; o.footB = [-60 * a - 20 * (1 - a), -2]; o.lean = 12 * a; o.handF = mv(HANG_F, [78, -120], a); o.expr = "sad"; o.headTilt = 8 * a; break; }
    case "lie": case "sleep": {
      const a = win(p, 0, 0.3); o.rot = -88 * a; o.dy = -6 * a; o.dx = 70 * a; o.handF = HANG_F; o.handB = HANG_B; o.expr = verb === "sleep" ? "smile" : "sad"; o.headTilt = 0; break;
    }
    case "fall": {
      const a = win(p, 0.1, 0.55); o.rot = 82 * a; o.dx = -70 * a; o.dy = 0; o.handF = mv(HANG_F, [90, -420], 1 - a * 0.3); o.handB = mv(HANG_B, [-60, -420], 1 - a * 0.3); o.expr = "shock"; break;
    }
    case "jump": {
      const h = Math.max(0, Math.sin(Math.min(1, ((t * 1.6) % 1)) * Math.PI)); o.dy = -h * 110; o.footF = [26, -h * 90]; o.footB = [-24, -h * 60 - 20 * h]; o.handF = [66, -470]; o.handB = [-10, -470]; o.expr = "shock"; break;
    }
    case "row": {
      const k = Math.sin(t * 6) * 0.5 + 0.5, a = win(p, 0, 0.15);
      o.lean = mix(-15, 15, k) * a; o.hipDrop = 10 * a;
      o.handF = mv(HANG_F, [110 + k * 30, -250 - k * 30], a);
      o.handB = mv(HANG_B, [90 + k * 30, -230 - k * 30], a);
      o.hold = { prop: prop ?? "oar", ang: -30 + k * 40 }; o.grip = true; o.expr = "focused"; break;
    }
    case "swim": {
      const sw = Math.sin(t * 8);
      o.rot = -70; o.dy = -30 + sw * 10; o.dx = 20;
      o.handF = [80 + sw * 40, -200 + sw * 20]; o.handB = [40 - sw * 40, -200 - sw * 20];
      o.footF = [30, -40 + sw * 15]; o.footB = [-30, -40 - sw * 15]; o.expr = "joy"; break;
    }
    case "fish": {
      const cast = Math.sin(t * 4) * 0.5 + 0.5, a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [140 - cast * 50, -420 + cast * 100], a);
      o.handB = mv(HANG_B, [90, -260], a);
      o.hold = { prop: prop ?? "fishingRod", ang: -45 + cast * 30 }; o.grip = true; o.expr = "focused"; o.lean = -6; break;
    }
    case "ride": {
      const b = Math.abs(Math.sin(t * 8));
      o.hipDrop = 70; o.hipX = -10; o.dy = -b * 16;
      o.footF = [40, -30 - b * 10]; o.footB = [10, -30 - b * 10];
      o.handF = [90, -240]; o.handB = [50, -220]; o.grip = true; o.expr = "smile"; o.headTilt = b * 3; break;
    }
    case "stretch": {
      const a = win(p, 0, 0.25);
      o.handF = mv(HANG_F, [30, -500], a); o.handB = mv(HANG_B, [-10, -500], a);
      o.lean = -15 * a; o.headTilt = -10 * a; o.expr = "joy"; break;
    }
    case "sneeze": {
      const a = pulse(p, 0, 0.2, 0.7, 1);
      o.lean = 18 * a; o.headTilt = 22 * a; o.handF = mv(HANG_F, [70, -360], a); o.handB = mv(HANG_B, [40, -350], a); o.expr = "shock"; break;
    }
    case "scratchHead": {
      const a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [10 + Math.sin(t * 16) * 8, -460], a);
      o.handB = mv(HANG_B, [30, -240], a);
      o.headTilt = -8 * a; o.expr = "focused"; o.lean = -4; break;
    }
    case "count": {
      const a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [70 + Math.sin(t * 6) * 6, -320], a);
      o.handB = mv(HANG_B, [40, -280], a);
      o.expr = "focused"; o.headTilt = 5; break;
    }
    case "measure": {
      const a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [110, -300], a);
      o.handB = mv(HANG_B, [40, -300], a);
      o.hold = prop ? { prop, ang: 0 } : null; o.grip = true; o.expr = "focused"; o.gaze = [75, -300]; break;
    }
    case "spy": {
      const a = win(p, 0, 0.2);
      o.handF = mv(HANG_F, [60, -420], a);
      o.handB = mv(HANG_B, [30, -250], a);
      o.hold = { prop: prop ?? "spyglass", ang: -10 }; o.grip = true; o.expr = "focused"; o.headTilt = -5; o.gaze = tg; break;
    }
    default: { o.handF = HANG_F; o.handB = HANG_B; break; }
  }
  return o;
};
