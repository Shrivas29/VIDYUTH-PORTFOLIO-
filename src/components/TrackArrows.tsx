const arrowClass =
  "grid size-11 cursor-pointer place-items-center border border-ink/60 transition-colors duration-200 hover:bg-ink hover:text-white-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function TrackArrows({
  onPrev,
  onNext,
  itemsLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  itemsLabel: string;
}) {
  return (
    <div className="flex gap-3">
      <button type="button" aria-label={`Previous ${itemsLabel}`} onClick={onPrev} className={arrowClass}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 3 5 8l5 5" />
        </svg>
      </button>
      <button type="button" aria-label={`Next ${itemsLabel}`} onClick={onNext} className={arrowClass}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 3 5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}
