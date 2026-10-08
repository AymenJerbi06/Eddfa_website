import "server-only";
import { cookies } from "next/headers";
import { DEMO_COOKIE, demoAuthConfig, readDemoSession } from "./demo-auth";

export async function currentDemoAdmin() {
  return readDemoSession((await cookies()).get(DEMO_COOKIE)?.value, demoAuthConfig());
}

// Instance-local throttling is only an extra demo guard, not a distributed lockout.
const attempts = new Map<string, { count: number; expires: number }>();
export function allowDemoLogin(key: string, now = Date.now()) {
  for (const [address, entry] of attempts) if (entry.expires <= now) attempts.delete(address);
  const entry = attempts.get(key) ?? { count: 0, expires: now + 15 * 60 * 1000 };
  if (entry.count >= 10 || (!attempts.has(key) && attempts.size >= 1000)) return false;
  entry.count++;
  attempts.set(key, entry);
  return true;
}
