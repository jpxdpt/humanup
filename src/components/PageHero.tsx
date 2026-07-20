"use client";

import { Parallax } from "@/components/Parallax";
import { Reveal } from "@/components/Reveal";
import { EditableImage } from "@/components/cms/EditableImage";
import { EditableText } from "@/components/cms/EditableText";

interface PageHeroProps {
  imageKey: string;
  imageFallback: string;
  imageAlt?: string;
  eyebrow?: string;
  titleKey: string;
  titleFallback: string;
}

export function PageHero({ imageKey, imageFallback, imageAlt = "", eyebrow, titleKey, titleFallback }: PageHeroProps) {
  return (
    <section className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden">
      <Parallax strength={0.15} className="absolute inset-0">
        <EditableImage
          contentKey={imageKey}
          fallback={imageFallback}
          alt={imageAlt}
          fill
          className="object-cover"
        />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="container-site relative z-10 text-center">
        <Reveal>
          {eyebrow && (
            <p className="font-sans text-label-caps uppercase tracking-[0.15em] text-white/80 mb-6">
              {eyebrow}
            </p>
          )}
          <EditableText
            contentKey={titleKey}
            fallback={titleFallback}
            tag="h1"
            className="text-display uppercase text-white whitespace-pre-line"
            multiline
          />
        </Reveal>
      </div>
    </section>
  );
}
