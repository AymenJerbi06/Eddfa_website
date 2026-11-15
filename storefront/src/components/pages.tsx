import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, Asterisk, CheckCircle2, ChevronDown, ChevronRight, FileText, Mail, MapPin, Phone } from "lucide-react";
import { asset, company, families, messages, pageContentId, type CatalogProduct, type Locale, type ProductFamily } from "@/lib/content";
import type { QuoteQuery } from "@/lib/quote";
import { Photo } from "./media";
import { PillLink, QuoteLink } from "./site-shell";
import { ProjectCarousel, GalleryGrid } from "./galleries";
import { ArticleGrid, CatalogCard } from "./catalog";
import { InquiryForm } from "./inquiry-form";
import { Reveal } from "./reference-interactions";
import { RangeNav } from "./range-nav";
import { SpecTable } from "./spec-table";
import { SizingCalculator } from "./sizing-calculator";
import { QuoteBuilder } from "./quote-builder";
import { HistoryTimeline } from "./history-timeline";
import { CountUp } from "./motion";
import { Exigences, RangeShowcase } from "./showcase";

function SectionHeading({ label, title }: { label: string; title: string }) {
  return <div className="section-heading"><span className="eyebrow">{label}</span><h2>{title}</h2></div>;
}

// The banner of the inner pages, then one row with the breadcrumbs and, when a page has one, its own chip track.
type Crumb = { href: string; label: string };
function PageBanner({ locale, title, label, image = asset("scene-eden-80-wide"), trail = [], aside }: { locale: Locale; title: string; label: string; image?: string | null; trail?: Crumb[]; aside?: ReactNode }) {
  return <><section className={`about-banner${image ? "" : " plain-banner"}`}>{image && <Photo src={image} alt="" priority sizes="100vw" />}<div className="hero-shade" /><div className="container"><h1>{title.split("\n").map(line => <span key={line}>{line}</span>)}</h1></div></section>
    <div className={`container crumb-row${aside ? " has-aside" : ""}`}><nav className="breadcrumbs" aria-label={locale === "ar" ? "مسار الصفحة" : "Fil d’Ariane"}><Link href={`/${locale}`}>{messages[locale].nav[0]}</Link>{trail.map(crumb => <Fragment key={crumb.href}><ChevronRight size={14} className="directional-icon" /><Link href={crumb.href}>{crumb.label}</Link></Fragment>)}<ChevronRight size={14} className="directional-icon" /><span aria-current="page"><bdi>{label}</bdi></span></nav>{aside}</div></>;
}

const teamAlt = (locale: Locale) => locale === "fr" ? "L’équipe EDDFA devant son véhicule à Sfax" : "فريق EDDFA أمام سيارته في صفاقس";

// Four key figures from EDDFA's own material; the numbers count up once, the first time they appear.
function FactsGrid({ locale }: { locale: Locale }) {
  return <dl className="facts-grid">{messages[locale].facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd className="fact-value"><CountUp value={fact.value} /></dd></div>)}</dl>;
}

// Four key facts from EDDFA's own material, gliding past under the first section. The copies only fill the strip;
// screen readers get the list once, and the strip stands still for visitors who ask for reduced motion.
function FactsStrip({ locale }: { locale: Locale }) {
  const row = (copy: number) => <ul key={copy} aria-hidden={copy > 0 || undefined}>{messages[locale].facts.map(fact => <li key={fact.label}><Asterisk size={18} strokeWidth={2.7} aria-hidden="true" /><strong><bdi>{fact.value}</bdi></strong><span>{fact.label}</span></li>)}</ul>;
  return <div className="facts-marquee"><div className="marquee-track">{[0, 1, 2, 3].map(row)}</div></div>;
}

