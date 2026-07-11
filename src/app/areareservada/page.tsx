"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useContent } from "@/lib/content-store";
import { ContentFieldEditor } from "@/components/ContentFieldEditor";
import type { SiteContent } from "@/lib/content-schema";

type Path = (string | number)[];

function setPath(obj: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value;
  const [key, ...rest] = path;
  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[key as number] = setPath(copy[key as number], rest, value);
    return copy;
  }
  const record = obj as Record<string, unknown>;
  return { ...record, [key]: setPath(record[key as string], rest, value) };
}

const SECTION_LABELS: Record<string, string> = {
  header: "Cabeçalho",
  footer: "Rodapé",
  home: "Página Inicial",
  servicos: "Página Serviços",
  sobre: "Página Sobre",
  contactos: "Página Contactos",
};

export default function AreaReservadaPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { content, setContent, resetContent } = useContent();
  const router = useRouter();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [openSection, setOpenSection] = useState<string | null>("home");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "admin") router.push("/login");
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  if (loading || !isAuthenticated || user?.role !== "admin") return null;

  const handleChange = (path: Path, value: unknown) => {
    setDraft((prev) => setPath(prev, path, value) as SiteContent);
    setSaved(false);
  };

  const handleSave = async () => {
    const ok = await setContent(draft);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = async () => {
    if (!confirm("Repor todos os conteúdos para os valores predefinidos? Esta ação não pode ser desfeita.")) return;
    await resetContent();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">Área Reservada</h1>
            <p className="font-body-sm text-body-sm text-secondary">Edição de conteúdos do site — HumanUp</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="font-body-sm text-body-sm text-primary">Guardado ✓</span>}
            <button
              onClick={handleReset}
              className="border border-outline text-on-surface font-button text-button px-4 py-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            >
              Repor predefinições
            </button>
            <button
              onClick={handleSave}
              className="bg-primary text-on-primary font-button text-button px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Guardar alterações
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {Object.keys(draft).map((sectionKey) => {
          const isOpen = openSection === sectionKey;
          return (
            <div key={sectionKey} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : sectionKey)}
                className="w-full flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-surface-container transition-colors"
              >
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">
                  {SECTION_LABELS[sectionKey] || sectionKey}
                </span>
                <span className="material-symbols-outlined text-secondary">
                  {isOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-outline-variant">
                  <ContentFieldEditor
                    value={(draft as unknown as Record<string, unknown>)[sectionKey]}
                    path={[sectionKey]}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
