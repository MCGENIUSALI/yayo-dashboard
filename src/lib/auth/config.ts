import "server-only";
import { z } from "zod";

/**
 * Server-only configuration, read from the environment at request time (never
 * inlined in the browser bundle: no NEXT_PUBLIC_ variable is involved).
 * Missing values only fail the features that need them, with a clear server
 * log, so the build and the public pages keep working.
 */
const schema = z.object({
  APP_URL: z.url({ protocol: /^https?$/ }),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  EMAIL_TRANSPORT: z.enum(["resend", "file"]).default("resend"),
  EMAIL_FROM: z.string().min(3).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FILE_DIR: z.string().min(1).optional(),
  AUTH_PASSWORD_BREACH_CHECK: z.enum(["on", "off"]).default("on"),
  AUTH_TRUST_PROXY: z.enum(["0", "1"]).optional(),
});

export type AuthConfig = z.infer<typeof schema> & { secureCookies: boolean; trustProxy: boolean; googleEnabled: boolean };

export class ConfigError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Authentication is not configured: ${missing.join(", ")}`);
    this.name = "ConfigError";
  }
}

/** Vercel exposes its own URLs; APP_URL wins when set. */
function appUrl(env: NodeJS.ProcessEnv) {
  if (env.APP_URL) return env.APP_URL;
  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return undefined;
}

export function parseConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const parsed = schema.safeParse({ ...env, APP_URL: appUrl(env) });
  if (!parsed.success) throw new ConfigError([...new Set(parsed.error.issues.map((i) => String(i.path[0])))]);
  const c = parsed.data;
  const missing: string[] = [];
  if (c.EMAIL_TRANSPORT === "resend") {
    if (!c.RESEND_API_KEY) missing.push("RESEND_API_KEY");
    if (!c.EMAIL_FROM) missing.push("EMAIL_FROM");
  } else {
    if (!c.EMAIL_FILE_DIR) missing.push("EMAIL_FILE_DIR");
    // The file transport exists for local development and automated tests only.
    if (env.VERCEL_ENV === "production") missing.push("EMAIL_TRANSPORT (file is not allowed in production)");
  }
  if (missing.length) throw new ConfigError(missing);
  return {
    ...c,
    secureCookies: c.APP_URL.startsWith("https://"),
    trustProxy: env.VERCEL === "1" || c.AUTH_TRUST_PROXY === "1",
    googleEnabled: Boolean(c.GOOGLE_CLIENT_ID && c.GOOGLE_CLIENT_SECRET),
  };
}

let cached: AuthConfig | undefined;

export function getConfig(): AuthConfig {
  if (!cached) {
    try {
      cached = parseConfig();
    } catch (e) {
      if (e instanceof ConfigError) console.error(JSON.stringify({ level: "error", scope: "auth", event: "config_missing", missing: e.missing }));
      throw e;
    }
  }
  return cached;
}

export function tryGetConfig(): AuthConfig | null {
  try {
    return getConfig();
  } catch {
    return null;
  }
}
