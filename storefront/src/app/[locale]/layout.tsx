import { notFound } from "next/navigation";
import { isLocale } from "@/lib/content";
import { SiteShell } from "@/components/site-shell";
import { getCatalog } from "@/lib/catalog-server";
import { isClientPreview, isLocalAdminAvailable } from "@/lib/deployment-policy";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SiteShell locale={locale} products={await getCatalog()} adminAvailable={isClientPreview() || isLocalAdminAvailable()}>{children}</SiteShell>;
}
