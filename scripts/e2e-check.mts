import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3947";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

const errors: string[] = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));

// Seed a profile directly so we exercise the reading page deterministically.
await page.goto(`${BASE}/vi`, { waitUntil: "networkidle2" });
await page.evaluate(() => {
  const profile = {
    id: "test-1", name: "Người thử", date: "1995-06-25", time: "07:30",
    timeUnknown: false,
    place: { label: "Hà Nội, Việt Nam", latitude: 21.0278, longitude: 105.8342, timezone: "Asia/Bangkok" },
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("thiendo.profiles.v1", JSON.stringify([profile]));
  localStorage.setItem("thiendo.activeProfile.v1", "test-1");
});

console.log("=== LANDING ===");
console.log("h1:", await page.$eval("h1", (e) => e.textContent?.trim().replace(/\s+/g," ")));
console.log("zodiac glyphs:", await page.$$eval("svg text", (n) => n.filter(t=>/[♈-♓]/.test(t.textContent||"")).length));
await page.screenshot({ path: "/tmp/shot-landing.png", fullPage: false });

console.log("\n=== READING ===");
await page.goto(`${BASE}/vi/reading`, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 2500));

const h1 = await page.$eval("h1", (e) => e.textContent?.trim());
console.log("h1:", h1);

const overall = await page.$eval('[class*="font-mono"][class*="text-5xl"]', (e) => e.textContent?.trim()).catch(() => null);
console.log("overall score:", overall);

const domains = await page.$$eval("article h3", (n) => n.map((e) => e.textContent?.trim()));
console.log("domain cards:", domains.join(" | "));

const scores = await page.$$eval('article p[class*="text-2xl"][class*="font-mono"]', (n) => n.map((e) => e.textContent?.trim()));
console.log("domain scores:", scores.join(" "));

const chartCells = await page.$$eval("svg text", (n) => n.map(t=>t.textContent).filter(t => /^(Su|Mo|Ma|Me|Ju|Ve|Sa|Ra|Ke)/.test(t||"")));
console.log("chart graha tokens:", chartCells.length, "->", [...new Set(chartCells)].join(" "));

const tableRows = await page.$$eval("tbody tr", (n) => n.length);
console.log("planet table rows:", tableRows);

const dasha = await page.$$eval("section", (n) => n.map(e=>e.textContent||"").find(t=>t.includes("Vimshottari"))?.slice(0,180));
console.log("dasha panel:", dasha?.replace(/\s+/g," "));

const invalidNesting = await page.evaluate(() => document.querySelectorAll("table > div").length);
console.log("invalid <table><div>:", invalidNesting);

await page.screenshot({ path: "/tmp/shot-reading.png", fullPage: true });

console.log("\n=== DATE NAV ===");
const before = await page.$eval('[class*="font-mono"][class*="text-5xl"]', e=>e.textContent);
const nextBtn = await page.$('button[aria-label="Hôm sau"]');
await nextBtn?.click();
await new Promise((r)=>setTimeout(r,900));
const after = await page.$eval('[class*="font-mono"][class*="text-5xl"]', e=>e.textContent);
console.log(`overall ${before} -> ${after} (recomputed: ${before!==after ? "yes" : "same value"})`);

console.log("\n=== EN LOCALE ===");
await page.goto(`${BASE}/en/reading`, { waitUntil: "networkidle2" });
await new Promise((r)=>setTimeout(r,2000));
console.log("domains:", (await page.$$eval("article h3", n=>n.map(e=>e.textContent?.trim()))).join(" | "));

console.log("\n=== CONSOLE ERRORS ===");
const real = errors.filter(e => !/interpret|503|Failed to load resource/.test(e));
console.log(real.length === 0 ? "none" : real.slice(0,8).join("\n"));

await browser.close();
