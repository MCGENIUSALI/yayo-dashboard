import { expect, test } from "@playwright/test";

test("slow operation: busy button keeps its size, then a real success", async ({ page }) => {
  await page.goto("/vendeur/revenus?simuler=lent");
  await page.getByRole("button", { name: /Retirer vers M-Pesa/ }).click();
  const submit = page.getByRole("dialog").getByRole("button", { name: /^Retirer / });
  const before = await submit.boundingBox();
  await submit.click();
  await expect(submit).toHaveAttribute("aria-busy", "true");
  const during = await submit.boundingBox();
  expect(during!.width).toBe(before!.width);
  expect(during!.height).toBe(before!.height);
  await expect(page.getByRole("dialog").getByRole("button", { name: "Demande envoyée" })).toBeDisabled({ timeout: 6000 });
  await expect(page.getByRole("status").filter({ hasText: "Demande de retrait envoyée" })).toBeVisible();
});

test("failure: persistent error with retry, no fake success", async ({ page }) => {
  await page.goto("/vendeur/commandes/YY-24871?simuler=echec");
  await page.getByRole("button", { name: "Commencer la préparation" }).click();
  const alert = page.getByRole("alert").filter({ hasText: "L’opération a échoué" });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("Le statut de la commande n’a pas pu être mis à jour.");
  await expect(page.getByRole("button", { name: "Statut mis à jour" })).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Commande en préparation" })).toHaveCount(0);

  // Back online: retry from the error succeeds.
  await page.evaluate(() => {
    history.replaceState(null, "", location.pathname);
    sessionStorage.setItem("yayo-simulate", "normal");
  });
  await alert.getByRole("button", { name: "Réessayer" }).click();
  await expect(page.getByRole("button", { name: "Statut mis à jour" })).toBeVisible();
  await expect(alert).toHaveCount(0);
});

test("rapid clicks trigger the action once", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "table layout");
  await page.goto("/admin/livreurs");
  const first = page.getByRole("row").filter({ has: page.getByRole("button", { name: "Relancer" }) }).first();
  const courier = (await first.getByRole("cell").first().innerText()).trim();
  const row = page.getByRole("row").filter({ hasText: courier });
  const button = row.getByRole("button", { name: "Relancer" });
  await button.click({ clickCount: 1 });
  await button.click({ force: true });
  await button.click({ force: true });
  await button.click({ force: true });
  await expect(row.getByRole("button", { name: "Relancé" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Relance envoyée" })).toHaveCount(1);
});

test("money-moving decision asks for confirmation first", async ({ page }) => {
  await page.goto("/admin/litiges");
  const scope = page.locator("aside[aria-label='Détail'], [role='dialog']").filter({ visible: true }).first();
  if (!(await page.locator("aside[aria-label='Détail']").isVisible())) await page.getByRole("button", { name: "Examiner" }).first().click();
  await scope.getByRole("button", { name: /Rembourser l’acheteur/ }).click();
  await expect(scope.getByText("Cette décision est définitive.")).toBeVisible();
  await scope.getByRole("button", { name: "Annuler" }).click();
  await expect(scope.getByRole("button", { name: /Rembourser l’acheteur/ })).toBeVisible();
  await scope.getByRole("button", { name: /Rembourser l’acheteur/ }).click();
  await scope.getByRole("button", { name: "Confirmer" }).click();
  await expect(scope.getByText("Acheteur remboursé, fonds débloqués vers l’acheteur.")).toBeVisible();
});
