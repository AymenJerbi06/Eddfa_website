import test from "node:test";
import assert from "node:assert/strict";
import { blankProduct, type AdminProduct } from "../src/lib/admin-types";
import { makeDemoCatalog, mutateDemoCatalog } from "../src/lib/demo-catalog";

function payload(product: AdminProduct) {
  const { id, updatedAt, ...rest } = structuredClone(product);
  void id; void updatedAt;
  return { ...rest, variants: rest.variants.map(({ inventoryId, stocked, reserved, ...variant }) => { void inventoryId; void stocked; void reserved; return variant; }) };
}

test("each demo starts with the supplied six models and twelve unpriced, empty-stock variants", () => {
  const data = makeDemoCatalog("owner@example.invalid");
  assert.equal(data.products.length, 6);
  const variants = data.products.flatMap(product => product.variants);
  assert.equal(variants.length, 12);
  assert.ok(variants.every(variant => variant.price === null && variant.stocked === 0 && variant.reserved === 0));
  assert.deepEqual(data.orders, []);
  assert.deepEqual(data.promotions, []);
});

test("temporary product edits preserve stock and never affect another demo or storefront seed", () => {
  const data = makeDemoCatalog("owner@example.invalid");
  const original = data.products[0];
  mutateDemoCatalog(data, "stock", { inventoryId: original.variants[0].inventoryId, locationId: data.locationId, quantity: 7 }, "POST");
  const edit = payload(original);
  edit.title = "Test model";
  edit.variants[0].price = 249.5;
  mutateDemoCatalog(data, `products/${original.id}`, edit, "POST");
  assert.equal(data.products[0].title, "Test model");
  assert.equal(data.products[0].variants[0].stocked, 7);
  const untouched = makeDemoCatalog("other@example.invalid");
  assert.equal(untouched.products[0].title, "EDEN 80");
  assert.equal(untouched.products[0].variants[0].stocked, 0);
});

test("demo product and promo creation/deletion work without persistence", () => {
  const data = makeDemoCatalog("owner@example.invalid");
  const input = blankProduct(); input.title = "New test model"; input.handle = "new-test-model";
  mutateDemoCatalog(data, "products", input, "POST");
  assert.equal(data.products.length, 7);
  assert.throws(() => mutateDemoCatalog(data, "products", input, "POST"), /adresse/);
  mutateDemoCatalog(data, `products/${data.products[6].id}`, undefined, "DELETE");
  assert.equal(data.products.length, 6);
  mutateDemoCatalog(data, "promotions", { code: "TEST10", type: "percentage", value: 10, status: "draft", limit: null }, "POST");
  assert.equal(data.promotions.length, 1);
  assert.throws(() => mutateDemoCatalog(data, "promotions", { code: "TEST10", type: "percentage", value: 10, status: "active", limit: null }, "POST"), /existe/);
  mutateDemoCatalog(data, `promotions/${data.promotions[0].id}`, undefined, "DELETE");
  assert.deepEqual(data.promotions, []);
});

test("demo packs reference actual variants and prevent orphaned components", () => {
  const data = makeDemoCatalog("owner@example.invalid");
  const pack = blankProduct(true); pack.title = "Test pack"; pack.handle = "test-pack";
  pack.components = data.products.slice(0, 2).map(product => ({ variantId: product.variants[0].id!, quantity: 1 }));
  mutateDemoCatalog(data, "products", pack, "POST");
  assert.equal(data.products[6].category, "bundle");
  assert.throws(() => mutateDemoCatalog(data, `products/${data.products[0].id}`, undefined, "DELETE"), /pack/);
  const changed = payload(data.products[0]); changed.variants = changed.variants.slice(1);
  assert.throws(() => mutateDemoCatalog(data, `products/${data.products[0].id}`, changed, "POST"), /pack/);
  pack.handle = "unknown-pack"; pack.components[0].variantId = "variant_nonexistent";
  assert.throws(() => mutateDemoCatalog(data, "products", pack, "POST"), /Composant/);
});
