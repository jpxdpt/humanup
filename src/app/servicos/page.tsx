"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageHero } from "@/components/PageHero";
import { FullImageBand } from "@/components/FullImageBand";
import FlowArt from "@/components/FlowArt";
import { PackageFlowCard } from "@/components/PackageFlowCard";
import { useContent } from "@/lib/content-store";

const PACKAGE_IMAGES = [
  { src: "/images/emoji-card.jpg", alt: "Diagnóstico e inquérito de felicidade", tint: false },
  { src: "/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg", alt: "Acompanhamento e impacto contínuo", tint: true },
  { src: "/images/Diana-2-1-767x1024.png", alt: "Programa de liderança", tint: false },
];

export default function ServicosPage() {
  const { content } = useContent();
  const { servicos } = content;
  const { hero, packagesTitle, packages: PACKAGES, methodTitle, methodSteps: METHOD_STEPS, cta } = servicos;
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">

            <PageHero
              image="/images/hero-bg.jpg"
              imageAlt="HumanUp Serviços"
              eyebrow={hero.eyebrow}
              title={hero.title}
            />

            {/* Packages */}
            <section className="w-full bg-white py-16 md:py-24">
              <div className="container-site">
                <h2 className="font-heading text-[32px] md:text-[46px] font-bold leading-tight tracking-[-1px] text-foreground capitalize text-center mb-4">
                  {packagesTitle}
                </h2>
              </div>
            </section>

            <FlowArt aria-label="Pacotes HumanUp">
              {PACKAGES.map((pkg, i) => (
                <PackageFlowCard
                  key={pkg.name}
                  pkg={pkg}
                  index={i}
                  image={PACKAGE_IMAGES[i % PACKAGE_IMAGES.length].src}
                  imageAlt={PACKAGE_IMAGES[i % PACKAGE_IMAGES.length].alt}
                />
              ))}
            </FlowArt>

            <FullImageBand
              image="/images/Duarte-1-767x1024.png"
              imageAlt="Equipa HumanUp"
              height="sm"
            />

            {/* Method */}
            <section className="w-full bg-gray-50 py-16 md:py-24">
              <div className="container-site">
                <h2 className="font-heading text-[32px] md:text-[46px] font-bold leading-tight tracking-[-1px] text-foreground capitalize text-center mb-16">
                  {methodTitle}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                  {METHOD_STEPS.map((step, i) => (
                    <div key={i} className="text-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="font-heading text-2xl font-bold text-white">{step.number}</span>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-foreground mb-3">{step.title}</h3>
                      <p className="font-sans text-sm font-medium text-foreground/70 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="w-full bg-primary py-[100px]">
              <div className="container-site flex items-center justify-between gap-8 flex-wrap">
                <div>
                  <h2 className="font-heading text-[36px] font-bold leading-[46.8px] tracking-[-1px] text-primary-foreground capitalize max-w-[600px]">
                    {cta.title}
                  </h2>
                </div>
                <Link
                  href={cta.buttonHref}
                  className="inline-block bg-white text-primary font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
                >
                  {cta.buttonLabel}
                </Link>
              </div>
            </section>

          </article>
        </main>
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
