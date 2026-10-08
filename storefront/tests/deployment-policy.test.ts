import test from "node:test";
import assert from "node:assert/strict";
import { catalogBackend, isClientPreview, isLocalAdminAvailable } from "../src/lib/deployment-policy";

const local = { MEDUSA_BACKEND_URL: "http://127.0.0.1:9000", EDDFA_LOCAL_ADMIN: "true" };

test("Vercel preview never connects to commerce even with accidentally configured credentials", () => {
  for (const override of [{ VERCEL: "1" }, { EDDFA_DEMO_MODE: "true" }, { VERCEL: "1", EDDFA_DEMO_MODE: "false" }]) {
    const env = { ...local, ...override };
    assert.ok(isClientPreview(env));
    assert.equal(catalogBackend(env), undefined);
    assert.equal(isLocalAdminAvailable(env), false);
  }
});

test("an unconfigured storefront uses bundled products and has no administration", () => {
  assert.equal(catalogBackend({}), undefined);
  assert.equal(isLocalAdminAvailable({}), false);
});

test("the existing local panel remains available only with explicit loopback configuration", () => {
  assert.equal(isClientPreview(local), false);
  assert.equal(catalogBackend(local), local.MEDUSA_BACKEND_URL);
  assert.ok(isLocalAdminAvailable(local));
  for (const override of [{ EDDFA_LOCAL_ADMIN: "false" }, { MEDUSA_BACKEND_URL: "" }, { MEDUSA_BACKEND_URL: "invalid" }, { MEDUSA_BACKEND_URL: "https://example.com" }]) {
    assert.equal(isLocalAdminAvailable({ ...local, ...override }), false);
  }
});