// EDDFA's real team photo, set on a brushed-aluminium plate with its caption on dark glass, like the site's other photos.
function TeamFigure({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <figure className="about-figure"><div className="about-photo"><Photo src={asset("team-straight")} alt={teamAlt(locale)} sizes="(max-width: 921px) 100vw, 56vw" /></div><figcaption className="about-plate"><span>{t.teamPlace}</span><strong><bdi>{t.teamPlate}</bdi></strong></figcaption></figure>;
}

export function AboutSection({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section id="about-eddfa" className="section about-section"><div className="container about-grid"><TeamFigure locale={locale} /><div className="about-copy"><span className="eyebrow">{t.what}</span><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p><PillLink href={`/${locale}/a-propos`}>{t.profile}</PillLink></div></div></section>;
}

// Five questions answered from EDDFA's own information, folded until opened.
function FaqSection({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section className="section faq-section"><div className="container faq-grid">
    <div className="faq-intro"><span className="eyebrow">{t.faqEyebrow}</span><h2>{t.faqTitle}</h2><p>{t.contactText}</p><a className="text-link" href={`tel:${company.telephone}`}><Phone size={16} /><span dir="ltr">+216 {company.phone}</span></a></div>
    <div className="faq-list">{t.faq.map(item => <details key={item.q} className="soft-details"><summary>{item.q}</summary><div className="soft-details-body"><p>{item.a}</p>{item.href && <Link className="text-link gold" href={`/${locale}${item.href}`}><span>{item.cta}</span><ChevronRight size={16} className="directional-icon" /></Link>}</div></details>)}</div>
  </div></section>;
}

// The closer on every page: one line, how the quote works in three steps, one button, and the black EDEN 120 in an
// evening bathroom.
export function CallToAction({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section className="call-to-action"><div className="container cta-grid">
    <div className="cta-copy"><h2>{t.cta.split("\n").map(line => <span key={line}>{line}</span>)}</h2><p>{t.ctaText}</p>
      <ol className="cta-steps" aria-label={t.stepsLabel}>{t.quoteSteps.map(step => <li key={step.title}>{step.title}</li>)}</ol>
      <QuoteLink locale={locale}>{t.quote}<ChevronRight size={19} className="directional-icon" /></QuoteLink></div>
    <figure className="cta-photo"><div className="cta-photo-frame"><Photo src={asset("closer-eden")} alt={t.closerAlt} sizes="(max-width: 921px) 100vw, 40vw" /></div></figure>
  </div></section>;
}

export function HomePage({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  return <>
    <section className="hero"><Photo src={asset("eden-cover")} alt="" priority sizes="100vw" className="hero-poster" /><div className="hero-shade" /><div className="container hero-content"><h1><span className="hero-brand">EDDFA</span>{t.heroTitle}</h1><p>{t.heroText}</p><Link href={`/${locale}/contact`} className="pill-button light">{t.contact}</Link></div><a className="hero-next" href="#about-eddfa"><span>{t.what}</span><ArrowDown size={16} /></a></section>
    <FactsStrip locale={locale} />
    <Reveal><AboutSection locale={locale} /></Reveal>
    <Reveal><section className="section showcase-section"><div className="container"><SectionHeading label={t.startEyebrow} title={t.startTitle} /><RangeShowcase locale={locale} products={products} /></div></section></Reveal>
    <Reveal><Exigences locale={locale} /></Reveal>
    <Reveal><section className="section inspiration-section"><div className="container"><SectionHeading label={t.projects} title={t.inspirationTitle} /><ProjectCarousel locale={locale} /><div className="section-action"><PillLink href={`/${locale}/inspirations`}>{t.allProjects}</PillLink></div></div></section></Reveal>
    <Reveal><FaqSection locale={locale} /></Reveal>
    <CallToAction locale={locale} />
  </>;
}

// One list grouped by range, one line per range, its articles underneath.
function RangeGroup({ locale, id, name, kind, summary, items, rangeHref }: { locale: Locale; id: string; name: string; kind: string; summary?: string; items: CatalogProduct[]; rangeHref?: string }) {
  const t = messages[locale];
  return <section id={id} className="range-group" aria-labelledby={`group-${id}`}>
    <div className="range-group-head"><div><span className="eyebrow">{kind}</span><h2 id={`group-${id}`}><bdi>{name}</bdi></h2>{summary && <p>{summary}</p>}</div>
      {rangeHref && <Link className="text-link" href={rangeHref}><span>{t.seeRange}</span><ChevronRight size={17} className="directional-icon" /></Link>}</div>
    {items.length ? <div className="catalog-grid">{items.map(product => <CatalogCard key={product.id} locale={locale} product={product} level="h3" />)}</div>
      : <p className="range-soon"><Asterisk size={18} strokeWidth={2.7} aria-hidden="true" /><span>{t.soonTitle}</span><Link className="text-link gold" href={`/${locale}/devis?gamme=${id}`}><span>{t.quote}</span><ChevronRight size={16} className="directional-icon" /></Link></p>}
  </section>;
}

export function CatalogPage({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  const bundles = products.filter(product => product.category === "bundle");
  return <><PageBanner locale={locale} title={t.catalogTitle} label={t.nav[2]} aside={<RangeNav tone="light" label={t.rangesNav} links={families.map(family => ({ href: `#${family.id}`, label: family.name, current: false }))} />} />
    <section className="section page-section has-banner catalog-section"><div id={pageContentId} className="container page-content-target">
      <div className="page-heading"><p>{t.catalogText}</p></div>
      {families.map(family => <RangeGroup key={family.id} locale={locale} id={family.id} name={family.name} kind={family.kind[locale]} summary={family.summary[locale]} items={products.filter(product => product.category === family.id)} rangeHref={`/${locale}/produits/${family.id}`} />)}
      {bundles.length > 0 && <RangeGroup locale={locale} id="packs" name={t.bundle} kind={t.composition} items={bundles} />}
    </div></section>
    <CallToAction locale={locale} /></>;
}

// One page per range: a short intro, its articles, the sizing tool for towel radiators, and the versions on demand.
export function FamilyPage({ locale, family, products }: { locale: Locale; family: ProductFamily; products: CatalogProduct[] }) {
  const t = messages[locale];
  const items = products.filter(product => product.category === family.id);
  const rows = items.flatMap(product => product.variants.filter(variant => variant.dimensions[0] > 0).map(variant => ({ product, variant })));
  const quoteQuery = items.length ? "" : `?gamme=${family.id}`;
  return <>
    <PageBanner locale={locale} title={`${family.name}\n${family.kind[locale]}`} label={family.name} image={family.image ?? null} trail={[{ href: `/${locale}/produits`, label: t.nav[2] }]}
      aside={<RangeNav tone="light" label={t.rangesNav} links={families.map(item => ({ href: `/${locale}/produits/${item.id}`, label: item.name, current: item.id === family.id }))} />} />
    <section className="section page-section has-banner"><div id={pageContentId} className="container page-content-target family-intro">
      <div><span className="eyebrow">{family.kind[locale]}</span><h2>{family.summary[locale]}</h2>{family.intro.map(paragraph => <p key={paragraph.fr}>{paragraph[locale]}</p>)}</div>
      <div className="family-aside">
        {family.highlights.length > 0 && <ul className="highlight-list">{family.highlights.map(item => <li key={item.fr}><CheckCircle2 size={17} />{item[locale]}</li>)}</ul>}
        <div className="family-actions"><QuoteLink locale={locale} query={quoteQuery}>{t.quote}<ChevronRight size={19} className="directional-icon" /></QuoteLink>{family.sizing && items.length > 0 && <a className="pill-button" href="#choisir">{t.chooseModel}<ChevronDown size={18} /></a>}</div>
      </div>
    </div></section>
    {items.length ? <>
      <section className="section family-articles"><div className="container"><SectionHeading label={family.kind[locale]} title={`${t.articlesOf} ${family.name}`} /><ArticleGrid locale={locale} items={items} scale={Boolean(family.sizing)} />
        {rows.length > 0 && <details className="soft-details compare-details"><summary>{t.compareTitle}</summary><div className="soft-details-body"><SpecTable locale={locale} rows={rows} linkModels caption={`${t.compareTitle} · ${family.name}`} /><p className="specification-note">{t.productNote}</p></div></details>}
      </div></section>
      {family.sizing && <SizingCalculator locale={locale} family={family} />}
    </> : <section className="section family-soon"><div className="container soon-card"><Asterisk size={34} strokeWidth={2.7} /><h2>{t.soonTitle}</h2><p>{t.soonText}</p><div className="family-actions"><QuoteLink locale={locale} query={quoteQuery}>{t.quote}<ChevronRight size={19} className="directional-icon" /></QuoteLink><a className="pill-button" href={`tel:${company.telephone}`}><Phone size={17} />{t.callUs}</a></div></div></section>}
    <CallToAction locale={locale} />
  </>;
}

export function InspirationPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.inspirationTitle} label={t.nav[3]} image={asset("scene-eclat-confort-wide")} /><section className="section page-section has-banner"><div id={pageContentId} className="container page-content-target"><GalleryGrid locale={locale} /></div></section><CallToAction locale={locale} /></>;
}

// "Présentation de la société", in the client's five points: activity, history, products, general information,
// premises and location. A chip track at the top leads to each one.
const chapterIds = ["activite", "historique", "produits", "informations", "locaux"] as const;

function PresentationSection({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [lead, ...rest] = t.presentation;
  return <section id="activite" className="section about-section presentation-section"><div id={pageContentId} className="container page-content-target"><div className="about-grid"><TeamFigure locale={locale} /><div className="about-copy">
    <span className="eyebrow">{t.presentationEyebrow}</span><h2>{t.presentationTitle}</h2><p>{lead}</p>
    <details className="read-more"><summary><span className="more">{t.readMore}</span><span className="less">{t.readLess}</span><ChevronDown size={16} /></summary>{rest.map(paragraph => <p key={paragraph.slice(0, 32)}>{paragraph}</p>)}</details>
    <p className="slogan">{t.slogan}</p>
  </div></div><FactsGrid locale={locale} /></div></section>;
}

function ProductsChapter({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section id="produits" className="section products-chapter"><div className="container"><SectionHeading label={t.productsEyebrow} title={t.productsTitle} />
    <ul className="range-index">{families.map(family => <li key={family.id}><Link href={`/${locale}/produits/${family.id}`}><bdi>{family.name}</bdi><span>{family.kind[locale]}</span><ChevronRight size={18} className="directional-icon" /></Link></li>)}</ul>
  </div></section>;
}

function InfoSection({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const rows: [string, ReactNode][] = [
    [t.info.legalName, <bdi key="name">EDDFA · {company.legalName}</bdi>],
    [t.info.activity, t.activityValue],
    [t.info.market, t.marketValue],
    [t.info.phone, <a key="phone" href={`tel:${company.telephone}`} dir="ltr">+216 {company.phone}</a>],
    [t.info.email, <a key="email" href={`mailto:${company.email}`}>{company.email}</a>],
    [t.info.social, <span key="social" className="social-links">{company.social.map(network => <a key={network.name} href={network.url} target="_blank" rel="noopener noreferrer">{network.name}</a>)}</span>],
    [t.documents, <a key="certificate" className="text-link" href="/eddfa/certificat-veritas-en442.pdf" target="_blank" rel="noopener noreferrer"><FileText size={16} /><span>{t.certificate}</span></a>],
  ];
  return <section className="section info-section"><div className="container info-grid">
    <div id="informations"><span className="eyebrow">{t.infoEyebrow}</span><h2>{t.infoTitle}</h2><dl className="info-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
    <div id="locaux"><span className="eyebrow">{t.premisesEyebrow}</span><h2>{t.premisesTitle}</h2><address className="premises-address"><MapPin size={18} /><bdi>{company.address}</bdi></address>
      <div className="contact-map"><iframe src={company.mapEmbedUrl} title={locale === "fr" ? "Localisation de l’usine EDDFA à Sfax sur Google Maps" : "موقع مصنع EDDFA في صفاقس على خرائط Google"} width="600" height="300" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
      <a className="text-link gold" href={company.directionsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16} /><span>{t.directions}</span></a></div>
  </div></section>;
}

export function AboutPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.aboutPageTitle} label={t.nav[1]} aside={<RangeNav tone="light" label={t.chaptersLabel} links={chapterIds.map((id, index) => ({ href: `#${id}`, label: t.chapters[index], current: false }))} />} />
    <PresentationSection locale={locale} />
    <HistoryTimeline locale={locale} />
    <ProductsChapter locale={locale} />
    <InfoSection locale={locale} />
    <CallToAction locale={locale} /></>;
}

export function ContactPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.contactTitle} label={t.nav[4]} /><section className="section page-section has-banner contact-section"><div id={pageContentId} className="container page-content-target"><div className="page-heading"><p>{t.contactText}</p></div><div className="contact-grid"><div className="contact-details"><h2>EDDFA</h2><a href={`tel:${company.telephone}`}><Phone size={19} /><span dir="ltr">+216 {company.phone}</span></a><a href={`mailto:${company.email}`}><Mail size={19} /><span>{company.email}</span></a><div><MapPin size={21} /><address>{company.address}</address></div><div className="contact-map"><iframe src={company.mapEmbedUrl} title={locale === "fr" ? "Localisation de l’usine EDDFA à Sfax sur Google Maps" : "موقع مصنع EDDFA في صفاقس على خرائط Google"} width="600" height="300" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div></div><div className="contact-form-area"><h2>{t.formTitle}</h2><InquiryForm locale={locale} /></div></div></div></section><CallToAction locale={locale} /></>;
}

export function QuotePage({ locale, query }: { locale: Locale; query: QuoteQuery }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.quotePageTitle} label={t.nav[5]} /><section className="section page-section has-banner quote-section"><div id={pageContentId} className="container page-content-target"><div className="page-heading"><p>{t.quoteIntro}</p></div><QuoteBuilder locale={locale} query={query} /></div></section></>;
}
