"use client";

import { useEffect, useRef, useState } from "react";
import { useContent } from "@/lib/content-store";

function useCountUp(target: number, duration: number, isVisible: boolean) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let currentVal = 0;

    function animate(time: number) {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      currentVal = target * eased;
      setCurrent(currentVal);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, isVisible]);

  if (target % 1 === 0) {
    return Math.round(current);
  }
  return current.toFixed(1);
}

function CounterItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(value, 1.5, isVisible);

  return (
    <div ref={ref} className="mb-6">
      <div className="wp-block-uagb-counter--number mb-1">
        <span className="font-sans text-[46px] font-bold text-foreground">{count}</span>
        <span className="font-sans text-[46px] font-bold text-foreground">{suffix}</span>
      </div>
      <p
        className="font-sans text-base font-medium leading-[26.4px] text-foreground"
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </div>
  );
}

export function StatsCounter() {
  const { content } = useContent();
  const { stats, statsSource } = content.home;
  const columns = [stats.slice(0, 2), stats.slice(2, 4), stats.slice(4, 6)];
  return (
    <section className="w-full bg-white py-8">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {columns.map((col, i) => (
            <div key={i}>
              {col.map((stat, j) => (
                <CounterItem key={j} {...stat} />
              ))}
            </div>
          ))}
        </div>
        <p className="font-sans text-sm font-medium text-primary mt-4">
          {statsSource}
        </p>
      </div>
    </section>
  );
}
