"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSiteContentContext } from "@/lib/site-content";

interface EditableBackgroundProps {
  contentKey: string;
  fallback: string;
  overlay?: string;
  className?: string;
  children: ReactNode;
}

export function EditableBackground({
  contentKey,
  fallback,
  overlay,
  className,
  children,
}: EditableBackgroundProps) {
  const { content, editMode } = useSiteContentContext();
  const src = content[contentKey] || fallback;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", contentKey);
    try {
      const res = await fetch("/api/content/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
    } catch (err) {
      alert("Erro: " + (err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${src})`, opacity: uploading ? 0.5 : 1 }}
      />
      {overlay && <div className="absolute inset-0" style={{ backgroundColor: overlay }} />}
      {editMode && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-[#141414]/80 text-white text-[11px] font-bold uppercase tracking-wider rounded-sm border border-white/30 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
        >
          {uploading ? "..." : "Trocar Fundo"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
