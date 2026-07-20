"use client";

import Link from "next/link";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { Reveal } from "@/components/Reveal";
import { EditableText } from "@/components/cms/EditableText";

export function CTASection() {
  const home = useSiteContentSection("home");
  const buttonLabel = home["cta.buttonLabel"] ?? FALLBACKS["home.cta.buttonLabel"];
  const buttonHref = home["cta.buttonHref"] ?? FALLBACKS["home.cta.buttonHref"];

  return (
    <section className="w-full bg-primary py-[100px]">
      <Reveal className="container-site">
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <EditableText
            contentKey="home.cta.title"
            fallback={home["cta.title"] ?? FALLBACKS["home.cta.title"]}
            tag="h2"
            className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-primary-foreground capitalize max-w-[720px]"
            multiline
          />
          <div>
            <Link
              href={buttonHref}
              className="inline-block bg-white text-primary font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              {buttonLabel}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
