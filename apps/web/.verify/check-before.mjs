import { chromium } from "file:///C:/Nova/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch();

const consoleMessages = [];
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("console", (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
page.on("pageerror", (err) => consoleMessages.push({ type: "pageerror", text: err.message }));

// Screenshot as close to first paint as possible (domcontentloaded, zero extra wait) —
// the pre-hydration flash window is brief, this is the closest a scripted capture gets
// to what a real user's eye catches before React's mismatch-recovery patches the body.
await page.goto("http://localhost:3000/en", { waitUntil: "domcontentloaded" });
await page.screenshot({
  path: "C:/Nova/apps/web/.verify/before-fix-firstpaint.png",
  fullPage: false,
});

// Let hydration fully settle, then capture the steady state + whatever console output
// the mismatch produced.
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);

const bodyClass = await page.evaluate(() => document.body.className);
console.log("=== bodyClassName (post-hydration, client-patched) ===");
console.log(JSON.stringify(bodyClass));
console.log("=== console messages ===");
for (const m of consoleMessages) {
  console.log(`[${m.type}] ${m.text}`);
}
await page.screenshot({
  path: "C:/Nova/apps/web/.verify/before-fix-hydrated.png",
  fullPage: false,
});

await browser.close();
