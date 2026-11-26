"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, ChevronDown, ChevronRight, ClipboardList, Globe2, Mail, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { company, families, messages, navigationHref, navPaths, whatsappHref, type CatalogProduct, type Locale } from "@/lib/content";
import { CatalogContext } from "./catalog-context";
import { switchLocalePath } from "@/lib/inquiry";
import { usePageArrival } from "./page-arrival";
import { Emblem } from "./emblem";
import { BasketCount } from "./basket";
import { EddfaLogo } from "./logo";

const quoteIndex = navPaths.indexOf("/devis");

// Every quote action leads to the "Obtenir un devis" page, optionally with an article already ticked.
export function QuoteLink({ locale, children, className = "pill-button primary", query = "" }: { locale: Locale; children: React.ReactNode; className?: string; query?: string }) {
  return <Link href={`/${locale}/devis${query}`} className={className}>{children}</Link>;
}

// The logo, drawn (components/logo.tsx). In the header its radiator warms up once each time a page arrives, after the
// curtain has lifted, and again whenever the pointer rests on it.
function Brand({ locale, dark = false, heatDelay }: { locale: Locale; dark?: boolean; heatDelay?: string }) {
  return <Link href={`/${locale}`} className={`brand${dark ? " brand-dark" : ""}`} aria-label="EDDFA"><span><EddfaLogo className="brand-logo" style={heatDelay ? { "--heat-delay": heatDelay } as React.CSSProperties : undefined} /><small>{messages[locale].tagline}</small></span></Link>;
}

// The curtain between pages, with the logo built on it, like the leaf on Rayda's site. On every load or refresh the page
// opens on the logo: the rails rise, the six bars slide into them, the letters follow and the warmth runs up the
// radiator, then the curtain lifts. Following a link of the site, the curtain grows from the spot that was clicked,
// the logo builds on it and stays warm while the next page comes, then lifts. Visitors who ask for less motion get
// none of it (the thin line at the top still answers their click).
type CurtainPhase = "intro" | "leaving" | "arriving" | "idle";
const curtainCover = 640; // the least time the logo stays up when leaving a page, so it reads

