"use client";

import { useEffect, useRef, useState } from "react";
import { Factory, MessagesSquare, Wrench } from "lucide-react";
import { messages, type Locale } from "@/lib/content";

export function Reveal({ children }: { children: React.ReactNode }) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const node = element.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top >= window.innerHeight) setVisible(false);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={element} className="section-reveal" data-visible={visible}>{children}</div>;
}

export function CompanyValues({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [active, setActive] = useState(0);
  const icons = [Factory, Wrench, MessagesSquare];
  return <section className="section company-values"><div className="container"><div className="section-heading"><span className="eyebrow">{t.why}</span><h2>{t.commitment}</h2></div>
    <div className="value-panels">{t.principles.map((value, index) => {
      const Icon = icons[index];
      return <article key={value.title} className={`value-panel${active === index ? " active" : ""}`} onPointerMove={event => { if (event.pointerType === "mouse" && active !== index) setActive(index); }}>
        <button type="button" className="value-toggle" aria-expanded={active === index} aria-controls={`value-panel-${index}`} onClick={() => setActive(index)} onFocus={() => setActive(index)}><span className="value-symbol"><Icon size={22} /></span><span className="value-label">{value.title}</span></button>
        <div id={`value-panel-${index}`} className="value-description" hidden={active !== index}><p>{value.text}</p></div>
      </article>;
    })}</div>
  </div></section>;
}
