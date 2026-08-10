import { chromium } from "file:///C:/Nova/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleMessages = [];
page.on("console", (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
page.on("pageerror", (err) => consoleMessages.push({ type: "pageerror", text: err.message }));

await page.goto("http://localhost:3000/en", { waitUntil: "networkidle" });
await page.waitForTimeout(1000); // let hydration + any async warnings settle

const bodyClass = await page.evaluate(() => document.body.className);
const htmlCount = await page.evaluate(() => document.querySelectorAll("html").length);
const bodyCount = await page.evaluate(() => document.querySelectorAll("body").length);

const heroColor = await page.evaluate(() => {
  const h1 = document.querySelector("h1");
  if (!h1) return null;
  const style = getComputedStyle(h1);
  return {
    text: h1.textContent?.trim().slice(0, 60),
    color: style.color,
    bg: getComputedStyle(document.body).backgroundColor,
  };
});

await page.screenshot({ path: "C:/Nova/apps/web/.verify/after-fix.png", fullPage: false });

console.log("=== bodyClassName ===");
console.log(bodyClass);
console.log("=== htmlCount / bodyCount ===", htmlCount, bodyCount);
console.log("=== hero heading computed style ===");
console.log(JSON.stringify(heroColor, null, 2));
console.log("=== console messages (hydration-related) ===");
for (const m of consoleMessages) {
  if (/hydrat/i.test(m.text) || m.type === "pageerror" || m.type === "error") {
    console.log(`[${m.type}] ${m.text}`);
  }
}
console.log("=== total console messages captured ===", consoleMessages.length);

await browser.close();
