import { test, expect } from "@playwright/test";

test.describe("Edge Cases: 경계값 및 특수 상황", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // --- 뷰포트 경계값 ---

  test("EC-01: 375px 뷰포트(iPhone 기본)에서 가로 스크롤이 없다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test("EC-02: 390px 뷰포트(iPhone 14)에서 가로 스크롤이 없다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });

  test("EC-03: 480px 뷰포트(max-width 경계)에서 컨테이너가 정확히 480px 이하", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    const width = await page
      .locator(".container")
      .evaluate((el) => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(480);
  });

  test("EC-04: 481px 뷰포트에서 컨테이너가 480px을 초과하지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 481, height: 800 });
    const width = await page
      .locator(".container")
      .evaluate((el) => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(480);
  });

  test("EC-05: 768px 태블릿 뷰포트에서 레이아웃이 정상이다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const width = await page
      .locator(".container")
      .evaluate((el) => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(480);
    const sections = page.locator("[data-section]");
    await expect(sections).toHaveCount(7);
  });

  test("EC-06: 2560px 초대형 뷰포트에서도 컨테이너가 480px 이하", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    const width = await page
      .locator(".container")
      .evaluate((el) => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(480);
  });

  // --- 텍스트 경계 ---

  test("EC-07: 주소 텍스트가 320px에서도 overflow 하지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    const overflows = await page.locator(".address").evaluateAll((els) =>
      els.map((el) => ({
        overflow: el.scrollWidth > el.clientWidth,
        text: el.textContent,
      })),
    );
    overflows.forEach((item) => expect(item.overflow).toBe(false));
  });

  test("EC-08: 긴 주소 텍스트에 word-break: keep-all이 적용된다", async ({
    page,
  }) => {
    const wordBreak = await page
      .locator(".address")
      .first()
      .evaluate((el) => getComputedStyle(el).wordBreak);
    expect(wordBreak).toBe("keep-all");
  });

  test("EC-09: body-text에 word-break: keep-all이 적용된다", async ({
    page,
  }) => {
    const wordBreak = await page
      .locator(".body-text")
      .first()
      .evaluate((el) => getComputedStyle(el).wordBreak);
    expect(wordBreak).toBe("keep-all");
  });

  // --- 섹션 내용 정확성 (Developer 누락) ---

  test("EC-10: hero 섹션에 hero-title 텍스트가 존재한다", async ({ page }) => {
    const title = page.locator('[data-section="hero"] .hero-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText("이지호");
  });

  test("EC-11: 각 섹션에 section-title(h2)이 존재한다 (hero 제외)", async ({
    page,
  }) => {
    const nonHeroSections = [
      "greeting",
      "datetime",
      "gathering",
      "venue",
      "supplies",
      "contact",
    ];
    for (const name of nonHeroSections) {
      const h2 = page.locator(`[data-section="${name}"] h2`);
      await expect(h2).toHaveCount(1);
    }
  });

  test("EC-12: hero 섹션 제목이 h1 태그이다", async ({ page }) => {
    const h1 = page.locator('[data-section="hero"] h1');
    await expect(h1).toHaveCount(1);
  });

  test("EC-13: 페이지에 h1 태그가 정확히 1개이다", async ({ page }) => {
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test('EC-14: datetime 섹션 제목이 "언제"이다', async ({ page }) => {
    const title = page.locator('[data-section="datetime"] h2');
    await expect(title).toContainText("언제");
  });

  test('EC-15: gathering 섹션 제목이 "집합 안내"이다', async ({ page }) => {
    const title = page.locator('[data-section="gathering"] h2');
    await expect(title).toContainText("집합");
  });

  test('EC-16: venue 섹션 제목이 "파티 장소"이다', async ({ page }) => {
    const title = page.locator('[data-section="venue"] h2');
    await expect(title).toContainText("파티 장소");
  });

  test('EC-17: supplies 섹션 제목이 "준비물"이다', async ({ page }) => {
    const title = page.locator('[data-section="supplies"] h2');
    await expect(title).toContainText("준비물");
  });

  test('EC-18: contact 섹션 제목이 "연락처"이다', async ({ page }) => {
    const title = page.locator('[data-section="contact"] h2');
    await expect(title).toContainText("연락처");
  });

  test('EC-19: greeting 섹션 제목이 "초대합니다"이다', async ({ page }) => {
    const title = page.locator('[data-section="greeting"] h2');
    await expect(title).toContainText("초대합니다");
  });

  // --- 이미지 관련 엣지 케이스 ---

  test("EC-20: hero 이미지에 min-height가 설정되어 있다 (레이아웃 붕괴 방지)", async ({
    page,
  }) => {
    const minHeight = await page
      .locator('[data-section="hero"] img')
      .evaluate((el) => getComputedStyle(el).minHeight);
    const value = parseFloat(minHeight);
    expect(value).toBeGreaterThan(0);
  });

  test("EC-21: hero 래퍼의 border-radius가 20px이다", async ({ page }) => {
    const radius = await page
      .locator('[data-section="hero"] .hero-wrapper')
      .evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius).toBe("20px");
  });

  test("EC-22: hero 이미지의 display가 block이다 (하단 공백 방지)", async ({
    page,
  }) => {
    const display = await page
      .locator('[data-section="hero"] img')
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("block");
  });

  test("EC-23: hero 이미지의 width가 100%이다", async ({ page }) => {
    const width = await page
      .locator('[data-section="hero"] img')
      .evaluate((el) => getComputedStyle(el).width);
    const containerWidth = await page
      .locator('[data-section="hero"]')
      .evaluate((el) => el.clientWidth);
    // Image width should be close to section width
    expect(parseFloat(width)).toBeGreaterThan(containerWidth * 0.9);
  });

  // --- 컨테이너 스타일 경계값 ---

  test("EC-24: container에 overflow-x: hidden이 적용된다", async ({ page }) => {
    const overflow = await page
      .locator(".container")
      .evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflow).toBe("hidden");
  });

  test("EC-25: 모든 섹션의 text-align이 center이다", async ({ page }) => {
    const textAligns = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).textAlign));
    textAligns.forEach((ta) => expect(ta).toBe("center"));
  });
});
