import { test, expect } from "@playwright/test";

test.describe("F-3: 네이버맵 지도 링크", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test('AC-3-1: gathering 섹션에 "지도에서 보기" 링크가 존재한다', async ({
    page,
  }) => {
    const link = page.locator('[data-section="gathering"] a', {
      hasText: "지도에서 보기",
    });
    await expect(link).toBeVisible();
  });

  test("AC-3-2: 집합 장소 지도 링크의 href가 네이버맵 URL로 시작한다", async ({
    page,
  }) => {
    const href = await page
      .locator('[data-section="gathering"] a[href^="https://map.naver.com"]')
      .getAttribute("href");
    expect(href).toMatch(/^https:\/\/map\.naver\.com\/v5\/search\//);
  });

  test('AC-3-3: venue 섹션에 "지도에서 보기" 링크가 존재한다', async ({
    page,
  }) => {
    const link = page.locator('[data-section="venue"] a', {
      hasText: "지도에서 보기",
    });
    await expect(link).toBeVisible();
  });

  test("AC-3-4: 파티 장소 지도 링크의 href가 네이버맵 URL로 시작한다", async ({
    page,
  }) => {
    const href = await page
      .locator('[data-section="venue"] a[href^="https://map.naver.com"]')
      .getAttribute("href");
    expect(href).toMatch(/^https:\/\/map\.naver\.com\/v5\/search\//);
  });

  test("AC-3-5: 네이버맵 링크가 정확히 2개 존재한다", async ({ page }) => {
    const links = page.locator('a[href^="https://map.naver.com/v5/search/"]');
    await expect(links).toHaveCount(2);
  });

  test("AC-3-6: 지도 링크 버튼의 클릭 가능 영역이 최소 44x44px이다", async ({
    page,
  }) => {
    const links = page.locator("a.map-link");
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("AC-3-7: 지도 링크가 https:// 프로토콜을 사용한다", async ({ page }) => {
    const links = page.locator('a[href^="https://map.naver.com/v5/search/"]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toMatch(/^https:\/\//);
    }
  });

  test('AC-3-8: 지도 링크에 target="_blank"가 있다', async ({ page }) => {
    const links = page.locator('a[href^="https://map.naver.com/v5/search/"]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const target = await links.nth(i).getAttribute("target");
      expect(target).toBe("_blank");
    }
  });

  test('NFR-4-2: 외부 링크에 rel="noopener noreferrer"가 있다', async ({
    page,
  }) => {
    const links = page.locator('a[href^="https://map.naver.com/v5/search/"]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const rel = await links.nth(i).getAttribute("rel");
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
    }
  });
});
