"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Monogram } from "./Monogram";
import { chapters, darkChapters } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("hero");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Track which chapter sits under the header, for the theme flip and the
  // active-chapter highlight. A thin band just below the header is the probe;
  // the section whose top is nearest that line wins.
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
        setActiveId(visible[0].target.id);
      },
      { rootMargin: "-64px 0px -88% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const dark = darkChapters.has(activeId);

  return (
    <header
      className="fixed inset-x-0 top-0 flex items-center justify-between px-5 py-4 md:px-8"
      style={{ zIndex: "var(--z-header)" }}
    >
      {/* No aria-label here: the Monogram already names this "V12". A second
          name on the link conflicts with it (WCAG 2.5.3, Label in Name). */}
      <a href="#hero" className="cursor-pointer">
        <Monogram inverted={dark} />
      </a>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={`flex min-h-11 cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-[0.04em] transition-colors duration-300 ${
            dark ? "text-white-soft" : "text-ink"
          }`}
        >
          Chapters
          <motion.span animate={{ rotate: open ? 180 : 0 }} aria-hidden>
            ▾
          </motion.span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.nav
              role="menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 mt-3 flex w-56 flex-col bg-ink p-2"
              style={{ zIndex: "var(--z-menu)" }}
            >
              {chapters.map((c) => {
                const active = c.id === activeId;
                return (
                  <a
                    key={c.id}
                    role="menuitem"
                    href={`#${c.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "true" : undefined}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold hover:bg-green hover:text-ink ${
                      active ? "text-green" : "text-white-soft"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full bg-green transition-opacity ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden
                    />
                    {c.label}
                  </a>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
