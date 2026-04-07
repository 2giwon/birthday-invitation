import { chromium } from "@playwright/test";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  const htmlPath = resolve(__dirname, "../og-card.html");
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: resolve(__dirname, "../public/og-image.png"),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
    type: "png",
  });

  console.log("OG image captured: public/og-image.png");
  await browser.close();
})();
