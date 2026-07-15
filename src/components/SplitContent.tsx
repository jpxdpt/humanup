import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SplitContentProps {
  image: string;
  imageAlt: string;
  imagePosition: "left" | "right";
  eyebrow?: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  tone?: "light" | "dark" | "primary";
  children?: React.ReactNode;
}

const TONE_STYLES: Record<NonNullable<SplitContentProps["tone"]>, string> = {
  light: "bg-white text-foreground",
  dark: "bg-on-surface text-white",
  primary: "bg-primary text-primary-foreground",
};

export function SplitContent({
  image,
  imageAlt,
  imagePosition,
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
  tone = "light",
  children,
}: SplitContentProps) {
  return (
    <section className={cn("w-full", TONE_STYLES[tone])}>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 items-stretch min-h-[520px]",
          imagePosition === "right" && "md:[&>*:first-child]:order-2",
        )}
      >
        <div className="relative min-h-[320px] md:min-h-full">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="flex items-center px-6 py-16 md:px-16 md:py-24">
          <div className="max-w-[520px]">
            {eyebrow && (
              <span className="block font-sans text-label-caps uppercase tracking-[0.05em] mb-4 opacity-70">
                {eyebrow}
              </span>
            )}
            <h2
              className="font-heading text-headline-lg md:text-[40px] font-bold leading-tight tracking-[-1px] mb-6"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <div
              className="font-sans text-base font-medium leading-[26.4px] whitespace-pre-line mb-8 opacity-90"
              dangerouslySetInnerHTML={{ __html: body }}
            />
            {children}
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className={cn(
                  "inline-block font-heading font-bold text-base capitalize px-8 py-3 rounded-md transition-opacity hover:opacity-90",
                  tone === "primary"
                    ? "bg-white text-primary"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
