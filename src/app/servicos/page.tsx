"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useContent } from "@/lib/content-store";

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

            {/* Hero Banner */}
            <section className="wp-block-uagb-container alignfull bg-gradient-to-br from-primary to-amber-600 py-16">
              <div className="container-site text-center">
                <p className="font-sans text-lg font-medium text-white/80 mb-2">{hero.eyebrow}</p>
                <h1 className="font-heading text-[60px] font-bold leading-[69px] tracking-[-1px] text-white capitalize">
                  {hero.title}
                </h1>
              </div>
            </section>

            {/* Packages */}
            <section className="w-full bg-white py-20">
              <div className="container-site">
                <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize text-center mb-16">
                  {packagesTitle}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {PACKAGES.map((pkg) => (
                    <div
                      key={pkg.name}
                      className={`relative flex flex-col rounded-2xl p-8 border ${
                        pkg.popular
                          ? "border-primary bg-primary/5 shadow-lg scale-105"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                          Mais Popular
                        </span>
                      )}
                      <h3 className="font-heading text-2xl font-bold text-foreground mb-8">{pkg.name}</h3>
                      <ul className="flex-1 space-y-4 mb-8">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                            </svg>
                            <span className="font-sans text-base font-medium text-foreground">{f.text}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={pkg.ctaHref}
                        className={`text-center font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md transition-opacity ${
                          pkg.popular
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "bg-gray-100 text-foreground hover:bg-gray-200"
                        }`}
                      >
                        {pkg.cta}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Method */}
            <section className="w-full bg-gray-50 py-20">
              <div className="container-site">
                <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize text-center mb-16">
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
