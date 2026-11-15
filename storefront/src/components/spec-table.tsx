import Link from "next/link";
import { messages, type CatalogProduct, type Locale, type ProductVariant } from "@/lib/content";

// Technical sheet for every version: one row per version, columns only for values EDDFA supplied.
export function SpecTable({ locale, rows, linkModels = false, caption }: { locale: Locale; rows: { product: CatalogProduct; variant: ProductVariant }[]; linkModels?: boolean; caption: string }) {
  const t = messages[locale];
  const has = (pick: (variant: ProductVariant) => unknown) => rows.some(({ variant }) => pick(variant) !== undefined && pick(variant) !== null);
  const showModel = new Set(rows.map(row => row.product.id)).size > 1;
  const columns: { label: string; value: (variant: ProductVariant) => string }[] = [
    { label: t.dimensions, value: variant => `${variant.dimensions.join(" × ")} mm` },
    ...(has(variant => variant.centres) ? [{ label: t.centres, value: (variant: ProductVariant) => variant.centres !== undefined ? `${variant.centres} mm` : "–" }] : []),
    ...(has(variant => variant.resistance) ? [{ label: t.resistance, value: (variant: ProductVariant) => variant.resistance !== undefined ? `${variant.resistance} W` : "–" }] : []),
    ...(has(variant => variant.thermalPower || undefined) ? [{ label: t.thermalPower, value: (variant: ProductVariant) => variant.thermalPower > 0 ? `${variant.thermalPower} W` : "–" }] : []),
    ...(has(variant => variant.weight) ? [{ label: t.weight, value: (variant: ProductVariant) => variant.weight !== undefined ? `${variant.weight} kg` : "–" }] : []),
  ];
  return <div className="spec-table-wrap" role="region" aria-label={caption} tabIndex={0}><table className="spec-table">
    <caption className="sr-only">{caption}</caption>
    <thead><tr>{showModel && <th scope="col">{t.product}</th>}{columns.map(column => <th key={column.label} scope="col">{column.label}</th>)}</tr></thead>
    <tbody>{rows.map(({ product, variant }) => <tr key={variant.id}>
      {showModel && <th scope="row">{linkModels ? <Link href={`/${locale}/produits/${product.handle}`}><bdi>{product.title[locale]}</bdi></Link> : <bdi>{product.title[locale]}</bdi>}</th>}
      {columns.map(column => <td key={column.label} dir="ltr">{column.value(variant)}</td>)}
    </tr>)}</tbody>
  </table></div>;
}
