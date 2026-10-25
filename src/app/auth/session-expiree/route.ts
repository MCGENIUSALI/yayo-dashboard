import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/auth/server";
import { safeNext } from "@/lib/redirect";

export const dynamic = "force-dynamic";

/** A cookie the server no longer accepts: remove it, then show the sign-in screen with an explanation. */
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("suite"));
  await clearSessionCookie().catch(() => {});
  const url = new URL("/connexion", request.nextUrl.origin);
  url.searchParams.set("raison", "expiree");
  if (next !== "/") url.searchParams.set("suite", next);
  const res = NextResponse.redirect(url, 303);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
