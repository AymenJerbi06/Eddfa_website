"use client";

import { useId, useState, type FormEvent } from "react";
import { Check, Download, Mail, RotateCcw } from "lucide-react";
import { company, governorates, messages, type Locale } from "@/lib/content";
import { useCatalog } from "./catalog-context";
import { normalizeTunisianPhone } from "@/lib/inquiry";
import { variantLabel, variantSummary } from "@/lib/products";

export function InquiryForm({ locale, initialProduct = "", initialVariant = "" }: { locale: Locale; initialProduct?: string; initialVariant?: string }) {
  const products = useCatalog();
  const t = messages[locale];
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [productId, setProductId] = useState(initialProduct);
  const [variantId, setVariantId] = useState(initialVariant);
  const currentProduct = products.find(p => p.id === productId);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = normalizeTunisianPhone(String(data.get("phone")));
    const input = form.elements.namedItem("phone") as HTMLInputElement;
    input.setCustomValidity(phone ? "" : t.invalidPhone);
    if (!form.reportValidity() || !phone) return;
    const selected = products.find(p => p.id === data.get("product"));
    const selectedVariant = selected?.variants.find(v => v.id === data.get("variant"));
    setDraft([
      `EDDFA - ${t.formTitle}`,
      `${t.name}: ${String(data.get("name")).trim()}`,
      `${t.phone}: ${phone}`,
      `${t.email}: ${String(data.get("email")).trim()}`,
      `${t.region}: ${data.get("region")}`,
      `${t.product}: ${selected?.title[locale] ?? t.chooseProduct}`,
      `${t.variant}: ${selectedVariant ? variantSummary(selectedVariant, locale) : t.chooseVariant}`,
      "", String(data.get("message")).trim(),
    ].join("\n"));
  }
  function download() {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "EDDFA-demande.txt"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (draft) return <div className="inquiry-success" role="status" aria-live="polite">
    <span className="success-mark"><Check size={26} /></span><h3>{t.prepared}</h3><p>{t.draftText}</p>
    <div className="success-actions">
      <button className="pill-button gold" type="button" onClick={download}><Download size={17} />{t.download}</button>
      <a className="pill-button" href={`mailto:${company.email}?subject=${encodeURIComponent("EDDFA - Demande")}&body=${encodeURIComponent(draft)}`}><Mail size={17} />{t.emailDraft}</a>
    </div>
    <button className="text-button" type="button" onClick={() => setDraft(null)}><RotateCcw size={15} />{t.another}</button>
  </div>;
  return <form className="inquiry-form" onSubmit={submit}>
    <div className="form-row">
      <label htmlFor={`${id}-name`}>{t.name}<input id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} /></label>
      <label htmlFor={`${id}-phone`}>{t.phone}<input id={`${id}-phone`} name="phone" autoComplete="tel" type="tel" inputMode="tel" dir="ltr" required maxLength={24} placeholder="31 547 491" onInput={e => e.currentTarget.setCustomValidity("")} /></label>
    </div>
    <label htmlFor={`${id}-email`}>{t.email}<input id={`${id}-email`} name="email" autoComplete="email" type="email" dir="ltr" maxLength={254} /></label>
    <div className="form-row">
      <label htmlFor={`${id}-region`}>{t.region}<select id={`${id}-region`} name="region" required defaultValue=""><option value="" disabled>{t.chooseRegion}</option>{governorates.map(g => <option key={g.fr} value={g.fr}>{g[locale]}</option>)}</select></label>
      <label htmlFor={`${id}-product`}>{t.product}<select id={`${id}-product`} name="product" value={productId} onChange={e => { setProductId(e.target.value); setVariantId(""); }}><option value="">{t.chooseProduct}</option>{products.map(p => <option key={p.id} value={p.id}>{p.title[locale]}</option>)}</select></label>
    </div>
    {currentProduct && <label htmlFor={`${id}-variant`}>{t.variant}<select id={`${id}-variant`} name="variant" dir="ltr" value={variantId} onChange={e => setVariantId(e.target.value)}><option value="">{t.chooseVariant}</option>{currentProduct.variants.map(v => <option key={v.id} value={v.id}>{variantLabel(v)}</option>)}</select></label>}
    <label htmlFor={`${id}-message`}>{t.message}<textarea id={`${id}-message`} name="message" rows={4} required minLength={5} maxLength={2000} /></label>
    <button className="pill-button gold" type="submit">{t.submit}</button>
  </form>;
}
