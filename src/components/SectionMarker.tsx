export function SectionMarker({
  label,
  inverted = false,
  as: Tag = "h2",
}: {
  label: string;
  inverted?: boolean;
  /** "p" for sections that carry their own display h2, keeping one h2 per chapter. */
  as?: "h2" | "p";
}) {
  // Tailwind extracts class names statically, so both palettes are spelled out.
  const rule = inverted ? "bg-white-soft/80" : "bg-ink/80";
  const dot = inverted ? "bg-white-soft" : "bg-ink";
  const text = inverted ? "text-white-soft" : "text-ink";
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-px w-full max-w-xs ${rule}`} aria-hidden />
      <div className="flex items-center gap-3">
        <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
        <Tag className={`text-xs font-bold uppercase tracking-[0.04em] ${text}`}>{label}</Tag>
      </div>
    </div>
  );
}
