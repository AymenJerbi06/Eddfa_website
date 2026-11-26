"use client";

import Link from "next/link";
import { createContext, useContext, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronRight, X } from "lucide-react";
import { messages, type CatalogProduct, type Locale } from "@/lib/content";
import { variantLabel } from "@/lib/products";
import { Photo } from "./media";
import { AddToQuote } from "./basket";
import { quickFacts } from "./catalog";

// A range card that answers the pointer: a soft light follows it over the card (like the light along the aluminium
// tubes), and pointing at a model's chip shows that model in the card's picture, with its sizes and power, before the
// visitor opens it. On touch screens the chips open the quick view directly.
const PreviewContext = createContext<((product: CatalogProduct | null) => void) | null>(null);
const ShownContext = createContext<{ product: CatalogProduct | null; on: boolean }>({ product: null, on: false });

export function RangeCardShell({ className, children }: { className: string; children: ReactNode }) {
  const [shown, setShown] = useState<{ product: CatalogProduct | null; on: boolean }>({ product: null, on: false });
  const preview = (product: CatalogProduct | null) => setShown(current => product ? { product, on: true } : { ...current, on: false });
  return <PreviewContext.Provider value={preview}><ShownContext.Provider value={shown}>
    <article className={className} onPointerMove={event => {
      if (event.pointerType !== "mouse") return;
      const box = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--lx", `${event.clientX - box.left}px`);
      event.currentTarget.style.setProperty("--ly", `${event.clientY - box.top}px`);
    }}>{children}</article>
  </ShownContext.Provider></PreviewContext.Provider>;
}

export function RangePreview({ locale }: { locale: Locale }) {
  const { product, on } = useContext(ShownContext);
  if (!product) return null;
  // Portrait scenes show the whole radiator in a card over the room; the facts are the ones on the model's own card.
  const facts = quickFacts(product);
  return <span className={`range-preview${on ? " on" : ""}`} aria-hidden="true">
    <Photo key={product.id} src={product.image} alt="" sizes="(max-width: 921px) 40vw, 240px" />
    <span className="range-preview-caption"><bdi>{product.title[locale]}</bdi>{facts && facts.split(" · ").map(fact => <small key={fact} dir="ltr">{fact}</small>)}</span>
  </span>;
}

// The models of a range as chips. Each one is a link to its page, and a plain click opens it right here instead: its
// photo, its versions with their sizes and power, « Ajouter au devis » and the way to the full page. The visitor keeps
// exploring without losing their place.
export function ModelChips({ locale, label, models }: { locale: Locale; label: string; models: CatalogProduct[] }) {
  const [open, setOpen] = useState<CatalogProduct | null>(null);
  const preview = useContext(PreviewContext);
  return <>
    <ul className="model-chips" aria-label={label} onPointerLeave={() => preview?.(null)}>{models.map(product => <li key={product.id}>
      <Link href={`/${locale}/produits/${product.handle}`} aria-haspopup="dialog"
        onPointerEnter={event => { if (event.pointerType === "mouse") preview?.(product); }}
        onFocus={event => { if (event.currentTarget.matches(":focus-visible")) preview?.(product); }}
        onBlur={() => preview?.(null)}
        onClick={event => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          preview?.(null);
          setOpen(product);
        }}><bdi>{product.title[locale]}</bdi></Link>
    </li>)}</ul>
    <Dialog.Root open={open !== null} onOpenChange={value => { if (!value) setOpen(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="quick-overlay" />
        <Dialog.Content className="quick-view" dir={locale === "ar" ? "rtl" : "ltr"} aria-describedby={undefined} onCloseAutoFocus={() => preview?.(null)}>
          {open && <QuickView key={open.id} locale={locale} product={open} />}
          <Dialog.Close asChild><button type="button" className="quick-close icon-button" aria-label={messages[locale].close}><X size={22} /></button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}

function QuickView({ locale, product }: { locale: Locale; product: CatalogProduct }) {
  const t = messages[locale];
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const variant = product.variants.find(item => item.id === variantId) ?? product.variants[0];
  const power = product.category === "eclat" ? variant?.resistance : variant?.thermalPower;
  return <div className="quick-grid">
    <div className="quick-photo"><Photo src={product.image} alt={product.title[locale]} sizes="(max-width: 921px) 90vw, 420px" /></div>
    <div className="quick-copy">
      <Dialog.Title className="quick-title"><bdi>{product.title[locale]}</bdi></Dialog.Title>
      <p>{product.description[locale]}</p>
      {product.variants.length > 1 && <fieldset className="quick-versions"><legend>{t.variant}</legend>
        <div>{product.variants.map(item => <label key={item.id} className={item.id === variant?.id ? "active" : undefined}>
          <input type="radio" name={`quick-${product.id}`} value={item.id} checked={item.id === variant?.id} onChange={() => setVariantId(item.id)} /><span dir="ltr">{variantLabel(item)}</span>
        </label>)}</div>
      </fieldset>}
      {variant && <dl className="quick-specs" key={variant.id}>
        {variant.dimensions[0] > 0 && <div><dt>{t.dimensions}</dt><dd dir="ltr">{variant.dimensions.join(" × ")} mm</dd></div>}
        {power ? <div><dt>{product.category === "eclat" ? t.resistance : t.thermalPower}</dt><dd dir="ltr">{power} W</dd></div> : null}
      </dl>}
      <div className="quick-actions">
        {variant && <AddToQuote locale={locale} lineId={`v:${variant.id}`} />}
        <Link className="text-link" href={`/${locale}/produits/${product.handle}`}><span>{t.viewModel}</span><ChevronRight size={16} className="directional-icon" /></Link>
      </div>
    </div>
  </div>;
}
