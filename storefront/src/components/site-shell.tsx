"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUp, ChevronDown, ChevronRight, Globe2, Mail, Menu, MessageCircle, Phone, X } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { company, messages, navigationHref, navPaths, type CatalogProduct, type Locale } from "@/lib/content";
import { CatalogContext, useCatalog } from "./catalog-context";
import { switchLocalePath } from "@/lib/inquiry";
import { InquiryForm } from "./inquiry-form";
import { usePageArrival } from "./page-arrival";

const QuoteContext = createContext<(product?: string, variant?: string) => void>(() => {});
export function QuoteButton({ children, className = "pill-button gold", product, variant }: { children: React.ReactNode; className?: string; product?: string; variant?: string }) {
  const open = useContext(QuoteContext);
  return <button type="button" className={className} onClick={() => open(product, variant)}>{children}</button>;
}

function Brand({ locale, dark = false }: { locale: Locale; dark?: boolean }) {
  return <Link href={`/${locale}`} className={`brand${dark ? " brand-dark" : ""}`} aria-label="EDDFA"><span><Image className="brand-logo" src="/eddfa/logo.optimized.webp" alt="EDDFA" width={166} height={43} loading="eager" /><small>{messages[locale].tagline}</small></span></Link>;
}

function Navigation({ locale, pathname, mobile = false, onNavigate, onReveal }: { locale: Locale; pathname: string; mobile?: boolean; onNavigate: () => void; onReveal: (destination: string) => void }) {
  const products = useCatalog();
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
    {t.nav.map((label, index) => <div key={navPaths[index]} className={`nav-item${index === 2 ? " has-dropdown" : ""}`}
      onMouseEnter={() => { if (index === 2 && !mobile) setProductsOpen(true); }}
      onMouseLeave={event => { if (!event.currentTarget.contains(document.activeElement)) setProductsOpen(false); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setProductsOpen(false); }}
      onKeyDown={event => { if (index === 2 && event.key === "Escape" && productsOpen) { event.preventDefault(); event.stopPropagation(); setProductsOpen(false); toggle.current?.focus(); } }}>
      <div className="nav-link-row"><Link href={navigationHref(locale, navPaths[index])} scroll={index === 0} onClick={event => navigate(event, navPaths[index])} aria-current={pathname === `/${locale}${navPaths[index]}` ? "page" : undefined}>{label}</Link>
        {index === 2 && <button ref={toggle} type="button" className="nav-submenu-toggle" aria-label={locale === "ar" ? "قائمة المنتجات" : "Liste des produits"} aria-expanded={productsOpen} aria-controls={dropdownId} onClick={() => setProductsOpen(open => mobile ? !open : true)}><ChevronDown size={14} /></button>}
      </div>
      {index === 2 && <div id={dropdownId} className="nav-dropdown" hidden={!productsOpen}>{products.map(p => <Link key={p.id} href={`/${locale}/produits/${p.handle}`} onClick={onNavigate}><bdi>{p.title[locale]}</bdi></Link>)}</div>}
    </div>)}
    <Link className="language-link" href={switchLocalePath(pathname, locale === "fr" ? "ar" : "fr")} onClick={onNavigate} hrefLang={locale === "fr" ? "ar" : "fr"}><Globe2 size={15} />{t.language}</Link>
  </>;
}

