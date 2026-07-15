import Image from "next/image";
import { cn } from "@/lib/utils";

interface FullImageBandProps {
  image: string;
  imageAlt: string;
  height?: "sm" | "md" | "lg";
}

const HEIGHT_STYLES: Record<NonNullable<FullImageBandProps["height"]>, string> = {
  sm: "h-[320px] md:h-[420px]",
  md: "h-[420px] md:h-[560px]",
  lg: "h-[560px] md:h-[720px]",
};

export function FullImageBand({ image, imageAlt, height = "md" }: FullImageBandProps) {
  return (
    <section className={cn("relative w-full", HEIGHT_STYLES[height])}>
      <Image src={image} alt={imageAlt} fill className="object-cover" sizes="100vw" />
    </section>
  );
}
