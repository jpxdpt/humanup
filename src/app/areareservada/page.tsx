"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Row = { key: string; value: string; label: string; section: string };

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
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "admin") router.push("/login");
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    fetch("/api/content/admin")
      .then((r) => (r.ok ? (r.json() as Promise<Row[]>) : []))
      .then((data) => {
        setRows(data);
        setValues(Object.fromEntries(data.map((r) => [r.key, r.value])));
      })
      .catch(() => {});
  }, []);

  const handleSave = async (row: Row) => {
    setSaving(row.key);
    const res = await fetch(`/api/content/${encodeURIComponent(row.key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: values[row.key] ?? "" }),
    });
    setSaving(null);
    if (!res.ok) toast.error("Erro ao guardar");
  };

  const handleReset = async () => {
    if (!confirm("Repor todos os conteúdos para os valores predefinidos? Esta ação não pode ser desfeita.")) return;
    const res = await fetch("/api/content/reset", { method: "POST" });
    if (res.ok) window.location.reload();
    else toast.error("Erro ao repor predefinições");
  };

  const grouped = rows.reduce<Record<string, Row[]>>((acc, row) => {
    acc[row.section] ??= [];
    acc[row.section].push(row);
    return acc;
  }, {});

  if (loading || !isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">Área Reservada</h1>
            <p className="font-body-sm text-body-sm text-secondary">Edição de conteúdos do site — HumanUp</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="border border-outline text-on-surface font-button text-button px-4 py-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            >
              Repor predefinições
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {Object.keys(grouped).sort().map((section) => {
          const isOpen = open[section] ?? false;
          return (
            <div key={section} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen((prev) => ({ ...prev, [section]: !prev[section] }))}
                className="w-full flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-surface-container transition-colors"
              >
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">
                  {SECTION_LABELS[section] || section}
                </span>
                <span className="material-symbols-outlined text-secondary">
                  {isOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-outline-variant space-y-6">
                  {grouped[section].map((row) => (
                    <div key={row.key} className="space-y-2">
                      <label className="block font-body-sm text-body-sm font-medium text-secondary ml-1">
                        {row.label}
                      </label>
                      <div className="flex gap-2 items-start">
                        {(values[row.key] ?? "").length > 80 ? (
                          <textarea
                            value={values[row.key] ?? ""}
                            onChange={(e) => setValues((prev) => ({ ...prev, [row.key]: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        ) : (
                          <input
                            type="text"
                            value={values[row.key] ?? ""}
                            onChange={(e) => setValues((prev) => ({ ...prev, [row.key]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleSave(row)}
                          disabled={saving === row.key}
                          className={cn(
                            "px-4 py-2 bg-primary text-on-primary rounded-lg font-button text-button hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0",
                            saving === row.key && "opacity-50"
                          )}
                        >
                          {saving === row.key ? "..." : "Guardar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
