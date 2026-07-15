"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SplitContent } from "@/components/SplitContent";
import { PageHero } from "@/components/PageHero";
import { StatementBlock } from "@/components/StatementBlock";
import { FullImageBand } from "@/components/FullImageBand";
import { useContent } from "@/lib/content-store";

export default function SobrePage() {
  const { content } = useContent();
  const { sobre } = content;
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">

            <PageHero
              image="/images/hero-bg.jpg"
              imageAlt="HumanUp"
              eyebrow={sobre.hero.eyebrow}
              title={sobre.hero.title}
            />

            {/* Quem somos */}
            <SplitContent
              image="/images/Duarte-1-767x1024.png"
              imageAlt="Equipa HumanUp"
              imagePosition="left"
              eyebrow={sobre.quemSomos.eyebrow}
              title={sobre.quemSomos.title}
              body={sobre.quemSomos.body}
            />

            <FullImageBand
              image="/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg"
              imageAlt="Impacto da felicidade organizacional"
              height="sm"
              imageTint
            />

            {/* Propósito */}
            <StatementBlock eyebrow={sobre.proposito.title} text={sobre.proposito.body} tone="muted" />

            {/* Missão */}
            <SplitContent
              image="/images/Diana-2-1-767x1024.png"
              imageAlt="Missão HumanUp"
              imagePosition="right"
              title={sobre.missao.title}
              body={sobre.missao.body}
            />

            {/* Valores & Visão */}
            <section className="w-full bg-[#f8b449] py-16 md:py-24">
              <div className="container-site grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="font-heading text-[32px] font-bold leading-[41.6px] tracking-[-1px] text-white capitalize mb-8">
                    {sobre.valoresTitle}
                  </h2>
                  <div className="space-y-6 text-white font-sans text-base font-medium leading-[26.4px]">
                    {sobre.valores.map((v, i) => (
                      <p key={i}><strong>{v.title}</strong>: <em>{v.body}</em></p>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="font-heading text-[32px] font-bold leading-[41.6px] tracking-[-1px] text-white capitalize mb-8">
                    {sobre.visao.title}
                  </h2>
                  <p className="text-white font-sans text-base font-medium leading-[26.4px]">
                    {sobre.visao.body}
                  </p>
                </div>
              </div>
            </section>

            {/* Como trabalhamos */}
            <section className="w-full bg-white py-16 md:py-24">
              <div className="container-site">
                <h2 className="font-heading text-[32px] md:text-[46px] font-bold leading-tight tracking-[-1px] text-foreground capitalize text-center mb-16">
                  {sobre.comoTrabalhamosTitle}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    "M15.536 8.464a5 5 0 010 7.072M12 6a7.5 7.5 0 017.5 7.5m-7.5-10a10 10 0 0110 10M4.464 15.536a5 5 0 010-7.072M12 18a7.5 7.5 0 01-7.5-7.5M12 6a10 10 0 00-10 10",
                    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                  ].map((d, i) => (
                    <div key={i} className="text-center p-8 border border-gray-100 rounded-lg">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} /></svg>
                      </div>
                      <h3 className="font-heading text-[24px] font-bold text-foreground capitalize mb-4">{sobre.comoTrabalhamos[i].title}</h3>
                      <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                        {sobre.comoTrabalhamos[i].body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* O que nos diferencia */}
            <section className="w-full bg-gray-50 py-16 md:py-24 relative overflow-hidden">
              <div className="absolute inset-0">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20">
                  <source src="/videos/about-bg.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="container-site relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-12">
                  <h3 className="font-heading text-[28px] font-bold leading-[36.4px] tracking-[-1px] text-foreground capitalize mb-4">
                    {sobre.diferenciaTitle}
                  </h3>
                  <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                    {sobre.diferenciaBody}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {sobre.diferencia.map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-lg shadow-sm text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" /></svg>
                      </div>
                      <h4 className="font-heading text-xl font-bold text-foreground mb-2">{item.title}</h4>
                      <p className="font-sans text-sm font-medium text-foreground/70">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="w-full bg-primary py-[100px]">
              <div className="container-site flex items-center justify-between gap-8 flex-wrap">
                <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-primary-foreground capitalize max-w-[720px]">
                  {sobre.cta.title}
                </h2>
                <Link
                  href={sobre.cta.buttonHref}
                  className="inline-block bg-white text-primary font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
                >
                  {sobre.cta.buttonLabel}
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
