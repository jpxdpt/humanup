"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AboutFlow } from "@/components/AboutFlow";

export default function SobrePage() {
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">
            <AboutFlow />
          </article>
        </main>
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
