import { notFound, redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/dashboard";
import { currentAdmin } from "@/lib/admin-server";
import { isClientPreview, isLocalAdminAvailable } from "@/lib/deployment-policy";
import { DemoAdminProvider } from "@/components/admin/demo-provider";
import { makeDemoCatalog } from "@/lib/demo-catalog";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const demo = isClientPreview();
  if (!demo && !isLocalAdminAvailable()) notFound();
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return demo ? <DemoAdminProvider initial={makeDemoCatalog(user.email)}><AdminDashboard email={user.email} demo /></DemoAdminProvider> : <AdminDashboard email={user.email} />;
}
