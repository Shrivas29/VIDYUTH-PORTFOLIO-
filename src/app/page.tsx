import { Hero } from "@/components/chapters/Hero";
import { Driver } from "@/components/chapters/Driver";
import { Stats } from "@/components/chapters/Stats";
import { Beginnings } from "@/components/chapters/Beginnings";
import { RoadToF1 } from "@/components/chapters/RoadToF1";
import { Gallery } from "@/components/chapters/Gallery";
import { Life } from "@/components/chapters/Life";
import { Partners } from "@/components/chapters/Partners";
import { Footer } from "@/components/Footer";
import { DiagonalArrival } from "@/components/DiagonalArrival";

// Driver/Stats/Beginnings share one continuous graph background, so they
// arrive as a single spread; every other chapter flies in on its own.
export default function Home() {
  return (
    <main>
      <Hero />
      <DiagonalArrival>
        <Driver />
        <Stats />
        <Beginnings />
      </DiagonalArrival>
      <DiagonalArrival>
        <RoadToF1 />
      </DiagonalArrival>
      <DiagonalArrival>
        <Gallery />
      </DiagonalArrival>
      <DiagonalArrival>
        <Life />
      </DiagonalArrival>
      <DiagonalArrival>
        <Partners />
      </DiagonalArrival>
      <DiagonalArrival>
        <Footer />
      </DiagonalArrival>
    </main>
  );
}
