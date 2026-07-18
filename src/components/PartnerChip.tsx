"use client";
import { useEffect, useState } from "react";

/**
 * Floating call-to-action. It retires once the Partners section or the footer
 * is on screen — both already carry the same "Partner with Vidyuth" ask, so
 * keeping the chip there just stacked the message three times and covered the
 * content. A short fade/slide out reads as intent, not a disappearing bug.
 */
export function PartnerChip() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = ["partners", "contact"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Hide while any target is even partially visible.
        const anyVisible = entries.some((e) => e.isIntersecting);
        setHidden(anyVisible);
      },
      { threshold: 0 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <a
      href="#partners"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      className={`fixed bottom-5 right-5 flex min-h-11 cursor-pointer items-center gap-2 bg-green px-5 py-3 text-xs font-extrabold uppercase tracking-[0.04em] text-ink transition-all duration-300 ease-out hover:-translate-y-0.5 ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
      }`}
      style={{ zIndex: "var(--z-sticky)", clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)" }}
    >
      Partner with Vidyuth
    </a>
  );
}
