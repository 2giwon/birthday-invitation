import { test, expect } from "@playwright/test";

test.describe("Responsive: 반응형 및 다양한 뷰포트", () => {
  // --- 모바일 기기 시뮬레이션 ---

  test("RES-01: iPhone SE (320x568)에서 모든 섹션이 표시된다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const sections = page.locator("[data-section]");
    await expect(sections).toHaveCount(7);
  });

  test("RES-02: iPhone 12/13 (390x844)에서 모든 콘텐츠가 정상이다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const section = page.locator('[data-section="datetime"]');
    await expect(section).toContainText("2026년 4월 11일");
    await expect(section).toContainText("오후 2시");
  });

  test("RES-03: Galaxy S21 (360x800)에서 가로 스크롤이 없다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(360);
  });

  test("RES-04: iPad Mini (768x1024)에서 컨테이너가 중앙 정렬된다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    const box = await page.locator(".container").boundingBox();
    const leftMargin = box.x;
    const rightMargin = 768 - (box.x + box.width);
    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(2);
  });

  test("RES-05: iPad Pro (1024x1366)에서 중앙 정렬된다", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto("/");
    const box = await page.locator(".container").boundingBox();
    const leftMargin = box.x;
    const rightMargin = 1024 - (box.x + box.width);
    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(2);
  });

  // --- 버튼 터치 타겟 크기 (다양한 뷰포트) ---

  test("RES-06: 320px에서 지도 링크 터치 타겟이 44x44px 이상이다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const links = page.locator("a.map-link");
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("RES-07: 320px에서 전화 버튼 터치 타겟이 44x44px 이상이다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const button = page.locator(".tel-button");
    const box = await button.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  // --- 가로 모드 ---

  test("RES-08: 가로 모드(568x320)에서 가로 스크롤이 없다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 568, height: 320 });
    await page.goto("/");
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(568);
  });

  test("RES-09: 가로 모드에서 컨테이너가 480px 이하이다", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/");
    const width = await page
      .locator(".container")
      .evaluate((el) => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(480);
  });

  // --- 컨테이너 너비 전환 포인트 ---

  test("RES-10: 320px에서 컨테이너가 뷰포트 전체 너비를 사용한다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const width = await page
      .locator(".container")
      .evaluate((el) => el.offsetWidth);
    // Should use most of 320px (minus no padding overflow)
    expect(width).toBeLessThanOrEqual(320);
    expect(width).toBeGreaterThan(280);
  });

  test("RES-11: 1920px Full HD에서 중앙 정렬된다", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    const box = await page.locator(".container").boundingBox();
    const leftMargin = box.x;
    const rightMargin = 1920 - (box.x + box.width);
    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(2);
  });

  test("RES-12: 320px에서 hero 이미지가 컨테이너를 벗어나지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const imgWidth = await page
      .locator('[data-section="hero"] img')
      .evaluate((el) => el.offsetWidth);
    const containerWidth = await page
      .locator(".container")
      .evaluate((el) => el.clientWidth);
    expect(imgWidth).toBeLessThanOrEqual(containerWidth);
  });

  test("RES-13: 320px에서 버튼 텍스트가 잘리지 않는다", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const buttons = page.locator(".map-link, .tel-button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const overflow = await buttons
        .nth(i)
        .evaluate((el) => getComputedStyle(el).overflow);
      expect(overflow).not.toBe("hidden");
    }
  });

  test("RES-14: 375px에서 모든 텍스트가 컨테이너 안에 있다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const overflows = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => el.scrollWidth > el.clientWidth));
    overflows.forEach((o) => expect(o).toBe(false));
  });

  test("RES-15: 뷰포트 높이가 매우 작아도(320x240) 페이지가 스크롤 가능하다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 240 });
    await page.goto("/");
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(bodyHeight).toBeGreaterThan(240);
  });
});