export function SiteShell({ locale, products, adminAvailable, children }: { locale: Locale; products: CatalogProduct[]; adminAvailable: boolean; children: React.ReactNode }) {
  const t = messages[locale];
  const pathname = usePathname();
  const home = pathname === `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pageArrival = usePageArrival(pathname, menuOpen);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const mobileToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    const update = () => setScrolled(window.scrollY > 80);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [locale]);
  const openQuote = (product = "", variant = "") => { setSelectedProduct(product); setSelectedVariant(variant); setQuoteOpen(true); };
  const closeMenu = () => { setMenuOpen(false); pageArrival.cancel(); };
  return <CatalogContext.Provider value={products}><QuoteContext.Provider value={openQuote}>
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="site-shell">
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <header className={`site-header${!home ? " solid" : ""}${menuOpen ? " menu-expanded" : ""}`} onKeyDown={event => { if (event.key === "Escape" && menuOpen) { closeMenu(); mobileToggle.current?.focus(); } }}>
        <div className="header-inner"><Brand locale={locale} /><nav className="desktop-nav" aria-label={locale === "ar" ? "القائمة الرئيسية" : "Navigation principale"}><Navigation key={pathname} locale={locale} pathname={pathname} onNavigate={closeMenu} onReveal={pageArrival.reveal} /></nav>
          <button ref={mobileToggle} type="button" className="mobile-menu-button icon-button" aria-label={menuOpen ? t.close : t.menu} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
        <nav id="mobile-navigation" className="mobile-nav" hidden={!menuOpen} aria-label={locale === "ar" ? "القائمة الرئيسية للجوال" : "Navigation mobile"}><Navigation key={pathname} locale={locale} pathname={pathname} mobile onNavigate={closeMenu} onReveal={pageArrival.reveal} /></nav>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid"><div><Brand locale={locale} dark /><p>{t.footerText}</p></div>
          <div><h3>{t.quickLinks}</h3><ul>{t.nav.map((label, index) => <li key={label}><Link href={`/${locale}${navPaths[index]}`}>{label}</Link></li>)}</ul></div>
          <div><h3>{t.nav[2]}</h3><ul>{products.map(p => <li key={p.id}><Link href={`/${locale}/produits/${p.handle}`}>{p.title[locale]}</Link></li>)}</ul></div>
          <div><h3>{t.address}</h3><a href={`tel:${company.telephone}`} dir="ltr">+216 {company.phone}</a><a className="footer-email" href={`mailto:${company.email}`}>{company.email}</a><address>{company.address}</address></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 {t.rights}</span>{(company.footerCreditApproved || process.env.NEXT_PUBLIC_EDDFA_SHOW_CREDIT === "true") && (adminAvailable ? <Link href="/admin" prefetch={false} aria-label={locale === "ar" ? "Made by Aymen · دخول الإدارة" : "Made by Aymen · Accès administration"}>Made by Aymen</Link> : <span>Made by Aymen</span>)}</div>
      </footer>
      <aside className="contact-rail" aria-label={t.contact}>
        <button type="button" className="rail-button" aria-label={t.quote} title={t.quote} onClick={() => openQuote()}><MessageCircle size={20} /></button>
        <a className="rail-button" href={`mailto:${company.email}`} aria-label={company.email} title={company.email}><Mail size={20} /></a>
        <a className="rail-button" href={`tel:${company.telephone}`} aria-label={company.phone} title={company.phone}><Phone size={18} /></a>
      </aside>
      {scrolled && <button type="button" className="back-to-top icon-button" aria-label={locale === "ar" ? "العودة إلى الأعلى" : "Retour en haut"} title={locale === "ar" ? "العودة إلى الأعلى" : "Retour en haut"} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}><ArrowUp size={18} /></button>}
      <Dialog.Root open={quoteOpen} onOpenChange={setQuoteOpen}><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="quote-dialog" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
        <Dialog.Title>{t.formTitle}</Dialog.Title><Dialog.Description>{t.contactText}</Dialog.Description>
        <Dialog.Close asChild><button type="button" className="dialog-close icon-button" aria-label={t.close}><X size={21} /></button></Dialog.Close>
        <InquiryForm key={`${selectedProduct}:${selectedVariant}`} locale={locale} initialProduct={selectedProduct} initialVariant={selectedVariant} />
      </Dialog.Content></Dialog.Portal></Dialog.Root>
    </div>
  </QuoteContext.Provider></CatalogContext.Provider>;
}

export function PillLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return <Link href={href} className={`pill-button${light ? " light" : ""}`}>{children}<ChevronRight size={19} className="directional-icon" /></Link>;
}
