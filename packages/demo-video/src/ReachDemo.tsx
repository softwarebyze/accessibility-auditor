import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SceneHeader } from "./components/SceneHeader";
import { Terminal } from "./components/Terminal";
import {
  auditCommand,
  auditLines,
  crawlCommand,
  crawlLines,
  features,
  historyCommand,
  historyLines,
  quickCommand,
  quickLines,
} from "./data/captures";
import { theme } from "./theme";

const FPS = 30;

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleSpring = spring({ frame, fps, config: { damping: 200 } });
  const subDelay = 12;
  const subSpring = spring({
    frame: frame - subDelay,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.font,
      }}
    >
      <div
        style={{
          textAlign: "center",
          transform: `scale(${interpolate(titleSpring, [0, 1], [0.92, 1])})`,
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            color: theme.text,
            letterSpacing: "-0.03em",
          }}
        >
          Reach
        </div>
        <div
          style={{
            fontSize: 28,
            color: theme.muted,
            marginTop: 16,
            opacity: interpolate(subSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subSpring, [0, 1], [12, 0])}px)`,
          }}
        >
          Accessibility audits from your terminal
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 18,
            color: theme.accent,
            opacity: interpolate(subSpring, [0, 1], [0, 1]),
          }}
        >
          Real browser · WCAG 2.1 AA · One command
        </div>
      </div>
    </AbsoluteFill>
  );
};

type DemoSceneProps = {
  eyebrow: string;
  title: string;
  command: string;
  lines: string[];
  framesPerLine?: number;
};

const DemoScene: React.FC<DemoSceneProps> = ({
  eyebrow,
  title,
  command,
  lines,
  framesPerLine,
}) => (
  <AbsoluteFill
    style={{
      background: theme.bg,
      padding: "72px 96px",
      fontFamily: theme.font,
      justifyContent: "center",
    }}
  >
    <div style={{ marginBottom: 36 }}>
      <SceneHeader eyebrow={eyebrow} title={title} />
    </div>
    <Terminal command={command} lines={lines} framesPerLine={framesPerLine} />
  </AbsoluteFill>
);

const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        padding: "80px 96px",
        fontFamily: theme.font,
        justifyContent: "center",
      }}
    >
      <SceneHeader
        eyebrow="Everything included"
        title="One tool, full coverage"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginTop: 48,
        }}
      >
        {features.map((f, i) => {
          const delay = i * 4;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 200 },
          });
          return (
            <div
              key={f.label}
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: "24px 28px",
                opacity: interpolate(s, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
              }}
            >
              <div
                style={{ color: theme.accent, fontSize: 22, fontWeight: 700 }}
              >
                {f.label}
              </div>
              <div style={{ color: theme.muted, fontSize: 16, marginTop: 6 }}>
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  const pulse = interpolate(
    frame % (fps * 2),
    [0, fps, fps * 2],
    [1, 1.02, 1],
    {
      easing: Easing.inOut(Easing.sin),
    },
  );

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.font,
        textAlign: "center",
      }}
    >
      <div
        style={{
          opacity: interpolate(s, [0, 1], [0, 1]),
          transform: `scale(${pulse})`,
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, color: theme.text }}>
          Try it now
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: theme.mono,
            fontSize: 22,
            color: theme.accent,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: "16px 32px",
            display: "inline-block",
          }}
        >
          npx reach-a11y audit https://yoursite.com
        </div>
        <div style={{ marginTop: 20, fontSize: 18, color: theme.muted }}>
          github.com/softwarebyze/accessibility-auditor
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReachDemo: React.FC = () => {
  const intro = 3 * FPS;
  const quick = 8 * FPS;
  const audit = 14 * FPS;
  const crawl = 10 * FPS;
  const history = 8 * FPS;
  const featuresDur = 7 * FPS;
  const outro = 5 * FPS;

  let from = 0;
  const seq = (duration: number) => {
    const start = from;
    from += duration;
    return { from: start, duration };
  };

  const sIntro = seq(intro);
  const sQuick = seq(quick);
  const sAudit = seq(audit);
  const sCrawl = seq(crawl);
  const sHistory = seq(history);
  const sFeatures = seq(featuresDur);
  const sOutro = seq(outro);

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Sequence from={sIntro.from} durationInFrames={sIntro.duration}>
        <Intro />
      </Sequence>
      <Sequence from={sQuick.from} durationInFrames={sQuick.duration}>
        <DemoScene
          eyebrow="Quick check"
          title="Pass or fail in seconds"
          command={quickCommand}
          lines={quickLines}
          framesPerLine={20}
        />
      </Sequence>
      <Sequence from={sAudit.from} durationInFrames={sAudit.duration}>
        <DemoScene
          eyebrow="Full audit · demo fixture"
          title="What broke, how bad, how to fix"
          command={auditCommand}
          lines={auditLines}
          framesPerLine={7}
        />
      </Sequence>
      <Sequence from={sCrawl.from} durationInFrames={sCrawl.duration}>
        <DemoScene
          eyebrow="Site crawl · demo fixture"
          title="Check every page you care about"
          command={crawlCommand}
          lines={crawlLines}
          framesPerLine={8}
        />
      </Sequence>
      <Sequence from={sHistory.from} durationInFrames={sHistory.duration}>
        <DemoScene
          eyebrow="History"
          title="Track fixes over time"
          command={historyCommand}
          lines={historyLines}
          framesPerLine={7}
        />
      </Sequence>
      <Sequence from={sFeatures.from} durationInFrames={sFeatures.duration}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={sOutro.from} durationInFrames={sOutro.duration}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};

export const REACH_DEMO_FRAMES =
  3 * FPS + 8 * FPS + 14 * FPS + 10 * FPS + 8 * FPS + 7 * FPS + 5 * FPS;
