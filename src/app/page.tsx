import { Hero } from "@/components/chapters/Hero";
import { Driver } from "@/components/chapters/Driver";
import { Stats } from "@/components/chapters/Stats";
import { Beginnings } from "@/components/chapters/Beginnings";
import { RoadToF1 } from "@/components/chapters/RoadToF1";
import { QuoteScrub } from "@/components/chapters/QuoteScrub";

export default function Home() {
  return (
    <main>
      <Hero />
      <Driver />
      <Stats />
      <Beginnings />
      <RoadToF1 />
      <QuoteScrub />
    </main>
  );
}
