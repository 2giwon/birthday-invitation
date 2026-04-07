import { test, expect } from "@playwright/test";

test.describe("Content Integrity: 콘텐츠 무결성 검증", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // --- 정보가 올바른 섹션에 있는지 검증 (크로스 섹션 누출 방지) ---

  test('CI-01: "오후 2시"가 datetime 섹션에만 있다 (gathering에 없다)', async ({
    page,
  }) => {
    const datetime = page.locator('[data-section="datetime"]');
    await expect(datetime).toContainText("오후 2시");
    const gathering = await page
      .locator('[data-section="gathering"]')
      .textContent();
    expect(gathering).not.toContain("오후 2시");
  });

  test('CI-02: "오후 1시"가 gathering 섹션에만 있다 (datetime에 없다)', async ({
    page,
  }) => {
    const gathering = page.locator('[data-section="gathering"]');
    await expect(gathering).toContainText("오후 1시");
    const datetime = await page
      .locator('[data-section="datetime"]')
      .textContent();
    expect(datetime).not.toContain("오후 1시");
  });

  test("CI-03: 원마운트 주소가 venue 섹션에만 있다", async ({ page }) => {
    const venue = page.locator('[data-section="venue"]');
    await expect(venue).toContainText("경기 고양시 일산서구 한류월드로 300");
    const gathering = await page
      .locator('[data-section="gathering"]')
      .textContent();
    expect(gathering).not.toContain("한류월드로");
  });

  test("CI-04: 강서구 주소가 gathering 섹션에만 있다", async ({ page }) => {
    const gathering = page.locator('[data-section="gathering"]');
    await expect(gathering).toContainText("서울시 강서구 양천로 62길 41");
    const venue = await page.locator('[data-section="venue"]').textContent();
    expect(venue).not.toContain("강서구");
  });

  test("CI-05: 전화번호가 contact 섹션에만 있다", async ({ page }) => {
    const contact = page.locator('[data-section="contact"]');
    await expect(contact).toContainText("010-9921-3109");
    // Check other sections don't have the phone number
    const otherSections = [
      "hero",
      "greeting",
      "datetime",
      "gathering",
      "venue",
      "supplies",
    ];
    for (const name of otherSections) {
      const text = await page.locator(`[data-section="${name}"]`).textContent();
      expect(text).not.toContain("010-9921-3109");
    }
  });

  test('CI-06: "미끄럼 방지용 양말"이 supplies 섹션에만 있다', async ({
    page,
  }) => {
    const supplies = page.locator('[data-section="supplies"]');
    await expect(supplies).toContainText("미끄럼 방지용 양말");
    const otherSections = [
      "hero",
      "greeting",
      "datetime",
      "gathering",
      "venue",
      "contact",
    ];
    for (const name of otherSections) {
      const text = await page.locator(`[data-section="${name}"]`).textContent();
      expect(text).not.toContain("미끄럼 방지용 양말");
    }
  });

  // --- 정확한 데이터 검증 (SPEC 확정 데이터 기준) ---

  test('CI-07: gathering에 "코오롱오투빌2차 아파트" 텍스트가 포함된다', async ({
    page,
  }) => {
    const section = page.locator('[data-section="gathering"]');
    await expect(section).toContainText("코오롱오투빌2차 아파트");
  });

  test("CI-08: gathering의 지도 링크 href가 정확한 URL이다", async ({
    page,
  }) => {
    const href = await page
      .locator('[data-section="gathering"] a.map-link')
      .getAttribute("href");
    expect(href).toBe(
      "https://map.naver.com/v5/search/서울시 강서구 양천로 62길 41",
    );
  });

  test("CI-09: venue의 지도 링크 href에 원마운트가 포함된다", async ({
    page,
  }) => {
    const href = await page
      .locator('[data-section="venue"] a.map-link')
      .getAttribute("href");
    expect(href).toContain("원마운트");
    expect(href).toBe(
      "https://map.naver.com/v5/search/경기 고양시 일산서구 한류월드로 300 원마운트",
    );
  });

  test('CI-10: 보호자 레이블이 "엄마"이다', async ({ page }) => {
    const contact = page.locator('[data-section="contact"]');
    await expect(contact).toContainText("엄마");
  });

  // --- 페이지 전체 텍스트 무결성 ---

  test("CI-11: 페이지에 lorem ipsum이나 placeholder 텍스트가 없다", async ({
    page,
  }) => {
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText.toLowerCase()).not.toContain("lorem");
    expect(bodyText.toLowerCase()).not.toContain("ipsum");
    expect(bodyText.toLowerCase()).not.toContain("placeholder");
    expect(bodyText).not.toContain("TODO");
    expect(bodyText).not.toContain("FIXME");
  });

  test("CI-12: 페이지에 영어 테스트 텍스트가 없다", async ({ page }) => {
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText.toLowerCase()).not.toContain("lorem");
    expect(bodyText.toLowerCase()).not.toContain("ipsum");
    expect(bodyText.toLowerCase()).not.toContain("sample");
  });

  test('CI-13: gathering 섹션에 "지도에서 보기" 텍스트가 정확히 1개이다', async ({
    page,
  }) => {
    const links = page.locator('[data-section="gathering"] a', {
      hasText: "지도에서 보기",
    });
    await expect(links).toHaveCount(1);
  });

  test('CI-14: venue 섹션에 "지도에서 보기" 텍스트가 정확히 1개이다', async ({
    page,
  }) => {
    const links = page.locator('[data-section="venue"] a', {
      hasText: "지도에서 보기",
    });
    await expect(links).toHaveCount(1);
  });

  test("CI-15: 페이지 전체에서 tel: 링크가 정확히 1개이다", async ({
    page,
  }) => {
    const telLinks = page.locator('a[href^="tel:"]');
    await expect(telLinks).toHaveCount(1);
  });

  // --- OG 메타태그 정확성 ---

  test('CI-16: og:title이 "이지호의 생일 파티에 초대합니다!"와 정확히 일치한다', async ({
    page,
  }) => {
    const content = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(content).toBe("이지호의 생일 파티에 초대합니다!");
  });

  test("CI-17: og:description이 정확한 값과 일치한다", async ({ page }) => {
    const content = await page
      .locator('meta[property="og:description"]')
      .getAttribute("content");
    expect(content).toBe("4월 11일(금) 오후 2시, 원마운트에서 만나요!");
  });

  test('CI-18: hero 제목에 "이지호"가 포함된다', async ({ page }) => {
    const title = page.locator(".hero-title");
    await expect(title).toContainText("이지호");
  });

  test("CI-19: hero 이미지 alt에 초대장 관련 텍스트가 있다", async ({
    page,
  }) => {
    const alt = await page
      .locator('[data-section="hero"] img')
      .getAttribute("alt");
    expect(alt).toContain("이지호");
  });

  test('CI-20: 페이지 title에 "초대"가 포함된다', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("초대");
  });
});
