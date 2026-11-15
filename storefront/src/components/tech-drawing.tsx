import { messages, type CatalogProduct, type InstallationKind, type Locale, type ProductVariant } from "@/lib/content";

// The technical sheet's drawing: the towel radiator seen from the front, at one scale for every model, so a taller
// model is drawn taller. Its height, width and connection centres (entraxe) come from the chosen version.
// Tubes are evenly spaced (EDEN's real tube count; for ECLAT, one about every 58 mm): it is a schematic, and says so.
const SCALE = 0.24; // px per mm: 1 200 mm draws 288 px tall
const BASE = 330;   // where every radiator ends, so models of different heights stand on one line
const LEFT = 104;   // x of the left collector

export function TechDrawing({ locale, product, variant, kind }: { locale: Locale; product: CatalogProduct; variant: ProductVariant; kind: InstallationKind | null }) {
  const t = messages[locale];
  const [height, width] = variant.dimensions;
  const h = height * SCALE, w = width * SCALE;
  const top = BASE - h, right = LEFT + w;
  const rail = 6;
  const tubes = product.tubes ?? Math.max(6, Math.round(height / 58));
  const first = top + 9, last = BASE - 9;
  const pitch = tubes > 1 ? (last - first) / (tubes - 1) : 0;
  const centres = variant.centres;
  const leftAxis = LEFT + rail / 2, rightAxis = right - rail / 2;
  const label = [`${t.height} ${height} mm`, `${t.width} ${width} mm`, ...(centres !== undefined ? [`${t.centres} ${centres} mm`] : [])].join(", ");
  return <svg className="tech-drawing" viewBox="0 0 300 384" role="img" aria-label={`${product.title[locale]} · ${label}`}>
    <g className="drawing-body" key={variant.id}>
      <rect className="part" x={LEFT} y={top} width={rail} height={h} rx={3} />
      <rect className="part" x={right - rail} y={top} width={rail} height={h} rx={3} />
      {Array.from({ length: tubes }, (_, index) => <rect key={index} className="part tube" x={LEFT + rail - 1} y={first + index * pitch - 2.4} width={w - 2 * rail + 2} height={4.8} rx={2.4} />)}
      {kind === "hydraulic" && [leftAxis, rightAxis].map(x => <g key={x} className="part"><rect x={x - 2} y={BASE} width={4} height={7} /><rect x={x - 5} y={BASE + 7} width={10} height={6} rx={1.5} /></g>)}
      {kind === "electric-wall" && <g className="part"><rect x={rightAxis - 4} y={BASE} width={8} height={15} rx={2} /><path className="cable" d={`M ${rightAxis} ${BASE + 15} q 0 12 14 14`} /></g>}
      {kind === "electric-floor" && <g className="part">
        {[leftAxis, rightAxis].map(x => <path key={x} className="foot" d={`M ${x} ${BASE - 2} v 14 M ${x - 12} ${BASE + 14} q 12 -9 24 0`} />)}
        <rect x={LEFT - 7} y={BASE - 24} width={7} height={15} rx={2} />
      </g>}
    </g>
    <g className="dimension">
      <path d={`M ${LEFT - 24} ${top} H ${LEFT - 6} M ${LEFT - 24} ${BASE} H ${LEFT - 6} M ${LEFT - 18} ${top + 1} V ${BASE - 1}`} />
      <path className="arrow" d={`M ${LEFT - 21} ${top + 7} L ${LEFT - 18} ${top + 1} L ${LEFT - 15} ${top + 7} M ${LEFT - 21} ${BASE - 7} L ${LEFT - 18} ${BASE - 1} L ${LEFT - 15} ${BASE - 7}`} />
      <text x={LEFT - 28} y={top + h / 2} transform={`rotate(-90 ${LEFT - 28} ${top + h / 2})`} textAnchor="middle">{`H ${height}`}</text>
    </g>
    <g className="dimension">
      <path d={`M ${LEFT} ${top - 26} V ${top - 8} M ${right} ${top - 26} V ${top - 8} M ${LEFT + 1} ${top - 20} H ${right - 1}`} />
      <path className="arrow" d={`M ${LEFT + 7} ${top - 23} L ${LEFT + 1} ${top - 20} L ${LEFT + 7} ${top - 17} M ${right - 7} ${top - 23} L ${right - 1} ${top - 20} L ${right - 7} ${top - 17}`} />
      <text x={LEFT + w / 2} y={top - 27} textAnchor="middle">{`L ${width}`}</text>
    </g>
    {kind === "hydraulic" && centres !== undefined && <g className="dimension">
      <path d={`M ${leftAxis} ${BASE + 16} V ${BASE + 34} M ${rightAxis} ${BASE + 16} V ${BASE + 34} M ${leftAxis + 1} ${BASE + 28} H ${rightAxis - 1}`} />
      <path className="arrow" d={`M ${leftAxis + 7} ${BASE + 25} L ${leftAxis + 1} ${BASE + 28} L ${leftAxis + 7} ${BASE + 31} M ${rightAxis - 7} ${BASE + 25} L ${rightAxis - 1} ${BASE + 28} L ${rightAxis - 7} ${BASE + 31}`} />
      <text x={(leftAxis + rightAxis) / 2} y={BASE + 46} textAnchor="middle">{`E ${centres}`}</text>
    </g>}
  </svg>;
}
