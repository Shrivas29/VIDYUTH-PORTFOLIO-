export function Monogram({ inverted = false }: { inverted?: boolean }) {
  const fill = inverted ? "var(--color-white-soft)" : "var(--color-ink)";
  return (
    <svg width="44" height="40" viewBox="0 0 44 40" role="img">
      <title>VD</title>
      <text x="0" y="18" fontFamily="var(--font-panchang)" fontWeight={800} fontSize="22" fontStyle="italic" fill={fill}>V</text>
      <text x="14" y="38" fontFamily="var(--font-panchang)" fontWeight={800} fontSize="26" fontStyle="italic" fill={fill}>D</text>
    </svg>
  );
}
