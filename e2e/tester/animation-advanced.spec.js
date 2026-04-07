import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

test.describe("Animation Advanced: 애니메이션 심화 검증", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // --- 초기 상태 검증 ---

  test("ANIM-01: 초기 로드 시 뷰포트 밖 섹션의 opacity가 0이다", async ({
    page,
  }) => {
    // Check sections that are below the fold
    const opacities = await page.locator("[data-section]").evaluateAll((els) =>
      els.map((el) => ({
        section: el.dataset.section,
        opacity: getComputedStyle(el).opacity,
        inViewport: el.getBoundingClientRect().top < window.innerHeight,
      })),
    );
    const belowFold = opacities.filter(
      (o) => !o.inViewport && o.section !== "hero",
    );
    belowFold.forEach((o) => expect(o.opacity).toBe("0"));
  });

  test("ANIM-02: hero 섹션은 visible 클래스가 초기에 있다", async ({
    page,
  }) => {
    const hasVisible = await page
      .locator('[data-section="hero"]')
      .evaluate((el) => el.classList.contains("visible"));
    expect(hasVisible).toBe(true);
  });

  test("ANIM-03: hero가 아닌 뷰포트 밖 섹션은 초기에 visible 클래스가 없다", async ({
    page,
  }) => {
    const states = await page.locator("[data-section]").evaluateAll((els) =>
      els.map((el) => ({
        section: el.dataset.section,
        hasVisible: el.classList.contains("visible"),
        inViewport: el.getBoundingClientRect().top < window.innerHeight,
      })),
    );
    const belowFold = states.filter(
      (s) => !s.inViewport && s.section !== "hero",
    );
    belowFold.forEach((s) => expect(s.hasVisible).toBe(false));
  });

  // --- 스크롤 트리거 검증 ---

  test("ANIM-04: 스크롤하면 섹션에 visible 클래스가 추가된다", async ({
    page,
  }) => {
    // greeting should be visible after small scroll
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    const hasVisible = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => el.classList.contains("visible"));
    expect(hasVisible).toBe(true);
  });

  test("ANIM-05: 한번 visible이 된 섹션은 스크롤 백 해도 visible 유지", async ({
    page,
  }) => {
    // Scroll down to trigger
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const hasVisible = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => el.classList.contains("visible"));
    expect(hasVisible).toBe(true);
  });

  // --- CSS transition 속성 검증 ---

  test("ANIM-06: section의 transition에 opacity가 포함된다", async ({
    page,
  }) => {
    const transition = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transition).toContain("opacity");
  });

  test("ANIM-07: section의 transition에 transform이 포함된다", async ({
    page,
  }) => {
    const transition = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transition).toContain("transform");
  });

  test("ANIM-08: 초기 translateY가 20px이다 (아래에서 위로 올라오는 효과)", async ({
    page,
  }) => {
    const css = readFileSync(
      resolve(import.meta.dirname, "..", "..", "src", "style.css"),
      "utf-8",
    );
    expect(css).toContain("translateY(20px)");
  });

  // --- reduced-motion 심화 ---

  test("ANIM-09: reduced-motion 시 transition이 none이다", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const transition = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(transition).toBe("0s");
  });

  test("ANIM-10: reduced-motion 시 transform이 none이다", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const transform = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toBe("none");
  });

  // --- IntersectionObserver 설정 검증 ---

  test("ANIM-11: main.js에 threshold 설정이 있다", async () => {
    const mainJs = readFileSync(
      resolve(import.meta.dirname, "..", "..", "src", "main.js"),
      "utf-8",
    );
    expect(mainJs).toContain("threshold");
  });

  test("ANIM-12: main.js에 DOMContentLoaded 이벤트 리스너가 있다", async () => {
    const mainJs = readFileSync(
      resolve(import.meta.dirname, "..", "..", "src", "main.js"),
      "utf-8",
    );
    expect(mainJs).toContain("DOMContentLoaded");
  });

  test("ANIM-13: main.js에 unobserve가 있다 (한 번만 애니메이션)", async () => {
    const mainJs = readFileSync(
      resolve(import.meta.dirname, "..", "..", "src", "main.js"),
      "utf-8",
    );
    expect(mainJs).toContain("unobserve");
  });

  test("ANIM-14: IntersectionObserver 미지원 시 모든 섹션에 visible 클래스 추가", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      delete window.IntersectionObserver;
    });
    await page.goto("/");
    const allVisible = await page
      .locator("[data-section]")
      .evaluateAll((els) =>
        els.every((el) => el.classList.contains("visible")),
      );
    expect(allVisible).toBe(true);
  });

  test("ANIM-15: transition timing function이 ease이다", async ({ page }) => {
    const timing = await page
      .locator('[data-section="greeting"]')
      .evaluate((el) => getComputedStyle(el).transitionTimingFunction);
    // Multiple transition properties produce comma-separated values
    const timings = timing.split(",").map((t) => t.trim());
    timings.forEach((t) => expect(t).toBe("ease"));
  });
});
