// Virtual cinematographer (Stickman Studio "Cinematic Camera & Storytelling" spec, docs/CINEMATIC_CAMERA_SKILL.txt).
// A scene is cut into 1-2 segments. Each segment is a list of camera keyframes {u, level, focus, az} interpolated with
// ease-in/ease-out: progressive push-ins through levels (environment > character > upper body > face > eyes), pull-backs
// from detail to context, pans between characters, descends from an elevated view, and a quick reaction push-in + hold.
import * as THREE from "three";
import { SceneDef, CastDef } from "./types";
import { DEFAULT_H, canon } from "./props3d";
import { LOCS } from "./realm";

type Lvl = { d: number; h: number; ly: number; fov: number; c: number };
const LV: Record<string, Lvl> = {   // tuned against docs/reference/reference-video.mp4: eye-level camera, subject 45-55 % of frame height in mediums, 75-90 % in close-ups
  env: { d: 8.2, h: 1.9, ly: 1.2, fov: 42, c: 0 },
  char: { d: 4.6, h: 1.35, ly: 0.9, fov: 40, c: 0 },
  upper: { d: 2.9, h: 1.55, ly: 1.35, fov: 38, c: 10 },
  face: { d: 2.0, h: 1.65, ly: 1.62, fov: 36, c: 12 },
  eyes: { d: 1.45, h: 1.7, ly: 1.68, fov: 33, c: 14 },
  low: { d: 4.6, h: 1.35, ly: 0.9, fov: 40, c: 0 },         // low-angle shots removed: they looked up at chins/ceilings
  lowface: { d: 2.0, h: 1.65, ly: 1.62, fov: 36, c: 12 },
  high: { d: 9, h: 8.5, ly: 0.3, fov: 48, c: 0 },
  over: { d: 3.2, h: 1.7, ly: 1.4, fov: 38, c: 0 },
  feet: { d: 4.6, h: 1.35, ly: 0.9, fov: 40, c: 0 },        // floor/feet shots removed: they only showed ground
  prop: { d: 2.6, h: 1.3, ly: 0.7, fov: 36, c: 0 },
};
export type Cam = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number; cInf: number };
type KF = { u: number; lv: string; who?: string; az: number; lead?: number };   // who = cast id, undefined = group centre
type Seg = { u0: number; u1: number; kfs: KF[]; ease?: "io" | "out" };

