import Link from "next/link";
import { ArrowDown, Asterisk, CheckCircle2, ChevronRight, FileText, Factory, Mail, MapPin, MessagesSquare, Phone, ShieldCheck, Wrench } from "lucide-react";
import { asset, company, messages, pageContentId, type CatalogProduct, type Locale } from "@/lib/content";
import { Photo } from "./media";
import { PillLink, QuoteButton } from "./site-shell";
import { ProjectCarousel, UniverseCarousel, GalleryGrid } from "./galleries";
import { Catalog } from "./catalog";
import { InquiryForm } from "./inquiry-form";
import { CompanyValues, Reveal } from "./reference-interactions";

function SectionHeading({ label, title }: { label: string; title: string }) {
  return <div className="section-heading"><span className="eyebrow">{label}</span><h2>{title}</h2></div>;
}

function PageBanner({ locale, title, label, image = asset("eden-cover") }: { locale: Locale; title: string; label: string; image?: string }) {
  return <><section className="about-banner"><Photo src={image} alt="" priority sizes="100vw" /><div className="hero-shade" /><div className="container"><h1>{title.split("\n").map(line => <span key={line}>{line}</span>)}</h1></div></section>
    <nav className="container breadcrumbs" aria-label={locale === "ar" ? "مسار الصفحة" : "Fil d’Ariane"}><Link href={`/${locale}`}>{messages[locale].nav[0]}</Link><ChevronRight size={14} className="directional-icon" /><span aria-current="page">{label}</span></nav></>;
}

