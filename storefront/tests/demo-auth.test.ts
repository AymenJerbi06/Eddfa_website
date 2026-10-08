import test from "node:test";
import assert from "node:assert/strict";
import { checkDemoCredentials, demoAuthConfig, demoOriginAllowed, demoSessionSeconds, hashDemoPassword, readDemoSession, signDemoSession } from "../src/lib/demo-auth";

async function config() {
  return { email: "owner@example.invalid", passwordHash: await hashDemoPassword("Unit-Test-Passphrase"), secret: "test-key-not-for-deployment-1234567890" };
}

test("demo login requires the exact password and correct email", async () => {
  const account = await config();
  assert.ok(await checkDemoCredentials(" OWNER@example.invalid ", "Unit-Test-Passphrase", account));
  assert.equal(await checkDemoCredentials(account.email, "wrong-password", account), false);
  assert.equal(await checkDemoCredentials("wrong@example.invalid", "Unit-Test-Passphrase", account), false);
  assert.equal(await checkDemoCredentials(account.email, "unit-test-passphrase", account), false);
  assert.equal(await checkDemoCredentials(account.email, "Unit-Test-Passphrase ", account), false);
});

test("demo sessions reject missing, forged, expired and wrong-account cookies", async () => {
  const account = await config();
  const now = 2000000000;
  const token = await signDemoSession(account, now);
  assert.equal((await readDemoSession(token, account, new Date(now * 1000)))?.email, account.email);
  assert.equal(await readDemoSession(undefined, account), null);
  const parts = token.split(".");
  parts[1] = Buffer.from(JSON.stringify({ sub: account.email })).toString("base64url");
  assert.equal(await readDemoSession(parts.join("."), account), null);
  assert.equal(await readDemoSession(token, { ...account, secret: "another-unrelated-test-key-1234567890" }, new Date(now * 1000)), null);
  assert.equal(await readDemoSession(token, { ...account, email: "another@example.invalid" }, new Date(now * 1000)), null);
  assert.equal(await readDemoSession(token, account, new Date((now + demoSessionSeconds + 1) * 1000)), null);
  assert.equal(await readDemoSession(token, null), null);
});

test("demo configuration fails closed without a hash or a sufficiently long secret", async () => {
  const account = await config();
  const env = { EDDFA_DEMO_EMAIL: account.email, EDDFA_DEMO_PASSWORD_HASH: account.passwordHash, EDDFA_DEMO_SESSION_SECRET: account.secret };
  assert.deepEqual(demoAuthConfig(env), account);
  assert.equal(demoAuthConfig({}), null);
  assert.equal(demoAuthConfig({ ...env, EDDFA_DEMO_PASSWORD_HASH: "plaintext-is-not-a-hash" }), null);
  assert.equal(demoAuthConfig({ ...env, EDDFA_DEMO_SESSION_SECRET: "short" }), null);
});

test("demo mutations require same-origin requests over HTTPS or local loopback", () => {
  const url = "https://demo.example.invalid/api/admin/session";
  assert.ok(demoOriginAllowed(url, "https://demo.example.invalid", "same-origin", true));
  assert.equal(demoOriginAllowed(url, "https://attacker.invalid", "cross-site", true), false);
  assert.equal(demoOriginAllowed(url, null, null, true), false);
  assert.ok(demoOriginAllowed("http://127.0.0.1:3001/api/admin/session", "http://127.0.0.1:3001", "same-origin", true));
  assert.equal(demoOriginAllowed("http://demo.example.invalid/api/admin/session", "http://demo.example.invalid", "same-origin", true), false);
});
