import { expect, test } from "@playwright/test";

test("new product: errors appear on submit, are linked to the field, and clear when fixed", async ({ page }) => {
  await page.goto("/vendeur/produits/nouveau");
  const name = page.getByLabel("Nom du produit");
  // No error before the user did anything.
  await expect(name).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  const describedBy = await name.getAttribute("aria-describedby");
  await expect(page.locator(`[id="${describedBy}"]`)).toContainText("au moins 3 caractères");

  await name.fill("JBL Flip 6");
  await expect(name).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByText("Étape 2 sur 2")).toBeVisible();

  await page.getByRole("button", { name: "Publier le produit" }).click();
  const price = page.getByLabel("Prix de vente (FC)");
  await expect(price).toHaveAttribute("aria-invalid", "true");
  await expect(price).toBeFocused();
  await price.fill("150000");
  await page.getByRole("button", { name: "Publier le produit" }).click();
  await expect(page).toHaveURL(/\/vendeur\/produits$/);
  await expect(page.getByRole("status").filter({ hasText: "Produit publié" })).toBeVisible();
});

test("withdraw amount over the balance is refused with a clear message", async ({ page }) => {
  await page.goto("/vendeur/revenus");
  await page.getByRole("button", { name: /Retirer vers M-Pesa/ }).click();
  const amount = page.getByLabel("Montant (FC)");
  await amount.fill("999999999");
  await expect(amount).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Montant supérieur au solde disponible.")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("button", { name: /^Retirer / })).toBeDisabled();
});

test("commission settings: dirty tracking, validation, save and reset", async ({ page }) => {
  await page.goto("/admin/commissions");
  const save = page.getByRole("button", { name: "Enregistrer les paramètres" });
  await expect(save).toBeDisabled();
  const rate = page.getByLabel("Taux par défaut (%)");
  await rate.fill("80");
  await expect(page.getByText("Taux entre 0 et 50 %.").first()).toBeVisible();
  await expect(save).toBeDisabled();
  await rate.fill("12");
  await expect(page.getByText("Modifications non enregistrées")).toBeVisible();
  await save.click();
  await expect(page.getByRole("button", { name: "Enregistré" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Annuler les modifications" })).toBeDisabled();
});
