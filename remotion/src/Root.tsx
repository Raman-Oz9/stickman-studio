import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { StoryShort, getBoard } from "./videos/story/Story";
import { totalFrames } from "./videos/story/types";
import { DEMO } from "./videos/story/demo";
void getBoard;

export const Root: React.FC = () => (
  <>
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="StoryShort" component={StoryShort} durationInFrames={totalFrames(DEMO)} fps={30} width={1080} height={1920}
      calculateMetadata={async ({ props }) => ({ durationInFrames: totalFrames(((props as { board?: typeof DEMO }).board) ?? DEMO) })} />
  </>
);
