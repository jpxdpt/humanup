"use client";

import { AuthProvider } from "@/lib/auth";
import { ContentProvider } from "@/lib/content-store";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ContentProvider>{children}</ContentProvider>
    </AuthProvider>
  );
}
