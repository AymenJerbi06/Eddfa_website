"use client";

import { useId } from "react";

// EDDFA's symbol behind a section: the radiator-shaped E of the logo (the same proportions as radiator-mark.tsx), large
// and cut by the section's edge, shaded like tubes in relief, in tints of its ground, as if the radiator were pressed
// into the marble or the charcoal. The tints come from CSS (--emblem-hi, --emblem-mid, --emblem-lo), so it takes its
// colours from the place it sits in. It alternates sides down the page and never takes a click.
const bars = [16, 31, 80, 96, 137, 153];

export function Emblem({ side = "end", edge = "top" }: { side?: "start" | "end"; edge?: "top" | "bottom" }) {
  const id = `emblem${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return <svg className={`emblem ${side} ${edge}`} viewBox="0 0 164 175" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-bar`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="hi" /><stop offset="0.42" className="mid" /><stop offset="1" className="lo" /></linearGradient>
      <linearGradient id={`${id}-rail`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" className="hi" /><stop offset="0.42" className="mid" /><stop offset="1" className="lo" /></linearGradient>
    </defs>
    <rect x="2" y="2" width="23" height="171" rx="11.5" fill={`url(#${id}-rail)`} />
    <rect x="140" y="2" width="22" height="171" rx="11" fill={`url(#${id}-rail)`} />
    {bars.map(y => <rect key={y} x="14" y={y} width="115" height="10.5" rx="5.25" fill={`url(#${id}-bar)`} />)}
  </svg>;
}
