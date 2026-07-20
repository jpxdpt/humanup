"use client";

import { AuthProvider } from "@/lib/auth";
import { SiteContentProvider } from "@/lib/site-content";
import { AdminBar } from "@/components/cms/AdminBar";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SiteContentProvider>
        {children}
        <AdminBar />
      </SiteContentProvider>
    </AuthProvider>
  );
}
