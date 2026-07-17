"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, wrap } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SeamCurtain } from "@/components/SeamCurtain";
import { SectionMarker } from "@/components/SectionMarker";
import { SeamAccent } from "@/components/SeamAccent";
import { gallery, type GalleryPhoto } from "@/data/site";

/**
 * Infinite draggable polaroid wall. The photo block renders four times in
 * a 2×2 tile; x/y wrap at half the content size on every change, so
 * dragging never finds an edge. Wheel stays with Lenis (a page section
 * must never trap scrolling) and touch-action pan-y keeps vertical swipes
 * scrolling the story on mobile — horizontal drags explore the wall.
 * Reduced motion falls back to the plain snap-scroll track.
 */

const polaroid =
  "h-fit w-fit border-[10px] border-b-[28px] border-white shadow-xl transition-transform duration-300 ease-out even:mt-[60%] even:rotate-3 odd:-rotate-2 hover:rotate-0 will-change-transform";

function WallItem({ photo, index, reduced }: { photo: GalleryPhoto; index: number; reduced: boolean }) {
  return (
    <motion.div
      className={polaroid}
      initial={false}
      whileInView={reduced ? undefined : { opacity: [0, 1], scale: [0.3, 1] }}
      viewport={{ once: true }}
      transition={{ delay: (index * 0.37) % 0.7, duration: 1.2, ease: [0.18, 0.71, 0.11, 1] }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        className="size-40 object-cover md:size-52"
        sizes="(min-width: 768px) 208px, 160px"
        draggable={false}
      />
    </motion.div>
  );
}

function PhotoBlock({ reduced }: { reduced: boolean }) {
  return (
    <div className="grid h-fit w-fit grid-cols-[repeat(6,max-content)] gap-x-14 gap-y-10 px-7 md:gap-x-28 md:px-14">
      {gallery.map((photo, i) => (
        <WallItem key={photo.src} photo={photo} index={i} reduced={reduced} />
      ))}
    </div>
  );
}

export function Gallery() {
  const reduced = useHydratedReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dims = useRef({ w: 1, h: 1 });

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    // offsetWidth/Height: the untransformed content size the wrap tiles over
    const measure = () => {
      dims.current = { w: Math.max(1, el.offsetWidth), h: Math.max(1, el.offsetHeight) };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const unX = x.on("change", (v) => x.set(wrap(-(dims.current.w / 2), 0, v)));
    const unY = y.on("change", (v) => y.set(wrap(-(dims.current.h / 2), 0, v)));
    return () => {
      ro.disconnect();
      unX();
      unY();
    };
  }, [reduced, x, y]);

  return (
    <section id="gallery" className="relative bg-graph">
      <SeamCurtain />
      <div className="pointer-events-none absolute left-5 top-14 z-10 md:left-12 lg:left-20">
        <SectionMarker label="Gallery" />
      </div>
      {reduced ? (
        <div className="px-5 pb-24 pt-32 md:px-12 lg:px-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
              {gallery.map((photo) => (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className="h-80 w-auto shrink-0 snap-start object-cover"
                  sizes="85vw"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="pointer-events-none absolute right-5 top-14 z-10 text-xs font-bold uppercase tracking-[0.04em] text-ink/70 md:right-12 lg:right-20">
            Drag to explore
          </p>
          <div className="h-dvh overflow-hidden">
            <motion.div
              ref={ref}
              className="grid h-fit w-fit cursor-grab grid-cols-[repeat(2,max-content)] will-change-transform active:cursor-grabbing"
              drag
              dragMomentum
              dragTransition={{ timeConstant: 200, power: 0.28, restDelta: 0, bounceStiffness: 0 }}
              style={{ x, y, touchAction: "pan-y" }}
            >
              {Array.from({ length: 4 }).map((_, block) => (
                <PhotoBlock key={block} reduced={reduced} />
              ))}
            </motion.div>
          </div>
        </>
      )}
      <SeamAccent />
    </section>
  );
}
