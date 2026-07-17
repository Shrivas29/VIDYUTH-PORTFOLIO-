"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SectionMarker } from "@/components/SectionMarker";
import { SeamAccent } from "@/components/SeamAccent";
import { TrackArrows } from "@/components/TrackArrows";
import { useDragTrack } from "@/lib/useDragTrack";
import { gallery, type GalleryPhoto } from "@/data/site";

const CARD_STEP = 424; // average card width 400 + gap 24

function Photo({ photo, index, reduced }: { photo: GalleryPhoto; index: number; reduced: boolean }) {
  return (
    <motion.div
      className="shrink-0 snap-start"
      initial={false}
      whileInView={reduced ? undefined : { opacity: [0, 1], x: [44, 0], y: [20, 0] }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        className="h-80 w-auto object-cover md:h-[28rem]"
        sizes="(min-width: 768px) 45vw, 85vw"
        draggable={false}
      />
    </motion.div>
  );
}

export function Gallery() {
  const reduced = useHydratedReducedMotion();
  const { viewportRef, trackRef, x, prev, next } = useDragTrack(CARD_STEP);

  return (
    <section id="gallery" className="relative bg-graph px-5 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Gallery" />
        {reduced ? (
          <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {gallery.map((photo, i) => (
              <Photo key={photo.src} photo={photo} index={i} reduced={reduced} />
            ))}
          </div>
        ) : (
          <>
            <div ref={viewportRef} className="mt-12 overflow-hidden">
              <motion.div
                ref={trackRef}
                drag="x"
                dragConstraints={viewportRef}
                style={{ x }}
                whileTap={{ cursor: "grabbing" }}
                className="flex w-max cursor-grab gap-6"
              >
                {gallery.map((photo, i) => (
                  <Photo key={photo.src} photo={photo} index={i} reduced={reduced} />
                ))}
              </motion.div>
            </div>
            <div className="mt-8">
              <TrackArrows onPrev={prev} onNext={next} itemsLabel="photos" />
            </div>
          </>
        )}
      </div>
      <SeamAccent />
    </section>
  );
}
