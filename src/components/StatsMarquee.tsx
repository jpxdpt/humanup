"use client";

import { useContent } from "@/lib/content-store";

export function StatsMarquee() {
  const { content } = useContent();
  const { stats } = content.home;
  const items = [...stats, ...stats];

  return (
    <section className="w-full bg-on-surface overflow-hidden py-8 border-y border-white/10">
      <div className="marquee-track motion-reduce:animate-none flex w-max gap-16">
        {items.map((stat, i) => (
          <div key={i} className="flex items-center gap-4 shrink-0">
            <span className="font-heading text-[40px] md:text-[56px] font-bold text-primary-container leading-none">
              {stat.value}{stat.suffix}
            </span>
            <span
              className="font-sans text-sm md:text-base text-white/70 max-w-[220px] leading-tight"
              dangerouslySetInnerHTML={{ __html: stat.label }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