function ProductGrid({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  return <div className="product-mosaic">{products.map(p => <Link key={p.id} className="product-tile" href={`/${locale}/produits/${p.handle}`} aria-label={p.title[locale]}><Photo src={p.image} alt={p.title[locale]} /><span className="tile-caption"><strong><bdi>{p.title[locale]}</bdi></strong><span className="tile-summary">{p.description[locale]}</span><ChevronRight size={24} className="directional-icon" /></span></Link>)}</div>;
}

export function AboutSection({ locale, contentAnchor = false }: { locale: Locale; contentAnchor?: boolean }) {
  const t = messages[locale];
  return <section id="about-eddfa" className="section about-section"><div id={contentAnchor ? pageContentId : undefined} className={`container about-grid${contentAnchor ? " page-content-target" : ""}`}><div className="about-photo"><Photo src={asset("team")} alt={locale === "fr" ? "L’équipe EDDFA devant son véhicule à Sfax" : "فريق EDDFA أمام سيارته في صفاقس"} /></div><div className="about-copy"><span className="eyebrow">{t.what}</span><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p><ul className="service-list">{t.services.map(service => <li key={service}><CheckCircle2 size={16} />{service}</li>)}</ul><PillLink href={`/${locale}/a-propos`}>{t.profile}</PillLink></div></div></section>;
}

export function Commitment({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section className="section commitment"><div className="container commitment-grid"><div><span className="eyebrow">{t.why}</span><h2>{t.commitment}</h2><div className="principles">{t.principles.map(p => <article key={p.title}><Asterisk size={34} strokeWidth={2.7} /><h3>{p.title}</h3><p>{p.text}</p></article>)}</div></div><div className="commitment-photo"><Photo src={asset("eclat-cover")} alt={locale === "fr" ? "Sèche-serviettes ECLAT noir dans une salle de bain" : "مجفف مناشف ECLAT أسود في الحمام"} /></div></div></section>;
}

export function CallToAction({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section className="call-to-action"><Photo src={asset("gallery-005")} alt="" sizes="100vw" /><div className="cta-shade" /><div className="container cta-copy"><h2>{t.cta.split("\n").map(line => <span key={line}>{line}</span>)}</h2><p>{t.ctaText}</p><QuoteButton>{t.quote}</QuoteButton></div></section>;
}

export function HomePage({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  const benefits = [Factory, Wrench, MessagesSquare, ShieldCheck];
  return <>
    <section className="hero"><Photo src={asset("eden-cover")} alt="" priority sizes="100vw" className="hero-poster" /><div className="hero-shade" /><div className="container hero-content"><h1><span className="hero-brand">EDDFA</span>{t.heroTitle}</h1><p>{t.heroText}</p><Link href={`/${locale}/contact`} className="pill-button light">{t.contact}</Link></div><a className="hero-next" href="#about-eddfa"><span>{t.what}</span><ArrowDown size={16} /></a></section>
    <Reveal><AboutSection locale={locale} /></Reveal>
    <Reveal><section className="section product-section"><div className="container"><SectionHeading label={t.productsEyebrow} title={t.productsTitle} /><ProductGrid locale={locale} products={products} /><div className="section-action"><PillLink href={`/${locale}/produits`}>{t.allProducts}</PillLink></div></div></section></Reveal>
    <Reveal><Commitment locale={locale} /></Reveal>
    <Reveal><section className="section inspiration-section"><div className="container"><SectionHeading label={t.projects} title={t.inspirationTitle} /><ProjectCarousel locale={locale} /><div className="section-action"><PillLink href={`/${locale}/inspirations`}>{t.allProjects}</PillLink></div></div></section></Reveal>
    <Reveal><section className="section universes-section"><div className="container"><SectionHeading label={t.collections} title={t.collectionsTitle} /><UniverseCarousel locale={locale} /></div></section></Reveal>
    <Reveal><section className="section trust-section"><div className="container"><div className="trust-heading eyebrow">{t.trust}</div><div className="benefits-grid">{t.benefits.map((b, index) => { const Icon = benefits[index]; return <article key={b.title}><span className="benefit-icon"><Icon size={22} /></span><h3>{b.title}</h3><p>{b.text}</p></article>; })}</div></div></section></Reveal>
    <CallToAction locale={locale} />
  </>;
}

export function CatalogPage({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.catalogTitle} label={t.nav[2]} /><section className="section page-section has-banner"><div id={pageContentId} className="container page-content-target"><div className="page-heading"><p>{t.catalogText}</p></div><Catalog locale={locale} products={products} /></div></section><CallToAction locale={locale} /></>;
}

export function InspirationPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.inspirationTitle} label={t.nav[3]} image={asset("eclat-cover")} /><section className="section page-section has-banner"><div id={pageContentId} className="container page-content-target"><GalleryGrid locale={locale} /></div></section><CallToAction locale={locale} /></>;
}

export function AboutPage({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.aboutPageTitle} label={t.nav[1]} /><AboutSection locale={locale} contentAnchor /><CompanyValues locale={locale} /><section className="section"><div className="container"><SectionHeading label={t.productsEyebrow} title={t.productsTitle} /><ProductGrid locale={locale} products={products} /></div></section><section className="section"><div className="container certificate-section"><div className="certificate-badge"><Photo src={asset("en442")} alt="EN 442" sizes="240px" /></div><div><h2>{t.certificate}</h2><p>{t.certificateText}</p><a className="text-button" href="/eddfa/certificat-veritas-en442.pdf" target="_blank" rel="noopener noreferrer"><FileText size={18} />{t.certificateLink}</a></div></div></section><CallToAction locale={locale} /></>;
}

export function ContactPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.contactTitle} label={t.nav[4]} /><section className="section page-section has-banner contact-section"><div id={pageContentId} className="container page-content-target"><div className="page-heading"><p>{t.contactText}</p></div><div className="contact-grid"><div className="contact-details"><h2>EDDFA</h2><a href={`tel:${company.telephone}`}><Phone size={19} /><span dir="ltr">+216 {company.phone}</span></a><a href={`mailto:${company.email}`}><Mail size={19} /><span>{company.email}</span></a><div><MapPin size={21} /><address>{company.address}</address></div><div className="contact-map"><iframe src={company.mapEmbedUrl} title={locale === "fr" ? "Localisation de l’usine EDDFA à Sfax sur Google Maps" : "موقع مصنع EDDFA في صفاقس على خرائط Google"} width="600" height="300" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div></div><div className="contact-form-area"><h2>{t.formTitle}</h2><InquiryForm locale={locale} /></div></div></div></section><CallToAction locale={locale} /></>;
}
