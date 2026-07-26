/**
 * Lahiri (Chitrapaksha) ayanamsa — the offset between the tropical zodiac that
 * astronomical libraries report and the sidereal zodiac Jyotish is cast in.
 *
 * Computed as the accumulated general precession in longitude since J2000,
 * added to the known Lahiri value at that epoch. This tracks Swiss Ephemeris'
 * Lahiri to within a few arcseconds across the modern era — negligible next to
 * the 3°20' width of a nakshatra pada.
 */

/** Lahiri ayanamsa at J2000.0 (2000-01-01 12:00 TT) = 23°51'11". */
const AYANAMSA_J2000 = 23.853_06;

export const J2000 = 2_451_545.0;

/** Julian centuries from J2000. */
export function julianCenturies(jd: number): number {
  return (jd - J2000) / 36525;
}

/**
 * General precession in longitude since J2000, in arcseconds.
 * Polynomial from the IAU 1976 / Simon et al. long-term series.
 */
function generalPrecessionArcsec(t: number): number {
  return (
    5028.796_195 * t +
    1.105_434_8 * t * t +
    0.000_079_64 * t * t * t -
    0.000_023_857 * t * t * t * t
  );
}

/** Lahiri ayanamsa in degrees for a given Julian Day. */
export function lahiriAyanamsa(jd: number): number {
  const t = julianCenturies(jd);
  return AYANAMSA_J2000 + generalPrecessionArcsec(t) / 3600;
}

/** Mean obliquity of the ecliptic in degrees (IAU 1980). */
export function meanObliquity(jd: number): number {
  const t = julianCenturies(jd);
  return (
    23.439_291_1 -
    (46.815_0 * t + 0.000_59 * t * t - 0.001_813 * t * t * t) / 3600
  );
}
