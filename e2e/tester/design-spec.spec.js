import { test, expect } from "@playwright/test";

test.describe("Design Spec: 디자인 명세 검증", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // --- 색상 검증 ---

  test("DS-01: body 배경색이 #FEF9F4이다", async ({ page }) => {
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    // rgb(254, 249, 244) = #FEF9F4
    expect(bg).toBe("rgb(254, 249, 244)");
  });

  test("DS-02: greeting 섹션 배경색이 #FFF5F5이다", async ({ page }) => {
    const bg = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    // rgb(255, 245, 245) = #FFF5F5
    expect(bg).toBe("rgb(255, 245, 245)");
  });

  test("DS-03: datetime 섹션 배경색이 #F0F4FF이다", async ({ page }) => {
    const bg = await page
      .locator('[data-section="datetime"]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    // rgb(240, 244, 255) = #F0F4FF
    expect(bg).toBe("rgb(240, 244, 255)");
  });

  test("DS-04: 섹션 배경이 교차 패턴이다 (A-B-A-B)", async ({ page }) => {
    const backgrounds = await page
      .locator("[data-section]")
      .evaluateAll((els) =>
        els.map((el) => ({
          section: el.dataset.section,
          bg: getComputedStyle(el).backgroundColor,
        })),
      );
    // greeting, gathering, supplies = #FFF5F5
    // datetime, venue, contact = #F0F4FF
    const pinkSections = backgrounds.filter(
      (b) =>
        b.section === "greeting" ||
        b.section === "gathering" ||
        b.section === "supplies",
    );
    const blueSections = backgrounds.filter(
      (b) =>
        b.section === "datetime" ||
        b.section === "venue" ||
        b.section === "contact",
    );
    const pinkBg = pinkSections[0].bg;
    const blueBg = blueSections[0].bg;
    pinkSections.forEach((s) => expect(s.bg).toBe(pinkBg));
    blueSections.forEach((s) => expect(s.bg).toBe(blueBg));
    expect(pinkBg).not.toBe(blueBg);
  });

  test("DS-05: 본문 텍스트 색상이 #2D2D2D이다", async ({ page }) => {
    const color = await page
      .locator(".body-text")
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    // rgb(45, 45, 45) = #2D2D2D
    expect(color).toBe("rgb(45, 45, 45)");
  });

  test("DS-06: 보조 텍스트(주소) 색상이 #6B6B6B이다", async ({ page }) => {
    const color = await page
      .locator(".address")
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    // rgb(107, 107, 107) = #6B6B6B
    expect(color).toBe("rgb(107, 107, 107)");
  });

  test("DS-07: tel 버튼 배경색이 #E8927C이다", async ({ page }) => {
    const bg = await page
      .locator(".tel-button")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    // rgb(232, 146, 124) = #E8927C
    expect(bg).toBe("rgb(232, 146, 124)");
  });

  // --- 타이포그래피 검증 ---

  test("DS-08: hero 제목의 font-size가 32px이다", async ({ page }) => {
    const fontSize = await page
      .locator(".hero-title")
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(fontSize).toBe("32px");
  });

  test("DS-09: hero 제목의 font-weight가 700이다", async ({ page }) => {
    const fontWeight = await page
      .locator(".hero-title")
      .evaluate((el) => getComputedStyle(el).fontWeight);
    expect(fontWeight).toBe("700");
  });

  test("DS-10: section 제목의 font-size가 24px이다", async ({ page }) => {
    const fontSize = await page
      .locator(".section-title")
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(fontSize).toBe("24px");
  });

  test("DS-11: section 제목의 font-weight가 700이다", async ({ page }) => {
    const fontWeight = await page
      .locator(".section-title")
      .first()
      .evaluate((el) => getComputedStyle(el).fontWeight);
    expect(fontWeight).toBe("700");
  });

  test("DS-12: body-text의 font-size가 16px이다", async ({ page }) => {
    const fontSize = await page
      .locator(".body-text")
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(fontSize).toBe("16px");
  });

  test("DS-13: body-text의 font-weight가 400이다", async ({ page }) => {
    const fontWeight = await page
      .locator(".body-text")
      .first()
      .evaluate((el) => getComputedStyle(el).fontWeight);
    expect(fontWeight).toBe("400");
  });

  test("DS-14: address의 font-size가 14px이다", async ({ page }) => {
    const fontSize = await page
      .locator(".address")
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(fontSize).toBe("14px");
  });

  test("DS-15: address의 font-weight가 400이다", async ({ page }) => {
    const fontWeight = await page
      .locator(".address")
      .first()
      .evaluate((el) => getComputedStyle(el).fontWeight);
    expect(fontWeight).toBe("400");
  });

  // --- 레이아웃 검증 ---

  test("DS-16: 컨테이너 좌우 패딩이 24px이다 (480px 이상 뷰포트)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    const padding = await page.locator(".container").evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        left: style.paddingLeft,
        right: style.paddingRight,
      };
    });
    expect(padding.left).toBe("24px");
    expect(padding.right).toBe("24px");
  });

  test("DS-17: 480px 이하에서 컨테이너 좌우 패딩이 16px이다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const padding = await page.locator(".container").evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        left: style.paddingLeft,
        right: style.paddingRight,
      };
    });
    expect(padding.left).toBe("16px");
    expect(padding.right).toBe("16px");
  });

  test("DS-18: 섹션 카드의 border-radius가 16px이다", async ({ page }) => {
    const radius = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius).toBe("16px");
  });

  test("DS-19: 모든 카드형 섹션에 border-radius 16px이 적용된다", async ({
    page,
  }) => {
    const cardSections = [
      "greeting",
      "datetime",
      "gathering",
      "venue",
      "supplies",
      "contact",
    ];
    for (const name of cardSections) {
      const radius = await page
        .locator(`[data-section="${name}"]`)
        .evaluate((el) => getComputedStyle(el).borderRadius);
      expect(radius).toBe("16px");
    }
  });

  test("DS-20: tel 버튼의 border-radius가 24px이다", async ({ page }) => {
    const radius = await page
      .locator(".tel-button")
      .evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius).toBe("24px");
  });

  test("DS-21: 전화 버튼의 border-radius가 24px이다", async ({ page }) => {
    const radius = await page
      .locator(".tel-button")
      .evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius).toBe("24px");
  });

  test("DS-22: 지도 링크에 text-decoration이 없다 (기본 상태)", async ({
    page,
  }) => {
    const mapDeco = await page
      .locator("a.map-link")
      .first()
      .evaluate((el) => getComputedStyle(el).textDecorationLine);
    const telDeco = await page
      .locator(".tel-button")
      .evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(mapDeco).toBe("none");
    expect(telDeco).toBe("none");
  });

  // --- 폰트 패밀리 ---

  test("DS-23: body의 font-family에 Gowun Dodum이 포함된다", async ({
    page,
  }) => {
    const fontFamily = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    expect(fontFamily).toContain("Gowun Dodum");
  });

  test("DS-24: body의 font-family에 시스템 폴백 폰트가 포함된다", async ({
    page,
  }) => {
    const fontFamily = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    expect(fontFamily).toContain("sans-serif");
  });

  test("DS-25: body-text의 line-height가 1.6이다", async ({ page }) => {
    const lineHeight = await page
      .locator(".body-text")
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const lineHeight = parseFloat(style.lineHeight);
        return lineHeight / fontSize;
      });
    expect(lineHeight).toBeCloseTo(1.6, 1);
  });
});
