"use client";
import { useEffect, useRef, useState } from "react";

/**
 * A green "drag" badge that follows the pointer only while it's over a
 * draggable zone (anything tagged `data-cursor`). Desktop fine-pointer only;
 * touch devices and reduced-motion get nothing. Purely decorative, so it never
 * intercepts pointer events.
 */
export function CursorHint() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let x = -100;
    let y = -100;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const zone = (e.target as HTMLElement | null)?.closest?.("[data-cursor]");
      setLabel(zone ? zone.getAttribute("data-cursor") : null);
    };
    const loop = () => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 hidden lg:block" style={{ zIndex: 55 }}>
      <span
        className={`-translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap rounded-full bg-green px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink transition-[opacity,transform] duration-200 ${
          label ? "scale-100 opacity-100" : "scale-50 opacity-0"
        } inline-block`}
      >
        ↔ {label}
      </span>
    </div>
  );
}
