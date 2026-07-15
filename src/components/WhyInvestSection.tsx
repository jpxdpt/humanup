"use client";

import { SplitContent } from "@/components/SplitContent";
import { useContent } from "@/lib/content-store";

export function WhyInvestSection() {
  const { content } = useContent();
  const { whyInvest } = content.home;
  return (
    <SplitContent
      image="/images/emoji-card.jpg"
      imageAlt="Disposicao Da Vista Superior Com Um Cartao Emoji Sorridente"
      imagePosition="left"
      body={whyInvest.body}
      ctaLabel={whyInvest.ctaLabel}
      ctaHref={whyInvest.ctaHref}
    />
  );
}
