import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { ADMIN_COOKIE, AdminError, adminFailure, adminJson, adminToken, assertAdminOrigin, commerce, parseBody } from "@/lib/admin-server";
import { loginSchema, productSchema, promotionSchema, stockSchema } from "@/lib/admin-validation";
import { loadAdminData, removeProduct, saveProduct, savePromotion, saveStock, uploadImage } from "@/lib/admin-operations";
import { isClientPreview } from "@/lib/deployment-policy";
import { DEMO_COOKIE, checkDemoCredentials, demoAuthConfig, demoOriginAllowed, demoSessionSeconds, signDemoSession } from "@/lib/demo-auth";
import { allowDemoLogin, currentDemoAdmin } from "@/lib/demo-admin-server";
import { makeDemoCatalog } from "@/lib/demo-catalog";

type Context = { params: Promise<{ resource: string[] }> };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handleDemo(request: Request, resource: string[]) {
  if (!demoOriginAllowed(request.url, request.headers.get("origin"), request.headers.get("sec-fetch-site"), request.method !== "GET")) throw new AdminError("Requete non autorisee.", 403);
  const route = resource.join("/");
  if (route === "session" && request.method === "POST") {
    const config = demoAuthConfig();
    if (!config) throw new AdminError("Le compte de demonstration n'est pas configure.", 503);
    const address = createHash("sha256").update(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local").digest("hex");
    if (!allowDemoLogin(address)) throw new AdminError("Trop de tentatives. Reessayez dans 15 minutes.", 429);
    const input = await parseBody(request, loginSchema);
    if (!await checkDemoCredentials(input.email, input.password, config)) {
      (await cookies()).delete(DEMO_COOKIE);
      throw new AdminError("Email ou mot de passe incorrect.", 401);
    }
    (await cookies()).set(DEMO_COOKIE, await signDemoSession(config), { httpOnly: true, sameSite: "strict", secure: new URL(request.url).protocol === "https:", path: "/", maxAge: demoSessionSeconds });
    return adminJson({ email: config.email });
  }
  if (route === "session" && request.method === "DELETE") {
    (await cookies()).delete(DEMO_COOKIE);
    return adminJson({ signedOut: true });
  }
  const user = await currentDemoAdmin();
  if (!user) throw new AdminError("Connectez-vous pour acceder a l'administration.", 401);
  if (route === "session" && request.method === "GET") return adminJson(user);
  if (route === "data" && request.method === "GET") return adminJson(makeDemoCatalog(user.email));
  return adminJson({ message: "La demonstration ne modifie aucune donnee sur le serveur." }, 405);
}
async function handle(request: Request, context: Context) {
  try {
    if (isClientPreview()) return await handleDemo(request, (await context.params).resource);
    assertAdminOrigin(request, request.method !== "GET");
    const { resource } = await context.params;
    const route = resource.join("/");
    if (route === "session" && request.method === "POST") {
      const input = await parseBody(request, loginSchema);
      const result = await commerce<{ token?: string }>("/auth/user/emailpass", undefined, input, "POST");
      if (!result.token) throw new AdminError("Ce compte necessite une verification supplementaire.", 401);
      const owner = await commerce<{ user: { email: string } }>("/admin/users/me", result.token);
      (await cookies()).set(ADMIN_COOKIE, result.token, { httpOnly: true, sameSite: "strict", secure: new URL(request.url).protocol === "https:", path: "/", maxAge: 3600 });
      return adminJson({ email: owner.user.email });
    }
    if (route === "session" && request.method === "DELETE") {
      (await cookies()).delete(ADMIN_COOKIE);
      return adminJson({ signedOut: true });
    }
    const token = await adminToken();
    if (route === "data" && request.method === "GET") return adminJson(await loadAdminData(token));
    if (route === "uploads" && request.method === "POST") return adminJson({ filename: await uploadImage(token, request) });
    if (route === "stock" && request.method === "POST") { await saveStock(token, await parseBody(request, stockSchema)); return adminJson({ saved: true }); }
    if (resource[0] === "products" && resource.length <= 2) {
      const id = resource[1];
      if (id && !/^prod_[a-zA-Z0-9]+$/.test(id)) throw new AdminError("Produit invalide.");
      if (request.method === "POST") return adminJson({ product: await saveProduct(token, await parseBody(request, productSchema), id) });
      if (request.method === "DELETE" && id) { await removeProduct(token, id); return adminJson({ deleted: true }); }
    }
    if (resource[0] === "promotions" && resource.length <= 2) {
      const id = resource[1];
      if (id && !/^promo_[a-zA-Z0-9]+$/.test(id)) throw new AdminError("Code invalide.");
      if (request.method === "POST") return adminJson({ promotion: await savePromotion(token, await parseBody(request, promotionSchema), id) });
      if (request.method === "DELETE" && id) { await commerce(`/admin/promotions/${id}`, token, undefined, "DELETE"); return adminJson({ deleted: true }); }
    }
    return adminJson({ message: "Page introuvable." }, 404);
  } catch (error) { return adminFailure(error); }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
