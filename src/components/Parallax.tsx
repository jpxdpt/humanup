"use client";

import { useEffect, useRef } from "react";

interface ParallaxProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function Parallax({ children, strength = 0.15, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frameId: number;

    function update() {
      if (!el) return;
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const offset = rect.top * strength;
      el.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
    }

    function onScroll() {
      frameId = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frameId);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
