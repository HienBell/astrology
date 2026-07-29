/**
 * Pins the ephemeris to an independently-produced chart.
 *
 * The reference below came from a Western tool, so it is TROPICAL. This app is
 * sidereal (Lahiri), and the two must differ by exactly the ayanamsa — adding
 * it back to our longitudes has to reproduce the reference to within a couple
 * of arcseconds. That is a much stronger check than any internal consistency
 * test, because the reference was computed by code we did not write.
 */
import { createReading } from "../src/lib/astro/reading";
import { resolveBirthMoment, readingInstant, timezoneFor } from "../src/lib/geo/timezone";
import { RASHIS, NAKSHATRAS } from "../src/lib/astro/constants";
import { GRAHAS } from "../src/lib/astro/types";
import { lahiriAyanamsa, toJulianDay } from "../src/lib/astro/ephemeris";

const lat = 52.520008, lon = 13.404954;           // Berlin
const tz = timezoneFor(lat, lon);
const { utc, offsetLabel } = resolveBirthMoment("1996-07-01", "09:20", tz);
console.log(`timezone ${tz}  offset ${offsetLabel}  ->  UTC ${utc.toISOString()}`);
console.log(`ayanamsa (Lahiri) = ${lahiriAyanamsa(toJulianDay(utc)).toFixed(4)}°\n`);

const r = createReading({
  birth: { date: "1996-07-01", time: "09:20", place: { label: "Berlin", latitude: lat, longitude: lon, timezone: tz } },
  birthUtc: utc, at: readingInstant("2026-07-29", tz), localDate: "2026-07-29",
});
const c = r.chart;
const ayan = c.ayanamsa;

const dms = (deg: number) => {
  const d = Math.floor(deg), mF = (deg - d) * 60, m = Math.floor(mF), s = Math.round((mF - m) * 60);
  return `${String(d).padStart(2,"0")}°${String(m).padStart(2,"0")}'${String(s).padStart(2,"0")}"`;
};
const sign = (lon: number) => RASHIS[Math.floor(lon/30) % 12].western;
const norm = (x: number) => ((x % 360) + 360) % 360;

// The reference chart the user supplied (tropical longitudes, from its signs+degrees).
const SIGN_INDEX: Record<string, number> = { Aries:0,Taurus:1,Gemini:2,Cancer:3,Leo:4,Virgo:5,Libra:6,Scorpio:7,Sagittarius:8,Capricorn:9,Aquarius:10,Pisces:11 };
const REFERENCE: Record<string, [string, number, number, number, number]> = {
  // graha: [sign, deg, min, sec, houseInReference]
  Sun:     ["Cancer",      9, 43, 54, 11],
  Moon:    ["Capricorn",  11, 43, 58,  5],
  Mercury: ["Gemini",     27, 56, 39, 11],
  Venus:   ["Gemini",     11, 47, 40, 10],
  Mars:    ["Gemini",     13, 12, 44, 10],
  Jupiter: ["Capricorn",  13, 10, 16,  5],
  Saturn:  ["Aries",       7,  8, 22,  8],
  Rahu:    ["Libra",      12, 47,  2,  3],
};

console.log("Graha      MY SIDEREAL (Lahiri)          MY TROPICAL (= sidereal+ayan)   REFERENCE TROPICAL        Δ");
console.log("-".repeat(108));
for (const g of GRAHAS) {
  const p = c.planets[g];
  const myTrop = norm(p.longitude + ayan);
  const ref = REFERENCE[g];
  let refCol = "—", delta = "—";
  if (ref) {
    const refLon = SIGN_INDEX[ref[0]] * 30 + ref[1] + ref[2]/60 + ref[3]/3600;
    refCol = `${ref[0].slice(0,11).padEnd(11)} ${dms(refLon % 30)}`;
    let d = myTrop - refLon; if (d > 180) d -= 360; if (d < -180) d += 360;
    delta = `${(d*60).toFixed(1)}'`;
  }
  console.log(
    `${g.padEnd(9)} ${sign(p.longitude).slice(0,11).padEnd(11)} ${dms(p.degreeInRashi)}  H${String(p.bhava).padStart(2)}   ` +
    `${sign(myTrop).slice(0,11).padEnd(11)} ${dms(myTrop % 30)}       ${refCol.padEnd(24)} ${delta.padStart(7)}`
  );
}

const ascTrop = norm(c.ascendant.longitude + ayan);
console.log("\nAscendant");
console.log(`  my sidereal : ${sign(c.ascendant.longitude)} ${dms(c.ascendant.degreeInRashi)}`);
console.log(`  my tropical : ${sign(ascTrop)} ${dms(ascTrop % 30)}`);
console.log(`  reference implies a Virgo tropical ascendant (Cancer = its house 11)`);

console.log("\nReference house numbers are NOT whole-sign:");
console.log("  Libra holds BOTH Chiron (house 2) and Rahu (house 3) — one sign spanning two houses");
console.log("  means a quadrant system (Placidus/Koch), not whole-sign.");
