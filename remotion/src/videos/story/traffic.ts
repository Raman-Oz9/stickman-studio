import * as THREE from "three";
import { PROC } from "./props3d";

interface Vehicle {
  mesh: THREE.Object3D;
  kind: "car" | "bus" | "truck" | "train" | "plane" | "helicopter" | "taxi" | "policecar";
  pathType: "road-x" | "road-z" | "rail" | "air";
  pos: number;
  speed: number;
  laneOffset: number;
  length: number;
  stopPhase?: number;
}

const cityTrafficMap = new WeakMap<THREE.Group, Vehicle[]>();
const activeCityGroups = new Set<THREE.Group>();

function makeVehicle(kind: string): THREE.Object3D {
  const factory = PROC[kind] || PROC["car"];
  const obj = factory ? factory() : new THREE.Group();
  obj.castShadow = true;
  obj.receiveShadow = true;
  obj.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return obj;
}

function initTraffic(wg: THREE.Group): Vehicle[] {
  const vehicles: Vehicle[] = [];
  const kinds: ("car" | "bus" | "truck" | "taxi" | "policecar")[] = ["car", "taxi", "bus", "truck", "policecar", "car"];

  for (let i = 0; i < 14; i++) {
    const kind = kinds[i % kinds.length];
    const isX = i % 2 === 0;
    const laneOffset = (i % 2 === 0 ? 1 : -1) * 1.6;
    const mesh = makeVehicle(kind);
    wg.add(mesh);
    vehicles.push({
      mesh,
      kind,
      pathType: isX ? "road-x" : "road-z",
      pos: (i * 7.0) % 88 - 44,
      speed: 5 + (i % 3) * 2,
      laneOffset,
      length: kind === "bus" ? 7 : kind === "truck" ? 6 : 3.2,
      stopPhase: (i * 1.4) % 6
    });
  }

  for (let i = 0; i < 2; i++) {
    const mesh = makeVehicle("train");
    wg.add(mesh);
    vehicles.push({
      mesh,
      kind: "train",
      pathType: "rail",
      pos: i * 45,
      speed: 10,
      laneOffset: 0,
      length: 5
    });
  }

  for (let i = 0; i < 3; i++) {
    const isHeli = i % 2 === 1;
    const kind = isHeli ? "helicopter" : "plane";
    const mesh = makeVehicle(kind);
    wg.add(mesh);
    vehicles.push({
      mesh,
      kind,
      pathType: "air",
      pos: i * 40,
      speed: isHeli ? 7 : 14,
      laneOffset: (i - 1) * 22,
      length: 4
    });
  }

  cityTrafficMap.set(wg, vehicles);
  return vehicles;
}

export function update(wgOrT: THREE.Group | number, time?: number) {
  let t = 0;
  if (typeof wgOrT === "number") {
    t = wgOrT;
    for (const wg of activeCityGroups) {
      updateGroup(wg, t);
    }
  } else {
    const wg = wgOrT;
    t = time ?? 0;
    activeCityGroups.add(wg);
    updateGroup(wg, t);
  }
}

function updateGroup(wg: THREE.Group, t: number) {
  let vehicles = cityTrafficMap.get(wg);
  if (!vehicles) {
    vehicles = initTraffic(wg);
  }

  const bound = 46;
  const gridRoads = [-44, -22, 0, 22, 44];

  for (let idx = 0; idx < vehicles.length; idx++) {
    const v = vehicles[idx];
    if (v.pathType === "road-x" || v.pathType === "road-z") {
      const nearJunction = Math.abs((v.pos + 11) % 22 - 11) < 3.0;
      const shouldStop = nearJunction && v.stopPhase !== undefined && (t + v.stopPhase) % 5 < 1.6;

      if (!shouldStop) {
        v.pos += v.speed * 0.033;
        if (v.pos > bound) v.pos = -bound;
      }

      const roadLineIndex = idx % gridRoads.length;
      const fixedCoord = gridRoads[roadLineIndex];
      const posVal = ((v.pos + bound + (v.speed * 0.033)) % (bound * 2)) - bound;
      v.pos = posVal;

      if (v.pathType === "road-x") {
        const zPos = fixedCoord + v.laneOffset;
        v.mesh.position.set(v.pos, 0.1, zPos);
        v.mesh.rotation.y = v.speed > 0 ? 0 : Math.PI;
      } else {
        const xPos = fixedCoord + v.laneOffset;
        v.mesh.position.set(xPos, 0.1, v.pos);
        v.mesh.rotation.y = v.speed > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    } else if (v.pathType === "rail") {
      v.pos = (v.pos + v.speed * 0.033) % 180;
      const angle = (v.pos / 180) * Math.PI * 2;
      const rx = Math.cos(angle) * 72;
      const rz = Math.sin(angle) * 72;
      v.mesh.position.set(rx, 0.25, rz);
      v.mesh.rotation.y = -angle + Math.PI / 2;
    } else if (v.pathType === "air") {
      v.pos = (v.pos + v.speed * 0.033) % 200;
      const angle = (v.pos / 200) * Math.PI * 2;
      const ax = Math.cos(angle) * 90;
      const az = Math.sin(angle) * 90;
      const ay = 38 + Math.sin(t * 1.5 + v.laneOffset) * 2.5;
      v.mesh.position.set(ax, ay, az);
      v.mesh.rotation.y = -angle + Math.PI / 2;

      v.mesh.traverse((child: THREE.Object3D) => {
        if (child.parent === v.mesh && child instanceof THREE.Group) {
          child.rotation.y = t * 30;
        }
      });
    }
  }
}
