import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_HOURS,
  passwordMatches,
  signAdminToken,
} from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}

export async function POST(request: Request) {
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(key)) {
    return NextResponse.json(
      { ok: false, error: "محاولات كثيرة — انتظر دقائق ثم أعد المحاولة" },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json(
      { ok: false, error: "طلب غير صالح" },
      { status: 400 },
    );
  }

  if (!password || !(await passwordMatches(password))) {
    return NextResponse.json(
      { ok: false, error: "كلمة المرور غير صحيحة" },
      { status: 401 },
    );
  }

  attempts.delete(key);
  const token = await signAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: new URL(request.url).protocol === "https:",
    maxAge: SESSION_HOURS * 60 * 60,
  });
  return response;
}
