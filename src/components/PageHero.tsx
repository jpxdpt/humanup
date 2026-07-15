import Image from "next/image";
import { Parallax } from "@/components/Parallax";
import { Reveal } from "@/components/Reveal";

interface PageHeroProps {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
}

export function PageHero({ image, imageAlt, eyebrow, title }: PageHeroProps) {
  return (
    <section className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden">
      <Parallax strength={0.15} className="absolute inset-0">
        <Image src={image} alt={imageAlt} fill priority className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="container-site relative z-10 text-center">
        <Reveal>
          {eyebrow && (
            <p className="font-sans text-label-caps uppercase tracking-[0.15em] text-white/80 mb-6">
              {eyebrow}
            </p>
          )}
          <h1
            className="font-heading text-[40px] md:text-[64px] font-bold leading-[1.1] tracking-[0.02em] uppercase text-white"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </Reveal>
      </div>
    </section>
  );
}
