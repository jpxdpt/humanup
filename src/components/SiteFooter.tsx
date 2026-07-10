import Link from "next/link";

const FOOTER_NAV = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Serviços", href: "/servicos" },
  { label: "Contactos", href: "/contactos" },
];

export function SiteFooter() {
  return (
    <footer id="colophon" className="site-footer w-full bg-white">
      <div className="container-site flex items-center justify-between h-[70px]">
        <nav className="flex items-center">
          <ul className="flex items-center gap-0">
            {FOOTER_NAV.map((item) => (
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
            Direitos de Autor &copy; 2026 HumanUp
          </p>
        </div>
      </div>
    </footer>
  );
}
