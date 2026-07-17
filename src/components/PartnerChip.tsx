export function PartnerChip() {
  return (
    <a
      href="#partners"
      className="fixed bottom-5 right-5 flex min-h-11 cursor-pointer items-center gap-2 bg-green px-5 py-3 text-xs font-extrabold uppercase tracking-[0.04em] text-ink transition-transform duration-200 hover:-translate-y-0.5"
      style={{ zIndex: "var(--z-sticky)", clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)" }}
    >
      Partner with Vidyuth
    </a>
  );
}
