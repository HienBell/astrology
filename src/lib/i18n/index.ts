import { en } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";
import { DEFAULT_LOCALE, type Locale } from "./config";
import type { Dictionary } from "./types";

const DICTIONARIES: Record<Locale, Dictionary> = { vi, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Fills `{placeholder}` slots in a template.
 * Missing params are left visible rather than blanked, so gaps show up in
 * development instead of silently shipping half a sentence.
 */
export function interpolate(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export * from "./config";
export type { Dictionary } from "./types";
