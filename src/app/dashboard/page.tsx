"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role === "admin") {
      router.push("/dashboard/admin");
    } else if (user?.role === "ceo") {
      router.push("/dashboard/ceo");
    } else if (user?.role === "colaborador") {
      router.push("/dashboard/colaborador");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="font-body-md text-body-md text-secondary">A redirecionar...</div>
    </div>
  );
}
