"use client";

import { SplitContent } from "@/components/SplitContent";
import { useContent } from "@/lib/content-store";

const SLIDE_IMAGES = [
  { src: "/images/Duarte-1-767x1024.png", alt: "Consultor HumanUp", tint: false },
  { src: "/images/emoji-card.jpg", alt: "Inquérito de felicidade organizacional", tint: false },
  { src: "/images/Diana-2-1-767x1024.png", alt: "Consultora HumanUp", tint: false },
  { src: "/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg", alt: "Impacto e acompanhamento contínuo", tint: true },
];

export function ServicesSwiper() {
  const { content } = useContent();
  const SLIDES = content.home.services;

  return (
    <div>
      {SLIDES.map((slide, i) => (
        <SplitContent
          key={i}
          image={SLIDE_IMAGES[i % SLIDE_IMAGES.length].src}
          imageAlt={SLIDE_IMAGES[i % SLIDE_IMAGES.length].alt}
          imageTint={SLIDE_IMAGES[i % SLIDE_IMAGES.length].tint}
          imagePosition={i % 2 === 0 ? "left" : "right"}
          tone={i % 2 === 0 ? "light" : "muted"}
          title={slide.title}
          body={slide.description}
          ctaLabel={slide.buttonText}
          ctaHref={slide.buttonHref}
        />
      ))}
    </div>
  );
}
