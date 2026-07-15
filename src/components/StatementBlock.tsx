import { cn } from "@/lib/utils";

interface StatementBlockProps {
  eyebrow?: string;
  text: string;
  tone?: "light" | "muted" | "dark" | "primary";
}

const TONE_STYLES: Record<NonNullable<StatementBlockProps["tone"]>, string> = {
  light: "bg-white text-foreground",
  muted: "bg-gray-50 text-foreground",
  dark: "bg-on-surface text-white",
  primary: "bg-primary text-primary-foreground",
};

export function StatementBlock({ eyebrow, text, tone = "light" }: StatementBlockProps) {
  return (
    <section className={cn("w-full py-24 md:py-32", TONE_STYLES[tone])}>
      <div className="container-site max-w-[840px] mx-auto text-center">
        {eyebrow && (
          <p className="font-sans text-label-caps uppercase tracking-[0.15em] opacity-60 mb-6">
            {eyebrow}
          </p>
        )}
        <p
          className="font-heading text-[28px] md:text-[42px] font-semibold leading-[1.3] tracking-[-0.5px]"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </section>
  );
}
