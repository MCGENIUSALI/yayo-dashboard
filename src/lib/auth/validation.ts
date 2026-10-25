/**
 * Input rules shared by the forms (instant feedback) and the server (the only
 * check that counts). Messages are user-facing.
 */
import { z } from "zod";

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

/** Trimmed, NFKC-normalised, lower-case: the same address always maps to the same account. */
export const normalizeEmail = (value: string) => value.normalize("NFKC").trim().toLowerCase();

/** Passwords are NFKC-normalised (same keystrokes on any keyboard) but never trimmed or truncated. */
export const normalizePassword = (value: string) => value.normalize("NFKC");

export const emailSchema = z
  .string({ error: "Indique ton adresse e-mail." })
  .transform(normalizeEmail)
  .pipe(z.string().min(1, "Indique ton adresse e-mail.").max(254, "Adresse e-mail trop longue.").pipe(z.email("Adresse e-mail invalide.")));

/** Policy for new passwords: length over complexity rules (NIST SP 800-63B), breached-password check on the server. */
export function passwordProblem(password: string, email?: string): string | null {
  const p = normalizePassword(password);
  const length = [...p].length;
  if (length === 0) return "Choisis un mot de passe.";
  if (length < PASSWORD_MIN) return `Au moins ${PASSWORD_MIN} caractères.`;
  if (length > PASSWORD_MAX) return `${PASSWORD_MAX} caractères maximum.`;
  if (/^(.)\1+$/u.test(p)) return "Évite de répéter un seul caractère.";
  if (email && p.toLowerCase() === normalizeEmail(email)) return "Ton mot de passe ne doit pas être ton adresse e-mail.";
  return null;
}

export const newPasswordSchema = z.string({ error: "Choisis un mot de passe." }).superRefine((p, ctx) => {
  const problem = passwordProblem(p);
  if (problem) ctx.addIssue({ code: "custom", message: problem });
});

/** Sign-in only bounds the input; the policy applies when a password is chosen. */
export const currentPasswordSchema = z
  .string({ error: "Indique ton mot de passe." })
  .min(1, "Indique ton mot de passe.")
  .max(PASSWORD_MAX * 4, "Mot de passe trop long.");

export const nameSchema = z
  .string({ error: "Indique ton nom." })
  .transform((v) => v.normalize("NFKC").trim().replace(/\s+/g, " "))
  .pipe(z.string().min(2, "Au moins 2 caractères.").max(80, "80 caractères maximum."));

export const signInSchema = z.object({ email: emailSchema, password: currentPasswordSchema, remember: z.boolean().default(false), next: z.string().max(512).optional() });
export const signUpSchema = z.object({ name: nameSchema, email: emailSchema, password: newPasswordSchema });
export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Lien invalide.");

export type FieldErrors = Record<string, string>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
