"use client";

import { useEffect, useRef, useState } from "react";

// EDDFA's films, made with Higgsfield from EDDFA's own scenes (see ASSET-PROVENANCE.md, "Films").
// - Loops (EDEN's room, ECLAT's room, the aluminium tubes) play quietly while they are on screen and stop off screen.
// - Scroll films (« Nos exigences » and the closer) are frame sequences that move only when the visitor scrolls. Since
//   26 November 2026 they have twice the frames (one made between each pair, see ASSET-PROVENANCE.md), the frames just
//   ahead are decoded before they are needed, and the film glides to where the scroll is at the screen's own rate
//   instead of jumping with each scroll event (the user found the zoom laggy).
// - The light aluminium film (the dark tubes lifted to the marble's white, the same light gliding along them) sits
//   behind a few of the marble sections (the user, 26 November 2026).
// Visitors who ask for reduced motion see still pictures, and nothing plays before it is near the screen.
export type LoopName = "eden" | "eclat" | "aluminium" | "aluminium-light";
export type SequenceName = "story" | "closer";
export const sequences: Record<SequenceName, number> = { story: 143, closer: 95 };
export const loopPoster = (name: LoopName) => `/eddfa/film/${name}.webp`;
export const frameSrc = (name: SequenceName, index: number, small: boolean) => `/eddfa/film/${name}/${small ? "m" : "d"}/${String(index + 1).padStart(3, "0")}.webp`;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function useReducedMotion() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return still;
}

export function FilmLoop({ name, wide = false, className = "" }: { name: LoopName; wide?: boolean; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (visible && !motion.matches && !document.hidden) element.play().catch(() => { /* the poster stays */ });
      else element.pause();
    };
    const observer = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); }, { threshold: 0.12 });
    observer.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); motion.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); element.pause(); };
  }, []);
  return <video ref={video} className={`film-loop film-${name}${className ? ` ${className}` : ""}`} muted loop playsInline preload="none" poster={loopPoster(name)} aria-hidden="true" tabIndex={-1}>
    {wide && <source src={`/eddfa/film/${name}-1080.mp4`} type="video/mp4" media="(min-width: 922px)" />}
    <source src={`/eddfa/film/${name}-720.mp4`} type="video/mp4" />
  </video>;
}

// Draws one frame of a sequence to cover the canvas, blending into the next one so the film stays smooth between frames.
export function drawFrames(context: CanvasRenderingContext2D, images: HTMLImageElement[], position: number, focus: [number, number] = [0.5, 0.5]) {
  const { width, height } = context.canvas;
  const ready = (image?: HTMLImageElement) => Boolean(image?.complete && image.naturalWidth);
  const base = Math.floor(position);
  let shown = images[base];
  for (let step = 1; !ready(shown) && step < images.length; step++) shown = images[base - step] ?? images[base + step];
  if (!ready(shown)) return false;
  const cover = (image: HTMLImageElement, alpha: number) => {
    const ratio = image.naturalWidth / image.naturalHeight;
    let w = width, h = w / ratio;
    if (h < height) { h = height; w = h * ratio; }
    context.globalAlpha = alpha;
    context.drawImage(image, Math.min(0, Math.max(width - w, width / 2 - focus[0] * w)), Math.min(0, Math.max(height - h, height / 2 - focus[1] * h)), w, h);
  };
  cover(shown!, 1);
  const next = images[base + 1], blend = position - base;
  if (shown === images[base] && blend > 0.02 && ready(next)) cover(next, blend);
  context.globalAlpha = 1;
  return true;
}

// Asks the browser to decode the frames just ahead of the film (in the direction it is going) off the main thread, so
// drawing them during the scroll costs nothing. A frame is asked again after a few seconds, in case it was let go.
const warmed = new WeakMap<HTMLImageElement, number>();
export function warmFrames(images: HTMLImageElement[], position: number, direction: number) {
  const now = performance.now(), base = Math.round(position);
  for (let offset = -2; offset <= 10; offset++) {
    const image = images[base + (direction < 0 ? -offset : offset)];
    if (!image?.complete || !image.naturalWidth) continue;
    const at = warmed.get(image);
    if (at && now - at < 4000) continue;
    warmed.set(image, now);
    image.decode().catch(() => warmed.delete(image));
  }
}

