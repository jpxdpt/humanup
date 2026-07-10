import Link from "next/link";

export function CTASection() {
  return (
    <section className="w-full bg-primary py-[100px]">
      <div className="container-site">
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-primary-foreground capitalize max-w-[720px]">
            E se o próximo crescimento do seu negócio viesse da cultura?
          </h2>
          <div>
            <Link
              href="/contactos/"
              className="inline-block bg-white text-primary font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Saber mais
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
