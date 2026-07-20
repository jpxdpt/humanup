import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PageFade } from "@/components/PageFade";
import { SmoothScroll } from "@/components/SmoothScroll";
import { AdminBar } from "@/components/cms/AdminBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "HumanUp — Painel Administrador",
  description: "Potencie a produtividade e o bem-estar dos seus colaboradores com soluções de diagnóstico e projetos de bem‑estar laboral personalizados.",
  icons: {
    icon: "/seo/favicon.png",
    apple: "/seo/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`light ${inter.variable} ${playfair.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md text-on-surface bg-background antialiased">
        <Providers>
          <SmoothScroll />
          <PageFade>{children}</PageFade>
        </Providers>
        <AdminBar />
      </body>
    </html>
  );
}
