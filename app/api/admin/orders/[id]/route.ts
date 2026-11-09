import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { updateOrder } from "@/lib/db";
import {
  ORDER_STATUS_ORDER,
  PAYMENT_STATUS_ORDER,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/commerce-types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "طلب غير صالح" },
      { status: 400 },
    );
  }

  const patch: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    tracking?: string;
    adminNotes?: string;
  } = {};

  if (typeof body.status === "string") {
    if (!ORDER_STATUS_ORDER.includes(body.status as OrderStatus)) {
      return NextResponse.json(
        { ok: false, error: "حالة طلب غير معروفة" },
        { status: 422 },
      );
    }
    patch.status = body.status as OrderStatus;
  }

  if (typeof body.paymentStatus === "string") {
    if (!PAYMENT_STATUS_ORDER.includes(body.paymentStatus as PaymentStatus)) {
      return NextResponse.json(
        { ok: false, error: "حالة دفع غير معروفة" },
        { status: 422 },
      );
    }
    patch.paymentStatus = body.paymentStatus as PaymentStatus;
  }

  if (typeof body.tracking === "string") {
    patch.tracking = body.tracking.trim().slice(0, 80);
  }
  if (typeof body.adminNotes === "string") {
    patch.adminNotes = body.adminNotes.trim().slice(0, 1000);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: "لا يوجد تغيير" },
      { status: 400 },
    );
  }

  const order = await updateOrder(id, patch);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "الطلب غير موجود" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, order });
}
