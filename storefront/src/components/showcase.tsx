"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Asterisk, Calculator, ChevronRight, FileText } from "lucide-react";
import { asset, families, messages, type CatalogProduct, type Locale } from "@/lib/content";
import { Photo } from "./media";

/** Turns through `count` items while the block is on screen. It waits while the pointer or the keyboard is inside,
    and stops for good once the visitor chooses an item. Visitors who ask for reduced motion never get the rotation. */
function useAutoCycle(count: number, delay: number) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const [held, setHeld] = useState(false);
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    setMotion(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const node = root.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => setOnScreen(entries[entries.length - 1].isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const running = auto && onScreen && !held && motion;
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setActive(index => (index + 1) % count), delay);
    return () => window.clearTimeout(timer);
  }, [running, active, count, delay]);
  const choose = useCallback((index: number) => { setAuto(false); setActive((index + count) % count); }, [count]);
  return { root, active, running, choose, hold: setHeld };
}

const rangeCycle = 6500;

// "Que cherchez-vous ?": the five ranges as one stage. Pointing at a name (or tapping it) brings its range forward:
// EDDFA's photo for EDEN and ECLAT, the name alone for the three ranges whose photos have not been supplied yet.
export function RangeShowcase({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  const { root, active, running, choose, hold } = useAutoCycle(families.length, rangeCycle);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (index: number) => { const next = (index + families.length) % families.length; choose(next); tabs.current[next]?.focus(); };
  return <div ref={root} className="showcase" data-running={running} style={{ "--active": active, "--count": families.length, "--cycle": `${rangeCycle}ms` } as React.CSSProperties}
    onPointerEnter={event => { if (event.pointerType === "mouse") hold(true); }} onPointerLeave={() => hold(false)}
    onFocus={() => hold(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) hold(false); }}>
    <div className="showcase-list" role="tablist" aria-orientation="vertical" aria-label={t.rangesNav}>
      <span className="showcase-marker" aria-hidden="true" />
      {families.map((family, index) => <button key={family.id} ref={element => { tabs.current[index] = element; }} type="button" role="tab" className="showcase-tab"
        id={`range-tab-${family.id}`} aria-selected={active === index} aria-controls={`range-panel-${family.id}`} tabIndex={active === index ? 0 : -1}
        onClick={() => choose(index)}
        onPointerEnter={event => { if (event.pointerType === "mouse" && active !== index) choose(index); }}
        onKeyDown={event => {
          if (event.key === "ArrowDown" || event.key === (locale === "ar" ? "ArrowLeft" : "ArrowRight")) { event.preventDefault(); move(index + 1); }
          if (event.key === "ArrowUp" || event.key === (locale === "ar" ? "ArrowRight" : "ArrowLeft")) { event.preventDefault(); move(index - 1); }
          if (event.key === "Home") { event.preventDefault(); move(0); }
          if (event.key === "End") { event.preventDefault(); move(families.length - 1); }
        }}>
        <span className="showcase-name"><bdi>{family.name}</bdi></span><span className="showcase-kind">{family.kind[locale]}</span>
        {active === index && <span className="showcase-progress" aria-hidden="true" />}
      </button>)}
    </div>
    <div className="showcase-stage">
      {families.map((family, index) => {
        const count = products.filter(product => product.category === family.id).length;
        const shown = active === index;
        return <article key={family.id} id={`range-panel-${family.id}`} role="tabpanel" aria-labelledby={`range-tab-${family.id}`} className={`showcase-panel${family.image ? "" : " plain"}`} data-active={shown} inert={!shown}>
          {family.image ? <Photo src={family.image} alt="" sizes="(max-width: 921px) 100vw, 60vw" /> : <span className="showcase-watermark" aria-hidden="true">{family.name}</span>}
          <div className="showcase-card">
            <span className="showcase-meta"><bdi>{family.name}</bdi>{count > 0 ? ` · ${count} ${t.models}` : ""}</span>
            <h3>{family.kind[locale]}</h3>
            <p>{family.summary[locale]}</p>
            <div className="showcase-actions">
              <Link className="pill-button gold" href={`/${locale}/produits/${family.id}`}>{t.seeRange}<ChevronRight size={18} className="directional-icon" /></Link>
              {family.sizing && <Link className="text-link light" href={`/${locale}/produits/${family.id}#choisir`}><Calculator size={16} /><span>{t.sizingNav}</span></Link>}
            </div>
          </div>
        </article>;
      })}
    </div>
  </div>;
}

const principleCycle = 7000;
// Each requirement is backed by one of EDDFA's own key facts, shown on the photo while it is open.
const principleFacts = [0, 2, 3];

// "Nos exigences": one requirement open at a time; the photo's plate states the fact behind it.
export function Exigences({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const { root, active, running, choose, hold } = useAutoCycle(t.principles.length, principleCycle);
  const fact = t.facts[principleFacts[active]];
  return <section id="exigences" className="section commitment"><div ref={root} className="container commitment-grid" data-running={running} style={{ "--cycle": `${principleCycle}ms` } as React.CSSProperties}
    onPointerEnter={event => { if (event.pointerType === "mouse") hold(true); }} onPointerLeave={() => hold(false)}
    onFocus={() => hold(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) hold(false); }}>
    <div><span className="eyebrow">{t.why}</span><h2>{t.commitment}</h2>
      <div className="principles interactive">{t.principles.map((principle, index) => <article key={principle.title} className={active === index ? "active" : undefined}>
        <h3><button type="button" aria-expanded={active === index} aria-controls={`principle-${index}`} onClick={() => choose(index)}><Asterisk size={30} strokeWidth={2.7} aria-hidden="true" /><span>{principle.title}</span></button></h3>
        <div id={`principle-${index}`} className="principle-body" inert={active !== index}><p>{principle.text}</p></div>
        {active === index && <span className="principle-progress" aria-hidden="true" />}
      </article>)}</div>
    </div>
    <div className="commitment-photo"><Photo src={asset("scene-eden-80-detail")} alt={t.detailAlt} />
      <div className="commitment-badge" key={active}><strong><bdi>{fact.value}</bdi></strong><span>{fact.label}</span>
        {active === 1 && <a className="text-link light" href="/eddfa/certificat-veritas-en442.pdf" target="_blank" rel="noopener noreferrer"><FileText size={15} /><span>{t.certificateLink}</span></a>}
      </div>
    </div>
  </div></section>;
}
