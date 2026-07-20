"use client";

import { useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSiteContentContext } from "@/lib/site-content";

interface EditableTextProps {
  contentKey: string;
  fallback?: string;
  tag?: ElementType;
  className?: string;
  multiline?: boolean;
  children?: ReactNode;
}

export function EditableText({
  contentKey,
  fallback = "",
  tag: Tag = "span",
  className,
  multiline = false,
}: EditableTextProps) {
  const { content, editMode, saveContent } = useSiteContentContext();
  const value = content[contentKey] ?? fallback;
  const ref = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!editMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  const handleSave = async () => {
    if (!ref.current) return;
    setSaving(true);
    try {
      await saveContent(contentKey, ref.current.innerText.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Tag
        ref={ref as React.RefObject<HTMLElement>}
        contentEditable
        suppressContentEditableWarning
        className={cn(className, "outline-2 outline-primary outline-offset-[3px] cursor-text")}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
        }}
      >
        {value}
      </Tag>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={cn(
          "absolute -top-7 right-0 z-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap rounded-sm",
          saved ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
        )}
      >
        {saving ? "..." : saved ? "✓ Guardado" : "Guardar"}
      </button>
    </div>
  );
}
