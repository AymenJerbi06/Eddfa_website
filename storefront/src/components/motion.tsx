"use client";

import { useEffect, useRef, useState } from "react";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
