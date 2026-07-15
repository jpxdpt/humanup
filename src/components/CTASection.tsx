"use client";

import Link from "next/link";
import { useContent } from "@/lib/content-store";
import { Reveal } from "@/components/Reveal";

export function CTASection() {
  const { content } = useContent();
  const { cta } = content.home;
  return (
    <section className="w-full bg-primary py-[100px]">
      <Reveal className="container-site">
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-primary-foreground capitalize max-w-[720px]">
            {cta.title}
          </h2>
          <div>
            <Link
              href={cta.buttonHref}
              className="inline-block bg-white text-primary font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              {cta.buttonLabel}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
