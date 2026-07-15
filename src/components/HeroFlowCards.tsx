"use client";

import Link from "next/link";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import { useContent } from "@/lib/content-store";

function bgImage(url: string, overlayColor: string) {
  return {
    backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backfaceVisibility: 'hidden' as const,
  };
}

export function HeroFlowCards() {
  const { content } = useContent();
  const { hero, stats, services, whyInvest, cta } = content.home;
  const topStats = stats.slice(0, 3);
  const bottomStats = stats.slice(3, 6);

  return (
    <FlowArt aria-label="HumanUp — apresentação">
      {/* 01 — A HumanUp */}
      <FlowSection
        aria-label={hero.title}
        className="bg-on-surface text-white"
        style={bgImage('/images/hero-bg.jpg', 'rgba(20,20,20,0.55)')}
      >
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none">
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 to-black/25 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6 min-h-full">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">01 — A HumanUp</p>
          <hr className="border-none border-t border-white/20" />
          <div>
            <h1 className="text-display uppercase">
              {hero.title}
            </h1>
          </div>
          <hr className="border-none border-t border-white/20" />
          <p className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-white">
            {hero.description}
          </p>
          <hr className="border-none border-t border-white/20" />
          <Link
            href={hero.ctaHref}
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity self-start"
          >
            {hero.ctaLabel}
          </Link>
        </div>
      </FlowSection>

      {/* 02 — O Problema */}
      <FlowSection
        aria-label="O Problema"
        className="bg-primary-container text-on-primary-container opacity-100"
        style={bgImage('/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg', 'rgba(243,163,42,0.6)')}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em]">02 — O Problema</p>
        <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
        <div>
          <h2 className="text-display uppercase">
            Felicidade
            <br />
            Organizacional
            <br />
            em Portugal
          </h2>
        </div>
        <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
        <p className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-primary-container opacity-100">
          Os números revelam um caminho urgente a percorrer na cultura empresarial portuguesa.
        </p>
        <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
        <div className="flex flex-wrap gap-[3vw]">
          {topStats.map((stat, i) => (
            <div key={i} className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                <span className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-on-primary-container opacity-100">
                  {stat.value}{stat.suffix}
                </span>
              </p>
              <p
                className="text-sm md:text-base font-medium leading-relaxed text-on-primary-container opacity-100"
                dangerouslySetInnerHTML={{ __html: stat.label }}
              />
            </div>
          ))}
        </div>
      </FlowSection>

      {/* 03 — A Solução */}
      <FlowSection
        aria-label="A Solução"
        className="bg-surface text-on-surface"
        style={bgImage('/images/contact-hero.jpg', 'rgba(255,255,255,0.6)')}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em]">03 — A Solução</p>
        <hr className="my-[2vw] border-none border-t border-on-surface/15" />
        <div>
          <h2 className="text-display uppercase">
            Projetos
            <br />
            de
            <br />
            Mudança
          </h2>
        </div>
        <hr className="my-[2vw] border-none border-t border-on-surface/15" />
        <p className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-surface">
          Estratégias de bem-estar que ligam pessoas, cultura e resultados.
        </p>
        <hr className="my-[2vw] border-none border-t border-on-surface/15" />
        <div className="flex flex-wrap gap-[3vw]">
          {services.slice(0, 3).map((service, i) => (
            <div key={i} className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                {service.title.replace(/<br\s*\/?>/g, ' ')}
              </p>
              <p className="text-sm md:text-base font-medium leading-relaxed text-on-surface">
                {service.description.replace(/<br\s*\/?>/g, ' ').replace(/<strong>/g, '').replace(/<\/strong>/g, '')}
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

      {/* 04 — O Impacto */}
      <FlowSection
        aria-label="O Impacto"
        className="bg-primary text-on-primary"
        style={bgImage('/images/emoji-top-view.jpg', 'rgba(132,84,0,0.6)')}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em]">04 — O Impacto</p>
        <hr className="my-[2vw] border-none border-t border-on-primary/30" />
        <div>
          <h2 className="text-display uppercase">
            O Custo
            <br />
            de
            <br />
            Não Agir
          </h2>
        </div>
        <hr className="my-[2vw] border-none border-t border-on-primary/30" />
        <p className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-primary">
          Empresas que ignoram o bem-estar pagam um preço elevado — em produtividade, talento e resultados.
        </p>
        <hr className="my-[2vw] border-none border-t border-on-primary/30" />
        <div className="flex flex-wrap gap-[3vw]">
          {bottomStats.map((stat, i) => (
            <div key={i} className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                <span className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-on-primary">
                  {stat.value}{stat.suffix}
                </span>
              </p>
              <p
                className="text-sm md:text-base font-medium leading-relaxed text-on-primary"
                dangerouslySetInnerHTML={{ __html: stat.label }}
              />
            </div>
          ))}
        </div>
        <hr className="my-[2vw] border-none border-t border-on-primary/30" />
        <p className="text-sm font-medium text-on-primary">{content.home.statsSource}</p>
      </FlowSection>

      {/* 05 — Vamos Começar */}
      <FlowSection
        aria-label="Vamos Começar"
        className="bg-on-surface text-white"
        style={bgImage('/images/grupo-de-amigos-reunidos.jpg', 'rgba(20,20,20,0.6)')}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em]">05 — Vamos Começar</p>
        <hr className="my-[2vw] border-none border-t border-white/20" />
        <div>
          <h2 className="text-display uppercase max-w-[12ch]">
            {whyInvest.title.replace('?', '')}
          </h2>
        </div>
        <hr className="my-[2vw] border-none border-t border-white/20" />
        <p className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-white">
          {cta.title}
        </p>
        <hr className="my-[2vw] border-none border-t border-white/20" />
        <Link
          href={cta.buttonHref}
          className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity self-start"
        >
          {cta.buttonLabel}
        </Link>
      </FlowSection>
    </FlowArt>
  );
}
