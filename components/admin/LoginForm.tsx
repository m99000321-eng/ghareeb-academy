"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "تعذّر تسجيل الدخول");
      }
      router.replace(next);
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "تعذّر تسجيل الدخول",
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-[11px] font-bold text-white/45">كلمة المرور</span>
        <span className="relative mt-2 block">
          <input
            type={visible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-12 w-full rounded-2xl border border-white/12 bg-black/30 px-4 pe-12 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-acid/60"
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute inset-y-0 end-0 grid w-12 place-items-center text-white/30 transition-colors hover:text-white/70"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
      </label>

      {error ? (
        <p className="rounded-xl border border-flare/30 bg-flare/10 px-4 py-3 text-[11px] text-flare">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy || !password}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-acid text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            جارٍ التحقق…
          </>
        ) : (
          <>
            <LogIn size={16} />
            دخول لوحة التحكم
          </>
        )}
      </button>
    </form>
  );
}
