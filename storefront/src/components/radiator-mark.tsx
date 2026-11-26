// EDDFA's mark: the radiator-shaped E of its logo (two rails, six bars in three pairs), drawn as a towel radiator, with
// the logo's own proportions (measured on logo_transparent.png). Where something comes alive (the guide finding a
// model, a quote being prepared, « Nos exigences » scrolling by), its bars warm up one by one from the bottom, cold
// aluminium to gold. Colours come from CSS (--mark-rail, --mark-bar, --mark-warm), so the drawing itself holds none.
const barRows = [153, 137, 96, 80, 31, 16];
export const markBars = barRows.length;

export function RadiatorMark({ warm = 0, className = "" }: { warm?: number; className?: string }) {
  const lit = Math.max(0, Math.min(barRows.length, Math.round(warm)));
  return <svg className={`radiator-mark${className ? ` ${className}` : ""}`} viewBox="0 0 164 175" aria-hidden="true" focusable="false">
    <rect className="rail" x="2" y="2" width="23" height="171" rx="11.5" />
    <rect className="rail" x="140" y="2" width="22" height="171" rx="11" />
    {barRows.map((y, index) => <rect key={y} className={index < lit ? "bar warm" : "bar"} style={{ "--n": index } as React.CSSProperties} x="14" y={y} width="115" height="10.5" rx="5.25" />)}
  </svg>;
}
