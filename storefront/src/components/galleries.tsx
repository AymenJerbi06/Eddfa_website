"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { flushSync } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Expand, Pause, Play, X } from "lucide-react";
import { inspirations, messages, type Inspiration, type Locale } from "@/lib/content";
import { Photo } from "./media";

function useRotatingCarousel(locale: Locale, modalOpen = false, align: "start" | "center" = "start") {
  const [autoplay] = useState(() => Autoplay({ delay: 3000, playOnInit: false, stopOnMouseEnter: false, stopOnFocusIn: true, stopOnInteraction: true, rootNode: root => root.parentElement }));
  const [paused, setPaused] = useState(false);
  const [viewport, api] = useEmblaCarousel({ loop: true, align, direction: locale === "ar" ? "rtl" : "ltr" }, [autoplay]);
  useEffect(() => {
    if (!api) return;
    const root = api.rootNode().parentElement ?? api.rootNode();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      // The play control must be able to resume rotation without losing focus.
      const contentFocused = root.contains(document.activeElement) && document.activeElement !== root.querySelector(".carousel-pause");
      if (visible && !motion.matches && !paused && !modalOpen && !contentFocused) {
        if (!autoplay.isPlaying()) autoplay.play();
      } else autoplay.stop();
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.15 });
    const resume = () => queueMicrotask(sync);
    observer.observe(root);
    api.on("reInit", sync);
    motion.addEventListener("change", sync);
    root.addEventListener("focusin", sync);
    root.addEventListener("focusout", resume);
    root.addEventListener("pointerup", resume);
    return () => { observer.disconnect(); api.off("reInit", sync); motion.removeEventListener("change", sync); root.removeEventListener("focusin", sync); root.removeEventListener("focusout", resume); root.removeEventListener("pointerup", resume); autoplay.stop(); };
  }, [api, autoplay, paused, modalOpen]);
  return { viewport, api, paused, togglePause: () => setPaused(value => !value) };
}

function RotationButton({ locale, paused, onClick }: { locale: Locale; paused: boolean; onClick: () => void }) {
  const label = locale === "ar" ? (paused ? "تشغيل العرض" : "إيقاف العرض مؤقتا") : (paused ? "Reprendre le défilement" : "Mettre le défilement en pause");
  return <button type="button" className="carousel-pause icon-button" aria-label={label} title={label} aria-pressed={paused} onClick={onClick}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>;
}

export function GalleryDialog({ locale, images, index, onIndexChange }: { locale: Locale; images: { image: string; title: string }[]; index: number | null; onIndexChange: (index: number | null) => void }) {
  const t = messages[locale];
  const step = (delta: number) => { if (index !== null) onIndexChange((index + delta + images.length) % images.length); };
  return <Dialog.Root open={index !== null} onOpenChange={open => { if (!open) onIndexChange(null); }}><Dialog.Portal><Dialog.Overlay className="gallery-overlay" /><Dialog.Content className="gallery-dialog" dir={locale === "ar" ? "rtl" : "ltr"} onKeyDown={e => { if (e.key === "ArrowRight") { e.preventDefault(); step(locale === "ar" ? -1 : 1); } if (e.key === "ArrowLeft") { e.preventDefault(); step(locale === "ar" ? 1 : -1); } }}>
    <Dialog.Title className="sr-only">{index !== null ? images[index].title : t.zoom}</Dialog.Title><Dialog.Description className="sr-only">{t.zoom}</Dialog.Description>
    <Dialog.Close asChild><button type="button" className="gallery-close icon-button" aria-label={t.close}><X size={25} /></button></Dialog.Close>
    <div className="lightbox-photo">{index !== null && <Photo src={images[index].image} alt={images[index].title} sizes="90vw" />}</div>
    <div className="lightbox-controls"><button type="button" className="icon-button" aria-label={t.previous} onClick={() => step(-1)}><ChevronLeft size={24} className="directional-icon" /></button><span>{index !== null && <><bdi dir="ltr">{`${index + 1} / ${images.length}`}</bdi> · <bdi>{images[index].title}</bdi></>}</span><button type="button" className="icon-button" aria-label={t.next} onClick={() => step(1)}><ChevronRight size={24} className="directional-icon" /></button></div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}

// The home strip keeps to the portrait photos; the landscape scenes have their place on the Photos page.
const strip = inspirations.filter(photo => !photo.wide);

