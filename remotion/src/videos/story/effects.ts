// Weather + spectacle for the story world: rain, snow, storm clouds, lightning, explosions, fire, smoke, sparkles, night sky, outer space.
// Everything is a pure function of (scene, fraction, time) so frames are deterministic. All pieces are unlit/emissive "NOINK" meshes
// (no outlines); HDR colours (>1) make the hot parts bloom.
import * as THREE from "three";
import { NOINK } from "../bridge/ink";
import type { SceneDef } from "./types";

export type Env = "rain" | "storm" | "snow" | "night" | "space" | "fog" | "wind";
export type FxEv = { type: "lightning" | "explosion" | "fire" | "smoke" | "sparkle"; at: number; until?: number; x?: number; z?: number; h?: number };
export type FxOut = { dim: number; flash: number; shake: number; space: boolean; night: boolean; fogK: number };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const basic = (c: THREE.ColorRepresentation, o = 1) => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1, fog: false }); m.toneMapped = true; return m; };
const tag = <T extends THREE.Object3D>(o: T) => { o.layers.set(NOINK); o.frustumCulled = false; return o; };
const D = new THREE.Object3D(), P = new THREE.Vector3(), Q = new THREE.Quaternion();

export class Effects {
  g = new THREE.Group();
  private rain = tag(new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 0.6, 0.022), basic("#bcd8f2", 0.55), 800));
  private snow = tag(new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 6, 5), basic("#ffffff"), 600));
  private stars: THREE.Points;
  private moon = tag(new THREE.Mesh(new THREE.SphereGeometry(60, 24, 16), basic(new THREE.Color(2.2, 2.2, 1.9))));
  private planets = new THREE.Group();
  private clouds = new THREE.Group();
  private bolt = new THREE.Group();
  private ball = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), basic(new THREE.Color(3.2, 1.5, 0.3))));
  private core = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), basic(new THREE.Color(4, 3.4, 1.6))));
  private ring = tag(new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 6, 36), basic(new THREE.Color(2.2, 1.9, 1.5), 0.8)));
  private debris = tag(new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), basic("#3a2a22"), 36));
  private smoke = tag(new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), basic("#555a64", 0.85), 16));
  private flames = tag(new THREE.InstancedMesh(new THREE.ConeGeometry(0.28, 1, 8), basic(new THREE.Color(3, 1.2, 0.2)), 14));
  private spark = tag(new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.1, 0), basic(new THREE.Color(3, 2.4, 0.6)), 28));
  private pl: THREE.Mesh[] = [];

  constructor(root: THREE.Object3D) {
    const sp = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) { const a = hh(i, 1) * Math.PI * 2, e = Math.asin(hh(i, 2) * 1.8 - 0.8), r = 950; sp[i * 3] = Math.cos(a) * Math.cos(e) * r; sp[i * 3 + 1] = Math.sin(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    this.stars = tag(new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color(2, 2, 2.2), size: 3.2, sizeAttenuation: false, fog: false })));
    const mkPlanet = (r: number, col: string, ring?: string) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), new THREE.MeshLambertMaterial({ color: col })); tag(m); if (ring) { const t = tag(new THREE.Mesh(new THREE.TorusGeometry(r * 1.6, r * 0.09, 4, 48), basic(ring, 0.8))); t.rotation.x = 1.25; m.add(t); } this.planets.add(m); this.pl.push(m); };
    mkPlanet(130, "#c9774a", "#e8c89a"); mkPlanet(70, "#4aa0d9"); mkPlanet(35, "#9a8fb8");
    for (let i = 0; i < 16; i++) { const c = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), basic("#3b4055"))); c.userData.i = i; this.clouds.add(c); }
    for (let i = 0; i < 9; i++) { const b = tag(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), basic(new THREE.Color(5, 5, 6)))); this.bolt.add(b); }
    this.g.add(this.rain, this.snow, this.stars, this.moon, this.planets, this.clouds, this.bolt, this.ball, this.core, this.ring, this.debris, this.smoke, this.flames, this.spark);
    for (const o of [this.rain, this.snow, this.debris, this.smoke, this.flames, this.spark]) o.visible = false;
    this.stars.visible = this.moon.visible = this.planets.visible = this.clouds.visible = this.bolt.visible = this.ball.visible = this.core.visible = this.ring.visible = false;
    root.add(this.g);
  }

  update(s: SceneDef, u: number, dur: number, camPos: THREE.Vector3, look: THREE.Vector3, absT: number): FxOut {
    const env = new Set<string>((s.env ?? []) as string[]), ev = (s.fx ?? []) as FxEv[], t = u * dur;
    const out: FxOut = { dim: 1, flash: 0, shake: 0, space: env.has("space"), night: env.has("night") || env.has("space"), fogK: 1 };
    const storm = env.has("storm"), rain = env.has("rain") || storm;
    if (storm) out.dim = 0.5; else if (env.has("rain")) out.dim = 0.72; if (out.night) out.dim = Math.min(out.dim, env.has("space") ? 0.7 : 0.45);
    if (env.has("fog")) out.fogK = 0.25;
    const cx = look.x, cz = look.z;
    // rain / snow: a slab of streaks around the view
    if (rain) {
      this.rain.visible = true;
      for (let i = 0; i < 800; i++) {
        const y = 16 - ((hh(i, 3) * 16 + t * (storm ? 26 : 20)) % 16), x = cx + (hh(i, 1) - 0.5) * 26 + y * 0.14, z = cz + (hh(i, 2) - 0.5) * 26 - 3;
        D.position.set(x, y, z); D.rotation.set(0, 0, 0.13); D.scale.set(1, 1, 1); D.updateMatrix(); this.rain.setMatrixAt(i, D.matrix);
      }
      this.rain.instanceMatrix.needsUpdate = true;
    } else this.rain.visible = false;
    if (env.has("snow")) {
      this.snow.visible = true; out.dim = Math.min(out.dim, 0.9);
      for (let i = 0; i < 600; i++) {
        const y = 12 - ((hh(i, 3) * 12 + t * 2.2) % 12), x = cx + (hh(i, 1) - 0.5) * 24 + Math.sin(t * 0.9 + i) * 0.5, z = cz + (hh(i, 2) - 0.5) * 24 - 2;
        D.position.set(x, y, z); D.rotation.set(0, 0, 0); D.scale.setScalar(0.6 + hh(i, 4)); D.updateMatrix(); this.snow.setMatrixAt(i, D.matrix);
      }
      this.snow.instanceMatrix.needsUpdate = true;
    } else this.snow.visible = false;
    // storm clouds roll in overhead
    this.clouds.visible = storm || env.has("rain");
    if (this.clouds.visible) this.clouds.children.forEach((c, i) => { const a = (i / 16) * Math.PI * 2 + t * 0.05; c.position.set(cx + Math.cos(a) * (5 + 9 * hh(i, 5)) , 14 + hh(i, 6) * 4, cz + Math.sin(a) * (5 + 9 * hh(i, 7)) - 4); c.scale.set(5 + 3 * hh(i, 8), 1.8 + hh(i, 9), 4 + 2 * hh(i, 10)); });
    // sky objects follow the camera
    this.stars.visible = out.night; this.stars.position.copy(camPos);
    this.moon.visible = out.night && !env.has("space"); this.moon.position.set(camPos.x + 380, 520, camPos.z - 640);
    this.planets.visible = out.space;
    if (out.space) { const sp: [number, number, number][] = [[-500, 330, -900], [420, 520, -950], [150, 160, -800]]; this.pl.forEach((m, i) => { m.position.set(camPos.x + sp[i][0], sp[i][1], camPos.z + sp[i][2]); m.rotation.y = t * 0.05 + i; }); }
    // timed events
    this.bolt.visible = this.ball.visible = this.core.visible = this.ring.visible = false; this.debris.visible = this.smoke.visible = this.flames.visible = this.spark.visible = false;
    for (let k = 0; k < ev.length; k++) {
      const e = ev[k], a = t - e.at * dur; let x = e.x ?? cx + (hh(k, 1) - 0.5) * 6, z = e.z ?? cz - 2 - hh(k, 2) * 3;
      { // never let a blast/bolt/fire swallow the lens: keep it at least 1.8 radii in front of the camera
        const R0 = e.type === "explosion" ? (e.h ?? 3) : 2, dx = x - camPos.x, dz = z - camPos.z, dd = Math.hypot(dx, dz) || 1, min = R0 * 1.8 + 2;
        if (dd < min) { x = camPos.x + (dx / dd) * min; z = camPos.z + (dz / dd) * min; }
      }
      if (e.type === "lightning" && a >= 0 && a < 0.5) {
        const on = a < 0.1 || (a > 0.16 && a < 0.28) || (a > 0.34 && a < 0.4); out.flash = Math.max(out.flash, on ? 1 : 0.2 * (1 - a * 2));
        if (on) { this.bolt.visible = true; let px = x, py = 18; this.bolt.children.forEach((b, i) => { const nx = px + (hh(i + k * 9, 4) - 0.5) * 3, ny = py - 2.1, dx = nx - px, dy = ny - py, L = Math.hypot(dx, dy); b.position.set((px + nx) / 2, (py + ny) / 2, z); b.scale.set(0.16, L, 0.16); b.rotation.z = Math.atan2(dx, -dy) * -1; px = nx; py = ny; }); }
      }
      if (e.type === "explosion" && a >= 0 && a < 2.6) {
        const R = e.h ?? 3, g = 1 - Math.exp(-a * 8), fade = a < 0.45 ? 1 : Math.max(0, 1 - (a - 0.45) / 0.9);
        out.shake = Math.max(out.shake, Math.max(0, 1 - a / 1.0)); out.flash = Math.max(out.flash, a < 0.12 ? 0.8 : 0);
        this.ball.visible = fade > 0.01; this.ball.position.set(x, R * 0.45 * g, z); this.ball.scale.setScalar(Math.max(0.01, R * 0.62 * g * fade));
        this.core.visible = a < 0.35; this.core.position.copy(this.ball.position); this.core.scale.setScalar(Math.max(0.01, R * 0.36 * g * (1 - a / 0.35)));
        this.ring.visible = a < 0.8; this.ring.position.set(x, 0.12, z); this.ring.rotation.set(Math.PI / 2, 0, 0); this.ring.scale.setScalar(Math.max(0.01, a * R * 3.2)); (this.ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 - a);
        this.debris.visible = true;
        for (let i = 0; i < 36; i++) { const th = hh(i, 1) * 6.283, sp2 = 3 + hh(i, 2) * 7, vy = 5 + hh(i, 3) * 8; D.position.set(x + Math.cos(th) * sp2 * a, Math.max(0.05, 0.5 + vy * a - 9 * a * a), z + Math.sin(th) * sp2 * a); D.rotation.set(a * 7 + i, a * 5, 0); D.scale.setScalar(a > 2 ? 0.001 : 0.6 + hh(i, 4)); D.updateMatrix(); this.debris.setMatrixAt(i, D.matrix); }
        this.debris.instanceMatrix.needsUpdate = true; this.smoke.visible = a > 0.25;
        for (let i = 0; i < 16; i++) { const aa = Math.max(0, a - 0.25 - hh(i, 5) * 0.4), r = R * 0.28 * (0.5 + hh(i, 6)) * Math.min(1, aa * 2); D.position.set(x + (hh(i, 7) - 0.5) * R * 0.7, R * 0.4 + aa * 1.8, z + (hh(i, 8) - 0.5) * R * 0.7); D.rotation.set(0, 0, 0); D.scale.setScalar(Math.max(0.001, r * (a > 2.3 ? (2.6 - a) / 0.3 : 1))); D.updateMatrix(); this.smoke.setMatrixAt(i, D.matrix); }
        this.smoke.instanceMatrix.needsUpdate = true;
      }
      if (e.type === "fire" && a >= 0 && (e.until == null || t < e.until * dur)) {
        this.flames.visible = true; const sc = Math.min(1, a / 0.4) * (e.h ?? 1.2);
        for (let i = 0; i < 14; i++) { const fl = 0.75 + 0.35 * Math.sin(absT * 14 + i * 2.1) + 0.2 * Math.sin(absT * 23 + i); D.position.set(x + (hh(i, 1) - 0.5) * 1.1, sc * fl * 0.5, z + (hh(i, 2) - 0.5) * 0.7); D.rotation.set(0, 0, Math.sin(absT * 9 + i) * 0.12); D.scale.set(1, sc * fl * (0.7 + hh(i, 3)), 1); D.updateMatrix(); this.flames.setMatrixAt(i, D.matrix); }
        this.flames.instanceMatrix.needsUpdate = true; out.flash = Math.max(out.flash, 0.04);
      }
      if (e.type === "smoke" && a >= 0) {
        this.smoke.visible = true;
        for (let i = 0; i < 16; i++) { const age = (a * 0.6 + hh(i, 1) * 3) % 3; D.position.set(x + Math.sin(i + age) * 0.5, 0.5 + age * 1.6, z + Math.cos(i) * 0.4); D.rotation.set(0, 0, 0); D.scale.setScalar(0.25 + age * 0.45); D.updateMatrix(); this.smoke.setMatrixAt(i, D.matrix); }
        this.smoke.instanceMatrix.needsUpdate = true;
      }
      if (e.type === "sparkle" && a >= 0 && (e.until == null || t < e.until * dur)) {
        this.spark.visible = true;
        for (let i = 0; i < 28; i++) { const age = (a * 0.9 + hh(i, 1) * 2) % 2, th = hh(i, 2) * 6.283, r = 0.4 + hh(i, 3) * (e.h ?? 1.4); D.position.set(x + Math.cos(th + age) * r, 0.3 + age * 1.2, z + Math.sin(th + age) * r * 0.6); D.rotation.set(absT * 3 + i, absT * 2, 0); D.scale.setScalar(Math.max(0.001, Math.sin((age / 2) * Math.PI)) * (0.6 + hh(i, 4))); D.updateMatrix(); this.spark.setMatrixAt(i, D.matrix); }
        this.spark.instanceMatrix.needsUpdate = true;
      }
    }
    void P; void Q;
    return out;
  }
}
