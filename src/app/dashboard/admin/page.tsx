import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAdminDashboardStats } from "@/lib/dashboard-cache";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const initialData = await getAdminDashboardStats();

  return <AdminDashboardClient initialData={initialData} />;
}
