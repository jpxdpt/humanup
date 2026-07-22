"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Notification = {
  id: number;
  user_id: string | null;
  role: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(date).toLocaleDateString("pt-PT");
}

const TYPE_ICONS: Record<string, string> = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  error: "error",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const roleLabel = user?.role === "admin" ? "Enterprise Admin" : user?.role === "ceo" ? "CEO" : "Colaborador";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const markAsRead = async (ids?: number[]) => {
    const body = ids ? { ids } : { all: true };
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setNotifications((prev) =>
      prev.map((n) => (ids ? (ids.includes(n.id) ? { ...n, read: true } : n) : { ...n, read: true }))
    );
    if (!ids) setUnreadCount(0);
    else setUnreadCount((prev) => Math.max(0, prev - ids.length));
  };

  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    const hrefTab = new URLSearchParams(hrefQuery).get("tab") || "dashboard";
    return pathname === hrefPath && tab === hrefTab;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-on-surface font-body-md antialiased">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`bg-surface-container-low h-screen w-64 fixed left-0 top-0 border-r border-surface-variant flex flex-col py-margin-md px-margin-sm gap-2 z-50 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
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
              <NavItem href="/dashboard/admin" icon="dashboard" label="Painel" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin")} />
              <NavItem href="/dashboard/admin?tab=clientes" icon="groups" label="Clientes" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=clientes")} />
              <NavItem href="/dashboard/admin?tab=questionarios" icon="description" label="Questionários" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=questionarios")} />
              <NavItem href="/dashboard/admin?tab=envios" icon="send" label="Envios" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=envios")} />
              <NavItem href="/dashboard/admin?tab=colaboradores" icon="person_add" label="Importar" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=colaboradores")} />
              <NavItem href="/dashboard/admin?tab=mensagens" icon="forum" label="Mensagens" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=mensagens")} />
              <NavItem href="/dashboard/admin?tab=relatorios" icon="analytics" label="Relatórios" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=relatorios")} />
              <NavItem href="/dashboard/admin?tab=documentos" icon="folder" label="Documentos" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=documentos")} />
              <NavItem href="/dashboard/admin?tab=pacotes" icon="inventory_2" label="Pacotes" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=pacotes")} />
              <NavItem href="/dashboard/admin?tab=dimensoes" icon="donut_large" label="Dimensões" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=dimensoes")} />
              <NavItem href="/dashboard/admin?tab=definicoes" icon="settings" label="Definições" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/admin?tab=definicoes")} />
            </>
          )}
          {user?.role === "ceo" && (
            <>
              <NavItem href="/dashboard/ceo" icon="dashboard" label="Painel" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/ceo")} />
              <NavItem href="/dashboard/ceo?tab=equipa" icon="groups" label="Equipa" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/ceo?tab=equipa")} />
              <NavItem href="/dashboard/ceo?tab=faturas" icon="receipt" label="Faturas" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/ceo?tab=faturas")} />
              <NavItem href="/dashboard/ceo?tab=recursos" icon="folder" label="Recursos" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/ceo?tab=recursos")} />
            </>
          )}
          {user?.role === "colaborador" && (
            <>
              <NavItem href="/dashboard/colaborador" icon="assignment" label="Questionário" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard/colaborador")} />
            </>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-surface-variant flex flex-col gap-1">
          <button onClick={() => setMobileMenuOpen(false)} className="text-secondary hover:bg-surface-container-high transition-all rounded-lg flex items-center gap-3 px-3 py-2.5 cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="font-label-caps text-label-caps">Ajuda</span>
          </button>
          <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-secondary hover:bg-surface-container-high transition-all rounded-lg flex items-center gap-3 px-3 py-2.5 cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-caps text-label-caps">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 w-full h-screen relative">
        {/* Topbar */}
        <header className="bg-surface-container-lowest w-full h-16 sticky top-0 border-b border-surface-variant shadow-sm flex justify-between items-center px-container-padding z-40">
          <div className="flex-1 flex items-center">
            <span className="text-body-md text-on-surface font-medium hidden md:block">Bem-vindo(a), {user?.nome || "Utilizador"}</span>
            <button className="md:hidden p-2 text-secondary cursor-pointer active:scale-95 transition-transform hover:bg-surface-container rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div className="flex items-center gap-2 relative">
            <div ref={notifRef} className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 text-primary hover:bg-surface-container rounded-full cursor-pointer active:scale-95 transition-transform relative">
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error text-[10px] font-bold text-on-error rounded-full flex items-center justify-center px-1 border-2 border-surface-container-lowest leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl z-50 max-h-[480px] flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-surface-variant">
                    <span className="font-label-caps text-label-caps text-secondary">Notificações</span>
                    {unreadCount > 0 && (
                      <button onClick={() => markAsRead()} className="text-body-sm text-primary hover:underline font-medium cursor-pointer">
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-secondary">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50">notifications_off</span>
                        <span className="text-body-sm">Sem notificações</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => !n.read && markAsRead([n.id])}
                          className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-container transition-colors cursor-pointer border-b border-surface-variant last:border-b-0 ${
                            !n.read ? "bg-primary-container/10" : ""
                          }`}
                        >
                          <span className={`material-symbols-outlined text-lg mt-0.5 ${
                            n.type === "error" ? "text-error" :
                            n.type === "warning" ? "text-[#e68a2e]" :
                            n.type === "success" ? "text-[#2e7d32]" :
                            "text-primary"
                          }`}>
                            {TYPE_ICONS[n.type] || "info"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-body-sm ${!n.read ? "font-bold" : "font-medium"} text-on-surface truncate`}>
                                {n.title}
                              </span>
                              <span className="text-body-xs text-tertiary shrink-0">{timeAgo(n.created_at)}</span>
                            </div>
                            <p className="text-body-sm text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
        <main data-lenis-prevent className="flex-1 overflow-y-auto p-4 md:p-container-padding bg-background pb-20">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active, onClick }: { href: string; icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
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
