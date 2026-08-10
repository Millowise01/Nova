import { chromium } from "file:///C:/Nova/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleMessages = [];
page.on("console", (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
page.on("pageerror", (err) => consoleMessages.push({ type: "pageerror", text: err.message }));

await page.goto("http://localhost:3000/en", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

console.log("=== ALL console messages ===");
for (const m of consoleMessages) {
  console.log(`[${m.type}] ${m.text}`);
}

await browser.close();
