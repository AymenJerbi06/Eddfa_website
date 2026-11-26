"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Check, ChevronDown, Download, Mail, MessageCircle, Minus, Plus, RotateCcw } from "lucide-react";
import { company, governorates, messages, whatsappHref, type Locale } from "@/lib/content";
import { normalizeTunisianPhone } from "@/lib/inquiry";
import { clampQuantity, countLabel, initialSelection, maxQuantity, quoteDraft, quoteGroups, selectedLines, type QuoteQuery, type QuoteSelection } from "@/lib/quote";
import { mergeSelections, readBasket, writeBasket } from "@/lib/basket";
import { useCatalog } from "./catalog-context";
import { Photo } from "./media";
import { RadiatorMark } from "./radiator-mark";
import { SegmentedThumb, seenModels, shake } from "./motion";
import { asciiDigits, tidyEmail, tidyName, tidyPhone, useShakeOnInvalid } from "./form-help";

// "Obtenir un devis": tick articles, set quantities, then prepare the request. Like the contact form,
// nothing is sent automatically in this preview: the visitor downloads the request or opens an email.
// The page opens with the visitor's basket (what they added while exploring) and keeps it up to date.
export function QuoteBuilder({ locale, query }: { locale: Locale; query: QuoteQuery }) {
  const t = messages[locale];
  const id = useId();
  const products = useCatalog();
  const groups = useMemo(() => quoteGroups(products, locale), [products, locale]);
  const [selection, setSelection] = useState<QuoteSelection>(() => initialSelection(products, groups, query));
  const [open, setOpen] = useState<Set<string>>(() => {
    const preselected = groups.filter(group => group.lines.some(line => selection[line.id])).map(group => group.key);
    return new Set(preselected.length ? preselected : groups.slice(0, 1).map(group => group.key));
  });
  // Installers and resellers arrive from the home page's pro band with the professional box already chosen.
  const [customerType, setCustomerType] = useState<"individual" | "professional">(query.profil === "pro" ? "professional" : "individual");
  const [draft, setDraft] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const finish = useRef<HTMLDivElement>(null);
  const catalogBox = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  // The quantity a visitor is typing, kept as typed until they leave the field (Postel's law).
  const [typing, setTyping] = useState<{ id: string; text: string } | null>(null);
  const shakeRef = useShakeOnInvalid();
  useEffect(() => {
    const basket = readBasket();
    if (Object.keys(basket).length) {
      const merged = mergeSelections(basket, initialSelection(products, groups, query));
      const ids = new Set(groups.flatMap(group => group.lines.map(line => line.id)));
      const known = Object.fromEntries(Object.entries(merged).filter(([lineId]) => ids.has(lineId)));
      setSelection(known);
      setOpen(current => new Set([...current, ...groups.filter(group => group.lines.some(line => known[line.id])).map(group => group.key)]));
    }
    // Frequency of use: the ranges of the models looked at during the visit open too, so they are one tick away.
    const seen = new Set<string>();
    for (const productId of seenModels()) { const range = products.find(product => product.id === productId)?.category; if (range) seen.add(range); }
    if (groups.some(group => seen.has(group.key))) setOpen(current => new Set([...current, ...groups.filter(group => seen.has(group.key)).map(group => group.key)]));
    setHydrated(true);
    // Only once, when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (hydrated) writeBasket(selection); }, [hydrated, selection]);
  const chosen = selectedLines(groups, selection);
  const whatsapp = draft ? whatsappHref(draft) : null;
  const stage = draft !== null ? 2 : chosen.length ? 1 : 0;

  const update = (next: QuoteSelection) => { setSelection(next); setDraft(null); if (Object.keys(next).length) setMissing(false); };
  const toggle = (lineId: string) => { const next = { ...selection }; if (next[lineId]) delete next[lineId]; else next[lineId] = 1; update(next); };
  const setQuantity = (lineId: string, value: number) => update({ ...selection, [lineId]: clampQuantity(value) });
  const setGroupOpen = (key: string, value: boolean) => setOpen(current => { const next = new Set(current); if (value) next.add(key); else next.delete(key); return next; });
  const reveal = (node: HTMLElement | null) => node?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!chosen.length) {
      setMissing(true);
      setGroupOpen(groups[0].key, true);
      const catalog = document.getElementById(`${id}-catalog`);
      reveal(catalog);
      catalog?.querySelector<HTMLInputElement>("input[type=checkbox]")?.focus({ preventScroll: true });
      // The articles shake once the page has brought them into view (exaggerated feedback).
      window.setTimeout(() => shake(catalogBox.current), 450);
      return;
    }
    const data = new FormData(form);
    const phone = normalizeTunisianPhone(String(data.get("phone")));
    const input = form.elements.namedItem("phone") as HTMLInputElement;
    input.setCustomValidity(phone ? "" : t.invalidPhone);
    if (!form.reportValidity() || !phone) return;
    const region = governorates.find(item => item.fr === data.get("region"));
    setDraft(quoteDraft(locale, {
      name: String(data.get("name")).trim(), phone, email: String(data.get("email")).trim(),
      region: region?.[locale] ?? "", customerType: customerType === "professional" ? t.professional : t.individual,
      details: String(data.get("details")).trim(),
    }, groups, selection));
  }

  function download() {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "EDDFA-devis.txt"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    {/* The steps also lead to their part of the page, as steps do on most sites (Jakob's law): the articles, then the
        details. The last one is the result itself. */}
    <ol className="quote-progress" style={{ "--stage": stage } as React.CSSProperties}>{t.progress.map((label, index) => {
      const inner = <><span className="progress-dot">{index < stage ? <Check size={13} strokeWidth={3} /> : index + 1}</span>{label}</>;
      return <li key={label} className={index <= stage ? "reached" : undefined} aria-current={index === stage ? "step" : undefined}>
        {index < 2 && draft === null ? <button type="button" className="progress-jump" onClick={() => {
          const target = index === 0 ? document.getElementById(`${id}-catalog`) : finish.current;
          reveal(target);
          (index === 0 ? target?.querySelector<HTMLElement>("summary") : target?.querySelector<HTMLElement>("input[name=name]"))?.focus({ preventScroll: true });
        }}>{inner}</button> : inner}
      </li>;
    })}</ol>
    <div className="quote-layout">
      <div ref={catalogBox} className="quote-catalog" id={`${id}-catalog`}>
        {groups.map(group => {
          const picked = group.lines.filter(line => selection[line.id]).length;
          return <details key={group.key} className="quote-group" id={`gamme-${group.key}`} open={open.has(group.key)} onToggle={event => setGroupOpen(group.key, event.currentTarget.open)}>
            <summary><bdi>{group.label}</bdi>{picked > 0 && <span className="group-count">{picked}</span>}<ChevronDown size={18} className="group-chevron" /></summary>
            <div className="quote-lines">{group.lines.map(line => {
              const quantity = selection[line.id] ?? 0;
              const checked = quantity > 0;
              const inputId = `${id}-${line.id}`;
              const name = `${line.title}${line.detail ? ` · ${line.detail}` : ""}`;
              return <div key={line.id} className={`quote-line${checked ? " selected" : ""}`}>
                <input id={inputId} type="checkbox" checked={checked} onChange={() => toggle(line.id)} />
                {/* Fitts's law: the photo is part of the target too, not only the name and the small box. */}
                <label htmlFor={inputId} className="quote-thumb" aria-hidden="true">{line.image ? <Photo src={line.image} alt="" sizes="64px" /> : <RadiatorMark />}</label>
                <label htmlFor={inputId}><strong><bdi>{line.title}</bdi></strong>{line.detail && <span className="quote-detail">{line.detail}</span>}</label>
                <div className="quantity-stepper" role="group" aria-label={`${t.quantity} · ${name}`} aria-hidden={!checked}>
                  <button type="button" className="icon-button" tabIndex={checked ? 0 : -1} aria-label={`${t.decrease} · ${name}`} disabled={!checked || quantity <= 1} onClick={() => setQuantity(line.id, quantity - 1)}><Minus size={15} /></button>
                  <input type="text" inputMode="numeric" dir="ltr" maxLength={3} value={typing?.id === line.id ? typing.text : checked ? quantity : 1} disabled={!checked} tabIndex={checked ? 0 : -1} aria-label={`${t.quantity} · ${name}`}
                    onChange={event => {
                      // Postel's law: any digits are taken (Arabic ones too); the box keeps what is typed until the visitor
                      // leaves it, then shows the quantity counted (1 to 99).
                      const text = asciiDigits(event.target.value);
                      setTyping({ id: line.id, text });
                      if (text) setQuantity(line.id, Number(text));
                    }}
                    onBlur={() => setTyping(null)} />
                  <button type="button" className="icon-button" tabIndex={checked ? 0 : -1} aria-label={`${t.increase} · ${name}`} disabled={!checked || quantity >= maxQuantity} onClick={() => setQuantity(line.id, quantity + 1)}><Plus size={15} /></button>
                </div>
              </div>;
            })}</div>
          </details>;
        })}
      </div>
      <aside className="quote-summary" aria-label={t.selectionTitle}>
        <h2>{t.selectionTitle}</h2>
        {chosen.length ? <><p className="quote-count" key={chosen.length}>{countLabel(chosen.length, locale)}</p><ul>{chosen.map(line => <li key={line.id}><span className="quote-qty" dir="ltr">{line.quantity} ×</span><span><bdi>{line.title}</bdi>{line.detail && <small>{line.detail}</small>}</span></li>)}</ul>{draft === null && <button type="button" className="pill-button primary" onClick={() => reveal(finish.current)}>{t.continueQuote}</button>}</> : <p>{t.emptySelection}</p>}
      </aside>
    </div>
    <div className="quote-finish" ref={finish}>
      {draft && <div className="inquiry-success" role="status" aria-live="polite">
        <RadiatorMark className="success-radiator" warm={6} /><h3>{t.quotePrepared}</h3><p>{t.quoteDraftText}</p>
        <div className="success-actions">
          {whatsapp && <a className="pill-button primary" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} />{t.sendWhatsapp}</a>}
          <a className={`pill-button${whatsapp ? "" : " primary"}`} href={`mailto:${company.email}?subject=${encodeURIComponent(t.quoteSubject)}&body=${encodeURIComponent(draft)}`}><Mail size={17} />{t.emailDraft}</a>
          <button className="pill-button" type="button" onClick={download}><Download size={17} />{t.download}</button>
        </div>
        <button className="text-button" type="button" onClick={() => setDraft(null)}><RotateCcw size={15} />{t.editRequest}</button>
      </div>}
      <form ref={shakeRef} className="inquiry-form quote-form" onSubmit={submit} hidden={draft !== null}>
        <h2>{t.customer}</h2>
        <div className="form-row">
          <label htmlFor={`${id}-name`}>{t.name}<input id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} onBlur={event => tidyName(event.currentTarget)} /></label>
          <label htmlFor={`${id}-phone`}>{t.phone}<input id={`${id}-phone`} name="phone" autoComplete="tel" type="tel" inputMode="tel" dir="ltr" required maxLength={24} placeholder={t.phoneHint} onInput={event => event.currentTarget.setCustomValidity("")} onBlur={event => tidyPhone(event.currentTarget)} /></label>
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-email`}>{t.email}<input id={`${id}-email`} name="email" autoComplete="email" type="email" dir="ltr" maxLength={254} onBlur={event => tidyEmail(event.currentTarget)} /></label>
          <label htmlFor={`${id}-region`}>{t.region}<select id={`${id}-region`} name="region" required defaultValue=""><option value="" disabled>{t.chooseRegion}</option>{governorates.map(item => <option key={item.fr} value={item.fr}>{item[locale]}</option>)}</select></label>
        </div>
        <fieldset className="segmented compact" style={{ "--index": customerType === "individual" ? 0 : 1, "--count": 2 } as React.CSSProperties}>
          <legend>{t.customerType}</legend>
          <div className="segmented-track"><SegmentedThumb index={customerType === "individual" ? 0 : 1} />{(["individual", "professional"] as const).map(type => <label key={type} className={customerType === type ? "active" : undefined}><input type="radio" name="customer-type" value={type} checked={customerType === type} onChange={() => setCustomerType(type)} /><span>{type === "individual" ? t.individual : t.professional}</span></label>)}</div>
        </fieldset>
        <label htmlFor={`${id}-details`}>{t.details}<textarea id={`${id}-details`} name="details" rows={3} maxLength={2000} /></label>
        {missing && <p className="form-error" role="alert">{t.selectAtLeastOne}</p>}
        <button className="pill-button primary" type="submit">{t.submitQuote}</button>
      </form>
    </div>
  </>;
}
