import { NextResponse } from "next/server";
import { addPaymentEvent, getOrder, updateOrder } from "@/lib/db";
import { getPaymentMethod } from "@/lib/payments";

export async function POST(request: Request) {
  let body: { orderId?: unknown; reference?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "طلب غير صالح" },
      { status: 400 },
    );
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const reference =
    typeof body.reference === "string" ? body.reference.trim() : "";
  if (reference.length < 4 || reference.length > 80) {
    return NextResponse.json(
      { ok: false, error: "أدخل رقم عملية صحيحًا (4 أحرف على الأقل)" },
      { status: 422 },
    );
  }

  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "الطلب غير موجود" },
      { status: 404 },
    );
  }

  if (getPaymentMethod(order.payment).kind !== "manual") {
    return NextResponse.json(
      { ok: false, error: "هذه الطريقة لا تقبل التحويل اليدوي" },
      { status: 400 },
    );
  }

  if (order.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, redirectUrl: `/order/${order.id}?paid=1` });
  }

  await updateOrder(order.id, {
    paymentStatus: "review",
    transferRef: reference,
  });
  await addPaymentEvent({
    orderId: order.id,
    method: order.payment,
    type: "submitted",
    status: "review",
    amount: order.total,
    reference,
    note: "أرسل العميل رقم التحويل بانتظار المراجعة",
  });

  return NextResponse.json({
    ok: true,
    review: true,
    redirectUrl: `/order/${order.id}?review=1`,
  });
}
