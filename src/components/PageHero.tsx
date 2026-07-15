import Image from "next/image";

interface PageHeroProps {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
}

export function PageHero({ image, imageAlt, eyebrow, title }: PageHeroProps) {
  return (
    <section className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden">
      <Image src={image} alt={imageAlt} fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="container-site relative z-10 text-center">
        {eyebrow && (
          <p className="font-sans text-label-caps uppercase tracking-[0.15em] text-white/80 mb-6">
            {eyebrow}
          </p>
        )}
        <h1
          className="font-heading text-[40px] md:text-[64px] font-bold leading-[1.1] tracking-[0.02em] uppercase text-white"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </div>
    </section>
  );
}
