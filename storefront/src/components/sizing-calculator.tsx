"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import { messages, type Locale, type ProductFamily, type ProductVariant } from "@/lib/content";
import { formatDecimal, insulationCoefficients, insulationLevels, recommend, requiredPower, sizingRanges, type Insulation } from "@/lib/sizing";
import { useCatalog } from "./catalog-context";
import { useTweenedNumber } from "./motion";
import { Photo } from "./media";
import { AddToQuote } from "./basket";

const size = (variant: ProductVariant) => `${variant.dimensions[0]} × ${variant.dimensions[1]} mm`;
const fill = (value: number, range: { min: number; max: number }) => ({ "--fill": `${((value - range.min) / (range.max - range.min)) * 100}%` }) as React.CSSProperties;

// The signature touch: EDDFA's radiator, drawn from the logo, warms up bar by bar (bottom first) each time the advice
// changes. The bars that stay cool show the heat to spare; two radiators are drawn when two are needed.
const barRows = [153, 137, 96, 80, 31, 16];
function WarmRadiators({ units, load }: { units: number; load: number }) {
  const warm = Math.max(1, Math.min(barRows.length, Math.round(load * barRows.length)));
  return <div className="warm-radiators" data-units={units} aria-hidden="true">{Array.from({ length: units }, (_, unit) => <svg key={unit} className="warm-radiator" viewBox="0 0 164 175" focusable="false">
    <rect className="rail" x="2" y="2" width="23" height="171" rx="11.5" /><rect className="rail" x="140" y="2" width="22" height="171" rx="11" />
    {barRows.map((y, index) => <rect key={y} className={index < warm ? "bar warm" : "bar"} style={{ "--n": index } as React.CSSProperties} x="14" y={y} width="115" height="10.5" rx="5.25" />)}
  </svg>)}</div>;
}

