"use client";

import Link from "next/link";
import { useContent } from "@/lib/content-store";
import { Parallax } from "@/components/Parallax";
import { Reveal } from "@/components/Reveal";

export function HeroSection() {
  const { content } = useContent();
  const { hero } = content.home;
  return (
    <section className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden">
      {/* Background image */}
      <Parallax strength={0.15} className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
      </Parallax>
      {/* Background video overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />

      {/* Content */}
      <div className="container-site relative z-10 text-center">
        <Reveal className="max-w-[720px] mx-auto">
          <h1 className="font-heading text-[40px] md:text-[64px] font-bold leading-[1.1] tracking-[0.02em] uppercase text-white mb-6">
            {hero.title}
          </h1>
          <p className="font-sans text-base md:text-lg font-medium leading-[26.4px] text-white/85 mb-10 max-w-[560px] mx-auto">
            {hero.description}
          </p>
          <Link
            href={hero.ctaHref}
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            {hero.ctaLabel}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
