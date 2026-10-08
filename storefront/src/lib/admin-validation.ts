import { z } from "zod";

const text = z.string().trim().max(10000);
const id = z.string().regex(/^[a-z]+_[a-zA-Z0-9]+$/);
const quantity = z.number().int().min(0).max(1000000);
const measurement = z.number().finite().positive().max(100000).nullable();
const price = z.number().finite().nonnegative().max(1000000).refine(value => Math.abs(value * 1000 - Math.round(value * 1000)) < 0.00001, "Le prix doit avoir au maximum 3 decimales.").nullable();
export const imageFilename = z.string().min(1).max(240).refine(value => !value.includes("..") && !/[/\\\x00-\x1f]/.test(value) && /\.(webp|png|jpe?g)$/i.test(value), "Format d'image invalide.");
export const productSchema = z.object({
  title: text.min(1).max(160), titleAr: text.max(160),
  handle: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Utilisez des lettres minuscules, des chiffres et des tirets.").max(160),
  description: text, descriptionAr: text, installation: text, installationAr: text,
  category: z.enum(["eden", "eclat", "bundle"]), status: z.enum(["published", "draft"]),
  images: z.array(imageFilename).max(12), tubes: z.number().int().positive().max(1000).nullable(),
  variants: z.array(z.object({
    id: id.optional(), title: text.min(1).max(160), sku: text.max(100), price,
    height: measurement, width: measurement, depth: measurement, thermalPower: measurement, resistance: measurement, centres: measurement, weight: measurement,
  }).strict()).min(1).max(20),
  components: z.array(z.object({ variantId: id, quantity: quantity.min(1).max(100) }).strict()).max(20),
}).strict().superRefine((value, context) => {
  if (value.status === "published" && !value.images.length) context.addIssue({ code: "custom", path: ["images"], message: "Ajoutez au moins une photo avant de publier." });
  if (new Set(value.images).size !== value.images.length) context.addIssue({ code: "custom", path: ["images"], message: "Une photo apparait plusieurs fois." });
  if (new Set(value.variants.map(variant => variant.title.toLowerCase())).size !== value.variants.length) context.addIssue({ code: "custom", path: ["variants"], message: "Chaque version doit avoir un nom different." });
  const ids = value.variants.flatMap(variant => variant.id ? [variant.id] : []);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", path: ["variants"], message: "Version dupliquee." });
  if (value.category === "bundle" && (value.components.length < 2 || value.variants.length !== 1)) context.addIssue({ code: "custom", path: ["components"], message: "Un pack doit contenir au moins deux versions distinctes et un seul prix." });
  if (new Set(value.components.map(item => item.variantId)).size !== value.components.length) context.addIssue({ code: "custom", path: ["components"], message: "Un composant apparait plusieurs fois." });
  if (value.category !== "bundle" && value.components.length) context.addIssue({ code: "custom", path: ["components"], message: "Les composants sont reserves aux packs." });
});
export const promotionSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/, "Le code doit contenir 3 a 40 lettres, chiffres ou tirets."),
  type: z.enum(["percentage", "fixed"]), value: z.number().finite().positive().max(100000),
  status: z.enum(["active", "draft", "inactive"]), limit: quantity.min(1).nullable(),
}).strict().superRefine((value, context) => {
  if (value.type === "percentage" && value.value > 100) context.addIssue({ code: "custom", path: ["value"], message: "La remise ne peut pas depasser 100 %." });
  if (Math.abs(value.value * 1000 - Math.round(value.value * 1000)) > 0.00001) context.addIssue({ code: "custom", path: ["value"], message: "Utilisez au maximum 3 decimales." });
});
export const stockSchema = z.object({ inventoryId: id, locationId: id, quantity }).strict();
export const loginSchema = z.object({ email: z.email().max(254).transform(value => value.trim().toLowerCase()), password: z.string().min(1).max(256) }).strict();
export function sameOrigin(requestOrigin: string | null, configuredOrigin: string, fetchSite: string | null) {
  return requestOrigin === configuredOrigin && (!fetchSite || fetchSite === "same-origin" || fetchSite === "none");
}
