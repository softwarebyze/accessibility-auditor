import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

type TerminalProps = {
  command: string;
  lines: string[];
  framesPerLine?: number;
};

export const Terminal: React.FC<TerminalProps> = ({
  command,
  lines,
  framesPerLine = 6,
}) => {
  const frame = useCurrentFrame();
  const commandEnd = 20;
  const outputStart = commandEnd + 8;
  const visibleLines = Math.floor(
    interpolate(
      frame,
      [outputStart, outputStart + lines.length * framesPerLine],
      [0, lines.length],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  );
  const commandChars = Math.floor(
    interpolate(frame, [0, commandEnd], [0, command.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const showCursor = frame % 30 < 15 && commandChars < command.length;

  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 28,
        fontFamily: theme.mono,
        fontSize: 15,
        lineHeight: 1.55,
        color: theme.text,
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        width: "100%",
        maxWidth: 920,
        minHeight: 340,
      }}
    >
      <div style={{ color: theme.muted, marginBottom: 16, fontSize: 13 }}>
        reach — zsh
      </div>
      <div style={{ marginBottom: 12 }}>
        <span style={{ color: theme.accent }}>$ </span>
        <span>{command.slice(0, commandChars)}</span>
        {showCursor ? <span style={{ color: theme.accent }}>▋</span> : null}
      </div>
      {lines.slice(0, visibleLines).map((line, i) => (
        <div
          key={`${i}-${line.slice(0, 20)}`}
          style={{
            color: lineColor(line),
            whiteSpace: "pre-wrap",
            minHeight: line === "" ? 8 : undefined,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

function lineColor(line: string): string {
  if (line.includes("🔴") || line.includes("CRITICAL")) return theme.critical;
  if (line.includes("🟡") || line.includes("SERIOUS") || line.includes("⚠️"))
    return theme.serious;
  if (
    line.includes("✅") ||
    line.includes("✔") ||
    line.includes("No violations")
  )
    return theme.success;
  if (line.startsWith("📊") || line.startsWith("🔍")) return theme.accent;
  if (line.startsWith("═") || line.startsWith("─")) return theme.border;
  return theme.text;
}
