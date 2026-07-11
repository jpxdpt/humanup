"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_CONTENT, type SiteContent } from "./content-schema";

const STORAGE_KEY = "hup_content";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return (patch === undefined ? base : (patch as T));
  }
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base)) {
    if (key in patch) {
      const baseVal = (base as Record<string, unknown>)[key];
      const patchVal = (patch as Record<string, unknown>)[key];
      result[key] = isPlainObject(baseVal) ? deepMerge(baseVal, patchVal) : patchVal;
    }
  }
  return result as T;
}

interface ContentContextType {
  content: SiteContent;
  setContent: (content: SiteContent) => void;
  resetContent: () => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
      setContentState(deepMerge(DEFAULT_CONTENT, JSON.parse(stored)));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setContent = useCallback((next: SiteContent) => {
    setContentState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const resetContent = useCallback(() => {
    setContentState(DEFAULT_CONTENT);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ContentContext.Provider value={{ content, setContent, resetContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
