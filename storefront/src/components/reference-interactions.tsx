"use client";

import { useEffect, useRef, useState } from "react";

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
