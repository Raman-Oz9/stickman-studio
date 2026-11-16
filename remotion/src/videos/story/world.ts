// StoryWorld: a village plaza ringed by houses and trees, plus the cast of one storyboard scene. Re-uses the Bridge look
// (sky, two-tone shading, lit character cards, contact blobs). update(scene, i, localFrame) poses it for one frame.
import * as THREE from "three";
import { Batch, house, prop, lam, Kit, V, quad } from "../bridge/build";
import { grassHD, cobbleHD } from "../bridge/paint";
import { LIGHTS, LOOK } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, person, blob, lidAt, setLight, Who, Stage, CamInfo, FPS } from "../bridge/cast";
import { FrontOpts, SideOpts, Expr } from "../bridge/toon";
import { SceneDef, CastDef, PropDef } from "./types";
import { STICKERS } from "../bridge/stickers";
import { createAction, updateAction, handTarget, propBase, ballistic, Action, ActionType } from "./actions";
import { FOGB, Biome, Season } from "./terrain";
import { buildRealm, realmWaves, anchorAt, resolveLoc, LOCS } from "./realm";
const KINDB: Record<string, Biome> = { forest: "forest", desert: "desert", savanna: "savanna", swamp: "swamp", jungle: "jungle", ice: "ice", ocean: "ocean", farm: "farm", mountain: "mountain", palace: "farm", city: "farm", mine: "mountain", cave: "mountain" };
import { buildShopFront } from "./interiors";
import { buildInterior, flicker, INTERIOR_ALIAS, DIM, FOG, InteriorKind } from "./interiors";
import { Rigs } from "./rig3d";
import { BACK, Props3D, canon, DEFAULT_H, ORIENT, SADDLE, FLY, GUNS, registerRecipes, Recipe, CLOSED, MELEE } from "./props3d";
import { outfitFor } from "./outfits";
import { camAt, focusOf } from "./camera";
import { Effects } from "./effects";
import { drawWorld, animateWorld } from "./worldgen";

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const ROLE_SCALE: Record<string, number> = { kid: 0.72, girl: 0.74 };

