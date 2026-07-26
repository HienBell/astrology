import { createReading } from "../src/lib/astro/reading";
import { resolveBirthMoment, timezoneFor, readingInstant } from "../src/lib/geo/timezone";
import { RASHIS, NAKSHATRAS, GRAHA_SHORT } from "../src/lib/astro/constants";
import { periodProgress } from "../src/lib/astro/dasha";
import { GRAHAS } from "../src/lib/astro/types";

const lat = 21.0278, lon = 105.8342; // Hanoi
const tz = timezoneFor(lat, lon);
console.log("timezone:", tz);

const { utc, offsetLabel } = resolveBirthMoment("1995-06-25", "07:30", tz);
console.log("birth UTC:", utc.toISOString(), "offset", offsetLabel);

const localDate = "2026-07-26";
const r = createReading({
  birth: { date: "1995-06-25", time: "07:30", place: { label: "Hanoi", latitude: lat, longitude: lon, timezone: tz } },
  birthUtc: utc,
  at: readingInstant(localDate, tz),
  localDate,
});

const c = r.chart;
console.log("\n=== NATAL ===");
console.log("Lagna:", RASHIS[c.ascendant.rashi].sanskrit, c.ascendant.degreeInRashi.toFixed(2)+"°",
  "| nak:", NAKSHATRAS[c.ascendant.nakshatra.index]);
console.log("Ayanamsa:", c.ayanamsa.toFixed(4));
for (const g of GRAHAS) {
  const p = c.planets[g];
  console.log(` ${GRAHA_SHORT[g]} ${RASHIS[p.rashi].sanskrit.padEnd(10)} ${p.degreeInRashi.toFixed(2).padStart(5)}° H${String(p.bhava).padStart(2)} ${NAKSHATRAS[p.nakshatra.index].padEnd(18)} p${p.nakshatra.pada} ${p.dignity.padEnd(12)} str=${p.strength}${p.retrograde?" R":""}${p.combust?" C":""}`);
}

console.log("\n=== DASHA ===");
const {maha, antar, pratyantar} = r.activeDasha;
console.log("Maha:", maha.lord, maha.start.toISOString().slice(0,10), "→", maha.end.toISOString().slice(0,10), `(${(periodProgress(maha, utc)*0+periodProgress(maha, new Date())*100).toFixed(0)}%)`);
console.log("Antar:", antar.lord, antar.start.toISOString().slice(0,10), "→", antar.end.toISOString().slice(0,10));
console.log("Pratyantar:", pratyantar?.lord, pratyantar?.start.toISOString().slice(0,10), "→", pratyantar?.end.toISOString().slice(0,10));
console.log("Total dasha span:", c.dashaTree[0].start.toISOString().slice(0,10), "→", c.dashaTree.at(-1)!.end.toISOString().slice(0,10));

console.log("\n=== DAY", r.date, "===");
console.log("Tithi:", r.tithi.index, r.tithi.paksha, "| Moon nak:", NAKSHATRAS[r.moonNakshatra.index], "| Sade Sati:", r.sadeSati.active ? r.sadeSati.phase : "no");
console.log("Overall:", r.overall);
for (const d of ["career","love","family","health","money"] as const) {
  const s = r.domains[d];
  console.log(` ${d.padEnd(8)} ${String(s.score).padStart(3)} ${s.trend.padEnd(8)} ${s.factors.length} factors`);
  for (const f of s.factors.slice(0,3)) console.log(`    ${f.impact>0?"+":""}${f.impact.toFixed(2)} ${f.key} ${JSON.stringify(f.params)}`);
}

console.log("\n=== SPREAD across 5 days (should vary) ===");
for (const d of ["2026-07-26","2026-07-29","2026-08-05","2026-09-01","2026-11-01"]) {
  const rr = createReading({ birth: { date:"1995-06-25", time:"07:30", place:{label:"Hanoi",latitude:lat,longitude:lon,timezone:tz} }, birthUtc: utc, at: readingInstant(d, tz), localDate: d });
  console.log(d, "overall",String(rr.overall).padStart(3), "| c",rr.domains.career.score,"lo",rr.domains.love.score,"f",rr.domains.family.score,"h",rr.domains.health.score,"m",rr.domains.money.score);
}

console.log("\n=== SPREAD across different births, same day ===");
for (const b of [["1980-02-14","03:15"],["1990-11-02","18:45"],["2001-07-09","23:10"],["1975-05-30","11:00"]] as const) {
  const bu = resolveBirthMoment(b[0], b[1], tz).utc;
  const rr = createReading({ birth: { date:b[0], time:b[1], place:{label:"Hanoi",latitude:lat,longitude:lon,timezone:tz} }, birthUtc: bu, at: readingInstant("2026-07-26", tz), localDate:"2026-07-26" });
  console.log(b[0], b[1], "lagna", RASHIS[rr.chart.ascendant.rashi].sanskrit.padEnd(10), "overall", String(rr.overall).padStart(3), "| c",rr.domains.career.score,"lo",rr.domains.love.score,"f",rr.domains.family.score,"h",rr.domains.health.score,"m",rr.domains.money.score, "| dasha", rr.activeDasha.maha.lord+"/"+rr.activeDasha.antar.lord);
}
