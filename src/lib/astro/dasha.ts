/**
 * Vimshottari dasha — the 120-year planetary period system that gives Jyotish
 * its timing. The sequence and the starting balance are fixed by the nakshatra
 * the Moon occupies at birth.
 */

import {
  SIDEREAL_YEAR_DAYS,
  VIMSHOTTARI_ORDER,
  VIMSHOTTARI_TOTAL_YEARS,
  VIMSHOTTARI_YEARS,
} from "./constants";
import type {
  ActiveDasha,
  DashaPeriod,
  Graha,
  NakshatraPlacement,
} from "./types";

const MS_PER_YEAR = SIDEREAL_YEAR_DAYS * 86_400_000;

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

/** The dasha sequence starting from a given lord, wrapping through all nine. */
function sequenceFrom(lord: Graha): Graha[] {
  const start = VIMSHOTTARI_ORDER.indexOf(lord);
  return Array.from(
    { length: 9 },
    (_, i) => VIMSHOTTARI_ORDER[(start + i) % 9],
  );
}

/**
 * Sub-periods of a period: each sub-lord gets the same proportion of the parent
 * that its own mahadasha bears to the full 120 years.
 */
function subPeriods(
  parentLord: Graha,
  parentStart: Date,
  parentYears: number,
  level: 2 | 3,
): DashaPeriod[] {
  let cursor = parentStart;
  return sequenceFrom(parentLord).map((lord) => {
    const years =
      (parentYears * VIMSHOTTARI_YEARS[lord]) / VIMSHOTTARI_TOTAL_YEARS;
    const start = cursor;
    const end = addYears(start, years);
    cursor = end;
    return { lord, start, end, level };
  });
}

/**
 * Full mahadasha tree from birth, each with its antardashas.
 *
 * The first mahadasha is partial: only the unelapsed portion of the birth
 * nakshatra's lord remains, and its antardashas are laid out across the *full*
 * period then clipped, so the balance lands in the correct sub-period.
 */
export function buildDashaTree(
  moonNakshatra: NakshatraPlacement,
  birthUtc: Date,
): DashaPeriod[] {
  const firstLord = moonNakshatra.lord;
  const firstFullYears = VIMSHOTTARI_YEARS[firstLord];
  const elapsedYears = moonNakshatra.traversed * firstFullYears;

  // Where the first mahadasha would have begun had it run from the start.
  const notionalStart = addYears(birthUtc, -elapsedYears);

  const periods: DashaPeriod[] = [];
  let cursor = notionalStart;

  for (const lord of sequenceFrom(firstLord)) {
    const years = VIMSHOTTARI_YEARS[lord];
    const start = cursor;
    const end = addYears(start, years);
    periods.push({
      lord,
      start,
      end,
      level: 1,
      children: subPeriods(lord, start, years, 2),
    });
    cursor = end;
  }

  return periods;
}

function findAt(periods: DashaPeriod[], at: Date): DashaPeriod | undefined {
  return periods.find((p) => at >= p.start && at < p.end);
}

/**
 * The mahadasha / antardasha / pratyantardasha running on a given date.
 * Pratyantardashas are derived on demand rather than precomputed for all 729
 * combinations.
 */
export function activeDasha(
  tree: DashaPeriod[],
  at: Date,
): ActiveDasha | null {
  const maha = findAt(tree, at);
  if (!maha?.children) return null;

  const antar = findAt(maha.children, at);
  if (!antar) return null;

  const antarYears = (antar.end.getTime() - antar.start.getTime()) / MS_PER_YEAR;
  const pratyantar = findAt(
    subPeriods(antar.lord, antar.start, antarYears, 3),
    at,
  );

  return { maha, antar, pratyantar };
}

/** How far through a period we are, 0–1. Drives the dasha timeline UI. */
export function periodProgress(period: DashaPeriod, at: Date): number {
  const span = period.end.getTime() - period.start.getTime();
  if (span <= 0) return 0;
  const done = (at.getTime() - period.start.getTime()) / span;
  return Math.max(0, Math.min(1, done));
}
