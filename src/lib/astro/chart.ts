/**
 * Builds the natal chart (rashi / D-1) from a birth moment and place.
 *
 * Houses are whole-sign (bhava = rashi), which is the standard bhava scheme in
 * Jyotish and the one every classical gochara and dasha rule assumes.
 */

import {
  COMBUSTION_ORB,
  EXALTATION,
  MOOLATRIKONA,
  NAKSHATRA_ARC,
  NATURAL_ENEMIES,
  NATURAL_FRIENDS,
  OWN_RASHIS,
  PADA_ARC,
  RASHIS,
  nakshatraLord,
} from "./constants";
import {
  ascendantLongitude,
  grahaPositions,
  lahiriAyanamsa,
  separation,
  toJulianDay,
  type RawPosition,
} from "./ephemeris";
import { buildDashaTree } from "./dasha";
import { GRAHAS } from "./types";
import type {
  Ascendant,
  BhavaNumber,
  BirthInput,
  Dignity,
  Graha,
  GrahaPosition,
  NakshatraPlacement,
  NatalChart,
  RashiIndex,
} from "./types";

export function rashiOf(longitude: number): RashiIndex {
  return (Math.floor(longitude / 30) % 12) as RashiIndex;
}

export function degreeInRashi(longitude: number): number {
  return longitude % 30;
}

export function nakshatraOf(longitude: number): NakshatraPlacement {
  const index = Math.floor(longitude / NAKSHATRA_ARC) % 27;
  const within = longitude - index * NAKSHATRA_ARC;
  return {
    index,
    pada: (Math.floor(within / PADA_ARC) + 1) as 1 | 2 | 3 | 4,
    lord: nakshatraLord(index),
    traversed: within / NAKSHATRA_ARC,
  };
}

/** Whole-sign bhava a rashi falls in, counted from the lagna rashi. */
export function bhavaOf(rashi: RashiIndex, ascRashi: RashiIndex): BhavaNumber {
  return (((rashi - ascRashi + 12) % 12) + 1) as BhavaNumber;
}

/** House distance from `from` to `to`, counted inclusively as Jyotish does. */
export function houseDistance(from: RashiIndex, to: RashiIndex): number {
  return ((to - from + 12) % 12) + 1;
}

function dignityOf(graha: Graha, rashi: RashiIndex, degree: number): Dignity {
  const exalt = EXALTATION[graha];
  if (exalt) {
    if (rashi === exalt.rashi) return "exalted";
    if (rashi === ((exalt.rashi + 6) % 12)) return "debilitated";
  }

  const mt = MOOLATRIKONA[graha];
  if (mt && rashi === mt.rashi && degree >= mt.from && degree < mt.to) {
    return "moolatrikona";
  }

  if (OWN_RASHIS[graha].includes(rashi)) return "own";

  // Otherwise judge by the relationship with the lord of the occupied sign.
  const lord = RASHIS[rashi].lord;
  if (lord === graha) return "own";
  if (NATURAL_FRIENDS[graha].includes(lord)) return "friend";
  if (NATURAL_ENEMIES[graha].includes(lord)) return "enemy";
  return "neutral";
}

const DIGNITY_BASE: Record<Dignity, number> = {
  exalted: 95,
  moolatrikona: 85,
  own: 80,
  friend: 65,
  neutral: 50,
  enemy: 30,
  debilitated: 15,
};

const KENDRAS = [1, 4, 7, 10];
const TRIKONAS = [1, 5, 9];
const DUSTHANAS = [6, 8, 12];

/**
 * A pragmatic stand-in for shadbala: enough signal to rank grahas against each
 * other without the cost and opacity of the full six-fold calculation.
 */
function strengthOf(
  graha: Graha,
  dignity: Dignity,
  bhava: BhavaNumber,
  combust: boolean,
  retrograde: boolean,
): number {
  let score = DIGNITY_BASE[dignity];

  if (KENDRAS.includes(bhava)) score += 8;
  if (TRIKONAS.includes(bhava)) score += 8;
  if (DUSTHANAS.includes(bhava)) score -= 10;

  // Cheshta bala: a retrograde graha is close to earth and gives loud results.
  if (retrograde && graha !== "Rahu" && graha !== "Ketu") score += 10;
  if (combust) score -= 25;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildPosition(
  graha: Graha,
  raw: RawPosition,
  ascRashi: RashiIndex,
  sunLongitude: number,
): GrahaPosition {
  const rashi = rashiOf(raw.longitude);
  const degree = degreeInRashi(raw.longitude);
  const bhava = bhavaOf(rashi, ascRashi);
  const orb = COMBUSTION_ORB[graha];
  const combust =
    orb > 0 && separation(raw.longitude, sunLongitude) < orb;
  const retrograde = raw.speed < 0;
  const dignity = dignityOf(graha, rashi, degree);

  return {
    graha,
    longitude: raw.longitude,
    degreeInRashi: degree,
    rashi,
    bhava,
    nakshatra: nakshatraOf(raw.longitude),
    speed: raw.speed,
    retrograde,
    combust,
    dignity,
    strength: strengthOf(graha, dignity, bhava, combust, retrograde),
  };
}

/**
 * Positions of all nine grahas relative to a given lagna. Used for both the
 * natal chart and — with the natal lagna — the daily transit chart.
 */
export function positionsFor(
  utc: Date,
  ascRashi: RashiIndex,
): Record<Graha, GrahaPosition> {
  const raw = grahaPositions(utc);
  const sunLongitude = raw.Sun.longitude;
  const out = {} as Record<Graha, GrahaPosition>;
  for (const graha of GRAHAS) {
    out[graha] = buildPosition(graha, raw[graha], ascRashi, sunLongitude);
  }
  return out;
}

export interface BuildChartArgs {
  input: BirthInput;
  /** The birth moment already resolved to UTC by the timezone layer. */
  utc: Date;
}

export function buildNatalChart({ input, utc }: BuildChartArgs): NatalChart {
  const { latitude, longitude } = input.place;

  const ascLongitude = ascendantLongitude(utc, latitude, longitude);
  const ascRashi = rashiOf(ascLongitude);

  const ascendant: Ascendant = {
    longitude: ascLongitude,
    rashi: ascRashi,
    degreeInRashi: degreeInRashi(ascLongitude),
    nakshatra: nakshatraOf(ascLongitude),
  };

  const planets = positionsFor(utc, ascRashi);

  const occupants = {} as Record<BhavaNumber, Graha[]>;
  for (let h = 1 as BhavaNumber; h <= 12; h = (h + 1) as BhavaNumber) {
    occupants[h] = [];
  }
  for (const graha of GRAHAS) {
    occupants[planets[graha].bhava].push(graha);
  }

  return {
    input,
    utc,
    julianDay: toJulianDay(utc),
    ayanamsa: lahiriAyanamsa(toJulianDay(utc)),
    ascendant,
    planets,
    occupants,
    moonRashi: planets.Moon.rashi,
    dashaTree: buildDashaTree(planets.Moon.nakshatra, utc),
  };
}
