import { animate } from "motion";

export const spring = {
  gentle: { type: "spring", bounce: 0, duration: 0.4 } as const,
  snappy: { type: "spring", bounce: 0.2, duration: 0.35 } as const,
  bounce: { type: "spring", bounce: 0.4, duration: 0.45 } as const,
};

export const fadeIn = { opacity: [0, 1] };
export const slideUp = { opacity: [0, 1], y: [12, 0] };
export const scaleIn = { opacity: [0, 1], scale: [0.96, 1] };

export function animateEnter(
  el: HTMLElement,
  animation: Record<string, number[]> = slideUp,
  options = spring.gentle,
) {
  return animate(el, animation, options);
}

export function animateExit(el: HTMLElement, animation = { opacity: [1, 0] }, options = spring.gentle) {
  return animate(el, animation, options);
}

export function tapScale(el: HTMLElement) {
  animate(el, { scale: 0.97 }, { duration: 0.1 });
  return () => animate(el, { scale: 1 }, spring.snappy);
}
