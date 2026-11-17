import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { getBoard } from "./videos/story/Story";
import { totalFrames } from "./videos/story/types";
import { DEMO } from "./videos/story/demo";
import { IllustratedProof } from "./videos/story/IllustratedProof";
import { StoryShort2D } from "./videos/story/Story2D";
void getBoard;

export const Root: React.FC = () => (
  <>
    <Composition id="StoryShort2D" component={StoryShort2D} durationInFrames={totalFrames(DEMO)} fps={30} width={1080} height={1920}
      calculateMetadata={async ({ props }) => ({ durationInFrames: totalFrames(((props as { board?: typeof DEMO }).board) ?? DEMO) })} />
    <Composition id="IllustratedProof" component={IllustratedProof} durationInFrames={180} fps={30} width={1080} height={1920} />
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="StoryShort" component={StoryShort2D} durationInFrames={totalFrames(DEMO)} fps={30} width={1080} height={1920}
      calculateMetadata={async ({ props }) => ({ durationInFrames: totalFrames(((props as { board?: typeof DEMO }).board) ?? DEMO) })} />
  </>
);
