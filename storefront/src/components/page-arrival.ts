"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export const pageArrivalDuration = 720;

export function pageArrivalTop(bannerBottom: number, viewportHeight: number) {
  const bannerPreview = Math.min(104, Math.max(56, Math.round(viewportHeight * 0.12)));
  return Math.max(0, bannerBottom - bannerPreview);
}

export function pageArrivalProgress(progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function usePageArrival(pathname: string, menuOpen: boolean) {
  const [request, setRequest] = useState<{ pathname: string } | null>(null);
  const cancel = useCallback(() => setRequest(null), []);
  const reveal = useCallback((destination: string) => setRequest({ pathname: destination }), []);

  useEffect(() => {
    window.addEventListener("popstate", cancel);
    return () => window.removeEventListener("popstate", cancel);
  }, [cancel]);

  useLayoutEffect(() => {
    if (!request) return;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      cancel();
    };
    const events = ["wheel", "touchstart", "pointerdown", "keydown", "resize"] as const;
    for (const event of events) window.addEventListener(event, stop, { passive: true });
    const cleanup = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      for (const event of events) window.removeEventListener(event, stop);
    };
    if (pathname !== request.pathname || menuOpen) return cleanup;
    const banner = document.querySelector<HTMLElement>(".about-banner");
    if (!banner) return cleanup;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const destination = pageArrivalTop(banner.getBoundingClientRect().bottom + window.scrollY, window.innerHeight);
    if (motion.matches) {
      window.scrollTo({ top: destination, behavior: "instant" });
      cancel();
      return cleanup;
    }

    // Reset before paint, then leave the new banner visible briefly before revealing content.
    window.scrollTo({ top: 0, behavior: "instant" });
    timer = setTimeout(() => {
      let started: number | undefined;
      const tick = (now: number) => {
        started ??= now;
        const progress = motion.matches ? 1 : Math.min(1, (now - started) / pageArrivalDuration);
        window.scrollTo({ top: destination * pageArrivalProgress(progress), behavior: "instant" });
        if (progress < 1) frame = requestAnimationFrame(tick);
        else cancel();
      };
      frame = requestAnimationFrame(tick);
    }, 140);

    return cleanup;
  }, [request, pathname, menuOpen, cancel]);

  return { reveal, cancel };
}
