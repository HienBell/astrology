/**
 * Thin layer over `astronomy-engine` that returns *sidereal* positions.
 *
 * astronomy-engine is pure JavaScript (no native bindings, no ephemeris data
 * files), which keeps the app deployable to any serverless runtime and lets the
 * same code run in the browser for instant recalculation.
 */

import * as Astronomy from "astronomy-engine";

import { lahiriAyanamsa, julianCenturies, meanObliquity } from "./ayanamsa";
import { GRAHAS, type Graha } from "./types";

/** Grahas whose position comes from the ephemeris; the nodes are computed. */
const BODY_OF: Partial<Record<Graha, Astronomy.Body>> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mars: Astronomy.Body.Mars,
  Mercury: Astronomy.Body.Mercury,
  Jupiter: Astronomy.Body.Jupiter,
  Venus: Astronomy.Body.Venus,
  Saturn: Astronomy.Body.Saturn,
};

export function norm360(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Signed angular difference a - b, folded into -180…180. */
export function angleDelta(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/** Shortest absolute separation between two ecliptic longitudes. */
export function separation(a: number, b: number): number {
  return Math.abs(angleDelta(a, b));
}

export function toJulianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5;
}

export function fromJulianDay(jd: number): Date {
  return new Date((jd - 2_440_587.5) * 86_400_000);
}

/**
 * Mean lunar node (Meeus, Astronomical Algorithms ch. 47). Jyotish traditionally
 * uses the mean node rather than the true node for Rahu/Ketu.
 */
function meanLunarNode(jd: number): number {
  const t = julianCenturies(jd);
  return norm360(
    125.044_547_9 -
      1934.136_289_1 * t +
      0.002_075_4 * t * t +
      (t * t * t) / 467_441 -
      (t * t * t * t) / 60_616_000,
  );
}

/** Apparent geocentric tropical ecliptic longitude of a solar-system body. */
function tropicalLongitude(body: Astronomy.Body, date: Date): number {
  const time = Astronomy.MakeTime(date);
  const vector = Astronomy.GeoVector(body, time, true);
  return norm360(Astronomy.Ecliptic(vector).elon);
}

export interface RawPosition {
  longitude: number;
  /** Degrees per day; negative indicates retrograde motion. */
  speed: number;
}

/**
 * Sidereal longitude and daily motion for every graha at a given instant.
 * Speed is a central difference over one hour, which is accurate enough to
 * classify direct/retrograde motion including the slow stationary windows.
 */
export function grahaPositions(date: Date): Record<Graha, RawPosition> {
  const jd = toJulianDay(date);
  const ayanamsa = lahiriAyanamsa(jd);
  const dtHours = 1;
  const before = new Date(date.getTime() - dtHours * 3_600_000);
  const after = new Date(date.getTime() + dtHours * 3_600_000);
  const perDay = 24 / (2 * dtHours);

  const out = {} as Record<Graha, RawPosition>;

  for (const graha of GRAHAS) {
    if (graha === "Rahu" || graha === "Ketu") continue;
    const body = BODY_OF[graha]!;
    const tropical = tropicalLongitude(body, date);
    const speed =
      angleDelta(tropicalLongitude(body, after), tropicalLongitude(body, before)) *
      perDay;
    out[graha] = { longitude: norm360(tropical - ayanamsa), speed };
  }

  // The nodes always move backwards through the zodiac.
  const rahuTropical = meanLunarNode(jd);
  const rahuSidereal = norm360(rahuTropical - ayanamsa);
  const nodeSpeed = -0.052_9; // mean retrograde motion, deg/day
  out.Rahu = { longitude: rahuSidereal, speed: nodeSpeed };
  out.Ketu = { longitude: norm360(rahuSidereal + 180), speed: nodeSpeed };

  return out;
}

/**
 * Sidereal ascendant (lagna) for an instant and geographic position.
 *
 * Uses the standard spherical-trigonometry ascendant formula against the local
 * sidereal time, then subtracts the ayanamsa.
 */
export function ascendantLongitude(
  date: Date,
  latitude: number,
  longitudeEast: number,
): number {
  const jd = toJulianDay(date);
  const time = Astronomy.MakeTime(date);

  // Greenwich apparent sidereal time is returned in hours.
  const gast = Astronomy.SiderealTime(time);
  const ramc = norm360(gast * 15 + longitudeEast);

  const rad = Math.PI / 180;
  const eps = meanObliquity(jd) * rad;
  const phi = latitude * rad;
  const ramcRad = ramc * rad;

  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps));

  const tropicalAsc = norm360(Math.atan2(y, x) / rad);
  return norm360(tropicalAsc - lahiriAyanamsa(jd));
}

export { lahiriAyanamsa };
