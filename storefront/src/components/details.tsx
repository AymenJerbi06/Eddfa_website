"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { asset, familyById, messages, type Locale } from "@/lib/content";
import { Photo } from "./media";
import { Lines } from "./lines";

// « Regardez de près. »: the EDEN 80 up close, with four points to open. Each point (on the photo, or in the list beside
// it) shows what EDDFA says about that part, in EDDFA's own words: the size for the room, the aluminium, the guarantee
// against corrosion, the installation. Once the visitor picks a point, the photo moves in on it, and the points move
// with the photo; pointing at a line of the list lights its point, and the other way round. The photo is not mirrored
// in Arabic, so the points keep their place on it.
const ZOOM = 1.08;
const clamp = (value: number) => Math.min(94, Math.max(6, value));

export function DetailSpots({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const eden = familyById("eden");
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [near, setNear] = useState(false);
  if (!eden) return null;
  const spots = [
    { x: 24, y: 10, title: eden.highlights[4][locale], text: eden.intro[0][locale], link: { href: `/${locale}/produits/eden#choisir`, label: t.sizingLink } },
    { x: 28, y: 46, title: t.principles[0].title, text: t.principles[0].text },
    { x: 67, y: 28, title: eden.highlights[1][locale], text: eden.intro[1][locale] },
    { x: 62, y: 82, title: eden.highlights[2][locale], text: eden.summary[locale] },
  ];
  const focus = spots[active];
  const scale = near ? ZOOM : 1;
  // Where a point lands once the photo has moved in on the chosen one (the same scale, around the same centre).
  const place = (value: number, centre: number) => clamp(centre + (value - centre) * scale);
  const pick = (index: number) => { setActive(index); setNear(true); };
  return <section className="section band details-section"><div className="container details-grid">
    <figure className={`details-photo${near ? " near" : ""}`} style={{ "--fx": `${focus.x}%`, "--fy": `${focus.y}%`, "--zoom": scale } as React.CSSProperties}>
      <Photo src={asset("scene-eden-80-detail")} alt={t.detailAlt} sizes="(max-width: 921px) 100vw, 46vw" />
      {spots.map((spot, index) => <button key={spot.title} type="button" className={`spot${index === active ? " active" : ""}${index === hover ? " hover" : ""}`} style={{ left: `${place(spot.x, focus.x)}%`, top: `${place(spot.y, focus.y)}%` }} aria-label={`${index + 1}. ${spot.title}`} aria-pressed={index === active}
        onClick={() => pick(index)} onPointerEnter={() => setHover(index)} onPointerLeave={() => setHover(null)}><span>{index + 1}</span></button>)}
    </figure>
    <div className="details-copy">
      <h2 className="title"><Lines text={t.detailsTitle} /></h2>
      <p className="details-lead">{t.detailsText}</p>
      <ol className="spot-list" onPointerLeave={() => setHover(null)}>{spots.map((spot, index) => <li key={spot.title} className={`${index === active ? "active" : ""}${index === hover ? " hover" : ""}`.trim() || undefined} onPointerEnter={() => setHover(index)}>
        <button type="button" aria-expanded={index === active} onClick={() => pick(index)} onFocus={() => setHover(index)} onBlur={() => setHover(null)}><span className="spot-n" aria-hidden="true">{index + 1}</span><strong>{spot.title}</strong></button>
        {index === active && <div className="spot-body"><p>{spot.text}</p>{spot.link && <Link className="text-link light" href={spot.link.href}><span>{spot.link.label}</span><ChevronRight size={16} className="directional-icon" /></Link>}</div>}
      </li>)}</ol>
    </div>
  </div></section>;
}
