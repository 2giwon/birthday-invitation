import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

test.describe("F-7: 스크롤 애니메이션", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("AC-7-1: main.js에서 IntersectionObserver를 사용한다", async () => {
    const mainJs = readFileSync(
      resolve(import.meta.dirname, "..", "src", "main.js"),
      "utf-8",
    );
    expect(mainJs).toContain("IntersectionObserver");
  });

  test("AC-7-2: fade-in 애니메이션의 duration이 0.3s~0.6s 범위이다", async ({
    page,
  }) => {
    const duration = await page.evaluate(() => {
      const el = document.querySelector('[data-section="greeting"]');
      const style = getComputedStyle(el);
      const transitionDuration = parseFloat(style.transitionDuration);
      return transitionDuration;
    });
    expect(duration).toBeGreaterThanOrEqual(0.3);
    expect(duration).toBeLessThanOrEqual(0.6);
  });

  test("AC-7-4: CSS에 prefers-reduced-motion 미디어 쿼리가 존재한다", async () => {
    const css = readFileSync(
      resolve(import.meta.dirname, "..", "src", "style.css"),
      "utf-8",
    );
    expect(css).toContain("prefers-reduced-motion");
  });

  test("AC-7-4: reduced-motion 설정 시 모든 섹션의 opacity가 1이다", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const opacities = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    for (const opacity of opacities) {
      expect(opacity).toBe("1");
    }
  });

  test("AC-7-5: IntersectionObserver 미지원 시 모든 섹션이 즉시 표시된다", async ({
    page,
  }) => {
    // Simulate no IntersectionObserver by removing it before page load
    await page.addInitScript(() => {
      delete window.IntersectionObserver;
    });
    await page.goto("/");
    // Wait for transitions to complete
    await page.waitForTimeout(700);
    const opacities = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    for (const opacity of opacities) {
      expect(opacity).toBe("1");
    }
  });
});
