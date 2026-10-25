import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/** Minimal profile of the signed-in account. APIs answer 401 instead of redirecting. */
export async function GET() {
  const s = await getSession();
  const headers = { "Cache-Control": "private, no-store" };
  if (s.state === "unavailable") return NextResponse.json({ error: "unavailable" }, { status: 503, headers });
  if (s.state !== "valid") return NextResponse.json({ error: "unauthenticated" }, { status: 401, headers: { ...headers, "WWW-Authenticate": 'Cookie realm="yayo"' } });
  const { user } = s;
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, roles: user.roles, emailVerified: user.emailVerified }, { headers });
}
