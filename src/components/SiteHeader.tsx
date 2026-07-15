"use client";

import { useState } from "react";
import Link from "next/link";
import { NavOverlay } from "@/components/NavOverlay";
import { useContent } from "@/lib/content-store";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { content } = useContent();
  const { header } = content;

  return (
    <header
      id="masthead"
      className="site-header sticky top-0 z-99 w-full bg-surface-container-lowest border-b border-outline-variant"
    >
      <div className="container-site flex items-center justify-between h-[80px]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-base">
            H
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            {header.logoText}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-label="Open main menu"
          className="flex flex-col items-end justify-center gap-1.5 p-2 cursor-pointer text-secondary"
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
