"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Monogram } from "./Monogram";
import { chapters } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);
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

  return (
    <header
      className="fixed inset-x-0 top-0 flex items-center justify-between px-5 py-4 md:px-8"
      style={{ zIndex: "var(--z-header)" }}
    >
      <a href="#hero" aria-label="Vidyuth 12, back to top" className="cursor-pointer">
        <Monogram />
      </a>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-[0.04em] mix-blend-difference text-white-soft"
        >
          Chapters
          <motion.span animate={{ rotate: open ? 180 : 0 }} aria-hidden>▾</motion.span>
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
              {chapters.map((c) => (
                <a key={c.id} role="menuitem" href={`#${c.id}`} onClick={() => setOpen(false)}
                  className="cursor-pointer px-4 py-2.5 text-sm font-bold text-white-soft hover:bg-green hover:text-ink">
                  {c.label}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
