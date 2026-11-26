import { families, messages, type CatalogProduct, type Locale, type ProductVariant } from "./content";
import { variantLabel } from "./products";

// Quote lines: one per product version, and one general line for a range that has no articles online yet.
export type QuoteLine = { id: string; title: string; detail: string; image?: string };
export type QuoteGroup = { key: string; label: string; lines: QuoteLine[] };
export type QuoteSelection = Record<string, number>;
export type QuoteQuery = { ref?: string; gamme?: string; qty?: string; profil?: string };
export const maxQuantity = 99;

export function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(maxQuantity, Math.max(1, Math.round(value)));
}

function lineDetail(variant: ProductVariant) {
  return variant.dimensions[0] > 0 ? variantLabel(variant) : "";
}

function productLines(product: CatalogProduct, locale: Locale): QuoteLine[] {
  if (!product.variants.length) return [{ id: `p:${product.id}`, title: product.title[locale], detail: "", image: product.image }];
  return product.variants.map(variant => ({ id: `v:${variant.id}`, title: product.title[locale], detail: lineDetail(variant), image: product.image }));
}

export function quoteGroups(products: CatalogProduct[], locale: Locale): QuoteGroup[] {
  const t = messages[locale];
  const groups: QuoteGroup[] = families.map(family => {
    const items = products.filter(product => product.category === family.id);
    const lines = items.length ? items.flatMap(product => productLines(product, locale)) : [{ id: `f:${family.id}`, title: family.name, detail: t.generalRequest }];
    return { key: family.id, label: `${family.name} · ${family.kind[locale]}`, lines };
  });
  const bundles = products.filter(product => product.category === "bundle");
  if (bundles.length) groups.push({ key: "bundle", label: t.bundle, lines: bundles.flatMap(product => productLines(product, locale)) });
  return groups;
}

/** Pre-ticks the article a visitor came from (?ref=variant or product) or a range without articles (?gamme=). */
export function initialSelection(products: CatalogProduct[], groups: QuoteGroup[], query: QuoteQuery): QuoteSelection {
  const ids = new Set(groups.flatMap(group => group.lines.map(line => line.id)));
  const quantity = clampQuantity(Number(query.qty ?? 1));
  const selection: QuoteSelection = {};
  if (query.ref) {
    const product = products.find(item => item.id === query.ref || item.handle === query.ref);
    const candidates = [`v:${query.ref}`, product?.variants[0] ? `v:${product.variants[0].id}` : "", product ? `p:${product.id}` : ""];
    const id = candidates.find(candidate => candidate && ids.has(candidate));
    if (id) selection[id] = quantity;
  }
  if (query.gamme && ids.has(`f:${query.gamme}`)) selection[`f:${query.gamme}`] = 1;
  return selection;
}

export function selectedLines(groups: QuoteGroup[], selection: QuoteSelection) {
  return groups.flatMap(group => group.lines.filter(line => selection[line.id] > 0).map(line => ({ ...line, group: group.label, quantity: selection[line.id] })));
}

export type QuoteContact = { name: string; phone: string; email: string; region: string; customerType: string; details: string };

export function quoteDraft(locale: Locale, contact: QuoteContact, groups: QuoteGroup[], selection: QuoteSelection) {
  const t = messages[locale];
  const lines = selectedLines(groups, selection).map(line => `- ${line.quantity} × ${line.title}${line.detail ? ` · ${line.detail}` : ""}`);
  return [
    t.quoteSubject, "",
    `${t.name}: ${contact.name}`,
    `${t.info.phone}: ${contact.phone}`,
    ...(contact.email ? [`${t.info.email}: ${contact.email}`] : []),
    `${t.region}: ${contact.region}`,
    `${t.customerType}: ${contact.customerType}`,
    "", `${t.lines}:`, ...lines,
    ...(contact.details ? ["", contact.details] : []),
  ].join("\n");
}

export function countLabel(count: number, locale: Locale) {
  if (locale === "fr") return `${count} article${count > 1 ? "s" : ""}`;
  if (count === 1) return "منتج واحد";
  if (count === 2) return "منتجان";
  return count <= 10 ? `${count} منتجات` : `${count} منتجاً`;
}
