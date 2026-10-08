"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronRight, Expand, Search, X } from "lucide-react";
import { messages, type CatalogProduct, type Locale } from "@/lib/content";
import { variantLabel } from "@/lib/products";
import { Photo } from "./media";
import { GalleryDialog } from "./galleries";
import { QuoteButton } from "./site-shell";

export function Catalog({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const normalized = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase(locale).trim();
  const shown = products.filter(p => (category === "all" || p.category === category) && normalized(`${p.title[locale]} ${p.description[locale]}`).includes(normalized(query)));
  return <>
    <div className="catalog-tools"><div className="filter-bar" role="group" aria-label={t.selection}>{[["all", t.all], ["eden", t.eden], ["eclat", t.eclat], ...(products.some(product => product.category === "bundle") ? [["bundle", t.bundle]] : [])].map(([key, label]) => <button type="button" key={key} className={category === key ? "active" : ""} aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>)}</div>
      <div className="search-field"><Search size={18} /><input aria-label={t.search} placeholder={t.searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)} type="search" />{query && <button type="button" className="icon-button" aria-label={t.clear} onClick={() => setQuery("")}><X size={17} /></button>}</div>
    </div>
    <p className="sr-only" role="status" aria-live="polite">{shown.length} {t.nav[2]}</p>
    <div className="catalog-grid">{shown.map(p => <article key={p.id} className="catalog-item"><Link href={`/${locale}/produits/${p.handle}`} className="catalog-photo"><Photo src={p.image} alt={p.title[locale]} /></Link><div className="catalog-item-caption"><div><span className="eyebrow">{t[p.category]}</span><h2><Link href={`/${locale}/produits/${p.handle}`}><bdi>{p.title[locale]}</bdi></Link></h2></div><Link className="icon-button" aria-label={`${t.discover} ${p.title[locale]}`} href={`/${locale}/produits/${p.handle}`}><ChevronRight className="directional-icon" size={23} /></Link></div></article>)}</div>
    {!shown.length && <div className="empty-results"><p>{t.noResults}</p><button type="button" className="pill-button" onClick={() => { setQuery(""); setCategory("all"); }}>{t.clear}</button></div>}
  </>;
}

export function ProductDetail({ locale, product }: { locale: Locale; product: CatalogProduct }) {
  const t = messages[locale];
  const [photo, setPhoto] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const variant = product.variants.find(v => v.id === variantId) ?? product.variants[0];
  if (!variant) return <section className="product-detail section"><div className="container"><h1>{product.title[locale]}</h1><p>{product.description[locale]}</p><QuoteButton product={product.id}>{t.quote}</QuoteButton></div></section>;
  const specs = [
    ...(variant.dimensions[0] > 0 ? [[t.height, `${variant.dimensions[0]} mm`]] : []), ...(variant.dimensions[1] > 0 ? [[t.width, `${variant.dimensions[1]} mm`]] : []), ...(variant.dimensions[2] > 0 ? [[t.depth, `${variant.dimensions[2]} mm`]] : []),
    ...(product.tubes !== undefined ? [[t.tubes, String(product.tubes)]] : []),
    ...(variant.centres !== undefined ? [[t.centres, `${variant.centres} mm`]] : []),
    ...(variant.resistance !== undefined ? [[t.resistance, `${variant.resistance} W`]] : []),
    ...(variant.thermalPower > 0 ? [[t.thermalPower, `${variant.thermalPower} W`]] : []),
    ...(variant.weight !== undefined ? [[t.weight, `${variant.weight} kg`]] : []),
  ];
  return <section className="product-detail section"><div className="container">
    <Link className="back-link" href={`/${locale}/produits`}><ArrowLeft size={18} className="directional-icon" />{t.back}</Link>
    <div className="product-detail-grid"><div><button type="button" className="detail-photo" aria-label={t.zoom} onClick={() => setLightbox(photo)}><Photo src={product.gallery[photo]} alt={product.title[locale]} priority /><span className="zoom-icon"><Expand size={21} /></span></button><div className="thumbnails">{product.gallery.map((image, index) => <button key={image} type="button" className={index === photo ? "active" : ""} aria-pressed={index === photo} aria-label={`${t.selection} ${index + 1}`} onClick={() => setPhoto(index)}><Photo src={image} alt="" sizes="100px" /></button>)}</div></div>
      <div className="product-detail-copy"><span className="eyebrow">{t[product.category]}</span><h1><bdi>{product.title[locale]}</bdi></h1><p>{product.description[locale]}</p>
        <label className="variant-select">{t.variant}<select name="product-variant" dir="ltr" value={variantId} onChange={e => setVariantId(e.target.value)}>{product.variants.map(v => <option key={v.id} value={v.id}>{variantLabel(v)}</option>)}</select></label>
        <span className="on-request">{variant.price != null ? new Intl.NumberFormat(locale === "ar" ? "ar-TN" : "fr-TN", { style: "currency", currency: "TND" }).format(variant.price) : t.onRequest}</span><QuoteButton product={product.id} variant={variant.id}>{t.quote}</QuoteButton>
        {product.category === "bundle" ? <div className="product-notes"><h2>{t.composition}</h2><ul>{product.bundleComponents?.map((component, index) => <li key={index}>{component.quantity} × {component.title[locale]} · <bdi>{component.version}</bdi></li>)}</ul></div> : !!specs.length && <div className="product-notes"><h2>{t.specifications}</h2><p>{t.construction}</p><dl className="specification-list">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd dir="ltr">{value}</dd></div>)}</dl><p className="specification-note">{t.productNote}</p></div>}
        {product.installation[locale] && <div className="product-notes"><h2>{t.installation}</h2><p>{product.installation[locale]}</p></div>}
      </div>
    </div>
    <GalleryDialog locale={locale} images={product.gallery.map(image => ({ image, title: product.title[locale] }))} index={lightbox} onIndexChange={setLightbox} />
  </div></section>;
}
