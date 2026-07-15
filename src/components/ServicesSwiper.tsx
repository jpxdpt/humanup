"use client";

import { SplitContent } from "@/components/SplitContent";
import { useContent } from "@/lib/content-store";

const SLIDE_IMAGES = [
  { src: "/images/hero-bg.jpg", alt: "Equipa em ambiente de trabalho" },
  { src: "/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg", alt: "Reunião de equipa" },
  { src: "/images/emoji-card.jpg", alt: "Bem-estar organizacional" },
  { src: "/images/Duarte-1-767x1024.png", alt: "Consultoria HumanUp" },
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
          imagePosition={i % 2 === 0 ? "left" : "right"}
          title={slide.title}
          body={slide.description}
          ctaLabel={slide.buttonText}
          ctaHref={slide.buttonHref}
        />
      ))}
    </div>
  );
}
