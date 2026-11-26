"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import { familyById, messages, type Locale, type ProductVariant } from "@/lib/content";
import { formatDecimal, insulationLevels, recommend, requiredPower, sizingRanges, type Insulation } from "@/lib/sizing";
import { useCatalog } from "./catalog-context";
import { useTweenedNumber } from "./motion";
import { Photo } from "./media";
import { Lines } from "./lines";
import { RadiatorMark, markBars } from "./radiator-mark";
import { Emblem } from "./emblem";
import { AddToQuote } from "./basket";

type Range = "eden" | "eclat";
const ranges: Range[] = ["eden", "eclat"];
const size = (variant: ProductVariant) => `${variant.dimensions[0]} × ${variant.dimensions[1]} mm`;
const fill = (value: number, range: { min: number; max: number }) => ({ "--fill": `${((value - range.min) / (range.max - range.min)) * 100}%` }) as React.CSSProperties;

// "Trouvez le vôtre": the home page's guide. Central heating or not decides the range (EDEN or ECLAT), the room's
// surface and insulation decide the size, with the same formula as « Choisir son sèche-serviettes » and a 2.6 m
// ceiling. The answer is the advised model in its room, ready to go into a quote. EDDFA's radiator warms up bar by bar
// with the result: the bars that stay cool are the heat to spare.
export function HomeGuide({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const id = useId();
  const catalog = useCatalog();
  const [range, setRange] = useState<Range | null>(null);
  const [surface, setSurface] = useState<number>(sizingRanges.surface.initial);
  const [ceiling, setCeiling] = useState<number>(sizingRanges.ceiling.initial);
  const [insulation, setInsulation] = useState<Insulation>("average");
  // The same room as the calculator on the EDEN and ECLAT pages, so « Affiner le calcul » carries on from here.
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
  const family = range ? familyById(range) : undefined;
  const power = requiredPower(surface, ceiling, insulation);
  const shownPower = useTweenedNumber(power);
  const best = family?.sizing ? recommend(catalog.filter(product => product.category === family.id), family.sizing, power).best : null;
  const warm = best ? Math.max(1, Math.min(markBars, Math.round(power / (best.output * best.units) * markBars))) : 0;
  const pickName = best ? `${best.units > 1 ? `${best.units} × ` : ""}${best.product.title[locale]}` : "";
  const assumption = t.guideAssumption.replace("{h}", formatDecimal(ceiling, locale, 2));
  return <section id="trouver" className="section plate guide-section"><Emblem side="start" /><div className="container">
    <div className="section-intro"><h2 className="title"><Lines text={t.guideTitle} /></h2><p>{t.guideText}</p></div>
    <div className="guide">
      <form className="guide-questions" onSubmit={event => event.preventDefault()}>
        <fieldset className="guide-q">
          <legend><span className="guide-n" aria-hidden="true">1</span>{t.guideHeating}</legend>
          <div className="guide-choices">{ranges.map(key => <label key={key} className={range === key ? "active" : undefined}>
            <input type="radio" name={`${id}-heating`} value={key} checked={range === key} onChange={() => setRange(key)} />
            <strong>{key === "eden" ? t.guideYes : t.guideNo}</strong><small><bdi>{key === "eden" ? t.guideYesHint : t.guideNoHint}</bdi></small>
          </label>)}</div>
        </fieldset>
        <fieldset className="guide-q">
          <legend><span className="guide-n" aria-hidden="true">2</span>{t.guideSurface}</legend>
          <div className="slider-field">
            <div className="slider-head"><span>{t.surface}</span><output htmlFor={`${id}-surface`} dir="ltr">{formatDecimal(surface, locale)} m²</output></div>
            <input id={`${id}-surface`} type="range" aria-label={t.surface} min={sizingRanges.surface.min} max={sizingRanges.surface.max} step={sizingRanges.surface.step} value={surface} style={fill(surface, sizingRanges.surface)} onChange={event => setSurface(Number(event.target.value))} />
          </div>
        </fieldset>
        <fieldset className="guide-q">
          <legend><span className="guide-n" aria-hidden="true">3</span>{t.guideInsulation}</legend>
          <div className="segmented" style={{ "--index": insulationLevels.indexOf(insulation), "--count": insulationLevels.length } as React.CSSProperties}>
            <div className="segmented-track"><span className="segmented-thumb" aria-hidden="true" />{insulationLevels.map(level => <label key={level} className={insulation === level ? "active" : undefined}><input type="radio" name={`${id}-insulation`} value={level} checked={insulation === level} onChange={() => setInsulation(level)} /><span>{t.insulationLevels[level]}</span></label>)}</div>
            <p className="segmented-hint">{t.insulationHints[insulation]}</p>
          </div>
        </fieldset>
      </form>
      <div className={`guide-result${best ? " ready" : ""}`}>
        {family && best ? <>
          <div className="guide-power">
            <div><span className="result-label">{t.requiredPower}</span><strong dir="ltr">≈ {Math.round(shownPower)} W</strong></div>
            <RadiatorMark key={`${best.variant.id}-${best.units}`} warm={warm} className="result-mark" />
          </div>
          <div className="guide-pick">
            <Link className="guide-thumb" href={`/${locale}/produits/${best.product.handle}`} tabIndex={-1} aria-hidden="true"><Photo src={best.product.image} alt="" sizes="160px" /></Link>
            <div><span className="result-label">{t.recommended}</span><h3><bdi>{pickName}</bdi></h3><p dir="ltr">{size(best.variant)} · {best.units > 1 ? `${best.units} × ` : ""}{best.output} W</p></div>
          </div>
          {best.units > 1 && <p className="guide-warning">{t.noneSingle}</p>}
          <div className="guide-actions"><AddToQuote key={`${best.variant.id}-${best.units}`} locale={locale} lineId={`v:${best.variant.id}`} quantity={best.units} /><Link className="pill-button" href={`/${locale}/produits/${best.product.handle}`}>{t.viewModel}</Link></div>
          <p className="guide-note">{assumption} <Link className="text-link light" href={`/${locale}/produits/${family.id}#choisir`}><span>{t.guideRefine}</span><ChevronRight size={15} className="directional-icon" /></Link></p>
        </> : family ? <div className="guide-empty"><RadiatorMark className="result-mark" /><strong>{t.noneAtAll}</strong></div>
          : <div className="guide-empty"><RadiatorMark className="result-mark" /><strong>{t.guideEmpty}</strong><span>{t.guideEmptyHint}</span></div>}
        <p className="sr-only" aria-live="polite">{best ? `${t.recommended} ${pickName}, ${size(best.variant)}, ${power} W.` : ""}</p>
      </div>
    </div>
  </div></section>;
}
