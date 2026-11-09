import { Mail, MessageSquare, Send } from "lucide-react";
import { getMessages, getSubscribers } from "@/lib/db";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ar-EG", {
  timeZone: "Africa/Cairo",
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminMessagesPage() {
  const [messages, subscribers] = await Promise.all([
    getMessages(),
    getSubscribers(),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] font-bold tracking-[0.3em] text-acid">INBOX</p>
        <h1 className="mt-2 font-display text-3xl font-black">
          الرسائل والاشتراكات
        </h1>
        <p className="mt-2 text-xs text-white/40">
          {messages.length} رسالة — {subscribers.length} مشترك في النشرة
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
            <MessageSquare size={16} className="text-gold" />
            <h2 className="font-display text-base font-extrabold">صندوق الرسائل</h2>
          </div>
          {messages.length === 0 ? (
            <p className="px-5 py-12 text-center text-[11px] text-white/30">
              لا رسائل من صفحة التواصل بعد.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {messages.map((message) => (
                <article key={message.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[11px] font-bold text-white/80">
                      {message.subject}
                    </h3>
                    <span className="text-[9px] text-white/30">
                      {dateFormat.format(new Date(message.createdAt))}
                    </span>
                  </div>
                  <p className="mt-1 text-[9px] text-white/35">
                    {message.name} —{" "}
                    <a
                      href={`mailto:${message.email}`}
                      className="text-cyan-300/80 hover:text-cyan-300"
                      dir="ltr"
                    >
                      {message.email}
                    </a>
                  </p>
                  <p className="mt-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[10px] leading-6 text-white/55">
                    {message.message}
                  </p>
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(
                      `رد: ${message.subject}`,
                    )}`}
                    className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold text-acid/80 hover:text-acid"
                  >
                    <Send size={11} />
                    رد بالبريد
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
            <Mail size={16} className="text-cyan-300" />
            <h2 className="font-display text-base font-extrabold">مشتركو النشرة</h2>
          </div>
          {subscribers.length === 0 ? (
            <p className="px-5 py-12 text-center text-[11px] text-white/30">
              لا مشتركين بعد.
            </p>
          ) : (
            <div className="max-h-[34rem] divide-y divide-white/5 overflow-y-auto">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.email}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <span className="truncate text-[10px] text-white/60" dir="ltr">
                    {subscriber.email}
                  </span>
                  <span className="shrink-0 text-[8px] text-white/25">
                    {dateFormat.format(new Date(subscriber.createdAt))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
