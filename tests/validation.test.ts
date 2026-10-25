import { describe, expect, it } from "vitest";
import { emailSchema, normalizeEmail, passwordProblem, PASSWORD_MAX } from "@/lib/auth/validation";
import { safeNext } from "@/lib/redirect";

describe("safeNext (open redirect protection)", () => {
  it.each([
    ["/vendeur/produits?tab=2", "/vendeur/produits?tab=2"],
    ["/admin", "/admin"],
    ["/compte/securite", "/compte/securite"],
    ["/", "/"],
  ])("keeps internal path %s", (input, out) => expect(safeNext(input)).toBe(out));

  it.each(["https://evil.example", "//evil.example/x", "/\\evil.example", "\\\\evil.example", "/\t/evil.example", "javascript:alert(1)", "/connexion", "/api/me", "/vendeurs-fake", "", "x".repeat(600), 42, null])("rejects %s", (input) => {
    expect(safeNext(input)).toBe("/");
  });
});

describe("e-mail normalisation", () => {
  it("trims and lower-cases consistently", () => {
    expect(normalizeEmail("  Grace.MBALA@Example.COM ")).toBe("grace.mbala@example.com");
    expect(emailSchema.parse(" A@B.CD ")).toBe("a@b.cd");
  });
  it("rejects invalid addresses", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse(`${"a".repeat(250)}@b.cd`).success).toBe(false);
  });
});

describe("password policy", () => {
  it("requires a minimum length and never truncates silently", () => {
    expect(passwordProblem("court")).toMatch(/Au moins/);
    expect(passwordProblem("une phrase solide")).toBeNull();
    expect(passwordProblem("a".repeat(PASSWORD_MAX + 1))).toMatch(/maximum/);
    expect(passwordProblem("é".repeat(PASSWORD_MAX))).toBe("Évite de répéter un seul caractère.");
  });
  it("refuses the e-mail as password", () => {
    expect(passwordProblem("grace@example.com", "Grace@example.com")).toMatch(/adresse e-mail/);
  });
});
