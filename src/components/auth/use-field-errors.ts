"use client";

import { useState } from "react";

/**
 * Client-side validation for instant feedback (the server re-validates
 * everything). An error shows after a submit attempt, or when leaving a
 * field that has content, never during the first keystrokes.
 */
export function useFieldErrors<K extends string>(values: Record<K, string>, rules: Record<K, (v: string) => string | null>) {
  const [touched, setTouched] = useState<Partial<Record<K, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const errors = Object.fromEntries((Object.keys(rules) as K[]).map((k) => [k, rules[k](values[k])])) as Record<K, string | null>;
  const visible = (k: K) => (submitted || touched[k] ? (errors[k] ?? undefined) : undefined);
  const onBlur = (k: K) => () => values[k] && setTouched((t) => ({ ...t, [k]: true }));
  /** Marks the form as submitted; returns the first invalid field, if any. */
  const check = () => {
    setSubmitted(true);
    return (Object.keys(rules) as K[]).find((k) => errors[k]) ?? null;
  };
  /** Back to "untouched", e.g. after the server refused the attempt and a field was cleared on purpose. */
  const reset = () => {
    setSubmitted(false);
    setTouched({});
  };
  return { errors, visible, onBlur, check, reset };
}

export const focusField = (form: HTMLFormElement | null, name: string) => (form?.elements.namedItem(name) as HTMLElement | null)?.focus();
