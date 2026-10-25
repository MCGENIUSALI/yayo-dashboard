import { describe, expect, it } from "vitest";
import { ConfigError, parseConfig } from "@/lib/auth/config";

const base = { APP_URL: "https://dash.yayo.cd", DATABASE_URL: "postgres://x", AUTH_SECRET: "s".repeat(40), EMAIL_TRANSPORT: "resend", RESEND_API_KEY: "re_x", EMAIL_FROM: "YA YO <no-reply@yayo.cd>" } as unknown as NodeJS.ProcessEnv;

describe("configuration", () => {
  it("accepts a complete production configuration with secure cookies", () => {
    const c = parseConfig(base);
    expect(c.secureCookies).toBe(true);
    expect(c.googleEnabled).toBe(false);
  });
  it("names missing variables without exposing values", () => {
    try {
      parseConfig({ ...base, AUTH_SECRET: "short", DATABASE_URL: undefined });
      throw new Error("should fail");
    } catch (e) {
      expect(e).toBeInstanceOf(ConfigError);
      expect((e as ConfigError).missing).toEqual(expect.arrayContaining(["AUTH_SECRET", "DATABASE_URL"]));
      expect((e as Error).message).not.toContain("short");
    }
  });
  it("refuses the file e-mail transport in production", () => {
    expect(() => parseConfig({ ...base, EMAIL_TRANSPORT: "file", EMAIL_FILE_DIR: "/tmp/m", VERCEL_ENV: "production" })).toThrow(ConfigError);
  });
  it("only trusts forwarded IP headers on Vercel or when asked", () => {
    expect(parseConfig(base).trustProxy).toBe(false);
    expect(parseConfig({ ...base, VERCEL: "1" }).trustProxy).toBe(true);
  });
  it("derives APP_URL from Vercel when unset", () => {
    expect(parseConfig({ ...base, APP_URL: undefined, VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "yayo-dashboard.vercel.app" }).APP_URL).toBe("https://yayo-dashboard.vercel.app");
  });
});
