"use client";

import Link from "next/link";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableText } from "@/components/cms/EditableText";
import { EditableBackground } from "@/components/cms/EditableBackground";

export function HeroFlowCards() {
  const home = useSiteContentSection("home");

  const hero = {
    title: home["hero.title"] ?? FALLBACKS["home.hero.title"],
    description: home["hero.description"] ?? FALLBACKS["home.hero.description"],
    ctaLabel: home["hero.ctaLabel"] ?? FALLBACKS["home.hero.ctaLabel"],
    ctaHref: home["hero.ctaHref"] ?? FALLBACKS["home.hero.ctaHref"],
  };

  const services = Array.from({ length: 4 }, (_, i) => ({
    title: home[`services.${i}.title`] ?? FALLBACKS[`home.services.${i}.title`],
    description: home[`services.${i}.description`] ?? FALLBACKS[`home.services.${i}.description`],
    buttonText: home[`services.${i}.buttonText`] ?? FALLBACKS[`home.services.${i}.buttonText`],
    buttonHref: home[`services.${i}.buttonHref`] ?? FALLBACKS[`home.services.${i}.buttonHref`],
  }));

  const stats = Array.from({ length: 6 }, (_, i) => ({
    value: Number(home[`stats.${i}.value`] ?? FALLBACKS[`home.stats.${i}.value`]),
    suffix: home[`stats.${i}.suffix`] ?? FALLBACKS[`home.stats.${i}.suffix`],
    label: home[`stats.${i}.label`] ?? FALLBACKS[`home.stats.${i}.label`],
  }));

  const topStats = stats.slice(0, 3);
  const bottomStats = stats.slice(3, 6);
  const statsSource = home["statsSource"] ?? FALLBACKS["home.statsSource"];

  const whyInvest = {
    title: home["whyInvest.title"] ?? FALLBACKS["home.whyInvest.title"],
  };

  const cta = {
    title: home["cta.title"] ?? FALLBACKS["home.cta.title"],
    buttonLabel: home["cta.buttonLabel"] ?? FALLBACKS["home.cta.buttonLabel"],
    buttonHref: home["cta.buttonHref"] ?? FALLBACKS["home.cta.buttonHref"],
  };

  return (
    <FlowArt aria-label="HumanUp — apresentação">
      {/* 01 — A HumanUp */}
      <EditableBackground
        contentKey="home.hero.backgroundImage"
        fallback={FALLBACKS["home.hero.backgroundImage"]}
        overlay="rgba(20,20,20,0.55)"
      >
        <FlowSection aria-label={hero.title} className="bg-on-surface text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 to-black/25 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-6 min-h-full">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">01 — A HumanUp</p>
            <hr className="border-none border-t border-white/20" />
            <div>
              <EditableText contentKey="home.hero.title" fallback={hero.title} tag="h1" className="text-display uppercase" />
            </div>
            <hr className="border-none border-t border-white/20" />
            <EditableText
              contentKey="home.hero.description"
              fallback={hero.description}
              tag="p"
              className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-white whitespace-pre-line"
              multiline
            />
            <hr className="border-none border-t border-white/20" />
            <Link
              href={hero.ctaHref}
              className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity self-start"
            >
              {hero.ctaLabel}
            </Link>
          </div>
        </FlowSection>
      </EditableBackground>

      {/* 02 — O Problema */}
      <EditableBackground
        contentKey="home.section02.backgroundImage"
        fallback={FALLBACKS["home.section02.backgroundImage"]}
        overlay="rgba(243,163,42,0.6)"
      >
        <FlowSection aria-label="O Problema" className="bg-primary-container text-on-primary-container opacity-100">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">02 — O Problema</p>
          <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
          <div>
            <EditableText contentKey="home.section02.title" tag="h2" className="text-display uppercase whitespace-pre-line" />
          </div>
          <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
          <EditableText
            contentKey="home.section02.description"
            tag="p"
            className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-primary-container opacity-100 whitespace-pre-line"
            multiline
          />
          <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
          <div className="flex flex-wrap gap-[3vw]">
            {topStats.map((stat, i) => (
              <div key={i} className="min-w-[180px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                  <span className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-on-primary-container opacity-100">
                    {stat.value}{stat.suffix}
                  </span>
                </p>
                <p className="text-sm md:text-base font-medium leading-relaxed text-on-primary-container opacity-100 whitespace-pre-line">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FlowSection>
      </EditableBackground>

      {/* 03 — A Solução */}
      <EditableBackground
        contentKey="home.section03.backgroundImage"
        fallback={FALLBACKS["home.section03.backgroundImage"]}
        overlay="rgba(255,255,255,0.6)"
      >
        <FlowSection aria-label="A Solução" className="bg-surface text-on-surface">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">03 — A Solução</p>
          <hr className="my-[2vw] border-none border-t border-on-surface/15" />
          <div>
            <EditableText contentKey="home.section03.title" tag="h2" className="text-display uppercase whitespace-pre-line" />
          </div>
          <hr className="my-[2vw] border-none border-t border-on-surface/15" />
          <EditableText
            contentKey="home.section03.description"
            tag="p"
            className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-surface whitespace-pre-line"
            multiline
          />
          <hr className="my-[2vw] border-none border-t border-on-surface/15" />
          <div className="flex flex-wrap gap-[3vw]">
            {services.slice(0, 3).map((service, i) => (
              <div key={i} className="min-w-[180px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                  {service.title}
                </p>
                <p className="text-sm md:text-base font-medium leading-relaxed text-on-surface whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <hr className="my-[2vw] border-none border-t border-on-surface/15" />
          <Link
            href="/servicos"
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity self-start"
          >
            Saber Mais
          </Link>
        </FlowSection>
      </EditableBackground>

      {/* 04 — O Impacto */}
      <EditableBackground
        contentKey="home.section04.backgroundImage"
        fallback={FALLBACKS["home.section04.backgroundImage"]}
        overlay="rgba(132,84,0,0.6)"
      >
        <FlowSection aria-label="O Impacto" className="bg-primary text-on-primary">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">04 — O Impacto</p>
          <hr className="my-[2vw] border-none border-t border-on-primary/30" />
          <div>
            <EditableText contentKey="home.section04.title" tag="h2" className="text-display uppercase whitespace-pre-line" />
          </div>
          <hr className="my-[2vw] border-none border-t border-on-primary/30" />
          <EditableText
            contentKey="home.section04.description"
            tag="p"
            className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-primary whitespace-pre-line"
            multiline
          />
          <hr className="my-[2vw] border-none border-t border-on-primary/30" />
          <div className="flex flex-wrap gap-[3vw]">
            {bottomStats.map((stat, i) => (
              <div key={i} className="min-w-[180px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                  <span className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-on-primary">
                    {stat.value}{stat.suffix}
                  </span>
                </p>
                <p className="text-sm md:text-base font-medium leading-relaxed text-on-primary whitespace-pre-line">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <hr className="my-[2vw] border-none border-t border-on-primary/30" />
          <p className="text-sm font-medium text-on-primary">{statsSource}</p>
        </FlowSection>
      </EditableBackground>

      {/* 05 — Vamos Começar */}
      <EditableBackground
        contentKey="home.section05.backgroundImage"
        fallback={FALLBACKS["home.section05.backgroundImage"]}
        overlay="rgba(20,20,20,0.6)"
      >
        <FlowSection aria-label="Vamos Começar" className="bg-on-surface text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">05 — Vamos Começar</p>
          <hr className="my-[2vw] border-none border-t border-white/20" />
          <div>
            <h2 className="text-display uppercase max-w-[12ch]">
              {whyInvest.title.replace("?", "")}
            </h2>
          </div>
          <hr className="my-[2vw] border-none border-t border-white/20" />
          <EditableText
            contentKey="home.cta.title"
            fallback={cta.title}
            tag="p"
            className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-white whitespace-pre-line"
            multiline
          />
          <hr className="my-[2vw] border-none border-t border-white/20" />
          <Link
            href={cta.buttonHref}
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity self-start"
          >
            {cta.buttonLabel}
          </Link>
        </FlowSection>
      </EditableBackground>
    </FlowArt>
  );
}