const sm = (t: number) => t * t * (3 - 2 * t);                    // ease in/out
const out = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);        // fast start, gentle settle (reaction push-in)
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export const focusOf = (s: SceneDef, who?: string): { x: number; z: number; spread: number; tgt?: CastDef; y?: number; size?: number } => {
  if (who && who.startsWith("@")) {   // a prop: the camera points at the object itself
    const nm = who.slice(1).toLowerCase(), ps = s.props ?? [];   // exact, then fuzzy (planner may write "tree1" or "coins"), then the first prop
    const hd = s.cast.find((q) => q.hold && q.hold.toLowerCase() === nm);   // an item someone is carrying: follow the carrier live
    if (hd && !ps.find((q) => q.name === nm)) return { x: hd.x, z: hd.z, spread: 0, y: 0.95, size: 0.5 };
    const pd = ps.find((q) => q.name === nm) ?? ps.find((q) => q.name.includes(nm) || nm.includes(q.name)) ?? ps.find((q) => nm.replace(/[0-9]/g, "") && q.name.includes(nm.replace(/[0-9]/g, ""))) ?? ps[0];
    if (pd) {
      const hh = pd.h ?? DEFAULT_H[canon(pd.name)] ?? 1;
      const near = s.cast.map((c) => ({ c, d: Math.hypot(c.x - pd.x, c.z - pd.z) }))
        .sort((a, b) => a.d - b.d)[0];
      if (near && near.d <= 5.5) return {
        x: (pd.x + near.c.x) * 0.5, z: (pd.z + near.c.z) * 0.5,
        spread: near.d, tgt: near.c, y: (pd.y ?? 0) + hh * 0.5, size: hh,
      };
      return { x: pd.x, z: pd.z, spread: 0, y: (pd.y ?? 0) + hh * 0.5, size: hh };
    }
  }
  const t = s.cast.find((c) => c.id === who);
  const xs = s.cast.map((c) => c.x), zs = s.cast.map((c) => c.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const spread = Math.max(...xs) - Math.min(...xs);
  return t ? { x: t.x, z: t.z, spread, tgt: t } : { x: cx, z: cz, spread };
};

const other = (s: SceneDef, id?: string) => s.cast.find((c) => c.id !== id)?.id ?? id;

export type WordTiming = { w: string; t0: number; t1: number };

export const subShotsFromNarration = (s: SceneDef, dur: number): Seg[] => {
  const base = s.az ?? 0;
  const tgt = s.target ?? s.cast[0]?.id ?? s.cast[0]?.id;
  const focus = s.focus ? (s.focus.startsWith("@") ? s.focus : "@" + s.focus) : undefined;

  // If scene has pre-defined shots (per-shot sequence), use them; otherwise fall back to word-based segmentation
  const raw = (s as any).shots as Array<{ shot?: string; move?: string; dur?: number; focus?: string }> | undefined;
  if (raw && raw.length > 0) {
    const adjustedShots = raw.map((sh) => ({
      ...sh,
      dur: Math.max(2.2, (sh.dur || 2.5) * 1.6)
    }));
    const total = adjustedShots.reduce((a, b) => a + (b.dur || 2.5), 0) || dur;
    let acc = 0;
    const cuts = adjustedShots.map((sh) => {
      const u0 = acc / total;
      acc += (sh.dur || 2.5);
      return { u0, sh };
    });
    (cuts as any[]).push({ u0: 1, sh: null });  // final cut

    const segs: Seg[] = [];
    for (let k = 0; k < cuts.length - 1; k++) {
      const sh = cuts[k].sh;
      if (!sh) continue;
      const u0 = cuts[k].u0;
      const u1 = cuts[k + 1].u0;
      let lv0 = "char", lv1 = "face";
      if (sh.shot === "wide") { lv0 = "env"; lv1 = "char"; }
      else if (sh.shot === "medium") { lv0 = "char"; lv1 = "upper"; }
      else if (sh.shot === "close") { lv0 = "upper"; lv1 = "face"; }
      else if (sh.shot === "low") { lv0 = "low"; lv1 = "lowface"; }
      else if (sh.shot === "high") { lv0 = "high"; lv1 = "high"; }
      else if (sh.shot === "over") { lv0 = "over"; lv1 = "char"; }

      // Determine who (cast or prop)
      const who = (sh.focus && sh.focus.startsWith("@")) ? s.target : s.cast.find((c) => c.id === sh.focus)?.id ?? tgt;
      // Determine camera azimuth (drift limited to 8° per shot)
      const az0 = base + Math.max(-4, Math.min(4, (k % 2 ? 2 : -2)));
      const az1 = base + Math.max(-4, Math.min(4, (k % 2 ? -2 : 2)));

      let kfs: KF[];
      // Handle special move types with longer holds on face/prop (push/pull durations x1.6, slower moves)
      if (sh.move === "pull") {
        kfs = [
          { u: 0, lv: lv1, who, az: az0 },
          { u: 0.25, lv: lv1, who, az: az0 },
          { u: 1, lv: lv0, who, az: az1 }
        ];
      } else if (sh.move === "hold") {
        kfs = [
          { u: 0, lv: lv0, who, az: az0 },
          { u: 0.25, lv: lv1, who, az: az0 },
          { u: 1, lv: lv1, who, az: az1 }
        ];
      } else {
        kfs = [
          { u: 0, lv: lv0, who, az: az0 },
          { u: 0.3, lv: lv1, who, az: az0 },
          { u: 1, lv: lv1, who, az: az1 }
        ];
      }

      segs.push({ u0, u1, ease: "out", kfs });
    }

    return segs.length > 0 ? segs : [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "char", who: tgt, az: base }, { u: 0.3, lv: "face", who: tgt, az: base }, { u: 1, lv: "face", who: tgt, az: base }] }];
  }

  // Fallback: word-based segmentation (min shot length 2.2 s, no more than one move per 2.5 s)
  const words: WordTiming[] | undefined = (s as any).words;
  const rawBeats: number[] = [];

  if (words && words.length > 0) {
    for (let i = 0; i < words.length; i += 8) {
      const t = words[Math.min(i, words.length - 1)].t0;
      if (t > 0 && t < dur) rawBeats.push(t);
    }
  } else if (s.narration) {
    const textWords = s.narration.split(/\s+/).filter(Boolean);
    const timePerWord = Math.min(0.5, dur / Math.max(1, textWords.length));
    for (let i = 8; i < textWords.length; i += 8) {
      const t = i * timePerWord;
      if (t < dur) rawBeats.push(t);
    }
  }

  const minInterval = 2.5;
  const filteredBeats: number[] = [];
  let lastT = 0;
  for (const t of rawBeats) {
    if (t - lastT >= minInterval && dur - t >= 2.2) {
      filteredBeats.push(t);
      lastT = t;
    }
  }
  const beatTimes = filteredBeats.map(t => t / dur);

  const cuts = [0, ...beatTimes, 1];
  const segs: Seg[] = [];

  for (let k = 0; k < cuts.length - 1; k++) {
    const u0 = cuts[k];
    const u1 = cuts[k + 1];
    // Azimuth drift <= 8 degrees per shot (max +/- 4 deg drift from base)
    const az0 = base + Math.max(-4, Math.min(4, (k % 2 ? 2 : -2)));
    const az1 = base + Math.max(-4, Math.min(4, (k % 2 ? -2 : 2)));

    let kfs: KF[];
    const who = s.cast[k % s.cast.length]?.id ?? tgt;

    if (focus && k === cuts.length - 2) {
      kfs = [
        { u: 0, lv: "upper", who: tgt, az: az0 },
        { u: 0.3, lv: "prop", who: focus, az: az0 },
        { u: 1, lv: "prop", who: focus, az: az1 }
      ];
    } else if (k === 0 && s.shot === "wide") {
      kfs = [
        { u: 0, lv: "env", az: az0 },
        { u: 0.3, lv: "char", who: tgt, az: az0 },
        { u: 1, lv: "char", who: tgt, az: az1 }
      ];
    } else if (k % 2 === 1 && s.cast.length > 1) {
      const reactWho = s.cast.find((c) => c.id !== who)?.id ?? who;
      kfs = [
        { u: 0, lv: "upper", who: who, az: az0 },
        { u: 0.25, lv: "face", who: reactWho, az: az0 },
        { u: 1, lv: "face", who: reactWho, az: az1 }
      ];
    } else {
      kfs = [
        { u: 0, lv: "char", who, az: az0 },
        { u: 0.3, lv: "face", who, az: az1 },
        { u: 1, lv: "face", who, az: az1 }
      ];
    }

    segs.push({ u0, u1, ease: "out", kfs });
  }

  return segs.length > 0 ? segs : [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "char", who: tgt, az: base }, { u: 0.3, lv: "face", who: tgt, az: base }, { u: 1, lv: "face", who: tgt, az: base }] }];
};

