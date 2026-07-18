import { DiagonalItem } from "@/components/DiagonalItem";
import { SectionMarker } from "@/components/SectionMarker";
import { LayeredText } from "@/components/ui/layered-text";

// His rising path, each rung rolling into the next on hover.
const climb = [
  { top: " ", bottom: "KARTING" },
  { top: "KARTING", bottom: "PODIUMS" },
  { top: "PODIUMS", bottom: "JUNIORS" },
  { top: "JUNIORS", bottom: "FORMULA 1" },
  { top: "FORMULA 1", bottom: "THE GRID" },
  { top: "THE GRID", bottom: " " },
];

export function Ambition() {
  return (
    <section id="climb" className="bg-ink px-5 py-28 text-white-soft md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="The Climb" inverted />
        <p className="mt-8 max-w-[34ch] font-body text-[clamp(1.25rem,2.6vw,1.8rem)] font-semibold leading-snug text-white-soft/90">
          Karting today. The Formula 1 grid tomorrow.
        </p>
        <DiagonalItem className="mt-14 md:mt-20">
          <LayeredText lines={climb} className="text-white-soft" />
        </DiagonalItem>
      </div>
    </section>
  );
}
