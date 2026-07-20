"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableText } from "@/components/cms/EditableText";
import { EditableBackground } from "@/components/cms/EditableBackground";

const SectionNumber = ({ num }: { num: string }) => (
  <span className="text-[clamp(6rem,20vw,16rem)] font-bold leading-[0.7] text-on-surface/5 select-none pointer-events-none absolute top-0 right-0 -mt-4 -mr-4 md:-mr-8">
    {num}
  </span>
);

export function ServicesFlow() {
  const servicos = useSiteContentSection("servicos");

  const hero = {
    eyebrow: servicos["hero.eyebrow"] ?? FALLBACKS["servicos.hero.eyebrow"],
    title: servicos["hero.title"] ?? FALLBACKS["servicos.hero.title"],
  };

  const methodTitle = servicos["methodTitle"] ?? FALLBACKS["servicos.methodTitle"];
  const methodSteps = Array.from({ length: 4 }, (_, i) => ({
    number: servicos[`methodSteps.${i}.number`] ?? FALLBACKS[`servicos.methodSteps.${i}.number`],
    title: servicos[`methodSteps.${i}.title`] ?? FALLBACKS[`servicos.methodSteps.${i}.title`],
    description: servicos[`methodSteps.${i}.description`] ?? FALLBACKS[`servicos.methodSteps.${i}.description`],
  }));

  const packagesTitle = servicos["packagesTitle"] ?? FALLBACKS["servicos.packagesTitle"];
  const packages = Array.from({ length: 3 }, (_, i) => ({
    name: servicos[`packages.${i}.name`] ?? FALLBACKS[`servicos.packages.${i}.name`],
    popular: (servicos[`packages.${i}.popular`] ?? FALLBACKS[`servicos.packages.${i}.popular`]) === "true",
    features: Array.from({ length: 5 }, (_, j) => servicos[`packages.${i}.features.${j}.text`] ?? FALLBACKS[`servicos.packages.${i}.features.${j}.text`]).filter(Boolean),
    cta: servicos[`packages.${i}.cta`] ?? FALLBACKS[`servicos.packages.${i}.cta`],
    ctaHref: servicos[`packages.${i}.ctaHref`] ?? FALLBACKS[`servicos.packages.${i}.ctaHref`],
  }));

  const cta = {
    title: servicos["cta.title"] ?? FALLBACKS["servicos.cta.title"],
    buttonLabel: servicos["cta.buttonLabel"] ?? FALLBACKS["servicos.cta.buttonLabel"],
    buttonHref: servicos["cta.buttonHref"] ?? FALLBACKS["servicos.cta.buttonHref"],
  };

  return (
    <div>
      {/* Hero */}
      <EditableBackground
        contentKey="servicos.hero.backgroundImage"
        fallback={FALLBACKS["servicos.hero.backgroundImage"] ?? "/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg"}
        overlay="rgba(0,0,0,0.5)"
        className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden bg-on-surface text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <Reveal className="container-site relative z-10 text-center max-w-[920px]">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/80 mb-6">
            {hero.eyebrow}
          </p>
          <EditableText
            contentKey="servicos.hero.title"
            fallback={hero.title}
            tag="h1"
            className="text-display uppercase text-white whitespace-pre-line"
            multiline
          />
        </Reveal>
      </EditableBackground>

      {/* 01 — Método */}
      <section className="relative w-full bg-primary-container text-on-primary-container py-24 md:py-32 overflow-hidden">
        <SectionNumber num="01" />
        <Reveal className="container-site max-w-[960px]">
          <Reveal direction="up" distance={24}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-primary-container/60 mb-8 text-center">
              Como fazemos a diferença
            </p>
          </Reveal>
          <Reveal direction="up" distance={24} delay={100}>
            <EditableText
              contentKey="servicos.methodTitle"
              fallback={methodTitle}
              tag="h2"
              className="text-display text-center mb-6 capitalize"
            />
          </Reveal>
          <Reveal direction="up" distance={24} delay={150}>
            <p className="font-sans text-base md:text-lg font-medium leading-relaxed text-on-primary-container/80 max-w-[640px] mx-auto text-center mb-16">
              Quatro passos para transformar a cultura da sua organização com resultados reais.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {methodSteps.map((step, i) => (
              <Reveal key={i} direction="up" distance={24} delay={200 + i * 80}>
                <div className="text-center">
                  <EditableText
                    contentKey={`servicos.methodSteps.${i}.number`}
                    fallback={step.number}
                    tag="span"
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-on-primary-container/10 text-on-primary-container text-2xl font-bold mb-6 ring-1 ring-on-primary-container/20"
                  />
                  <EditableText
                    contentKey={`servicos.methodSteps.${i}.title`}
                    fallback={step.title}
                    tag="h3"
                    className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
                  />
                  <EditableText
                    contentKey={`servicos.methodSteps.${i}.description`}
                    fallback={step.description}
                    tag="p"
                    className="font-sans text-base font-medium leading-relaxed text-on-primary-container/75 whitespace-pre-line"
                    multiline
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 02 — Pacotes */}
      <section className="relative w-full bg-surface text-on-surface py-24 md:py-32 overflow-hidden">
        <SectionNumber num="02" />
        <Reveal className="container-site">
          <Reveal direction="up" distance={24}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface/60 mb-8 text-center">
              Escolha o seu plano
            </p>
          </Reveal>
          <Reveal direction="up" distance={24} delay={100}>
            <EditableText
              contentKey="servicos.packagesTitle"
              fallback={packagesTitle}
              tag="h2"
              className="text-display text-center mb-16 capitalize"
            />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1100px] mx-auto">
            {packages.map((pkg, i) => (
              <Reveal
                key={pkg.name}
                direction="up"
                distance={24}
                delay={150 + i * 100}
              >
                <div
                  className={`relative flex flex-col h-full p-8 md:p-10 rounded-xl border ${
                    pkg.popular
                      ? "border-primary-container shadow-[0_0_0_1px_#f3a32a]"
                      : "border-on-surface/10"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                      Mais Popular
                    </span>
                  )}
                  <p className="text-sm font-bold uppercase tracking-wider text-primary-container mb-6">
                    {pkg.name}
                  </p>
                  <ul className="space-y-4 mb-10 flex-1">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-primary-container mt-0.5 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                        </svg>
                        <span className="font-sans text-base font-medium leading-relaxed text-on-surface/75">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={pkg.ctaHref}
                    className={`inline-block w-full text-center font-heading font-bold text-base capitalize px-8 py-3 rounded-md transition-opacity hover:opacity-90 ${
                      pkg.popular
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-on-surface text-white"
                    }`}
                  >
                    {pkg.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative w-full bg-on-surface text-white py-[100px] overflow-hidden">
        <Reveal className="container-site flex items-center justify-between gap-8 flex-wrap">
          <Reveal direction="left" distance={32}>
            <EditableText
              contentKey="servicos.cta.title"
              fallback={cta.title}
              tag="h2"
              className="text-display-sm max-w-[720px] whitespace-pre-line"
              multiline
            />
          </Reveal>
          <Reveal direction="right" distance={32} delay={150}>
            <Link
              href={cta.buttonHref}
              className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity shrink-0"
            >
              {cta.buttonLabel}
            </Link>
          </Reveal>
        </Reveal>
      </section>
    </div>
  );
}
