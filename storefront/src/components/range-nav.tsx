"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { reducedMotion, stretchKeyframes } from "./motion";

export type RangeLink = { href: string; label: string; current: boolean };

// The buttons at the top of a page's first plate, drawn like the Photos page's « Tout / EDEN / ECLAT » (the user, 26
// November 2026): one track, its buttons side by side and the same width, the chosen one on a charcoal pill with brass
// words, and the pill glides to the next choice as it does there. They lead to the five ranges, to the models of a range,
// or to the chapters of « Présentation ». For parts of the same page, the chosen button is the part on screen, and a tap
// glides the page there while the choice stays on the tapped button. On phones, more than three buttons go on two lines
// (three, then the rest sharing the width) instead of running off the screen.
export function RangeNav({ label, links }: { label: string; links: RangeLink[] }) {
  const [spot, setSpot] = useState(0);
  // Set by a tap on a part of the page: the choice stays on it until the page has got there (two and a half seconds at most).
  const hold = useRef<{ index: number; until: number } | null>(null);
  const nav = useRef<HTMLElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const hrefs = links.map(link => link.href).join(" ");
  useEffect(() => {
    const parts = hrefs.split(" ").map(href => href.startsWith("#") ? document.getElementById(href.slice(1)) : null);
    if (!parts.some(Boolean)) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const root = document.documentElement;
      // At the very bottom, the last part on screen is the one being read, even when it cannot reach the line.
      const bottom = window.scrollY + window.innerHeight >= root.scrollHeight - 2;
      let found = 0;
      parts.forEach((part, index) => {
        const top = part?.getBoundingClientRect().top;
        if (top !== undefined && (top <= line || (bottom && top < window.innerHeight))) found = index;
      });
      const held = hold.current;
      if (held) {
        if (found !== held.index && performance.now() < held.until) return;
        hold.current = null;
      }
      setSpot(found);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); };
  }, [hrefs]);
  const current = links.findIndex(link => link.current);
  const chosen = current >= 0 ? current : links.some(link => link.href.startsWith("#")) ? spot : -1;

  // The pill sits under the chosen button, measured once the page runs; until then (and without script) the chosen
  // button carries the charcoal itself. A new choice glides the pill there; a change of layout moves it at once.
  const chosenNow = useRef(chosen);
  const placePill = useRef<(glide: boolean, far?: number) => void>(() => {});
  useLayoutEffect(() => {
    const box = nav.current;
    const thumb = pill.current;
    if (!box || !thumb) return;
    const place = (glide: boolean, far = 1) => {
      const button = box.querySelectorAll<HTMLElement>("a")[chosenNow.current];
      if (!button) { box.removeAttribute("data-pill"); return; }
      // On its way the pill stretches a little and settles when it lands (squash and stretch, follow through).
      if (glide && box.hasAttribute("data-pill") && !reducedMotion()) thumb.animate(stretchKeyframes(far), { duration: 480, easing: "ease-out" });
      // Measured to the fraction of a pixel, in the track's own units even while a section around it is scaled.
      const outer = box.getBoundingClientRect();
      const inner = button.getBoundingClientRect();
      const ratio = box.offsetWidth ? outer.width / box.offsetWidth : 1;
      const scale = Math.abs(ratio - 1) > 0.01 ? ratio : 1;
      if (!glide) thumb.style.transition = "none";
      thumb.style.translate = `${(inner.left - outer.left) / scale}px ${(inner.top - outer.top) / scale}px`;
      thumb.style.width = `${inner.width / scale}px`;
      thumb.style.height = `${inner.height / scale}px`;
      box.setAttribute("data-pill", "");
      if (!glide) { void thumb.offsetWidth; thumb.style.transition = ""; }
    };
    placePill.current = place;
    place(false);
    let first = true;
    const observer = new ResizeObserver(() => { if (!first) place(false); first = false; });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (chosenNow.current === chosen) return;
    const far = chosenNow.current >= 0 && chosen >= 0 ? Math.abs(chosen - chosenNow.current) : 1;
    chosenNow.current = chosen;
    placePill.current(true, far);
  }, [chosen]);

  return <nav ref={nav} className="range-nav" aria-label={label} style={{ "--count": links.length } as React.CSSProperties}>
    <span ref={pill} className="range-pill" aria-hidden="true" />
    <ul>{links.map((link, index) => {
      const part = link.href.startsWith("#");
      return <li key={link.href}><Link href={link.href} className={index === chosen ? "chosen" : undefined} aria-current={link.current ? "page" : part && index === chosen ? "location" : undefined} onClick={() => { if (part) { hold.current = { index, until: performance.now() + 2500 }; setSpot(index); } }}><bdi>{link.label}</bdi></Link></li>;
    })}</ul>
  </nav>;
}
