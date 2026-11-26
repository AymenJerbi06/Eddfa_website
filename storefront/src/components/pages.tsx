import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { Asterisk, CheckCircle2, ChevronDown, ChevronRight, FileText, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { asset, company, families, messages, pageContentId, whatsappHref, type CatalogProduct, type Locale, type ProductFamily } from "@/lib/content";
import type { QuoteQuery } from "@/lib/quote";
import { Photo } from "./media";
import { PillLink, QuoteLink } from "./site-shell";
import { ProjectCarousel, GalleryGrid } from "./galleries";
import { ArticleGrid, CatalogCard } from "./catalog";
import { InquiryForm } from "./inquiry-form";
import { RangeNav, type RangeLink } from "./range-nav";
import { SpecTable } from "./spec-table";
import { SizingCalculator } from "./sizing-calculator";
import { QuoteBuilder } from "./quote-builder";
import { HistoryTimeline } from "./history-timeline";
import { OtherRanges, RangeDuo } from "./showcase";
import { ScrollStory } from "./scroll-story";
import { HomeGuide } from "./guide";
import { BeforeAfter } from "./compare";
import { DetailSpots } from "./details";
import { Lines } from "./lines";
import { RadiatorMark } from "./radiator-mark";
import { Emblem } from "./emblem";
import { FilmLoop, ScrubFilm, type LoopName } from "./film";
import { HeroNext } from "./hero-next";

// A section's title (short sentences, the second one lighter) and, when it has one, a line under it.
function SectionIntro({ title, text }: { title: string; text?: string }) {
  return <div className="section-intro"><h2 className="title"><Lines text={title} /></h2>{text && <p>{text}</p>}</div>;
}

// The top of the inner pages, the same on every one (the user, 25 November 2026: like the Photos page): a charcoal band
// with the page's title over a Higgsfield film (the range's own room for EDEN and ECLAT, EDDFA's aluminium tubes
// everywhere else) and the breadcrumbs under it, nothing else. The page itself starts on the marble plate under it,
// with its own chip track first when it has one (PageTrack).
type Crumb = { href: string; label: string };
function PageBanner({ locale, title, label, film = "aluminium", trail = [] }: { locale: Locale; title: string; label: string; film?: LoopName; trail?: Crumb[] }) {
  return <section className={`band page-banner${film === "aluminium" ? "" : " range-banner"}`}>
    <FilmLoop name={film} wide className="banner-film" /><div className="banner-shade" aria-hidden="true" />
    <div className="container banner-copy"><h1 className="title"><Lines text={title} /></h1></div>
    <div className="container crumb-row"><nav className="breadcrumbs" aria-label={locale === "ar" ? "مسار الصفحة" : "Fil d’Ariane"}><Link href={`/${locale}`}>{messages[locale].nav[0]}</Link>{trail.map(crumb => <Fragment key={crumb.href}><ChevronRight size={14} className="directional-icon" /><Link href={crumb.href}>{crumb.label}</Link></Fragment>)}<ChevronRight size={14} className="directional-icon" /><span aria-current="page"><bdi>{label}</bdi></span></nav></div>
  </section>;
}

// A page's chip track (the five ranges, or the chapters of « Présentation »), first on the plate under the band.
function PageTrack({ label, links }: { label: string; links: RangeLink[] }) {
  return <div className="page-track"><RangeNav tone="light" label={label} links={links} /></div>;
}

const teamAlt = (locale: Locale) => locale === "fr" ? "L’équipe EDDFA devant son véhicule à Sfax" : "فريق EDDFA أمام سيارته في صفاقس";

// Four key figures from EDDFA's own material, in one still row.
function FactsGrid({ locale }: { locale: Locale }) {
  return <dl className="facts-grid">{messages[locale].facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd><bdi>{fact.value}</bdi></dd></div>)}</dl>;
}

// EDDFA's real team photo, straightened, with its place and name under it.
function TeamFigure({ locale, priority = false }: { locale: Locale; priority?: boolean }) {
  const t = messages[locale];
  return <figure className="about-figure"><div className="about-photo"><Photo src={asset("team-straight")} alt={teamAlt(locale)} sizes="(max-width: 921px) 100vw, 56vw" priority={priority} /></div><figcaption className="about-caption"><span>{t.teamPlace}</span><strong><bdi>{t.teamPlate}</bdi></strong></figcaption></figure>;
}

