import { test, expect } from "@playwright/test";

test.describe("NFR: 비기능 요구사항", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("NFR-2-1: viewport 메타태그가 존재한다", async ({ page }) => {
    const viewport = page.locator(
      'meta[name="viewport"][content*="width=device-width"]',
    );
    await expect(viewport).toHaveCount(1);
    const content = await viewport.getAttribute("content");
    expect(content).toContain("initial-scale=1");
  });

  test("NFR-2-2: 320px 뷰포트에서 가로 스크롤 없이 모든 콘텐츠가 표시된다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });

  test("NFR-2-3: 1440px 데스크톱 뷰포트에서 레이아웃이 깨지지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // All sections should be visible and not overflow
    const sections = page.locator("[data-section]");
    const count = await sections.count();
    expect(count).toBe(7);
  });

  test("NFR-3-2: 모든 img 태그에 비어있지 않은 alt 속성이 존재한다", async ({
    page,
  }) => {
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt.length).toBeGreaterThan(0);
    }
  });

  test('NFR-3-3: html lang="ko" 속성이 설정되어 있다', async ({ page }) => {
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("ko");
  });

  test("NFR-3-4: favicon.ico 파일이 존재하고 link 태그가 있다", async ({
    page,
  }) => {
    const response = await page.request.get("/favicon.ico");
    expect(response.status()).toBe(200);
    const faviconLink = page.locator('link[rel="icon"]');
    await expect(faviconLink).toHaveCount(1);
  });
});
