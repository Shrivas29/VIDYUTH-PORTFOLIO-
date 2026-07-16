export function SectionMarker({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-px w-full max-w-xs bg-ink/80" />
      <div className="flex items-center gap-3">
        <span className="size-1.5 rounded-full bg-ink" aria-hidden />
        <span className="text-xs font-bold uppercase tracking-[0.04em]">{label}</span>
      </div>
    </div>
  );
}
