import { test, expect } from "@playwright/test";

test.describe("F-5: 보호자 연락처 + 전화 걸기", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test('AC-5-1: contact 섹션에 "엄마" 텍스트가 포함된다', async ({ page }) => {
    const section = page.locator('[data-section="contact"]');
    await expect(section).toContainText("엄마");
  });

  test('AC-5-2: contact 섹션에 "010-9921-3109" 텍스트가 포함된다', async ({
    page,
  }) => {
    const section = page.locator('[data-section="contact"]');
    await expect(section).toContainText("010-9921-3109");
  });

  test("AC-5-3: tel:010-9921-3109 링크가 존재한다", async ({ page }) => {
    const link = page.locator('a[href="tel:010-9921-3109"]');
    await expect(link).toHaveCount(1);
  });

  test("AC-5-4: 전화 걸기 버튼의 클릭 가능 영역이 최소 44x44px이다", async ({
    page,
  }) => {
    const link = page.locator('a[href="tel:010-9921-3109"]');
    const box = await link.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("AC-5-5: 데스크톱에서도 연락처 번호가 텍스트로 표시된다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    const section = page.locator('[data-section="contact"]');
    await expect(section).toContainText("010-9921-3109");
  });
});
