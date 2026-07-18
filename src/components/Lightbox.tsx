"use client";
import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { gallery } from "@/data/site";

const btn =
  "absolute z-10 grid size-11 place-items-center bg-white-soft/10 text-2xl text-white-soft backdrop-blur-sm transition-colors duration-150 hover:bg-green hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green cursor-pointer";

/** Full-screen photo viewer: click a wall tile to open, arrows / swipe / Esc to move. */
export function Lightbox({
  index,
  onClose,
  onNav,
}: {
  index: number | null;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  const open = index !== null;
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      onNav((index + dir + gallery.length) % gallery.length);
    },
    [index, onNav]
  );

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, onClose]);

  const photo = index !== null ? gallery[index] : null;

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 grid place-items-center bg-ink/95 p-4 backdrop-blur-sm md:p-10"
          style={{ zIndex: 80 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button ref={closeRef} className={`${btn} right-4 top-4`} onClick={onClose} aria-label="Close viewer">
            ✕
          </button>
          <button
            className={`${btn} left-4 top-1/2 -translate-y-1/2`}
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <motion.figure
            key={photo.src}
            className="relative flex max-h-full max-w-full flex-col items-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="max-h-[80vh] w-auto select-none object-contain"
              sizes="90vw"
              draggable={false}
              priority
            />
            <figcaption className="mt-4 max-w-[60ch] text-center text-xs font-bold uppercase tracking-[0.06em] text-white-soft/60">
              {photo.alt} · {index! + 1} / {gallery.length}
            </figcaption>
          </motion.figure>
          <button
            className={`${btn} right-4 top-1/2 -translate-y-1/2`}
            onClick={(e) => { e.stopPropagation(); go(1); }}
            aria-label="Next photo"
          >
            ›
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
