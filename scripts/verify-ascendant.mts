/**
 * Cross-checks the closed-form ascendant against a first-principles search.
 *
 * The formula in ephemeris.ts is a well-known identity but easy to get subtly
 * wrong. Here the rising point is found the long way round: rotate each
 * candidate ecliptic longitude to equatorial coordinates, compute its altitude
 * for the observer, and search for the crossing on the eastern horizon. Two
 * independent derivations agreeing to arcseconds is real evidence.
 */
import * as Astronomy from "astronomy-engine";
import { ascendantLongitude, toJulianDay } from "../src/lib/astro/ephemeris";
import { meanObliquity } from "../src/lib/astro/ayanamsa";
import { lahiriAyanamsa } from "../src/lib/astro/ayanamsa";

const RAD = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;

function altitudeOfEclipticPoint(lambdaDeg: number, lstDeg: number, latDeg: number, epsDeg: number) {
  const l = lambdaDeg * RAD, eps = epsDeg * RAD, phi = latDeg * RAD;
  const ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l));
  const dec = Math.asin(Math.sin(l) * Math.sin(eps));
  const H = norm(lstDeg - ra / RAD) * RAD;
  const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  // Azimuth measured from north, increasing eastward.
  const az = norm(Math.atan2(-Math.cos(dec) * Math.sin(H),
    Math.sin(dec) * Math.cos(phi) - Math.cos(dec) * Math.sin(phi) * Math.cos(H)) / RAD);
  return { alt: alt / RAD, az };
}

function ascendantBySearch(date: Date, latDeg: number, lonEastDeg: number) {
  const jd = toJulianDay(date);
  const eps = meanObliquity(jd);
  const lst = norm(Astronomy.SiderealTime(Astronomy.MakeTime(date)) * 15 + lonEastDeg);

  // The ascendant is the ecliptic point sitting on the EASTERN horizon. Which
  // way altitude happens to move as lambda increases is irrelevant — filtering
  // on that (rather than on azimuth) picks the western crossing instead.
  let prev = altitudeOfEclipticPoint(0, lst, latDeg, eps);
  for (let deg = 0.25; deg <= 360; deg += 0.25) {
    const cur = altitudeOfEclipticPoint(deg, lst, latDeg, eps);
    const crosses = prev.alt >= 0 !== cur.alt >= 0;
    if (crosses && cur.az > 0 && cur.az < 180) {
      let lo = deg - 0.25, hi = deg;
      const loBelow = altitudeOfEclipticPoint(lo, lst, latDeg, eps).alt < 0;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        const midBelow = altitudeOfEclipticPoint(mid, lst, latDeg, eps).alt < 0;
        if (midBelow === loBelow) lo = mid; else hi = mid;
      }
      return norm((lo + hi) / 2);
    }
    prev = cur;
  }
  throw new Error("no eastern horizon crossing found");
}

const dms = (d: number) => {
  const x = Math.floor(d), mF = (d - x) * 60, m = Math.floor(mF);
  return `${String(x).padStart(2,"0")}°${String(m).padStart(2,"0")}'${String(Math.round((mF-m)*60)).padStart(2,"0")}"`;
};
const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const fmt = (lon: number) => `${SIGNS[Math.floor(lon/30)%12].padEnd(11)} ${dms(lon % 30)}`;

const CASES: [string, string, number, number][] = [
  ["Berlin  1996-07-01 09:20 CEST", "1996-07-01T07:20:00Z", 52.520008, 13.404954],
  ["Hanoi   1995-06-25 07:30 +07",  "1995-06-25T00:30:00Z", 21.0278, 105.8342],
  ["Quito   2000-01-01 12:00 -05",  "2000-01-01T17:00:00Z", -0.1807, -78.4678],
  ["Reykjav 1980-11-11 03:00 UTC",  "1980-11-11T03:00:00Z", 64.1466, -21.9426],
  ["Sydney  2010-03-21 18:45 +11",  "2010-03-21T07:45:00Z", -33.8688, 151.2093],
];

console.log("Location                        closed form (tropical)   search (tropical)        Δ");
console.log("-".repeat(88));
let worst = 0;
for (const [label, iso, lat, lon] of CASES) {
  const date = new Date(iso);
  const sidereal = ascendantLongitude(date, lat, lon);
  const tropicalClosed = norm(sidereal + lahiriAyanamsa(toJulianDay(date)));
  const tropicalSearch = ascendantBySearch(date, lat, lon);
  let d = tropicalClosed - tropicalSearch; if (d > 180) d -= 360; if (d < -180) d += 360;
  worst = Math.max(worst, Math.abs(d) * 3600);
  console.log(`${label.padEnd(31)} ${fmt(tropicalClosed)}   ${fmt(tropicalSearch)}   ${(d*3600).toFixed(2)}"`);
}
console.log(`\nworst disagreement: ${worst.toFixed(2)} arcseconds`);
