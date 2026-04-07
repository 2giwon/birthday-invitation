import { test, expect } from "@playwright/test";

test.describe("Security & NFR: 보안 및 비기능 요구사항", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // --- 보안 ---

  test('SEC-01: 모든 외부 링크에 rel="noopener noreferrer"가 있다', async ({
    page,
  }) => {
    const externalLinks = await page
      .locator('a[target="_blank"]')
      .evaluateAll((els) =>
        els.map((el) => ({
          href: el.getAttribute("href"),
          rel: el.getAttribute("rel"),
        })),
      );
    externalLinks.forEach((link) => {
      expect(link.rel).toContain("noopener");
      expect(link.rel).toContain("noreferrer");
    });
  });

  test('SEC-02: tel: 링크에는 target="_blank"가 없다', async ({ page }) => {
    const telLink = page.locator('a[href^="tel:"]');
    const target = await telLink.getAttribute("target");
    expect(target).toBeNull();
  });

  test("SEC-03: 페이지에 inline script가 없다 (CSP 친화적)", async ({
    page,
  }) => {
    const inlineScripts = await page.evaluate(() => {
      const scripts = document.querySelectorAll("script:not([src])");
      return Array.from(scripts).filter((s) => s.textContent.trim().length > 0)
        .length;
    });
    expect(inlineScripts).toBe(0);
  });

  test("SEC-04: 연락처가 tel: 프로토콜로 제공된다 (NFR-4-1)", async ({
    page,
  }) => {
    const telLink = page.locator('a[href^="tel:"]');
    await expect(telLink).toHaveCount(1);
    const href = await telLink.getAttribute("href");
    expect(href).toBe("tel:010-9921-3109");
  });

  // --- 에셋 존재 확인 ---

  test("SEC-05: favicon.ico가 유효한 응답을 반환한다", async ({ page }) => {
    const response = await page.request.get("/favicon.ico");
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"];
    // favicon can be ico or png or x-icon
    expect(contentType).toBeTruthy();
  });

  test("SEC-06: hero.jpg가 유효한 응답을 반환한다", async ({ page }) => {
    const response = await page.request.get("/images/hero.jpg");
    expect(response.status()).toBe(200);
  });

  test("SEC-07: og-image.png가 유효한 응답을 반환한다", async ({ page }) => {
    const response = await page.request.get("/og-image.png");
    expect(response.status()).toBe(200);
  });

  test("SEC-08: style.css가 유효한 응답을 반환한다", async ({ page }) => {
    const response = await page.request.get("/src/style.css");
    expect(response.status()).toBe(200);
  });

  test("SEC-09: main.js가 유효한 응답을 반환한다", async ({ page }) => {
    const response = await page.request.get("/src/main.js");
    expect(response.status()).toBe(200);
  });

  // --- OG 메타태그 심화 ---

  test("SEC-10: og:image의 content에 og-image 파일명이 포함된다", async ({
    page,
  }) => {
    const content = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(content).toContain("og-image");
  });

  test("SEC-11: og:url 메타태그의 content가 비어있지 않다", async ({
    page,
  }) => {
    const content = await page
      .locator('meta[property="og:url"]')
      .getAttribute("content");
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(0);
  });

  test("SEC-12: 페이지에 중복된 OG 메타태그가 없다", async ({ page }) => {
    const ogTags = [
      "og:title",
      "og:description",
      "og:image",
      "og:url",
      "og:type",
    ];
    for (const tag of ogTags) {
      const count = await page.locator(`meta[property="${tag}"]`).count();
      expect(count).toBe(1);
    }
  });

  // --- HTML 유효성 ---

  test("SEC-13: head에 CSS stylesheet 링크가 있다", async ({ page }) => {
    const link = page.locator('link[rel="stylesheet"]');
    const count = await link.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("SEC-14: head에 script module이 있다", async ({ page }) => {
    const script = page.locator('script[type="module"]');
    const count = await script.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("SEC-15: 존재하지 않는 경로에 대해 404가 아닌 에러가 발생하지 않는다", async ({
    page,
  }) => {
    // Ensure the main page does not reference broken resources
    const errors = [];
    page.on("requestfailed", (request) => {
      errors.push(request.url());
    });
    await page.goto("/");
    await page.waitForTimeout(1000);
    // Filter out known issues (like font loading from CDN and naver map iframe resources)
    const criticalErrors = errors.filter(
      (url) =>
        !url.includes("fonts.googleapis.com") &&
        !url.includes("fonts.gstatic.com") &&
        !url.includes("naver.com") &&
        !url.includes("pstatic.net"),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
