"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronRight, Plus } from "lucide-react";
import { messages, type Locale } from "@/lib/content";
import { addToBasket, basketEvent, basketKey, basketSize, readBasket } from "@/lib/basket";
import type { QuoteSelection } from "@/lib/quote";

// The quote basket on screen: the count beside « Devis » everywhere, and an « Ajouter au devis » button that keeps the
// visitor where they are. Once something is added, the button says so and a link to the request appears beside it,
// with the count; nothing floats over the page.
export function useBasket() {
  const [selection, setSelection] = useState<QuoteSelection>({});
  useEffect(() => {
    const sync = () => setSelection(readBasket());
    const storage = (event: StorageEvent) => { if (event.key === basketKey) sync(); };
    sync();
    window.addEventListener(basketEvent, sync);
    window.addEventListener("storage", storage);
    return () => { window.removeEventListener(basketEvent, sync); window.removeEventListener("storage", storage); };
  }, []);
  return selection;
}

export function BasketCount({ label }: { label: string }) {
  const count = basketSize(useBasket());
  if (!count) return null;
  return <span className="basket-count" key={count} aria-label={`${count} · ${label}`}>{count}</span>;
}

// The added article travels to « Devis »: a small brass token leaves the button and lands on the quote button that is
// on screen (the header's on a computer at the top of the page, the side rail further down, the header pill on
// phones), which answers with a pulse. It answers the visitor's click only, and is skipped for reduced motion.
const targets = [".nav-quote .nav-link-row a", ".header-quote", ".rail-quote"];
function flyToQuote(from: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = targets.map(selector => document.querySelector<HTMLElement>(selector)).find(element => {
    if (!element) return false;
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < window.innerHeight && getComputedStyle(element).visibility !== "hidden";
  });
  if (!target) return;
  const start = from.getBoundingClientRect(), end = target.getBoundingClientRect();
  const x0 = start.left + start.width / 2, y0 = start.top + start.height / 2;
  const x1 = end.left + end.width / 2, y1 = end.top + end.height / 2;
  const lift = Math.min(160, Math.abs(x1 - x0) * 0.25 + 60);
  const token = document.createElement("span");
  token.className = "quote-token";
  token.setAttribute("aria-hidden", "true");
  document.body.appendChild(token);
  // Anticipation, squash and stretch, arcs: the token sinks and squashes a hair before it leaves, stretches as it
  // rises on its arc, and lands small on the button, which squashes and springs back (quote-hit in signature.css).
  const flight = token.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
    { transform: `translate(${x0}px, ${y0 + 5}px) scale(1.18, 0.82)`, opacity: 1, offset: 0.12 },
    { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - lift}px) scale(0.9, 1.1)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${x1}px, ${y1}px) scale(0.45)`, opacity: 0.85 },
  ], { duration: 820, easing: "cubic-bezier(0.45, 0, 0.25, 1)" });
  flight.onfinish = () => {
    token.remove();
    target.classList.remove("quote-hit");
    void target.offsetWidth;
    target.classList.add("quote-hit");
    target.addEventListener("animationend", () => target.classList.remove("quote-hit"), { once: true });
  };
  flight.oncancel = () => token.remove();
}

export function AddToQuote({ locale, lineId, quantity = 1, className = "pill-button primary" }: { locale: Locale; lineId: string; quantity?: number; className?: string }) {
  const t = messages[locale];
  const count = basketSize(useBasket());
  const [added, setAdded] = useState(0);
  return <div className="add-to-quote">
    <button type="button" className={`${className}${added ? " added" : ""}`} onClick={event => { addToBasket(lineId, quantity); setAdded(value => value + 1); flyToQuote(event.currentTarget); }}>
      {added ? <><Check size={18} strokeWidth={2.6} key={added} className="added-check" />{t.addedToQuote}</> : <>{t.addToQuote}<Plus size={18} /></>}
    </button>
    {added > 0 && <Link className="text-link quote-next" href={`/${locale}/devis`} aria-live="polite"><span>{t.viewQuote} ({count})</span><ChevronRight size={16} className="directional-icon" /></Link>}
  </div>;
}
