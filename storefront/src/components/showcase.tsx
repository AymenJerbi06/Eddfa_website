import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { asset, families, messages, type CatalogProduct, type Locale } from "@/lib/content";
import { Photo } from "./media";
import { Lines } from "./lines";
import { Emblem } from "./emblem";
import { FilmLoop, type LoopName } from "./film";
import { ModelChips, RangeCardShell, RangePreview } from "./quick-view";

// The two towel-radiator ranges side by side on the charcoal band, each in its own room, filmed (the film plays only
// while it is on screen), with its models one tap away: pointing at a model shows it in the card's picture, a click
// opens it in a quick view. The three other ranges (whose models, photos and sheets are still to come from EDDFA) in
// one quiet row underneath.
export function RangeDuo({ locale, products }: { locale: Locale; products: CatalogProduct[] }) {
  const t = messages[locale];
  const main = families.filter(family => family.sizing);
  const others = families.filter(family => !family.sizing);
  return <section id="gammes" className="section band ranges-section"><Emblem side="start" /><div className="container">
    <div className="section-intro"><h2 className="title"><Lines text={t.rangesTitle} /></h2></div>
    <div className="range-duo">{main.map(family => {
      const models = products.filter(product => product.category === family.id);
      return <RangeCardShell key={family.id} className={`range-card range-${family.id}`}>
        <Link className="range-card-photo" href={`/${locale}/produits/${family.id}`} tabIndex={-1} aria-hidden="true"><FilmLoop name={family.id as LoopName} /><RangePreview locale={locale} /></Link>
        <div className="range-card-body">
          <span className="range-card-kind">{family.kind[locale]}</span>
          <h3><Link href={`/${locale}/produits/${family.id}`}><bdi>{family.name}</bdi></Link></h3>
          <p>{family.summary[locale]}</p>
          {models.length > 0 && <ModelChips locale={locale} label={`${t.modelsNav} ${family.name}`} models={models} />}
          <Link className="text-link light" href={`/${locale}/produits/${family.id}`}><span>{t.seeRange}</span><ChevronRight size={17} className="directional-icon" /></Link>
        </div>
      </RangeCardShell>;
    })}</div>
    <OtherRanges locale={locale} title={t.othersTitle} ranges={others} />
  </div></section>;
}

export function OtherRanges({ locale, title, ranges }: { locale: Locale; title: string; ranges: typeof families }) {
  return <div className="range-others"><h3>{title}</h3>
    <ul>{ranges.map(family => <li key={family.id}><Link href={`/${locale}/produits/${family.id}`}><bdi>{family.name}</bdi><span>{family.kind[locale]}</span><ChevronRight size={18} className="directional-icon" /></Link></li>)}</ul>
  </div>;
}

// « Nos exigences », still (for visitors who ask for reduced motion): the three requirements side by side, each with
// the fact behind it, on the charcoal band that carries EDDFA's symbol.
export const principleFacts = [0, 2, 3];
export function Exigences({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <section id="exigences" className="section band commitment"><Emblem side="start" edge="bottom" />
    <div className="container commitment-grid">
      <div className="commitment-copy">
        <h2 className="title">{t.commitment}</h2>
        <ul className="principles">{t.principles.map((principle, index) => {
          const fact = t.facts[principleFacts[index]];
          return <li key={principle.title}>
            <span className="principle-fact"><bdi>{fact.value}</bdi></span>
            <div><h3>{principle.title}</h3><p>{principle.text}</p>
              {index === 1 && <a className="text-link light" href="/eddfa/certificat-veritas-en442.pdf" target="_blank" rel="noopener noreferrer"><FileText size={15} /><span>{t.certificateLink}</span></a>}</div>
          </li>;
        })}</ul>
      </div>
      <figure className="commitment-photo"><Photo src={asset("scene-eden-80-detail")} alt={t.detailAlt} sizes="(max-width: 921px) 100vw, 40vw" /></figure>
    </div>
  </section>;
}
