import { NextResponse } from "next/server";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, productMap } from "@/lib/products";
import { createOrderId, saveOrder, type OrderItem } from "@/lib/db";
import { orderSchema } from "@/lib/validation";

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
  const orderItems: OrderItem[] = [];

  for (const line of items) {
    const product = productMap[line.slug];
    if (!product) {
      return NextResponse.json(
        { ok: false, error: `المنتج ${line.slug} غير متاح` },
        { status: 404 },
      );
    }
    if (line.qty > product.stock) {
      return NextResponse.json(
        { ok: false, error: `الكمية المطلوبة من «${product.name}» غير متوفرة` },
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

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const id = createOrderId();

  await saveOrder({
    id,
    createdAt: new Date().toISOString(),
    customer,
    payment,
    items: orderItems,
    subtotal,
    shipping,
    total,
    status: "new",
  });

  return NextResponse.json(
    {
      ok: true,
      order: {
        id,
        subtotal,
        shipping,
        total,
        items: orderItems,
        payment,
        customer: { name: customer.name, city: customer.city },
      },
    },
    { status: 201 },
  );
}
