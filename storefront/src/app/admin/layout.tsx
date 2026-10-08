import type { Metadata } from "next";
import { AdminLanguage } from "@/components/admin/language";
import "./admin.css";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="eddfa-admin" lang="fr" dir="ltr"><AdminLanguage />{children}</div>;
}
