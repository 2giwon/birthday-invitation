import { test, expect } from "@playwright/test";

test.describe("F-2: 파티 정보 표시", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test('AC-2-1: datetime 섹션에 "2026년 4월 11일" 텍스트가 포함된다', async ({
    page,
  }) => {
    const section = page.locator('[data-section="datetime"]');
    await expect(section).toContainText("2026년 4월 11일");
  });

  test('AC-2-2: datetime 섹션에 "오후 2시" 텍스트가 포함된다', async ({
    page,
  }) => {
    const section = page.locator('[data-section="datetime"]');
    await expect(section).toContainText("오후 2시");
  });

  test('AC-2-3: gathering 섹션에 "오후 1시" 텍스트가 포함된다', async ({
    page,
  }) => {
    const section = page.locator('[data-section="gathering"]');
    await expect(section).toContainText("오후 1시");
  });

  test("AC-2-4: gathering 섹션에 집합 주소가 포함된다", async ({ page }) => {
    const section = page.locator('[data-section="gathering"]');
    await expect(section).toContainText("서울시 강서구 양천로 62길 41");
  });

  test('AC-2-5: venue 섹션에 "원마운트 1층" 텍스트가 포함된다', async ({
    page,
  }) => {
    const section = page.locator('[data-section="venue"]');
    await expect(section).toContainText("원마운트 1층");
  });

  test("AC-2-6: venue 섹션에 파티 주소가 포함된다", async ({ page }) => {
    const section = page.locator('[data-section="venue"]');
    await expect(section).toContainText("경기 고양시 일산서구 한류월드로 300");
  });

  test('AC-2-7: supplies 섹션에 "미끄럼 방지용 양말" 텍스트가 포함된다', async ({
    page,
  }) => {
    const section = page.locator('[data-section="supplies"]');
    await expect(section).toContainText("미끄럼 방지용 양말");
  });

  test("AC-2-8: greeting 섹션에 인사말이 포함된다", async ({ page }) => {
    const section = page.locator('[data-section="greeting"]');
    await expect(section).toContainText("지호의 생일에 함께해 주세요!");
  });

  test("AC-2-9: 본문 텍스트의 font-size가 최소 16px이다", async ({ page }) => {
    const fontSize = await page
      .locator('[data-section="datetime"] p')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test("AC-2-10: 보조 텍스트(주소)의 font-size가 최소 14px이다", async ({
    page,
  }) => {
    const fontSize = await page
      .locator('[data-section="gathering"] .address')
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

  test("AC-2-11: CSS에 font-display: swap이 선언되어 있다", async ({
    page,
  }) => {
    const hasFontDisplaySwap = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      for (const sheet of styles) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.cssText && rule.cssText.includes("font-display")) {
              return true;
            }
          }
        } catch (e) {
          // cross-origin stylesheets
        }
      }
      return false;
    });
    // Also check via link tag for Google Fonts with display=swap
    const googleFontsLink = page.locator(
      'link[href*="fonts.googleapis.com"][href*="display=swap"]',
    );
    const hasGoogleFontsSwap = (await googleFontsLink.count()) > 0;
    expect(hasFontDisplaySwap || hasGoogleFontsSwap).toBe(true);
  });

  test('AC-2-12: HTML의 lang 속성이 "ko"이다', async ({ page }) => {
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("ko");
  });
});