const VEHICLES = new Set([
  "car", "oldcar", "policecar", "taxi", "truck", "bus", "tractor", "motorbike", "bicycle",
  "train", "plane", "jet", "helicopter", "rocket", "ufo", "balloon", "sailboat", "steamship",
  "submarine", "chariot", "wagon", "tank", "canoe", "scooter", "firetruck", "ambulance",
  "pirateship", "ship", "boat", "cart", "sedan", "suv", "van", "racecar", "sportscar",
  "monstertruck", "kart", "tram", "garbagetruck", "delivery", "spaceship", "spacecar",
  "miner", "ghostship", "galleon", "romanship", "vikinglongship", "horse", "camel", "elephant",
  "automobile", "vehicle", "jeep", "pickup", "lorry", "cab", "locomotive", "subway", "streetcar",
  "vessel", "yacht", "ferry", "cruiseship", "steamer", "uboat", "rowboat", "stagecoach",
  "carriage", "motorcycle", "bike", "fireengine", "racingcar", "shuttle"
]);

export const isVehicle = (focusName?: string): boolean => {
  if (!focusName) return false;
  const clean = focusName.replace(/^@/, "").toLowerCase().trim();
  if (VEHICLES.has(clean)) return true;
  for (const v of VEHICLES) {
    if (clean.includes(v) || v.includes(clean)) return true;
  }
  return false;
};

