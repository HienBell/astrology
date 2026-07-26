import { createReading } from "../src/lib/astro/reading";
import { resolveBirthMoment, readingInstant } from "../src/lib/geo/timezone";
const tz = "Asia/Bangkok";
const scores: number[] = []; const per: Record<string, number[]> = {career:[],love:[],family:[],health:[],money:[]};
let n = 0;
for (let y = 1960; y <= 2005; y += 5)
  for (const md of ["01-11","03-22","06-08","09-17","11-29"])
    for (const t of ["04:20","13:45","21:05"])
      for (const day of ["2026-07-26","2026-10-14"]) {
        const bu = resolveBirthMoment(`${y}-${md}`, t, tz).utc;
        const r = createReading({ birth:{date:`${y}-${md}`,time:t,place:{label:"x",latitude:21.03,longitude:105.85,timezone:tz}}, birthUtc:bu, at:readingInstant(day,tz), localDate:day });
        scores.push(r.overall); n++;
        for (const k of Object.keys(per)) per[k].push(r.domains[k as "career"].score);
      }
const stat = (a:number[]) => { const s=[...a].sort((x,y)=>x-y); const m=a.reduce((p,c)=>p+c,0)/a.length;
  return `min=${s[0]} p10=${s[Math.floor(s.length*.1)]} p50=${s[Math.floor(s.length*.5)]} p90=${s[Math.floor(s.length*.9)]} max=${s.at(-1)} mean=${m.toFixed(1)} sd=${Math.sqrt(a.reduce((p,c)=>p+(c-m)**2,0)/a.length).toFixed(1)}`; };
console.log("samples:", n);
console.log("overall ", stat(scores));
for (const k of Object.keys(per)) console.log(k.padEnd(8), stat(per[k]));
