export function Monogram({ inverted = false }: { inverted?: boolean }) {
  const fill = inverted ? "var(--color-white-soft)" : "var(--color-ink)";
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" aria-hidden={false} role="img">
      <title>V12</title>
      <text x="0" y="18" fontFamily="var(--font-display)" fontSize="22" fontStyle="italic" fill={fill}>V</text>
      <text x="14" y="38" fontFamily="var(--font-display)" fontSize="26" fontStyle="italic" fill={fill}>12</text>
    </svg>
  );
}
