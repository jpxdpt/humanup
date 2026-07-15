import Image from "next/image";
import Link from "next/link";
import { FlowSection } from "@/components/ui/story-scroll";
import type { PackageItem } from "@/lib/content-schema";

interface PackageFlowCardProps {
  pkg: PackageItem;
  index: number;
  image: string;
  imageAlt: string;
}

export function PackageFlowCard({ pkg, index, image, imageAlt }: PackageFlowCardProps) {
  return (
    <FlowSection className="bg-white flex items-center justify-center p-[3vw]" aria-label={pkg.name}>
      <div className="relative w-full h-full max-w-6xl rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] bg-on-surface text-white">
        <div className="absolute inset-0">
          <Image src={image} alt={imageAlt} fill className="object-cover opacity-30" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-16">
          <div className="flex items-center justify-between">
            <span className="font-sans text-label-caps uppercase tracking-[0.15em] text-white/60">
              0{index + 1}
            </span>
            {pkg.popular && (
              <span className="font-sans text-label-caps uppercase tracking-[0.15em] text-primary-container">
                Mais Popular
              </span>
            )}
          </div>

          <div>
            <h2 className="text-display uppercase mb-10">{pkg.name}</h2>
            <ul className="space-y-3 mb-10 max-w-md">
              {pkg.features.map((f, j) => (
                <li key={j} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-container mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                  </svg>
                  <span className="font-sans text-base font-medium text-white/85">{f.text}</span>
                </li>
              ))}
            </ul>
            <Link
              href={pkg.ctaHref}
              className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              {pkg.cta}
            </Link>
          </div>
        </div>
      </div>
    </FlowSection>
  );
}
