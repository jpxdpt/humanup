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
        <div
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 z-50 flex items-center justify-center bg-primary/15 border-2 border-dashed border-primary opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <span className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase rounded-sm">
            {uploading ? "A enviar..." : "Trocar Fundo"}
          </span>
        </div>
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