export class StoryWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private p3: Props3D; private rigs!: Rigs; private hv = new THREE.Vector3();
  private worldLayers = new Map<string, THREE.Group>(); private ints = new Map<string, THREE.Group>(); private acts = new Map<string, Action>(); private realms = new Map<string, THREE.Group>(); private fronts = new Map<string, THREE.Group>(); private holder = new THREE.Group(); private fxe: Effects; private town: THREE.Object3D[] = []; private plat: THREE.Mesh;
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private sunCache = new Map<number, THREE.Vector3>();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit, models?: Record<string, Recipe>) {
    const R = this.root;
    registerRecipes(models); this.p3 = new Props3D(R, kit); this.rigs = new Rigs(R, kit); this.fxe = new Effects(R);
    this.plat = new THREE.Mesh(new THREE.CircleGeometry(15, 40), new THREE.MeshLambertMaterial({ color: "#6d5d86" })); this.plat.rotation.x = -Math.PI / 2; this.plat.position.y = 0.01; this.plat.receiveShadow = true; this.plat.visible = false; R.add(this.plat);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.sky, this.hemi, this.sun, this.sun.target);

    const b = new Batch();
    const grass = lam("grassHD", () => ({ map: grassHD() })), cob = lam("cobbleHD", () => ({ map: cobbleHD() }));
    const flat = (x0: number, x1: number, z0: number, z1: number, y: number, u: number, v: number) => quad(V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0), u, v);
    b.add(flat(-600, 600, -600, 600, 0, 300, 300), grass);
    b.add(flat(-13, 13, -13, 13, 0.02, 7, 7), cob);
    // ring of houses facing the plaza, two depths, plus a gap-filling second ring of trees
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2 + 0.2, r = 21 + hh(k) * 4;
      const w = 7 + Math.floor(hh(k, 1) * 4), d = 6 + Math.floor(hh(k, 2) * 3), h = 4.2 + Math.floor(hh(k, 3) * 3) * 1.4;
      house(b, Math.sin(a) * r, Math.cos(a) * r, a + Math.PI, w, d, h, k + 1, 0);
    }
    for (let k = 0; k < 22; k++) {
      const a = (k / 22) * Math.PI * 2 + hh(k, 4), r = 16 + hh(k, 5) * 3;
      prop(b, kit, k % 3 ? "tree_oak" : "tree_default", Math.sin(a) * r, 0, Math.cos(a) * r, 5.5 + hh(k, 6) * 2.5, hh(k, 7) * 6);
    }
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2 + hh(k, 8), r = 34 + hh(k, 9) * 40;
      prop(b, kit, k % 2 ? "tree_cone" : "tree-high-round", Math.sin(a) * r, 0, Math.cos(a) * r, 7 + hh(k, 10) * 5, hh(k, 11) * 6);
    }
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + 0.5, r = 12.2;
      prop(b, kit, k % 3 === 0 ? "lantern" : k % 3 === 1 ? "plant_bushLarge" : "stall-red", Math.sin(a) * r, 0, Math.cos(a) * r, k % 3 === 0 ? 3.0 : k % 3 === 1 ? 1.1 : 2.6, a + Math.PI);
    }
    prop(b, kit, "windmill", 40, 0, -60, 22, 0.4);
    const n0 = R.children.length; b.build(R); this.town = R.children.slice(n0); R.add(this.holder); this.town.forEach((o) => this.holder.add(o));
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose everything for scene `s` (index i) at local frame lf of n; returns the camera focus point */
  update(s: SceneDef, i: number, lf: number, n: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene, absT: number) {
    const light = s.light ?? (s.tod === "dawn" || s.tod === "dusk" ? "golden" : "day"), L = LIGHTS[light], K = LOOK[light];
    const u = n > 1 ? lf / (n - 1) : 0, t = lf / FPS;
    const dur = n / FPS;
    // Optional world preset is an independent environment layer; character/action code below is unchanged.
    const worldKey = s.world ? JSON.stringify(s.world) : "";
    this.worldLayers.forEach((g, key) => { g.visible = !!worldKey && key === worldKey; if (g.visible) animateWorld(g, absT); });
    if (worldKey) { let wg = this.worldLayers.get(worldKey); if (!wg) { wg = drawWorld(s.world!, 0); this.root.add(wg); this.worldLayers.set(worldKey, wg); } wg.visible = true; animateWorld(wg, absT); }
    const posOf = (d: CastDef) => {
      if (!d.to) return { x: d.x, z: d.z, moving: false, dist: 0, dx: 0, dz: 0 };
      const w0 = d.walkAt ?? 0, k = Math.min(1, Math.max(0, (u - w0) / Math.max(0.05, 0.96 - w0))), e = d.act === "run" ? (k < 0.08 ? k * k / 0.16 : k - 0.04) / 0.96 : k * k * (3 - 2 * k);   // sprints keep full speed (no slow ease)
      const L = Math.hypot(d.to.x - d.x, d.to.z - d.z);
      return { x: d.x + (d.to.x - d.x) * e, z: d.z + (d.to.z - d.z) * e, moving: k > 0.001 && k < 0.999, dist: L * e, dx: d.to.x - d.x, dz: d.to.z - d.z };
    };
    const propAt = (pd: PropDef) => { if (!pd.to) return { x: pd.x, z: pd.z }; const a0 = pd.at ?? 0, k = Math.min(1, Math.max(0, (u - a0) / Math.max(0.05, Math.min(pd.until ?? 1, 1) - a0))); return { x: pd.x + (pd.to.x - pd.x) * k, z: pd.z + (pd.to.z - pd.z) * k }; };
    const cur: SceneDef = { ...s, cast: s.cast.map((d) => { const p = posOf(d); return { ...d, x: p.x, z: p.z }; }), props: (s.props ?? []).map((pd) => ({ ...pd, ...propAt(pd), to: undefined })) };
    const c = camAt(cur, i, u, absT, dur);
    { const ev = new Set<string>(((cur as SceneDef).env ?? []) as string[]); if (s.world?.weather === "rain") ev.add("rain"); if (s.world?.weather === "storm") ev.add("storm"); if (s.world?.weather === "snow") ev.add("snow"); if (s.world?.weather === "fog") ev.add("fog"); if (s.world?.weather === "wind") ev.add("wind"); if (s.tod === "night") ev.add("night"); if (s.season === "winter" && BIOMES[String(s.biome ?? "").toLowerCase()] !== "desert") ev.add("snow"); (cur as SceneDef).env = [...ev] as SceneDef["env"]; }
    const E = this.fxe.update(cur, u, dur, c.pos, c.look, absT);
    if (E.shake > 0.01) { const k = E.shake * 0.28; c.pos.x += Math.sin(absT * 61) * k; c.pos.y += Math.sin(absT * 73 + 1) * k; c.look.x += Math.sin(absT * 53 + 2) * k * 0.6; }
    const ik = INTERIOR_ALIAS[String(s.interior ?? "").toLowerCase().replace(/[^a-z]/g, "")] as InteriorKind | undefined;
    const ikey = ik === "shop" ? "shop:" + (s.shop ?? "shop") : ik;
    if (ik && ikey && !this.ints.has(ikey)) { const g = buildInterior(ik, s.shop ?? "shop"); g.visible = false; this.root.add(g); this.ints.set(ikey, g); }
    this.ints.forEach((g, k) => { g.visible = k === ikey; if (k === ikey) flicker(g, absT); });
    if (ik) E.dim = Math.min(E.dim, DIM[ik]);
    const loc = resolveLoc(s), se = ((s.season ?? "summer") as Season), fly = (s as SceneDef & { fly?: { from: string; to: string } }).fly;
    if (!this.realms.has(se)) { const Rl = buildRealm(se); Rl.visible = false; this.holder.add(Rl); this.realms.set(se, Rl); }
    this.realms.forEach((Rl, k) => { Rl.visible = k === se; if (k === se) realmWaves(Rl, absT); });
    const [ax, az] = fly ? anchorAt(fly.from, fly.to, u) : (LOCS[loc] as [number, number]);
    this.holder.position.set(-ax, 0, -az); this.holder.visible = !ik && !E.space && !s.world?.mapMode;
    const bk = loc !== "town" || !!fly ? (KINDB[loc] ?? "farm") : undefined;
    this.plat.visible = E.space && !ik;
    if (s.front && !this.fronts.has(s.front)) { const fg = buildShopFront(s.front); fg.position.set(0, 0, -14); this.root.add(fg); this.fronts.set(s.front, fg); }
    this.fronts.forEach((fg, k) => { fg.visible = k === s.front && !ik; });
    cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.15; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // sun: camera-relative, frozen per scene (from the start of the move)
    let sd = this.sunCache.get(i * 10 + (light === "day" ? 0 : 1));
    if (!sd) {
      const c0 = camAt(s, i, 0, 0, n / FPS);
      let fx = c0.look.x - c0.pos.x, fz = c0.look.z - c0.pos.z; const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l;
      const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
      const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
      sd = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
      this.sunCache.set(i * 10 + (light === "day" ? 0 : 1), sd);
    }
    setLight(light, sd);
    const focus = c.look.clone(), dist = cam.position.distanceTo(focus);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    this.hemi.intensity = L.hemiI * E.dim + E.flash * 3.2; this.sun.intensity = L.sunI * E.dim + E.flash * 9;
    if (E.night) { this.hemi.color.set("#7a8cff"); this.hemi.groundColor.set("#2a2f5a"); this.sun.color.set("#a8b8ff"); }
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 60);
    this.sun.position.copy(focus).addScaledVector(sd, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    TONE.uLitCol.value.multiplyScalar(Math.max(0.5, E.dim)); TONE.uShadeCol.value.multiplyScalar(Math.max(0.55, E.dim));
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, k) => untone(h, su["c" + k].value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    if (E.night) { for (let k = 0; k < 5; k++) { const cv = su["c" + k].value as THREE.Color; cv.multiplyScalar(E.space ? 0.02 : 0.16).lerp(new THREE.Color(E.space ? "#020410" : "#0b1236"), 0.55); } }
    else if (E.dim < 0.95) for (let k = 0; k < 5; k++) (su["c" + k].value as THREE.Color).multiplyScalar(E.dim * 0.8).lerp(new THREE.Color("#4a5468"), 0.35);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; if (E.night) this.fog.color.set(E.space ? "#020410" : "#0b1236"); else if (E.dim < 0.95) this.fog.color.lerp(new THREE.Color("#4a5468"), 0.5); this.fog.near *= E.fogK; this.fog.far *= E.fogK; scene.fog = this.fog; scene.background = null;
    if (bk && !ik) { this.fog.color.set(FOGB[bk]); this.fog.near = bk === "swamp" ? 25 : 120; this.fog.far = bk === "swamp" ? 260 : 1700; }
    if (ik) { this.fog.color.set(FOG[ik]); this.fog.near = 18; this.fog.far = 80; }

    // ---- cast ----
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const ci: CamInfo = { pos: cam.position, right, sun: sd };
    const st: Stage = { places: [], fx: [] };
    this.p3.begin(); this.rigs.begin();
    if (ik === "shop" && ikey) {   // the shop's goods: real 3D items filling the shelves and counter
      const slots = (this.ints.get(ikey)!.userData.slots ?? []) as number[][], stock = (s.stock ?? []).filter((n) => this.p3.has(n));
      if (stock.length) slots.forEach((q, j) => { const nm = stock[(j * 7 + Math.floor(j / 3)) % stock.length], hc = canon(nm), hh = Math.min(0.9, (DEFAULT_H[hc] ?? 0.4) * 0.9); this.p3.put(nm, q[0], q[1], q[2], Math.max(0.25, hh), 1, 0.4 * Math.sin(j), 0); });
    }

    const put = (d: CastDef, idx: number, extra: boolean) => {
      const o = outfitFor(d.role, d.v ?? idx, s.era), who: Who = { i: idx + (extra ? 300 : 0), o, okey: `${d.role}${d.v ?? idx}${s.era ?? ""}` };
      const sc2 = d.scale ?? ROLE_SCALE[d.role] ?? 1;
      const swapT = d.at2 != null ? d.at2 * n / FPS : 1e9;
      const expr: Expr = (d.expr2 && t >= swapT ? d.expr2 : d.expr) ?? "neutral";
      let look = 0;
      if (d.look === "left") look = -1; else if (d.look === "right") look = 1;
      else if (d.look === "partner") {
        const o2 = s.cast.find((q2) => q2.id !== d.id);
        if (o2) look = (o2.x - d.x) * right.x + (o2.z - d.z) * right.z > 0 ? 1 : -1;
      }
      const pp = posOf(d), mode = d.mode === "sit" ? "sit" : "stand";
      const bob = extra ? 0 : 0.012 * Math.sin(absT * 2.1 + idx);
      const has3 = !!d.hold && this.p3.has(d.hold), holdOn = d.hold && u >= (d.holdAt ?? 0) && u < (d.holdUntil ?? 2) && (has3 || STICKERS.has(d.hold));
      const lat = pp.moving ? (pp.dx * right.x + pp.dz * right.z) / (Math.hypot(pp.dx, pp.dz) || 1) : 0;
      const side = pp.moving && Math.abs(lat) > 0.5, mirror = lat < 0;
      const phase = pp.dist / 1.5;
      const fo: FrontOpts = { mode: pp.moving ? "stroll" : mode, phase: pp.moving ? phase : 0, expr, look: side ? 0 : look, blink: lidAt(t, idx + (extra ? 300 : 0), d.at2 != null ? [swapT] : []),
        headTilt: extra ? 0 : Math.round(4 * Math.sin(absT * 0.9 + idx)), prop: holdOn ? { held: d.hold!, s: 150 } : null };
      if (d.act === "wave" && !holdOn) fo.wave = Math.sin(absT * 7);
      if (d.act === "cheer") { fo.wave = Math.sin(absT * 8); fo.cheer = Math.sin(absT * 8 + 1.5); }
      // weapon use: aim direction toward the target (a cast id or @prop), the arm reaches out that way
      let aimX = 1, aimZ = 0, usingW = false;
      if (d.act === "swing" || d.act === "stab" || d.act === "shoot" || d.act === "aim") {
        const tg = d.aim ? (d.aim.startsWith("@") ? (cur.props ?? []).find((q) => q.name === d.aim!.slice(1).toLowerCase()) : cur.cast.find((q) => q.id === d.aim)) : cur.cast.find((q) => q.id !== d.id);
        const tx = tg ? tg.x - pp.x : 1, tz = tg ? tg.z - pp.z : 0, tl = Math.hypot(tx, tz) || 1; aimX = tx / tl; aimZ = tz / tl; usingW = true;
        fo.point = ((aimX * right.x + aimZ * right.z) >= 0 ? 1 : -1) as 1 | -1;
      }
      if (d.act === "point") fo.point = (look >= 0 ? 1 : -1) as 1 | -1;
      if (d.act === "nod") fo.headTilt = Math.round(7 * Math.sin(absT * 5));
      const so: SideOpts = { mode: pp.moving ? "march" : "stand", phase: pp.moving && d.act === "run" ? pp.dist / 1.25 : phase, expr, stomp: d.act === "run" ? 1.6 : 0.4, stride: d.act === "run" ? 1.3 : 0.9, held: holdOn ? { name: d.hold!, s: 150 } : undefined };
      if (d.do && !d.mount) {   // ---- universal physical action: the world contact point is the master, the hand IK and the 3D prop follow it ----
        const key = `${i}:${d.id}`, tg = d.do.to ?? "", tgp = tg.startsWith("@") ? (cur.props ?? []).find((q) => q.name === tg.slice(1).toLowerCase()) : cur.cast.find((q) => q.id === tg);
        let A = this.acts.get(key);
        if (!A) {
          const toV = tgp ? new THREE.Vector3(tgp.x, 0, tgp.z) : new THREE.Vector3(d.do.x ?? pp.x + 0.8 * (look >= 0 ? 1 : -1), 0, d.do.z ?? pp.z), fromV = new THREE.Vector3(pp.x, 0, pp.z);
          A = createAction(d.do.type as ActionType, { start: (d.do.at ?? 0.1) * dur, dur: (d.do.dur ?? dur * 0.8), from: fromV, to: toV, prop: d.do.prop });
          this.acts.set(key, A);
        }
        const tk = updateAction(A, u * dur), body = new THREE.Vector3(pp.x, 0, pp.z), mir = side && mirror ? -1 : 1, grip = A.gripOffsets.right;
        const ht = handTarget(tk.contact, body, right, grip as [number, number] | undefined, mir), dsd = (ht.x >= 0 ? 1 : -1) as 1 | -1;
        const rc = A.hands === "both" ? [{ side: -1 as const, x: ht.x - 0.08, y: ht.y }, { side: 1 as const, x: ht.x + 0.08, y: ht.y - 0.04 }] : [{ side: dsd, x: ht.x, y: ht.y }];
        fo.reach = rc; so.reach = rc; fo.headTilt = Math.round(5 * (tk.active ? 1 : 0));
        if (A.prop && this.p3.has(A.prop)) {
          const face = Math.atan2(cam.position.x - pp.x, cam.position.z - pp.z), pb = propBase(A, tk.contact);
          if (A.released && A.released(tk.progress)) {   // thrown: free flight along a ballistic arc toward the target
            const dir = new THREE.Vector3(tgp ? tgp.x - pp.x : 1, 0, tgp ? tgp.z - pp.z : 0).normalize(), t0 = (tk.progress - 0.55) * A.duration, bp = ballistic(tk.contact, dir.multiplyScalar(7).setY(3.2), t0);
            this.p3.put(A.prop, bp.x, Math.max(0, bp.y), bp.z, A.propSize, 1, face, t0 * 9, false, { dist: 0, t: absT, mv: false });
          } else this.p3.put(A.prop, pb.x, pb.y, pb.z, A.propSize, 1, face, 0, false, { dist: 0, t: absT, mv: false, rx: 0, rz: -dsd * A.propTilt(tk.progress) });
        }
        if (A.extra?.paper && this.p3.has("pad")) { const c0 = A.contactCurve[0]; { const sg = Math.sign((c0.x - pp.x) * right.x + (c0.z - pp.z) * right.z) || 1; this.p3.put("pad", c0.x + right.x * sg * 0.32, c0.y - 0.42, c0.z + right.z * sg * 0.32, 0.4, 1, Math.atan2(cam.position.x - pp.x, cam.position.z - pp.z), 0, false, { dist: 0, t: absT, mv: false, rx: -0.5, rz: 0 }); } }
        if (A.extra?.dirt && this.p3.has("hill")) { const k = Math.max(0, (tk.progress - 0.35) / 0.65); if (k > 0.02) this.p3.put("hill", (tgp?.x ?? pp.x + 0.8) + 0.7, 0, tgp?.z ?? pp.z, 0.12 + 0.45 * k, 1, 0, 0); }
      }
      let rx = pp.x, ry = bob, rz = pp.z, crop = 0;
      if (d.mount && this.p3.has(d.mount)) {   // riding: a real 3D mount under the rider, moving with them; the rider card sits just behind the mount's flank so its body hides the legs
        const mc = canon(d.mount), hm = (DEFAULT_H[mc] ?? 2) * Math.max(0.8, sc2), ang = pp.moving ? Math.atan2(pp.dx, pp.dz) : Math.atan2(right.x, right.z);
        const lift = (FLY[mc] ?? 0) * Math.min(1, (u * dur) / 1.6) ** 2 * (3 - 2 * Math.min(1, (u * dur) / 1.6));
        this.p3.put(d.mount, pp.x, lift, pp.z, hm, 1, ang, 0, false, { dist: pp.dist, t: absT, mv: pp.moving || !!FLY[mc] });
        const fx2 = cam.position.x - pp.x, fz2 = cam.position.z - pp.z, fl = Math.hypot(fx2, fz2) || 1;
        rx = pp.x - (fx2 / fl) * 0.22; rz = pp.z - (fz2 / fl) * 0.22; ry = bob + lift + ((SADDLE[mc] ?? 0.55) + (CLOSED.has(mc) ? 0.3 : 0)) * hm - 0.92 * sc2; crop = CLOSED.has(mc) ? 0.4 : 0.3;
      }
      let rg: ReturnType<Rigs["put"]> = null;
      if (this.rigs.ready) {   // real 3D skeletal character: stateless clip sampling, walk time = distance travelled
        const mc3 = d.mount ? canon(d.mount) : "", SHIPS = ["galleon", "ship", "pirateship", "ghostship", "wreck"], onShip = SHIPS.includes(mc3), vehicle = !!mc3 && CLOSED.has(mc3) && !onShip, mounted = !!d.mount && this.p3.has(d.mount);
        const hmm = mounted ? (DEFAULT_H[mc3] ?? 2) * Math.max(0.8, sc2) : 0, lf = mounted ? (FLY[mc3] ?? 0) * Math.min(1, (u * dur) / 1.6) ** 2 * (3 - 2 * Math.min(1, (u * dur) / 1.6)) : 0;
        const ch = 1.75 * sc2 * (vehicle ? 0.82 : 1);
        const facing = Math.atan2(cam.position.x - pp.x, cam.position.z - pp.z) + 0.45 * look;
        let yaw = pp.moving ? Math.atan2(pp.dx, pp.dz) : usingW ? Math.atan2(aimX, aimZ) : facing;
        let gx = pp.x, gy = bob, gz = pp.z;
        if (mounted) { yaw = pp.moving ? Math.atan2(pp.dx, pp.dz) : Math.atan2(right.x, right.z); gy = lf + (vehicle ? Math.max(0.1 * hmm, 0.9 * hmm - 0.78 * ch + 0.25) : onShip ? 0.34 * hmm : (BACK[mc3] ?? 0.85) * hmm - 0.27 * ch); }
        const dd = d.do, dT = dd ? Math.max(0, u - (dd.at ?? 0)) * dur : undefined;
        rg = this.rigs.put({ expr, blink: fo.blink, look: fo.look ?? 0, key: `${i}:${d.id}`, role: d.role, v: d.v, x: gx, y: gy, z: gz, yaw, h: ch, dist: pp.dist, moving: pp.moving && !mounted, run: d.act === "run", sit: d.mode === "sit" || (mounted && !vehicle && !onShip), drive: vehicle,
          act: d.act, doType: dd?.type, doT: dT, hold: !!holdOn, absT: absT, idx });
      }
      if (!rg) st.places.push(person(ci, who, rx, ry, rz, { side, mirror }, fo, so, sc2, crop));
      if (holdOn && has3) {   // the carried item is a real 3D object at the hand; weapons are USED: swings, stabs, aimed shots with recoil, flash and tracer
        const hc = canon(d.hold!), wh = Math.min(hc === "spear" || hc === "trident" ? 1.9 : 1.2, d.holdH ?? DEFAULT_H[hc] ?? 0.3), isW = usingW, hh2 = (isW ? wh : Math.min(0.4, wh)) * Math.max(0.8, sc2);
        const sgn = side ? (mirror ? -1 : 1) : 1, ph = pp.moving ? Math.sin(phase * 3.1) * 0.05 : 0, ts = u * dur, face = Math.atan2(cam.position.x - pp.x, cam.position.z - pp.z);
        if (isW) {
          const s2 = (aimX * right.x + aimZ * right.z) >= 0 ? 1 : -1, hp = rg ? rg.hand(1, this.hv) : null, hx = hp ? hp.x : pp.x + right.x * 0.5 * s2, hz = hp ? hp.z : pp.z + right.z * 0.5 * s2, hy = hp ? hp.y : bob + 1.22 * sc2;
          if (GUNS.has(hc) || hc === "bow") {   // barrel along the aim direction; a shot every 0.4 s: kick back, bright flash, a streak down-range
            const t0 = Math.max(0, ts - 0.1 * dur), per = 0.4, fr = (t0 % per) / per, firing = d.act === "shoot" && ts > 0.1 * dur, kick = firing ? Math.max(0, 1 - fr / 0.18) : 0;
            const len = hh2 * 0.5, gx = hx + aimX * (0.18 - 0.07 * kick), gz = hz + aimZ * (0.18 - 0.07 * kick);
            this.p3.put(d.hold!, gx + aimX * len * 0.4, hy, gz + aimZ * len * 0.4, hh2, 1, Math.atan2(aimX, aimZ), 0, false, { dist: 0, t: absT, mv: false, rx: hc === "bow" ? 0 : Math.PI / 2 - 0.25 * kick, rz: 0 });
            if (firing) this.fxe.muzzle(Math.min(3, idx), gx + aimX * (len + 0.2), hy + 0.02, gz + aimZ * (len + 0.2), aimX, aimZ, fr < 0.14 ? 1 - fr / 0.14 : 0, fr < 0.3 ? fr / 0.3 : 0);
          } else if (d.act === "stab") {        // thrust along the aim direction and pull back
            const th = Math.abs(Math.sin((ts * Math.PI) / 0.7)) ** 0.6;
            this.p3.put(d.hold!, hx + aimX * (0.05 + 0.5 * th), hy, hz + aimZ * (0.05 + 0.5 * th), hh2, 1, Math.atan2(aimX, aimZ), 0, false, { dist: 0, t: absT, mv: false, rx: Math.PI / 2, rz: 0 });
          } else {                              // swing: wind up high behind, cut down through the target, recover
            const p = ((ts * 1.1) % 1), sw = p < 0.25 ? -(p / 0.25) * 0.6 : (-0.6 + ((p - 0.25) / 0.75) ** 0.7 * 3.1);   // -0.6 (back) .. 2.5 (down through)
            this.p3.put(d.hold!, hx, hy + 0.05, hz, hh2, 1, face, 0, false, { dist: 0, t: absT, mv: false, rx: 0, rz: -s2 * (sw - 0.9) });
          }
        } else {
          const off = side ? 0.42 : 0.3;
          { const hp2 = rg ? rg.hand(1, this.hv) : null; this.p3.put(d.hold!, hp2 ? hp2.x : pp.x + right.x * off * sgn, hp2 ? hp2.y - hh2 * 0.35 : bob + 0.8 * sc2 + ph, hp2 ? hp2.z : pp.z + right.z * off * sgn + 0.12, hh2, 1, face, 0); }
        }
      }
      blob(st, pp.x, 0, pp.z, sc2);
    };
    s.cast.forEach((d, k) => put(d, k, false));
    const nx = s.extras ?? 6, F = focusOf(s);
    for (let k = 0; k < nx; k++) { // townsfolk watching from the edge of the plaza, away from the main group
      const a = hh(k, 20) * Math.PI * 2, r = 8 + hh(k, 21) * 3.5;
      const ex = F.x * 0.3 + Math.sin(a) * r, ez = F.z * 0.3 + Math.cos(a) * r;
      if (Math.hypot(ex - cam.position.x, ez - cam.position.z) < 6.5) continue; // never let a bystander block the lens
      put({ id: `x${k}`, role: "townsfolk", x: ex, z: ez, expr: (["smile", "grin", "neutral", "smile_closed"] as Expr[])[k % 4], v: k }, k, true);
    }

    // ---- props: the things the narration is about (stickers) ----
    const eo = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    (s.props ?? []).forEach((pd: PropDef, pi: number) => {
      const pile = (pd.count ?? 1) === 1 && pd.anim !== "fall" && /coins|money|gold/i.test(pd.name), has3p = this.p3.has(pd.name, pile), im = STICKERS.get(pd.name);
      if (!im && !has3p) return;
      const a0 = pd.at ?? 0, a1 = pd.until ?? 1.01;
      if (u < a0 || u > a1) return;
      const ts = (u - a0) * dur, cnt = Math.max(1, pd.count ?? 1), spr = pd.spread ?? 1.2;
      for (let k = 0; k < cnt; k++) {
        const j = k + pi * 31, ox = cnt > 1 ? (hh(j, 3) - 0.5) * 2 * spr : 0, oz = cnt > 1 ? (hh(j, 4) - 0.5) * 2 * spr * 0.6 : 0;
        const delay = pd.anim === "fall" || pd.anim === "pop" || pd.anim === "grow" ? (cnt > 1 ? hh(j, 5) * 0.8 : 0) : 0, tt = Math.max(0, ts - delay);
        let sc3 = 1, yy = pd.y ?? 0, rot = 0, px = pd.x, pz = pd.z;
        if (pd.from) { const g = eo(ts / Math.max(0.3, dur * 0.7)); px = pd.from.x + (pd.x - pd.from.x) * g; pz = pd.from.z + (pd.z - pd.from.z) * g; }
        switch (pd.anim) {
          case "pop": { const g = Math.min(1, tt / 0.35); sc3 = g <= 0 ? 0 : (1 + 0.18 * Math.sin(g * Math.PI)) * eo(g); break; }
          case "grow": sc3 = 0.04 + 0.96 * eo(tt / Math.max(0.6, dur * 0.8)); break;
          case "bounce": yy += Math.abs(Math.sin(tt * 4 + k)) * 0.25 * (pd.h ?? 1); break;
          case "float": yy += 0.12 * Math.sin(tt * 2.2 + k) + 0.15; rot = 0.06 * Math.sin(tt * 1.6 + k); break;
          case "fall": { const g = tt * tt * 6; yy += Math.max(0, 5.5 - g) * (pd.h ? 1 : 1); sc3 = tt > 0 ? 1 : 0; rot = tt * (1.5 + hh(j, 6)); break; }
          case "spin": rot = tt * 3; break;
        }
        if (sc3 <= 0.001) continue;
        if (has3p) {
          const cn = canon(pd.name, pile), h3 = pd.h ?? DEFAULT_H[cn] ?? 1, orient = ORIENT.has(cn);
          let X = px + ox, Z = pz + oz, yawv = Math.atan2(cam.position.x - X, cam.position.z - Z) * 0.8 + (pd.anim === "spin" ? rot : 0), dist = 0, mv = false;
          if (pd.to) { const p2 = propAt(pd); X = p2.x + ox; Z = p2.z + oz; mv = Math.hypot(X - px - ox, Z - pz - oz) > 0.01 && u > a0 && u < Math.min(a1, 0.999); dist = Math.hypot(X - px - ox, Z - pz - oz); if (mv) yawv = Math.atan2(pd.to.x - pd.x, pd.to.z - pd.z); else if (orient) yawv = Math.atan2(right.x, right.z) + (pd.flip ? Math.PI : 0); }
          else if (orient) yawv = Math.atan2(right.x, right.z) + (pd.flip ? Math.PI : 0);
          this.p3.put(pd.name, X, yy, Z, h3, sc3, yawv, pd.anim === "fall" ? rot : 0, pile, { dist, t: absT, mv: mv || pd.anim === "bounce" || (pd.anim === "float" && orient) });
          if (!pd.anim || pd.anim === "static" || pd.anim === "pop" || pd.anim === "grow") blob(st, X, 0, Z, Math.max(0.3, h3 * sc3 * 0.5));
          continue;
        }
        const hgt = (pd.h ?? 1) * sc3, wid = hgt * (im!.naturalWidth / im!.naturalHeight);
        st.fx.push({ key: `stk|${pd.name}`, cw: 512, ch: 512, draw: (pn) => { const r2 = im!.naturalHeight / im!.naturalWidth, W = r2 > 1 ? 512 / r2 : 512, H = r2 > 1 ? 512 : 512 * r2; pn.g.drawImage(im!, (512 - W) / 2, 512 - H, W, H); },
          x: px + ox, y: yy + Math.max(wid, hgt) / 2, z: pz + oz, w: Math.max(wid, hgt), h: Math.max(wid, hgt), rot });
        if (!pd.anim || pd.anim === "static" || pd.anim === "pop" || pd.anim === "grow") blob(st, px + ox, 0, pz + oz, Math.max(0.3, hgt * 0.5));
      }
    });

    this.p3.end(); this.rigs.end();
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0; const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    let fi = 0; const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft); e2.mesh.visible = true; e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0); else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1); fused.push(e2);
    }
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e2 of fused) e2.bind();
    return { focus, cInf: c.cInf, light };
  }
}
