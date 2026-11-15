"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Calculator, ChevronLeft, ChevronRight, Expand, Factory, FileText, MessagesSquare, Phone, PlayCircle, Printer, ShieldCheck } from "lucide-react";
import { company, familyById, installationGuides, installationKind, messages, type CatalogProduct, type Locale } from "@/lib/content";
import { variantLabel } from "@/lib/products";
import { Photo } from "./media";
import { GalleryDialog } from "./galleries";
import { QuoteLink } from "./site-shell";
import { SpecTable } from "./spec-table";
import { useCatalog } from "./catalog-context";
import { RangeNav } from "./range-nav";
import { TechDrawing } from "./tech-drawing";

// The two figures a visitor compares first, read from the catalogue: heights, then heat (element power for ECLAT).
function quickFacts(product: CatalogProduct) {
  const span = (values: number[], unit: string) => {
    const list = values.filter(value => value > 0);
    if (!list.length) return null;
    const low = Math.min(...list), high = Math.max(...list);
    return low === high ? `${low} ${unit}` : `${low} – ${high} ${unit}`;
  };
  const heat = product.variants.map(variant => product.category === "eclat" ? variant.resistance ?? 0 : variant.thermalPower);
  return [span(product.variants.map(variant => variant.dimensions[0]), "mm"), span(heat, "W")].filter(Boolean).join(" · ");
}

export function CatalogCard({ locale, product, level = "h2", drawn = false }: { locale: Locale; product: CatalogProduct; level?: "h2" | "h3"; drawn?: boolean }) {
  const t = messages[locale];
  const Heading = level;
  const facts = product.category === "bundle" ? "" : quickFacts(product);
  const sized = drawn ? product.variants.find(variant => variant.dimensions[0] > 0) : undefined;
  // Where the article has a second portrait photo, pointing at the card shows it.
  const second = sized ? undefined : product.gallery.find(image => image !== product.image && !image.includes("-wide"));
  return <article className="catalog-item"><Link href={`/${locale}/produits/${product.handle}`} className={`catalog-photo${sized ? " drawn" : ""}`}>{sized ? <TechDrawing locale={locale} product={product} variant={sized} kind={installationKind(product)} /> : <Photo src={product.image} alt={product.title[locale]} />}{second && <Photo src={second} alt="" className="card-second" />}{facts && <span className="catalog-quick" dir="ltr">{facts}</span>}</Link><div className="catalog-item-caption"><div><span className="eyebrow">{t[product.category]}</span><Heading><Link href={`/${locale}/produits/${product.handle}`}><bdi>{product.title[locale]}</bdi></Link></Heading></div><Link className="icon-button" aria-label={`${t.discover} ${product.title[locale]}`} href={`/${locale}/produits/${product.handle}`}><ChevronRight className="directional-icon" size={23} /></Link></div></article>;
}

// The articles of a range, as photos or drawn at one scale, so their sizes can be compared at a glance.
export function ArticleGrid({ locale, items, scale }: { locale: Locale; items: CatalogProduct[]; scale: boolean }) {
  const t = messages[locale];
  const id = useId();
  const [view, setView] = useState<"photo" | "scale">("photo");
  const views = [["photo", t.nav[3]], ["scale", t.toScale]] as const;
  return <>
    {scale && <fieldset className="segmented view-switch" style={{ "--index": view === "photo" ? 0 : 1, "--count": views.length } as React.CSSProperties}>
      <legend className="sr-only">{t.viewLabel}</legend>
      <div className="segmented-track"><span className="segmented-thumb" aria-hidden="true" />{views.map(([key, label]) => <label key={key} className={view === key ? "active" : undefined}><input type="radio" name={`${id}-view`} value={key} checked={view === key} onChange={() => setView(key)} /><span>{label}</span></label>)}</div>
    </fieldset>}
    <div className="catalog-grid">{items.map(product => <CatalogCard key={product.id} locale={locale} product={product} level="h3" drawn={view === "scale"} />)}</div>
    {scale && view === "scale" && <p className="specification-note scale-note">{t.drawingNote}</p>}
  </>;
}

function InstallationVideo({ src, title }: { src: string; title: string }) {
  const youtube = src.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/);
  return youtube
    ? <iframe src={`https://www.youtube-nocookie.com/embed/${youtube[1]}`} title={title} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
    : <video src={src} controls preload="none" playsInline title={title} />;
}

