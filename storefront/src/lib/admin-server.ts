import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import type { AdminProduct, AdminPromotion, AdminVariant } from "./admin-types";
import { sameOrigin } from "./admin-validation";
import { isClientPreview } from "./deployment-policy";

export const ADMIN_COOKIE = "eddfa_admin";
export class AdminError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function backendUrl() {
  if (isClientPreview()) throw new AdminError("L'administration est desactivee dans cette presentation.", 503);
  const value = process.env.MEDUSA_BACKEND_URL;
  if (!value || process.env.EDDFA_LOCAL_ADMIN !== "true") throw new AdminError("L'administration locale n'est pas configuree.", 503);
  const url = new URL(value);
  if (url.origin !== "http://127.0.0.1:9000") throw new AdminError("Configuration du serveur local invalide.", 503);
  return url;
}
export function assertAdminOrigin(request: Request, mutation = false) {
  backendUrl();
  const origin = `http://${request.headers.get("host")}`;
  const allowed = ["http://127.0.0.1:3000", "http://localhost:3000"];
  if (!allowed.includes(origin) || (mutation && !sameOrigin(request.headers.get("origin"), origin, request.headers.get("sec-fetch-site")))) throw new AdminError("Requete non autorisee.", 403);
}
export async function commerce<T>(route: string, token?: string, body?: unknown, method = "GET"): Promise<T> {
  let response: Response;
  try {
    response = await fetch(new URL(route, backendUrl()), {
      method, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000),
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}) },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch { throw new AdminError("Le serveur est momentanement indisponible. Reessayez dans quelques instants.", 503); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status === 401 ? "Email ou mot de passe incorrect, ou session expiree." : response.status === 403 ? "Ce compte n'a pas acces a l'administration." : response.status === 429 ? "Trop de tentatives. Reessayez dans 15 minutes." : typeof data.message === "string" ? data.message : "Enregistrement impossible.";
    throw new AdminError(message, response.status);
  }
  return data;
}
export async function adminToken() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) throw new AdminError("Connectez-vous pour acceder a l'administration.", 401);
  return token;
}
export async function currentAdmin() {
  try {
    const token = await adminToken();
    const result = await commerce<{ user: { email: string } }>("/admin/users/me", token);
    return { email: result.user.email };
  } catch (error) {
    if (error instanceof AdminError && [401, 403].includes(error.status)) return null;
    throw error;
  }
}
export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (Number(request.headers.get("content-length")) > 250000) throw new AdminError("Formulaire trop volumineux.", 413);
  const raw = await request.text();
  if (raw.length > 250000) throw new AdminError("Formulaire trop volumineux.", 413);
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new AdminError("Formulaire invalide."); }
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new AdminError(parsed.error.issues[0]?.message ?? "Verifiez les champs du formulaire.");
  return parsed.data;
}
export function adminJson(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
export function adminFailure(error: unknown) {
  return adminJson({ message: error instanceof AdminError ? error.message : "Une erreur est survenue. Reessayez." }, error instanceof AdminError ? error.status : 500);
}

export type RawPrice = { id: string; amount: number; currency_code: string; price_list_id?: string; rules_count?: number; min_quantity?: number; max_quantity?: number };
export type RawInventoryLink = { inventory_item_id: string; required_quantity: number; inventory?: { location_levels?: { location_id: string; stocked_quantity: number; reserved_quantity: number }[] } };
export type RawVariant = { id: string; title: string; sku?: string; height?: number; width?: number; length?: number; metadata?: Record<string, unknown>; options?: { option_id: string; value: string }[]; price_set?: { prices: RawPrice[] }; inventory_items?: RawInventoryLink[] };
export type RawProduct = { id: string; title: string; handle: string; description?: string; status: string; thumbnail?: string; metadata?: Record<string, unknown>; images?: { url: string }[]; updated_at?: string; variants: RawVariant[]; options: { id: string; title: string; values: { value: string }[] }[]; categories?: { id: string; handle: string }[] };
export type RawCatalog = { products: RawProduct[]; store: { default_sales_channel_id: string; default_location_id: string }; locations: { id: string; name: string }[]; categories: { id: string; handle: string }[] };
export const rawCatalog = (token: string) => commerce<RawCatalog>("/admin/eddfa/catalog", token);
export const basePrice = (variant: RawVariant) => variant.price_set?.prices.find(price => price.currency_code === "tnd" && !price.price_list_id && !price.rules_count && !price.min_quantity && !price.max_quantity);
export function localImage(url?: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.origin !== backendUrl().origin || !parsed.pathname.startsWith("/static/")) return null;
    return decodeURIComponent(parsed.pathname.slice(8));
  } catch { return null; }
}
export function toAdminProduct(product: RawProduct, locationId: string): AdminProduct {
  const meta = product.metadata ?? {};
  const string = (value: unknown) => typeof value === "string" ? value : "";
  const number = (value: unknown) => value == null ? null : Number(value);
  const components = Array.isArray(meta.eddfa_bundle_components) ? meta.eddfa_bundle_components as AdminProduct["components"] : [];
  return {
    id: product.id, title: product.title, titleAr: string(meta.eddfa_title_ar), handle: product.handle,
    description: product.description ?? "", descriptionAr: string(meta.eddfa_description_ar),
    installation: string(meta.eddfa_installation_fr), installationAr: string(meta.eddfa_installation_ar),
    category: meta.eddfa_kind === "bundle" ? "bundle" : (product.categories?.find(category => ["eden", "eclat"].includes(category.handle))?.handle ?? meta.eddfa_category) === "eclat" ? "eclat" : "eden",
    status: product.status === "published" ? "published" : "draft", tubes: number(meta.eddfa_tubes),
    images: (product.images ?? []).map(image => localImage(image.url)).filter((image): image is string => !!image), components, updatedAt: product.updated_at,
    variants: product.variants.map(variant => {
      const metadata = variant.metadata ?? {};
      const dimensions = Array.isArray(metadata.eddfa_dimensions_mm) ? metadata.eddfa_dimensions_mm : [];
      const inventory = variant.inventory_items?.[0];
      const level = inventory?.inventory?.location_levels?.find(level => level.location_id === locationId);
      return {
        id: variant.id, title: variant.title, sku: variant.sku ?? "", price: basePrice(variant)?.amount == null ? null : Number(basePrice(variant)!.amount),
        height: number(dimensions[0] ?? variant.height), width: number(dimensions[1] ?? variant.width), depth: number(dimensions[2] ?? variant.length),
        thermalPower: number(metadata.eddfa_thermal_power), resistance: number(metadata.eddfa_resistance), centres: number(metadata.eddfa_centres), weight: number(metadata.eddfa_weight_kg),
        inventoryId: inventory?.inventory_item_id, stocked: Number(level?.stocked_quantity ?? 0), reserved: Number(level?.reserved_quantity ?? 0),
      } satisfies AdminVariant;
    }),
  };
}
export type RawPromotion = { id: string; code: string; status: AdminPromotion["status"]; limit: number | null; used?: number; application_method: { type: AdminPromotion["type"]; value: number } };
export function toAdminPromotion(promotion: RawPromotion): AdminPromotion { return { id: promotion.id, code: promotion.code, status: promotion.status, type: promotion.application_method.type, value: Number(promotion.application_method.value), limit: promotion.limit ?? null, used: Number(promotion.used ?? 0) }; }
