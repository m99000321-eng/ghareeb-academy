import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { updateProductOverride } from "@/lib/db";
import type { ProductOverride } from "@/lib/commerce-types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "طلب غير صالح" },
      { status: 400 },
    );
  }

  const patch: ProductOverride = {};
  if (typeof body.price === "number") {
    if (body.price < 1 || body.price > 100000) {
      return NextResponse.json(
        { ok: false, error: "السعر غير صالح" },
        { status: 422 },
      );
    }
    patch.price = body.price;
  }
  if (typeof body.stock === "number") {
    if (body.stock < 0 || body.stock > 100000) {
      return NextResponse.json(
        { ok: false, error: "المخزون غير صالح" },
        { status: 422 },
      );
    }
    patch.stock = body.stock;
  }
  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.featured === "boolean") patch.featured = body.featured;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: "لا يوجد تغيير" },
      { status: 400 },
    );
  }

  const override = await updateProductOverride(slug, patch);
  if (!override) {
    return NextResponse.json(
      { ok: false, error: "المنتج غير موجود" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, override });
}
