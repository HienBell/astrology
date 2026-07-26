import { grahaPositions, ascendantLongitude, toJulianDay, lahiriAyanamsa } from "../src/lib/astro/ephemeris";

const fmt = (d) => {
  const s = Math.floor(d/30), r = d-s*30;
  const deg = Math.floor(r), min = Math.round((r-deg)*60);
  return `${["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"][s]} ${deg}°${String(min).padStart(2,"0")}'`;
};

console.log("=== Ayanamsa (expect Lahiri) ===");
for (const y of [1900, 2000, 2024, 2026]) {
  const jd = toJulianDay(new Date(`${y}-01-01T00:00:00Z`));
  const a = lahiriAyanamsa(jd);
  console.log(y, `${Math.floor(a)}°${String(Math.round((a%1)*60)).padStart(2,"0")}'`);
}

console.log("\n=== Mesha Sankranti: sidereal Sun should cross 0° Aries ~Apr 14 ===");
for (const d of ["2024-04-13","2024-04-14","2024-04-15"]) {
  const p = grahaPositions(new Date(`${d}T00:00:00Z`));
  console.log(d, "Sun", fmt(p.Sun.longitude));
}

console.log("\n=== Retrograde check 2024 (Mercury Rx ~Apr 1-25) ===");
for (const d of ["2024-03-20","2024-04-10","2024-05-10"]) {
  const p = grahaPositions(new Date(`${d}T12:00:00Z`));
  console.log(d, "Mercury speed", p.Mercury.speed.toFixed(4), p.Mercury.speed<0?"RETRO":"direct");
}

console.log("\n=== Lagna sanity: at local sunrise, lagna ≈ Sun's sign ===");
// Hanoi 21.03N, 105.85E, UTC+7. Sunrise ~06:00 local on 2024-06-21 => 23:00Z prior day
const lat=21.03, lon=105.85;
const t = new Date("2024-06-20T22:15:00Z"); // ~05:15 local, near sunrise
const asc = ascendantLongitude(t, lat, lon);
const sun = grahaPositions(t).Sun.longitude;
console.log("Sun ", fmt(sun));
console.log("Lagna", fmt(asc));
console.log("diff deg:", (((asc-sun)%360)+360)%360);

console.log("\n=== Lagna advances ~1 sign / 2h ===");
for (let h=0; h<=6; h+=2) {
  const tt = new Date(Date.UTC(2024,5,20,22,15+0,0) + h*3600000);
  console.log(`+${h}h`, fmt(ascendantLongitude(tt, lat, lon)));
}
