import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { sha256 } from "@/lib/auth/crypto";
import { createSession, listActiveSessions, MAX_SESSIONS, revokeAllSessions, revokeOwnSession, sessionPolicy, validateSessionToken } from "@/lib/auth/sessions";
import { closeDb, db } from "@/lib/db";
import { createUser, resetDb } from "./helpers";

beforeEach(resetDb);
afterAll(closeDb);

const open = (userId: string, remember = false, roles: ("seller" | "admin")[] = ["seller"]) => createSession(db, { userId, roles, remember, method: "password", userAgent: "UA" });

describe("session lifecycle", () => {
  it("stores only a hash of the opaque token", async () => {
    const id = await createUser({ email: "a@example.com" });
    const { token } = await open(id);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const rows = await db.query<{ id: string }>("SELECT id FROM sessions");
    expect(rows[0].id).toBe(sha256(token));
    expect(JSON.stringify(rows)).not.toContain(token);
    expect((await validateSessionToken(token))?.user.id).toBe(id);
  });

  it("rejects unknown, malformed and revoked tokens", async () => {
    const id = await createUser({ email: "a@example.com" });
    const { token } = await open(id);
    expect(await validateSessionToken("x".repeat(43))).toBeNull();
    expect(await validateSessionToken("'; DROP TABLE users; --")).toBeNull();
    await revokeAllSessions(db, id);
    expect(await validateSessionToken(token)).toBeNull();
  });

  it("expires after inactivity", async () => {
    const id = await createUser({ email: "a@example.com" });
    const { token } = await open(id);
    await db.query("UPDATE sessions SET last_seen_at = now() - interval '13 hours'");
    expect(await validateSessionToken(token)).toBeNull();
  });

  it("expires at its absolute lifetime even when active", async () => {
    const id = await createUser({ email: "a@example.com" });
    const { token } = await open(id, true);
    await db.query("UPDATE sessions SET expires_at = now() - interval '1 second'");
    expect(await validateSessionToken(token)).toBeNull();
  });

  it("refreshes activity at most once a minute", async () => {
    const id = await createUser({ email: "a@example.com" });
    const { token } = await open(id);
    await db.query("UPDATE sessions SET last_seen_at = now() - interval '5 minutes'");
    await validateSessionToken(token);
    const [{ recent }] = await db.query<{ recent: boolean }>("SELECT last_seen_at > now() - interval '5 seconds' AS recent FROM sessions");
    expect(recent).toBe(true);
  });

  it("stops accepting sessions of a suspended account", async () => {
    const id = await createUser({ email: "a@example.com" });
    const { token } = await open(id);
    await db.query("UPDATE users SET status = 'suspended'");
    expect(await validateSessionToken(token)).toBeNull();
  });

  it("issues a new identifier at sign-in and revokes the one the browser held (fixation)", async () => {
    const id = await createUser({ email: "a@example.com" });
    const first = await open(id);
    const second = await createSession(db, { userId: id, roles: ["seller"], remember: false, method: "password", userAgent: null, replacesToken: first.token });
    expect(second.token).not.toBe(first.token);
    expect(await validateSessionToken(first.token)).toBeNull();
    expect(await validateSessionToken(second.token)).not.toBeNull();
  });

  it("caps concurrent sessions by revoking the oldest", async () => {
    const id = await createUser({ email: "a@example.com" });
    const first = await open(id);
    for (let i = 0; i < MAX_SESSIONS; i++) await open(id);
    expect(await validateSessionToken(first.token)).toBeNull();
    expect(await listActiveSessions(id)).toHaveLength(MAX_SESSIONS);
  });
});

describe("session policy", () => {
  it("defines standard, persistent and admin sessions", () => {
    expect(sessionPolicy(["seller"], false)).toEqual({ persistent: false, idleSec: 12 * 3600, absoluteSec: 24 * 3600 });
    expect(sessionPolicy(["seller"], true)).toEqual({ persistent: true, idleSec: 7 * 86400, absoluteSec: 30 * 86400 });
    expect(sessionPolicy(["seller", "admin"], true)).toEqual({ persistent: false, idleSec: 2 * 3600, absoluteSec: 12 * 3600 });
  });
});

describe("revocation ownership", () => {
  it("a user cannot revoke another user's session", async () => {
    const a = await createUser({ email: "a@example.com" });
    const b = await createUser({ email: "b@example.com" });
    const { token } = await open(b);
    const [victim] = await listActiveSessions(b);
    expect(await revokeOwnSession(a, victim.publicId)).toBe(false);
    expect(await validateSessionToken(token)).not.toBeNull();
    expect(await revokeOwnSession(b, victim.publicId)).toBe(true);
    expect(await validateSessionToken(token)).toBeNull();
  });
});
