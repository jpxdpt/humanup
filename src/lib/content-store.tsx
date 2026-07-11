"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_CONTENT, type SiteContent } from "./content-schema";

interface ContentContextType {
  content: SiteContent;
  loading: boolean;
  setContent: (content: SiteContent) => Promise<boolean>;
  resetContent: () => Promise<boolean>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => setContentState(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setContent = useCallback(async (next: SiteContent): Promise<boolean> => {
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) return false;
    setContentState(next);
    return true;
  }, []);

  const resetContent = useCallback(async (): Promise<boolean> => {
    return setContent(DEFAULT_CONTENT);
  }, [setContent]);

  return (
    <ContentContext.Provider value={{ content, loading, setContent, resetContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
