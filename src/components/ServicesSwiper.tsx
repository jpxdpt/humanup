"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Projetos de Felicidade Organizacional",
    description:
      "Criamos estratégias de bem-estar que ligam pessoas, cultura e resultados. <br>Cada plano é desenhado para transformar o ambiente de trabalho num espaço mais humano, produtivo e sustentável.",
    buttonText: "Solicitar Diagnóstico",
    buttonHref: "/contactos",
  },
  {
    title: "Diagnóstico Organizacional",
    description:
      "Porque conhecer é o primeiro passo para transformar, analisamos o clima interno, os valores vividos e os pontos de melhoria.",
    buttonText: "Saber mais",
    buttonHref: "/servicos",
  },
  {
    title: "Consultoria de <br>Bem-Estar",
    description:
      "Apoiamos líderes e equipas com soluções personalizadas que promovem saúde emocional, motivação e alinhamento cultural.<br>Criamos estratégias de bem-estar que ligam pessoas, cultura e resultados. Cada projeto é desenhado para transformar o ambiente de trabalho num espaço mais humano, produtivo e sustentável.",
    buttonText: "Saber Mais",
    buttonHref: "/servicos",
  },
  {
    title: "Acompanhamento",
    description:
      "Oferecemos <strong>avaliação contínua</strong> das estratégias de bem-estar, com indicadores claros e feedback regular.<br>Acompanhamos líderes e equipas ao longo do processo, garantindo que a felicidade organizacional se traduz em resultados reais.",
    buttonText: "Saber Mais",
    buttonHref: "/servicos",
  },
];

export function ServicesSwiper() {
  const [activeIndex, setActiveIndex] = useState(1);

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  return (
    <section className="w-full bg-white py-12">
      <div className="container-site">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {SLIDES.map((slide, i) => (
              <div key={i} className="w-full flex-shrink-0 px-4">
                <div className="min-h-[300px] flex flex-col justify-center">
                  <h3
                    className="font-heading text-[28px] font-bold leading-[36.4px] tracking-[-1px] text-foreground capitalize mb-3"
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                  />
                  <p
                    className="font-sans text-base font-medium leading-[26.4px] text-foreground mb-6 max-w-[600px]"
                    dangerouslySetInnerHTML={{ __html: slide.description }}
                  />
                  <div>
                    <Link
                      href={slide.buttonHref}
                      className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 27 44" className="w-3 h-5 fill-foreground">
              <path d="M0,22L22,0l2.1,2.1L4.2,22l19.9,19.9L22,44L0,22L0,22z" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
            aria-label="Next slide"
          >
            <svg viewBox="0 0 27 44" className="w-3 h-5 fill-foreground">
              <path d="M27,22L5,44l-2.1-2.1L22.8,22L2.9,2.1L5,0L27,22L27,22z" />
            </svg>
          </button>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "bg-primary w-6"
                    : "bg-gray-300 hover:bg-gray-400",
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
