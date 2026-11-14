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
import { outfitFor } from "./outfits";
import { camAt, focusOf } from "./camera";

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const ROLE_SCALE: Record<string, number> = { kid: 0.72, girl: 0.74 };

export class StoryWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private sunCache = new Map<number, THREE.Vector3>();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    const R = this.root;
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
    b.build(R);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose everything for scene `s` (index i) at local frame lf of n; returns the camera focus point */
  update(s: SceneDef, i: number, lf: number, n: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene, absT: number) {
    const light = s.light ?? "day", L = LIGHTS[light], K = LOOK[light];
    const u = n > 1 ? lf / (n - 1) : 0, t = lf / FPS;
    const dur = n / FPS;
    const posOf = (d: CastDef) => {
      if (!d.to) return { x: d.x, z: d.z, moving: false, dist: 0, dx: 0, dz: 0 };
      const w0 = d.walkAt ?? 0, k = Math.min(1, Math.max(0, (u - w0) / Math.max(0.05, 0.92 - w0))), e = k * k * (3 - 2 * k);
      const L = Math.hypot(d.to.x - d.x, d.to.z - d.z);
      return { x: d.x + (d.to.x - d.x) * e, z: d.z + (d.to.z - d.z) * e, moving: k > 0.001 && k < 0.999, dist: L * e, dx: d.to.x - d.x, dz: d.to.z - d.z };
    };
    const cur: SceneDef = { ...s, cast: s.cast.map((d) => { const p = posOf(d); return { ...d, x: p.x, z: p.z }; }) };
    const c = camAt(cur, i, u, absT, dur);
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
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 60);
    this.sun.position.copy(focus).addScaledVector(sd, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, k) => untone(h, su["c" + k].value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = null;

    // ---- cast ----
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const ci: CamInfo = { pos: cam.position, right, sun: sd };
    const st: Stage = { places: [], fx: [] };
    const put = (d: CastDef, idx: number, extra: boolean) => {
      const o = outfitFor(d.role, d.v ?? idx), who: Who = { i: idx + (extra ? 300 : 0), o, okey: `${d.role}${d.v ?? idx}` };
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
      const holdOn = d.hold && u >= (d.holdAt ?? 0) && STICKERS.has(d.hold);
      const lat = pp.moving ? (pp.dx * right.x + pp.dz * right.z) / (Math.hypot(pp.dx, pp.dz) || 1) : 0;
      const side = pp.moving && Math.abs(lat) > 0.5, mirror = lat < 0;
      const phase = pp.dist / 1.5;
      const fo: FrontOpts = { mode: pp.moving ? "stroll" : mode, phase: pp.moving ? phase : 0, expr, look: side ? 0 : look, blink: lidAt(t, idx + (extra ? 300 : 0), d.at2 != null ? [swapT] : []),
        headTilt: extra ? 0 : Math.round(4 * Math.sin(absT * 0.9 + idx)), prop: holdOn ? { held: d.hold!, s: 150 } : null };
      if (d.act === "wave" && !holdOn) fo.wave = Math.sin(absT * 7);
      if (d.act === "cheer") { fo.wave = Math.sin(absT * 8); fo.cheer = Math.sin(absT * 8 + 1.5); }
      if (d.act === "point") fo.point = (look >= 0 ? 1 : -1) as 1 | -1;
      if (d.act === "nod") fo.headTilt = Math.round(7 * Math.sin(absT * 5));
      const so: SideOpts = { mode: pp.moving ? "march" : "stand", phase, expr, stomp: 0.4, stride: 0.9 };
      st.places.push(person(ci, who, pp.x, bob, pp.z, { side, mirror }, fo, so, sc2));
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
      const im = STICKERS.get(pd.name);
      if (!im) return;
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
        const hgt = (pd.h ?? 1) * sc3, wid = hgt * (im.naturalWidth / im.naturalHeight);
        st.fx.push({ key: `stk|${pd.name}`, cw: 512, ch: 512, draw: (pn) => { const r2 = im.naturalHeight / im.naturalWidth, W = r2 > 1 ? 512 / r2 : 512, H = r2 > 1 ? 512 : 512 * r2; pn.g.drawImage(im, (512 - W) / 2, 512 - H, W, H); },
          x: px + ox, y: yy + Math.max(wid, hgt) / 2, z: pz + oz, w: Math.max(wid, hgt), h: Math.max(wid, hgt), rot });
        if (!pd.anim || pd.anim === "static" || pd.anim === "pop" || pd.anim === "grow") blob(st, px + ox, 0, pz + oz, Math.max(0.3, hgt * 0.5));
      }
    });

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
