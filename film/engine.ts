// Bundle entry: exposes the ORIGINAL pipeline's world generators to the browser film engine (window.Eng).
export * as THREE from "three";
export { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export { buildRealm, realmWaves, LOCS, resolveLoc, heightAt } from "../remotion/src/videos/story/realm";
export { drawWorld, animateWorld } from "../remotion/src/videos/story/worldgen";
export { buildGalleon } from "../remotion/src/videos/story/ships3d";
export { PROC, canon, DEFAULT_H } from "../remotion/src/videos/story/props3d";
export { loadTextures } from "../remotion/src/videos/story/texcache";
