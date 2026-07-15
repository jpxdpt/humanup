"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ServicesFlow } from "@/components/ServicesFlow";

export default function ServicosPage() {
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">
            <ServicesFlow />
          </article>
        </main>
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
