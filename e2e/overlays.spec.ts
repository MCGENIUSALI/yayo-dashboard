import { expect, test } from "@playwright/test";
import { htmlOverflow, settle } from "./helpers";

test("sheet: focus moves in, stays in, Escape closes, focus returns to the trigger", async ({ page }) => {
  await page.goto("/admin/utilisateurs/u2");
  const trigger = page.getByRole("button", { name: "Suspendre le compte" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: /Suspendre JBL Store Kin/ });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(await htmlOverflow(page)).toBe("hidden");
  await expect.poll(() => dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

  for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  for (let i = 0; i < 12; i++) await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await settle(page);
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await htmlOverflow(page)).toBe("");
});

test("sheet cannot be dismissed while its operation is running", async ({ page }) => {
  await page.goto("/admin/utilisateurs/u2?simuler=lent");
  await page.getByRole("button", { name: "Suspendre le compte" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Suspendre", exact: true }).click();
  await expect(dialog).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Escape");
  await expect(dialog.getByRole("button", { name: "Fermer" })).toBeDisabled();
  await expect(dialog).toBeVisible();
  // Then it completes, closes itself and confirms.
  await expect(page.getByRole("status").filter({ hasText: "Compte suspendu" })).toBeVisible({ timeout: 6000 });
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Réactiver le compte" })).toBeVisible();
});

test("closing a sheet mid-animation and reopening it leaves exactly one dialog", async ({ page }) => {
  await page.goto("/vendeur/revenus");
  const trigger = page.getByRole("button", { name: /Retirer vers M-Pesa/ });
  for (let i = 0; i < 4; i++) {
    await trigger.click();
    await page.keyboard.press("Escape");
  }
  await trigger.click();
  await settle(page);
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toBeVisible();
});
