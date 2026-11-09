"use client";

import { useState } from "react";
import { ArrowLeft, Check, Loader2, Send } from "lucide-react";

const inputClass =
  "h-12 w-full rounded-2xl border border-white/12 bg-ink/50 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-acid/60";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("loading");
    setMessage("");

    const form = new FormData(formElement);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "تعذّر إرسال الرسالة");
      }
      setStatus("done");
      setMessage(data.message ?? "وصلتنا رسالتك");
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-bold text-white/45">الاسم *</span>
          <input
            name="name"
            required
            minLength={2}
            autoComplete="name"
            placeholder="اسمك الكامل"
            className={`mt-2 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-white/45">البريد الإلكتروني *</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={`mt-2 ${inputClass}`}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-[11px] font-bold text-white/45">الموضوع *</span>
        <input
          name="subject"
          required
          minLength={3}
          placeholder="استفسار عن منتج، طلب، تعاون…"
          className={`mt-2 ${inputClass}`}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-[11px] font-bold text-white/45">رسالتك *</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={6}
          placeholder="اكتب تفاصيل استفسارك…"
          className="mt-2 w-full rounded-2xl border border-white/12 bg-ink/50 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-acid/60"
        />
      </label>

      {message ? (
        <p
          className={
            status === "error"
              ? "mt-4 rounded-xl border border-flare/30 bg-flare/10 px-4 py-3 text-[11px] text-flare"
              : "mt-4 rounded-xl border border-acid/30 bg-acid/10 px-4 py-3 text-[11px] text-acid"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-acid px-7 py-3.5 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            جارٍ الإرسال…
          </>
        ) : status === "done" ? (
          <>
            <Check size={16} />
            تم الإرسال
          </>
        ) : (
          <>
            أرسل الرسالة
            <Send size={15} />
          </>
        )}
      </button>

      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
        <ArrowLeft size={11} />
        نرد عادةً خلال 24 ساعة في أيام العمل.
      </p>
    </form>
  );
}
