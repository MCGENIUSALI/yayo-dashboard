import { expect, test } from "@playwright/test";
import { settle, watchConsole } from "./helpers";

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "desktop rail"));

test("active item follows the URL on direct load, with the indicator under it", async ({ page }) => {
  await page.goto("/admin/kyc");
  const rail = page.locator("#sidebar-rail");
  await expect(rail.getByRole("link", { name: /Validations KYC/ })).toHaveAttribute("aria-current", "page");
  await expect(rail.locator('[aria-current="page"]')).toHaveCount(1);
  // Indicator sits on the 5th row (index 4 × 48 px).
  const y = await rail.locator("nav > span").first().evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
  expect(y).toBe(4 * 48);
});

test("rapid fold / unfold ends in a consistent, persisted state", async ({ page }) => {
  const c = watchConsole(page);
  await page.goto("/admin");
  const rail = page.locator("#sidebar-rail");
  const toggle = rail.getByRole("button", { name: /Réduire le menu|Déplier le menu/ });
  for (let i = 0; i < 7; i++) await toggle.click({ delay: 0 });
  await settle(page);
  // Odd number of clicks: folded.
  await expect(page.locator("html")).toHaveAttribute("data-sidebar", "collapsed");
  expect((await rail.boundingBox())!.width).toBe(72);
  const mainPad = await page.locator("#main").evaluate((el) => (el.parentElement as HTMLElement).getBoundingClientRect().left + parseFloat(getComputedStyle(el.parentElement!).paddingLeft));
  expect(mainPad).toBe(72);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => localStorage.getItem("yayo-sidebar"))).toBe("collapsed");

  // Reload: folded from the first paint, no width animation.
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.sidebar)).toBe("collapsed");
  expect((await rail.boundingBox())!.width).toBe(72);
  c.expectClean();
});

test("folded rail shows a tooltip on hover and keeps links reachable", async ({ page }) => {
  await page.goto("/admin");
  await page.evaluate(() => localStorage.setItem("yayo-sidebar", "collapsed"));
  await page.reload();
  const link = page.locator("#sidebar-rail").getByRole("link", { name: /^Litiges/ });
  await link.hover();
  await expect(page.locator("span[aria-hidden]", { hasText: /^Litiges$/ })).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/admin\/litiges$/);
  await expect(link).toHaveAttribute("aria-current", "page");
});

test("navigating while the rail is animating keeps menu and route in sync", async ({ page }) => {
  await page.goto("/admin");
  const rail = page.locator("#sidebar-rail");
  await rail.getByRole("button", { name: "Réduire le menu" }).click();
  await rail.getByRole("link", { name: /Utilisateurs/ }).click();
  await rail.getByRole("link", { name: /Livreurs/ }).click();
  await expect(page).toHaveURL(/\/admin\/livreurs$/);
  await settle(page);
  await expect(rail.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(rail.getByRole("link", { name: /Livreurs/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Livreurs");
  expect((await rail.boundingBox())!.width).toBe(72);
});
