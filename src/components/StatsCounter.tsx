"use client";

import { useEffect, useRef, useState } from "react";

const COUNTERS = [
  { value: 53, suffix: "%", label: "dos trabalhadores faltam ao trabalho por <strong>burnout</strong>" },
  { value: 79, suffix: "%", label: "dos colaboradores apresentam <strong>falta de envolvimento</strong> na empresa" },
  { value: 54, suffix: "%", label: "dos trabalhadores <strong>não se sentem valorizados </strong>pela organização" },
  { value: 47, suffix: "%", label: "do tempo os trabalhadores estão a<strong> procrastinar</strong>" },
  { value: 1.4, suffix: "%", label: "<strong>do volume de negócios</strong> das empresas portuguesas <strong>perde-se </strong>devido à quebra de produtividade" },
  { value: 12.4, suffix: " dias", label: "de <strong>absentismo</strong> proveniente do stresse e problemas de saúde psicológica" },
];

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
  return (
    <section className="w-full bg-white py-8">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <CounterItem {...COUNTERS[0]} />
            <CounterItem {...COUNTERS[1]} />
          </div>
          <div>
            <CounterItem {...COUNTERS[2]} />
            <CounterItem {...COUNTERS[3]} />
          </div>
          <div>
            <CounterItem {...COUNTERS[4]} />
            <CounterItem {...COUNTERS[5]} />
          </div>
        </div>
        <p className="font-sans text-sm font-medium text-primary mt-4">
          Relatórios Gallup, Deloitte, McKinsey, OCDE
        </p>
      </div>
    </section>
  );
}
