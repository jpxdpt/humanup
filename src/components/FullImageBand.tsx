import Image from "next/image";
import { cn } from "@/lib/utils";
import { Parallax } from "@/components/Parallax";

interface FullImageBandProps {
  image: string;
  imageAlt: string;
  height?: "sm" | "md" | "lg";
  imageTint?: boolean;
}

const HEIGHT_STYLES: Record<NonNullable<FullImageBandProps["height"]>, string> = {
  sm: "h-[320px] md:h-[420px]",
  md: "h-[420px] md:h-[560px]",
  lg: "h-[560px] md:h-[720px]",
};

export function FullImageBand({ image, imageAlt, height = "md", imageTint = false }: FullImageBandProps) {
  return (
    <section className={cn("relative w-full overflow-hidden", HEIGHT_STYLES[height])}>
      <Parallax strength={0.12} className="absolute inset-0">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="100vw" />
        {imageTint && <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" />}
      </Parallax>
    </section>
  );
}
