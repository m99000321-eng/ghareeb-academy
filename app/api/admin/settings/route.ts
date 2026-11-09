import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { updateSettings } from "@/lib/db";
import type { PaymentMethodId, StoreSettings } from "@/lib/commerce-types";
import { PAYMENT_METHODS } from "@/lib/payments";

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "طلب غير صالح" },
      { status: 400 },
    );
  }

  const patch: Partial<StoreSettings> = {};

  const numericFields = [
    "shippingFee",
    "freeShippingThreshold",
    "codFee",
  ] as const;
  for (const field of numericFields) {
    if (typeof body[field] === "number") {
      patch[field] = body[field] as number;
    }
  }

  const textFields = [
    "whatsapp",
    "supportEmail",
    "instapayHandle",
    "bankName",
    "bankAccount",
    "bankHolder",
  ] as const;
  for (const field of textFields) {
    if (typeof body[field] === "string") {
      patch[field] = body[field].trim().slice(0, 160);
    }
  }

  if (body.methods && typeof body.methods === "object") {
    const methods: Partial<Record<PaymentMethodId, boolean>> = {};
    for (const method of PAYMENT_METHODS) {
      const value = (body.methods as Record<string, unknown>)[method.id];
      if (typeof value === "boolean") methods[method.id] = value;
    }
    patch.methods = methods as StoreSettings["methods"];
  }

  const settings = await updateSettings(patch);
  return NextResponse.json({ ok: true, settings });
}
