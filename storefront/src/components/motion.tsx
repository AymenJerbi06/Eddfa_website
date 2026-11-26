"use client";

import { useEffect, useRef, useState } from "react";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The motion pass over the whole site (the user, 26 November 2026), the shared pieces. Each one answers something the
// visitor did, and none plays for visitors who ask for less motion.

/** Squash and stretch, follow through: a selection pill stretches a little along its way and settles when it lands. */
export const stretchKeyframes = (far: number) => [
  { scale: "1 1" },
  { scale: `${(1 + 0.05 * Math.min(Math.max(far, 1), 2)).toFixed(2)} 0.9`, offset: 0.4 },
  { scale: "0.98 1.03", offset: 0.75 },
  { scale: "1 1" },
];

/** The charcoal thumb of a segmented choice (Photos, the guide, the calculator, the quote): it glides to the new choice
 *  (CSS) and stretches on the way, then settles. */
export function SegmentedThumb({ index }: { index: number }) {
  const thumb = useRef<HTMLSpanElement>(null);
  const last = useRef(index);
  useEffect(() => {
    const node = thumb.current;
    const far = Math.abs(index - last.current);
    last.current = index;
    if (!node || !far || reducedMotion()) return;
    node.animate(stretchKeyframes(far), { duration: 480, easing: "ease-out" });
  }, [index]);
  return <span ref={thumb} className="segmented-thumb" aria-hidden="true" />;
}

/** Exaggerated feedback: a short « no » shake of the part that needs the visitor's attention. */
export function shake(element: Element | null | undefined) {
  if (!element || reducedMotion()) return;
  element.animate([
    { translate: "0 0" }, { translate: "-7px 0", offset: 0.15 }, { translate: "6px 0", offset: 0.35 },
    { translate: "-4px 0", offset: 0.55 }, { translate: "2px 0", offset: 0.75 }, { translate: "0 0" },
  ], { duration: 420, easing: "ease-out" });
}

/** The visit's own memory (frequency of use): small choices kept for the visit only, in this browser tab. */
export function remember<T>(key: string, fallback: T): T {
  try {
    const saved = window.sessionStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved) as T;
  } catch { return fallback; }
}
export function keep(key: string, value: unknown) {
  try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: nothing is kept */ }
}

/** The models seen during the visit, most recent first (the quote page opens their ranges). */
export const seenKey = "eddfa-seen";
export function seenModels(): string[] {
  const list = remember<unknown>(seenKey, []);
  return Array.isArray(list) ? list.filter((id): id is string => typeof id === "string") : [];
}
export function markSeen(productId: string) {
  keep(seenKey, [productId, ...seenModels().filter(id => id !== productId)].slice(0, 8));
}

/** Glides a displayed number toward its new value (the sizing result), instead of jumping. */
export function useTweenedNumber(target: number, duration = 650) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    if (reducedMotion()) { current.current = target; setValue(target); return; }
    const origin = current.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      current.current = origin + (target - origin) * easeOut(progress);
      setValue(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

/** Counts a key figure up the first time it scrolls into view ("100 %", "5"); words stay as they are. */
export function CountUp({ value }: { value: string }) {
  const node = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : null;
  useEffect(() => {
    const element = node.current;
    if (target === null || !element || reducedMotion() || element.getBoundingClientRect().top < window.innerHeight) return;
    setShown(0);
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 1300);
        setShown(progress < 1 ? Math.round(target * easeOut(progress)) : null);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target]);
  return <span ref={node}>{match && shown !== null ? `${shown}${match[2]}` : value}</span>;
}
