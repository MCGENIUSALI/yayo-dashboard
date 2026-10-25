import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { watchConsole } from "../helpers";

const screens = ["/connexion", "/inscription", "/mot-de-passe-oublie", "/reinitialiser?token=x", "/verification-email?token=x", "/deconnexion", "/connexion?raison=expiree", "/connexion?erreur=google_compte_existant"];

test("auth screens render without console errors or horizontal overflow", async ({ page }) => {
  const c = watchConsole(page);
  for (const s of screens) {
    await page.goto(s);
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${s}`).toBeLessThanOrEqual(0);
  }
  c.expectClean();
});

test("sign-in form is fully usable with the keyboard", async ({ page }, info) => {
  test.skip(info.project.name !== "auth-desktop", "keyboard");
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").focus();
  const order: (string | null)[] = [];
  for (let i = 0; i < 6; i++) {
    order.push(await page.evaluate(() => document.activeElement?.getAttribute("name") ?? document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.trim() ?? null));
    await page.keyboard.press("Tab");
  }
  expect(order).toEqual(["email", "password", "Afficher le mot de passe", "Mot de passe oublié ?", "remember", "Se connecter"]);

  // Toggle visibility with the keyboard.
  await page.getByLabel("Mot de passe", { exact: true }).fill("secret");
  await page.getByRole("button", { name: "Afficher le mot de passe" }).press("Enter");
  await expect(page.getByLabel("Mot de passe", { exact: true })).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "Masquer le mot de passe" })).toHaveAttribute("aria-pressed", "true");

  // Submitting empty fields: errors are linked to the fields, focus goes to the first one.
  await page.getByLabel("Mot de passe", { exact: true }).fill("");
  await page.getByRole("button", { name: "Se connecter" }).press("Enter");
  const email = page.getByLabel("Adresse e-mail");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toBeFocused();
  const describedBy = await email.getAttribute("aria-describedby");
  await expect(page.locator(`[id="${describedBy}"]`)).toContainText("Indique ton adresse e-mail.");
});

test("no password is ever written to storage or the URL", async ({ page }) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill("nobody@yayo.test");
  await page.getByLabel("Mot de passe", { exact: true }).fill("ne-pas-stocker-123");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toBeVisible();
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + location.href);
  expect(storage).not.toContain("ne-pas-stocker-123");
});

test("loading state: the button shows a spinner and stays locked while the server answers", async ({ page }) => {
  await page.goto("/mot-de-passe-oublie");
  await page.route("**/mot-de-passe-oublie**", async (route) => {
    if (route.request().method() === "POST") await new Promise((r) => setTimeout(r, 800));
    await route.continue();
  });
  await page.getByLabel("Adresse e-mail").fill("slow@yayo.test");
  const button = page.getByRole("button", { name: "Envoyer le lien" });
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(page.getByLabel("Adresse e-mail")).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Demande envoyée" })).toBeVisible();
});

test("network failure shows a recoverable error", async ({ page }) => {
  await page.goto("/mot-de-passe-oublie");
  await page.route("**/mot-de-passe-oublie**", (route) => (route.request().method() === "POST" ? route.abort("internetdisconnected") : route.continue()));
  await page.getByLabel("Adresse e-mail").fill("offline@yayo.test");
  await page.getByRole("button", { name: "Envoyer le lien" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("Vérifie ton réseau");
  await page.unroute("**/mot-de-passe-oublie**");
  await page.getByRole("button", { name: "Envoyer le lien" }).click();
  await expect(page.getByRole("heading", { name: "Demande envoyée" })).toBeVisible();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("auth screens do not move", async ({ page }) => {
    await page.goto("/connexion");
    const d = await page.locator("main > div").first().evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(d)).toBeLessThanOrEqual(0.001);
  });
});

test("accessibility scan of the sign-in and sign-up screens", async ({ page }) => {
  for (const s of ["/connexion", "/inscription", "/mot-de-passe-oublie"]) {
    await page.goto(s);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ") + " " + n.failureSummary).join(" | ")}`), s).toEqual([]);
  }
});
