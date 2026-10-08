"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Expand, Pause, Play, X } from "lucide-react";
import { inspirations, messages, type Inspiration, type Locale } from "@/lib/content";
import { useCatalog } from "./catalog-context";
import { Photo } from "./media";

function useRotatingCarousel(locale: Locale, modalOpen = false) {
  const [autoplay] = useState(() => Autoplay({ delay: 3000, playOnInit: false, stopOnMouseEnter: false, stopOnFocusIn: true, stopOnInteraction: true, rootNode: root => root.parentElement }));
  const [paused, setPaused] = useState(false);
  const [viewport, api] = useEmblaCarousel({ loop: true, align: "start", direction: locale === "ar" ? "rtl" : "ltr" }, [autoplay]);
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
    <div className="lightbox-controls"><button type="button" className="icon-button" aria-label={t.previous} onClick={() => step(-1)}><ChevronLeft size={24} className="directional-icon" /></button><span>{index !== null && `${index + 1} / ${images.length} · ${images[index].title}`}</span><button type="button" className="icon-button" aria-label={t.next} onClick={() => step(1)}><ChevronRight size={24} className="directional-icon" /></button></div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}

export function ProjectCarousel({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [selected, setSelected] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const { viewport, api, paused, togglePause } = useRotatingCarousel(locale, galleryIndex !== null);
  const update = useCallback(() => setSelected(api?.selectedScrollSnap() ?? 0), [api]);
  useEffect(() => { if (!api) return; update(); api.on("select", update).on("reInit", update); return () => { api.off("select", update).off("reInit", update); }; }, [api, update]);
  return <>
    <div className="project-carousel" aria-roledescription="carousel" aria-label={t.projects} data-current-slide={selected + 1}>
      <div className="carousel-viewport" ref={viewport}><div className="carousel-track">{inspirations.map((p, index) => <div className="project-slide" key={p.id}><button type="button" className="project-tile" onClick={() => setGalleryIndex(index)} aria-label={`${t.zoom} : ${p.title[locale]}`}><Photo src={p.image} alt={p.title[locale]} /><span className="project-caption">{p.title[locale]}<Expand size={20} /></span></button></div>)}</div></div>
      <button className="carousel-arrow prev icon-button" type="button" aria-label={t.previous} onClick={() => api?.scrollPrev()}><ArrowLeft size={24} className="directional-icon" /></button>
      <button className="carousel-arrow next icon-button" type="button" aria-label={t.next} onClick={() => api?.scrollNext()}><ArrowRight size={24} className="directional-icon" /></button>
      <RotationButton locale={locale} paused={paused} onClick={togglePause} />
    </div>
    <GalleryDialog locale={locale} images={inspirations.map(p => ({ image: p.image, title: p.title[locale] }))} index={galleryIndex} onIndexChange={setGalleryIndex} />
  </>;
}

export function UniverseCarousel({ locale }: { locale: Locale }) {
  const products = useCatalog();
  const t = messages[locale];
  const { viewport, api, paused, togglePause } = useRotatingCarousel(locale);
  const [selected, setSelected] = useState(0);
  useEffect(() => { if (!api) return; const update = () => setSelected(api.selectedScrollSnap()); update(); api.on("select", update).on("reInit", update); return () => { api.off("select", update).off("reInit", update); }; }, [api]);
  return <div className="universe-wrapper" aria-roledescription="carousel" aria-label={t.collections}><div className="carousel-viewport universe-carousel" ref={viewport}><div className="carousel-track">{products.map((product, index) => <div className="universe-slide" key={product.id}><Link href={`/${locale}/produits/${product.handle}`} className="universe-word"><bdi>{product.title[locale]}</bdi><span>{String(index + 1).padStart(2, "0")}</span></Link></div>)}</div></div><div className="carousel-dots">{products.map((product, index) => <button key={product.id} className={selected === index ? "selected" : ""} aria-label={`${t.selection} ${index + 1}`} aria-pressed={selected === index} onClick={() => api?.scrollTo(index)} />)}</div><RotationButton locale={locale} paused={paused} onClick={togglePause} /></div>;
}

export function GalleryGrid({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [filter, setFilter] = useState("all");
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const shown: Inspiration[] = inspirations.filter(p => filter === "all" || p.category === filter);
  return <><div className="filter-bar" role="group" aria-label={t.selection}>{[["all", t.all], ["noir", t.black], ["blanc", t.white]].map(([key, label]) => <button key={key} type="button" className={filter === key ? "active" : ""} aria-pressed={filter === key} onClick={() => { setGalleryIndex(null); setFilter(key); }}>{label}</button>)}</div><div className="gallery-grid">{shown.map((p, index) => <button type="button" className="project-tile" key={p.id} aria-label={`${t.zoom} : ${p.title[locale]}`} onClick={() => setGalleryIndex(index)}><Photo src={p.image} alt={p.title[locale]} /><span className="project-caption">{p.title[locale]}<Expand size={20} /></span></button>)}</div><GalleryDialog locale={locale} images={shown.map(p => ({ image: p.image, title: p.title[locale] }))} index={galleryIndex} onIndexChange={setGalleryIndex} /></>;
}
