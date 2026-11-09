import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdmin } from "@/lib/admin-guard";
import { storageInfo } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
  return <AdminShell storage={storageInfo()}>{children}</AdminShell>;
}
