import type { CatalogProduct, Locale, ProductVariant, SizingBasis } from "./content";

// Rule of thumb for bathrooms: about 100 to 150 W per m² for a 2.5 m ceiling, i.e. 40 to 60 W per m³.
// EDDFA can replace these coefficients with its own; the page shows whichever values are set here.
export type Insulation = "good" | "average" | "poor";
export const insulationLevels: Insulation[] = ["good", "average", "poor"];
export const insulationCoefficients: Record<Insulation, number> = { good: 40, average: 50, poor: 60 };
// Slider ranges for a bathroom; the starting values show a typical room straight away.
export const sizingRanges = {
  surface: { min: 1, max: 30, step: 0.5, initial: 5 },
  ceiling: { min: 2, max: 4, step: 0.05, initial: 2.6 },
} as const;
export const maxUnits = 4;

export function requiredPower(surface: number, ceiling: number, insulation: Insulation) {
  return Math.round(surface * ceiling * insulationCoefficients[insulation]);
}

/** Heat an appliance can deliver: announced thermal output for hot water, element power for electric models. */
export function variantOutput(variant: ProductVariant, basis: SizingBasis) {
  return basis === "electric" ? variant.resistance ?? 0 : variant.thermalPower;
}

export type SizingOption = { product: CatalogProduct; variant: ProductVariant; output: number; units: number };
export type SizingResult = { best: SizingOption | null; alternatives: SizingOption[] };

export function recommend(products: CatalogProduct[], basis: SizingBasis, power: number): SizingResult {
  const options = products
    .filter(product => product.category !== "bundle")
    .flatMap(product => product.variants.map(variant => ({ product, variant, output: variantOutput(variant, basis), units: 1 })))
    .filter(option => option.output > 0)
    .sort((a, b) => a.output - b.output || a.variant.dimensions[0] - b.variant.dimensions[0]);
  if (!options.length || power <= 0) return { best: null, alternatives: [] };
  const single = options.filter(option => option.output >= power);
  if (single.length) return { best: single[0], alternatives: single.slice(1, 4) };
  for (let units = 2; units <= maxUnits; units++) {
    const several = options.find(option => option.output * units >= power);
    if (several) return { best: { ...several, units }, alternatives: [] };
  }
  return { best: null, alternatives: [] };
}

/** Short decimal display: "2,6" in French, "2.6" in Arabic (the site writes Latin digits in both). */
// A whole number with its thousands set apart by a thin space (Miller's law: « 1 248 W » reads in two chunks, « 1248 W »
// in four digits). Latin digits on both sides of the site, as everywhere else in the figures.
export function formatWhole(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0, useGrouping: true }).format(Math.round(value));
}

export function formatDecimal(value: number, locale: Locale, digits = 1) {
  const factor = 10 ** digits;
  const text = String(Math.round(value * factor) / factor);
  return locale === "fr" ? text.replace(".", ",") : text;
}