export const isVehicleScene = (s: SceneDef): boolean => {
  if (s.focus && isVehicle(s.focus)) return true;
  if (s.cast.some((c) => c.mount && isVehicle(c.mount))) return true;
  if (s.props && s.props.some((p) => isVehicle(p.name))) return true;
  return false;
};

const VEHICLE_MOVES = new Set(["orbitVehicle", "chase", "flyover", "lowAngle", "front"]);

const vehicleSegs = (s: SceneDef, i: number, dur: number): Seg[] => {
  const base = s.az ?? 0;
  const focusProp = s.focus 
    ? (s.focus.startsWith("@") ? s.focus : "@" + s.focus) 
    : (s.props?.find((p) => isVehicle(p.name)) ? "@" + s.props.find((p) => isVehicle(p.name))!.name : (s.cast.find((c) => c.mount && isVehicle(c.mount)) ? "@" + s.cast.find((c) => c.mount && isVehicle(c.mount))!.mount : "@car"));
  
  const moveType = VEHICLE_MOVES.has(s.move!) ? s.move! : "front";
  const segs: Seg[] = [];
  const a0 = base;
  const kfs: KF[] = [
    { u: 0, lv: "prop", who: focusProp, az: a0 },
    { u: 0.5, lv: "upper", who: focusProp, az: a0 + 2 },
    { u: 1, lv: "prop", who: focusProp, az: a0 + 4 }
  ];
  segs.push({ u0: 0, u1: 1, ease: "out", kfs });
  return segs;
};

export const segsOf = (s: SceneDef, i: number, dur: number): Seg[] => {
  if (VEHICLE_MOVES.has(s.move!) || isVehicleScene(s)) return vehicleSegs(s, i, dur);
  return subShotsFromNarration(s, dur);
};

const pose = (s: SceneDef, kf: KF) => {
  const L = LV[kf.lv], F = focusOf(s, kf.who);
  const sp = Math.max(1, (F.spread + 1.2) / (kf.lv === "env" ? 7 : 2.4));
  const wide = kf.lv === "env" || kf.lv === "char" || kf.lv === "high";
  const sc = F.tgt?.scale ?? 1;
  const onProp = F.y !== undefined;
  const mnt = (F.tgt ? F.tgt.mount : s.cast.find((q) => q.mount)?.mount), mm = mnt ? Math.max(2.1, (DEFAULT_H[canon(mnt)] ?? 1.5) * 1.5) : 1;   // riders on horses/vehicles are big: pull back
  const d0 = onProp
    ? Math.max(3.4, (F.size ?? 1) * 2.4, Math.min(8, F.spread * 1.35))
    : L.d * mm * (wide && !kf.who ? sp : 1);
  return { d: d0, h: onProp && !F.tgt ? Math.max(0.7, F.y! * 0.9 + 0.4) : L.h * (kf.lv === "high" ? 1 : sc) * (mm > 1 ? 1.5 : 1), ly: onProp && !F.tgt ? F.y! : L.ly * sc * (mm > 1 ? 1.7 : 1), fov: L.fov, c: L.c, az: kf.az, x: F.x + (kf.lead ?? 0) * Math.sin(kf.az * 0), z: F.z, high: kf.lv === "high" };
};

