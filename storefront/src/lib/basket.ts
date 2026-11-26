import { clampQuantity, type QuoteSelection } from "./quote";

// The visitor's quote basket: what they add while exploring the site (a model's version, the guide's advice, the
// calculator's advice), kept in this browser until they send their request from « Obtenir un devis ». Lines use the
// quote page's ids: v:<version>, p:<product>, f:<range>.
export const basketKey = "eddfa-devis";
export const basketEvent = "eddfa-devis-change";

export function parseBasket(raw: string | null): QuoteSelection {
  try {
    const data: unknown = JSON.parse(raw ?? "{}");
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const selection: QuoteSelection = {};
    for (const [id, quantity] of Object.entries(data as Record<string, unknown>)) {
      if (/^[vpf]:[a-z0-9-]{1,60}$/.test(id) && typeof quantity === "number" && quantity > 0) selection[id] = clampQuantity(quantity);
    }
    return selection;
  } catch {
    return {};
  }
}

export function addLine(selection: QuoteSelection, id: string, quantity = 1): QuoteSelection {
  return { ...selection, [id]: clampQuantity((selection[id] ?? 0) + quantity) };
}

/** The basket and the lines a link asked for (?ref=, ?gamme=) together; the link's quantities win. */
export function mergeSelections(basket: QuoteSelection, requested: QuoteSelection): QuoteSelection {
  return { ...basket, ...requested };
}

export const basketSize = (selection: QuoteSelection) => Object.values(selection).filter(quantity => quantity > 0).length;

export function readBasket(): QuoteSelection {
  try { return parseBasket(window.localStorage.getItem(basketKey)); } catch { return {}; }
}

export function writeBasket(selection: QuoteSelection) {
  try { window.localStorage.setItem(basketKey, JSON.stringify(selection)); } catch { /* private mode: the basket lives for this page only */ }
  window.dispatchEvent(new Event(basketEvent));
}

export function addToBasket(id: string, quantity = 1) {
  writeBasket(addLine(readBasket(), id, quantity));
}
