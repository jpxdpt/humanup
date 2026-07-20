"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavOverlay } from "@/components/NavOverlay";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableImage } from "@/components/cms/EditableImage";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useSiteContentSection("header");

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || menuOpen;

  const navItems = [
    { label: header["nav.0.label"] ?? FALLBACKS["header.nav.0.label"], href: header["nav.0.href"] ?? FALLBACKS["header.nav.0.href"] },
    { label: header["nav.1.label"] ?? FALLBACKS["header.nav.1.label"], href: header["nav.1.href"] ?? FALLBACKS["header.nav.1.href"] },
    { label: header["nav.2.label"] ?? FALLBACKS["header.nav.2.label"], href: header["nav.2.href"] ?? FALLBACKS["header.nav.2.href"] },
    { label: header["nav.3.label"] ?? FALLBACKS["header.nav.3.label"], href: header["nav.3.href"] ?? FALLBACKS["header.nav.3.href"] },
  ];

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
          <EditableImage
            contentKey="header.logoImage"
            fallback={FALLBACKS["header.logoImage"]}
            alt={header.logoText ?? FALLBACKS["header.logoText"]}
            width={140}
            height={35}
            className={cn(
              "h-8 w-auto transition-all duration-300",
              solid ? "opacity-100" : "opacity-100 brightness-0 invert",
            )}
          />
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
        navItems={navItems}
        ctaLabel={header.ctaLabel ?? FALLBACKS["header.ctaLabel"]}
        ctaHref={header.ctaHref ?? FALLBACKS["header.ctaHref"]}
      />
    </header>
  );
}