export const camAt = (s: SceneDef, i: number, u: number, t: number, dur = 3): Cam => {
  if (s.est || s.front) {   // establishing shot: a steady, slowly pushing frame that shows the whole building (shop front with its sign, palace gate, mine / cave mouth)
    const k = u * u * (3 - 2 * u), shop = !!s.front;
    return { pos: new THREE.Vector3(Math.sin(t * 0.6) * 0.3, (shop ? 3.4 : 4.6) - 0.6 * k, (shop ? 12 : 17) - (shop ? 3 : 4) * k), look: new THREE.Vector3(0, shop ? 4.2 : 7, shop ? -14 : -28), fov: shop ? 52 : 54, roll: 0, cInf: 0 };
  }
  if (s.world?.mapMode) {   // true overhead view: map geography fills the vertical canvas
    return { pos: new THREE.Vector3(0, 150, -24), look: new THREE.Vector3(0, 0, -24), fov: 52, roll: 0, cInf: 0 };
  }
  if (s.world) {   // Establish the settlement, then descend into its streets and human activity.
    const F = focusOf(s, s.target ?? s.cast[0]?.id);
    const multi = s.cast.length > 1;
    const k = s.move === "hold" ? 0.55 : 1 - sm(clamp(u / (multi ? 0.72 : 1.05)));
    const y = multi ? 7 + 11 * k : 8.5 + 19 * k;
    const z = multi ? 12 + 18 * k : 14 + 27 * k;
    const lookZ = multi ? -20 - 5 * k : -22 - 8 * k;
    return {
      pos: new THREE.Vector3(F.x * 0.15 + Math.sin(u * Math.PI) * 3, y, F.z + z),
      look: new THREE.Vector3(F.x * 0.08, 1.1, lookZ),
      fov: 48 + 4 * k, roll: 0, cInf: 0,
    };
  }
  if (s.fly) {   // sky flight between two places of the realm: the world slides under a high camera looking along the route
    const A = LOCS[s.fly.from] ?? LOCS.town, Bq = LOCS[s.fly.to] ?? A, dx = Bq[0] - A[0], dz = Bq[1] - A[1], l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l, k = u * u * (3 - 2 * u);
    return { pos: new THREE.Vector3(-ux * 60 + uz * 25 * (1 - k), 95 - 55 * k, -uz * 60 - ux * 25 * (1 - k)), look: new THREE.Vector3(ux * 260, 8 + 20 * k, uz * 260), fov: 62 - 14 * k, roll: 0, cInf: 0 };
  }
  const segs = segsOf(s, i, dur);
  const g = segs.find((x) => u < x.u1) ?? segs[segs.length - 1];
  const lu = clamp((u - g.u0) / Math.max(1e-4, g.u1 - g.u0));
  const k = g.kfs;
  let a = k[0], b = k[k.length - 1], f = 1;
  for (let j = 0; j < k.length - 1; j++) if (lu <= k[j + 1].u) { a = k[j]; b = k[j + 1]; f = clamp((lu - k[j].u) / Math.max(1e-4, k[j + 1].u - k[j].u)); break; }
  const e = g.ease === "out" && a === k[0] ? out(f) : sm(f);
  const A = pose(s, a), B = pose(s, b);
  const L = (p: number, q: number) => p + (q - p) * e;
  const d = Math.exp(L(Math.log(A.d), Math.log(B.d)));            // distance interpolates geometrically: feels like a constant-speed dolly
  const az = (Math.max(-55, Math.min(55, L(A.az, B.az) * 0.35)) * Math.PI) / 180,   /* owner: no spinning: all azimuth damped to 35 %, max 55 deg */ fov = L(A.fov, B.fov), h = L(A.h, B.h);
  const fx = L(A.x, B.x), fz = L(A.z, B.z);
  const look = new THREE.Vector3(fx, L(A.ly, B.ly), fz);
  const pos = new THREE.Vector3(fx + Math.sin(az) * d, h, fz + Math.cos(az) * d);
  const mixHigh = A.high || B.high;
  if (!mixHigh && a.lv !== "char") look.y -= Math.tan((fov * Math.PI) / 360) * d * 0.2;  // headroom: lift the subject above the caption band
  const over = a.lv === "over" && s.cast.length > 1;
  if (over) {
    const tg = focusOf(s, a.who), ot = s.cast.find((c) => c.id !== a.who) ?? s.cast[0];
    const dx = tg.x - ot.x, dz = tg.z - ot.z, l = Math.hypot(dx, dz) || 1;
    pos.set(ot.x - (dx / l) * 1.3 + (dz / l) * 0.45, LV.over.h, ot.z - (dz / l) * 1.3 - (dx / l) * 0.45);
    pos.addScaledVector(new THREE.Vector3(-dx / l, 0, -dz / l), -0.4 * lu);
  }
  pos.x += Math.sin(t * 1.3 + i) * 0.025; pos.y += Math.sin(t * 1.7 + i * 2) * 0.015;
  const roll = (((s.roll ?? 0) * Math.PI) / 180) * sm(lu);
  return { pos, look, fov, roll, cInf: L(A.c, B.c) };
};
