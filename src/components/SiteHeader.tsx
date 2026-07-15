"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavOverlay } from "@/components/NavOverlay";
import { useContent } from "@/lib/content-store";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { content } = useContent();
  const { header } = content;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || menuOpen;

  return (
    <header
      id="masthead"
      className={cn(
        "site-header fixed top-0 left-0 right-0 z-99 w-full transition-colors duration-300",
        solid
          ? "bg-surface-container-lowest border-b border-outline-variant"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="container-site flex items-center justify-between h-[80px]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-base">
            H
          </div>
          <span
            className={cn(
              "font-headline-md text-headline-md font-bold tracking-tight transition-colors duration-300",
              solid ? "text-primary" : "text-white",
            )}
          >
            {header.logoText}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-label="Open main menu"
          className={cn(
            "flex flex-col items-end justify-center gap-1.5 p-2 cursor-pointer transition-colors duration-300",
            solid ? "text-secondary" : "text-white",
          )}
        >
          <span className="block w-7 h-0.5 bg-current" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      <NavOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={header.nav}
        ctaLabel={header.ctaLabel}
        ctaHref={header.ctaHref}
      />
    </header>
  );
}
