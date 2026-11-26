"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, RotateCcw } from "lucide-react";
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
const size = (variant: ProductVariant) => `${variant.dimensions[0]} × ${variant.dimensions[1]}\u00a0mm`;
const fill = (value: number, range: { min: number; max: number }) => ({ "--fill": `${((value - range.min) / (range.max - range.min)) * 100}%` }) as React.CSSProperties;
const RESULT = 3;

// "Trouvez le vôtre": the home page's guide, one question at a time, like the booking on Rayda's site. The visitor
// answers, presses « Continuer », and the next question takes the place of the last one: no scrolling through a form.
// The answers so far stay above the question (a tap on one goes back to it), « Retour » steps back, and the last step
// is the advised model in its room, ready to go into a quote; the card then turns to charcoal and EDDFA's radiator,
// which has warmed one pair of bars per answer, glows. Central heating or not decides the range (EDEN or ECLAT); the
// room's surface and insulation decide the size, with the same formula as « Choisir son sèche-serviettes » and a
// 2.6 m ceiling.
export function HomeGuide({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const id = useId();
  const catalog = useCatalog();
  const card = useRef<HTMLDivElement>(null);
  const [moved, setMoved] = useState(false);
  const [step, setStep] = useState(0);
  const [back, setBack] = useState(false);
  const [missing, setMissing] = useState(false);
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

  // Each new step starts where the visitor is looking: its question takes the focus, and if the card's top has gone
  // above the screen (or the answer is taller than what is left of it), the page brings the card's top back under the
  // header. Nothing moves on the first load.
  useEffect(() => {
    if (!moved) return;
    const box = card.current;
    if (!box) return;
    box.querySelector<HTMLElement>("[data-step-focus]")?.focus({ preventScroll: true });
    const header = document.querySelector<HTMLElement>(".site-header");
    const fixed = header && ["fixed", "sticky"].includes(getComputedStyle(header).position) ? header.offsetHeight : 0;
    const offset = fixed + 14;
    const top = box.getBoundingClientRect().top;
    const bottom = box.getBoundingClientRect().bottom;
    if (top < offset || (bottom > window.innerHeight && top > offset + 40)) {
      window.scrollTo({ top: Math.max(0, window.scrollY + top - offset), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }, [step, moved]);

  const go = (target: number) => {
    setMoved(true);
    setMissing(false);
    setBack(target < step);
    setStep(Math.max(0, Math.min(RESULT, target)));
  };
  const next = () => {
    if (step === 0 && !range) { setMissing(true); return; }
    go(step + 1);
  };

  const family = range ? familyById(range) : undefined;
  const power = requiredPower(surface, ceiling, insulation);
  const shownPower = useTweenedNumber(power);
  const best = family?.sizing ? recommend(catalog.filter(product => product.category === family.id), family.sizing, power).best : null;
  const warm = best ? Math.max(1, Math.min(markBars, Math.round(power / (best.output * best.units) * markBars))) : 0;
  const pickName = best ? `${best.units > 1 ? `${best.units} × ` : ""}${best.product.title[locale]}` : "";
  const assumption = t.guideAssumption.replace("{h}", formatDecimal(ceiling, locale, 2));
  const answers: [number, string][] = [
    ...(step > 0 && range ? [[0, range === "eden" ? t.guideYesHint : t.guideNoHint] as [number, string]] : []),
    ...(step > 1 ? [[1, `${formatDecimal(surface, locale)} m²`] as [number, string]] : []),
    ...(step > 2 ? [[2, `${t.guideSteps[2]}${locale === "fr" ? " : " : ": "}${t.insulationLevels[insulation]}`] as [number, string]] : []),
  ];
  const progress = step < RESULT ? `${t.guideProgress.replace("{n}", String(step + 1))} · ${t.guideSteps[step]}` : t.guideResult;
  const powerLine = <p className="guide-live"><span>{t.requiredPower}</span><strong dir="ltr">≈ {Math.round(shownPower)} W</strong></p>;

  return <section id="trouver" className="section plate guide-section"><Emblem side="start" /><div className="container">
    <div className="guide-layout">
    <div className="section-intro"><h2 className="title"><Lines text={t.guideTitle} /></h2><p>{t.guideText}</p></div>
    <div ref={card} className={`guide-card${step === RESULT ? " is-result" : ""}`}>
      <div className="guide-progress">
        <RadiatorMark warm={step === RESULT ? warm : step * 2} className="guide-progress-mark" />
        <div className="guide-progress-copy">
          <p aria-live="polite">{progress}</p>
          <ol className="guide-track" aria-hidden="true">{[0, 1, 2, 3].map(n => <li key={n} className={n < step ? "done" : n === step ? "current" : undefined} />)}</ol>
        </div>
      </div>
      {answers.length > 0 && <div className="guide-answers">{answers.map(([n, text]) => <button key={n} type="button" className="guide-answer" onClick={() => go(n)} aria-label={`${t.guideChange} : ${text}`}><bdi>{text}</bdi><Pencil size={14} aria-hidden="true" /></button>)}</div>}
      <form key={step} className={`guide-step${moved ? (back ? " from-back" : " from-next") : ""}`} onSubmit={event => { event.preventDefault(); next(); }}>
        {step === 0 && <fieldset className="guide-q" aria-describedby={missing ? `${id}-missing` : undefined}>
          <legend><span data-step-focus tabIndex={-1}>{t.guideHeating}</span></legend>
          <div className="guide-choices">{ranges.map(key => <label key={key} className={range === key ? "active" : undefined}>
            <input type="radio" name={`${id}-heating`} value={key} checked={range === key} onChange={() => { setRange(key); setMissing(false); }} />
            <strong>{key === "eden" ? t.guideYes : t.guideNo}</strong><small><bdi>{key === "eden" ? t.guideYesHint : t.guideNoHint}</bdi></small>
          </label>)}</div>
          {missing && <p className="guide-missing" id={`${id}-missing`} role="alert">{t.guidePick}</p>}
        </fieldset>}
        {step === 1 && <fieldset className="guide-q">
          <legend><span data-step-focus tabIndex={-1}>{t.guideSurface}</span></legend>
          <div className="slider-field">
            <div className="slider-head"><span>{t.surface}</span><output htmlFor={`${id}-surface`} dir="ltr">{formatDecimal(surface, locale)} m²</output></div>
            <input id={`${id}-surface`} type="range" aria-label={t.surface} min={sizingRanges.surface.min} max={sizingRanges.surface.max} step={sizingRanges.surface.step} value={surface} style={fill(surface, sizingRanges.surface)} onChange={event => setSurface(Number(event.target.value))} />
          </div>
          {powerLine}
        </fieldset>}
        {step === 2 && <fieldset className="guide-q">
          <legend><span data-step-focus tabIndex={-1}>{t.guideInsulation}</span></legend>
          <div className="segmented" style={{ "--index": insulationLevels.indexOf(insulation), "--count": insulationLevels.length } as React.CSSProperties}>
            <div className="segmented-track"><span className="segmented-thumb" aria-hidden="true" />{insulationLevels.map(level => <label key={level} className={insulation === level ? "active" : undefined}><input type="radio" name={`${id}-insulation`} value={level} checked={insulation === level} onChange={() => setInsulation(level)} /><span>{t.insulationLevels[level]}</span></label>)}</div>
            <p className="segmented-hint">{t.insulationHints[insulation]}</p>
          </div>
          {powerLine}
        </fieldset>}
        {step === RESULT && <div className="guide-result">
          {family && best ? <>
            <div className="guide-power">
              <div><span className="result-label">{t.requiredPower}</span><strong dir="ltr" data-step-focus tabIndex={-1}>≈ {Math.round(shownPower)} W</strong></div>
              <RadiatorMark key={`${best.variant.id}-${best.units}`} warm={warm} className="result-mark" />
            </div>
            <div className="guide-pick">
              <Link className="guide-thumb" href={`/${locale}/produits/${best.product.handle}`} tabIndex={-1} aria-hidden="true"><Photo src={best.product.image} alt="" sizes="160px" /></Link>
              <div><span className="result-label">{t.recommended}</span><h3><bdi>{pickName}</bdi></h3><p dir="ltr">{size(best.variant)} · {best.units > 1 ? `${best.units} × ` : ""}{best.output}{"\u00a0"}W</p></div>
            </div>
            {best.units > 1 && <p className="guide-warning">{t.noneSingle}</p>}
            <div className="guide-actions"><AddToQuote key={`${best.variant.id}-${best.units}`} locale={locale} lineId={`v:${best.variant.id}`} quantity={best.units} /><Link className="pill-button" href={`/${locale}/produits/${best.product.handle}`}>{t.viewModel}</Link></div>
            <p className="guide-note">{assumption} <Link className="text-link light" href={`/${locale}/produits/${family.id}#choisir`}><span>{t.guideRefine}</span><ChevronRight size={15} className="directional-icon" /></Link></p>
          </> : <div className="guide-empty"><RadiatorMark className="result-mark" /><strong data-step-focus tabIndex={-1}>{t.noneAtAll}</strong></div>}
          <p className="sr-only" aria-live="polite">{best ? `${t.recommended} ${pickName}, ${size(best.variant)}, ${power} W.` : ""}</p>
        </div>}
        <div className="guide-nav">
          {step > 0 ? <button type="button" className="guide-back" onClick={() => go(step - 1)}><ChevronLeft size={18} className="directional-icon" aria-hidden="true" /><span>{t.guideBack}</span></button> : <span />}
          {step < RESULT
            ? <button type="submit" className="pill-button primary guide-next"><span>{step === RESULT - 1 ? t.guideShow : t.guideContinue}</span><ChevronRight size={18} className="directional-icon" aria-hidden="true" /></button>
            : <button type="button" className="guide-back" onClick={() => go(0)}><RotateCcw size={16} aria-hidden="true" /><span>{t.guideRestart}</span></button>}
        </div>
      </form>
    </div>
    </div>
  </div></section>;
}
