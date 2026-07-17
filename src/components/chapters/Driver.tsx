import Image from "next/image";
import { DiagonalItem } from "@/components/DiagonalItem";
import { ParallaxFrame } from "@/components/ParallaxFrame";
import { SeamCurtain } from "@/components/SeamCurtain";
import { SectionMarker } from "@/components/SectionMarker";
import { driver } from "@/data/site";

export function Driver() {
  return (
    <section id="driver" className="relative bg-graph px-5 py-24 md:px-12 lg:px-20">
      <SeamCurtain />
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="The Driver" />
        <DiagonalItem>
          <p className="mt-10 max-w-[34ch] font-body text-[clamp(1.5rem,3vw,2.2rem)] font-semibold leading-snug">
            {driver.intro}
          </p>
        </DiagonalItem>
        <div className="mt-16 grid gap-10 md:grid-cols-[320px_1fr] md:gap-16">
          <DiagonalItem>
            <ParallaxFrame className="aspect-[590/782] w-full max-w-xs">
              <Image
                src="/media/portrait.webp"
                alt={`${driver.name} in his race suit and green helmet`}
                width={590}
                height={782}
                className="size-full object-cover"
                sizes="(min-width: 768px) 320px, 90vw"
              />
            </ParallaxFrame>
          </DiagonalItem>
          <DiagonalItem delay={0.12} className="flex max-w-[65ch] flex-col gap-5 self-center text-[15px] leading-relaxed">
            {driver.bio.map((p) => (
              <p key={p.slice(0, 16)}>{p}</p>
            ))}
          </DiagonalItem>
        </div>
      </div>
    </section>
  );
}
