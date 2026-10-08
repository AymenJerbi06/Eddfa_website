import { messages, type Locale, type ProductVariant } from "./content";

export function variantLabel(variant: ProductVariant) {
  return variant.resistance !== undefined
    ? `${variant.dimensions[0]} mm · ${variant.resistance} W`
    : `${variant.dimensions[0]} × ${variant.dimensions[1]} mm`;
}

export function variantSummary(variant: ProductVariant, locale: Locale) {
  const t = messages[locale];
  return [
    `${t.height} × ${t.width} × ${t.depth}: ${variant.dimensions.join(" × ")} mm`,
    variant.centres !== undefined ? `${t.centres}: ${variant.centres} mm` : null,
    variant.resistance !== undefined ? `${t.resistance}: ${variant.resistance} W` : null,
    `${t.thermalPower}: ${variant.thermalPower} W`,
    variant.weight !== undefined ? `${t.weight}: ${variant.weight} kg` : null,
  ].filter(Boolean).join("\n");
}
