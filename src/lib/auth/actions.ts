"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/lib/auth/audit";
import { ConfigError, getConfig } from "@/lib/auth/config";
import { OAUTH_TTL_SEC, startGoogle } from "@/lib/auth/google-flow";
import { revokeAllSessions, revokeOwnSession, revokeSessionByToken } from "@/lib/auth/sessions";
import {
  assertSameOrigin,
  clearSessionCookie,
  currentUserOrNull,
  readSessionToken,
  requestContext,
  setOAuthCookie,
  setSessionCookie,
} from "@/lib/auth/server";
import * as service from "@/lib/auth/service";
import type { Failure } from "@/lib/auth/service";
import { db } from "@/lib/db";
import { safeNext } from "@/lib/redirect";

/**
 * Server Actions behind the authentication screens. They only accept POST
 * from this origin, return plain results (never a password, hash or token)
 * and perform redirects outside of the error guard so Next.js can handle them.
 */
type Result<T = object> = ({ ok: true } & T) | Failure;

const UNAVAILABLE: Failure = { ok: false, error: "La connexion est indisponible pour le moment. Réessaie dans quelques minutes.", code: "unavailable" };
const SIGNED_OUT: Failure = { ok: false, error: "Ta session a expiré. Reconnecte-toi.", code: "signed_out" };

async function guard<T>(fn: () => Promise<T | Failure>): Promise<T | Failure> {
  try {
    await assertSameOrigin();
    return await fn();
  } catch (e) {
    if (e instanceof ConfigError) return UNAVAILABLE;
    if (e instanceof Error && e.message === "Origin check failed") return { ok: false, error: "Requête refusée.", code: "origin" };
    console.error(JSON.stringify({ level: "error", scope: "auth", event: "action_failed", message: e instanceof Error ? e.message : "unknown" }));
    return { ok: false, error: "Une erreur est survenue de notre côté. Réessaie dans un instant.", code: "server" };
  }
}

export async function signInAction(input: { email: string; password: string; remember: boolean; next?: string }): Promise<Failure> {
  const result = await guard(async () => {
    const r = await service.signInWithPassword(input, await requestContext(), await readSessionToken());
    if (r.ok) await setSessionCookie(r);
    return r;
  });
  if (!result.ok) return result;
  revalidatePath("/", "layout");
  redirect(safeNext(input.next));
}

export async function signUpAction(input: { name: string; email: string; password: string }): Promise<Result<{ email: string }>> {
  return guard(async () => service.signUp(input, await requestContext()));
}

export async function resendVerificationAction(email: string): Promise<Result> {
  return guard(async () => service.resendVerification(email, await requestContext()));
}

export async function confirmEmailAction(token: string): Promise<Result> {
  return guard(async () => service.verifyEmail(token, await requestContext()));
}

export async function requestResetAction(email: string): Promise<Result> {
  return guard(async () => service.requestPasswordReset(email, await requestContext()));
}

export async function resetPasswordAction(input: { token: string; password: string }): Promise<Failure> {
  const result = await guard(async () => {
    const r = await service.resetPassword(input, await requestContext());
    if (r.ok) await clearSessionCookie();
    return r;
  });
  if (!result.ok) return result;
  revalidatePath("/", "layout");
  redirect("/connexion?message=mot_de_passe_modifie");
}

export async function googleStartAction(input: { next?: string; remember?: boolean }): Promise<Failure> {
  const result = await guard(async () => {
    const c = getConfig();
    if (!c.googleEnabled) return { ok: false, error: "La connexion avec Google n’est pas encore disponible. Utilise ton adresse e-mail.", code: "google_disabled" } satisfies Failure;
    const { url, cookie } = startGoogle(c, { mode: "login", next: input.next, remember: input.remember });
    await setOAuthCookie(cookie, OAUTH_TTL_SEC);
    return { ok: true as const, url };
  });
  if (!result.ok) return result;
  redirect(result.url);
}

