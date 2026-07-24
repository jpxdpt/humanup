"use client";

import { type ReactNode, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { animateEnter, scaleIn, spring } from "@/lib/animations";

interface AppleCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "interactive" | "glass";
  animate?: boolean;
}

export function AppleCard({ children, className, variant = "default", animate = true }: AppleCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animate && ref.current) {
      animateEnter(ref.current, scaleIn, spring.gentle);
    }
  }, [animate]);

  const variants = {
    default: "bg-surface-container-lowest border border-outline-variant shadow-sm",
    elevated: "bg-surface-container-lowest border border-outline-variant shadow-md shadow-black/5",
    interactive: "bg-surface-container-lowest border border-outline-variant shadow-sm hover:shadow-md hover:shadow-black/8 transition-all duration-200 cursor-pointer",
    glass: "bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5",
  };

  return (
    <div ref={ref} className={cn("rounded-2xl p-6", variants[variant], className)}>
      {children}
    </div>
  );
}
