import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "./admin-auth";

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}
