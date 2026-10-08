import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { z } from "zod";
import type { AdminOrder } from "./admin-types";
import { imageFilename, productSchema, promotionSchema, stockSchema } from "./admin-validation";
import { AdminError, backendUrl, basePrice, commerce, localImage, rawCatalog, toAdminProduct, toAdminPromotion, type RawCatalog, type RawProduct, type RawPromotion } from "./admin-server";

export async function loadAdminData(token: string) {
  const catalog = await rawCatalog(token);
  const promotions = await commerce<{ promotions: RawPromotion[] }>("/admin/promotions?limit=1000&fields=*application_method", token);
  const orders = await commerce<{ orders: AdminOrder[] }>("/admin/orders?limit=100&order=-created_at&fields=*shipping_address,*items,+total,+payment_status,+fulfillment_status", token);
  const owner = await commerce<{ user: { email: string } }>("/admin/users/me", token);
  return { products: catalog.products.map(product => toAdminProduct(product, catalog.store.default_location_id)), promotions: promotions.promotions.map(toAdminPromotion), orders: orders.orders, locationId: catalog.store.default_location_id, email: owner.user.email };
}
function findProduct(catalog: RawCatalog, id: string) {
  const product = catalog.products.find(product => product.id === id);
  if (!product) throw new AdminError("Produit introuvable.", 404);
  return product;
}
export async function saveProduct(token: string, input: z.infer<typeof productSchema>, id?: string) {
  const catalog = await rawCatalog(token);
  const original = id ? findProduct(catalog, id) : undefined;
  if (original && (original.metadata?.eddfa_kind === "bundle") !== (input.category === "bundle")) throw new AdminError("Un produit ne peut pas etre transforme en pack.");
  if (input.variants.some(variant => variant.id && !original?.variants.some(item => item.id === variant.id))) throw new AdminError("Version non autorisee.", 400);
  if (catalog.products.some(product => product.handle === input.handle && product.id !== id)) throw new AdminError("Cette adresse est deja utilisee par un autre produit.", 409);
  if (original && input.status === "draft" && catalog.products.some(product => product.id !== original.id && product.status === "published" && Array.isArray(product.metadata?.eddfa_bundle_components) && (product.metadata.eddfa_bundle_components as { variantId: string }[]).some(component => original.variants.some(variant => variant.id === component.variantId)))) throw new AdminError("Ce produit appartient a un pack publie. Masquez ce pack avant de masquer le produit.", 409);
  const inventoryItems = new Map<string, number>();
  if (input.category === "bundle") {
    for (const component of input.components) {
      const product = catalog.products.find(product => product.metadata?.eddfa_kind !== "bundle" && product.variants.some(variant => variant.id === component.variantId));
      const variant = product?.variants.find(variant => variant.id === component.variantId);
      if (input.status === "published" && product?.status !== "published") throw new AdminError("Publiez les produits du pack avant de publier le pack.", 409);
      if (!variant?.inventory_items?.length || variant.inventory_items.length !== 1) throw new AdminError("Un composant du pack est indisponible ou ne dispose pas d'un stock.");
      const item = variant.inventory_items[0];
      inventoryItems.set(item.inventory_item_id, (inventoryItems.get(item.inventory_item_id) ?? 0) + component.quantity * (item.required_quantity || 1));
    }
  }
  const images = input.images.map(filename => ({ url: new URL(`/static/${encodeURIComponent(filename)}`, backendUrl()).href }));
  for (const image of images) {
    const response = await fetch(image.url, { method: "HEAD", redirect: "error", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new AdminError("Une photo n'existe plus. Retirez-la ou ajoutez-la de nouveau.");
  }
  const categoryId = input.category !== "bundle" ? catalog.categories.find(category => category.handle === input.category)?.id : undefined;
  if (input.category !== "bundle" && !categoryId) throw new AdminError("Gamme non configuree.", 503);
  const metadata = { ...original?.metadata, eddfa_kind: input.category === "bundle" ? "bundle" : "product", eddfa_title_ar: input.titleAr, eddfa_description_ar: input.descriptionAr, eddfa_installation_fr: input.installation, eddfa_installation_ar: input.installationAr, eddfa_category: input.category, eddfa_tubes: input.tubes, eddfa_bundle_components: input.components };
  const variants = input.variants.map(variant => {
    const existing = original?.variants.find(item => item.id === variant.id);
    const dimensions = [variant.height, variant.width, variant.depth];
    const oldPrice = existing ? basePrice(existing) : undefined;
    return {
      ...(variant.id ? { id: variant.id } : {}), title: variant.title, sku: variant.sku || null,
      height: variant.height, width: variant.width, length: variant.depth,
      ...(!existing ? { manage_inventory: true, allow_backorder: false } : {}),
      prices: variant.price == null ? [] : [{ ...(oldPrice ? { id: oldPrice.id } : {}), currency_code: "tnd", amount: variant.price }],
      metadata: { ...existing?.metadata, eddfa_dimensions_mm: dimensions, eddfa_thermal_power: variant.thermalPower, eddfa_resistance: variant.resistance, eddfa_centres: variant.centres, eddfa_weight_kg: variant.weight },
      options: { Version: variant.title },
      ...(!original && input.category === "bundle" ? { inventory_items: [...inventoryItems].map(([inventory_item_id, required_quantity]) => ({ inventory_item_id, required_quantity })) } : {}),
    };
  });
  if (original) {
    const option = original.options.find(option => option.title === "Version");
    const newValues = input.variants.map(variant => variant.title).filter(title => !option?.values.some(value => value.value === title));
    const removed = original.variants.filter(variant => !input.variants.some(item => item.id === variant.id));
    if (removed.some(variant => variant.inventory_items?.some(item => item.inventory?.location_levels?.some(level => Number(level.reserved_quantity) > 0)))) throw new AdminError("Une version reservee par une commande ne peut pas etre supprimee.", 409);
    if (removed.some(variant => catalog.products.some(product => product.id !== original.id && Array.isArray(product.metadata?.eddfa_bundle_components) && (product.metadata.eddfa_bundle_components as { variantId: string }[]).some(component => component.variantId === variant.id)))) throw new AdminError("Une version est utilisee dans un pack. Modifiez ce pack avant de la retirer.", 409);
    if (newValues.length) {
      if (!option) throw new AdminError("Les versions de ce produit necessitent une verification technique.");
      await commerce(`/admin/products/${id}/options/batch`, token, { update: [{ product_option_id: option.id, add: newValues.map(value => ({ value })) }] }, "POST");
    }
    // Native batch workflows preserve pricing and inventory links when versions change.
    const updateVariants = variants.filter(variant => variant.id);
    const createVariants = variants.filter(variant => !variant.id);
    await commerce(`/admin/products/${id}/variants/batch`, token, { update: updateVariants, create: createVariants, delete: removed.map(variant => variant.id) }, "POST");
    if (input.category === "bundle") {
      const variant = original.variants[0];
      const links = variant.inventory_items ?? [];
      await commerce(`/admin/products/${id}/variants/inventory-items/batch`, token, {
        create: [...inventoryItems].filter(([item]) => !links.some(link => link.inventory_item_id === item)).map(([inventory_item_id, required_quantity]) => ({ variant_id: variant.id, inventory_item_id, required_quantity })),
        update: [...inventoryItems].filter(([item]) => links.some(link => link.inventory_item_id === item)).map(([inventory_item_id, required_quantity]) => ({ variant_id: variant.id, inventory_item_id, required_quantity })),
        delete: links.filter(link => !inventoryItems.has(link.inventory_item_id)).map(link => ({ variant_id: variant.id, inventory_item_id: link.inventory_item_id })),
      }, "POST");
    }
    await commerce(`/admin/products/${id}`, token, { title: input.title, handle: input.handle, description: input.description, status: input.status, images, thumbnail: images[0]?.url ?? null, categories: categoryId ? [{ id: categoryId }] : [], metadata }, "POST");
  } else {
    const created = await commerce<{ product: RawProduct }>("/admin/products", token, { title: input.title, handle: input.handle, description: input.description, status: input.status, images, thumbnail: images[0]?.url ?? null, categories: categoryId ? [{ id: categoryId }] : [], metadata, sales_channels: [{ id: catalog.store.default_sales_channel_id }], options: [{ title: "Version", values: input.variants.map(variant => variant.title) }], variants }, "POST");
    id = created.product.id;
  }
  const saved = await rawCatalog(token);
  return toAdminProduct(findProduct(saved, id!), saved.store.default_location_id);
}
export async function removeProduct(token: string, id: string) {
  const catalog = await rawCatalog(token);
  const original = findProduct(catalog, id);
  const variants = new Set(original.variants.map(variant => variant.id));
  if (original.variants.some(variant => variant.inventory_items?.some(item => item.inventory?.location_levels?.some(level => Number(level.reserved_quantity) > 0)))) throw new AdminError("Ce produit est reserve par une commande. Masquez-le au lieu de le supprimer.", 409);
  if (catalog.products.some(product => product.id !== id && Array.isArray(product.metadata?.eddfa_bundle_components) && (product.metadata.eddfa_bundle_components as { variantId: string }[]).some(component => variants.has(component.variantId)))) throw new AdminError("Ce produit est utilise dans un pack. Modifiez ou supprimez le pack d'abord.", 409);
  await commerce(`/admin/products/${id}`, token, undefined, "DELETE");
}
export async function savePromotion(token: string, input: z.infer<typeof promotionSchema>, id?: string) {
  const existing = await commerce<{ promotions: RawPromotion[] }>("/admin/promotions?limit=1000&fields=*application_method", token);
  if (id && !existing.promotions.some(item => item.id === id)) throw new AdminError("Code introuvable.", 404);
  if (existing.promotions.some(promo => promo.id !== id && promo.code.toUpperCase() === input.code)) throw new AdminError("Ce code existe deja.", 409);
  const body = { code: input.code, status: input.status, limit: input.limit, application_method: { type: input.type, value: input.value, currency_code: "tnd", target_type: "order", allocation: "across" }, ...(!id ? { type: "standard", is_automatic: false } : {}) };
  const result = await commerce<{ promotion: RawPromotion }>(id ? `/admin/promotions/${id}?fields=*application_method` : "/admin/promotions?fields=*application_method", token, body, "POST");
  return toAdminPromotion(result.promotion);
}
export async function saveStock(token: string, input: z.infer<typeof stockSchema>) {
  const catalog = await rawCatalog(token);
  if (input.locationId !== catalog.store.default_location_id) throw new AdminError("Emplacement non autorise.", 400);
  const product = catalog.products.find(product => product.metadata?.eddfa_kind !== "bundle" && product.variants.some(variant => variant.inventory_items?.some(item => item.inventory_item_id === input.inventoryId)));
  const inventory = product?.variants.flatMap(variant => variant.inventory_items ?? []).find(item => item.inventory_item_id === input.inventoryId);
  if (!inventory || !product) throw new AdminError("Stock introuvable.", 404);
  const level = inventory.inventory?.location_levels?.find(level => level.location_id === input.locationId);
  if (input.quantity < Number(level?.reserved_quantity ?? 0)) throw new AdminError("Le stock ne peut pas etre inferieur a la quantite reservee.", 409);
  await commerce(level ? `/admin/inventory-items/${input.inventoryId}/location-levels/${input.locationId}` : `/admin/inventory-items/${input.inventoryId}/location-levels`, token, { stocked_quantity: input.quantity, ...(!level ? { location_id: input.locationId } : {}) }, "POST");
  await commerce(`/admin/products/${product.id}`, token, { metadata: { ...product.metadata, eddfa_stock_confirmed: true } }, "POST");
}
export async function uploadImage(token: string, request: Request) {
  await commerce("/admin/users/me", token);
  if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) throw new AdminError("La photo doit peser moins de 10 Mo.", 413);
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new AdminError("Choisissez une photo JPG, PNG ou WebP de moins de 10 Mo.");
  let bytes: Buffer;
  try {
    bytes = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000, animated: false }).rotate().resize(1800, 1800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch { throw new AdminError("Cette photo est illisible. Essayez un autre fichier."); }
  const form = new FormData();
  form.append("files", new Blob([new Uint8Array(bytes)], { type: "image/webp" }), `eddfa-${randomUUID()}.webp`);
  const result = await commerce<{ files: { url: string }[] }>("/admin/uploads", token, form, "POST");
  const filename = localImage(result.files[0]?.url);
  if (!filename || !imageFilename.safeParse(filename).success) throw new AdminError("La photo n'a pas pu etre ajoutee.", 500);
  return filename;
}
