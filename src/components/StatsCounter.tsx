"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableImage } from "@/components/cms/EditableImage";

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
    <div ref={ref}>
      <div className="mb-1">
        <span className="font-heading text-[46px] font-bold text-white">{count}</span>
        <span className="font-heading text-[46px] font-bold text-white">{suffix}</span>
      </div>
      <p className="font-sans text-base font-medium leading-[26.4px] text-white/85 whitespace-pre-line">
        {label}
      </p>
    </div>
  );
}

export function StatsCounter() {
  const home = useSiteContentSection("home");

  const stats = Array.from({ length: 6 }, (_, i) => ({
    value: Number(home[`stats.${i}.value`] ?? FALLBACKS[`home.stats.${i}.value`]),
    suffix: home[`stats.${i}.suffix`] ?? FALLBACKS[`home.stats.${i}.suffix`],
    label: home[`stats.${i}.label`] ?? FALLBACKS[`home.stats.${i}.label`],
  }));

  const statsSource = home["statsSource"] ?? FALLBACKS["home.statsSource"];

  return (
    <section className="relative w-full bg-on-surface">
      <div className="absolute inset-0">
        <EditableImage
          contentKey="home.stats.backgroundImage"
          fallback={FALLBACKS["home.stats.backgroundImage"]}
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-on-surface/70" />
      </div>
      <div className="relative container-site py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
          {stats.map((stat, i) => (
            <CounterItem key={i} {...stat} />
          ))}
        </div>
        <p className="font-sans text-sm font-medium text-white/70 mt-10">{statsSource}</p>
      </div>
    </section>
  );
}
