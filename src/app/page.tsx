import React from "react";
import Hero from "@/components/Home/Hero";
import Work from "@/components/Home/work";
import TimeLine from "@/components/Home/timeline";
import Platform from "@/components/Home/platform";
import Portfolio from "@/components/Home/portfolio";
import DynamicStats from "@/components/DynamicStats/DynamicStats";
import TestimonialCarousel from "@/components/TestimonialCarousel/TestimonialCarousel";
import Upgrade from "@/components/Home/upgrade";
import Perks from "@/components/Home/perks";
import FAQSection from "@/components/FAQSection";
import VideoSection from "@/components/VideoSection";
  

export const metadata = {
  title: "River - home",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Work />
      <TimeLine />
      <Platform />
      <Portfolio />
      <DynamicStats />
      <VideoSection />
      <TestimonialCarousel />
      <FAQSection />
      <Upgrade />
      <Perks />
    </main>
  );
}
