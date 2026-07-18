"use client";
import { useEffect, useState } from "react";
import { chapters, darkChapters } from "@/data/site";

/**
 * Fixed chapter rail (desktop only): one dot per section, active dot filled
 * green, label revealed on hover. Colours flip over the ink sections so the
 * dots never sink into the background.
 */
export function SideNav() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const els = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);
        setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const dark = darkChapters.has(active);

  return (
    <nav
      aria-label="Sections"
      className="fixed left-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3.5 lg:flex"
      style={{ zIndex: 44 }}
    >
      {chapters.map((c) => {
        const on = c.id === active;
        return (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-label={c.label}
            aria-current={on ? "true" : undefined}
            className="group flex items-center gap-3"
          >
            <span
              className={`size-2 rounded-full border transition-all duration-300 ${
                on
                  ? "scale-125 border-green bg-green"
                  : dark
                    ? "border-white-soft/40 bg-transparent group-hover:border-white-soft"
                    : "border-ink/40 bg-transparent group-hover:border-ink"
              }`}
            />
            <span
              className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.1em] opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                dark ? "text-white-soft" : "text-ink"
              }`}
            >
              {c.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
