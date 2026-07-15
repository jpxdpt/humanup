"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { HeroFlowCards } from "@/components/HeroFlowCards";
import { ServicesSwiper } from "@/components/ServicesSwiper";
import { WhyInvestSection } from "@/components/WhyInvestSection";
import { StatsCounter } from "@/components/StatsCounter";
import { CTASection } from "@/components/CTASection";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FullImageBand } from "@/components/FullImageBand";

export default function Home() {
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">
            <HeroFlowCards />
            <ServicesSwiper />
            <FullImageBand
              image="/images/hero-bg.jpg"
              imageAlt="Equipa HumanUp"
              height="md"
            />
            <WhyInvestSection />
            <StatsCounter />
            <CTASection />
          </article>
        </main>
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
