import React, { useMemo } from "react";
import { InkStickman } from "./InkStickman";
import { PropIcon } from "./Props2D";
import { perform, Verb } from "./pose2d";
import type { Expression, Vec } from "./Stickman2D";
import type { InkStyle } from "./inkOutfit";

export type PerformerProps = {
  x: number; y: number; scale?: number; facing?: 1 | -1; yaw?: number;
  skin: string; cloth: string; hair?: string; build?: "lean" | "stocky"; seed?: number;
  verb: Verb; p: number; t: number; frame: number; phase?: number;
  ink?: InkStyle; prop?: string | null; holdProp?: string | null; target?: Vec | null; expr?: Expression | null; gaze?: Vec | null;
  handTarget?: Vec | null; backHandTarget?: Vec | null; gripOverride?: boolean; renderHeld?: boolean;
};

// One generic performer: any verb -> pose -> articulated ink stickman with its prop in hand.
export const Performer2D: React.FC<PerformerProps> = ({ x, y, scale = 1, facing = 1, yaw, skin, cloth, hair, build, seed, verb, p, t, frame, phase, ink, prop, holdProp, target, expr, gaze, handTarget, backHandTarget, gripOverride, renderHeld }) => {
  const ph = phase ?? t * 1.15;
  const o = useMemo(() => perform({ verb, p, t, phase: ph, prop, target }), [verb, p, t, ph, prop, target]);
  const hp = o.hold?.prop ?? holdProp ?? null;
  const held = renderHeld === false ? null : hp ? <PropIcon name={hp} /> : null;
  const fly = o.fly ? (() => { const k = o.fly!.p; const px = o.fly!.from[0] + (o.fly!.to[0] - o.fly!.from[0]) * k; const py = o.fly!.from[1] + (o.fly!.to[1] - o.fly!.from[1]) * k - Math.sin(k * Math.PI) * 90; return <g transform={`translate(${px} ${py}) rotate(${k * 540})`}><PropIcon name={o.fly!.prop} /></g>; })() : null;
  return (
    <InkStickman
      x={x + o.dx * scale * (yaw !== undefined ? Math.sin((yaw * Math.PI) / 180) >= 0 ? 1 : -1 : facing)} y={y + o.dy * scale} scale={scale} facing={facing} yaw={yaw} skin={skin} cloth={cloth} hair={hair}
      build={build} seed={seed} frame={frame} walk={ph * o.walkRate} stand={o.stand}
      frontHand={handTarget ?? o.handF} backHand={backHandTarget ?? o.handB} footFront={o.footF} footBack={o.footB}
      hipDrop={o.hipDrop} hipX={o.hipX} lean={o.lean} rot={o.rot} headTilt={o.headTilt} grip={gripOverride ?? o.grip}
      expression={expr ?? o.expr ?? "smile"} gaze={gaze ?? o.gaze ?? null}
      style={ink} held={held} heldAng={o.hold?.ang ?? 0} seat={!!o.chair} extra={fly}
    />
  );
};
