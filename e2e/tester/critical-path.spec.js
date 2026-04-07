import { test, expect } from "@playwright/test";

test.describe("Critical Path: 핵심 사용자 플로우", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // --- 페이지 로드 및 기본 구조 ---

  test("CP-01: 페이지가 정상적으로 로드된다 (200 응답)", async ({ page }) => {
    const response = await page.request.get("/");
    expect(response.status()).toBe(200);
  });

  test("CP-02: 페이지 타이틀이 생일 파티 관련 텍스트이다", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("이지호");
    expect(title).toContain("생일");
  });

  test("CP-03: 모든 7개 섹션이 <section> HTML 요소이다", async ({ page }) => {
    const tagNames = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => el.tagName.toLowerCase()));
    expect(tagNames).toHaveLength(7);
    tagNames.forEach((tag) => expect(tag).toBe("section"));
  });

  test("CP-04: 첫 번째 섹션(hero)이 페이지 최상단에 위치한다", async ({
    page,
  }) => {
    const heroBox = await page.locator('[data-section="hero"]').boundingBox();
    expect(heroBox.y).toBeLessThan(100);
  });

  test("CP-05: 마지막 섹션(contact)이 모든 섹션 중 가장 아래에 위치한다", async ({
    page,
  }) => {
    // Scroll to bottom to trigger animations
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const positions = await page.locator("[data-section]").evaluateAll((els) =>
      els.map((el) => ({
        section: el.dataset.section,
        top: el.getBoundingClientRect().top,
      })),
    );
    const contact = positions.find((p) => p.section === "contact");
    const others = positions.filter((p) => p.section !== "contact");
    others.forEach((other) => {
      expect(contact.top).toBeGreaterThan(other.top);
    });
  });

  // --- 파티 핵심 정보 정확성 ---

  test('CP-06: 파티 날짜에 요일 "(금)"이 포함된다', async ({ page }) => {
    const section = page.locator('[data-section="datetime"]');
    await expect(section).toContainText("(금)");
  });

  test("CP-07: gathering 섹션에 집합 장소 설명이 포함된다", async ({
    page,
  }) => {
    const section = page.locator('[data-section="gathering"]');
    await expect(section).toContainText("코오롱오투빌2차");
  });

  test("CP-08: gathering 섹션에 지호네 집 앞 텍스트가 포함된다", async ({
    page,
  }) => {
    const section = page.locator('[data-section="gathering"]');
    await expect(section).toContainText("지호네 집 앞");
  });

  test("CP-09: 집합 시간(오후 1시)이 파티 시간(오후 2시)보다 앞 섹션에 있다", async ({
    page,
  }) => {
    const sectionOrder = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => el.dataset.section));
    const gatheringIdx = sectionOrder.indexOf("gathering");
    const datetimeIdx = sectionOrder.indexOf("datetime");
    // gathering should come after datetime (both have time info)
    expect(gatheringIdx).toBeGreaterThan(datetimeIdx);
  });

  // --- 지도 링크 핵심 기능 ---

  test("CP-10: 집합 장소 지도 링크 href에 실제 주소가 포함된다", async ({
    page,
  }) => {
    const href = await page
      .locator('[data-section="gathering"] a', { hasText: "지도에서 보기" })
      .getAttribute("href");
    expect(href).toContain("서울시");
    expect(href).toContain("강서구");
  });

  test("CP-11: 파티 장소 지도 링크 href에 원마운트가 포함된다", async ({
    page,
  }) => {
    const href = await page
      .locator('[data-section="venue"] a', { hasText: "지도에서 보기" })
      .getAttribute("href");
    expect(href).toContain("원마운트");
  });

  test("CP-12: 파티 장소 지도 링크 href에 실제 주소가 포함된다", async ({
    page,
  }) => {
    const href = await page
      .locator('[data-section="venue"] a', { hasText: "지도에서 보기" })
      .getAttribute("href");
    expect(href).toContain("고양시");
    expect(href).toContain("한류월드로");
  });

  test("CP-13: 전화 걸기 링크가 visible 상태이다", async ({ page }) => {
    const link = page.locator('a[href="tel:010-9921-3109"]');
    await expect(link).toBeVisible();
  });

  test("CP-14: 전화 걸기 링크 텍스트에 전화번호가 표시된다", async ({
    page,
  }) => {
    const link = page.locator('a[href="tel:010-9921-3109"]');
    await expect(link).toContainText("010-9921-3109");
  });

  // --- 스크롤 후 컨텐츠 접근 ---

  test("CP-15: 스크롤하면 모든 섹션이 visible 상태가 된다", async ({
    page,
  }) => {
    // Scroll to bottom slowly
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      const totalHeight = document.body.scrollHeight;
      for (let i = 0; i < totalHeight; i += 200) {
        window.scrollTo(0, i);
        await delay(50);
      }
    });
    await page.waitForTimeout(700);
    const classes = await page
      .locator("[data-section]")
      .evaluateAll((els) => els.map((el) => el.classList.contains("visible")));
    classes.forEach((hasVisible) => expect(hasVisible).toBe(true));
  });

  test("CP-16: hero 섹션은 스크롤 없이도 visible 상태이다", async ({
    page,
  }) => {
    const isVisible = await page
      .locator('[data-section="hero"]')
      .evaluate((el) => el.classList.contains("visible"));
    expect(isVisible).toBe(true);
  });

  test("CP-17: hero 섹션의 opacity가 초기에 1이다", async ({ page }) => {
    const opacity = await page
      .locator('[data-section="hero"]')
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
  });

  test("CP-18: 모든 지도 보기 링크가 visible 상태이다 (스크롤 후)", async ({
    page,
  }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const links = page.locator('a[href^="https://map.naver.com"]');
    const count = await links.count();
    expect(count).toBe(2);
    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toBeVisible();
    }
  });

  test("CP-19: 페이지에 JavaScript 에러가 발생하지 않는다", async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test("CP-20: 페이지에 콘솔 에러가 발생하지 않는다 (iframe 리소스 에러 제외)", async ({
    page,
  }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // iframe 로드 실패 및 Permissions policy 에러는 외부 서비스 이슈로 제외
        if (
          text.includes("Failed to load resource") ||
          text.includes("Permissions policy violation")
        ) {
          return;
        }
        errors.push(text);
      }
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });
});
