import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { normalizeTunisianPhone, switchLocalePath } from "../src/lib/inquiry";
import { products, governorates, inspirations } from "../src/lib/content";
import { variantLabel, variantSummary } from "../src/lib/products";

test("Tunisian phones normalize without accepting a different country", () => {
  for (const value of ["31 547 491", "+216 31 547 491", "00216 31547491", "٣١٥٤٧٤٩١"]) assert.equal(normalizeTunisianPhone(value), "+21631547491");
  for (const value of ["123", "+1 604 555 1234", "03154749", "31547491abc"]) assert.equal(normalizeTunisianPhone(value), null);
});
test("locale switching preserves the selected product URL", () => {
  assert.equal(switchLocalePath("/fr/produits/eden-100", "ar"), "/ar/produits/eden-100");
  assert.equal(switchLocalePath("/ar", "fr"), "/fr");
});
test("EDDFA content is not treated as live priced inventory", () => {
  assert.equal(new Set(products.map(p => p.handle)).size, products.length);
  assert.ok(products.every(p => p.price === null && !p.purchasable && p.title.fr && p.title.ar));
  assert.equal(governorates.length, 24);
  assert.equal(products.length, 6);
  assert.equal(products.filter(p => p.category === "eden").length, 3);
  assert.equal(products.filter(p => p.category === "eclat").length, 3);
});

test("all twelve variants preserve the supplied workbook specifications", () => {
  const actual = products.flatMap(p => p.variants.map(v => [v.id, v.dimensions.join("x"), v.centres ?? null, v.resistance ?? null, v.thermalPower, v.weight ?? null]));
  assert.deepEqual(actual, [
    ["eden-80-475", "800x475x25", 450, null, 382, 3.7],
    ["eden-80-525", "800x525x25", 500, null, 410, 3.9],
    ["eden-100-475", "1000x475x25", 450, null, 495, 4.7],
    ["eden-100-525", "1000x525x25", 500, null, 530, 5],
    ["eden-120-475", "1200x475x25", 450, null, 610, 5.75],
    ["eden-120-525", "1200x525x25", 500, null, 653, 6.1],
    ["eclat-classic-250", "800x450x25", null, 250, 420, null],
    ["eclat-classic-400", "1000x450x25", null, 400, 560, null],
    ["eclat-confort-300", "800x450x25", null, 300, 425, null],
    ["eclat-confort-600", "1200x450x25", null, 600, 680, null],
    ["eclat-service-250", "900x450x25", null, 250, 420, null],
    ["eclat-service-400", "1100x450x25", null, 400, 560, null],
  ]);
  assert.equal(new Set(actual.map(row => row[0])).size, 12);
});

test("active image records only use existing EDDFA renditions", () => {
  const paths = [...products.flatMap(p => [p.image, ...p.gallery]), ...inspirations.map(i => i.image)];
  for (const path of paths) {
    assert.ok(path.startsWith("/eddfa/"));
    assert.ok(existsSync(new URL(`../public${path.replace(/\.webp$/, ".optimized.webp")}`, import.meta.url)), path);
  }
  assert.equal(inspirations.length, 9);
  assert.ok(inspirations.every(i => i.id !== "0010"));
  assert.ok(existsSync(new URL("../public/eddfa/certificat-veritas-en442.pdf", import.meta.url)));
});

test("quote variant descriptions distinguish electrical and thermal power", () => {
  const variant = products.find(p => p.id === "eclat-confort")!.variants[1];
  assert.equal(variantLabel(variant), "1200 mm · 600 W");
  assert.match(variantSummary(variant, "fr"), /Résistance électrique: 600 W/);
  assert.match(variantSummary(variant, "fr"), /Puissance thermique annoncée: 680 W/);
  assert.match(variantSummary(variant, "ar"), /600 W/);
  assert.match(variantSummary(variant, "ar"), /1200 × 450 × 25 mm/);
});
