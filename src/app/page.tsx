import { Hero } from "@/components/chapters/Hero";
import { Driver } from "@/components/chapters/Driver";
import { Stats } from "@/components/chapters/Stats";
import { NextRace } from "@/components/chapters/NextRace";
import { Beginnings } from "@/components/chapters/Beginnings";
import { RoadToF1 } from "@/components/chapters/RoadToF1";
import { Gallery } from "@/components/chapters/Gallery";
import { Highlight } from "@/components/chapters/Highlight";
import { Life } from "@/components/chapters/Life";
import { Creed } from "@/components/chapters/Creed";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Driver />
      <Stats />
      <NextRace />
      <Beginnings />
      <RoadToF1 />
      <Gallery />
      <Highlight />
      <Life />
      <Creed />
      <Footer />
    </main>
  );
}
