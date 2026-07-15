"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/lib/content-store";

gsap.registerPlugin(ScrollTrigger);

const SectionNumber = ({ num }: { num: string }) => (
  <span className="text-[clamp(6rem,20vw,16rem)] font-bold leading-[0.7] text-on-surface/5 select-none pointer-events-none absolute top-0 right-0 -mt-4 -mr-4 md:-mr-8">
    {num}
  </span>
);

function HorizontalScrollSection({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const scrollWidth = track.scrollWidth - window.innerWidth;
    if (scrollWidth <= 0) return;

    gsap.to(track, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${scrollWidth}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  return (
    <section ref={sectionRef} className="relative bg-surface text-on-surface">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div ref={trackRef} className="flex will-change-transform">
          {children}
        </div>
      </div>
    </section>
  );
}

const journeySteps = [
  {
    num: "01",
    title: "Escuta Ativa",
    body: "Compreendemos a fundo a cultura, os desafios e as pessoas da organização, criando uma base de confiança para todo o processo.",
    color: "#845400",
  },
  {
    num: "02",
    title: "Diagnóstico",
    body: "Aplicamos ferramentas validadas para identificar riscos psicossociais, clima organizacional e áreas de oportunidade.",
    color: "#f3a32a",
  },
  {
    num: "03",
    title: "Devolução",
    body: "Partilhamos as descobertas com transparência, clareza e sem filtros — porque a mudança começa com a verdade.",
    color: "#141414",
  },
  {
    num: "04",
    title: "Co-criação",
    body: "Desenhamos soluções lado a lado com lideranças e equipas, garantindo envolvimento e relevância para o dia a dia.",
    color: "#845400",
  },
  {
    num: "05",
    title: "Intervenção",
    body: "Aplicamos programas práticos de bem-estar, formação e desenvolvimento — sempre com foco em ação e não em teoria.",
    color: "#f3a32a",
  },
  {
    num: "06",
    title: "Avaliação",
    body: "Medimos o impacto real nas pessoas e nos resultados do negócio, ajustando rotas sempre que necessário.",
    color: "#141414",
  },
  {
    num: "07",
    title: "Sustentabilidade",
    body: "Garantimos que as mudanças perduram e evoluem com a organização, criando uma cultura de melhoria contínua.",
    color: "#845400",
  },
];

export function AboutFlow() {
  const { content } = useContent();
  const { sobre } = content;

  return (
    <div>
      {/* Hero */}
      <section className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden bg-on-surface text-white">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <Reveal className="container-site relative z-10 text-center max-w-[920px]">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/80 mb-6">
            {sobre.hero.eyebrow}
          </p>
          <h1
            className="text-display uppercase text-white"
            dangerouslySetInnerHTML={{ __html: sobre.hero.title }}
          />
        </Reveal>
      </section>

      {/* Quem Somos */}
      <section className="relative w-full bg-on-surface text-white py-24 md:py-32 overflow-hidden">
        <SectionNumber num="01" />
        <Reveal direction="none" distance={0} className="container-site max-w-[900px]">
          <Reveal direction="up" distance={24}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-8">Quem Somos</p>
          </Reveal>
          <Reveal direction="left" distance={32} delay={100}>
            <p
              className="text-display-sm mb-8"
              dangerouslySetInnerHTML={{ __html: sobre.quemSomos.title }}
            />
          </Reveal>
          <Reveal direction="up" distance={24} delay={200}>
            <p className="font-sans text-base md:text-lg font-medium leading-[1.7] text-white/85 whitespace-pre-line">
              {sobre.quemSomos.body}
            </p>
          </Reveal>
        </Reveal>
      </section>

      {/* Propósito, Missão & Visão */}
      <section className="relative w-full bg-primary-container text-on-primary-container py-24 md:py-32 overflow-hidden">
        <SectionNumber num="02" />
        <Reveal className="container-site text-center max-w-[960px]">
          <Reveal direction="up" distance={24}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-primary-container/60 mb-8">
              Propósito, Missão & Visão
            </p>
          </Reveal>
          <Reveal direction="none" distance={0} delay={100}>
            <h2 className="text-display mb-16">A Nossa Razão de Ser</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left">
            {[
              { label: "Propósito", body: sobre.proposito.body },
              { label: "Missão", body: sobre.missao.body },
              { label: "Visão", body: sobre.visao.body },
            ].map((item, i) => (
              <Reveal key={i} direction="up" distance={24} delay={150 + i * 100}>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider mb-4">{item.label}</p>
                  <p className="font-sans text-base font-medium leading-relaxed text-on-primary-container/80">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Jornada — horizontal scroll timeline */}
      <section className="relative bg-surface overflow-hidden">
        <SectionNumber num="03" />
        <div className="pt-24 pb-8 md:pt-32 md:pb-12 text-center container-site">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface/60 mb-6">A Nossa Jornada</p>
          <h2 className="text-display">Como Transformamos Organizações</h2>
        </div>
        <HorizontalScrollSection>
          <div className="flex items-stretch gap-6 md:gap-10 px-[4vw] pt-8 pb-16">
            {journeySteps.map((step, i) => (

                <div
                  key={i}
                  className="w-[75vw] md:w-[38vw] lg:w-[28vw] shrink-0 flex flex-col"
                >
                  {/* Dot + line */}
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className="relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0"
                      style={{
                        backgroundColor: step.color,
                        color: step.color === "#f3a32a" ? "#141414" : "#fff",
                      }}
                    >
                      {step.num}
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: step.color }} />
                  </div>
                  {/* Card */}
                  <div
                    className="flex-1 p-6 md:p-8 rounded-xl border"
                    style={{
                      borderColor: `${step.color}30`,
                      backgroundColor: `${step.color}08`,
                    }}
                  >
                    <h3 className="text-display-sm mb-3 text-on-surface break-words">{step.title}</h3>
                    <p className="font-sans text-base font-medium leading-relaxed text-on-surface/70 break-words">
                      {step.body}
                    </p>
                  </div>
                </div>
            ))}
          </div>
        </HorizontalScrollSection>
      </section>

      {/* CTA */}
      <section className="relative w-full bg-on-surface text-white py-[100px] overflow-hidden">
        <Reveal className="container-site flex items-center justify-between gap-8 flex-wrap">
          <Reveal direction="left" distance={32}>
            <h2 className="text-display-sm max-w-[720px]">
              {sobre.cta.title}
            </h2>
          </Reveal>
          <Reveal direction="right" distance={32} delay={150}>
            <Link
              href={sobre.cta.buttonHref}
              className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity shrink-0"
            >
              {sobre.cta.buttonLabel}
            </Link>
          </Reveal>
        </Reveal>
      </section>
    </div>
  );
}
