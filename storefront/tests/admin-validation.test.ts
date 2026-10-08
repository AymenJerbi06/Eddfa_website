import assert from "node:assert/strict";
import test from "node:test";
import { blankProduct } from "../src/lib/admin-types";
import { imageFilename, productSchema, promotionSchema, sameOrigin, stockSchema } from "../src/lib/admin-validation";

test("admin product input rejects client-supplied roles, invalid prices and unsafe media", () => {
  const product = { ...blankProduct(), title: "EDEN", handle: "eden", images: ["eden-80.optimized.webp"] };
  assert.ok(productSchema.safeParse(product).success);
  assert.ok(!productSchema.safeParse({ ...product, role: "owner" }).success);
  assert.ok(!productSchema.safeParse({ ...product, variants: [{ ...product.variants[0], price: -1 }] }).success);
  assert.ok(!productSchema.safeParse({ ...product, variants: [{ ...product.variants[0], price: 12.3456 }] }).success);
  assert.ok(productSchema.safeParse({ ...product, variants: [{ ...product.variants[0], price: 123.456 }] }).success);
  for (const image of ["../secret.png", "https://example.com/image.png", "file.svg", "a/b.webp", "a\\b.webp"]) assert.ok(!imageFilename.safeParse(image).success);
  assert.ok(!productSchema.safeParse({ ...product, status: "published", images: [] }).success);
});
test("packs require distinct components and promotions enforce amount limits", () => {
  const bundle = { ...blankProduct(true), title: "Pack", handle: "pack" };
  assert.ok(!productSchema.safeParse(bundle).success);
  const components = [{ variantId: "variant_A", quantity: 1 }, { variantId: "variant_B", quantity: 2 }];
  assert.ok(productSchema.safeParse({ ...bundle, components }).success);
  assert.ok(!productSchema.safeParse({ ...bundle, components: [components[0], components[0]] }).success);
  const promo = { code: "SUMMER", type: "percentage", value: 10, status: "draft", limit: null };
  assert.ok(promotionSchema.safeParse(promo).success);
  assert.ok(!promotionSchema.safeParse({ ...promo, value: 101 }).success);
  assert.ok(!promotionSchema.safeParse({ ...promo, limit: 0 }).success);
  assert.ok(!stockSchema.safeParse({ inventoryId: "iitem_A", locationId: "sloc_A", quantity: -1 }).success);
});
test("mutations require an exact same origin and reject cross-site requests", () => {
  assert.ok(sameOrigin("http://127.0.0.1:3000", "http://127.0.0.1:3000", "same-origin"));
  assert.ok(!sameOrigin(null, "http://127.0.0.1:3000", null));
  assert.ok(!sameOrigin("https://attacker.invalid", "http://127.0.0.1:3000", "cross-site"));
  assert.ok(!sameOrigin("http://localhost:3000", "http://127.0.0.1:3000", "same-site"));
});
