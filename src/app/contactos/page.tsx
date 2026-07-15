"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageHero } from "@/components/PageHero";
import { useContent } from "@/lib/content-store";

export default function ContactosPage() {
  const { content } = useContent();
  const { contactos } = content;
  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">

            {/* Hero Banner */}
            <PageHero
              image="/images/contact-hero.jpg"
              imageAlt="Contacte a HumanUp"
              title={contactos.hero.title}
            />

            {/* Contact Form + Info */}
            <section className="w-full bg-white py-16">
              <div className="container-site grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* Left: Info */}
                <div>
                  <p className="font-sans text-base font-medium text-primary uppercase mb-2">{contactos.eyebrow}</p>
                  <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize mb-12">
                    {contactos.title}
                  </h2>

                  <div className="mb-8">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">Email</h3>
                    <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                      {contactos.emailLines.map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">Endereço</h3>
                    <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                      {contactos.endereco}
                    </p>
                  </div>
                </div>

                {/* Right: Form */}
                <div>
                  <form className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block font-sans text-sm font-medium text-foreground mb-1">
                          Nome *
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          placeholder="O seu nome"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block font-sans text-sm font-medium text-foreground mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          placeholder="O seu email"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block font-sans text-sm font-medium text-foreground mb-1">
                        Assunto
                      </label>
                      <input
                        type="text"
                        id="subject"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Assunto da mensagem"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block font-sans text-sm font-medium text-foreground mb-1">
                        Mensagem *
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                        placeholder="A sua mensagem"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {contactos.formTitle}
                    </button>
                  </form>
                </div>
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
