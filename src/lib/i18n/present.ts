/**
 * Presentation helpers: the single place where engine output becomes display
 * text. Components never reach into the dictionary for astrology terms
 * directly, which keeps naming consistent across every view.
 */

import { GRAHA_GLYPHS, NAKSHATRAS, RASHIS } from "@/lib/astro/constants";
import type {
  Dignity,
  Domain,
  Graha,
  RashiIndex,
  ScoreFactor,
} from "@/lib/astro/types";

import { interpolate } from "./index";
import type { Dictionary } from "./types";

export function grahaName(dict: Dictionary, graha: Graha): string {
  return dict.grahas[graha];
}

export function grahaGlyph(graha: Graha): string {
  return GRAHA_GLYPHS[graha];
}

/** Localised rashi name; the Sanskrit name is kept available alongside. */
export function rashiName(dict: Dictionary, rashi: RashiIndex): string {
  return dict.rashis[rashi];
}

export function rashiSanskrit(rashi: RashiIndex): string {
  return RASHIS[rashi].sanskrit;
}

export function rashiSymbol(rashi: RashiIndex): string {
  return RASHIS[rashi].symbol;
}

/** Nakshatra names stay in Sanskrit in both locales — they are proper nouns. */
export function nakshatraName(index: number): string {
  return NAKSHATRAS[index];
}

export function dignityName(dict: Dictionary, dignity: Dignity): string {
  return dict.dignities[dignity];
}

export function domainName(dict: Dictionary, domain: Domain): string {
  return dict.domains[domain];
}

export function bhavaName(dict: Dictionary, house: number): string {
  return dict.bhavas[house - 1] ?? "";
}

/** `12°34'` — the degree format used consistently across chart and tables. */
export function formatDegree(degrees: number): string {
  const whole = Math.floor(degrees);
  const minutes = Math.round((degrees - whole) * 60);
  // Rounding can carry into the next degree.
  if (minutes === 60) return `${whole + 1}°00'`;
  return `${whole}°${String(minutes).padStart(2, "0")}'`;
}

type FactorKey = keyof Dictionary["factor"];

/**
 * Renders a `ScoreFactor` into a sentence, translating any graha or phase names
 * inside its params first so the whole line reads in one language.
 */
export function formatFactor(dict: Dictionary, factor: ScoreFactor): string {
  const key = factor.key.replace(/^factor\./, "") as FactorKey;
  const template = dict.factor[key];
  if (!template) return factor.key;

  const params: Record<string, string | number> = {};

  for (const [name, value] of Object.entries(factor.params)) {
    if (typeof value === "string") {
      if (name === "graha" || name === "moving" || name === "natal" || name === "lord") {
        params[name] = grahaName(dict, value as Graha);
        continue;
      }
      if (name === "dignity") {
        params[name] = dignityName(dict, value as Dignity);
        continue;
      }
      if (name === "phase") {
        params[name] =
          dict.sadeSatiPhase[value as keyof Dictionary["sadeSatiPhase"]] ?? value;
        continue;
      }
    }
    if (name === "nakshatra" && typeof value === "number") {
      params[name] = nakshatraName(value);
      continue;
    }
    params[name] = value;
  }

  return interpolate(template, params);
}

/** Score band used for colour and tone. Kept here so it never drifts per view. */
export type ScoreBand = "low" | "belowAverage" | "average" | "good" | "excellent";

export function scoreBand(score: number): ScoreBand {
  if (score < 30) return "low";
  if (score < 45) return "belowAverage";
  if (score < 60) return "average";
  if (score < 78) return "good";
  return "excellent";
}
