import "./index.css";
import { Composition } from "remotion";
import { REACH_DEMO_FRAMES, ReachDemo } from "./ReachDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ReachDemo"
        component={ReachDemo}
        durationInFrames={REACH_DEMO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
