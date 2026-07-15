"use client";

import Link from "next/link";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import { useContent } from "@/lib/content-store";

export function HeroFlowCards() {
  const { content } = useContent();
  const { hero, stats, whyInvest } = content.home;
  const statCards = stats.slice(0, 3);

  return (
    <FlowArt aria-label="HumanUp — apresentação">
      {/* Card 1: Hero */}
      <FlowSection aria-label={hero.title} className="justify-center items-center text-center bg-on-surface text-white">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
          />
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />
        </div>
        <div className="relative z-10 max-w-[920px] mx-auto">
          <h1 className="text-display uppercase mb-8">{hero.title}</h1>
          <p className="font-sans text-base md:text-lg font-medium leading-[26.4px] text-white/85 mb-10 max-w-[560px] mx-auto">
            {hero.description}
          </p>
          <Link
            href={hero.ctaHref}
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            {hero.ctaLabel}
          </Link>
        </div>
      </FlowSection>

      {/* Stat cards */}
      {statCards.map((stat, i) => (
        <FlowSection
          key={i}
          aria-label={`Estatística ${i + 1}`}
          className={i % 2 === 0 ? "justify-center items-center text-center bg-on-surface text-white" : "justify-center items-center text-center bg-primary text-primary-foreground"}
        >
          <div className="relative z-10 max-w-[900px] mx-auto">
            <span className={i % 2 === 0 ? "text-display text-primary-container block mb-6" : "text-display text-white block mb-6"}>
              {stat.value}{stat.suffix}
            </span>
            <p
              className="font-sans text-xl md:text-2xl font-medium leading-snug max-w-[640px] mx-auto opacity-90"
              dangerouslySetInnerHTML={{ __html: stat.label }}
            />
          </div>
        </FlowSection>
      ))}

      {/* Closing card: teaser into WhyInvest */}
      <FlowSection aria-label={whyInvest.title} className="justify-center items-center text-center bg-white text-foreground">
        <div className="relative z-10 max-w-[900px] mx-auto">
          <h2 className="text-display mb-8">{whyInvest.title}</h2>
          <Link
            href={whyInvest.ctaHref}
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            {whyInvest.ctaLabel}
          </Link>
        </div>
      </FlowSection>
    </FlowArt>
  );
}
