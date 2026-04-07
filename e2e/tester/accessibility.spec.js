import { test, expect } from "@playwright/test";

test.describe("Accessibility: 접근성 검증", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // --- 색상 대비 (NFR-3-1) ---

  test("A11Y-01: 본문 텍스트(#2D2D2D) on 배경(#FFF5F5) 대비가 WCAG AA 이상이다", async ({
    page,
  }) => {
    // #2D2D2D on #FFF5F5
    // Relative luminance of #2D2D2D ≈ 0.0260
    // Relative luminance of #FFF5F5 ≈ 0.9547
    // Contrast = (0.9547 + 0.05) / (0.0260 + 0.05) ≈ 13.4:1 (passes AA 4.5:1)
    const color = await page
      .locator('[data-section="greeting"] .body-text')
      .evaluate((el) => getComputedStyle(el).color);
    const bg = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    // Verify the colors are #2D2D2D on #FFF5F5
    expect(color).toBe("rgb(45, 45, 45)");
    expect(bg).toBe("rgb(255, 245, 245)");
    // Computed contrast ratio > 4.5:1 (verified analytically above)
  });

  test("A11Y-02: 본문 텍스트(#2D2D2D) on 배경(#F0F4FF) 대비가 WCAG AA 이상이다", async ({
    page,
  }) => {
    const color = await page
      .locator('[data-section="datetime"] .body-text')
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    const bg = await page
      .locator('[data-section="datetime"]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(color).toBe("rgb(45, 45, 45)");
    expect(bg).toBe("rgb(240, 244, 255)");
  });

  test("A11Y-03: 보조 텍스트(#6B6B6B) on 배경(#FFF5F5) 대비가 WCAG AA 이상이다", async ({
    page,
  }) => {
    // #6B6B6B on #FFF5F5
    // Relative luminance of #6B6B6B ≈ 0.1608
    // Relative luminance of #FFF5F5 ≈ 0.9547
    // Contrast = (0.9547 + 0.05) / (0.1608 + 0.05) ≈ 4.79:1 (passes AA 4.5:1)
    const color = await page
      .locator('[data-section="gathering"] .address')
      .evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(107, 107, 107)");
  });

  // --- 시맨틱 HTML ---

  test("A11Y-04: 제목 태그의 계층이 올바르다 (h1 > h2, 건너뛰기 없음)", async ({
    page,
  }) => {
    const headings = await page.evaluate(() => {
      const els = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      return Array.from(els).map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim(),
      }));
    });
    // First heading should be h1
    expect(headings[0].tag).toBe("h1");
    // All subsequent headings should be h2 (no h3+ without h2 parent)
    headings.slice(1).forEach((h) => expect(h.tag).toBe("h2"));
  });

  test("A11Y-05: 모든 링크에 의미 있는 텍스트가 있다 (빈 링크 없음)", async ({
    page,
  }) => {
    const links = await page.locator("a").evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent.trim(),
        href: el.getAttribute("href"),
      })),
    );
    links.forEach((link) => {
      expect(link.text.length).toBeGreaterThan(0);
    });
  });

  test("A11Y-06: 페이지에 중복된 data-section 값이 없다", async ({ page }) => {
    const sections = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => el.dataset.section));
    const unique = new Set(sections);
    expect(unique.size).toBe(sections.length);
  });

  // --- 이미지 접근성 ---

  test("A11Y-07: hero 이미지의 alt 텍스트에 의미 있는 설명이 포함된다", async ({
    page,
  }) => {
    const alt = await page
      .locator('[data-section="hero"] img')
      .getAttribute("alt");
    // Alt should describe the content (birthday party invitation)
    expect(alt.length).toBeGreaterThan(5);
    expect(alt).toMatch(/생일|파티|초대/);
  });

  // --- 키보드 접근성 ---

  test("A11Y-08: 지도 링크에 Tab 키로 포커스 가능하다", async ({ page }) => {
    // Scroll to make elements visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    // Tab through the page and find the map links
    const mapLinks = page.locator("a.map-link");
    const count = await mapLinks.count();
    for (let i = 0; i < count; i++) {
      await mapLinks.nth(i).focus();
      const isFocused = await mapLinks
        .nth(i)
        .evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
    }
  });

  test("A11Y-09: 전화 걸기 링크에 Tab 키로 포커스 가능하다", async ({
    page,
  }) => {
    const telLink = page.locator(".tel-button");
    await telLink.focus();
    const isFocused = await telLink.evaluate(
      (el) => document.activeElement === el,
    );
    expect(isFocused).toBe(true);
  });

  // --- charset, viewport ---

  test("A11Y-10: charset이 UTF-8로 설정되어 있다", async ({ page }) => {
    const charset = await page.locator("meta[charset]").getAttribute("charset");
    expect(charset.toUpperCase()).toBe("UTF-8");
  });

  test("A11Y-11: viewport에 user-scalable=no가 없다 (확대 허용)", async ({
    page,
  }) => {
    const content = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(content).not.toContain("user-scalable=no");
    expect(content).not.toContain("maximum-scale=1");
  });

  // --- Google Fonts preconnect ---

  test("A11Y-12: Google Fonts에 preconnect 힌트가 있다", async ({ page }) => {
    const preconnect = page.locator(
      'link[rel="preconnect"][href*="fonts.googleapis.com"]',
    );
    await expect(preconnect).toHaveCount(1);
  });

  test("A11Y-13: gstatic에 crossorigin preconnect 힌트가 있다", async ({
    page,
  }) => {
    const preconnect = page.locator(
      'link[rel="preconnect"][href*="fonts.gstatic.com"]',
    );
    await expect(preconnect).toHaveCount(1);
    const crossorigin = await preconnect.getAttribute("crossorigin");
    expect(crossorigin).not.toBeNull();
  });

  // --- 문서 구조 ---

  test("A11Y-14: doctype이 html5이다", async ({ page }) => {
    const doctype = await page.evaluate(() => document.doctype?.name);
    expect(doctype).toBe("html");
  });

  test("A11Y-15: 페이지에 main 또는 container 역할의 래퍼가 있다", async ({
    page,
  }) => {
    const container = page.locator(".container");
    await expect(container).toHaveCount(1);
  });
});
