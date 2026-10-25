import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LIMITS } from "@/lib/auth/rate-limit";
import { changePassword, requestPasswordReset, resendVerification, resetPassword, signInWithPassword, signUp, verifyEmail } from "@/lib/auth/service";
import { validateSessionToken } from "@/lib/auth/sessions";
import { closeDb, db } from "@/lib/db";
import { createUser, ctx, mails, resetDb, tokenFrom } from "./helpers";

beforeEach(resetDb);
afterAll(closeDb);

const PW = "une phrase solide 2026";

describe("sign-up", () => {
  it("creates an unverified account, sends a single-use link, and refuses sign-in until confirmed", async () => {
    const r = await signUp({ name: "  Grâce   Mbala ", email: "Grace@Example.com", password: PW }, ctx());
    expect(r).toEqual({ ok: true, email: "grace@example.com" });
    const [u] = await db.query<{ name: string; password_hash: string; email_verified_at: Date | null }>("SELECT name, password_hash, email_verified_at FROM users");
    expect(u.name).toBe("Grâce Mbala");
    expect(u.password_hash).toMatch(/^\$argon2id\$/);
    expect(u.email_verified_at).toBeNull();

    expect(await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null)).toMatchObject({ ok: false, code: "unverified" });

    const token = tokenFrom((await mails())[0]);
    expect(await verifyEmail(token, ctx())).toEqual({ ok: true });
    expect(await verifyEmail(token, ctx())).toMatchObject({ ok: false, status: "used" });
    expect(await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null)).toMatchObject({ ok: true });
  });

  it("answers the same for an existing address and notifies its owner instead", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    const r = await signUp({ name: "Intrus", email: "grace@example.com", password: "autre phrase longue" }, ctx());
    expect(r).toEqual({ ok: true, email: "grace@example.com" });
    const sent = await mails();
    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toMatch(/Tentative d’inscription/);
    expect(tokenFrom(sent[0])).toBeNull();
    expect(await db.query("SELECT 1 FROM users")).toHaveLength(1);
  });

  it("validates input on the server", async () => {
    expect(await signUp({ name: "G", email: "pas-un-email", password: "court" }, ctx())).toMatchObject({ ok: false, fieldErrors: { name: expect.any(String), email: expect.any(String), password: expect.any(String) } });
    expect(await signUp({ name: "Grâce", email: "grace@b.cd", password: "Grace@B.cd" }, ctx())).toMatchObject({ ok: false, fieldErrors: { password: expect.stringMatching(/adresse e-mail/) } });
    expect(await db.query("SELECT 1 FROM users")).toHaveLength(0);
  });

  it("survives two simultaneous sign-ups for the same address", async () => {
    const results = await Promise.all([signUp({ name: "Aa", email: "x@example.com", password: PW }, ctx()), signUp({ name: "Bb", email: "x@example.com", password: PW }, ctx())]);
    expect(results).toEqual([{ ok: true, email: "x@example.com" }, { ok: true, email: "x@example.com" }]);
    expect(await db.query("SELECT 1 FROM users")).toHaveLength(1);
  });
});

describe("sign-in", () => {
  it("gives the same generic error for an unknown address and a wrong password", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    const unknown = await signInWithPassword({ email: "nobody@example.com", password: PW }, ctx(), null);
    const wrong = await signInWithPassword({ email: "grace@example.com", password: "mauvais mot de passe" }, ctx(), null);
    expect(unknown).toEqual(wrong);
    expect(unknown).toMatchObject({ ok: false, code: "credentials", error: "Adresse e-mail ou mot de passe incorrect." });
  });

  it("blocks a suspended account even with the right password", async () => {
    await createUser({ email: "grace@example.com", password: PW, status: "suspended" });
    expect(await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null)).toMatchObject({ ok: false, code: "suspended" });
  });

  it("returns a session token but never the password or its hash", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    const r = await signInWithPassword({ email: "grace@example.com", password: PW, remember: true }, ctx(), null);
    expect(r).toMatchObject({ ok: true, persistent: true });
    expect(JSON.stringify(r)).not.toMatch(/argon2|une phrase/);
  });

  it("limits attempts per account across IPs (credential stuffing) and per IP across accounts", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    for (let i = 0; i < LIMITS.signInAccount.max; i++) await signInWithPassword({ email: "grace@example.com", password: `wrong-${i}-xxxxxxxx` }, ctx(), null);
    // Even the right password from a new IP is refused until the window ends: no oracle for the attacker.
    expect(await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null)).toMatchObject({ ok: false, code: "rate_limited" });

    const ip = ctx("192.0.2.7");
    for (let i = 0; i < LIMITS.signInIp.max; i++) await signInWithPassword({ email: `u${i}@example.com`, password: "whatever-123" }, ip, null);
    expect(await signInWithPassword({ email: "other@example.com", password: "whatever-123" }, ip, null)).toMatchObject({ code: "rate_limited" });
  });

  it("lets the limit expire instead of locking the account forever", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    for (let i = 0; i <= LIMITS.signInAccount.max; i++) await signInWithPassword({ email: "grace@example.com", password: "wrong-password-x" }, ctx(), null);
    await db.query("UPDATE auth_rate_limits SET window_start = window_start - interval '1 hour'");
    expect(await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null)).toMatchObject({ ok: true });
  });
});

