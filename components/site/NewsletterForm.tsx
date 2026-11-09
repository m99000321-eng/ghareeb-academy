"use client";

import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "تعذّر التسجيل، جرّب مرة أخرى");
      }
      setStatus("done");
      setMessage(data.message ?? "تم التسجيل بنجاح");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] p-1.5 focus-within:border-acid/50">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="بريدك الإلكتروني"
          aria-label="البريد الإلكتروني"
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/35"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-acid text-ink transition-transform hover:scale-105 disabled:opacity-60"
          aria-label="اشترك في النشرة"
        >
          {status === "loading" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : status === "done" ? (
            <Check size={16} />
          ) : (
            <ArrowLeft size={16} />
          )}
        </button>
      </form>
      <p
        className={
          status === "error"
            ? "mt-2 text-xs text-flare"
            : status === "done"
              ? "mt-2 text-xs text-acid"
              : "mt-2 text-xs text-white/35"
        }
        role="status"
      >
        {message || "انضم إلى دائرة الغريب: إصدارات محدودة وعروض من بُعد آخر."}
      </p>
    </div>
  );
}
