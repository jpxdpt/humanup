"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

interface SessionUser {
  role: string;
  nome: string;
  email?: string;
}

export function AdminBar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const saved = sessionStorage.getItem("hup_edit_mode");
    if (saved === "true") setEditMode(true);
  }, [mounted]);

  if (!mounted) return null;
  if (!user || user.role !== "admin") return null;

  const toggleEdit = () => {
    const next = !editMode;
    setEditMode(next);
    sessionStorage.setItem("hup_edit_mode", String(next));
    window.dispatchEvent(new CustomEvent("hup:editmode", { detail: { editMode: next } }));
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const bar = (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#141414] border-t-2 border-[#845400] text-white px-6 py-3 flex items-center gap-4">
      <span className="text-xs font-bold uppercase tracking-widest text-[#845400]">HumanUp Admin</span>
      <button
        type="button"
        onClick={toggleEdit}
        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-[#845400] rounded-sm transition-colors ${
          editMode ? "bg-[#845400] text-white" : "bg-transparent text-[#845400] hover:bg-[#845400]/10"
        }`}
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

  return createPortal(bar, document.body);
}
