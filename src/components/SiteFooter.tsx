"use client";

import Link from "next/link";
import { useContent } from "@/lib/content-store";

export function SiteFooter() {
  const { content } = useContent();
  const { footer } = content;
  return (
    <footer id="colophon" className="site-footer w-full bg-white">
      <div className="container-site flex items-center justify-between h-[70px]">
        <nav className="flex items-center">
          <ul className="flex items-center gap-0">
            {footer.nav.map((item) => (
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
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
