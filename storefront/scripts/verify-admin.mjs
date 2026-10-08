import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const origin = "http://127.0.0.1:3000";
const email = process.env.EDDFA_TEST_EMAIL;
const password = process.env.EDDFA_TEST_PASSWORD;
assert.ok(email && password, "Set EDDFA_TEST_EMAIL and EDDFA_TEST_PASSWORD locally.");
let cookie = "";
let backendToken = "";
const createdProducts = [];
const createdPromotions = [];
async function api(path, body, method = "GET", overrides = {}) {
  const response = await fetch(`${origin}/api/admin/${path}`, {
    method, headers: { Origin: origin, Cookie: cookie, ...(body !== undefined && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}), ...overrides },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });
  const data = await response.json();
  return { response, data };
}
async function ok(path, body, method = "GET") {
  const result = await api(path, body, method);
  assert.equal(result.response.status, 200, `${method} ${path}: ${JSON.stringify(result.data)}`);
  return result.data;
}
function editable(product) {
  const { id, updatedAt, ...input } = product;
  input.variants = product.variants.map(({ inventoryId, stocked, reserved, ...variant }) => variant);
  return input;
}
const variant = title => ({ title, sku: "", price: 123.456, height: 800, width: 475, depth: 25, thermalPower: 410, resistance: null, centres: 450, weight: 3.7 });
const suffix = Date.now();
try {
  assert.equal((await api("data")).response.status, 401);
  assert.equal((await api("session", { email, password }, "POST", { Origin: "https://example.invalid" })).response.status, 403);
  const login = await api("session", { email, password }, "POST");
  assert.equal(login.response.status, 200, JSON.stringify(login.data));
  const setCookie = login.response.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=strict/i);
  cookie = setCookie.split(";")[0];
  const backendLogin = await fetch("http://127.0.0.1:9000/auth/user/emailpass", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  backendToken = (await backendLogin.json()).token;
  assert.equal((await api("data", undefined, "GET", { Cookie: "eddfa_admin=forged" })).response.status, 401);
  const baseline = await ok("data");
  assert.equal(baseline.products.filter(product => !product.handle.startsWith("verification-")).length, 6);
  const input = { title: "Verification locale", titleAr: "اختبار محلي", handle: `verification-${suffix}`, description: "Essai prive", descriptionAr: "وصف تجريبي", installation: "Installation test", installationAr: "تركيب تجريبي", category: "eden", status: "draft", images: [baseline.products[0].images[0]], tubes: 13, variants: [variant("Standard")], components: [] };
  let { product } = await ok("products", input, "POST");
  createdProducts.push(product.id);
  assert.equal(product.variants[0].price, 123.456);
  assert.equal(product.titleAr, input.titleAr);
  assert.ok(product.variants[0].inventoryId);
  const savedId = product.id;
  const updated = editable(product);
  updated.description = "Description modifiee";
  updated.status = "published";
  updated.variants[0].price = 111.111;
  updated.variants.push(variant("Deuxieme"));
  ({ product } = await ok(`products/${savedId}`, updated, "POST"));
  assert.equal(product.variants.length, 2);
  assert.equal(product.variants.find(item => item.title === "Standard").price, 111.111);
  await ok("stock", { inventoryId: product.variants[0].inventoryId, locationId: baseline.locationId, quantity: 7 }, "POST");
  const reread = (await ok("data")).products.find(item => item.id === savedId);
  assert.equal(reread.variants[0].stocked, 7);
  const publicCatalog = await (await fetch("http://127.0.0.1:9000/catalog")).json();
  const publicProduct = publicCatalog.products.find(item => item.handle === input.handle);
  assert.ok(publicProduct, "Published product must reach the public catalog");
  assert.equal(publicProduct.description.fr, updated.description);
  assert.ok(publicProduct.variants.some(item => item.price === 111.111));
  const removedVariant = editable(reread);
  removedVariant.variants = removedVariant.variants.slice(0, 1);
  ({ product } = await ok(`products/${savedId}`, removedVariant, "POST"));
  assert.equal(product.variants.length, 1);
  const bundleInput = { ...input, handle: `verification-pack-${suffix}`, title: "Pack verification", category: "bundle", status: "published", tubes: null, variants: [variant("Pack")], components: [{ variantId: product.variants[0].id, quantity: 2 }, { variantId: baseline.products[1].variants[0].id, quantity: 1 }] };
  let bundle = (await ok("products", bundleInput, "POST")).product;
  createdProducts.push(bundle.id);
  assert.equal(bundle.category, "bundle");
  assert.deepEqual(bundle.components, bundleInput.components);
  assert.equal((await api(`products/${savedId}`, undefined, "DELETE")).response.status, 409);
  const newBundle = editable(bundle);
  newBundle.components[0].quantity = 3;
  bundle = (await ok(`products/${bundle.id}`, newBundle, "POST")).product;
  assert.equal(bundle.components[0].quantity, 3);
  const raw = await (await fetch("http://127.0.0.1:9000/admin/eddfa/catalog", { headers: { Authorization: `Bearer ${backendToken}` } })).json();
  const links = raw.products.find(item => item.id === bundle.id).variants[0].inventory_items;
  assert.equal(links.length, 2);
  assert.equal(links.find(link => link.inventory_item_id === product.variants[0].inventoryId).required_quantity, 3);
  let promotion = (await ok("promotions", { code: `TEST_${suffix}`, status: "inactive", type: "percentage", value: 15, limit: 20 }, "POST")).promotion;
  createdPromotions.push(promotion.id);
  assert.equal(promotion.value, 15);
  promotion = (await ok(`promotions/${promotion.id}`, { code: promotion.code, status: "draft", type: "fixed", value: 12.345, limit: null }, "POST")).promotion;
  assert.equal(promotion.value, 12.345);
  assert.equal(promotion.type, "fixed");
  const listedPromo = (await ok("data")).promotions.find(item => item.id === promotion.id);
  assert.equal(listedPromo.code, promotion.code);
  assert.equal(listedPromo.value, 12.345);
  assert.equal(listedPromo.status, "draft");
  const form = new FormData();
  form.append("file", new Blob([await readFile("public/eddfa/eden-80.optimized.webp")], { type: "image/webp" }), "verification.webp");
  const upload = await ok("uploads", form, "POST");
  assert.match(upload.filename, /^\d+-eddfa-.*\.webp$|^eddfa-.*\.webp$/);
  assert.equal((await fetch(`${origin}/api/catalog-image/${upload.filename}`)).status, 200);
  assert.equal((await api("products", { ...input, images: ["../bad.webp"] }, "POST")).response.status, 400);
  assert.equal((await api("promotions", { code: "INVALID", status: "draft", type: "percentage", value: 101, limit: null }, "POST")).response.status, 400);
  const hidden = editable(product);
  hidden.status = "draft";
  assert.equal((await api(`products/${savedId}`, hidden, "POST")).response.status, 409);
  const hiddenBundle = editable(bundle);
  hiddenBundle.status = "draft";
  await ok(`products/${bundle.id}`, hiddenBundle, "POST");
  await ok(`products/${savedId}`, hidden, "POST");
  assert.ok(!(await (await fetch("http://127.0.0.1:9000/catalog")).json()).products.some(item => item.id === savedId));
  console.log("PASS: same-site login, HttpOnly cookie, unauthorized access, product/variant CRUD, TND precision, FR/AR persistence, stock, public catalog, pack references, promo CRUD, image upload and validation.");
} finally {
  for (const id of createdPromotions.reverse()) await ok(`promotions/${id}`, undefined, "DELETE");
  for (const id of createdProducts.reverse()) await ok(`products/${id}`, undefined, "DELETE");
  if (cookie) await ok("session", undefined, "DELETE");
  console.log("Temporary products and promo codes removed.");
}
