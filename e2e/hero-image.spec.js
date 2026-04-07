import { test, expect } from "@playwright/test";

test.describe("F-6: 히어로 이미지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("AC-6-1: hero 섹션에 img 태그가 존재한다", async ({ page }) => {
    const img = page.locator('[data-section="hero"] img');
    await expect(img).toHaveCount(1);
  });

  test('AC-6-2: 히어로 이미지의 src에 "hero" 키워드가 포함된다', async ({
    page,
  }) => {
    const src = await page
      .locator('[data-section="hero"] img')
      .getAttribute("src");
    expect(src).toContain("hero");
  });

  test("AC-6-3: 히어로 이미지에 비어있지 않은 alt 속성이 있다", async ({
    page,
  }) => {
    const alt = await page
      .locator('[data-section="hero"] img')
      .getAttribute("alt");
    expect(alt).toBeTruthy();
    expect(alt.length).toBeGreaterThan(0);
  });

  test("AC-6-4: 히어로 이미지가 컨테이너 너비에 맞게 표시된다", async ({
    page,
  }) => {
    const imgWidth = await page
      .locator('[data-section="hero"] img')
      .evaluate((el) => el.offsetWidth);
    const containerWidth = await page
      .locator(".container")
      .evaluate((el) => el.offsetWidth);
    expect(imgWidth).toBeLessThanOrEqual(containerWidth);
  });

  test("AC-6-5: public/images/hero.jpg 파일이 존재한다 (200 응답)", async ({
    page,
  }) => {
    const response = await page.request.get("/images/hero.jpg");
    expect(response.status()).toBe(200);
  });

  test("AC-6-6: alt 값이 의미 있는 텍스트이다", async ({ page }) => {
    const alt = await page
      .locator('[data-section="hero"] img')
      .getAttribute("alt");
    // alt should be more than just whitespace or generic text
    expect(alt.trim().length).toBeGreaterThan(2);
  });

  test("AC-6-7: 이미지 로딩 실패 시에도 다음 섹션이 정상 위치에 표시된다", async ({
    page,
  }) => {
    // Change image src to broken path
    await page
      .locator('[data-section="hero"] img')
      .evaluate((el) => (el.src = "/broken-image.jpg"));
    // Wait for error to propagate
    await page.waitForTimeout(500);
    // Greeting section should still be visible and in position
    const greetingBox = await page
      .locator('[data-section="greeting"]')
      .boundingBox();
    expect(greetingBox).toBeTruthy();
    expect(greetingBox.y).toBeGreaterThan(0);
  });
});
