"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSiteContentContext } from "@/lib/site-content";

interface EditableImageProps {
  contentKey: string;
  fallback: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function EditableImage({
  contentKey,
  fallback,
  alt = "",
  className,
  fill,
  width,
  height,
}: EditableImageProps) {
  const { content, editMode, saveContent } = useSiteContentContext();
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
      if (data.url) await saveContent(contentKey, data.url);
    } catch (err) {
      alert("Erro: " + (err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const imageProps = fill
    ? { fill: true as const, width: undefined, height: undefined }
    : { width: width ?? 0, height: height ?? 0, fill: undefined };

  if (!editMode) {
    return (
      <Image
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        {...imageProps}
      />
    );
  }

  return (
    <div className={cn("relative inline-block", fill && "w-full h-full")}>
      <Image
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        style={{ opacity: uploading ? 0.5 : 1 }}
        {...imageProps}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center bg-primary/15 border-2 border-dashed border-primary opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase rounded-sm">
          {uploading ? "A enviar..." : "Trocar Imagem"}
        </span>
      </div>
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
    </div>
  );
}
