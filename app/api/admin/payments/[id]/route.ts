import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { addPaymentEvent, getOrder, updateOrder } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  let body: { action?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "طلب غير صالح" },
      { status: 400 },
    );
  }

  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "الطلب غير موجود" },
      { status: 404 },
    );
  }

  const action = body.action;
  if (action === "confirm") {
    await updateOrder(order.id, { paymentStatus: "paid", status: "confirmed" });
    await addPaymentEvent({
      orderId: order.id,
      method: order.payment,
      type: "confirmed",
      status: "paid",
      amount: order.total,
      reference: order.transferRef,
      note: "أكّد الإدارة استلام المبلغ",
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    await updateOrder(order.id, { paymentStatus: "failed" });
    await addPaymentEvent({
      orderId: order.id,
      method: order.payment,
      type: "rejected",
      status: "failed",
      amount: order.total,
      note: "رفضت الإدارة إثبات الدفع",
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "refund") {
    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { ok: false, error: "لا يمكن استرداد طلب غير مدفوع" },
        { status: 400 },
      );
    }
    await updateOrder(order.id, { paymentStatus: "refunded" });
    await addPaymentEvent({
      orderId: order.id,
      method: order.payment,
      type: "refunded",
      status: "refunded",
      amount: order.total,
      note: "تم تسجيل استرداد المبلغ",
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "إجراء غير معروف" },
    { status: 400 },
  );
}
