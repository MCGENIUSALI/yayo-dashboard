import { expect, test } from "@playwright/test";
import { htmlOverflow, settle } from "./helpers";

test.beforeEach(({}, info) => test.skip(info.project.name !== "mobile", "mobile drawer"));

test("drawer opens, traps focus, closes with Escape and restores focus and scroll", async ({ page }) => {
  await page.goto("/admin");
  const burger = page.getByRole("button", { name: "Ouvrir le menu" });
  const drawer = page.locator("#mobile-drawer");
  await expect(drawer).toBeHidden();
  await burger.tap();
  await expect(burger).toHaveAttribute("aria-expanded", "true");
  await expect(drawer).toBeVisible();
  expect(await htmlOverflow(page)).toBe("hidden");
  await expect(page.getByRole("button", { name: "Fermer le menu" })).toBeFocused();

  // Tab many times: focus never leaves the drawer.
  for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
  expect(await drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await settle(page);
  await expect(drawer).toBeHidden();
  await expect(burger).toBeFocused();
  expect(await htmlOverflow(page)).toBe("");
});

test("backdrop tap and navigation close the drawer; active item is correct", async ({ page }) => {
  await page.goto("/admin");
  const burger = page.getByRole("button", { name: "Ouvrir le menu" });
  await burger.tap();
  await page.touchscreen.tap(380, 400); // backdrop, right of the 18rem panel
  await settle(page);
  await expect(page.locator("#mobile-drawer")).toBeHidden();

  await burger.tap();
  await page.locator("#mobile-drawer").getByRole("link", { name: /Litiges/ }).tap();
  await expect(page).toHaveURL(/\/admin\/litiges$/);
  await settle(page);
  await expect(page.locator("#mobile-drawer")).toBeHidden();
  await burger.tap();
  await expect(page.locator("#mobile-drawer").getByRole("link", { name: /Litiges/ })).toHaveAttribute("aria-current", "page");
});

test("rapid open / close never leaves a half-open or click-blocking layer", async ({ page }) => {
  await page.goto("/admin");
  const burger = page.getByRole("button", { name: "Ouvrir le menu" });
  for (let i = 0; i < 5; i++) {
    await burger.tap();
    await page.keyboard.press("Escape");
  }
  await settle(page);
  await expect(page.locator("#mobile-drawer")).toBeHidden();
  expect(await htmlOverflow(page)).toBe("");
  // The page behind is clickable again.
  await page.getByRole("link", { name: /Notifications/ }).tap();
  await expect(page).toHaveURL(/\/admin\/litiges$/);
});

test("growing the viewport past lg with the drawer open hands over to the rail", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: "Ouvrir le menu" }).tap();
  await expect(page.locator("#mobile-drawer")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await settle(page);
  await expect(page.locator("#sidebar-rail")).toBeVisible();
  expect(await htmlOverflow(page)).toBe("");
  await page.setViewportSize({ width: 412, height: 839 });
  await settle(page);
  await expect(page.locator("#mobile-drawer")).toBeHidden();
});

test("seller tab bar works by touch and marks the current tab", async ({ page }) => {
  await page.goto("/vendeur");
  const tabs = page.getByRole("navigation", { name: "Navigation", exact: true });
  await tabs.getByRole("link", { name: /Commandes/ }).tap();
  await expect(page).toHaveURL(/\/vendeur\/commandes$/);
  await expect(tabs.getByRole("link", { name: /Commandes/ })).toHaveAttribute("aria-current", "page");
});
