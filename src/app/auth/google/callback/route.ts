import { NextResponse, type NextRequest } from "next/server";
import { ConfigError, getConfig } from "@/lib/auth/config";
import { completeGoogle, googleDeps } from "@/lib/auth/google-flow";
import { createSession } from "@/lib/auth/sessions";
import { currentUserOrNull, readSessionToken, requestContext, setSessionCookie, takeOAuthCookie } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Google redirects the browser here after consent (GET, top-level navigation: the SameSite=Lax state cookie is sent). */
export async function GET(request: NextRequest) {
  const base = request.nextUrl.origin;
  const to = (path: string) => {
    const res = NextResponse.redirect(new URL(path, base), 303);
    // The callback URL carries a one-time code: keep it out of caches and referrers.
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Referrer-Policy", "no-referrer");
    return res;
  };
  try {
    const config = getConfig();
    if (!config.googleEnabled) return to("/connexion?erreur=google_echec");
    const cookie = await takeOAuthCookie();
    const ctx = await requestContext();
    const current = await currentUserOrNull();
    const outcome = await completeGoogle({ params: request.nextUrl.searchParams, cookie, currentUser: current?.user ?? null }, googleDeps(config), ctx);

    if (outcome.type === "error") return to(outcome.mode === "link" ? `/compte/securite?erreur=${outcome.code}` : `/connexion?erreur=${outcome.code}`);
    if (outcome.type === "linked") return to("/compte/securite?message=google_lie");
    const session = await createSession(db, { userId: outcome.userId, roles: outcome.roles, remember: outcome.remember, method: "google", userAgent: ctx.userAgent, replacesToken: await readSessionToken() });
    await setSessionCookie(session);
    return to(outcome.next);
  } catch (e) {
    if (!(e instanceof ConfigError)) console.error(JSON.stringify({ level: "error", scope: "auth", event: "google_callback_failed", message: e instanceof Error ? e.message : "unknown" }));
    return to("/connexion?erreur=google_echec");
  }
}
