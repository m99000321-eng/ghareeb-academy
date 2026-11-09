import { NextResponse } from "next/server";
import { getOrder, getPaymentEvents } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "الطلب غير موجود" },
      { status: 404 },
    );
  }
  const events = await getPaymentEvents(order.id);
  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      createdAt: order.createdAt,
      customer: {
        name: order.customer.name,
        city: order.customer.city,
        address: order.customer.address,
      },
      payment: order.payment,
      paymentStatus: order.paymentStatus,
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      codFee: order.codFee,
      total: order.total,
      tracking: order.tracking ?? "",
      events: events.slice(0, 20),
    },
  });
}
