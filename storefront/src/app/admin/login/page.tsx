import { notFound, redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin/login";
import { currentAdmin } from "@/lib/admin-server";
import { isLocalAdminAvailable } from "@/lib/deployment-policy";

export const dynamic = "force-dynamic";
export default async function AdminLoginPage() {
  if (!isLocalAdminAvailable()) notFound();
  if (await currentAdmin()) redirect("/admin");
  return <AdminLogin />;
}
