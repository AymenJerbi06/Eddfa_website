import { products } from "./content";
import { blankVariant, type AdminData, type AdminProduct } from "./admin-types";
import { productSchema, promotionSchema, stockSchema } from "./admin-validation";

export const demoPhotos = new Set(products.flatMap(product => product.gallery.map(path => path.split("/").pop()!.replace(/\.webp$/, ".optimized.webp"))));
const demoId = (kind: string) => `${kind}_${crypto.randomUUID().replace(/-/g, "")}`;

export function makeDemoCatalog(email: string): AdminData {
  return {
    email, locationId: "sloc_demonstration", promotions: [], orders: [],
    products: products.map(product => ({
      id: `prod_${product.id.replace(/-/g, "")}`, handle: product.handle,
      title: product.title.fr, titleAr: product.title.ar, description: product.description.fr,
      descriptionAr: product.description.ar, installation: product.installation.fr,
      installationAr: product.installation.ar, category: product.category, status: "published",
      images: product.gallery.map(path => path.split("/").pop()!.replace(/\.webp$/, ".optimized.webp")),
      tubes: product.tubes ?? null, components: [], variants: product.variants.map(variant => ({
        ...blankVariant(), id: `variant_${variant.id.replace(/-/g, "")}`, sku: "",
        title: product.category === "eden" ? `${variant.dimensions[1]} mm` : `${variant.resistance} W`,
        height: variant.dimensions[0], width: variant.dimensions[1], depth: variant.dimensions[2],
        thermalPower: variant.thermalPower, resistance: variant.resistance ?? null,
        centres: variant.centres ?? null, weight: variant.weight ?? null,
        inventoryId: `iitem_${variant.id.replace(/-/g, "")}`, stocked: 0, reserved: 0,
      })),
    })),
  };
}

export function mutateDemoCatalog(state: AdminData, path: string, body: unknown, method: string): unknown {
  const [resource, id, extra] = path.split("/");
  if (extra || (id && !/^(prod|promo)_[a-zA-Z0-9]+$/.test(id))) throw new Error("Element invalide.");
  if (resource === "stock" && method === "POST") {
    const input = stockSchema.parse(body);
    const variant = state.products.flatMap(product => product.variants).find(item => item.inventoryId === input.inventoryId);
    if (!variant || input.locationId !== state.locationId) throw new Error("Stock introuvable.");
    if (input.quantity < (variant.reserved ?? 0)) throw new Error("Le stock ne peut pas etre inferieur aux reservations.");
    variant.stocked = input.quantity;
    return { saved: true };
  }
  if (resource === "products" && method === "POST") {
    const input = productSchema.parse(body);
    const original = id ? state.products.find(product => product.id === id) : undefined;
    if (id && !original) throw new Error("Produit introuvable.");
    if (original && (original.category === "bundle") !== (input.category === "bundle")) throw new Error("Un produit ne peut pas etre transforme en pack.");
    if (state.products.some(product => product.handle === input.handle && product.id !== id)) throw new Error("Cette adresse est deja utilisee.");
    if (input.variants.some(variant => variant.id && !original?.variants.some(item => item.id === variant.id))) throw new Error("Version invalide.");
    if (input.components.some(component => !state.products.some(product => product.category !== "bundle" && product.variants.some(variant => variant.id === component.variantId)))) throw new Error("Composant introuvable.");
    const removed = original?.variants.filter(variant => !input.variants.some(item => item.id === variant.id)) ?? [];
    if (removed.some(variant => state.products.some(product => product.components.some(component => component.variantId === variant.id)))) throw new Error("Cette version est utilisee dans un pack.");
    const saved: AdminProduct = { ...input, id: id ?? demoId("prod"), variants: input.variants.map(variant => {
      const previous = original?.variants.find(item => item.id === variant.id);
      return { ...variant, id: variant.id ?? demoId("variant"), inventoryId: previous?.inventoryId ?? demoId("iitem"), stocked: previous?.stocked ?? 0, reserved: previous?.reserved ?? 0 };
    }) };
    state.products = original ? state.products.map(product => product.id === id ? saved : product) : [...state.products, saved];
    return { product: structuredClone(saved) };
  }
  if (resource === "promotions" && method === "POST") {
    const input = promotionSchema.parse(body);
    const original = state.promotions.find(promo => promo.id === id);
    if (id && !original) throw new Error("Code introuvable.");
    if (state.promotions.some(promo => promo.code === input.code && promo.id !== id)) throw new Error("Ce code existe deja.");
    const saved = { ...input, id: id ?? demoId("promo"), used: original?.used ?? 0 };
    state.promotions = original ? state.promotions.map(promo => promo.id === id ? saved : promo) : [...state.promotions, saved];
    return { promotion: structuredClone(saved) };
  }
  if (method === "DELETE" && id && resource === "products") {
    const product = state.products.find(item => item.id === id);
    if (!product) throw new Error("Produit introuvable.");
    if (state.products.some(item => item.components.some(component => product.variants.some(variant => variant.id === component.variantId)))) throw new Error("Ce produit est utilise dans un pack.");
    state.products = state.products.filter(item => item.id !== id);
    return { deleted: true };
  }
  if (method === "DELETE" && id && resource === "promotions") {
    if (!state.promotions.some(promo => promo.id === id)) throw new Error("Code introuvable.");
    state.promotions = state.promotions.filter(promo => promo.id !== id);
    return { deleted: true };
  }
  throw new Error("Action indisponible dans la demonstration.");
}
