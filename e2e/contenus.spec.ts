import { expect, test } from "@playwright/test";

test("seller content: + Contenu sheet opens the live scheduler, which validates and submits", async ({ page }) => {
  await page.goto("/vendeur/boutique");
  await expect(page.getByText("Actions rapides")).toBeVisible();
  await page.getByRole("button", { name: "Contenu" }).click();
  const sheet = page.getByRole("dialog", { name: "Ajouter du contenu" });
  await expect(sheet.getByText("Story")).toBeVisible();
  await sheet.getByRole("button", { name: /Programmer un live/ }).click();
  await expect(page).toHaveURL(/\/vendeur\/contenus\/lives\/nouveau/);
  const submit = page.getByRole("button", { name: "Programmer le live" });
  await expect(submit).toBeDisabled();
  await page.getByLabel("Titre du live").fill("Promo de Noël");
  await page.getByLabel("Date").fill("2026-12-20");
  await submit.click();
  await expect(page).toHaveURL(/\/vendeur\/contenus\/lives$/);
  await expect(page.getByText("Live programmé")).toBeVisible();
});

test("seller content: create a collection and switch analytics period", async ({ page }) => {
  await page.goto("/vendeur/contenus/collections");
  await page.getByRole("button", { name: "Créer" }).click();
  const sheet = page.getByRole("dialog", { name: "Nouvelle collection" });
  await sheet.getByLabel("Nom de la collection").fill("Spécial fêtes");
  await sheet.getByRole("checkbox", { name: /Lier JBL Go 3/ }).click();
  await sheet.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("button", { name: "Modifier Spécial fêtes" })).toBeVisible();

  await page.getByRole("link", { name: "Performances" }).click();
  await expect(page.getByText("450 000 FC")).toBeVisible();
  await page.getByRole("button", { name: "Mois" }).click();
  await expect(page.getByText("1 820 000 FC")).toBeVisible();
});

test("buyer: shop profile shows lives with a reminder bell", async ({ page }) => {
  await page.goto("/acheteur/boutiques/jbl-store-kin");
  await page.getByRole("radio", { name: "Lives" }).or(page.getByRole("tab", { name: "Lives" })).first().click();
  await expect(page.getByText(/EN DIRECT/)).toBeVisible();
  await page.getByRole("button", { name: "Me rappeler Nouveautés de la semaine" }).click();
  await expect(page.getByText("Rappel activé", { exact: true })).toBeVisible();
});
