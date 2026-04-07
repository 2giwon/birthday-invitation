import { test, expect } from "@playwright/test";

test.describe("F-1: 페이지 레이아웃 및 섹션 구조", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("AC-1-1: data-section 속성을 가진 요소가 정확히 7개 존재한다", async ({
    page,
  }) => {
    const sections = page.locator("[data-section]");
    await expect(sections).toHaveCount(7);
  });

  test("AC-1-2: 7개 섹션이 올바른 순서로 DOM에 배치된다", async ({ page }) => {
    const expectedOrder = [
      "hero",
      "greeting",
      "datetime",
      "gathering",
      "venue",
      "supplies",
      "contact",
    ];
    const sections = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => el.dataset.section));
    expect(sections).toEqual(expectedOrder);
  });

  test("AC-1-3: 페이지 컨테이너의 max-width가 480px이다", async ({ page }) => {
    const maxWidth = await page
      .locator(".container")
      .evaluate((el) => getComputedStyle(el).maxWidth);
    expect(maxWidth).toBe("480px");
  });

  test("AC-1-4: 페이지 컨테이너가 화면 중앙에 정렬된다", async ({ page }) => {
    const margins = await page.locator(".container").evaluate((el) => {
      const style = getComputedStyle(el);
      return { left: style.marginLeft, right: style.marginRight };
    });
    expect(margins.left).toBe(margins.right);
  });

  test("AC-1-5: 섹션별로 시각적 구분이 있다 (배경색)", async ({ page }) => {
    const backgrounds = await page
      .locator("[data-section]")
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).backgroundColor),
      );
    // Not all sections should have the same background
    const unique = new Set(backgrounds);
    expect(unique.size).toBeGreaterThan(1);
  });

  test("AC-1-6: 320px 뷰포트에서 가로 스크롤바가 발생하지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });

  test("AC-1-7: 320px 뷰포트에서 텍스트가 컨테이너를 overflow하지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    const overflows = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => el.scrollWidth > el.clientWidth));
    expect(overflows.every((o) => o === false)).toBe(true);
  });

  test("AC-1-8: 뷰포트 1024px에서 컨테이너 너비가 480px을 초과하지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    const width = await page
      .locator(".container")
      .evaluate((el) => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(480);
  });

  test("AC-1-9: 뷰포트 1440px 데스크톱에서 레이아웃이 깨지지 않고 중앙 정렬된다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const box = await page.locator(".container").boundingBox();
    // Container should be centered: left margin roughly equal to right margin
    const leftMargin = box.x;
    const rightMargin = 1440 - (box.x + box.width);
    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(2);
  });
});
