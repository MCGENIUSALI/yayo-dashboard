import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getConfig } from "@/lib/auth/config";
import { completeGoogle, sealState, startGoogle, type GoogleDeps } from "@/lib/auth/google-flow";
import { GoogleError } from "@/lib/auth/google";
import type { SessionUser } from "@/lib/auth/sessions";
import { closeDb, db } from "@/lib/db";
import { createUser, ctx, resetDb } from "./helpers";

beforeEach(resetDb);
afterAll(closeDb);

const identity = { sub: "google-sub-1", email: "Grace@Gmail.com", name: "Grâce Mbala" };
const deps = (over: Partial<GoogleDeps> = {}): GoogleDeps => ({ exchange: vi.fn(async () => "id-token"), verify: vi.fn(async () => identity), ...over });

function flow(mode: "login" | "link" = "login", userId?: string) {
  const { url, cookie } = startGoogle(getConfig(), { mode, next: "/vendeur/commandes", userId });
  const state = new URL(url).searchParams.get("state")!;
  return { cookie, state };
}

const params = (o: Record<string, string>) => new URLSearchParams(o);

describe("Google callback", () => {
  it("creates a verified account and signs in on a valid response", async () => {
    const { cookie, state } = flow();
    const d = deps();
    const out = await completeGoogle({ params: params({ state, code: "c0de" }), cookie, currentUser: null }, d, ctx());
    expect(out).toMatchObject({ type: "signed_in", next: "/vendeur/commandes", roles: ["seller"] });
    expect(d.exchange).toHaveBeenCalledWith("c0de", expect.any(String));
    const [u] = await db.query<{ email: string; email_verified_at: Date | null; password_hash: string | null }>("SELECT email, email_verified_at, password_hash FROM users");
    expect(u).toMatchObject({ email: "grace@gmail.com", password_hash: null });
    expect(u.email_verified_at).not.toBeNull();
    // No Google token is stored anywhere.
    const [{ count }] = await db.query<{ count: string }>("SELECT count(*) FROM user_identities WHERE subject = 'google-sub-1'");
    expect(count).toBe("1");
  });

  it("signs an existing linked account in by sub, even if its Google e-mail changed", async () => {
    const id = await createUser({ email: "old@example.com" });
    await db.query("INSERT INTO user_identities (provider, subject, user_id) VALUES ('google', 'google-sub-1', $1)", [id]);
    const { cookie, state } = flow();
    expect(await completeGoogle({ params: params({ state, code: "c" }), cookie, currentUser: null }, deps(), ctx())).toMatchObject({ type: "signed_in", userId: id });
  });

  it("never links to an existing password account on a matching e-mail", async () => {
    await createUser({ email: "grace@gmail.com", password: "une phrase solide" });
    const { cookie, state } = flow();
    expect(await completeGoogle({ params: params({ state, code: "c" }), cookie, currentUser: null }, deps(), ctx())).toEqual({ type: "error", code: "google_compte_existant", mode: "login" });
    expect(await db.query("SELECT 1 FROM user_identities")).toHaveLength(0);
  });

  it("handles a refused consent", async () => {
    const { cookie, state } = flow();
    const d = deps();
    expect(await completeGoogle({ params: params({ state, error: "access_denied" }), cookie, currentUser: null }, d, ctx())).toMatchObject({ type: "error", code: "google_refus" });
    expect(d.exchange).not.toHaveBeenCalled();
  });

  it.each([
    ["no state cookie (login CSRF)", (s: string) => ({ params: params({ state: s, code: "c" }), cookie: undefined })],
    ["state mismatch", (_: string, c: string) => ({ params: params({ state: "attacker-state", code: "c" }), cookie: c })],
    ["tampered cookie", (s: string, c: string) => ({ params: params({ state: s, code: "c" }), cookie: c.replace(/.$/, (ch) => (ch === "A" ? "B" : "A")) })],
    ["missing code", (s: string, c: string) => ({ params: params({ state: s }), cookie: c })],
  ])("rejects an invalid callback: %s", async (_, make) => {
    const { cookie, state } = flow();
    const d = deps();
    const out = await completeGoogle({ ...make(state, cookie), currentUser: null }, d, ctx());
    expect(out).toMatchObject({ type: "error", code: "google_echec" });
    expect(d.exchange).not.toHaveBeenCalled();
  });

  it("rejects an expired state", async () => {
    const cookie = sealState({ state: "s", verifier: "v", nonce: "n", next: "/", mode: "login", remember: false, exp: Date.now() - 1 });
    expect(await completeGoogle({ params: params({ state: "s", code: "c" }), cookie, currentUser: null }, deps(), ctx())).toMatchObject({ code: "google_echec" });
  });

  it("maps token verification failures without creating anything", async () => {
    const { cookie, state } = flow();
    const out = await completeGoogle({ params: params({ state, code: "c" }), cookie, currentUser: null }, deps({ verify: async () => { throw new GoogleError("invalid_id_token"); } }), ctx());
    expect(out).toMatchObject({ code: "google_echec" });
    expect(await db.query("SELECT 1 FROM users")).toHaveLength(0);
  });

  it("refuses a suspended account", async () => {
    const id = await createUser({ email: "s@example.com", status: "suspended" });
    await db.query("INSERT INTO user_identities (provider, subject, user_id) VALUES ('google', 'google-sub-1', $1)", [id]);
    const { cookie, state } = flow();
    expect(await completeGoogle({ params: params({ state, code: "c" }), cookie, currentUser: null }, deps(), ctx())).toMatchObject({ code: "compte_suspendu" });
  });
});

describe("Google linking", () => {
  const user = (id: string): SessionUser => ({ id, email: "grace@example.com", name: "G", roles: ["seller"], emailVerified: true, hasPassword: true });

  it("links to the signed-in account that started the flow", async () => {
    const id = await createUser({ email: "grace@example.com", password: "une phrase solide" });
    const { cookie, state } = flow("link", id);
    expect(await completeGoogle({ params: params({ state, code: "c" }), cookie, currentUser: user(id) }, deps(), ctx())).toMatchObject({ type: "linked" });
    expect(await db.query("SELECT 1 FROM user_identities WHERE user_id = $1", [id])).toHaveLength(1);
  });

  it("refuses when the session changed between start and callback", async () => {
    const a = await createUser({ email: "a@example.com" });
    const b = await createUser({ email: "b@example.com" });
    const { cookie, state } = flow("link", a);
    expect(await completeGoogle({ params: params({ state, code: "c" }), cookie, currentUser: user(b) }, deps(), ctx())).toMatchObject({ type: "error", code: "google_echec", mode: "link" });
  });

  it("refuses a Google account already linked to someone else", async () => {
    const a = await createUser({ email: "a@example.com" });
    const b = await createUser({ email: "b@example.com" });
    await db.query("INSERT INTO user_identities (provider, subject, user_id) VALUES ('google', 'google-sub-1', $1)", [a]);
    const { cookie, state } = flow("link", b);
    expect(await completeGoogle({ params: params({ state, code: "c" }), cookie, currentUser: user(b) }, deps(), ctx())).toMatchObject({ code: "google_deja_lie" });
  });
});
