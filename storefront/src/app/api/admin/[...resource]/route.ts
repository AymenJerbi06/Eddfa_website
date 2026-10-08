import { cookies } from "next/headers";
import { ADMIN_COOKIE, AdminError, adminFailure, adminJson, adminToken, assertAdminOrigin, commerce, parseBody } from "@/lib/admin-server";
import { loginSchema, productSchema, promotionSchema, stockSchema } from "@/lib/admin-validation";
import { loadAdminData, removeProduct, saveProduct, savePromotion, saveStock, uploadImage } from "@/lib/admin-operations";

type Context = { params: Promise<{ resource: string[] }> };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: Request, context: Context) {
  try {
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
