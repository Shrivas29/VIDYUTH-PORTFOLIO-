"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { quote } from "@/data/site";

export function QuoteScrub() {
  const outer = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-106%"]);
  // The pinned backdrop creeps vertically while the quote scrubs across —
  // two layers moving at different speeds sell the depth of the pin.
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const reduced = useHydratedReducedMotion();

  if (reduced) {
    return (
      <section id="quote" className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-6">
        <Image src="/media/photo-01.webp" alt="" fill className="object-cover opacity-40 blur-sm" sizes="100vw" />
        <p className="font-display relative max-w-[14ch] text-center text-[clamp(2.5rem,8vw,5rem)] text-white-soft">
          {quote}
        </p>
      </section>
    );
  }

  return (
    <section id="quote" ref={outer} className="relative h-[300svh] bg-ink">
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: bgY, scale: 1.14 }} aria-hidden>
          <Image
            src="/media/photo-01.webp"
            alt=""
            fill
            className="object-cover opacity-45 blur-[6px]"
            sizes="100vw"
          />
        </motion.div>
        <div className="flex h-full items-center">
          <motion.p style={{ x }} className="font-display whitespace-nowrap text-[clamp(8rem,28vh,22rem)] text-white-soft">
            {quote}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