// Moves a film towards where the scroll is, a share of the way at each frame of the screen (60 or 120 a second), so
// it glides instead of stepping with the scroll events; it stops as soon as it has arrived.
export function createGlide(render: (position: number, direction: number) => void) {
  let shown = -1, target = 0, raf = 0, last = 0;
  const step = (now: number) => {
    raf = 0;
    const elapsed = last ? Math.min(64, now - last) : 16;
    last = now;
    const from = shown;
    shown = shown < 0 ? target : shown + (target - shown) * (1 - Math.exp(-elapsed / 80));
    if (Math.abs(target - shown) < 0.01) shown = target;
    render(shown, Math.sign(shown - from));
    if (shown !== target) raf = requestAnimationFrame(step);
    else last = 0;
  };
  return {
    to(next: number) { target = next; if (!raf) raf = requestAnimationFrame(step); },
    redraw() { if (shown >= 0) render(shown, 0); },
    stop() { cancelAnimationFrame(raf); raf = 0; },
  };
}

// Fetches a sequence's frames: the first one, then every eighth, then the rest, so scrolling works from the start.
export function loadFrames(name: SequenceName, small: boolean, onLoad: () => void) {
  const count = sequences[name];
  const images: HTMLImageElement[] = new Array(count);
  const order = [0, ...Array.from({ length: count }, (_, index) => index).filter(index => index % 8 === 0 && index), ...Array.from({ length: count }, (_, index) => index).filter(index => index % 8)];
  for (const index of order) {
    const image = new Image();
    image.decoding = "async";
    image.addEventListener("load", onLoad);
    image.src = frameSrc(name, index, small);
    images[index] = image;
  }
  return images;
}

// A film that moves with the page: it runs from its first frame when it comes into view to its last when it reaches the
// middle of the screen. Used for the closer, where the bathroom of the first section warms up.
export function ScrubFilm({ name, alt }: { name: SequenceName; alt: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (still) return;
    const box = frame.current, element = canvas.current, context = element?.getContext("2d");
    if (!box || !element || !context) return;
    let images: HTMLImageElement[] = [];
    let raf = 0;
    const glide = createGlide((position, direction) => {
      if (drawFrames(context, images, position)) setReady(true);
      warmFrames(images, position, direction);
    });
    const aim = () => {
      raf = 0;
      const rect = box.getBoundingClientRect(), view = window.innerHeight;
      const progress = clamp((view - rect.top) / (view * 0.6 + rect.height * 0.5));
      if (images.length) glide.to(progress * (images.length - 1));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(aim); };
    const loaded = () => { glide.redraw(); schedule(); };
    const size = () => {
      const scale = Math.min(2, window.devicePixelRatio || 1);
      element.width = Math.round(element.clientWidth * scale);
      element.height = Math.round(element.clientHeight * scale);
      glide.redraw();
      schedule();
    };
    const near = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      near.disconnect();
      images = loadFrames(name, element.clientWidth * Math.min(2, window.devicePixelRatio || 1) <= 1000, loaded);
    }, { rootMargin: "120% 0px" });
    near.observe(box);
    const resize = new ResizeObserver(size);
    resize.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => { near.disconnect(); resize.disconnect(); window.removeEventListener("scroll", schedule); cancelAnimationFrame(raf); glide.stop(); };
  }, [name, still]);
  const last = sequences[name] - 1;
  return <div ref={frame} className="scrub-film">
    <picture><source media="(max-width: 921px)" srcSet={frameSrc(name, still ? last : 0, true)} /><img src={frameSrc(name, still ? last : 0, false)} alt={alt} loading="lazy" decoding="async" /></picture>
    {!still && <canvas ref={canvas} className={ready ? "ready" : undefined} aria-hidden="true" />}
  </div>;
}
