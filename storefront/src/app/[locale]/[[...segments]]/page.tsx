import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, messages, products } from "@/lib/content";
import { HomePage, AboutPage, CatalogPage, InspirationPage, ContactPage } from "@/components/pages";
import { ProductDetail } from "@/components/catalog";
import { getCatalog } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; segments?: string[] }> };
export function generateStaticParams() {
  const paths = [[], ["a-propos"], ["produits"], ["inspirations"], ["contact"], ...products.map(p => ["produits", p.handle])];
  return locales.flatMap(locale => paths.map(segments => ({ locale, segments })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, segments = [] } = await params;
  if (!isLocale(locale)) return {};
  const t = messages[locale];
  const products = await getCatalog();
  const path = segments.join("/");
  const product = segments[0] === "produits" && segments.length === 2 ? products.find(p => p.handle === segments[1]) : null;
  const title = product?.title[locale] ?? ({ "a-propos": t.nav[1], "produits": t.nav[2], "inspirations": t.nav[3], "contact": t.nav[4] } as Record<string, string>)[path];
  return { title: title ?? { absolute: `EDDFA | ${t.heroTitle}` }, description: product?.description[locale] ?? t.heroText };
}

export default async function Page({ params }: Props) {
  const { locale, segments = [] } = await params;
  if (!isLocale(locale)) notFound();
  const products = await getCatalog();
  if (!segments.length) return <HomePage locale={locale} products={products} />;
  const path = segments.join("/");
  if (path === "a-propos") return <AboutPage locale={locale} products={products} />;
  if (path === "produits") return <CatalogPage locale={locale} products={products} />;
  if (path === "inspirations") return <InspirationPage locale={locale} />;
  if (path === "contact") return <ContactPage locale={locale} />;
  if (segments.length === 2 && segments[0] === "produits") {
    const product = products.find(p => p.handle === segments[1]);
    if (product) return <ProductDetail key={product.id} locale={locale} product={product} />;
  }
  notFound();
}
