import { NextResponse } from "next/server";
import { saveContact } from "@/lib/db";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "تعذّر قراءة الرسالة" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "بيانات الرسالة غير صحيحة",
      },
      { status: 422 },
    );
  }

  const { name, email, subject, message } = parsed.data;
  await saveContact({
    id: `MSG-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    name,
    email,
    subject,
    message,
  });

  return NextResponse.json({ ok: true, message: "وصلتنا رسالتك، سنرد قريبًا" }, { status: 201 });
}
