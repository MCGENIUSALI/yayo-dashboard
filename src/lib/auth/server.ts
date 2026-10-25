import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getConfig, tryGetConfig } from "@/lib/auth/config";
import type { RequestContext } from "@/lib/auth/context";
import { validateSessionToken, type AppRole, type Session, type SessionUser } from "@/lib/auth/sessions";
import { safeNext } from "@/lib/redirect";

/**
 * Next.js glue: cookies, request metadata and the guards used by layouts,
 * pages, server actions and route handlers. Every guard re-validates the
 * session against the database; nothing here trusts the browser's view.
 */

/** `__Host-` prefix over HTTPS: Secure, Path=/, no Domain, cannot be set by a sub-domain. */
export const sessionCookieName = (secure: boolean) => (secure ? "__Host-yayo_session" : "yayo_session");
export const oauthCookieName = (secure: boolean) => (secure ? "__Host-yayo_oauth" : "yayo_oauth");

const baseCookie = (secure: boolean) => ({ httpOnly: true, secure, sameSite: "lax" as const, path: "/" });

export async function setSessionCookie(s: { token: string; expiresAt: Date; persistent: boolean }) {
  const { secureCookies } = getConfig();
  // A standard session gets no Max-Age: the browser drops it when closed. The server-side expiry applies either way.
  (await cookies()).set(sessionCookieName(secureCookies), s.token, { ...baseCookie(secureCookies), ...(s.persistent ? { expires: s.expiresAt } : {}) });
}

/** Same name and attributes as when it was set, so the browser really removes it. */
export async function clearSessionCookie() {
  const { secureCookies } = getConfig();
  (await cookies()).set(sessionCookieName(secureCookies), "", { ...baseCookie(secureCookies), maxAge: 0, expires: new Date(0) });
}

export async function setOAuthCookie(value: string, maxAge: number) {
  const { secureCookies } = getConfig();
  (await cookies()).set(oauthCookieName(secureCookies), value, { ...baseCookie(secureCookies), maxAge });
}

export async function takeOAuthCookie() {
  const { secureCookies } = getConfig();
  const jar = await cookies();
  const value = jar.get(oauthCookieName(secureCookies))?.value;
  jar.set(oauthCookieName(secureCookies), "", { ...baseCookie(secureCookies), maxAge: 0, expires: new Date(0) });
  return value;
}

export async function readSessionToken() {
  const c = tryGetConfig();
  if (!c) return null;
  return (await cookies()).get(sessionCookieName(c.secureCookies))?.value ?? null;
}

export async function requestContext(): Promise<RequestContext> {
  const h = await headers();
  const { trustProxy } = getConfig();
  // Vercel overwrites x-forwarded-for / x-real-ip with the real client address; elsewhere they can be forged.
  const ip = trustProxy ? (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null) : null;
  return { ip: ip || null, userAgent: h.get("user-agent")?.slice(0, 256) ?? null };
}

/**
 * Defence in depth for state-changing actions, on top of SameSite=Lax and the
 * Origin/Host check Next.js applies to Server Actions: the Origin header must
 * be present and match the host serving the request.
 */
export async function assertSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host) throw new Error("Origin check failed");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error("Origin check failed");
  }
  if (originHost !== host) throw new Error("Origin check failed");
}

export type SessionState = { state: "none" } | { state: "expired" } | { state: "unavailable" } | { state: "valid"; user: SessionUser; session: Session; token: string };

/** One database lookup per request, shared by the layout, the page and the data layer. */
export const getSession = cache(async (): Promise<SessionState> => {
  const config = tryGetConfig();
  if (!config) return { state: "unavailable" };
  const token = (await cookies()).get(sessionCookieName(config.secureCookies))?.value;
  if (!token) return { state: "none" };
  try {
    const result = await validateSessionToken(token);
    return result ? { state: "valid", ...result, token } : { state: "expired" };
  } catch (e) {
    console.error(JSON.stringify({ level: "error", scope: "auth", event: "session_lookup_failed", message: e instanceof Error ? e.message : "unknown" }));
    return { state: "unavailable" };
  }
});

/** Path of the page being rendered (set by the proxy), to come back after signing in. */
async function currentPath() {
  return safeNext((await headers()).get("x-yayo-path"));
}

export async function requireUser(): Promise<{ user: SessionUser; session: Session }> {
  const s = await getSession();
  if (s.state === "valid") return s;
  const next = encodeURIComponent(await currentPath());
  if (s.state === "expired") redirect(`/auth/session-expiree?suite=${next}`);
  if (s.state === "unavailable") redirect(`/connexion?erreur=indisponible&suite=${next}`);
  redirect(`/connexion?suite=${next}`);
}

/** Least privilege: each space requires its own role. */
export async function requireRole(role: AppRole) {
  const s = await requireUser();
  if (!s.user.roles.includes(role)) redirect("/acces-refuse");
  return s;
}

/** For server actions: never redirects, the caller returns a failure instead. */
export async function currentUserOrNull() {
  const s = await getSession();
  return s.state === "valid" ? s : null;
}
