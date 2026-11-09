import { NextRequest, NextResponse } from "next/server";
import { categories, queryFrom } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const catalog = await getCatalog();

  const result = queryFrom(catalog, {
    category: searchParams.get("category"),
    q: searchParams.get("q"),
    sort: searchParams.get("sort"),
    featuredOnly: searchParams.get("featured") === "true",
    limit: Number.isFinite(limitParam) ? limitParam : 0,
  });

  return NextResponse.json({
    ok: true,
    total: result.length,
    products: result,
    categories,
  });
}
