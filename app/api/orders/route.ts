import { NextResponse } from "next/server";
import {
  createOrder,
  createOrderId,
  getSettings,
  isPaymentEnabled,
  reserveStock,
} from "@/lib/db";
import { getCatalogMap } from "@/lib/catalog";
import { getPaymentMethod } from "@/lib/payments";
import { orderSchema } from "@/lib/validation";
import type { OrderItem, OrderRecord } from "@/lib/commerce-types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "تعذّر قراءة الطلب" },
      { status: 400 },
    );
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "بيانات الطلب غير صحيحة",
      },
      { status: 422 },
    );
  }

  const { customer, payment, items } = parsed.data;
  const settings = await getSettings();
  if (!isPaymentEnabled(settings, payment)) {
    return NextResponse.json(
      { ok: false, error: "طريقة الدفع غير متاحة حاليًا" },
      { status: 400 },
    );
  }

  const catalog = await getCatalogMap();
  const orderItems: OrderItem[] = [];

  for (const line of items) {
    const product = catalog[line.slug];
    if (!product) {
      return NextResponse.json(
        { ok: false, error: `المنتج ${line.slug} غير متاح` },
        { status: 404 },
      );
    }
    if (line.qty > product.stock) {
      return NextResponse.json(
        {
          ok: false,
          error: `الكمية المطلوبة من «${product.name}» غير متوفرة`,
        },
        { status: 409 },
      );
    }
    orderItems.push({
      slug: product.slug,
      name: product.name,
      price: product.price,
      qty: line.qty,
    });
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const shipping =
    subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const codFee = payment === "cod" ? settings.codFee : 0;
  const total = subtotal + shipping + codFee;
  const id = createOrderId();
  const method = getPaymentMethod(payment);
  const now = new Date().toISOString();

  const order: OrderRecord = {
    id,
    createdAt: now,
    updatedAt: now,
    customer,
    payment,
    paymentStatus:
      method.kind === "cod"
        ? "unpaid"
        : method.kind === "manual"
          ? "pending"
          : "pending",
    status: method.kind === "cod" ? "new" : "pending_payment",
    items: orderItems,
    subtotal,
    shipping,
    codFee,
    total,
  };

  await createOrder(order);
  await reserveStock(orderItems.map((item) => ({ slug: item.slug, qty: item.qty })));

  const redirectUrl =
    method.kind === "cod" ? `/order/${id}` : `/pay/${id}`;

  return NextResponse.json(
    {
      ok: true,
      order: {
        id,
        subtotal,
        shipping,
        codFee,
        total,
        payment,
        paymentStatus: order.paymentStatus,
        status: order.status,
        customer: { name: customer.name, city: customer.city },
      },
      redirectUrl,
    },
    { status: 201 },
  );
}
