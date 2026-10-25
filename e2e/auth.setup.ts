import { expect, test as setup } from "@playwright/test";
import { STAFF, STAFF_STATE } from "./env";

/** Signs the staff account in through the real form once; the interaction tests reuse its cookie. */
setup("sign in as staff", async ({ page }) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(STAFF.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(STAFF.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /Bonjour/ })).toBeVisible();
  await page.context().storageState({ path: STAFF_STATE });
});
