import { expect, test } from "@playwright/test";

test("sign-in: wrong OTP shows E8, a valid code continues to profile and role", async ({ page }) => {
  await page.goto("/acheteur/connexion");
  await page.getByRole("button", { name: "Recevoir le code" }).click();
  await expect(page.getByText("Saisis les 9 chiffres après +243.")).toBeVisible();
  await page.getByLabel("Numéro de téléphone").fill("812345678");
  await page.getByRole("button", { name: "Recevoir le code" }).click();
  await expect(page).toHaveURL(/\/acheteur\/connexion\/code/);
  await page.getByLabel("Chiffre 1").fill("000000");
  await expect(page.getByText("Code incorrect")).toBeVisible();
  await page.getByLabel("Chiffre 1").fill("482915");
  await expect(page).toHaveURL(/\/acheteur\/inscription$/);
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByText("Accepte les conditions pour continuer.")).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByRole("heading", { name: "Comment veux-tu utiliser YA YO ?" })).toBeVisible();
  await page.getByText("Livreur", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Devenir livreur" })).toBeVisible();
});

test("checkout: cart adjustment, delivery, Mobile Money, confirmation", async ({ page }) => {
  await page.goto("/acheteur/panier");
  await page.getByRole("button", { name: "Commander" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Ton panier a changé" })).toBeVisible();
  await page.getByRole("button", { name: "Accepter et continuer" }).click();
  await expect(page.getByRole("heading", { name: "Livraison" })).toBeVisible();
  await page.getByRole("button", { name: "Demain 9h–12h" }).click();
  await page.getByRole("button", { name: "Continuer vers le paiement" }).click();
  await expect(page.getByText("Comment veux-tu payer ?")).toBeVisible();
  await page.getByRole("button", { name: /^Payer / }).click();
  await expect(page.getByText("Valide le paiement sur ton téléphone")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Commande confirmée !" })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Fonds sécurisés")).toBeVisible();
  await page.getByRole("link", { name: "Continuer mes achats" }).click();
  await page.getByRole("link", { name: /^Panier, 0 articles/ }).click();
  await expect(page.getByText("Ton panier est vide")).toBeVisible();
});

test("payment failure leads to C6 with retry", async ({ page }) => {
  await page.goto("/acheteur/produits/jbl-pulse-5");
  await page.getByRole("button", { name: "Acheter maintenant" }).click();
  await page.evaluate(() => sessionStorage.setItem("yayo-simulate", "normal"));
  await page.getByRole("button", { name: "Commander" }).click();
  await page.getByRole("button", { name: "Accepter et continuer" }).click();
  await page.getByRole("button", { name: "Continuer vers le paiement" }).click();
  await page.getByRole("button", { name: /^Payer / }).click();
  await expect(page.getByText("Valide le paiement sur ton téléphone")).toBeVisible();
  await page.evaluate(() => sessionStorage.setItem("yayo-simulate", "fail"));
  await page.getByRole("button", { name: "Renvoyer la demande" }).click();
  await expect(page.getByRole("heading", { name: "Le paiement n’a pas abouti" })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("link", { name: "Choisir un autre moyen" })).toBeVisible();
});

test("search, filters and no results", async ({ page }) => {
  await page.goto("/acheteur/explorer?q=casque");
  await expect(page.getByText(/résultats? à Kinshasa/)).toBeVisible();
  await page.getByRole("button", { name: "Filtres" }).click();
  const sheet = page.getByRole("dialog", { name: "Filtres" });
  await sheet.getByRole("textbox", { name: "Min" }).fill("150000");
  await sheet.getByRole("button", { name: /^Voir 1 résultat$/ }).click();
  await expect(page.getByText("1 résultat à Kinshasa")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/acheteur/explorer?q=casque%20rose%20introuvable");
  await expect(page.getByText(/Aucun résultat/)).toBeVisible();
});

test("dispute: report a problem then see the dispute", async ({ page }) => {
  await page.goto("/acheteur/commandes/YY-24868/probleme");
  await page.getByLabel("Décris le problème").fill("Reçu en bleu, j’avais commandé la jaune.");
  await page.getByRole("button", { name: "Envoyer le signalement" }).click();
  await expect(page).toHaveURL(/\/acheteur\/litiges\/LT-0318/);
  await expect(page.getByText("95 000 FC bloqués par YA YO")).toBeVisible();
});

test("out of stock product offers a restock alert", async ({ page }) => {
  await page.goto("/acheteur/produits/jbl-charge-5");
  await expect(page.getByText("Rupture de stock")).toBeVisible();
  await page.getByRole("button", { name: "M’alerter du retour en stock" }).click();
  await expect(page.getByRole("button", { name: "Alerte activée" })).toBeDisabled();
});
