import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { ServicesSwiper } from "@/components/ServicesSwiper";
import { WhyInvestSection } from "@/components/WhyInvestSection";
import { StatsCounter } from "@/components/StatsCounter";
import { CTASection } from "@/components/CTASection";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">
            <HeroSection />
            <ServicesSwiper />
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
