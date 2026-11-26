import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { families, familyById, isLocale, locales, messages, products } from "@/lib/content";
import { HomePage, AboutPage, CatalogPage, FamilyPage, InspirationPage, ContactPage, QuotePage, CallToAction } from "@/components/pages";
import { ProductDetail } from "@/components/catalog";
import { getCatalog } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; segments?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export function generateStaticParams() {
  const paths = [[], ["a-propos"], ["produits"], ["inspirations"], ["contact"], ["devis"], ...families.map(f => ["produits", f.id]), ...products.map(p => ["produits", p.handle])];
  return locales.flatMap(locale => paths.map(segments => ({ locale, segments })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, segments = [] } = await params;
  if (!isLocale(locale)) return {};
  const t = messages[locale];
  const path = segments.join("/");
  const family = segments[0] === "produits" && segments.length === 2 ? familyById(segments[1]) : undefined;
  if (family) return { title: `${family.name} · ${family.kind[locale]}`, description: family.summary[locale] };
  const products = await getCatalog();
  const product = segments[0] === "produits" && segments.length === 2 ? products.find(p => p.handle === segments[1]) : null;
  const title = product?.title[locale] ?? ({ "a-propos": t.nav[1], "produits": t.nav[2], "inspirations": t.nav[3], "contact": t.nav[4], "devis": t.quote } as Record<string, string>)[path];
  const description = product?.description[locale] ?? (path === "devis" ? t.quoteIntro : t.heroText);
  return { title: title ?? { absolute: `EDDFA | ${t.heroTitle}` }, description };
}

export default async function Page({ params, searchParams }: Props) {
  const { locale, segments = [] } = await params;
  if (!isLocale(locale)) notFound();
  const products = await getCatalog();
  if (!segments.length) return <HomePage locale={locale} products={products} />;
  const path = segments.join("/");
  if (path === "a-propos") return <AboutPage locale={locale} />;
  if (path === "produits") return <CatalogPage locale={locale} products={products} />;
  if (path === "inspirations") return <InspirationPage locale={locale} />;
  if (path === "contact") return <ContactPage locale={locale} />;
  if (path === "devis") {
    const query = await searchParams;
    return <QuotePage locale={locale} query={{ ref: first(query.ref), gamme: first(query.gamme), qty: first(query.qty), profil: first(query.profil) }} />;
  }
  if (segments.length === 2 && segments[0] === "produits") {
    const family = familyById(segments[1]);
    if (family) return <FamilyPage locale={locale} family={family} products={products} />;
    const product = products.find(p => p.handle === segments[1]);
    if (product) return <><ProductDetail key={product.id} locale={locale} product={product} /><CallToAction locale={locale} /></>;
  }
  notFound();
}
