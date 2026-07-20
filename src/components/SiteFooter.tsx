"use client";

import Link from "next/link";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";

export function SiteFooter() {
  const footer = useSiteContentSection("footer");

  const navItems = [
    { label: footer["nav.0.label"] ?? FALLBACKS["footer.nav.0.label"], href: footer["nav.0.href"] ?? FALLBACKS["footer.nav.0.href"] },
    { label: footer["nav.1.label"] ?? FALLBACKS["footer.nav.1.label"], href: footer["nav.1.href"] ?? FALLBACKS["footer.nav.1.href"] },
    { label: footer["nav.2.label"] ?? FALLBACKS["footer.nav.2.label"], href: footer["nav.2.href"] ?? FALLBACKS["footer.nav.2.href"] },
    { label: footer["nav.3.label"] ?? FALLBACKS["footer.nav.3.label"], href: footer["nav.3.href"] ?? FALLBACKS["footer.nav.3.href"] },
  ];

  return (
    <footer id="colophon" className="site-footer w-full bg-white">
      <div className="container-site flex items-center justify-between h-[70px]">
        <nav className="flex items-center">
          <ul className="flex items-center gap-0">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center font-sans text-base font-medium leading-[26.4px] text-foreground hover:text-primary transition-colors duration-200 px-2 first:pl-0 last:pr-0"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ast-footer-copyright">
          <p className="font-sans text-base font-medium leading-[26.4px] text-foreground text-right">
            {footer.copyright ?? FALLBACKS["footer.copyright"]}
          </p>
        </div>
      </div>
    </footer>
  );
}