export function AboutSection({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section id="about-eddfa" className="section plate about-section"><Emblem side="end" /><div className="container about-grid"><TeamFigure locale={locale} /><div className="about-copy"><span className="eyebrow">{t.what}</span><h2 className="title">{t.aboutTitle}</h2><p>{t.aboutText}</p><PillLink href={`/${locale}/a-propos`}>{t.profile}</PillLink></div></div></section>;
}

// Installers and resellers, over the film of EDDFA's aluminium tubes: the same quote page, with the professional box
// already chosen.
function ProBand({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section className="section band pro-section"><FilmLoop name="aluminium" wide className="band-film" /><div className="band-shade" aria-hidden="true" /><div className="container pro-grid">
    <SectionIntro title={t.proTitle} />
    <div className="pro-copy"><p>{t.proText}</p><div className="pro-actions"><QuoteLink locale={locale} query="?profil=pro">{t.proQuote}<ChevronRight size={19} className="directional-icon" /></QuoteLink><a className="pill-button" href={`tel:${company.telephone}`}><Phone size={17} /><span dir="ltr">+216 {company.phone}</span></a></div></div>
  </div></section>;
}

// Five questions answered from EDDFA's own information, folded until opened.
function FaqSection({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section className="section plate faq-section has-film"><FilmLoop name="aluminium-light" wide className="plate-film" /><Emblem side="start" edge="bottom" /><div className="container faq-grid">
    <div className="faq-intro"><h2 className="title">{t.faqTitle}</h2><p>{t.contactText}</p><a className="text-link" href={`tel:${company.telephone}`}><Phone size={16} /><span dir="ltr">+216 {company.phone}</span></a></div>
    <div className="faq-list">{t.faq.map(item => <details key={item.q} className="soft-details"><summary>{item.q}</summary><div className="soft-details-body"><p>{item.a}</p>{item.href && <Link className="text-link accent" href={`/${locale}${item.href}`}><span>{item.cta}</span><ChevronRight size={16} className="directional-icon" /></Link>}</div></details>)}</div>
  </div></section>;
}

// The closer on every page but Contact: one line, how the quote works in three steps, one button, and the bathroom of
// the first section, filmed, whose lights come on and warm the room as the visitor scrolls to it.
export function CallToAction({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section className="band call-to-action"><div className="container cta-grid">
    <div className="cta-copy"><h2 className="title"><Lines text={t.cta} /></h2><p>{t.ctaText}</p>
      <ol className="cta-steps" aria-label={t.stepsLabel}>{t.quoteSteps.map(step => <li key={step.title}>{step.title}</li>)}</ol>
      <QuoteLink locale={locale}>{t.quote}<ChevronRight size={19} className="directional-icon" /></QuoteLink></div>
    <figure className="cta-film"><ScrubFilm name="closer" alt={t.closerAlt} /></figure>
  </div></section>;
}

export function HomePage({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  return <>
    <section className="hero"><Photo src={asset("hero-eden")} alt="" priority sizes="100vw" className="hero-poster" /><div className="hero-shade" /><div className="container hero-content"><h1><span className="hero-brand">EDDFA</span>{t.heroTitle}</h1><p>{t.heroText}</p><div className="hero-actions"><Link href={`/${locale}/contact`} className="pill-button light">{t.contact}</Link><Link href={`/${locale}/produits`} className="pill-button light hero-products">{t.heroProducts}</Link></div></div><HeroNext label={t.what} target="about-eddfa" /></section>
    <AboutSection locale={locale} />
    <ScrollStory locale={locale} />
    <HomeGuide locale={locale} />
    <RangeDuo locale={locale} products={products} />
    <BeforeAfter locale={locale} />
    <DetailSpots locale={locale} />
    <section className="section plate inspiration-section"><Emblem side="end" edge="bottom" /><div className="container"><SectionIntro title={t.inspirationTitle} /><ProjectCarousel locale={locale} /><div className="section-action"><PillLink href={`/${locale}/inspirations`}>{t.allProjects}</PillLink></div></div></section>
    <ProBand locale={locale} />
    <FaqSection locale={locale} />
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
      : <p className="range-soon"><Asterisk size={18} strokeWidth={2.7} aria-hidden="true" /><span>{t.soonTitle}</span><Link className="text-link accent" href={`/${locale}/devis?gamme=${id}`}><span>{t.quote}</span><ChevronRight size={16} className="directional-icon" /></Link></p>}
  </section>;
}

export function CatalogPage({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  const bundles = products.filter(product => product.category === "bundle");
  const withArticles = families.filter(family => products.some(product => product.category === family.id));
  const waiting = families.filter(family => !withArticles.includes(family));
  return <><PageBanner locale={locale} title={t.catalogTitle} label={t.nav[2]} />
    <section className="section plate page-section has-banner catalog-section"><Emblem side="end" /><div id={pageContentId} className="container page-content-target">
      <div className="page-heading"><p>{t.catalogText}</p><PageTrack label={t.rangesNav} links={families.map(family => ({ href: withArticles.includes(family) ? `#${family.id}` : `/${locale}/produits/${family.id}`, label: family.name, current: false }))} /></div>
      {withArticles.map(family => <RangeGroup key={family.id} locale={locale} id={family.id} name={family.name} kind={family.kind[locale]} summary={family.summary[locale]} items={products.filter(product => product.category === family.id)} rangeHref={`/${locale}/produits/${family.id}`} />)}
      {bundles.length > 0 && <RangeGroup locale={locale} id="packs" name={t.bundle} kind={t.composition} items={bundles} />}
      {waiting.length > 0 && <OtherRanges locale={locale} title={t.othersTitle} ranges={waiting} />}
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
    <PageBanner locale={locale} title={`${family.name}\n${family.kind[locale]}`} label={family.name} film={family.id === "eden" || family.id === "eclat" ? family.id : "aluminium"} trail={[{ href: `/${locale}/produits`, label: t.nav[2] }]} />
    <section className="section plate page-section has-banner"><Emblem side="end" /><div id={pageContentId} className="container page-content-target">
      <PageTrack label={t.rangesNav} links={families.map(item => ({ href: `/${locale}/produits/${item.id}`, label: item.name, current: item.id === family.id }))} />
      <div className="family-intro"><div><h2 className="title">{family.summary[locale]}</h2>{family.intro.map(paragraph => <p key={paragraph.fr}>{paragraph[locale]}</p>)}</div>
      <div className="family-aside">
        {family.highlights.length > 0 && <ul className="highlight-list">{family.highlights.map(item => <li key={item.fr}><CheckCircle2 size={17} />{item[locale]}</li>)}</ul>}
        <div className="family-actions"><QuoteLink locale={locale} query={quoteQuery}>{t.quote}<ChevronRight size={19} className="directional-icon" /></QuoteLink>{family.sizing && items.length > 0 && <a className="pill-button" href="#choisir">{t.chooseModel}<ChevronDown size={18} /></a>}</div>
      </div></div>
    </div></section>
    {items.length ? <>
      <section className="section plate family-articles"><div className="container"><SectionIntro title={`${t.articlesOf} ${family.name}`} /><ArticleGrid locale={locale} items={items} scale={Boolean(family.sizing)} />
        {rows.length > 0 && <details className="soft-details compare-details"><summary>{t.compareTitle}</summary><div className="soft-details-body"><SpecTable locale={locale} rows={rows} linkModels caption={`${t.compareTitle} · ${family.name}`} /><p className="specification-note">{t.productNote}</p></div></details>}
      </div></section>
      {family.sizing && <SizingCalculator locale={locale} family={family} />}
    </> : <section className="section plate family-soon"><div className="container soon-card"><RadiatorMark className="soon-mark" /><h2 className="title">{t.soonTitle}</h2><p>{t.soonText}</p><div className="family-actions"><QuoteLink locale={locale} query={quoteQuery}>{t.quote}<ChevronRight size={19} className="directional-icon" /></QuoteLink><a className="pill-button" href={`tel:${company.telephone}`}><Phone size={17} />{t.callUs}</a></div></div></section>}
    <CallToAction locale={locale} />
  </>;
}

export function InspirationPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.inspirationTitle} label={t.nav[3]} /><section className="section plate page-section has-banner"><Emblem side="start" edge="bottom" /><div id={pageContentId} className="container page-content-target"><GalleryGrid locale={locale} /></div></section><CallToAction locale={locale} /></>;
}

// "Présentation de la société", in the client's five points: activity, history, products, general information,
// premises and location. A chip track at the top of the first plate leads to each one.
const chapterIds = ["activite", "historique", "produits", "informations", "locaux"] as const;

function PresentationSection({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [lead, ...rest] = t.presentation;
  return <section id="activite" className="section plate about-section presentation-section"><Emblem side="end" /><div id={pageContentId} className="container page-content-target"><PageTrack label={t.chaptersLabel} links={chapterIds.map((id, index) => ({ href: `#${id}`, label: t.chapters[index], current: false }))} /><div className="about-grid"><TeamFigure locale={locale} priority /><div className="about-copy">
    <h2 className="title">{t.presentationTitle}</h2><p>{lead}</p>
    <details className="read-more"><summary><span className="more">{t.readMore}</span><span className="less">{t.readLess}</span><ChevronDown size={16} /></summary>{rest.map(paragraph => <p key={paragraph.slice(0, 32)}>{paragraph}</p>)}</details>
    <p className="slogan">{t.slogan}</p>
  </div></div><FactsGrid locale={locale} /></div></section>;
}

function ProductsChapter({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section id="produits" className="section plate products-chapter has-film"><FilmLoop name="aluminium-light" wide className="plate-film" /><Emblem side="end" edge="bottom" /><div className="container"><SectionIntro title={t.productsTitle} />
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
  return <section className="section plate info-section"><div className="container info-grid">
    <div id="informations"><h2 className="title">{t.infoTitle}</h2><dl className="info-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
    <div id="locaux"><h2 className="title">{t.premisesTitle}</h2><address className="premises-address"><MapPin size={18} /><bdi>{company.address}</bdi></address>
      <div className="contact-map"><iframe src={company.mapEmbedUrl} title={locale === "fr" ? "Localisation de l’usine EDDFA à Sfax sur Google Maps" : "موقع مصنع EDDFA في صفاقس على خرائط Google"} width="600" height="300" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
      <a className="text-link accent" href={company.directionsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16} /><span>{t.directions}</span></a></div>
  </div></section>;
}

export function AboutPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.aboutPageTitle} label={t.nav[1]} />
    <PresentationSection locale={locale} />
    <HistoryTimeline locale={locale} />
    <ProductsChapter locale={locale} />
    <InfoSection locale={locale} />
    <CallToAction locale={locale} /></>;
}

// Contact: the ways to reach EDDFA as large buttons, the factory on the map, and the form. The page ends there: the
// quote band would only repeat what the form already does.
export function ContactPage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const whatsapp = whatsappHref();
  return <><PageBanner locale={locale} title={t.contactTitle} label={t.nav[4]} /><section className="section plate page-section has-banner contact-section has-film"><FilmLoop name="aluminium-light" wide className="plate-film" /><Emblem side="end" /><div id={pageContentId} className="container page-content-target"><div className="page-heading"><p>{t.contactText}</p></div><div className="contact-grid">
    <div className="contact-details">
      <div className="contact-chips">
        <a className="contact-chip" href={`tel:${company.telephone}`}><Phone size={19} /><span dir="ltr">+216 {company.phone}</span></a>
        <a className="contact-chip" href={`mailto:${company.email}`}><Mail size={19} /><span>{company.email}</span></a>
        {whatsapp && <a className="contact-chip" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} /><span>{t.whatsapp}</span></a>}
      </div>
      <address className="premises-address"><MapPin size={18} /><bdi>{company.address}</bdi></address>
      <div className="contact-map"><iframe src={company.mapEmbedUrl} title={locale === "fr" ? "Localisation de l’usine EDDFA à Sfax sur Google Maps" : "موقع مصنع EDDFA في صفاقس على خرائط Google"} width="600" height="300" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
      <a className="text-link accent" href={company.directionsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16} /><span>{t.directions}</span></a>
    </div>
    <div className="contact-form-area"><h2>{t.formTitle}</h2><InquiryForm locale={locale} /></div>
  </div></div></section></>;
}

export function QuotePage({ locale, query }: { locale: Locale; query: QuoteQuery }) {
  const t = messages[locale];
  return <><PageBanner locale={locale} title={t.quotePageTitle} label={t.nav[5]} /><section className="section plate page-section has-banner quote-section"><div id={pageContentId} className="container page-content-target"><div className="page-heading"><p>{t.quoteIntro}</p></div><QuoteBuilder locale={locale} query={query} /></div></section></>;
}
