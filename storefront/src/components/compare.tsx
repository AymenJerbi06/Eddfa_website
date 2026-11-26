"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { asset, messages, type Locale } from "@/lib/content";
import { Photo } from "./media";
import { Lines } from "./lines";
import { Emblem } from "./emblem";

// « Le même mur. Avec un EDEN 80. »: the same bathroom without a towel radiator and with the black EDEN 80, one over
// the other, and a handle the visitor drags (or moves with the arrow keys) to compare. When it first comes into view,
// the handle shows once how it moves; visitors who ask for reduced motion get it still.
const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function BeforeAfter({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const rtl = locale === "ar";
  const frame = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [hint, setHint] = useState(false);
  const touched = useRef(false);
  const dragging = useRef(false);

  // One gentle sweep the first time the comparison is seen, so it is clear that it moves.
  useEffect(() => {
    const element = frame.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0.55) || touched.current) return;
      observer.disconnect();
      setHint(true);
    }, { threshold: [0, 0.6] });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fromPointer = (clientX: number) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box) return;
    const share = ((clientX - box.left) / box.width) * 100;
    setPosition(clamp(rtl ? 100 - share : share));
  };
  const stop = () => { touched.current = true; setHint(false); };

  return <section className="section plate compare-section"><Emblem side="start" edge="bottom" /><div className="container">
    <div className="section-intro"><h2 className="title"><Lines text={t.sameWallTitle} /></h2><p>{t.sameWallText}</p></div>
    <div ref={frame} className={`compare${hint ? " hinting" : ""}`} style={{ "--position": `${position}%` } as React.CSSProperties}
      onAnimationEnd={() => setHint(false)}
      onPointerDown={event => {
        // A mouse can grab anywhere; a finger has to take the handle, so the page still scrolls under it.
        const handle = (event.target as HTMLElement).closest(".compare-handle");
        if (event.pointerType !== "mouse" && !handle) return;
        stop();
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        fromPointer(event.clientX);
      }}
      onPointerMove={event => { if (dragging.current) fromPointer(event.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}>
      <div className="compare-after"><Photo src={asset("scene-eden-80-after")} alt={t.afterAlt} sizes="(max-width: 921px) 100vw, 1200px" /></div>
      <div className="compare-before"><Photo src={asset("scene-eden-80-before")} alt={t.beforeAlt} sizes="(max-width: 921px) 100vw, 1200px" /></div>
      <span className="compare-label before" aria-hidden="true">{t.beforeLabel}</span>
      <span className="compare-label after" aria-hidden="true"><bdi>{t.afterLabel}</bdi></span>
      <span className="compare-line" aria-hidden="true"><span className="compare-handle"><ChevronLeft size={18} /><ChevronRight size={18} /></span></span>
      <input className="compare-range" type="range" min={0} max={100} step={1} value={Math.round(position)} aria-label={t.sameWallSlider} aria-valuetext={`${Math.round(position)} %`}
        onChange={event => { stop(); setPosition(Number(event.target.value)); }} />
    </div>
  </div></section>;
}
