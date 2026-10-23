import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const review = ".impeccable/review";

test("opening, guide dialogue, map navigation and once-per-session audio", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.audioCalls = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const item = { muted: this.muted, ok: false };
      window.audioCalls.push(item);
      return play.call(this).then(() => {
        item.ok = true;
      });
    };
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#hero-name")).toBeVisible();
  await expect(page.locator(".adventure-hero")).toHaveAttribute(
    "data-pose",
    "sit",
  );
  await page
    .getByRole("button", { name: "Talk to your adventure guide" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Your adventure guide" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Your adventure guide" }),
  ).toBeHidden();
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.locator("#world-map a")).toHaveCount(9);
  await page.keyboard.press("Escape");
  await expect(page.locator(".map-toggle")).toBeFocused();
  await mkdir(review, { recursive: true });
  await page.screenshot({ path: `${review}/desktop.png` });
  await page.getByRole("button", { name: "Sound off" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.audioCalls.some((c) => c.muted && c.ok)),
    )
    .toBe(true);
  await page.mouse.wheel(0, 140);
  await expect(page.locator(".hero-intro-bubble")).toContainText(
    "Ah shit, here we go again.",
  );
  await expect
    .poll(() =>
      page.evaluate(() => window.audioCalls.some((c) => !c.muted && c.ok)),
    )
    .toBe(true);
  await expect(page.locator(".adventure-hero")).toHaveAttribute(
    "data-pose",
    "sit",
  );
  await expect(page.locator(".adventure-hero")).toHaveAttribute(
    "data-pose",
    "jump",
    { timeout: 5000 },
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, 150);
  await expect
    .poll(() =>
      page.evaluate(() => window.audioCalls.filter((c) => !c.muted).length),
    )
    .toBe(1);
  await expect(page.locator(".project-links a")).toHaveCount(7);
  expect(errors).toEqual([]);
});

test("seven terrain scenes render and town residents respond", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const id of [
    "orbit",
    "voxlink",
    "github-widgets",
    "inkora",
    "docutype",
    "stikr",
    "black-jack",
  ]) {
    const section = page.locator(`#project-${id}`);
    await section.evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "start" }),
    );
    await expect(section.locator(".terrain-scene")).toHaveAttribute(
      "data-fallback",
      "false",
    );
    await page
      .locator(".hero-intro-bubble")
      .waitFor({ state: "hidden", timeout: 6000 });
    await page.waitForTimeout(180);
    await page.screenshot({ path: `${review}/desktop-${id}.png` });
  }
  await page
    .locator("#town")
    .evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
  await expect(page.locator(".town-couple")).toBeVisible();
  const gardener = page.getByRole("button", {
    name: "Talk to the gardener",
    exact: true,
  });
  await gardener.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".town-live")).toHaveText(
    "Careful! Those are my seedlings.",
  );
  await page.keyboard.press("Enter");
  await expect(page.locator(".town-live")).toContainText("watering can");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", {
      name: "Talk to the hero and his companion",
      exact: true,
    })
    .click();
  await expect(page.locator(".town-couple")).toHaveAttribute(
    "data-staring",
    "true",
  );
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await page.screenshot({ path: `${review}/desktop-town.png` });
  await page.keyboard.press("Escape");
  await expect(page.locator(".town-couple")).toHaveAttribute(
    "data-staring",
    "false",
  );
  expect(errors).toEqual([]);
});

test("mobile layout, contact, and village stay usable without horizontal page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${review}/mobile.png` });
  for (const id of [
    "project-orbit",
    "project-github-widgets",
    "project-docutype",
    "contact",
    "town",
  ]) {
    await page
      .locator(`#${id}`)
      .evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    if (id.startsWith("project-")) {
      await expect(page.locator(`#${id} .terrain-scene`)).toHaveAttribute(
        "data-fallback",
        "false",
      );
      await expect(page.locator(`#${id} canvas`)).toBeVisible();
    }
    await page
      .locator(".hero-intro-bubble")
      .waitFor({ state: "hidden", timeout: 6000 });
    await page.waitForTimeout(id === "town" ? 1000 : 300);
    await page.screenshot({ path: `${review}/mobile-${id}.png` });
  }
  await expect(page.locator(".town-couple__hero")).toBeInViewport();
  await page
    .getByRole("button", {
      name: "Talk to the hero and his companion",
      exact: true,
    })
    .click();
  await expect(page.locator(".town-couple")).toHaveAttribute(
    "data-staring",
    "true",
  );
  await page
    .locator("#contact")
    .evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
  await expect(page.locator(".email-link")).toHaveAttribute(
    "href",
    "mailto:abhishek.a2534@gmail.com",
  );
});

test("reduced motion and unavailable WebGL preserve content and navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (
        kind === "webgl" ||
        kind === "webgl2" ||
        kind === "experimental-webgl"
      )
        return null;
      return get.call(this, kind, ...args);
    };
  });
  await page.goto("/#project-orbit");
  await expect(page.locator(".adventure-hero-layer")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  const section = page.locator("#project-orbit");
  await section.evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
  await expect(section.locator(".terrain-scene")).toHaveAttribute(
    "data-fallback",
    "true",
  );
  await expect(section.locator(".terrain-scene__fallback")).toBeVisible();
  await expect(
    section.getByRole("link", { name: "Explore the source" }),
  ).toBeVisible();
  await page.screenshot({ path: `${review}/reduced-motion-fallback.png` });
});
