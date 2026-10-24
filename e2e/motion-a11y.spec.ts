import { expect, test } from "@playwright/test";
import { watchConsole } from "./helpers";

const routes = [
  "/", "/vendeur", "/vendeur/notifications", "/vendeur/commandes", "/vendeur/commandes/YY-24871", "/vendeur/commandes/YY-24852/remise",
  "/vendeur/produits", "/vendeur/produits/nouveau", "/vendeur/produits/p1", "/vendeur/contenus", "/vendeur/contenus/nouveau",
  "/vendeur/revenus", "/vendeur/boutique", "/vendeur/ouverture", "/admin", "/admin/commandes", "/admin/sequestre", "/admin/litiges",
  "/admin/kyc", "/admin/utilisateurs", "/admin/utilisateurs/u2", "/admin/livreurs", "/admin/moderation", "/admin/commissions", "/admin/rapports",
];

test("every screen renders without console errors or horizontal overflow", async ({ page }) => {
  const c = watchConsole(page);
  for (const r of routes) {
    await page.goto(r);
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${r}`).toBeLessThanOrEqual(0);
  }
  c.expectClean();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("movement is removed but state changes still happen", async ({ page }, info) => {
    await page.goto("/admin");
    const pageIn = await page.locator("#main > div").first().evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(pageIn)).toBeLessThanOrEqual(0.001);
    if (info.project.name === "mobile") {
      await page.getByRole("button", { name: "Ouvrir le menu" }).tap();
      const panel = page.locator("#mobile-drawer");
      await expect(panel).toBeVisible();
      // No slide: the panel is already in place, only its opacity changes.
      expect(await panel.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)).toBe(0);
    } else {
      await page.getByRole("button", { name: "Réduire le menu" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-sidebar", "collapsed");
      await expect.poll(async () => (await page.locator("#sidebar-rail").boundingBox())!.width).toBe(72);
    }
  });
});

test("segmented tabs work with the arrow keys", async ({ page }) => {
  await page.goto("/vendeur/commandes");
  const tab = page.getByRole("tab", { name: /Nouvelles/ });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /À préparer/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: /À préparer/ })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Livrées" })).toHaveAttribute("aria-selected", "true");
});
