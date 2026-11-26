"use client";

import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { messages, type Locale } from "@/lib/content";
import { Exigences, principleFacts } from "./showcase";
import { RadiatorMark } from "./radiator-mark";
import { drawFrames, frameSrc, loadFrames, sequences, useReducedMotion } from "./film";

// « Nos exigences » as a scroll film. The screen holds while the visitor scrolls, and a Higgsfield film made from
// EDDFA's EDEN 80 scenes moves with them: from the chrome valve and the aluminium tubes back to the whole sunlit
// bathroom. One requirement per third of the film, each with the fact behind it, and EDDFA's radiator warming one pair
// of bars per requirement. Nothing moves unless the visitor scrolls (or picks a requirement under the meter); reduced
// motion gets the still version.
const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function ScrollStory({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion();
  const [chapter, setChapter] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (still) return;
    const section = root.current, element = canvas.current;
    const context = element?.getContext("2d");
    if (!section || !element || !context) return;
    let images: HTMLImageElement[] = [];
    let raf = 0;
    let small: boolean | null = null;

    const draw = () => {
      raf = 0;
      const box = section.getBoundingClientRect();
      const progress = clamp(-box.top / Math.max(1, box.height - window.innerHeight));
      setChapter(Math.min(2, Math.floor(progress * 3)));
      if (images.length && drawFrames(context, images, progress * (images.length - 1))) setReady(true);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(draw); };
    // Phones get the film cut upright around the radiator; computers get the wide frames.
    const load = () => {
      const nowSmall = element.clientHeight > element.clientWidth;
      if (nowSmall === small) return;
      small = nowSmall;
      images = loadFrames("story", nowSmall, schedule);
    };
    let near = false;
    const size = () => {
      const scale = Math.min(2, window.devicePixelRatio || 1);
      element.width = Math.round(element.clientWidth * scale);
      element.height = Math.round(element.clientHeight * scale);
      if (near) load();
      schedule();
    };
    const watch = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      watch.disconnect();
      near = true;
      load();
    }, { rootMargin: "150% 0px" });
    watch.observe(section);
    const resize = new ResizeObserver(size);
    resize.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    size();
    return () => { watch.disconnect(); resize.disconnect(); window.removeEventListener("scroll", schedule); cancelAnimationFrame(raf); };
  }, [still]);

  // The three numbers under the meter take the visitor to each requirement: the page scrolls to the middle of its third
  // of the film, and the film follows as it always does.
  const go = (index: number) => {
    const section = root.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const run = Math.max(1, section.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + run * ((index + 0.5) / 3), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  if (still) return <Exigences locale={locale} />;
  return <section id="exigences" ref={root} className="story band">
    <div className="story-stage">
      <picture className="story-poster" aria-hidden="true"><source media="(max-width: 921px)" srcSet={frameSrc("story", 0, true)} /><img src={frameSrc("story", 0, false)} alt="" loading="lazy" decoding="async" /></picture>
      <canvas ref={canvas} className={`story-canvas${ready ? " ready" : ""}`} aria-hidden="true" data-frames={sequences.story} />
      <div className="story-scrim" aria-hidden="true" />
      <div className="container story-copy">
        <h2 className="title">{t.commitment}</h2>
        <ol className="story-chapters">{t.principles.map((principle, index) => {
          const fact = t.facts[principleFacts[index]];
          return <li key={principle.title} className={chapter === index ? "active" : undefined}>
            <span className="principle-fact"><bdi>{fact.value}</bdi></span>
            <h3>{principle.title}</h3><p>{principle.text}</p>
            {index === 1 && <a className="text-link light" href="/eddfa/certificat-veritas-en442.pdf" target="_blank" rel="noopener noreferrer" tabIndex={chapter === 1 ? 0 : -1}><FileText size={15} /><span>{t.certificateLink}</span></a>}
          </li>;
        })}</ol>
        <div className="story-meter"><RadiatorMark warm={(chapter + 1) * 2} />
          <nav className="story-steps" aria-label={t.commitment}>{t.principles.map((principle, index) => <button key={principle.title} type="button" className={chapter === index ? "active" : undefined} aria-current={chapter === index ? "step" : undefined} aria-label={`${index + 1}. ${principle.title}`} onClick={() => go(index)}><span aria-hidden="true">{index + 1}</span></button>)}</nav>
        </div>
      </div>
    </div>
  </section>;
}
