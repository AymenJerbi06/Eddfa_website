"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type RangeLink = { href: string; label: string; current: boolean };

// A pill track to move between the five ranges (in the range banner) or between the models of one range
// (on an article page). When it is wider than a phone screen, it scrolls sideways, starts on the current item
// and fades at its edges to show there is more.
export function RangeNav({ label, links, tone }: { label: string; links: RangeLink[]; tone: "glass" | "light" }) {
  const nav = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const box = nav.current, track = list.current;
    if (!box || !track) return;
    const update = () => { box.dataset.overflow = String(track.scrollWidth > track.clientWidth + 1); };
    update();
    const current = track.querySelector<HTMLElement>('[aria-current="page"]');
    const area = track.getBoundingClientRect();
    // Only scroll the track sideways while it is fully on screen, so the page itself never moves.
    if (current && box.dataset.overflow === "true" && area.top >= 0 && area.bottom <= window.innerHeight) current.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return <nav ref={nav} className={`range-nav ${tone}`} aria-label={label}>
    <ul ref={list}>{links.map(link => <li key={link.href}><Link href={link.href} aria-current={link.current ? "page" : undefined}><bdi>{link.label}</bdi></Link></li>)}</ul>
  </nav>;
}
