import { NextResponse } from "next/server";
import { addPaymentEvent, getOrder, updateOrder } from "@/lib/db";
import { getPaymentMethod } from "@/lib/payments";

export async function POST(request: Request) {
  let body: { orderId?: unknown; outcome?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "طلب غير صالح" },
      { status: 400 },
    );
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const outcome = body.outcome === "fail" ? "fail" : "success";
  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "الطلب غير موجود" },
      { status: 404 },
    );
  }

  const method = getPaymentMethod(order.payment);
  if (method.kind !== "online") {
    return NextResponse.json(
      { ok: false, error: "هذا الطلب لا يحتاج بوابة دفع إلكترونية" },
      { status: 400 },
    );
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, redirectUrl: `/order/${order.id}?paid=1` });
  }

  if (outcome === "fail") {
    await updateOrder(order.id, {
      paymentStatus: "failed",
      status: "pending_payment",
    });
    await addPaymentEvent({
      orderId: order.id,
      method: order.payment,
      type: "simulated",
      status: "failed",
      amount: order.total,
      note: "محاكاة دفع فاشلة (وضع تجريبي)",
    });
    return NextResponse.json({
      ok: true,
      failed: true,
      message: "فشل الدفع التجريبي — يمكنك إعادة المحاولة",
    });
  }

  const reference = `SIM-${Date.now().toString(36).toUpperCase()}`;
  await updateOrder(order.id, {
    paymentStatus: "paid",
    status: "confirmed",
  });
  await addPaymentEvent({
    orderId: order.id,
    method: order.payment,
    type: "simulated",
    status: "paid",
    amount: order.total,
    reference,
    note: "دفع ناجح عبر بوابة تجريبية",
  });

  return NextResponse.json({
    ok: true,
    paid: true,
    reference,
    redirectUrl: `/order/${order.id}?paid=1`,
  });
}