/** Linking needs a signed-in session and, for password accounts, the password again (proof of control). */
export async function googleLinkAction(input: { password: string }): Promise<Failure> {
  const result = await guard(async () => {
    const s = await currentUserOrNull();
    if (!s) return SIGNED_OUT;
    const c = getConfig();
    if (!c.googleEnabled) return { ok: false, error: "La connexion avec Google n’est pas encore disponible.", code: "google_disabled" } satisfies Failure;
    const confirmed = await service.confirmPassword(s.user, input.password, await requestContext());
    if (!confirmed.ok) return confirmed;
    const { url, cookie } = startGoogle(c, { mode: "link", next: "/compte/securite", userId: s.user.id });
    await setOAuthCookie(cookie, OAUTH_TTL_SEC);
    return { ok: true as const, url };
  });
  if (!result.ok) return result;
  redirect(result.url);
}

export async function unlinkGoogleAction(): Promise<Result> {
  const result = await guard(async () => {
    const s = await currentUserOrNull();
    if (!s) return SIGNED_OUT;
    return service.unlinkGoogle(s.user, await requestContext());
  });
  if (result.ok) revalidatePath("/compte", "layout");
  return result;
}

/** Revokes the session server-side first, then removes the cookie with its original attributes. */
export async function signOutAction(): Promise<void> {
  await guard(async () => {
    const s = await currentUserOrNull();
    const token = await readSessionToken();
    if (token) await revokeSessionByToken(token);
    await clearSessionCookie();
    if (s) await audit("sign_out", await requestContext(), s.user.id);
    return { ok: true as const };
  });
  revalidatePath("/", "layout");
  redirect("/deconnexion");
}

export async function signOutEverywhereAction(): Promise<Failure> {
  const result = await guard(async () => {
    const s = await currentUserOrNull();
    if (!s) return SIGNED_OUT;
    await revokeAllSessions(db, s.user.id);
    await clearSessionCookie();
    await audit("sessions_revoked_all", await requestContext(), s.user.id);
    return { ok: true as const };
  });
  if (!result.ok) return result;
  revalidatePath("/", "layout");
  redirect("/deconnexion?partout=1");
}

/** Revokes one of the caller's sessions. The owner is taken from the validated session, never from the request. */
export async function revokeSessionAction(publicId: string): Promise<Result> {
  if (typeof publicId !== "string" || !/^[0-9a-f-]{36}$/i.test(publicId)) return { ok: false, error: "Session introuvable.", code: "not_found" };
  const result = await guard(async () => {
    const s = await currentUserOrNull();
    if (!s) return SIGNED_OUT;
    if (!(await revokeOwnSession(s.user.id, publicId))) return { ok: false, error: "Cette session n’existe plus.", code: "not_found" } satisfies Failure;
    await audit("session_revoked", await requestContext(), s.user.id);
    return { ok: true as const, current: publicId === s.session.publicId };
  });
  if (!result.ok) return result;
  if (result.current) {
    await clearSessionCookie().catch(() => {});
    revalidatePath("/", "layout");
    redirect("/deconnexion");
  }
  revalidatePath("/compte/securite");
  return { ok: true };
}

export async function changePasswordAction(input: { current: string; next: string }): Promise<Result> {
  const result = await guard(async () => {
    const s = await currentUserOrNull();
    if (!s) return SIGNED_OUT;
    const r = await service.changePassword(s.user, input, await requestContext(), s.session.persistent);
    if (!r.ok) return r;
    await setSessionCookie(r);
    return { ok: true as const };
  });
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function updateNameAction(name: string): Promise<Result<{ name: string }>> {
  const result = await guard(async () => {
    const s = await currentUserOrNull();
    if (!s) return SIGNED_OUT;
    return service.updateName(s.user, name);
  });
  if (result.ok) revalidatePath("/", "layout");
  return result;
}
