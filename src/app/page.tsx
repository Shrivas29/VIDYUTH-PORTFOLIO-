import { Hero } from "@/components/chapters/Hero";
import { Driver } from "@/components/chapters/Driver";
import { Stats } from "@/components/chapters/Stats";
import { Beginnings } from "@/components/chapters/Beginnings";

export default function Home() {
  return (
    <main>
      <Hero />
      <Driver />
      <Stats />
      <Beginnings />
    </main>
  );
}
