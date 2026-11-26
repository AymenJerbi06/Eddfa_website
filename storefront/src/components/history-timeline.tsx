"use client";

import { useRef, useState } from "react";
import { Asterisk } from "lucide-react";
import { messages, type Locale } from "@/lib/content";

// "Historique" as a timeline: one chapter at a time, the gold line fills up to the chosen step. On phones the same
// steps stack with their titles and the chosen chapter opens under its own step (CSS order from --i and --active).
export function HistoryTimeline({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = t.history.length;
  const select = (index: number) => { const next = (index + count) % count; setActive(next); tabs.current[next]?.focus(); };
  const forward = locale === "ar" ? "ArrowLeft" : "ArrowRight";
  const back = locale === "ar" ? "ArrowRight" : "ArrowLeft";
  return <section id="historique" className="section plate history-section"><div className="container">
    <div className="section-intro"><h2 className="title">{t.historyTitle}</h2></div>
    <div className="timeline" style={{ "--progress": count > 1 ? active / (count - 1) : 1, "--active": active } as React.CSSProperties}>
      <div className="timeline-steps" role="tablist" aria-label={t.historyTitle}>
        {t.history.map((chapter, index) => <button key={chapter.title} ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`history-tab-${index}`} aria-selected={active === index} aria-controls="history-panel" tabIndex={active === index ? 0 : -1} style={{ "--i": index } as React.CSSProperties} className={index <= active ? "reached" : undefined}
          onClick={() => setActive(index)}
          onKeyDown={event => {
            if (event.key === forward) { event.preventDefault(); select(index + 1); }
            if (event.key === back) { event.preventDefault(); select(index - 1); }
            if (event.key === "Home") { event.preventDefault(); select(0); }
            if (event.key === "End") { event.preventDefault(); select(count - 1); }
          }}>
          <span className="timeline-dot"><Asterisk size={15} strokeWidth={3} /></span><span className="timeline-label">{chapter.title}</span>
        </button>)}
      </div>
      <div id="history-panel" role="tabpanel" aria-labelledby={`history-tab-${active}`} className="timeline-panel"><div key={active} className="timeline-copy"><h3>{t.history[active].title}</h3><p>{t.history[active].text}</p></div></div>
    </div>
  </div></section>;
}
