"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUp, ChevronDown, ChevronRight, Globe2, Mail, Menu, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { company, families, messages, navigationHref, navPaths, type CatalogProduct, type Locale } from "@/lib/content";
import { CatalogContext } from "./catalog-context";
import { switchLocalePath } from "@/lib/inquiry";
import { usePageArrival } from "./page-arrival";

const quoteIndex = navPaths.indexOf("/devis");

// Every quote action leads to the "Obtenir un devis" page, optionally with an article already ticked.
export function QuoteLink({ locale, children, className = "pill-button gold", query = "" }: { locale: Locale; children: React.ReactNode; className?: string; query?: string }) {
  return <Link href={`/${locale}/devis${query}`} className={className}>{children}</Link>;
}

function Brand({ locale, dark = false }: { locale: Locale; dark?: boolean }) {
  return <Link href={`/${locale}`} className={`brand${dark ? " brand-dark" : ""}`} aria-label="EDDFA"><span><Image className="brand-logo" src="/eddfa/logo.optimized.webp" alt="EDDFA" width={166} height={43} loading="eager" /><small>{messages[locale].tagline}</small></span></Link>;
}

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
      <div className="nav-link-row"><Link href={navigationHref(locale, navPaths[index])} scroll={index === 0} onClick={event => navigate(event, navPaths[index])} aria-current={pathname === `/${locale}${navPaths[index]}` ? "page" : undefined}>{label}</Link>
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
  return <CatalogContext.Provider value={products}>
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="site-shell" data-page={quotePage ? "devis" : undefined}>
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <header className={`site-header${!home ? " solid" : ""}${stuck ? " stuck" : ""}${menuOpen ? " menu-expanded" : ""}`} onKeyDown={event => { if (event.key === "Escape" && menuOpen) { closeMenu(); mobileToggle.current?.focus(); } }}>
        <div className="header-inner"><Brand locale={locale} /><nav className="desktop-nav" aria-label={locale === "ar" ? "القائمة الرئيسية" : "Navigation principale"}><Navigation key={pathname} locale={locale} pathname={pathname} onNavigate={closeMenu} onReveal={pageArrival.reveal} /></nav>
          <button ref={mobileToggle} type="button" className="mobile-menu-button icon-button" aria-label={menuOpen ? t.close : t.menu} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
        <nav id="mobile-navigation" className="mobile-nav" hidden={!menuOpen} aria-label={locale === "ar" ? "القائمة الرئيسية للجوال" : "Navigation mobile"}><Navigation key={pathname} locale={locale} pathname={pathname} mobile onNavigate={closeMenu} onReveal={pageArrival.reveal} /></nav>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid"><div><Brand locale={locale} dark /><p>{t.footerText}</p></div>
          <div><h3>{t.quickLinks}</h3><ul>{t.nav.map((label, index) => <li key={label}><Link href={`/${locale}${navPaths[index]}`}>{label}</Link></li>)}</ul></div>
          <div><h3>{t.nav[2]}</h3><ul>{families.map(family => <li key={family.id}><Link href={`/${locale}/produits/${family.id}`}><bdi>{family.name}</bdi> · {family.kind[locale]}</Link></li>)}<li><Link href={`/${locale}/produits/eden#choisir`}>{t.sizingNav}</Link></li></ul></div>
          <div><h3>{t.address}</h3><a href={`tel:${company.telephone}`} dir="ltr">+216 {company.phone}</a><a className="footer-email" href={`mailto:${company.email}`}>{company.email}</a><address>{company.address}</address></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 {t.rights}</span>{(company.footerCreditApproved || process.env.NEXT_PUBLIC_EDDFA_SHOW_CREDIT === "true") && (adminAvailable ? <Link href="/admin" prefetch={false} aria-label={locale === "ar" ? "Made by Aymen · دخول الإدارة" : "Made by Aymen · Accès administration"}>Made by Aymen</Link> : <span>Made by Aymen</span>)}</div>
      </footer>
      <aside className="contact-rail" aria-label={t.contact}>
        <Link className="rail-button rail-quote" href={`/${locale}/devis`} aria-label={t.quote} title={t.quote}><MessageCircle size={20} /><span className="rail-label">{t.nav[5]}</span></Link>
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
