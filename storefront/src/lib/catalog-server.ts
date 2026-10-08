import "server-only";
import { cache } from "react";
import { products, type CatalogProduct } from "./content";
import { catalogBackend } from "./deployment-policy";

export const getCatalog = cache(async (): Promise<CatalogProduct[]> => {
  const backend = catalogBackend();
  if (!backend) return products;
  const response = await fetch(new URL("/catalog", backend), { cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Catalog service unavailable.");
  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error("Invalid catalog response.");
  return data.products;
});
