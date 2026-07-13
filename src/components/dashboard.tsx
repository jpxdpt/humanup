"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const roleLabel = user?.role === "admin" ? "Enterprise Admin" : user?.role === "ceo" ? "CEO" : "Colaborador";

  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    const hrefTab = new URLSearchParams(hrefQuery).get("tab") || "dashboard";
    return pathname === hrefPath && tab === hrefTab;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-on-surface font-body-md antialiased">
      {/* Sidebar */}
      <aside className="bg-surface-container-low h-screen w-64 fixed left-0 top-0 border-r border-surface-variant flex flex-col py-margin-md px-margin-sm gap-2 z-50 hidden md:flex">
        <div className="flex items-center gap-3 px-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
            H
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none tracking-tight">HumanUp</h1>
            <p className="font-body-sm text-body-sm text-secondary mt-1">{roleLabel}</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {user?.role === "admin" && (
            <>
              <NavItem href="/dashboard/admin" icon="dashboard" label="Dashboard" active={isActive("/dashboard/admin")} />
              <NavItem href="/dashboard/admin?tab=clientes" icon="groups" label="Clients" active={isActive("/dashboard/admin?tab=clientes")} />
              <NavItem href="/dashboard/admin?tab=questionarios" icon="description" label="Questionnaires" active={isActive("/dashboard/admin?tab=questionarios")} />
              <NavItem href="/dashboard/admin?tab=relatorios" icon="analytics" label="Reports" active={isActive("/dashboard/admin?tab=relatorios")} />
              <NavItem href="/dashboard/admin?tab=definicoes" icon="settings" label="Settings" active={isActive("/dashboard/admin?tab=definicoes")} />
              <NavItem href="/areareservada" icon="edit_document" label="Área Reservada" active={isActive("/areareservada")} />
            </>
          )}
          {user?.role === "ceo" && (
            <>
              <NavItem href="/dashboard/ceo" icon="dashboard" label="Dashboard" active={isActive("/dashboard/ceo")} />
              <NavItem href="/dashboard/ceo?tab=equipa" icon="groups" label="Team" active={isActive("/dashboard/ceo?tab=equipa")} />
              <NavItem href="/dashboard/ceo?tab=faturas" icon="receipt" label="Invoices" active={isActive("/dashboard/ceo?tab=faturas")} />
              <NavItem href="/dashboard/ceo?tab=recursos" icon="folder" label="Resources" active={isActive("/dashboard/ceo?tab=recursos")} />
            </>
          )}
          {user?.role === "colaborador" && (
            <>
              <NavItem href="/dashboard/colaborador" icon="assignment" label="Questionário" active={isActive("/dashboard/colaborador")} />
            </>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-surface-variant flex flex-col gap-1">
          <a className="text-secondary hover:bg-surface-container-high transition-all rounded-lg flex items-center gap-3 px-3 py-2.5 cursor-pointer">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="font-label-caps text-label-caps">Help Center</span>
          </a>
          <button onClick={logout} className="text-secondary hover:bg-surface-container-high transition-all rounded-lg flex items-center gap-3 px-3 py-2.5 cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-caps text-label-caps">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 w-full h-screen relative">
        {/* Topbar */}
        <header className="bg-surface-container-lowest w-full h-16 sticky top-0 border-b border-surface-variant shadow-sm flex justify-between items-center px-container-padding z-40">
          <div className="flex-1 flex items-center">
            <div className="relative w-full max-w-md hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary-container font-body-sm text-body-sm transition-shadow" placeholder="Pesquisar..." type="text" />
            </div>
            <button className="md:hidden p-2 text-secondary cursor-pointer active:scale-95 transition-transform hover:bg-surface-container rounded-full">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-primary hover:bg-surface-container rounded-full cursor-pointer active:scale-95 transition-transform relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest" />
            </button>
            <button className="p-2 text-primary hover:bg-surface-container rounded-full cursor-pointer active:scale-95 transition-transform">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="ml-4 pl-4 border-l border-surface-variant flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                {user?.nome?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface hidden sm:block">{user?.nome}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-container-padding bg-background pb-20">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg flex items-center gap-3 px-3 py-2.5 transition-all ${
        active
          ? "bg-primary text-on-primary font-medium"
          : "text-secondary hover:bg-surface-container-high"
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
        {icon}
      </span>
      <span className="font-label-caps text-label-caps">{label}</span>
    </Link>
  );
}

export function KpiCard({ label, value, sub, icon, highlight }: { label: string; value: string; sub?: string; icon?: string; highlight?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {icon && (
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl text-primary">{icon}</span>
        </div>
      )}
      <p className="font-label-caps text-label-caps text-secondary mb-2">{label}</p>
      <p className="font-headline-xl text-headline-xl text-on-surface mb-1">{value}</p>
      {sub && <p className={`font-body-sm text-body-sm ${highlight === "primary" ? "text-primary font-medium" : "text-secondary"}`}>{sub}</p>}
    </div>
  );
}

export function Panel({ title, children, action, subtitle }: { title: string; children: React.ReactNode; action?: React.ReactNode; subtitle?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">{title}</h3>
          {subtitle && <span className="font-body-sm text-body-sm text-tertiary ml-2">{subtitle}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Badge({ variant, children }: { variant: "pago" | "pendente" | "em_atraso" | "ativo" | "inativo" | "rascunho"; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    pago: "bg-[#dcfce7] text-[#166534]",
    pendente: "bg-[#fef3c7] text-[#92400e]",
    em_atraso: "bg-[#fee2e2] text-[#991b1b]",
    ativo: "bg-[#dcfce7] text-[#166534]",
    inativo: "bg-[#fee2e2] text-[#991b1b]",
    rascunho: "bg-[#dbe4ed] text-[#524435]",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[variant] || ""}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-4 text-secondary opacity-50">
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <p className="font-body-md text-body-md text-secondary">{title}</p>
      {description && <p className="font-body-sm text-body-sm text-tertiary mt-1">{description}</p>}
    </div>
  );
}
