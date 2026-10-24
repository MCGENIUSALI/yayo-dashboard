import { expect, type Page } from "@playwright/test";

/** Fails the test on any console error or uncaught exception. */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return {
    errors,
    expectClean: () => expect(errors, errors.join("\n")).toEqual([]),
  };
}

/** Waits until every running CSS transition / animation on the page has finished. */
export async function settle(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || (a.effect?.getComputedTiming().iterations ?? 1) === Infinity));
}

export const htmlOverflow = (page: Page) => page.evaluate(() => document.documentElement.style.overflow);
