"use client";

import Link from "next/link";
import { useContent } from "@/lib/content-store";

export function HeroSection() {
  const { content } = useContent();
  const { hero } = content.home;
  return (
    <section className="relative flex flex-col justify-center items-start w-full min-h-[746px] overflow-visible">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-[0%_0%]"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
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
      {/* Content */}
      <div className="container-site relative z-10 py-24">
        <div className="max-w-[600px]">
          <h1 className="font-heading text-[60px] font-bold leading-[69px] tracking-[-1px] text-foreground capitalize mb-5">
            {hero.title}
          </h1>
          <p className="font-sans text-base font-medium leading-[26.4px] text-foreground mb-10 max-w-[600px]">
            {hero.description}
          </p>
          <Link
            href={hero.ctaHref}
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            {hero.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
