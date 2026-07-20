"use client";

import { SplitContent } from "@/components/SplitContent";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";

export function WhyInvestSection() {
  const home = useSiteContentSection("home");

  return (
    <SplitContent
      imageKey="home.whyInvest.image"
      imageFallback={FALLBACKS["home.whyInvest.image"]}
      imageAlt="Disposicao Da Vista Superior Com Um Cartao Emoji Sorridente"
      imagePosition="left"
      bodyKey="home.whyInvest.body"
      bodyFallback={home["whyInvest.body"] ?? FALLBACKS["home.whyInvest.body"]}
      ctaLabelKey="home.whyInvest.ctaLabel"
      ctaLabelFallback={home["whyInvest.ctaLabel"] ?? FALLBACKS["home.whyInvest.ctaLabel"]}
      ctaHref={home["whyInvest.ctaHref"] ?? FALLBACKS["home.whyInvest.ctaHref"]}
    />
  );
}
