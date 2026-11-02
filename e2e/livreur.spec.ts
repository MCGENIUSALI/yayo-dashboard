import { expect, test } from "@playwright/test";

test("courier: accept, pick up with seller code, deliver with buyer code and cash", async ({ page }) => {
  await page.goto("/livreur");
  await page.getByRole("button", { name: "Accepter la mission" }).click();
  await expect(page).toHaveURL(/\/livreur\/missions\/M-5521/);
  await page.getByLabel("Chiffre 1").fill("H000");
  await page.getByRole("button", { name: "Confirmer la collecte" }).click();
  await expect(page.getByText("Code de remise incorrect")).toBeVisible();
  await page.getByLabel("Chiffre 1").fill("H067");
  await page.getByRole("button", { name: "Confirmer la collecte" }).click();
  await page.getByRole("button", { name: "Je suis arrivé" }).click();
  await page.getByLabel("Chiffre 1").fill("4827");
  const confirm = page.getByRole("button", { name: "Confirmer la livraison" });
  await expect(confirm).toBeDisabled();
  await page.getByText(/J’ai encaissé/).click();
  await confirm.click();
  await expect(page.getByRole("heading", { name: "Colis livré !" })).toBeVisible();
  await page.getByRole("link", { name: "Reverser mon cash" }).click();
  await expect(page.getByText("580 000 FC")).toBeVisible();
});

test("courier: availability toggle and incident", async ({ page }) => {
  await page.goto("/livreur");
  await page.getByRole("switch", { name: "Disponibilité" }).click();
  await expect(page.getByText("Tu ne reçois pas de missions")).toBeVisible();
  await page.goto("/livreur/missions/M-5521/incident");
  await expect(page.getByRole("button", { name: "Déclarer l’échec" })).toBeDisabled();
  await page.getByText("Colis endommagé").click();
  await page.getByRole("button", { name: "Déclarer l’échec" }).click();
  await expect(page).toHaveURL(/\/livreur$/);
});

test("courier signup: both steps validated before sending", async ({ page }) => {
  await page.goto("/livreur/inscription");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByText("Saisis la plaque de ton véhicule.")).toBeVisible();
  await page.getByRole("button", { name: "Vélo" }).click();
  await page.getByLabel("Numéro Mobile Money pour tes gains").fill("998765432");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByRole("heading", { name: "Vérification d’identité" })).toBeVisible();
  await page.getByRole("button", { name: "Envoyer pour validation" }).click();
  await expect(page.getByText("Ajoute toutes les pièces demandées.")).toBeVisible();
});
