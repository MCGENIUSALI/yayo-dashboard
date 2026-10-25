import { describe, expect, it, vi } from "vitest";

process.env.AUTH_PASSWORD_BREACH_CHECK = "on";
const { hashPassword, isBreachedPassword, verifyPassword } = await import("@/lib/auth/password");

describe("password hashing", () => {
  it("uses Argon2id with the configured cost and never stores the clear password", async () => {
    const hash = await hashPassword("une phrase solide 2026");
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(hash).not.toContain("une phrase solide");
    expect(await verifyPassword(hash, "une phrase solide 2026")).toBe(true);
    expect(await verifyPassword(hash, "une phrase solide 2025")).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("même mot de passe")).not.toBe(await hashPassword("même mot de passe"));
  });

  it("does not truncate long passwords", async () => {
    const long = "x".repeat(100) + "A";
    const hash = await hashPassword(long);
    expect(await verifyPassword(hash, "x".repeat(100) + "B")).toBe(false);
  });

  it("treats a corrupted hash as a failed verification", async () => {
    expect(await verifyPassword("not-a-hash", "anything")).toBe(false);
  });
});

describe("breached password check (k-anonymity)", () => {
  // SHA-1("password") = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
  it("sends only the 5-character prefix and detects a match", async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () => new Response("1E4C9B93F3F0682250B6CF8331B7EE68FD8:9545824\nABCDEF:0\n"));
    expect(await isBreachedPassword("password", fetchMock as unknown as typeof fetch)).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.pwnedpasswords.com/range/5BAA6");
  });
  it("ignores padding entries with count 0", async () => {
    const fetchMock = vi.fn(async () => new Response("1E4C9B93F3F0682250B6CF8331B7EE68FD8:0\n"));
    expect(await isBreachedPassword("password", fetchMock as unknown as typeof fetch)).toBe(false);
  });
  it("fails open when the service is unreachable", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("offline");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await isBreachedPassword("password", fetchMock as unknown as typeof fetch)).toBe(false);
    expect(warn).toHaveBeenCalled();
  });
});
