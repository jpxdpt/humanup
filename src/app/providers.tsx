"use client";

import { AuthProvider } from "@/lib/auth";
import { SiteContentProvider } from "@/lib/site-content";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SiteContentProvider>
        {children}
      </SiteContentProvider>
    </AuthProvider>
  );
}
