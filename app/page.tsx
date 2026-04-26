// app/page.tsx
// RSC orchestrator — thin. 5 sections, single CTA /audit.

import LandingViewTracker from "@/components/landing/LandingViewTracker";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import StatsBar from "@/components/landing/StatsBar";
import TargetGrid from "@/components/landing/TargetGrid";
import HowItWorksTimeline from "@/components/landing/HowItWorksTimeline";
import ValueProps from "@/components/landing/ValueProps";
import Testimonial from "@/components/landing/Testimonial";
import FAQCards from "@/components/landing/FAQCards";
import CTABand from "@/components/landing/CTABand";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollFadeUp from "@/components/landing/ScrollFadeUp";

export default function LandingPage() {
  return (
    <>
      <LandingViewTracker />
      <LandingNav />
      <main>
        {/* 1. Hero */}
        <LandingHero />

        {/* 2. Stats + Target */}
        <ScrollFadeUp>
          <StatsBar />
        </ScrollFadeUp>
        <ScrollFadeUp>
          <TargetGrid />
        </ScrollFadeUp>

        {/* 3. How It Works + Value + Score */}
        <ScrollFadeUp>
          <HowItWorksTimeline />
        </ScrollFadeUp>
        <ScrollFadeUp>
          <ValueProps />
        </ScrollFadeUp>

        {/* 4. Testimonial + FAQ + CTA final */}
        <ScrollFadeUp>
          <Testimonial />
        </ScrollFadeUp>
        <ScrollFadeUp>
          <FAQCards />
        </ScrollFadeUp>
        <ScrollFadeUp>
          <CTABand />
        </ScrollFadeUp>
      </main>
      {/* 5. Footer */}
      <LandingFooter />
    </>
  );
}
