import { notFound, redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/dashboard";
import { currentAdmin } from "@/lib/admin-server";
import { isLocalAdminAvailable } from "@/lib/deployment-policy";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!isLocalAdminAvailable()) notFound();
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return <AdminDashboard email={user.email} />;
}