export function ProjectCarousel({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [selected, setSelected] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const { viewport, api, paused, togglePause } = useRotatingCarousel(locale, galleryIndex !== null, "center");
  const update = useCallback(() => setSelected(api?.selectedScrollSnap() ?? 0), [api]);
  useEffect(() => { if (!api) return; update(); api.on("select", update).on("reInit", update); return () => { api.off("select", update).off("reInit", update); }; }, [api, update]);
  return <>
    <div className="project-carousel filmstrip" aria-roledescription="carousel" aria-label={t.projects} data-current-slide={selected + 1}>
      <div className="carousel-viewport" ref={viewport}><div className="carousel-track">{strip.map((p, index) => <div className={`project-slide${selected === index ? " is-selected" : ""}`} key={p.id}><button type="button" className="project-tile" onClick={() => { if (selected === index) setGalleryIndex(index); else api?.scrollTo(index); }} aria-label={`${t.zoom} : ${p.title[locale]}`}><Photo src={p.image} alt={p.title[locale]} /><span className="project-caption">{p.title[locale]}<Expand size={20} /></span></button></div>)}</div></div>
      <button className="carousel-arrow prev icon-button" type="button" aria-label={t.previous} onClick={() => api?.scrollPrev()}><ArrowLeft size={24} className="directional-icon" /></button>
      <button className="carousel-arrow next icon-button" type="button" aria-label={t.next} onClick={() => api?.scrollNext()}><ArrowRight size={24} className="directional-icon" /></button>
      <RotationButton locale={locale} paused={paused} onClick={togglePause} />
    </div>
    <div className="carousel-meter" aria-hidden="true" style={{ "--progress": (selected + 1) / strip.length } as React.CSSProperties}><bdi dir="ltr">{`${selected + 1} / ${strip.length}`}</bdi><span className="meter-line" /></div>
    <GalleryDialog locale={locale} images={strip.map(p => ({ image: p.image, title: p.title[locale] }))} index={galleryIndex} onIndexChange={setGalleryIndex} />
  </>;
}

// The Photos page: a mosaic. The first photo leads at double size and the landscape photos take two columns. Two
// choices (which range, which finish) re-flow the tiles, with a view transition where the browser has one.
type PhotoView = "all" | Inspiration["range"];
type Finish = Inspiration["category"];
export function GalleryGrid({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const id = useId();
  const [view, setView] = useState<PhotoView>("all");
  const [finish, setFinish] = useState<Finish | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const shown = inspirations.filter(photo => (view === "all" || photo.range === view) && (!finish || photo.category === finish));
  const lead = shown.findIndex(photo => !photo.wide);
  const change = (apply: () => void) => {
    setGalleryIndex(null);
    const page = document as Document & { startViewTransition?: (update: () => void) => unknown };
    if (page.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) page.startViewTransition(() => flushSync(apply));
    else apply();
  };
  const views: [PhotoView, string][] = [["all", t.all], ["eden", "EDEN"], ["eclat", "ECLAT"]];
  const finishes: [Finish, string][] = [["noir", t.black], ["blanc", t.white]];
  return <>
    <div className="mosaic-bar">
      <fieldset className="segmented mosaic-views" style={{ "--index": views.findIndex(([key]) => key === view), "--count": views.length } as React.CSSProperties}>
        <legend className="sr-only">{t.rangesNav}</legend>
        <div className="segmented-track"><span className="segmented-thumb" aria-hidden="true" />{views.map(([key, label]) => <label key={key} className={view === key ? "active" : undefined}><input type="radio" name={`${id}-view`} value={key} checked={view === key} onChange={() => change(() => setView(key))} /><span>{label}</span></label>)}</div>
      </fieldset>
      <div className="mosaic-finish" role="group" aria-label={t.finish}>{finishes.map(([key, label]) => <button key={key} type="button" className={`finish-dot ${key}`} aria-pressed={finish === key} onClick={() => change(() => setFinish(finish === key ? null : key))}><span aria-hidden="true" />{label}</button>)}</div>
      <bdi className="mosaic-count" dir="ltr" aria-hidden="true">{`${shown.length} / ${inspirations.length}`}</bdi>
      <p className="sr-only" aria-live="polite">{`${shown.length} ${t.nav[3]}`}</p>
    </div>
    <div className="mosaic-wrap"><div className="gallery-grid mosaic">{shown.map((p, index) => <button type="button" className={`project-tile${p.wide ? " wide" : ""}${index === lead ? " lead" : ""}`} style={{ viewTransitionName: `tile-${p.id}` } as React.CSSProperties} key={p.id} aria-label={`${t.zoom} : ${p.title[locale]}`} onClick={() => setGalleryIndex(index)}><Photo src={p.image} alt={p.title[locale]} sizes={index === lead || p.wide ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"} /><span className="project-caption">{p.title[locale]}<Expand size={20} /></span></button>)}</div></div>
    <GalleryDialog locale={locale} images={shown.map(p => ({ image: p.image, title: p.title[locale] }))} index={galleryIndex} onIndexChange={setGalleryIndex} />
  </>;
}
