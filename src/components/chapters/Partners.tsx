import { SectionMarker } from "@/components/SectionMarker";

const logoSlots = ["Season partner", "Race-day partner", "Kit partner"];

export function Partners() {
  return (
    <section id="partners" className="bg-graph px-5 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Partners" as="p" />
        <h2 className="font-display mt-10 text-[clamp(2.5rem,7vw,5.5rem)]">Partner with Vidyuth</h2>
        <p className="mt-6 max-w-[55ch] text-[15px] leading-relaxed">
          Your brand on a rising driver&rsquo;s kart, suit, and story. Season sponsorships and
          single-race packages.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {logoSlots.map((slot) => (
            <div
              key={slot}
              className="flex h-36 flex-col items-center justify-center gap-2 border border-dashed border-ink/50"
            >
              <span className="font-display text-xl text-ink/70">Your logo here</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-ink/70">{slot}</span>
            </div>
          ))}
        </div>
        <a
          href="#contact"
          className="mt-12 inline-flex min-h-11 cursor-pointer items-center bg-green px-8 py-3 text-sm font-extrabold uppercase tracking-[0.04em] text-ink transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          style={{ clipPath: "polygon(4% 0, 100% 0, 96% 100%, 0 100%)" }}
        >
          Start the conversation
        </a>
      </div>
    </section>
  );
}
