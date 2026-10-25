import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getConfig } from "@/lib/auth/config";
import { randomToken } from "@/lib/auth/crypto";

export interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Delivery through Resend's HTTP API (no SDK needed). The `file` transport
 * writes messages to EMAIL_FILE_DIR for local development and automated
 * tests; it is refused in production. Links are never written to logs.
 */
export async function sendEmail(email: Email): Promise<void> {
  const c = getConfig();
  if (c.EMAIL_TRANSPORT === "file") {
    const dir = c.EMAIL_FILE_DIR!;
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${Date.now()}-${randomToken(6)}.json`), JSON.stringify(email));
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${c.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: c.EMAIL_FROM, to: [email.to], subject: email.subject, text: email.text, html: email.html }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`E-mail provider responded ${res.status}`);
}

/** Sends without letting a delivery failure change the response (anti-enumeration). The failure is logged without the content. */
export async function sendQuietly(email: Email, kind: string) {
  try {
    await sendEmail(email);
    return true;
  } catch (e) {
    console.error(JSON.stringify({ level: "error", scope: "auth", event: "email_failed", kind, message: e instanceof Error ? e.message : "unknown" }));
    return false;
  }
}

const escape = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

function layout(title: string, paragraphs: string[], action?: { label: string; url: string }) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#3a3a40">${escape(p)}</p>`).join("");
  const button = action
    ? `<p style="margin:24px 0"><a href="${escape(action.url)}" style="display:inline-block;background:#0a0a0b;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">${escape(action.label)}</a></p><p style="margin:0 0 16px;font-size:13px;line-height:20px;color:#76767e">Si le bouton ne marche pas, copie ce lien dans ton navigateur :<br>${escape(action.url)}</p>`
    : "";
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#fafafa;font-family:Inter,Arial,sans-serif"><div style="max-width:520px;margin:0 auto;padding:32px 20px"><p style="margin:0 0 24px;font-size:22px;font-weight:800">YA <span style="background:#0a0a0b;color:#fff;border-radius:6px;padding:2px 8px">YO!</span></p><h1 style="margin:0 0 16px;font-size:20px;color:#0a0a0b">${escape(title)}</h1>${body}${button}<p style="margin:32px 0 0;font-size:12px;color:#a1a1a8">Tu reçois ce message parce qu’une action a été faite sur un compte YA YO! avec cette adresse.</p></div></body></html>`;
}

function text(title: string, paragraphs: string[], action?: { label: string; url: string }) {
  return [title, "", ...paragraphs, ...(action ? ["", `${action.label} : ${action.url}`] : [])].join("\n");
}

function message(to: string, subject: string, title: string, paragraphs: string[], action?: { label: string; url: string }): Email {
  return { to, subject, text: text(title, paragraphs, action), html: layout(title, paragraphs, action) };
}

const link = (pathname: string, token: string) => {
  const url = new URL(pathname, getConfig().APP_URL);
  url.searchParams.set("token", token);
  return url.toString();
};

export const emails = {
  verify: (to: string, name: string, token: string) =>
    message(to, "Confirme ton adresse e-mail", `Bienvenue ${name}`, ["Confirme ton adresse pour activer ton compte YA YO!. Le lien est valable 24 heures et ne sert qu’une fois.", "Si tu n’as pas créé de compte, ignore ce message."], {
      label: "Confirmer mon adresse",
      url: link("/verification-email", token),
    }),
  existingAccount: (to: string) =>
    message(to, "Tentative d’inscription avec ton adresse", "Tu as déjà un compte", [
      "Quelqu’un (peut-être toi) a essayé de créer un compte YA YO! avec cette adresse, qui en a déjà un.",
      "Si c’était toi, connecte-toi ou utilise « Mot de passe oublié ». Sinon, ignore ce message : rien n’a changé.",
    ], { label: "Se connecter", url: new URL("/connexion", getConfig().APP_URL).toString() }),
  reset: (to: string, token: string) =>
    message(to, "Réinitialise ton mot de passe", "Nouveau mot de passe", ["Tu as demandé à réinitialiser ton mot de passe. Le lien est valable 30 minutes et ne sert qu’une fois.", "Si tu n’as rien demandé, ignore ce message : ton mot de passe reste le même."], {
      label: "Choisir un nouveau mot de passe",
      url: link("/reinitialiser", token),
    }),
  passwordChanged: (to: string) =>
    message(to, "Ton mot de passe a été modifié", "Mot de passe modifié", ["Le mot de passe de ton compte YA YO! vient d’être modifié et les autres appareils ont été déconnectés.", "Si ce n’était pas toi, réinitialise-le tout de suite avec « Mot de passe oublié » et contacte le support."]),
  googleLinked: (to: string) =>
    message(to, "Compte Google associé", "Connexion Google activée", ["Un compte Google vient d’être associé à ton compte YA YO!.", "Si ce n’était pas toi, change ton mot de passe et retire l’association depuis Sécurité."]),
  googleUnlinked: (to: string) => message(to, "Compte Google dissocié", "Connexion Google retirée", ["Ton compte Google ne permet plus de te connecter à YA YO!.", "Si ce n’était pas toi, change ton mot de passe."]),
};
