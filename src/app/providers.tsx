"use client";

import { AuthProvider } from "@/lib/auth";
import { SiteContentProvider } from "@/lib/site-content";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SiteContentProvider>
        {children}
      </SiteContentProvider>
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </AuthProvider>
  );
}
