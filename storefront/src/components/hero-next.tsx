"use client";

import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";

// The cue at the bottom of the first section: « Fabricant tunisien » over a thin rail where a light runs down, and an
// arrow in a thin ring (client request, 25 November 2026) that keeps bouncing until the visitor scrolls (the user, 25
// November 2026, late night). It answers the visitor: pointing at it or focusing it fills the ring and stretches the
// rail towards it, pressing it sinks the ring, and a click glides the page to the next section. As the page scrolls,
// the light fills the rail, the ring follows it down and the cue fades away; back at the top it returns and bounces
// again. The scroll sets --cue, from 0 to 1, and data-scrolled; the look is in globals.css, with the first section's
// other rules.
export function HeroNext({ label, target }: { label: string; target: string }) {
  const cue = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const node = cue.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // Gone once half of the first section has been scrolled.
      const run = Math.max(240, (node.parentElement?.offsetHeight ?? window.innerHeight) * 0.5);
      const progress = Math.min(1, Math.max(0, window.scrollY / run));
      node.style.setProperty("--cue", progress.toFixed(3));
      node.toggleAttribute("data-scrolled", progress > 0.005);
      node.toggleAttribute("data-gone", progress >= 0.98);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return <a ref={cue} className="hero-next" href={`#${target}`}><span>{label}</span><span className="cue-ring" aria-hidden="true"><ArrowDown size={16} /></span></a>;
}
