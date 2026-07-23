import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCeoDashboardData } from "@/lib/dashboard-cache";
import CeoDashboardClient from "./CeoDashboardClient";

export default async function CeoDashboardPage() {
  const session = await getSession();
  if (!session || (session.role !== "ceo" && session.role !== "gestor")) {
    redirect("/login");
  }

  if (!session.empresaId) {
    redirect("/login");
  }

  const data = await getCeoDashboardData(session.empresaId, session.empresaNome || "");

  return <CeoDashboardClient {...data} />;
}
