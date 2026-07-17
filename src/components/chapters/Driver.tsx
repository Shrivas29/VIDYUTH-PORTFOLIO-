import Image from "next/image";
import { SectionMarker } from "@/components/SectionMarker";
import { driver } from "@/data/site";

export function Driver() {
  return (
    <section id="driver" className="bg-graph px-5 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="The Driver" />
        <p className="mt-10 max-w-[34ch] font-body text-[clamp(1.5rem,3vw,2.2rem)] font-semibold leading-snug">
          {driver.intro}
        </p>
        <div className="mt-16 grid gap-10 md:grid-cols-[320px_1fr] md:gap-16">
          <Image
            src="/media/portrait.webp"
            alt={`${driver.name} in his race suit and green helmet`}
            width={590}
            height={782}
            className="w-full max-w-xs"
            sizes="(min-width: 768px) 320px, 90vw"
          />
          <div className="flex max-w-[65ch] flex-col gap-5 self-center text-[15px] leading-relaxed">
            {driver.bio.map((p) => (
              <p key={p.slice(0, 16)}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
