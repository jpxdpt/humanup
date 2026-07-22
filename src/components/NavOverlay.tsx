"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface NavOverlayProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  ctaLabel: string;
  ctaHref: string;
}

export function NavOverlay({ open, onClose, navItems, ctaLabel, ctaHref }: NavOverlayProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-100 bg-on-surface text-white transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute top-6 right-6 md:top-8 md:right-8 p-2 text-white"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <nav aria-label="Main navigation" className="flex h-full items-center justify-center">
        <ul className="flex flex-col items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "font-heading text-[32px] md:text-[40px] font-bold capitalize transition-opacity hover:opacity-70",
                    isActive ? "opacity-100" : "opacity-80",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="mt-4">
            <Link
              href={ctaHref}
              onClick={onClose}
              className="inline-block bg-primary text-primary-foreground font-button text-button px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              {ctaLabel}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
