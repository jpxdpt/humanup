"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useSiteContentContext } from "@/lib/site-content";

export function AdminBar() {
  const { user, logout } = useAuth();
  const { editMode, setEditMode } = useSiteContentContext();

  if (!user || user.role !== "admin") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-on-surface border-t-2 border-primary text-white px-6 py-3 flex items-center gap-4">
      <span className="text-xs font-bold uppercase tracking-widest text-primary">HumanUp Admin</span>
      <button
        type="button"
        onClick={() => setEditMode((v) => !v)}
        className={cn(
          "px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-primary rounded-sm transition-colors",
          editMode ? "bg-primary text-on-surface" : "bg-transparent text-primary hover:bg-primary/10"
        )}
      >
        {editMode ? "✓ Modo Edição ON" : "Ativar Edição"}
      </button>
      {editMode && (
        <span className="text-xs text-white/70 hidden md:inline">
          Clica nos textos com contorno para editar. Enter para guardar.
        </span>
      )}
      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/areareservada"
          className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white"
        >
          Backoffice
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
