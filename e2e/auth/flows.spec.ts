import { expect, test } from "@playwright/test";
import { watchConsole } from "../helpers";
import { createAccount, lastMail, linkIn, onPath, signIn, sql, uniqueEmail } from "./util";

const PW = "une phrase solide 2026";

test("sign-up, e-mail verification, then sign-in lands on the requested page", async ({ page }) => {
  const c = watchConsole(page);
  const email = uniqueEmail("signup");
  await page.goto("/inscription");
  await page.getByLabel("Nom complet").fill("Grâce Mbala");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(PW);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByRole("heading", { name: "Vérifie ta boîte mail" })).toBeVisible();

  // Not signed in before the address is confirmed.
  await signIn(page, email, PW);
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("Confirme d’abord ton adresse e-mail");

  const link = linkIn((await lastMail(email, /Confirme/)).text);
  await page.goto(link);
  // The token leaves the address bar as soon as the page has it.
  await expect.poll(() => page.url()).not.toContain("token=");
  await page.getByRole("button", { name: "Confirmer mon adresse" }).click();
  await expect(page.getByRole("heading", { name: "Adresse confirmée" })).toBeVisible();

  // Reusing the link is refused.
  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Lien déjà utilisé" })).toBeVisible();

  await signIn(page, email, PW, { next: "/vendeur/produits" });
  await onPath(page, "/vendeur/produits");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  c.expectClean();
});

test("invalid sign-up is refused field by field, without creating an account", async ({ page }) => {
  const email = uniqueEmail("invalid");
  await page.goto("/inscription");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  const name = page.getByLabel("Nom complet");
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await name.fill("Grâce");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("court");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByText("Au moins 10 caractères.")).toBeVisible();
  expect(await sql("SELECT 1 FROM users WHERE email = $1", [email])).toHaveLength(0);
});

test("sign-up with an existing address shows the same confirmation (no enumeration)", async ({ page }) => {
  const email = uniqueEmail("exists");
  await createAccount({ email, password: PW });
  await page.goto("/inscription");
  await page.getByLabel("Nom complet").fill("Quelqu’un");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("une autre phrase longue");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByRole("heading", { name: "Vérifie ta boîte mail" })).toBeVisible();
  expect((await lastMail(email)).subject).toMatch(/Tentative d’inscription/);
});

test("wrong password and unknown address give the same message; the e-mail is kept, the password cleared", async ({ page }) => {
  const email = uniqueEmail("wrong");
  await createAccount({ email, password: PW });
  await signIn(page, email, "mauvais mot de passe");
  const alert = page.getByRole("alert").filter({ hasText: /\S/ });
  await expect(alert).toContainText("Adresse e-mail ou mot de passe incorrect.");
  await expect(page.getByLabel("Adresse e-mail")).toHaveValue(email);
  await expect(page.getByLabel("Mot de passe", { exact: true })).toHaveValue("");
  const first = await alert.textContent();
  await signIn(page, uniqueEmail("ghost"), "mauvais mot de passe");
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveText(first!);
});

test("password recovery: generic answer, single-use link, sessions revoked", async ({ page, browser }) => {
  const email = uniqueEmail("reset");
  await createAccount({ email, password: PW });
  // A second device is signed in.
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await signIn(otherPage, email, PW, { next: "/compte" });
  await onPath(otherPage, "/compte");

  await page.goto(`/mot-de-passe-oublie?email=${encodeURIComponent(email)}`);
  await page.getByRole("button", { name: "Envoyer le lien" }).click();
  await expect(page.getByRole("heading", { name: "Demande envoyée" })).toBeVisible();
  const link = linkIn((await lastMail(email, /Réinitialise/)).text);

  await page.goto(link);
  await page.getByLabel("Nouveau mot de passe").fill("nouvelle phrase solide");
  await page.getByLabel("Confirme le mot de passe").fill("nouvelle phrase solide");
  await page.getByRole("button", { name: "Enregistrer le mot de passe" }).click();
  await onPath(page, "/connexion");
  await expect(page.getByRole("status").filter({ hasText: "Mot de passe modifié" })).toBeVisible();

  // The other device lost its session.
  await otherPage.reload();
  await onPath(otherPage, "/connexion");
  await expect(otherPage.getByText("Ta session a expiré")).toBeVisible();
  await other.close();

  // Link reuse is refused; old password no longer works, new one does.
  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Lien déjà utilisé" })).toBeVisible();
  await signIn(page, email, PW);
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("incorrect");
  await signIn(page, email, "nouvelle phrase solide", { next: "/compte" });
  await onPath(page, "/compte");
});

test("unknown address on password recovery gets the same confirmation", async ({ page }) => {
  await page.goto("/mot-de-passe-oublie");
  await page.getByLabel("Adresse e-mail").fill(uniqueEmail("nobody"));
  await page.getByRole("button", { name: "Envoyer le lien" }).click();
  await expect(page.getByRole("heading", { name: "Demande envoyée" })).toBeVisible();
});

test("expired recovery link is refused", async ({ page }) => {
  const email = uniqueEmail("expired");
  const id = await createAccount({ email, password: PW });
  await page.goto("/mot-de-passe-oublie");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByRole("button", { name: "Envoyer le lien" }).click();
  const link = linkIn((await lastMail(email, /Réinitialise/)).text);
  await sql("UPDATE auth_tokens SET expires_at = now() - interval '1 minute' WHERE user_id = $1", [id]);
  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Lien expiré" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Demander un nouveau lien" })).toBeVisible();
});

test("sign-out revokes the session server-side; the back button does not show private pages", async ({ page }) => {
  const email = uniqueEmail("logout");
  await createAccount({ email, password: PW });
  await signIn(page, email, PW, { next: "/vendeur/revenus" });
  await onPath(page, "/vendeur/revenus");
  const cookie = (await page.context().cookies()).find((c) => c.name === "yayo_session")!;

  await page.goto("/compte");
  await page.getByRole("main").getByRole("button", { name: "Se déconnecter" }).click();
  await onPath(page, "/deconnexion");
  expect((await page.context().cookies()).find((c) => c.name === "yayo_session")).toBeUndefined();

  await page.goBack();
  await onPath(page, "/connexion");

  // Replaying the old cookie is refused by the server (not just forgotten by the browser).
  const replay = await page.request.get("/api/me", { headers: { cookie: `yayo_session=${cookie.value}` } });
  expect(replay.status()).toBe(401);
});

test("expired session redirects to sign-in with an explanation, then back to the page", async ({ page }) => {
  const email = uniqueEmail("idle");
  const id = await createAccount({ email, password: PW });
  await signIn(page, email, PW, { next: "/vendeur/commandes" });
  await onPath(page, "/vendeur/commandes");
  await sql("UPDATE sessions SET last_seen_at = now() - interval '13 hours' WHERE user_id = $1", [id]);
  await page.reload();
  await onPath(page, "/connexion");
  await expect(page.getByText("Ta session a expiré")).toBeVisible();
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(PW);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await onPath(page, "/vendeur/commandes");
});
