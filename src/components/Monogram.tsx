// V12 mark — the same triple-read as the full emblem (Vidyuth · Nº12 · the
// F1 V12 engine): the "V" carries the ink/white fill, "12" carries racing
// green so the corner mark echoes the splash emblem without shouting.
export function Monogram({ inverted = false }: { inverted?: boolean }) {
  const fill = inverted ? "var(--color-white-soft)" : "var(--color-ink)";
  return (
    <svg
      width="64"
      height="30"
      viewBox="0 0 90 42"
      role="img"
      aria-label="V12"
      style={{ overflow: "visible" }}
    >
      <title>V12 — Vidyuth Nº12</title>
      <text
        x="2"
        y="32"
        fontFamily="var(--font-panchang)"
        fontWeight={800}
        fontSize="32"
        fontStyle="italic"
        letterSpacing="-1"
      >
        <tspan fill={fill}>V</tspan>
        <tspan fill="var(--color-green)">12</tspan>
      </text>
    </svg>
  );
}