function Navigation({ locale, pathname, mobile = false, onNavigate, onReveal }: { locale: Locale; pathname: string; mobile?: boolean; onNavigate: () => void; onReveal: (destination: string) => void }) {
  const t = messages[locale];
  const [productsOpen, setProductsOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const dropdownId = `products-${locale}-${mobile ? "mobile" : "desktop"}`;
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, path: typeof navPaths[number]) => {
    onNavigate();
    if (!path || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    onReveal(navigationHref(locale, path));
  };
  return <>
    {t.nav.map((label, index) => <div key={navPaths[index]} className={`nav-item${index === 2 ? " has-dropdown" : ""}${index === quoteIndex ? " nav-quote" : ""}`}
      onMouseEnter={() => { if (index === 2 && !mobile) setProductsOpen(true); }}
      onMouseLeave={event => { if (!event.currentTarget.contains(document.activeElement)) setProductsOpen(false); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setProductsOpen(false); }}
      onKeyDown={event => { if (index === 2 && event.key === "Escape" && productsOpen) { event.preventDefault(); event.stopPropagation(); setProductsOpen(false); toggle.current?.focus(); } }}>
      <div className="nav-link-row"><Link href={navigationHref(locale, navPaths[index])} scroll={index === 0} onClick={event => navigate(event, navPaths[index])} aria-current={pathname === `/${locale}${navPaths[index]}` ? "page" : undefined}>{label}{index === quoteIndex && <BasketCount label={t.basketLabel} />}</Link>
        {index === 2 && <button ref={toggle} type="button" className="nav-submenu-toggle" aria-label={locale === "ar" ? "قائمة المنتجات" : "Liste des produits"} aria-expanded={productsOpen} aria-controls={dropdownId} onClick={() => setProductsOpen(open => mobile ? !open : true)}><ChevronDown size={14} /></button>}
      </div>
      {index === 2 && <div id={dropdownId} className="nav-dropdown" hidden={!productsOpen}>{families.map(family => <Link key={family.id} href={`/${locale}/produits/${family.id}`} onClick={onNavigate}><bdi>{family.name}</bdi><small>{family.kind[locale]}</small></Link>)}<Link className="nav-dropdown-tool" href={`/${locale}/produits/eden#choisir`} onClick={onNavigate}>{t.sizingNav}<small>{t.sizingNavHint}</small></Link></div>}
    </div>)}
    <Link className="language-link" href={switchLocalePath(pathname, locale === "fr" ? "ar" : "fr")} onClick={onNavigate} hrefLang={locale === "fr" ? "ar" : "fr"}><Globe2 size={15} />{t.language}</Link>
  </>;
}

export function SiteShell({ locale, products, adminAvailable, children }: { locale: Locale; products: CatalogProduct[]; adminAvailable: boolean; children: React.ReactNode }) {
  const t = messages[locale];
  const pathname = usePathname();
  const home = pathname === `/${locale}`;
  const quotePage = pathname === `/${locale}/devis`;
  const [scrolled, setScrolled] = useState(false);
  // Past the first screen, a compact header follows the visitor (on desktop; on phones the header simply stays on top).
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pageArrival = usePageArrival(pathname, menuOpen);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    const update = () => { setScrolled(window.scrollY > 80); setStuck(window.scrollY > window.innerHeight * 0.7); };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [locale]);
  const closeMenu = () => { setMenuOpen(false); pageArrival.cancel(); };
  const whatsapp = whatsappHref();
  // Doherty threshold: a thin line answers every internal link at once, while the page itself arrives.
  const [routing, setRouting] = useState(false);
  const [curtain, setCurtain] = useState<CurtainPhase>("intro");
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const phase = useRef<CurtainPhase>("intro");
  const leftAt = useRef(0);
  // The first page's logo warms up after the opening; later pages', right after the curtain lifts.
  const firstPath = useRef<string | null>(pathname);
  const show = (next: CurtainPhase) => { phase.current = next; setCurtain(next); };
  // The opening on load: the curtain lifts by itself (CSS); this only sets it aside once it is gone.
  useEffect(() => {
    const timer = window.setTimeout(() => { if (phase.current === "intro") show("idle"); }, 2000);
    return () => window.clearTimeout(timer);
  }, []);
  // The next page is here: the logo has been up long enough, so the curtain lifts.
  useEffect(() => {
    setRouting(false);
    if (firstPath.current !== pathname) firstPath.current = null;
    if (phase.current !== "leaving") return;
    const wait = Math.max(0, curtainCover - (performance.now() - leftAt.current));
    const lift = window.setTimeout(() => show("arriving"), wait);
    const done = window.setTimeout(() => { if (phase.current === "arriving") show("idle"); }, wait + 760);
    return () => { window.clearTimeout(lift); window.clearTimeout(done); };
  }, [pathname]);
  useEffect(() => {
    let timer = 0;
    const start = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute("download")) return;
      // A model chip opens its quick view on the page; it does not leave it.
      if (link.hasAttribute("aria-haspopup") || link.hasAttribute("data-no-curtain")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname || /\.[a-z0-9]+$/i.test(url.pathname) || url.pathname.startsWith("/admin")) return;
      setRouting(true);
      window.clearTimeout(timer);
      // If the next page takes too long, the curtain lifts anyway and the line keeps waiting.
      timer = window.setTimeout(() => { setRouting(false); if (phase.current === "leaving") show("arriving"); }, 8000);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setOrigin({ x: event.clientX || window.innerWidth / 2, y: event.clientY || window.innerHeight / 2 });
      leftAt.current = performance.now();
      show("leaving");
    };
    document.addEventListener("click", start, true);
    return () => { document.removeEventListener("click", start, true); window.clearTimeout(timer); };
  }, []);
  return <CatalogContext.Provider value={products}>
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="site-shell" data-page={quotePage ? "devis" : undefined} data-scrolled={scrolled ? "" : undefined}>
      {routing && <span className="route-progress" aria-hidden="true" />}
      <div className={`page-curtain is-${curtain}`} style={origin ? { "--cx": `${origin.x}px`, "--cy": `${origin.y}px` } as React.CSSProperties : undefined} aria-hidden="true"
        onAnimationEnd={event => { if (event.target === event.currentTarget && event.animationName === "curtain-lift") show("idle"); }}>
        <span className="curtain-glow" />
        <EddfaLogo className="curtain-logo" />
        <small className="curtain-tagline">{t.tagline}</small>
      </div>
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <header className={`site-header${!home ? " solid" : ""}${stuck ? " stuck" : ""}${menuOpen ? " menu-expanded" : ""}`} onKeyDown={event => { if (event.key === "Escape" && menuOpen) { closeMenu(); mobileToggle.current?.focus(); } }}>
        <div className="header-inner"><Brand key={pathname} locale={locale} heatDelay={pathname === firstPath.current ? "1.7s" : "0.75s"} /><nav className="desktop-nav" aria-label={locale === "ar" ? "القائمة الرئيسية" : "Navigation principale"}><Navigation key={pathname} locale={locale} pathname={pathname} onNavigate={closeMenu} onReveal={pageArrival.reveal} /></nav>
          {!quotePage && <Link className="header-quote" href={`/${locale}/devis`} onClick={closeMenu}>{t.nav[5]}<BasketCount label={t.basketLabel} /></Link>}
          <button ref={mobileToggle} type="button" className="mobile-menu-button icon-button" aria-label={menuOpen ? t.close : t.menu} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
        <nav id="mobile-navigation" className="mobile-nav" hidden={!menuOpen} aria-label={locale === "ar" ? "القائمة الرئيسية للجوال" : "Navigation mobile"}><Navigation key={pathname} locale={locale} pathname={pathname} mobile onNavigate={closeMenu} onReveal={pageArrival.reveal} /><div className="mobile-contact"><a href={`tel:${company.telephone}`}><Phone size={17} />{t.railCall}</a><a href={`mailto:${company.email}`}><Mail size={18} />{t.railMail}</a>{whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} />{t.whatsapp}</a>}</div></nav>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer"><Emblem side="end" edge="bottom" />
        <div className="container footer-grid"><div className="footer-brand"><Brand locale={locale} /><p>{t.footerText}</p></div>
          <div><h3>{t.quickLinks}</h3><ul>{t.nav.map((label, index) => <li key={label}><Link href={`/${locale}${navPaths[index]}`}>{label}</Link></li>)}</ul></div>
          <div><h3>{t.nav[2]}</h3><ul>{families.map(family => <li key={family.id}><Link href={`/${locale}/produits/${family.id}`}><bdi>{family.name}</bdi><span> · {family.kind[locale]}</span></Link></li>)}<li><Link href={`/${locale}/produits/eden#choisir`}>{t.sizingNav}</Link></li></ul></div>
          <div><h3>{t.address}</h3>
            <div className="footer-contacts"><a className="contact-chip" href={`tel:${company.telephone}`}><Phone size={17} /><span dir="ltr">+216 {company.phone}</span></a><a className="contact-chip" href={`mailto:${company.email}`}><Mail size={17} /><span>{company.email}</span></a>{whatsapp && <a className="contact-chip" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /><span>{t.whatsapp}</span></a>}</div>
            <address>{company.address}</address>
            <a className="text-link light" href={company.directionsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16} /><span>{t.directions}</span></a></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 {t.rights}</span>{(company.footerCreditApproved || process.env.NEXT_PUBLIC_EDDFA_SHOW_CREDIT === "true") && (adminAvailable ? <Link href="/admin" prefetch={false} aria-label={locale === "ar" ? "Made by Aymen · دخول الإدارة" : "Made by Aymen · Accès administration"}>Made by Aymen</Link> : <span>Made by Aymen</span>)}</div>
      </footer>
      <aside className="contact-rail" aria-label={t.contact}>
        <Link className="rail-button rail-quote" href={`/${locale}/devis`} aria-label={t.quote} title={t.quote}><ClipboardList size={20} /><span className="rail-label">{t.nav[5]}</span><BasketCount label={t.basketLabel} /></Link>
        {whatsapp && <a className="rail-button" href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={t.whatsapp} title={t.whatsapp}><MessageCircle size={20} /><span className="rail-label">{t.whatsapp}</span></a>}
        <a className="rail-button" href={`mailto:${company.email}`} aria-label={company.email} title={company.email}><Mail size={20} /><span className="rail-label">{t.railMail}</span></a>
        <a className="rail-button" href={`tel:${company.telephone}`} aria-label={company.phone} title={company.phone}><Phone size={18} /><span className="rail-label">{t.railCall}</span></a>
      </aside>
      {scrolled && <button type="button" className="back-to-top icon-button" aria-label={locale === "ar" ? "العودة إلى الأعلى" : "Retour en haut"} title={locale === "ar" ? "العودة إلى الأعلى" : "Retour en haut"} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}><ArrowUp size={18} /></button>}
    </div>
  </CatalogContext.Provider>;
}

export function PillLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return <Link href={href} className={`pill-button${light ? " light" : ""}`}>{children}<ChevronRight size={19} className="directional-icon" /></Link>;
}
