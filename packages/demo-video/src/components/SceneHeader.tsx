import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

type SceneHeaderProps = {
  eyebrow: string;
  title: string;
};

export const SceneHeader: React.FC<SceneHeaderProps> = ({ eyebrow, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [24, 0]);

  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>
      <div
        style={{
          color: theme.accent,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontFamily: theme.font,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          color: theme.text,
          fontSize: 42,
          fontWeight: 700,
          fontFamily: theme.font,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </div>
    </div>
  );
};
