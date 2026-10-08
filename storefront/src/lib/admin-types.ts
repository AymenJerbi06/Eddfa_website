export type AdminVariant = {
  id?: string;
  title: string;
  sku: string;
  price: number | null;
  height: number | null;
  width: number | null;
  depth: number | null;
  thermalPower: number | null;
  resistance: number | null;
  centres: number | null;
  weight: number | null;
  inventoryId?: string;
  stocked?: number;
  reserved?: number;
};
export type BundleComponent = { variantId: string; quantity: number };
export type AdminProduct = {
  id?: string;
  title: string;
  titleAr: string;
  handle: string;
  description: string;
  descriptionAr: string;
  installation: string;
  installationAr: string;
  category: "eden" | "eclat" | "bundle";
  status: "published" | "draft";
  images: string[];
  tubes: number | null;
  variants: AdminVariant[];
  components: BundleComponent[];
  updatedAt?: string;
};
export type AdminPromotion = {
  id?: string; code: string; type: "percentage" | "fixed"; value: number;
  status: "active" | "draft" | "inactive"; limit: number | null; used?: number;
};
export type AdminOrder = {
  id: string; display_id: number; email: string | null; created_at: string;
  status: string; total: number; currency_code: string;
  payment_status?: string; fulfillment_status?: string;
  shipping_address?: { first_name?: string; last_name?: string; phone?: string; city?: string; address_1?: string };
  items?: { id: string; title: string; quantity: number; unit_price: number }[];
};
export type AdminData = { products: AdminProduct[]; promotions: AdminPromotion[]; orders: AdminOrder[]; locationId: string; email: string };

export function blankVariant(): AdminVariant {
  return { title: "Standard", sku: "", price: null, height: null, width: null, depth: null, thermalPower: null, resistance: null, centres: null, weight: null };
}
export function blankProduct(bundle = false): AdminProduct {
  return { title: "", titleAr: "", handle: "", description: "", descriptionAr: "", installation: "", installationAr: "", category: bundle ? "bundle" : "eden", status: "draft", images: [], tubes: null, variants: [blankVariant()], components: [] };
}
