"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-[12px] font-bold text-white/40 transition-colors hover:bg-flare/10 hover:text-flare disabled:opacity-50"
    >
      <LogOut size={15} />
      {busy ? "جارٍ الخروج…" : "تسجيل الخروج"}
    </button>
  );
}
