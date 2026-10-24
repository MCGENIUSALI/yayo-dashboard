/**
 * Motion tokens for JS (timers that wait for a CSS transition). Keep in sync
 * with the --duration-* variables in globals.css.
 */
export const duration = {
  instant: 120,
  fast: 160,
  base: 200,
  slow: 260,
  drawer: 300,
} as const;

/** A loader only appears if the operation lasts longer than this (no flicker on fast calls). */
export const LOADER_DELAY = 150;
/** Success confirmations stay visible this long before the control resets. */
export const SUCCESS_HOLD = 1800;
