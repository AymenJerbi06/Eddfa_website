import { randomBytes, randomUUID, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify } from "jose";
import { sameOrigin } from "./admin-validation";

const scrypt = promisify(nodeScrypt);
export const DEMO_COOKIE = "eddfa_demo_admin";
export const demoSessionSeconds = 3600;
type Environment = Record<string, string | undefined>;

export function demoAuthConfig(env: Environment = process.env) {
  const email = env.EDDFA_DEMO_EMAIL?.trim().toLowerCase();
  const passwordHash = env.EDDFA_DEMO_PASSWORD_HASH;
  const secret = env.EDDFA_DEMO_SESSION_SECRET;
  if (!email || !passwordHash || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(passwordHash) || !secret || secret.length < 32) return null;
  return { email, passwordHash, secret };
}

export async function hashDemoPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = await scrypt(password, salt, 32) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function checkDemoCredentials(email: string, password: string, config: NonNullable<ReturnType<typeof demoAuthConfig>>) {
  const [, salt, expected] = config.passwordHash.split("$");
  const actual = await scrypt(password, salt, 32) as Buffer;
  const passwordMatches = timingSafeEqual(actual, Buffer.from(expected, "hex"));
  return passwordMatches && email.trim().toLowerCase() === config.email;
}

export async function signDemoSession(config: NonNullable<ReturnType<typeof demoAuthConfig>>, now = Math.floor(Date.now() / 1000)) {
  return new SignJWT({ purpose: "presentation" }).setProtectedHeader({ alg: "HS256" })
    .setIssuer("eddfa-demo").setAudience("eddfa-demo-admin").setSubject(config.email)
    .setJti(randomUUID()).setIssuedAt(now).setExpirationTime(now + demoSessionSeconds)
    .sign(new TextEncoder().encode(config.secret));
}

export async function readDemoSession(token: string | undefined, config: ReturnType<typeof demoAuthConfig>, now = new Date()) {
  if (!token || token.length > 4096 || !config) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(config.secret), {
      algorithms: ["HS256"], issuer: "eddfa-demo", audience: "eddfa-demo-admin",
      requiredClaims: ["sub", "iat", "exp", "jti"], maxTokenAge: demoSessionSeconds, currentDate: now,
    });
    if (payload.sub !== config.email || payload.purpose !== "presentation" || typeof payload.jti !== "string") return null;
    return { email: config.email, sessionId: payload.jti };
  } catch { return null; }
}

export function demoOriginAllowed(url: string, origin: string | null, fetchSite: string | null, mutation: boolean) {
  const target = new URL(url);
  const local = ["localhost", "127.0.0.1"].includes(target.hostname);
  if (target.protocol !== "https:" && !(target.protocol === "http:" && local)) return false;
  if (fetchSite === "cross-site") return false;
  return !mutation || sameOrigin(origin, target.origin, fetchSite);
}
