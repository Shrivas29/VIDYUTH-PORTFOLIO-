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

function Photo({ photo }: { photo: GalleryPhoto }) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      className="h-80 w-auto shrink-0 snap-start object-cover md:h-[28rem]"
      sizes="(min-width: 768px) 45vw, 85vw"
      draggable={false}
    />
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
            {gallery.map((photo) => (
              <Photo key={photo.src} photo={photo} />
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
                {gallery.map((photo) => (
                  <Photo key={photo.src} photo={photo} />
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
