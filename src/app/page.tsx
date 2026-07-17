import { Hero } from "@/components/chapters/Hero";
import { Driver } from "@/components/chapters/Driver";
import { Stats } from "@/components/chapters/Stats";
import { Beginnings } from "@/components/chapters/Beginnings";
import { RoadToF1 } from "@/components/chapters/RoadToF1";
import { Gallery } from "@/components/chapters/Gallery";
import { Life } from "@/components/chapters/Life";
import { Partners } from "@/components/chapters/Partners";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Driver />
      <Stats />
      <Beginnings />
      <RoadToF1 />
      <Gallery />
      <Life />
      <Partners />
      <Footer />
    </main>
  );
}