describe("password reset", () => {
  it("answers the same whether or not the account exists, and only mails existing ones", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    expect(await requestPasswordReset("nobody@example.com", ctx())).toEqual({ ok: true });
    expect(await requestPasswordReset("grace@example.com", ctx())).toEqual({ ok: true });
    const sent = await mails();
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("grace@example.com");
  });

  it("resets once, revokes every session, and refuses reuse", async () => {
    const id = await createUser({ email: "grace@example.com", password: PW });
    const session = await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null);
    await requestPasswordReset("grace@example.com", ctx());
    const token = tokenFrom((await mails())[0])!;

    expect(await resetPassword({ token, password: "nouvelle phrase solide" }, ctx())).toEqual({ ok: true });
    expect(session.ok && (await validateSessionToken(session.token))).toBeNull();
    expect(await resetPassword({ token, password: "encore une autre phrase" }, ctx())).toMatchObject({ ok: false, status: "used" });
    expect(await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null)).toMatchObject({ ok: false });
    expect(await signInWithPassword({ email: "grace@example.com", password: "nouvelle phrase solide" }, ctx(), null)).toMatchObject({ ok: true });
    expect((await db.query<{ event: string }>("SELECT event FROM auth_events WHERE user_id = $1", [id])).map((e) => e.event)).toContain("password_reset");
  });

  it("refuses an expired token", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    await requestPasswordReset("grace@example.com", ctx());
    const token = tokenFrom((await mails())[0])!;
    await db.query("UPDATE auth_tokens SET expires_at = now() - interval '1 second'");
    expect(await resetPassword({ token, password: "nouvelle phrase solide" }, ctx())).toMatchObject({ ok: false, status: "expired" });
  });

  it("invalidates an older link when a new one is requested", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    await requestPasswordReset("grace@example.com", ctx());
    await requestPasswordReset("grace@example.com", ctx());
    const [first, second] = (await mails()).map(tokenFrom);
    expect(await resetPassword({ token: first, password: "nouvelle phrase solide" }, ctx())).toMatchObject({ ok: false, status: "used" });
    expect(await resetPassword({ token: second, password: "nouvelle phrase solide" }, ctx())).toEqual({ ok: true });
  });

  it("lets exactly one of two simultaneous submissions succeed", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    await requestPasswordReset("grace@example.com", ctx());
    const token = tokenFrom((await mails())[0])!;
    const results = await Promise.all([resetPassword({ token, password: "nouvelle phrase solide" }, ctx()), resetPassword({ token, password: "autre phrase solide !" }, ctx())]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });

  it("silently caps reset e-mails per account", async () => {
    await createUser({ email: "grace@example.com", password: PW });
    for (let i = 0; i < LIMITS.resetRequestAccount.max + 2; i++) expect(await requestPasswordReset("grace@example.com", ctx())).toEqual({ ok: true });
    expect(await mails()).toHaveLength(LIMITS.resetRequestAccount.max);
  });

  it("never writes tokens, passwords or addresses to the logs", async () => {
    const out: string[] = [];
    const spies = (["info", "log", "warn", "error"] as const).map((m) => vi.spyOn(console, m).mockImplementation((...a) => void out.push(a.join(" "))));
    await createUser({ email: "grace@example.com", password: PW });
    await signInWithPassword({ email: "grace@example.com", password: "mauvais mot de passe" }, ctx(), null);
    await requestPasswordReset("grace@example.com", ctx());
    const token = tokenFrom((await mails())[0])!;
    await resetPassword({ token, password: "nouvelle phrase solide" }, ctx());
    spies.forEach((s) => s.mockRestore());
    const logs = out.join("\n");
    expect(logs).toContain("password_reset");
    for (const secret of [token, PW, "mauvais mot de passe", "nouvelle phrase solide", "grace@example.com"]) expect(logs).not.toContain(secret);
    const events = JSON.stringify(await db.query("SELECT * FROM auth_events"));
    for (const secret of [token, PW, "grace@example.com"]) expect(events).not.toContain(secret);
  });
});

describe("verification e-mail", () => {
  it("resends only to unverified accounts, with the same answer", async () => {
    await createUser({ email: "done@example.com", verified: true });
    await createUser({ email: "todo@example.com", verified: false });
    expect(await resendVerification("done@example.com", ctx())).toEqual({ ok: true });
    expect(await resendVerification("todo@example.com", ctx())).toEqual({ ok: true });
    expect(await resendVerification("ghost@example.com", ctx())).toEqual({ ok: true });
    expect((await mails()).map((m) => m.to)).toEqual(["todo@example.com"]);
  });

  it("refuses an expired verification link", async () => {
    await createUser({ email: "todo@example.com", verified: false });
    await resendVerification("todo@example.com", ctx());
    await db.query("UPDATE auth_tokens SET expires_at = now() - interval '1 second'");
    expect(await verifyEmail(tokenFrom((await mails())[0]), ctx())).toMatchObject({ ok: false, status: "expired" });
  });
});

describe("password change", () => {
  it("requires the current password, revokes all sessions and rotates the current one", async () => {
    const id = await createUser({ email: "grace@example.com", password: PW });
    const user = { id, email: "grace@example.com", name: "G", roles: ["seller" as const], emailVerified: true, hasPassword: true };
    const s1 = await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null);
    const s2 = await signInWithPassword({ email: "grace@example.com", password: PW }, ctx(), null);
    expect(await changePassword(user, { current: "faux mot de passe", next: "nouvelle phrase solide" }, ctx(), false)).toMatchObject({ ok: false, fieldErrors: { current: expect.any(String) } });
    const r = await changePassword(user, { current: PW, next: "nouvelle phrase solide" }, ctx(), false);
    expect(r.ok).toBe(true);
    for (const s of [s1, s2]) expect(s.ok && (await validateSessionToken(s.token))).toBeNull();
    expect(r.ok && (await validateSessionToken(r.token))).not.toBeNull();
  });
});