// "Choisir son sèche-serviettes": on the EDEN and ECLAT pages only, as the client asked.
export function SizingCalculator({ locale, family }: { locale: Locale; family: ProductFamily }) {
  const t = messages[locale];
  const id = useId();
  const catalog = useCatalog();
  const [surface, setSurface] = useState<number>(sizingRanges.surface.initial);
  const [ceiling, setCeiling] = useState<number>(sizingRanges.ceiling.initial);
  const [insulation, setInsulation] = useState<Insulation>("average");
  // Frequency of use: the visitor's last room is kept for the visit, so coming back to the tool does not start again.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem("eddfa-room") ?? "null") as { surface?: number; ceiling?: number; insulation?: Insulation } | null;
      if (!saved) return;
      if (typeof saved.surface === "number" && saved.surface >= sizingRanges.surface.min && saved.surface <= sizingRanges.surface.max) setSurface(saved.surface);
      if (typeof saved.ceiling === "number" && saved.ceiling >= sizingRanges.ceiling.min && saved.ceiling <= sizingRanges.ceiling.max) setCeiling(saved.ceiling);
      if (saved.insulation && insulationLevels.includes(saved.insulation)) setInsulation(saved.insulation);
    } catch { /* private mode or a damaged entry: the defaults stay */ }
  }, []);
  useEffect(() => {
    try { window.sessionStorage.setItem("eddfa-room", JSON.stringify({ surface, ceiling, insulation })); } catch { /* storage unavailable */ }
  }, [surface, ceiling, insulation]);
  const power = requiredPower(surface, ceiling, insulation);
  const shownPower = useTweenedNumber(power);
  if (!family.sizing) return null;
  const { best, alternatives } = recommend(catalog.filter(product => product.category === family.id), family.sizing, power);
  const other = family.id === "eden" ? { href: `/${locale}/produits/eclat#choisir`, label: t.switchToEclat } : { href: `/${locale}/produits/eden#choisir`, label: t.switchToEden };
  const pickName = best ? `${best.units > 1 ? `${best.units} × ` : ""}${best.product.title[locale]}` : "";
  return <section id="choisir" className="section plate sizing-section"><div className="container">
    <div className="section-heading"><span className="eyebrow">{t.sizingEyebrow}</span><h2>{t.sizingTitle}</h2><p>{t.sizingText}</p></div>
    <div className="sizing-panel">
      <div className="sizing-controls">
        <div className="slider-field">
          <div className="slider-head"><label htmlFor={`${id}-surface`}>{t.surface}</label><output htmlFor={`${id}-surface`} dir="ltr">{formatDecimal(surface, locale)} m²</output></div>
          <input id={`${id}-surface`} type="range" min={sizingRanges.surface.min} max={sizingRanges.surface.max} step={sizingRanges.surface.step} value={surface} style={fill(surface, sizingRanges.surface)} onChange={event => setSurface(Number(event.target.value))} />
        </div>
        <div className="slider-field">
          <div className="slider-head"><label htmlFor={`${id}-ceiling`}>{t.ceiling}</label><output htmlFor={`${id}-ceiling`} dir="ltr">{formatDecimal(ceiling, locale, 2)} m</output></div>
          <input id={`${id}-ceiling`} type="range" min={sizingRanges.ceiling.min} max={sizingRanges.ceiling.max} step={sizingRanges.ceiling.step} value={ceiling} style={fill(ceiling, sizingRanges.ceiling)} onChange={event => setCeiling(Number(event.target.value))} />
        </div>
        <fieldset className="segmented" style={{ "--index": insulationLevels.indexOf(insulation), "--count": insulationLevels.length } as React.CSSProperties}>
          <legend>{t.insulation}</legend>
          <div className="segmented-track"><span className="segmented-thumb" aria-hidden="true" />{insulationLevels.map(level => <label key={level} className={insulation === level ? "active" : undefined}><input type="radio" name={`${id}-insulation`} value={level} checked={insulation === level} onChange={() => setInsulation(level)} /><span>{t.insulationLevels[level]}</span></label>)}</div>
          <p className="segmented-hint">{t.insulationHints[insulation]}</p>
        </fieldset>
        <Link className="text-link" href={other.href}><span>{other.label}</span><ChevronRight size={16} className="directional-icon" /></Link>
      </div>
      <div className="sizing-output">
        <div className="sizing-result">
          <div className="sizing-head"><div>
            <span className="eyebrow">{t.requiredPower}</span>
            <strong className="sizing-power" dir="ltr">≈ {Math.round(shownPower)} W</strong>
            <span className="sizing-volume">{t.volume}{locale === "fr" ? " : " : ": "}<bdi dir="ltr">{formatDecimal(surface * ceiling, locale)} m³</bdi></span>
          </div>{best && <WarmRadiators key={`${best.variant.id}-${best.units}`} units={best.units} load={power / (best.output * best.units)} />}</div>
          {best ? <div className="sizing-pick" key={`${best.variant.id}-${best.units}`}>
            <div className="sizing-thumb"><Photo src={best.product.image} alt={`${best.product.title[locale]} ${t.roomAlt}`} sizes="(max-width: 640px) 42vw, 200px" /></div>
            <div><span className="eyebrow">{t.recommended}</span><h3><bdi>{pickName}</bdi></h3><p className="sizing-spec" dir="ltr">{size(best.variant)} · {best.units > 1 ? `${best.units} × ` : ""}{best.output} W</p></div>
          </div> : <p className="sizing-warning">{t.noneAtAll}</p>}
          {best && best.units > 1 && <p className="sizing-warning">{t.noneSingle}</p>}
          {best && <div className="sizing-actions"><AddToQuote key={`${best.variant.id}-${best.units}`} locale={locale} lineId={`v:${best.variant.id}`} quantity={best.units} /><Link className="pill-button ghost-light" href={`/${locale}/produits/${best.product.handle}`}>{t.viewModel}</Link></div>}
          {alternatives.length > 0 && <div className="sizing-alternatives"><span className="eyebrow">{t.alternatives}</span><div>{alternatives.map(option => <Link key={option.variant.id} href={`/${locale}/produits/${option.product.handle}`}><bdi>{option.product.title[locale]}</bdi> <span dir="ltr">{option.output} W</span></Link>)}</div></div>}
          <p className="sr-only" aria-live="polite">{`${t.requiredPower} ${power} W. ${best ? `${t.recommended} ${pickName}, ${size(best.variant)}.` : t.noneAtAll}`}</p>
        </div>
        <div className="sizing-formula">
          <span className="eyebrow">{t.method}</span>
          <p dir="ltr">{formatDecimal(surface, locale)} m² × {formatDecimal(ceiling, locale, 2)} m × {insulationCoefficients[insulation]} W/m³ = {power} W</p>
          <details className="soft-details">
            <summary>{t.howCalculated}</summary>
            <div className="soft-details-body">
              <p className="formula-words"><bdi>{t.formula}</bdi></p>
              <dl className="coefficient-list">{insulationLevels.map(level => <div key={level} className={level === insulation ? "active" : undefined}><dt>{t.insulationLevels[level]}</dt><dd dir="ltr">{insulationCoefficients[level]} W/m³</dd></div>)}</dl>
              <p className="specification-note">{family.sizing === "electric" ? t.sizingElectric : t.sizingThermal} {t.sizingDisclaimer}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div></section>;
}
