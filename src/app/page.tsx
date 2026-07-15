"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { HeroFlowCards } from "@/components/HeroFlowCards";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">
            <HeroFlowCards />
          </article>
        </main>
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