type DetailTab = { key: string; label: string; content: React.ReactNode };

// Technical sheet, installation and video as tabs instead of stacked sections; the gold bar glides to the open tab.
function DetailTabs({ locale, tabs }: { locale: Locale; tabs: DetailTab[] }) {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  useEffect(() => {
    const measure = () => { const node = buttons.current[active]; if (node) setBar({ left: node.offsetLeft, width: node.offsetWidth }); };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);
  const select = (index: number) => { const next = (index + tabs.length) % tabs.length; setActive(next); buttons.current[next]?.focus(); };
  const forward = locale === "ar" ? "ArrowLeft" : "ArrowRight";
  const back = locale === "ar" ? "ArrowRight" : "ArrowLeft";
  return <div className="detail-tabs-block">
    <div className="detail-tabs" role="tablist">
      {tabs.map((tab, index) => <button key={tab.key} ref={element => { buttons.current[index] = element; }} type="button" role="tab" id={`tab-${tab.key}`} aria-selected={active === index} aria-controls={`panel-${tab.key}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}
        onKeyDown={event => { if (event.key === forward) { event.preventDefault(); select(index + 1); } if (event.key === back) { event.preventDefault(); select(index - 1); } }}>{tab.label}</button>)}
      {bar && <span className="tab-bar" aria-hidden="true" style={{ transform: `translateX(${bar.left}px)`, width: bar.width }} />}
    </div>
    {tabs.map((tab, index) => <div key={tab.key} role="tabpanel" id={`panel-${tab.key}`} aria-labelledby={`tab-${tab.key}`} hidden={active !== index} className={`tab-panel panel-${tab.key}`}>{tab.content}</div>)}
  </div>;
}

// The article page, straight to the point: gallery and the essentials side by side, then the sheet, the installation
// and the video in tabs, then the other models of the range.
export function ProductDetail({ locale, product }: { locale: Locale; product: CatalogProduct }) {
  const t = messages[locale];
  const catalog = useCatalog();
  const family = familyById(product.category);
  const [photo, setPhoto] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const photos = product.gallery.length;
  const step = (by: number) => setPhoto(index => (index + by + photos) % photos);
  // Swipe between photos on touch screens; a mostly vertical move is left to the page scroll.
  const touch = useRef<{ x: number; y: number } | null>(null);
  // On phones, a slim quote bar slides in once the main quote button has scrolled out of view.
  const actions = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => {
    const target = actions.current;
    if (!target || !("IntersectionObserver" in window)) return;
    // The observed area reaches far below the screen, so the bar shows exactly when the button is above the screen,
    // even after a jump (an anchor link, a restored scroll position) that never passes over the button.
    const observer = new IntersectionObserver(entries => setBarVisible(!entries[entries.length - 1].isIntersecting), { rootMargin: "0px 0px 100000px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const variant = product.variants.find(v => v.id === variantId) ?? product.variants[0];
  const models = family ? catalog.filter(item => item.category === product.category) : [];
  const breadcrumbs = <nav className="breadcrumbs" aria-label={locale === "ar" ? "مسار الصفحة" : "Fil d’Ariane"}>
    <Link href={`/${locale}`}>{t.nav[0]}</Link><ChevronRight size={14} className="directional-icon" /><Link href={`/${locale}/produits`}>{t.nav[2]}</Link>
    {family && <><ChevronRight size={14} className="directional-icon" /><Link href={`/${locale}/produits/${family.id}`}><bdi>{family.name}</bdi></Link></>}
    <ChevronRight size={14} className="directional-icon" /><span aria-current="page"><bdi>{product.title[locale]}</bdi></span>
  </nav>;
  const crumbRow = <div className={`crumb-row detail-crumbs${family && models.length > 1 ? " has-aside" : ""}`}>{breadcrumbs}
    {family && models.length > 1 && <RangeNav tone="light" label={`${t.modelsNav} ${family.name}`} links={models.map(item => ({ href: `/${locale}/produits/${item.handle}`, label: item.title[locale], current: item.id === product.id }))} />}</div>;
  if (!variant) return <section className="product-detail section"><div className="container">{crumbRow}<h1>{product.title[locale]}</h1><p>{product.description[locale]}</p><QuoteLink locale={locale} query={`?ref=${product.id}`}>{t.quote}</QuoteLink></div></section>;
  // The key values of the chosen version; the full sheet sits in the first tab.
  const chips = [
    ...(variant.dimensions[0] > 0 ? [[t.dimensions, `${variant.dimensions.join(" × ")} mm`]] : []),
    ...(variant.centres !== undefined ? [[t.centres, `${variant.centres} mm`]] : []),
    ...(variant.resistance !== undefined ? [[t.resistance, `${variant.resistance} W`]] : []),
    ...(variant.thermalPower > 0 ? [[t.thermalPower, `${variant.thermalPower} W`]] : []),
    ...(variant.weight !== undefined ? [[t.weight, `${variant.weight} kg`]] : []),
  ];
  const towelRadiator = product.category === "eden" || product.category === "eclat";
  const assurances = [
    { icon: Factory, text: t.assurances[0] },
    ...(towelRadiator ? [{ icon: ShieldCheck, text: t.assurances[1] }] : []),
    { icon: MessagesSquare, text: t.assurances[2] },
  ];
  const kind = installationKind(product);
  const guide = kind ? installationGuides[kind] : null;
  const related = catalog.filter(item => item.category === product.category && item.id !== product.id);
  const sheetRows = product.variants.filter(item => item.dimensions[0] > 0).map(item => ({ product, variant: item }));
  const tabs: DetailTab[] = [
    ...(product.category !== "bundle" && sheetRows.length ? [{ key: "fiche", label: t.technicalSheet, content: <div className="sheet-grid">
      {towelRadiator && variant.dimensions[0] > 0 && <figure className="tech-figure"><TechDrawing locale={locale} product={product} variant={variant} kind={kind} />
        <figcaption><span className="drawing-version" dir="ltr">{variantLabel(variant)}</span><span>H · {t.height}</span><span>L · {t.width}</span>{kind === "hydraulic" && variant.centres !== undefined && <span>E · {t.centres}</span>}<small>{t.drawingNote}</small></figcaption></figure>}
      <div className="sheet-copy">
        <p>{t.construction}{product.tubes !== undefined ? ` ${t.tubes}${locale === "fr" ? " : " : ": "}${product.tubes}.` : ""}</p>
        <SpecTable locale={locale} rows={sheetRows} caption={`${t.technicalSheet} · ${product.title[locale]}`} />
        <p className="specification-note">{t.productNote}</p>
        {product.id === "eden-100" && <a className="text-link" href="/eddfa/certificat-veritas-en442.pdf" target="_blank" rel="noopener noreferrer"><FileText size={17} /><span>{t.certificate} · {t.certificateLink}</span></a>}
      </div>
    </div> }] : []),
    ...(guide || product.installation[locale] ? [{ key: "installation", label: t.installation, content: <>
      {product.installation[locale] && <p>{product.installation[locale]}</p>}
      {guide && <ol className="install-steps">{guide.steps.map(item => <li key={item.title.fr}><h3>{item.title[locale]}</h3><p>{item.text[locale]}</p></li>)}</ol>}
      <p className="specification-note">{guide ? `${guide.advice[locale]} ` : ""}{t.installNotice}</p>
    </> }, { key: "video", label: t.videoTitle, content: product.installationVideo
      ? <div className="video-frame"><InstallationVideo src={product.installationVideo} title={`${t.videoTitle} · ${product.title[locale]}`} /></div>
      : <div className="video-soon"><PlayCircle size={40} strokeWidth={1.5} /><p>{t.videoSoon}</p><a className="text-link light" href={`tel:${company.telephone}`}><Phone size={16} /><span dir="ltr">+216 {company.phone}</span></a></div> }] : []),
  ];
  return <>
    <section className="product-detail section"><div className="container">
      {crumbRow}
      <div className="product-detail-grid">
        <div className="detail-gallery">
          <div className="detail-stage" onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
            onTouchEnd={event => {
              const start = touch.current; touch.current = null;
              if (!start || photos < 2) return;
              const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step((dx < 0) === (locale !== "ar") ? 1 : -1);
            }}>
            <button type="button" className="detail-photo" aria-label={t.zoom} onClick={() => setLightbox(photo)}
              onPointerMove={event => {
                // The photo enlarges under the pointer and follows it (desktop only; phones use the full-screen view).
                if (event.pointerType !== "mouse") return;
                const box = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty("--zx", `${((event.clientX - box.left) / box.width) * 100}%`);
                event.currentTarget.style.setProperty("--zy", `${((event.clientY - box.top) / box.height) * 100}%`);
              }}><Photo src={product.gallery[photo]} alt={product.title[locale]} priority /><span className="zoom-icon"><Expand size={20} /></span></button>
            {photos > 1 && <>
              <button type="button" className="stage-arrow prev" aria-label={t.previous} onClick={() => step(-1)}><ChevronLeft size={20} className="directional-icon" /></button>
              <button type="button" className="stage-arrow next" aria-label={t.next} onClick={() => step(1)}><ChevronRight size={20} className="directional-icon" /></button>
              <span className="stage-count" aria-label={`${t.photo} ${photo + 1} ${t.of} ${photos}`}><bdi dir="ltr" aria-hidden="true">{`${photo + 1} / ${photos}`}</bdi></span>
            </>}
          </div>
          {photos > 1 && <div className="thumbnails">{product.gallery.map((image, index) => <button key={image} type="button" className={index === photo ? "active" : ""} aria-pressed={index === photo} aria-label={`${t.photo} ${index + 1} ${t.of} ${photos}`} onClick={() => setPhoto(index)}><Photo src={image} alt="" sizes="100px" /></button>)}</div>}
        </div>
        <div className="product-detail-copy">
          <span className="eyebrow">{family ? family.kind[locale] : t.bundle}</span><h1><bdi>{product.title[locale]}</bdi></h1><p className="detail-pitch">{product.description[locale]}</p>
          {product.variants.length > 1 && <fieldset className="version-picker"><legend>{t.variant}</legend><div className="version-options">{product.variants.map(v => <label key={v.id} className={v.id === variant.id ? "active" : undefined}><input type="radio" name="product-variant" value={v.id} checked={v.id === variant.id} onChange={() => setVariantId(v.id)} /><span dir="ltr">{variantLabel(v)}</span></label>)}</div></fieldset>}
          {product.category === "bundle" ? <div className="product-notes"><h2>{t.composition}</h2><ul>{product.bundleComponents?.map((component, index) => <li key={index}>{component.quantity} × {component.title[locale]} · <bdi>{component.version}</bdi></li>)}</ul></div>
            : chips.length > 0 && <dl className="spec-chips" key={variant.id}>{chips.map(([label, value]) => <div key={label}><dt>{label}</dt><dd dir="ltr">{value}</dd></div>)}</dl>}
          <span className="on-request">{variant.price != null ? new Intl.NumberFormat(locale === "ar" ? "ar-TN" : "fr-TN", { style: "currency", currency: "TND" }).format(variant.price) : t.onRequest}</span>
          <div ref={actions} className="detail-actions"><QuoteLink locale={locale} query={`?ref=${variant.id}`}>{t.quote}<ChevronRight size={19} className="directional-icon" /></QuoteLink></div>
          <ul className="assurances">{assurances.map(({ icon: Icon, text }) => <li key={text}><Icon size={18} />{text}</li>)}</ul>
          <div className="detail-links">
            {sheetRows.length > 0 && <button type="button" className="text-link" onClick={() => window.print()}><Printer size={17} /><span>{t.printSheet}</span></button>}
            {family?.sizing && <Link className="text-link gold" href={`/${locale}/produits/${family.id}#choisir`}><Calculator size={17} /><span>{t.sizingLink}</span></Link>}
          </div>
        </div>
      </div>
      <GalleryDialog locale={locale} images={product.gallery.map(image => ({ image, title: product.title[locale] }))} index={lightbox} onIndexChange={setLightbox} />
    </div></section>
    <div className="detail-bar" data-show={barVisible} inert={!barVisible}><span><strong><bdi>{product.title[locale]}</bdi></strong><small dir="ltr">{variantLabel(variant)}</small></span><QuoteLink locale={locale} query={`?ref=${variant.id}`}>{t.quote}<ChevronRight size={18} className="directional-icon" /></QuoteLink></div>
    {tabs.length > 0 && <section className="section detail-tabs-section"><div className="container"><DetailTabs locale={locale} tabs={tabs} /></div></section>}
    {related.length > 0 && <section className="section related-section"><div className="container">
      <div className="section-heading"><span className="eyebrow">{family ? family.kind[locale] : t.bundle}</span><h2>{t.related}</h2></div>
      <div className="catalog-grid">{related.map(item => <CatalogCard key={item.id} locale={locale} product={item} level="h3" />)}</div>
    </div></section>}
  </>;
}
