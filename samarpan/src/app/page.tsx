import { Hero } from "@/components/home/hero";
import { ImpactStats } from "@/components/home/impact-stats";
import { EcosystemMap } from "@/components/home/ecosystem-map";
import { StorySection } from "@/components/home/story-section";

export default function Home() {
  return (
    <>
      <Hero />
      <ImpactStats />
      <EcosystemMap />
      <StorySection />
    </>
  );
}
