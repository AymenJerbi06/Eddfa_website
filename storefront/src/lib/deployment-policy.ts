type Environment = Record<string, string | undefined>;

export function isClientPreview(env: Environment = process.env) {
  return env.EDDFA_DEMO_MODE === "true" || env.VERCEL === "1";
}

export function catalogBackend(env: Environment = process.env) {
  return isClientPreview(env) ? undefined : env.MEDUSA_BACKEND_URL;
}

export function isLocalAdminAvailable(env: Environment = process.env) {
  if (isClientPreview(env) || env.EDDFA_LOCAL_ADMIN !== "true" || !env.MEDUSA_BACKEND_URL) return false;
  try {
    return new URL(env.MEDUSA_BACKEND_URL).origin === "http://127.0.0.1:9000";
  } catch {
    return false;
  }
}
