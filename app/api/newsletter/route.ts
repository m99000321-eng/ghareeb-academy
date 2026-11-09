import { NextResponse } from "next/server";
import { saveSubscriber } from "@/lib/db";
import { newsletterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "تعذّر قراءة البريد" }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "بريد غير صحيح" },
      { status: 422 },
    );
  }

  await saveSubscriber(parsed.data.email);
  return NextResponse.json({ ok: true, message: "أنت الآن داخل عالم الغريب" }, { status: 201 });
}
