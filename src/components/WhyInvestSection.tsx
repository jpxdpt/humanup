"use client";

import Image from "next/image";
import Link from "next/link";
import { useContent } from "@/lib/content-store";

export function WhyInvestSection() {
  const { content } = useContent();
  const { whyInvest } = content.home;
  return (
    <section className="w-full bg-white py-16">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <figure className="wp-block-uagb-image__figure">
              <Image
                src="/images/emoji-card.jpg"
                alt="Disposicao Da Vista Superior Com Um Cartao Emoji Sorridente"
                width={484}
                height={500}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </figure>
          </div>
          <div>
            <div className="uagb-infobox-margin-wrapper">
              <div className="uagb-ifb-content">
                <span className="block font-sans text-base font-medium text-foreground uppercase mb-5">
                  &nbsp;
                </span>
                <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize mb-5">
                  {whyInvest.title}
                </h2>
                <p
                  className="font-sans text-base font-medium leading-[26.4px] text-foreground mb-8 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: whyInvest.body }}
                />
                <div>
                  <Link
                    href={whyInvest.ctaHref}
                    className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
                  >
                    {whyInvest.ctaLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
