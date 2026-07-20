"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import { EditableImage } from "@/components/cms/EditableImage";
import { EditableText } from "@/components/cms/EditableText";

interface SplitContentProps {
  imageKey: string;
  imageFallback: string;
  imageAlt?: string;
  imagePosition: "left" | "right";
  titleKey?: string;
  titleFallback?: string;
  bodyKey: string;
  bodyFallback: string;
  ctaLabelKey?: string;
  ctaLabelFallback?: string;
  ctaHref?: string;
  tone?: "light" | "muted" | "dark" | "primary";
  imageTint?: boolean;
  children?: React.ReactNode;
}

const TONE_STYLES: Record<NonNullable<SplitContentProps["tone"]>, string> = {
  light: "bg-white text-foreground",
  muted: "bg-gray-50 text-foreground",
  dark: "bg-on-surface text-white",
  primary: "bg-primary text-primary-foreground",
};

export function SplitContent({
  imageKey,
  imageFallback,
  imageAlt = "",
  imagePosition,
  titleKey,
  titleFallback,
  bodyKey,
  bodyFallback,
  ctaLabelKey,
  ctaLabelFallback,
  ctaHref,
  tone = "light",
  imageTint = false,
  children,
}: SplitContentProps) {
  const imageDirection = imagePosition === "left" ? "left" : "right";
  const textDirection = imagePosition === "left" ? "right" : "left";

  return (
    <section className={cn("w-full", TONE_STYLES[tone])}>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 items-stretch min-h-[520px]",
          imagePosition === "right" && "md:[&>*:first-child]:order-2",
        )}
      >
        <Reveal direction={imageDirection} distance={64} className="relative min-h-[320px] md:min-h-full">
          <EditableImage
            contentKey={imageKey}
            fallback={imageFallback}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          {imageTint && <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" />}
        </Reveal>
        <div className="flex items-center px-6 py-16 md:px-16 md:py-24">
          <Reveal direction={textDirection} delay={150} distance={48} className="max-w-[520px]">
            {titleKey && titleFallback && (
              <EditableText
                contentKey={titleKey}
                fallback={titleFallback}
                tag="h2"
                className="text-display-sm mb-6"
              />
            )}
            <EditableText
              contentKey={bodyKey}
              fallback={bodyFallback}
              tag="div"
              className="font-sans text-base font-medium leading-[26.4px] whitespace-pre-line mb-8 opacity-90"
              multiline
            />
            {children}
            {ctaLabelKey && ctaLabelFallback && ctaHref && (
              <Link
                href={ctaHref}
                className={cn(
                  "inline-block font-heading font-bold text-base capitalize px-8 py-3 rounded-md transition-opacity hover:opacity-90",
                  tone === "primary"
                    ? "bg-white text-primary"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {ctaLabelFallback}
              </Link>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
