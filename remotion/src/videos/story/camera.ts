// Virtual cinematographer (Stickman Studio "Cinematic Camera & Storytelling" spec, docs/CINEMATIC_CAMERA_SKILL.txt).
// A scene is cut into 1-2 segments. Each segment is a list of camera keyframes {u, level, focus, az} interpolated with
// ease-in/ease-out: progressive push-ins through levels (environment > character > upper body > face > eyes), pull-backs
// from detail to context, pans between characters, descends from an elevated view, and a quick reaction push-in + hold.
import * as THREE from "three";
import { SceneDef, CastDef } from "./types";
import { DEFAULT_H, canon } from "./props3d";
import { LOCS, heightAt } from "./realm";

type Lvl = { d: number; h: number; ly: number; fov: number; c: number };
const LV: Record<string, Lvl> = {
  env: { d: 11.5, h: 2.7, ly: 1.1, fov: 42, c: 4 },
  char: { d: 6.4, h: 1.5, ly: 1.2, fov: 40, c: 11 },
  upper: { d: 4.4, h: 1.6, ly: 1.5, fov: 38, c: 14 },
  face: { d: 2.9, h: 1.7, ly: 1.72, fov: 36, c: 16 },
  eyes: { d: 2.0, h: 1.74, ly: 1.76, fov: 33, c: 18 },
  low: { d: 6.0, h: 0.5, ly: 1.75, fov: 46, c: 10 },
  lowface: { d: 3.6, h: 0.7, ly: 1.75, fov: 42, c: 14 },
  high: { d: 10, h: 10.5, ly: 0.3, fov: 48, c: 5 },
  over: { d: 4.0, h: 1.75, ly: 1.45, fov: 38, c: 14 },
  feet: { d: 3.8, h: 0.8, ly: 0.35, fov: 42, c: 12 },
  prop: { d: 3.2, h: 1.3, ly: 0.5, fov: 36, c: 15 },
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
      // Reference-style inserts stay story-connected: when an object is near an actor, frame both
      // instead of cutting to an isolated prop that can read as an empty/meaningless shot.
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

/** Plan the camera for a scene. Mirrored in remotion/scripts/story_audio.py (cut times) - keep in sync. */
/** how many ~2 s sub-shots a scene is cut into by the action camera (mirrored in story_audio.py) */
export const nSub = (dur: number) => Math.max(1, Math.min(6, Math.round(dur / 2.8)));
const GENERIC = new Set(["push", "pull", "reveal", "pan", "descend", "orbit", "hold", undefined]);
/** Reference-paced action camera: fast, varied cuts, but every insert remains attached to a story subject.
 * Props are not blindly cycled as standalone shots (that produced empty tree/bag/terrain inserts in real renders).
 * A prop close-up is requested explicitly through scene.focus and focusOf keeps a nearby actor in the composition. */
const actionSegs = (s: SceneDef, i: number, dur: number): Seg[] => {
  const n = nSub(dur), base = s.az ?? ((i % 2 ? 1 : -1) * (16 + (i * 23) % 36));
  const tgt = s.target ?? s.cast[0].id;
  const others = s.cast.filter((c) => c.id !== tgt).map((c) => c.id);
  const subj: (string | undefined)[] = [tgt, ...others, tgt];
  const segs: Seg[] = [];
  for (let k = 0; k < n; k++) {
    const who = i === 0 && k === 0 && s.shot === "wide" ? undefined : subj[(k + (i % 2)) % subj.length];
    const sw = (k % 2 ? -1 : 1) * (6 + 3 * ((i + k) % 3)), a0 = base * 0.5 + (k % 2 ? 10 : -10)   /* gentle: no spinning */, u0 = k / n, u1 = (k + 1) / n;
    let kfs: KF[];
    // A specifically named story prop gets one motivated insert, never a random object cut.
    const focus = s.focus ? (s.focus.startsWith("@") ? s.focus : "@" + s.focus) : undefined;
    if (focus && k === n - 1) {
      kfs = [{ u: 0, lv: "upper", who: tgt, az: a0 }, { u: 0.62, lv: "prop", who: focus, az: a0 + sw * 0.35 }, { u: 1, lv: "prop", who: focus, az: a0 + sw * 0.45 }];
    } else if (k === 0 && s.shot === "wide") {
      // Establish the street / room / settlement before moving into the story action.
      kfs = [{ u: 0, lv: "env", az: a0 }, { u: 1, lv: "char", who: tgt, az: a0 + sw * 0.25 }];
    } else switch ((k + i) % 5) {
      case 0: kfs = [{ u: 0, lv: "char", who, az: a0 }, { u: 1, lv: "face", who, az: a0 + sw * 0.4 }]; break;
      case 1: kfs = [{ u: 0, lv: "upper", who, az: a0 - sw }, { u: 1, lv: "upper", who, az: a0 + sw }]; break;
      case 2: kfs = [{ u: 0, lv: "face", who, az: a0 }, { u: 1, lv: "env", az: a0 + sw * 0.5 }]; break;
      case 3: kfs = [{ u: 0, lv: "low", who, az: a0 }, { u: 1, lv: "upper", who, az: a0 - sw * 0.4 }]; break;
      default: kfs = [{ u: 0, lv: "high", az: a0 - sw * 0.25 }, { u: 0.55, lv: "env", az: a0 }, { u: 1, lv: "char", who: tgt, az: a0 + sw * 0.2 }];
    }
    segs.push({ u0, u1, ease: "out", kfs });
  }
  return segs;
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
  const base = s.az ?? ((i % 2 ? 1 : -1) * (20 + (i * 31) % 50));
  const focusProp = s.focus 
    ? (s.focus.startsWith("@") ? s.focus : "@" + s.focus) 
    : (s.props?.find((p) => isVehicle(p.name)) ? "@" + s.props.find((p) => isVehicle(p.name))!.name : (s.cast.find((c) => c.mount && isVehicle(c.mount)) ? "@" + s.cast.find((c) => c.mount && isVehicle(c.mount))!.mount : "@car"));
  
  const moveType = VEHICLE_MOVES.has(s.move!) ? s.move! : (["orbitVehicle", "chase", "flyover", "lowAngle", "front"])[i % 5];
  const n = nSub(dur);
  const segs: Seg[] = [];

  for (let k = 0; k < n; k++) {
    const u0 = k / n, u1 = (k + 1) / n;
    const a0 = base + k * 12;
    let kfs: KF[];

    switch (moveType) {
      case "orbitVehicle":
        kfs = [
          { u: 0, lv: "prop", who: focusProp, az: a0 },
          { u: 0.5, lv: "prop", who: focusProp, az: a0 + 18 },
          { u: 1, lv: "prop", who: focusProp, az: a0 + 36 }
        ];
        break;
      case "chase":
        kfs = [
          { u: 0, lv: "prop", who: focusProp, az: a0, lead: -2.5 },
          { u: 0.5, lv: "upper", who: focusProp, az: a0 + 15, lead: -1.5 },
          { u: 1, lv: "prop", who: focusProp, az: a0 - 15, lead: -2 }
        ];
        break;
      case "flyover":
        kfs = [
          { u: 0, lv: "high", who: focusProp, az: a0 },
          { u: 0.5, lv: "env", who: focusProp, az: a0 + 50 },
          { u: 1, lv: "prop", who: focusProp, az: a0 + 100 }
        ];
        break;
      case "lowAngle":
        kfs = [
          { u: 0, lv: "low", who: focusProp, az: a0 - 30 },
          { u: 0.5, lv: "lowface", who: focusProp, az: a0 },
          { u: 1, lv: "prop", who: focusProp, az: a0 + 30 }
        ];
        break;
      case "front":
      default:
        kfs = [
          { u: 0, lv: "prop", who: focusProp, az: a0 + 150 },
          { u: 0.5, lv: "upper", who: focusProp, az: a0 + 175 },
          { u: 1, lv: "prop", who: focusProp, az: a0 + 190 }
        ];
        break;
    }
    segs.push({ u0, u1, ease: "out", kfs });
  }
  return segs;
};

export const segsOf = (s: SceneDef, i: number, dur: number): Seg[] => {
  if (VEHICLE_MOVES.has(s.move!) || isVehicleScene(s)) return vehicleSegs(s, i, dur);
  if (GENERIC.has(s.move) && !(s.cast.find((c) => c.at2 != null && c.expr2) && dur > 1.8) && !s.cast.some((c) => c.to)) return actionSegs(s, i, dur);
  return segsOld(s, i, dur);
};
const segsOld = (s: SceneDef, i: number, dur: number): Seg[] => {
  const base = s.az ?? ((i % 2 ? 1 : -1) * (14 + (i * 23) % 40));
  const tgt = s.target ?? s.cast[0].id, two = s.cast.length > 1, alt = two ? other(s, tgt) : tgt;
  const react = s.cast.find((c) => c.at2 != null && c.expr2);
  if (react && dur > 1.8) {
    // normal push-in up to the beat, then the quick reaction push-in (0.5 s) that lands on the face and holds
    const cut = clamp(react.at2!, 0.3, 0.72), qd = Math.min(0.5 / dur / (1 - cut), 0.6);
    return [
      { u0: 0, u1: cut, kfs: [{ u: 0, lv: s.shot === "wide" ? "env" : "char", who: s.shot === "wide" ? undefined : tgt, az: base }, { u: 1, lv: "upper", who: tgt, az: base * 0.6 }] },
      { u0: cut, u1: 1, ease: "out", kfs: [{ u: 0, lv: "upper", who: react.id, az: base * -0.4 }, { u: qd, lv: "face", who: react.id, az: base * -0.4 }, { u: 1, lv: "eyes", who: react.id, az: base * -0.3 }] },
    ];
  }
  const walker0 = s.cast.find((q) => q.to && q.act === "run") ?? s.cast.find((q) => q.to);
  const mv = s.move ?? (walker0 ? "track" : undefined);
  const walker = s.cast.find((q) => q.to && q.id === tgt) ?? s.cast.find((q) => q.to);
  const prop = s.focus ? (s.focus.startsWith("@") ? s.focus : "@" + s.focus) : undefined;
  if (mv === "track" && walker) {       // side-on tracking shot that rides with the walker, leading the way he is heading
    const dx = walker.to!.x - walker.x, dz = walker.to!.z - walker.z, l = Math.hypot(dx, dz) || 1;
    const az = (Math.atan2(-dz / l, dx / l) * 180) / Math.PI + (s.az ?? 0) * 0.3;
    return [{ u0: 0, u1: 0.55, kfs: [{ u: 0, lv: "char", who: walker.id, az }, { u: 1, lv: "upper", who: walker.id, az: az + 10 }] },
            { u0: 0.55, u1: 1, ease: "out", kfs: [{ u: 0, lv: "upper", who: walker.id, az: az + 10 }, { u: 1, lv: "low", who: walker.id, az: az + 75 }] }];
  }
  if (mv === "crane") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "low", who: tgt, az: base }, { u: 0.5, lv: "char", who: tgt, az: base * 0.5 }, { u: 1, lv: "high", who: tgt, az: base * 0.2 }] }];
  if (mv === "tiltup") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "feet", who: tgt, az: base }, { u: 1, lv: "face", who: tgt, az: base * 0.7 }] }];
  if (mv === "tiltdown") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "face", who: tgt, az: base }, { u: 1, lv: "feet", who: tgt, az: base * 0.7 }] }];
  if (prop && !mv) {                      // the narration is about an object: show who, then glide onto the object itself
    return [{ u0: 0, u1: 0.42, kfs: [{ u: 0, lv: "char", who: tgt, az: base }, { u: 1, lv: "upper", who: tgt, az: base * 0.6 }] },
            { u0: 0.42, u1: 1, ease: "out", kfs: [{ u: 0, lv: "upper", who: tgt, az: base * 0.6 }, { u: 0.55, lv: "prop", who: prop, az: base * -0.3 }, { u: 1, lv: "prop", who: prop, az: base * -0.5 }] }];
  }
  const one = (kfs: KF[]): Seg[] => (dur > 4.6 && !mv
    ? [{ u0: 0, u1: 0.56, kfs }, { u0: 0.56, u1: 1, kfs: [{ u: 0, lv: "upper", who: alt, az: base + 20 }, { u: 1, lv: s.shot === "close" ? "eyes" : "face", who: alt, az: base + 8 }] }]
    : [{ u0: 0, u1: 1, kfs }]);
  if (mv === "hold") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: s.shot === "wide" ? "env" : "upper", who: s.shot === "wide" ? undefined : tgt, az: base }, { u: 1, lv: s.shot === "wide" ? "env" : "upper", who: s.shot === "wide" ? undefined : tgt, az: base + 3 }] }];
  if (mv === "orbit") return [{ u0: 0, u1: 1, kfs: [{ u: 0, lv: "char", who: tgt, az: base - 18 }, { u: 1, lv: "upper", who: tgt, az: base + 18 }] }];
  if (mv === "pan" || (!mv && two && s.shot === "medium"))      // pan from one character to the other, settle closer
    return one([{ u: 0, lv: "char", who: tgt, az: base }, { u: 0.55, lv: "char", who: alt, az: base }, { u: 1, lv: "upper", who: alt, az: base * 0.7 }]);
  if (mv === "descend" || s.shot === "high")                   // elevated view that descends towards the subject
    return one([{ u: 0, lv: "high", az: base }, { u: 0.55, lv: "env", az: base }, { u: 1, lv: "char", who: tgt, az: base * 0.7 }]);
  if (mv === "pull" || (!mv && s.shot === "wide" && i > 0))   // detail-to-context: start on the subject, reveal the place
    return one([{ u: 0, lv: "upper", who: tgt, az: base }, { u: 0.45, lv: "char", who: tgt, az: base }, { u: 1, lv: "env", az: base * 0.6 }]);
  if (mv === "reveal" || (!mv && i === 0))                    // progressive push-in: environment > character > upper body
    return one([{ u: 0, lv: "env", az: base }, { u: 0.5, lv: "char", who: tgt, az: base * 0.8 }, { u: 1, lv: "upper", who: tgt, az: base * 0.5 }]);
  if (s.shot === "close")                                     // slow dramatic push: face to eyes
    return one([{ u: 0, lv: "face", who: tgt, az: base }, { u: 1, lv: "eyes", who: tgt, az: base * 0.7 }]);
  if (s.shot === "low")
    return one([{ u: 0, lv: "low", who: tgt, az: base }, { u: 1, lv: "lowface", who: tgt, az: base * 0.6 }]);
  if (s.shot === "over")
    return one([{ u: 0, lv: "over", who: tgt, az: base }, { u: 1, lv: "over", who: tgt, az: base }]);
  return one([{ u: 0, lv: "char", who: tgt, az: base }, { u: 0.5, lv: "upper", who: tgt, az: base * 0.7 }, { u: 1, lv: "face", who: tgt, az: base * 0.5 }]);
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
  const az = (L(A.az, B.az) * Math.PI) / 180, fov = L(A.fov, B.fov), h = L(A.h, B.h);
  const fx = L(A.x, B.x), fz = L(A.z, B.z);
  const look = new THREE.Vector3(fx, L(A.ly, B.ly), fz);
  const pos = new THREE.Vector3(fx + Math.sin(az) * d, h, fz + Math.cos(az) * d);
  const mixHigh = A.high || B.high;
  if (!mixHigh) look.y -= Math.tan((fov * Math.PI) / 360) * d * 0.2;  // headroom: lift the subject above the caption band
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
