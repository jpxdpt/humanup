import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function SobrePage() {
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">

            {/* Hero Banner */}
            <section className="wp-block-uagb-container alignfull bg-[#f8b449] py-16">
              <div className="container-site text-center">
                <p className="font-sans text-lg font-medium text-white/80 mb-2">Descubra o impacto da</p>
                <h1 className="font-heading text-[60px] font-bold leading-[69px] tracking-[-1px] text-white capitalize">
                  Felicidade organizacional
                </h1>
              </div>
            </section>

            {/* Quem somos */}
            <section className="w-full bg-white py-16">
              <div className="container-site grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <Image
                    src="/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg"
                    alt="Equipe reunida"
                    width={570}
                    height={500}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <span className="block font-sans text-base font-medium text-primary uppercase mb-2">Quem somos</span>
                  <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize mb-6">
                    HumanUp: Diagnósticos & projetos de bem‑estar laboral
                  </h2>
                  <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                    A HumanUp é um projeto dedicado a elevar o bem-estar, a motivação e a saúde emocional das organizações.
                    <br /><br />
                    Trabalhamos com metodologias práticas, diagnósticos claros e intervenções que geram impacto real — sempre com proximidade, autenticidade e rigor.
                  </p>
                </div>
              </div>
            </section>

            {/* Propósito & Missão */}
            <section className="w-full bg-gray-50 py-16">
              <div className="container-site grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-10 rounded-lg shadow-sm">
                  <h2 className="font-heading text-[32px] font-bold leading-[41.6px] tracking-[-1px] text-foreground capitalize mb-4">
                    O nosso propósito
                  </h2>
                  <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                    Contribuir para um mundo de trabalho mais humano, onde as pessoas prosperem, sintam pertença e realização, e as organizações alcancem resultados sustentáveis.
                  </p>
                </div>
                <div className="bg-white p-10 rounded-lg shadow-sm">
                  <h2 className="font-heading text-[32px] font-bold leading-[41.6px] tracking-[-1px] text-foreground capitalize mb-4">
                    A nossa missão
                  </h2>
                  <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                    Promover bem-estar, felicidade e desenvolvimento humano nas organizações através de metodologias práticas, humanas e baseadas em evidência.
                  </p>
                </div>
              </div>
            </section>

            {/* Valores & Visão */}
            <section className="w-full bg-[#f8b449] py-20">
              <div className="container-site grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="font-heading text-[32px] font-bold leading-[41.6px] tracking-[-1px] text-white capitalize mb-8">
                    os nossos valores
                  </h2>
                  <div className="space-y-6 text-white font-sans text-base font-medium leading-[26.4px]">
                    <p><strong>Escuta</strong> ativa: <em>acreditamos que compreender verdadeiramente pessoas e contextos é o primeiro passo para qualquer mudança real.</em></p>
                    <p><strong>Simplicidade</strong>: <em>criamos soluções simples, aplicáveis e ajustadas à realidade das organizações — menos teoria, mais impacto.</em></p>
                    <p><strong>Autenticidade</strong>: <em>trabalhamos com o que é real, útil e necessário, mesmo quando é desconfortável.</em></p>
                    <p><strong>Sustentabilidade</strong>: <em>tornar o crescimento sustentável é cuidar do equilíbrio entre as pessoas, os recursos e a comunidade.</em></p>
                  </div>
                </div>
                <div>
                  <h2 className="font-heading text-[32px] font-bold leading-[41.6px] tracking-[-1px] text-white capitalize mb-8">
                    A nossa visão
                  </h2>
                  <p className="text-white font-sans text-base font-medium leading-[26.4px]">
                    Ser a referência na transformação do mundo do trabalho, tornando a felicidade e a saúde psicológica pilares essenciais das organizações do futuro.
                  </p>
                </div>
              </div>
            </section>

            {/* Como trabalhamos */}
            <section className="w-full bg-white py-20">
              <div className="container-site">
                <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize text-center mb-16">
                  Como trabalhamos?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-8 border border-gray-100 rounded-lg">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7.5 7.5 0 017.5 7.5m-7.5-10a10 10 0 0110 10M4.464 15.536a5 5 0 010-7.072M12 18a7.5 7.5 0 01-7.5-7.5M12 6a10 10 0 00-10 10" /></svg>
                    </div>
                    <h3 className="font-heading text-[24px] font-bold text-foreground capitalize mb-4">Escuta & Diagnóstico</h3>
                    <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                      Começamos por ouvir. Pessoas, lideranças e contexto organizacional. Identificamos riscos psicossociais e pontos de oportunidade.
                    </p>
                  </div>
                  <div className="text-center p-8 border border-gray-100 rounded-lg">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="font-heading text-[24px] font-bold text-foreground capitalize mb-4">Co-criação com liderança e equipas</h3>
                    <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                      Desenhamos soluções em conjunto com líderes e equipas para garantir envolvimento e mudanças que fazem sentido no dia a dia.
                    </p>
                  </div>
                  <div className="text-center p-8 border border-gray-100 rounded-lg">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h3 className="font-heading text-[24px] font-bold text-foreground capitalize mb-4">Acompanhamento & avaliação de impacto</h3>
                    <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                      Acompanhamos a implementação, medimos o impacto e garantimos que a felicidade e a saúde psicológica geram resultados reais.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* O que nos diferencia */}
            <section className="w-full bg-gray-50 py-16 relative overflow-hidden">
              <div className="absolute inset-0">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20">
                  <source src="/videos/about-bg.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="container-site relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-12">
                  <h3 className="font-heading text-[28px] font-bold leading-[36.4px] tracking-[-1px] text-foreground capitalize mb-4">
                    O que nos diferencia
                  </h3>
                  <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                    Não acreditamos em soluções genéricas nem em discursos vazios. O nosso trabalho é prático, humano e focado no que realmente faz a diferença no dia a dia das organizações.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" /></svg>
                    </div>
                    <h4 className="font-heading text-xl font-bold text-foreground mb-2">Abordagem prática e aplicada</h4>
                    <p className="font-sans text-sm font-medium text-foreground/70">Transformamos conhecimento em ação com resultados mensuráveis</p>
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" /></svg>
                    </div>
                    <h4 className="font-heading text-xl font-bold text-foreground mb-2">Equipa especializada</h4>
                    <p className="font-sans text-sm font-medium text-foreground/70">Profissionais com experiência em psicologia organizacional e gestão de pessoas</p>
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" /></svg>
                    </div>
                    <h4 className="font-heading text-xl font-bold text-foreground mb-2">Acompanhamento contínuo</h4>
                    <p className="font-sans text-sm font-medium text-foreground/70">Suporte permanente para garantir a sustentabilidade das mudanças</p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="w-full bg-primary py-[100px]">
              <div className="container-site flex items-center justify-between gap-8 flex-wrap">
                <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-primary-foreground capitalize max-w-[720px]">
                  E se o próximo crescimento do seu negócio viesse da cultura?
                </h2>
                <Link
                  href="/contactos/"
                  className="inline-block bg-white text-primary font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
                >
                  Saber mais
                </Link>
              </div>
            </section>

          </article>
        </main>
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
