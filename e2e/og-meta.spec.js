import { test, expect } from "@playwright/test";

test.describe("F-4: OG 메타태그", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("AC-4-1: og:title 메타태그가 존재하고 올바른 값이다", async ({
    page,
  }) => {
    const content = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(content).toBe("이지호의 생일 파티에 초대합니다!");
  });

  test("AC-4-2: og:description 메타태그가 존재하고 올바른 값이다", async ({
    page,
  }) => {
    const content = await page
      .locator('meta[property="og:description"]')
      .getAttribute("content");
    expect(content).toBe("4월 11일(금) 오후 2시, 원마운트에서 만나요!");
  });

  test("AC-4-3: og:image 메타태그가 존재하고 비어있지 않다", async ({
    page,
  }) => {
    const content = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(0);
  });

  test("AC-4-4: og:url 메타태그가 존재한다", async ({ page }) => {
    const meta = page.locator('meta[property="og:url"]');
    await expect(meta).toHaveCount(1);
  });

  test('AC-4-5: og:type 메타태그가 "website"이다', async ({ page }) => {
    const content = await page
      .locator('meta[property="og:type"]')
      .getAttribute("content");
    expect(content).toBe("website");
  });

  test("AC-4-6: public/og-image.png 파일이 존재한다 (200 응답)", async ({
    page,
  }) => {
    const response = await page.request.get("/og-image.png");
    expect(response.status()).toBe(200);
  });

  test("AC-4-7: og:image가 참조하는 이미지 경로가 유효하다", async ({
    page,
  }) => {
    const content = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    // The content should contain og-image.png
    expect(content).toContain("og-image.png");
  });
});
