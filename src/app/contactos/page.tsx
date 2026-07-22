"use client";

import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageHero } from "@/components/PageHero";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableText } from "@/components/cms/EditableText";

export default function ContactosPage() {
  const contactos = useSiteContentSection("contactos");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("loading");
    setStatusMessage("");
    try {
      const res = await fetch("/api/contactos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar mensagem");
      setStatus("success");
      setStatusMessage(data.message ?? "Mensagem enviada com sucesso");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Erro ao enviar mensagem");
    }
  }

  const emailLines = Array.from({ length: 2 }, (_, i) => contactos[`emailLines.${i}`] ?? FALLBACKS[`contactos.emailLines.${i}`]).filter(Boolean);

  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">
            <PageHero
              imageKey="contactos.hero.backgroundImage"
              imageFallback={FALLBACKS["contactos.hero.backgroundImage"]}
              imageAlt="Contacte a HumanUp"
              titleKey="contactos.hero.title"
              titleFallback={contactos["hero.title"] ?? FALLBACKS["contactos.hero.title"]}
            />

            <section className="w-full bg-white py-16">
              <div className="container-site grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <p className="font-sans text-base font-medium text-primary uppercase mb-2">
                    {contactos.eyebrow ?? FALLBACKS["contactos.eyebrow"]}
                  </p>
                  <EditableText
                    contentKey="contactos.title"
                    fallback={contactos.title ?? FALLBACKS["contactos.title"]}
                    tag="h2"
                    className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize mb-12"
                  />

                  <div className="mb-8">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">Email</h3>
                    <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                      {emailLines.map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">Endereço</h3>
                    <EditableText
                      contentKey="contactos.endereco"
                      fallback={contactos.endereco ?? FALLBACKS["contactos.endereco"]}
                      tag="p"
                      className="font-sans text-base font-medium leading-[26.4px] text-foreground whitespace-pre-line"
                      multiline
                    />
                  </div>
                </div>

                <div>
                  <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block font-sans text-sm font-medium text-foreground mb-1">Nome *</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" placeholder="O seu nome" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block font-sans text-sm font-medium text-foreground mb-1">Email *</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" placeholder="O seu email" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block font-sans text-sm font-medium text-foreground mb-1">Assunto</label>
                      <input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" placeholder="Assunto da mensagem" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block font-sans text-sm font-medium text-foreground mb-1">Mensagem *</label>
                      <textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none" placeholder="A sua mensagem" />
                    </div>
                    <button type="submit" disabled={status === "loading"} className="w-full bg-primary text-primary-foreground font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                      {status === "loading" ? "A enviar..." : contactos.formTitle ?? FALLBACKS["contactos.formTitle"]}
                    </button>
                    {status === "success" && (
                      <p className="text-green-600 font-sans text-sm text-center">{statusMessage}</p>
                    )}
                    {status === "error" && (
                      <p className="text-red-600 font-sans text-sm text-center">{statusMessage}</p>
                    )}
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
