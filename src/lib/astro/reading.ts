/**
 * Orchestration layer: birth details in, a complete daily reading out.
 *
 * This is the only module the app should need to call. Everything below it is
 * pure and independently testable.
 */

import { buildNatalChart, positionsFor } from "./chart";
import { norm360 } from "./ephemeris";
import {
  buildDomainScores,
  collectFactors,
  evaluateSadeSati,
  rawDomainScores,
} from "./scoring";
import { activeDasha } from "./dasha";
import { DOMAINS } from "./types";
import type {
  BirthInput,
  DailyReading,
  NatalChart,
  Tithi,
} from "./types";

/**
 * Tithi — the lunar day, defined by the Moon's elongation from the Sun in 12°
 * steps. The ayanamsa cancels out, so sidereal longitudes give the same answer.
 */
export function tithiOf(sunLongitude: number, moonLongitude: number): Tithi {
  const elongation = norm360(moonLongitude - sunLongitude);
  const index = Math.floor(elongation / 12) + 1;
  return {
    index,
    paksha: index <= 15 ? "shukla" : "krishna",
    fraction: (elongation % 12) / 12,
  };
}

export interface DailyReadingArgs {
  chart: NatalChart;
  /** The moment to read for, already resolved to UTC. */
  at: Date;
  /** `YYYY-MM-DD` in the subject's timezone — used as the cache key. */
  localDate: string;
}

export function buildDailyReading({
  chart,
  at,
  localDate,
}: DailyReadingArgs): DailyReading {
  const ascRashi = chart.ascendant.rashi;
  const transits = positionsFor(at, ascRashi);
  const dasha = activeDasha(chart.dashaTree, at);
  const sadeSati = evaluateSadeSati(chart.moonRashi, transits.Saturn.rashi);

  const ctx = { chart, transits, dasha, sadeSati };
  const factors = collectFactors(ctx);

  // Tomorrow's raw scores drive the trend arrows. Computing a second transit
  // set is cheap and far more honest than guessing direction from planet speed.
  const tomorrow = new Date(at.getTime() + 86_400_000);
  const tomorrowTransits = positionsFor(tomorrow, ascRashi);
  const tomorrowRaw = rawDomainScores(
    chart,
    collectFactors({
      chart,
      transits: tomorrowTransits,
      dasha: activeDasha(chart.dashaTree, tomorrow),
      sadeSati: evaluateSadeSati(chart.moonRashi, tomorrowTransits.Saturn.rashi),
    }),
  );

  const domains = buildDomainScores({ chart, factors, tomorrowRaw });

  const overall = Math.round(
    DOMAINS.reduce((sum, d) => sum + domains[d].score, 0) / DOMAINS.length,
  );

  if (!dasha) {
    // Vimshottari only covers 120 years from birth; beyond that we have no
    // dasha context, but transits alone still produce a valid reading.
    throw new Error(
      "No active Vimshottari dasha for this date — birth date is out of range.",
    );
  }

  return {
    date: localDate,
    chart,
    transits,
    activeDasha: dasha,
    moonNakshatra: transits.Moon.nakshatra,
    moonRashi: transits.Moon.rashi,
    tithi: tithiOf(transits.Sun.longitude, transits.Moon.longitude),
    sadeSati,
    domains,
    overall,
  };
}

export interface ReadingRequest {
  birth: BirthInput;
  /** Birth moment resolved to UTC. */
  birthUtc: Date;
  at: Date;
  localDate: string;
}

export function createReading({
  birth,
  birthUtc,
  at,
  localDate,
}: ReadingRequest): DailyReading {
  const chart = buildNatalChart({ input: birth, utc: birthUtc });
  return buildDailyReading({ chart, at, localDate });
}
