"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_CONTENT } from "./content-schema";
import { DEFAULT_IMAGE_KEYS } from "./content-images";
import { flattenContent } from "./content-utils";

export const FALLBACKS: Record<string, string> = {
  ...Object.fromEntries(flattenContent(DEFAULT_CONTENT).map((item) => [item.key, item.value])),
  ...DEFAULT_IMAGE_KEYS,
};

interface SiteContentContextType {
  content: Record<string, string>;
  loading: boolean;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  saveContent: (key: string, value: string) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, string>>(FALLBACKS);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : {}))
      .then((data) => setContent((prev) => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveContent = useCallback(async (key: string, value: string) => {
    const res = await fetch(`/api/content/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error("Erro ao guardar");
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SiteContentContext.Provider
      value={{ content, loading, editMode, setEditMode, saveContent }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContentContext(): SiteContentContextType {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContentContext must be used within SiteContentProvider");
  return ctx;
}

export function useSiteContent(key: string, fallback = ""): string {
  const ctx = useSiteContentContext();
  return ctx.content[key] ?? fallback;
}

export function useSiteContentSection(prefix: string): Record<string, string> {
  const ctx = useSiteContentContext();
  const result: Record<string, string> = {};
  Object.entries(ctx.content).forEach(([key, value]) => {
    if (key === prefix) {
      result[""] = value;
    } else if (key.startsWith(`${prefix}.`)) {
      result[key.slice(prefix.length + 1)] = value;
    }
  });
  return result;
}
