/**
 * Checks the background actually moves, rather than merely rendering.
 *
 * Needs `npm run dev -- -p 3947` in another terminal. SwiftShader is forced so
 * the WebGL2 sun runs in headless Chrome.
 */
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3947";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle",
         "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const errors: string[] = [];
page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto(`${BASE}/vi`, { waitUntil: "networkidle2" });
await page.evaluate(() =>
  document.querySelector('[data-celestial-scene="solar"]')?.scrollIntoView({ block: "center" }));
await new Promise((r) => setTimeout(r, 2500));

// --- The sun must be shader-backed, not the fallback bitmap.
const scene = await page.evaluate(() => {
  const s = document.querySelector('[data-celestial-scene="solar"]');
  return {
    canvases: s?.querySelectorAll("canvas").length ?? 0,
    fallbackImages: [...(s?.querySelectorAll("img") ?? [])]
      .filter((i) => (i as HTMLImageElement).src.includes("sun.webp")).length,
  };
});
console.log(`sun renderer: ${scene.canvases === 1 && scene.fallbackImages === 0
  ? "WebGL shader ✓" : `FALLBACK (canvases=${scene.canvases}, imgs=${scene.fallbackImages})`}`);

// --- The photosphere must churn between frames.
const element = (await page.$('[data-celestial-scene="solar"]'))!;
const frames: string[] = [];
for (let i = 0; i < 4; i++) {
  frames.push((await element.screenshot({ encoding: "base64" })) as string);
  await new Promise((r) => setTimeout(r, 800));
}
console.log(`sun surface: ${new Set(frames).size > 1 ? "animating ✓" : "STATIC ✗"}`);

// --- Starfield: twinkle/flare variation, plus elongated meteor streaks.
const sky = await page.evaluate(async () => {
  const c = [...document.querySelectorAll("canvas")].find(
    (x) => (x as HTMLCanvasElement).parentElement?.className.includes("fixed"),
  ) as HTMLCanvasElement | undefined;
  if (!c) return null;
  const ctx = c.getContext("2d")!;
  let prev = ctx.getImageData(0, 0, c.width, c.height).data;
  const lit: number[] = [];
  const streaks: { spanX: number; spanY: number }[] = [];

  // ~26s: the meteor gap is 3.5-9.5s, so several should pass.
  for (let f = 0; f < 130; f++) {
    await new Promise((r) => setTimeout(r, 200));
    const cur = ctx.getImageData(0, 0, c.width, c.height).data;
    let on = 0, changed = 0, minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
    for (let y = 0; y < c.height; y += 2) {
      for (let x = 0; x < c.width; x += 2) {
        const i = (y * c.width + x) * 4 + 3;
        if (cur[i] > 30) on++;
        // Only a freshly drawn streak shifts alpha this hard; twinkle is gradual.
        if (Math.abs(cur[i] - prev[i]) > 110) {
          changed++;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    lit.push(on);
    const spanX = maxX - minX, spanY = maxY - minY;
    // A meteor is an elongated cluster; a flaring star is compact.
    if (changed > 25 && spanX > 120 && spanX > spanY * 1.6) streaks.push({ spanX, spanY });
    prev = cur;
  }
  return { min: Math.min(...lit), max: Math.max(...lit), streaks };
});

if (!sky) console.log("starfield: canvas NOT FOUND ✗");
else {
  console.log(`starfield twinkle/flare: lit ${sky.min}→${sky.max} ${sky.max > sky.min ? "✓" : "✗ static"}`);
  console.log(`meteors in ~26s: ${sky.streaks.length} ${sky.streaks.length > 0 ? "✓" : "✗ none seen"}`);
  sky.streaks.slice(0, 4).forEach((s) => console.log(`  streak span ${s.spanX}x${s.spanY}`));
}

console.log(`console errors: ${errors.length ? errors.slice(0, 4).join(" | ") : "none ✓"}`);
await browser.close();
