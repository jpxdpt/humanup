"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SearchIcon, MenuIcon, CloseIcon } from "@/components/icons";
import { useContent } from "@/lib/content-store";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { content } = useContent();
  const { header } = content;
  const NAV_ITEMS = header.nav;

  return (
    <header
      id="masthead"
      className="site-header relative z-99 w-full bg-surface-container-lowest border-b border-outline-variant"
    >
      {/* Desktop header */}
      <div id="ast-desktop-header" className="hidden md:block">
        <div className="ast-main-header-wrap">
          <div className="ast-primary-header-bar">
            <div className="container-site flex items-center justify-between h-[80px]">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-base">H</div>
                  <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">{header.logoText}</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <nav className="flex items-center">
                  <ul className="flex items-center gap-0">
                    {NAV_ITEMS.map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className={cn(
                              "px-4 py-2 font-button text-button transition-colors duration-200",
                              isActive
                                ? "text-primary font-semibold"
                                : "text-secondary hover:text-primary",
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <Link
                  href={header.ctaHref}
                  className="bg-primary text-on-primary font-button text-button px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {header.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div id="ast-mobile-header" className="md:hidden">
        <div className="ast-main-header-wrap">
          <div className="ast-primary-header-bar">
            <div className="flex items-center justify-between px-6 h-[70px]">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">H</div>
                <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight text-lg">{header.logoText}</span>
              </Link>
              <button
                type="button"
                className="menu-toggle flex items-center justify-center p-2 cursor-pointer text-secondary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Main menu toggle"
              >
                <span className="mobile-menu-toggle-icon">
                  {mobileMenuOpen ? (
                    <span className="material-symbols-outlined">close</span>
                  ) : (
                    <span className="material-symbols-outlined">menu</span>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="ast-mobile-header-content border-t border-outline-variant bg-surface-container-lowest">
            <nav className="px-6 py-4">
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block py-2.5 font-button text-button transition-colors duration-200",
                          isActive
                            ? "text-primary font-semibold"
                            : "text-secondary hover:text-primary",
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="mt-2 pt-2 border-t border-outline-variant">
                  <Link
                    href={header.ctaHref}
                    className="block py-2.5 font-button text-button font-semibold text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {header.ctaLabel}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
