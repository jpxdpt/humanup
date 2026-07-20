"use client";

import { SplitContent } from "@/components/SplitContent";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";

const IMAGE_ALTS = [
  "Consultor HumanUp",
  "Inquérito de felicidade organizacional",
  "Consultora HumanUp",
  "Impacto e acompanhamento contínuo",
];

const IMAGE_TINTS = [false, false, false, true];

export function ServicesSwiper() {
  const home = useSiteContentSection("home");

  const slides = Array.from({ length: 4 }, (_, i) => ({
    title: home[`services.${i}.title`] ?? FALLBACKS[`home.services.${i}.title`],
    description: home[`services.${i}.description`] ?? FALLBACKS[`home.services.${i}.description`],
    buttonText: home[`services.${i}.buttonText`] ?? FALLBACKS[`home.services.${i}.buttonText`],
    buttonHref: home[`services.${i}.buttonHref`] ?? FALLBACKS[`home.services.${i}.buttonHref`],
  }));

  return (
    <div>
      {slides.map((slide, i) => (
        <SplitContent
          key={i}
          imageKey={`home.services.${i}.image`}
          imageFallback={FALLBACKS[`home.services.${i}.image`]}
          imageAlt={IMAGE_ALTS[i % IMAGE_ALTS.length]}
          imageTint={IMAGE_TINTS[i % IMAGE_TINTS.length]}
          imagePosition={i % 2 === 0 ? "left" : "right"}
          tone={i % 2 === 0 ? "light" : "muted"}
          titleKey={`home.services.${i}.title`}
          titleFallback={slide.title}
          bodyKey={`home.services.${i}.description`}
          bodyFallback={slide.description}
          ctaLabelKey={`home.services.${i}.buttonText`}
          ctaLabelFallback={slide.buttonText}
          ctaHref={slide.buttonHref}
        />
      ))}
    </div>
  );
}
