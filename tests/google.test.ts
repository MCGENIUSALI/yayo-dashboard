import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWK } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import { authorizationUrl, pkceChallenge, verifyIdToken } from "@/lib/auth/google";

const CLIENT = "client-123.apps.googleusercontent.com";
let keys: ReturnType<typeof createLocalJWKSet>;
let privateKey: CryptoKey;
let otherKey: CryptoKey;

beforeAll(async () => {
  const pair = await generateKeyPair("RS256");
  privateKey = pair.privateKey;
  otherKey = (await generateKeyPair("RS256")).privateKey;
  const jwk: JWK = { ...(await exportJWK(pair.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
  keys = createLocalJWKSet({ keys: [jwk] });
});

function token(claims: Record<string, unknown> = {}, opts: { key?: CryptoKey; exp?: string | number; iat?: number } = {}) {
  return new SignJWT({ email: "grace@gmail.com", email_verified: true, nonce: "nonce-1", name: "Grâce", azp: CLIENT, ...claims })
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer((claims.iss as string) ?? "https://accounts.google.com")
    .setAudience((claims.aud as string) ?? CLIENT)
    .setSubject((claims.sub as string) ?? "1234567890")
    .setIssuedAt(opts.iat)
    .setExpirationTime(opts.exp ?? "5m")
    .sign(opts.key ?? privateKey);
}

describe("Google ID token verification", () => {
  it("accepts a correctly signed token and returns the stable sub", async () => {
    await expect(verifyIdToken(await token(), { clientId: CLIENT, nonce: "nonce-1", keys })).resolves.toEqual({ sub: "1234567890", email: "grace@gmail.com", name: "Grâce" });
  });
  it("rejects a token signed by another key", async () => {
    await expect(verifyIdToken(await token({}, { key: otherKey }), { clientId: CLIENT, nonce: "nonce-1", keys })).rejects.toMatchObject({ code: "invalid_id_token" });
  });
  it("rejects a token for another client (audience)", async () => {
    await expect(verifyIdToken(await token({ aud: "other-client" }), { clientId: CLIENT, nonce: "nonce-1", keys })).rejects.toMatchObject({ code: "invalid_id_token" });
  });
  it("rejects another issuer", async () => {
    await expect(verifyIdToken(await token({ iss: "https://evil.example" }), { clientId: CLIENT, nonce: "nonce-1", keys })).rejects.toMatchObject({ code: "invalid_id_token" });
  });
  it("rejects an expired token", async () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    await expect(verifyIdToken(await token({}, { iat: past - 60, exp: past }), { clientId: CLIENT, nonce: "nonce-1", keys })).rejects.toMatchObject({ code: "invalid_id_token" });
  });
  it("rejects a replayed token (nonce mismatch)", async () => {
    await expect(verifyIdToken(await token({ nonce: "old-nonce" }), { clientId: CLIENT, nonce: "nonce-1", keys })).rejects.toMatchObject({ code: "nonce_mismatch" });
  });
  it("rejects an unverified Google e-mail", async () => {
    await expect(verifyIdToken(await token({ email_verified: false }), { clientId: CLIENT, nonce: "nonce-1", keys })).rejects.toMatchObject({ code: "email_not_verified" });
  });
  it("rejects a foreign authorized party", async () => {
    await expect(verifyIdToken(await token({ azp: "other" }), { clientId: CLIENT, nonce: "nonce-1", keys })).rejects.toMatchObject({ code: "invalid_azp" });
  });
  it("rejects an unsigned token (alg none)", async () => {
    const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${enc({ alg: "none" })}.${enc({ iss: "https://accounts.google.com", aud: CLIENT, sub: "1", iat: now, exp: now + 300, nonce: "nonce-1", email: "a@b.c", email_verified: true })}.`;
    await expect(verifyIdToken(unsigned, { clientId: CLIENT, nonce: "nonce-1", keys })).rejects.toMatchObject({ code: "invalid_id_token" });
  });
});

describe("authorization request", () => {
  it("uses Google's endpoint with state, nonce and PKCE S256", () => {
    const url = new URL(authorizationUrl({ clientId: CLIENT, redirectUri: "https://yayo.test/auth/google/callback", state: "st", nonce: "nn", codeVerifier: "verifier" }));
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ response_type: "code", scope: "openid email profile", state: "st", nonce: "nn", code_challenge: pkceChallenge("verifier"), code_challenge_method: "S256", redirect_uri: "https://yayo.test/auth/google/callback" });
  });
});
