"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealDirection = "up" | "left" | "right" | "none";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  distance?: number;
}

const HIDDEN_TRANSFORM: Record<RevealDirection, (distance: number) => string> = {
  up: (d) => `translate3d(0, ${d}px, 0)`,
  left: (d) => `translate3d(-${d}px, 0, 0)`,
  right: (d) => `translate3d(${d}px, 0, 0)`,
  none: () => "translate3d(0, 0, 0) scale(0.96)",
};

export function Reveal({ children, className, delay = 0, direction = "up", distance = 48 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = reducedMotion ? setTimeout(() => setVisible(true), 0) : null;
    if (reducedMotion) return () => clearTimeout(timer!);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[1000ms] ease-out",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
        transform: visible ? "translate3d(0, 0, 0) scale(1)" : HIDDEN_TRANSFORM[direction](distance),
      }}
    >
      {children}
    </div>
  );
}
