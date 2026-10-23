import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { PROJECTS } from '../src/data/projects.js';
import { END_X, START_X, projectProgress } from '../src/pixel/route.js';

const review = '.impeccable/review';
const canvas = (page) => page.locator('.pixel-scene > canvas');
const progress = (page) => page.getByRole('progressbar', { name: 'Journey progress' });
const mapButton = (page) => page.getByRole('button', { name: 'Map', exact: true });
const mapDialog = (page) => page.getByRole('dialog', { name: 'The expedition', exact: true });
const speech = (page) => page.locator('.exp-speech');
const number = async (page, key) => Number(await canvas(page).getAttribute(`data-${key}`));
const browserErrors = new WeakMap();

// Observe native media elements without replacing play(), loading, or decoding.
test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /Pixel world failed/.test(message.text()) &&
        !test.info().title.includes('unavailable WebGL')) errors.push(message.text());
  });
  await page.addInitScript(() => {
    window.__pixelAudio = [];
    window.__pixelPlayResults = [];
    const nativePlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      const result = { src: this.src, state: 'pending', at: performance.now() };
      window.__pixelPlayResults.push(result);
      return nativePlay.apply(this, args).then((value) => {
        result.state = 'fulfilled';
        result.resolvedAt = performance.now();
        return value;
      }, (error) => {
        result.state = 'rejected';
        result.error = { name: error.name, message: error.message };
        throw error;
      });
    };
    const NativeAudio = window.Audio;
    window.Audio = function (...args) {
      const audio = new NativeAudio(...args);
      window.__pixelAudio.push(audio);
      return audio;
    };
    window.Audio.prototype = NativeAudio.prototype;
  });
});

test.afterEach(async ({ page }) => {
  if (!page.isClosed()) {
    const audio = await page.evaluate(() => ({
      plays: window.__pixelPlayResults,
      media: window.__pixelAudio.map((element) => ({
        src: element.src, currentTime: element.currentTime, readyState: element.readyState,
        paused: element.paused, error: element.error && { code: element.error.code, message: element.error.message },
      })),
      notice: document.querySelector('.exp-notice')?.textContent,
    }));
    await test.info().attach('native-audio-state', { body: JSON.stringify(audio, null, 2), contentType: 'application/json' });
    await mkdir(review, { recursive: true });
    await writeFile(`${review}/pixel-audio-${test.info().line}.json`, `${JSON.stringify(audio, null, 2)}\n`);
  }
  expect(browserErrors.get(page), 'uncaught browser and pixel initialization errors').toEqual([]);
});

async function assetsReady(page) {
  await expect(canvas(page)).toHaveAttribute('data-assets-ready', 'true', { timeout: 60000 });
  await expect(canvas(page)).toHaveAttribute('data-assets-state', 'loaded');
  await expect(canvas(page)).toHaveAttribute('data-world', /^(trail|town)$/);
  await expect(page.getByRole('heading', { name: 'The scenic route is unavailable.', exact: true })).toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
}

async function openPixel(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ABHISHEK', exact: true })).toBeVisible();
  await assetsReady(page);
}

async function quietStart(page) {
  await page.getByRole('button', { name: 'Explore quietly', exact: true }).click();
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('main')).toHaveClass(/is-exploring/);
  // The opening itself jumps on entry. Let it land before testing a deliberate jump.
  await expect(page.locator('.exp-opening')).toBeHidden();
  await expect(canvas(page)).toHaveAttribute('data-jump-height', '0.000', { timeout: 15000 });
  await page.evaluate(() => document.activeElement?.blur());
}

async function closeSpeech(page) {
  if (await speech(page).isVisible()) {
    await page.getByRole('button', { name: 'Close conversation', exact: true }).click();
  }
}

async function capture(page, name) {
  await assetsReady(page);
  await mkdir(review, { recursive: true });
  await page.screenshot({ path: `${review}/pixel-${name}.png` });
  const context = await canvas(page).evaluate((element) => ({
    url: location.href,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    scene: { ...element.dataset },
    plays: window.__pixelPlayResults,
    media: window.__pixelAudio.map((audio) => ({
      src: audio.currentSrc || audio.src, currentTime: audio.currentTime,
      readyState: audio.readyState, paused: audio.paused, volume: audio.volume,
      error: audio.error?.code ?? null,
    })),
  }));
  await writeFile(`${review}/pixel-${name}.json`, `${JSON.stringify(context, null, 2)}\n`);
  await test.info().attach(`pixel-${name}-capture-context`, {
    body: JSON.stringify(context, null, 2), contentType: 'application/json',
  });
}

async function openMap(page) {
  await mapButton(page).click();
  await expect(mapDialog(page)).toBeVisible();
  await expect(mapDialog(page).getByRole('navigation', { name: 'Project destinations' }).getByRole('button')).toHaveCount(7);
}

async function travelTo(page, index) {
  await openMap(page);
  await mapDialog(page).getByRole('button', {
    name: new RegExp(`^Travel to ${PROJECTS[index].name},`),
  }).click();
  await expect(mapDialog(page)).toBeHidden();
  await expect(page.getByRole('heading', { name: PROJECTS[index].name, exact: true })).toBeVisible();
  await expect(canvas(page)).toHaveAttribute('data-chapter', String(index));
  await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(index * 120 + 60, 2);
  await expect(progress(page)).toHaveAttribute('aria-valuenow', String(Math.round(projectProgress(index) * 100)));
}

async function finalCave(page) {
  await openMap(page);
  await mapDialog(page).getByRole('button', { name: 'Travel to the final cave', exact: true }).click();
  await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(END_X, 2);
  await page.getByRole('button', { name: 'Enter the cave', exact: true }).click();
  await expect(canvas(page)).toHaveAttribute('data-world', 'town');
  await expect(canvas(page)).toHaveAttribute('data-town-arrived', 'true', { timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Abhishek World', exact: true })).toBeVisible();
}

async function point(page, attribute, predicate) {
  let selected;
  await expect.poll(async () => {
    const points = JSON.parse(await canvas(page).getAttribute(`data-${attribute}`) || '[]');
    selected = points.find(predicate);
    return Boolean(selected?.visible && selected.x > 0 && selected.x < 1 && selected.y > 0 && selected.y < 1);
  }, { message: `visible normalized ${attribute} target`, timeout: 20000 }).toBe(true);
  const rect = await canvas(page).boundingBox();
  return { x: rect.x + selected.x * rect.width, y: rect.y + selected.y * rect.height };
}

async function centeredOpening(page) {
  for (const selector of ['.exp-portrait', '.exp-portrait img', '[data-stone-name]']) {
    const rect = await page.locator(selector).boundingBox();
    expect(rect, `${selector} has rendered geometry`).not.toBeNull();
    expect(Math.abs(rect.x + rect.width / 2 - page.viewportSize().width / 2), `${selector} is centered`).toBeLessThan(12);
  }
  const name = await page.locator('[data-stone-name]').boundingBox();
  const hero = await page.locator('.opening-pixel-hero').boundingBox();
  expect(hero.y).toBeLessThan(name.y);
  expect(hero.y + hero.height).toBeGreaterThan(name.y - 30);
  await expect(page.locator('.exp-portrait img')).toHaveJSProperty('naturalWidth', 1254);
}

async function blockedAt(page, id, x) {
  await expect(canvas(page)).toHaveAttribute('data-blocked', id, { timeout: 30000 });
  await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(x, 2);
  await page.waitForTimeout(300);
  expect(await number(page, 'hero-x'), `${id} keeps travel intent blocked`).toBeCloseTo(x, 2);
}

async function expectPlayback(page, fragment) {
  await expect.poll(() => page.evaluate((part) =>
    window.__pixelAudio.some((audio) => audio.src.includes(part) && audio.readyState >= 2 &&
      !audio.paused && !audio.error && audio.currentTime > 0.03), fragment), {
    message: `native decoded playback: ${fragment}`, timeout: 15000,
  }).toBe(true);
}

test('opening is centered, scroll launches the hero, and audio is opt-in', async ({ page }) => {
  test.setTimeout(120000);
  await openPixel(page);
  await centeredOpening(page);
  expect(await page.evaluate(() => window.__pixelAudio.some((audio) => !audio.paused))).toBe(false);
  await capture(page, 'opening');
  await page.mouse.move(1050, 420);
  await page.mouse.wheel(0, 130);
  await expect(page.locator('main')).toHaveClass(/is-exploring/);
  await expect.poll(() => number(page, 'jump-height')).toBeGreaterThan(1);
  await expect(canvas(page)).toHaveAttribute('data-pose', 'jump');
  await expect.poll(() => number(page, 'hero-x')).toBeGreaterThan(START_X + 5);
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByRole('button', { name: 'Sound off', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Sound off', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expectPlayback(page, 'ambient-mountain.mp3');
  await page.getByRole('button', { name: 'Sound on', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__pixelAudio.every((audio) => audio.paused))).toBe(true);
});

test('Space and held Shift release actual obstacles in both travel directions', async ({ page }) => {
  test.setTimeout(180000);
  await openPixel(page);
  await quietStart(page);
  await page.mouse.move(1100, 430);
  await page.mouse.wheel(0, 1300); // target x=93.4, beyond both first-terrain obstacles
  await blockedAt(page, '0-jump', 30.2);
  await capture(page, 'obstacle-jump');
  await page.keyboard.press('Space');
  await expect.poll(() => number(page, 'jump-height')).toBeGreaterThan(1);
  await expect(canvas(page)).toHaveAttribute('data-pose', 'jump');
  await expect.poll(() => number(page, 'hero-x')).toBeGreaterThan(35.8);
  await blockedAt(page, '0-crouch', 86.2);
  await page.keyboard.down('Shift');
  await expect(canvas(page)).toHaveAttribute('data-crouching', 'true');
  await expect(canvas(page)).toHaveAttribute('data-pose', 'crouch');
  await expect.poll(() => number(page, 'hero-x')).toBeGreaterThan(91.8);
  await capture(page, 'obstacle-crouch');
  await page.keyboard.up('Shift');
  await expect(canvas(page)).toHaveAttribute('data-crouching', 'false');
  await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(93.4, 1);
  await page.mouse.wheel(0, -1300);
  await blockedAt(page, '0-crouch', 91.8);
  await page.keyboard.down('Shift');
  await expect.poll(() => number(page, 'hero-x')).toBeLessThan(86.2);
  await page.keyboard.up('Shift');
  await blockedAt(page, '0-jump', 35.8);
  await page.keyboard.press('Space');
  await expect.poll(() => number(page, 'hero-x')).toBeLessThan(30.2);
  await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(START_X, 2);
  await expect(canvas(page)).toHaveAttribute('data-blocked', '');
});

test('all seven map destinations welcome, expose sources, and render their travel states', async ({ page }) => {
  test.setTimeout(300000);
  await openPixel(page);
  await quietStart(page);
  for (const [index, project] of PROJECTS.entries()) {
    await travelTo(page, index); // Map selection is intentional direct travel, bypassing obstacles.
    await expect(speech(page)).toContainText(`Welcome to ${project.name}!`);
    await expect(canvas(page)).toHaveAttribute('data-vehicle', index === 3 ? 'truck' : index === 4 ? 'boat' : 'walk');
    await expect(canvas(page)).toHaveAttribute('data-torch', String(index === 1));
    if (index === 3 || index === 4) await expect(canvas(page)).toHaveAttribute('data-pose', 'sit');
    await closeSpeech(page);
    await page.waitForTimeout(700); // let the following camera settle before rendered evidence
    await capture(page, project.terrain);
    const marker = await point(page, 'project-points', (entry) => entry.index === index);
    await page.mouse.move(marker.x, marker.y);
    await expect.poll(async () => {
      const entries = JSON.parse(await canvas(page).getAttribute('data-project-points'));
      const entry = entries.find((item) => item.index === index);
      return entry.height - entry.restHeight;
    }).toBeGreaterThan(2);
    await page.mouse.move(10, 75);
    await expect.poll(async () => {
      const entries = JSON.parse(await canvas(page).getAttribute('data-project-points'));
      const entry = entries.find((item) => item.index === index);
      return Math.abs(entry.height - entry.restHeight);
    }).toBeLessThan(0.05);
    const resetMarker = await point(page, 'project-points', (entry) => entry.index === index);
    await page.mouse.click(resetMarker.x, resetMarker.y);
    const details = page.getByRole('dialog', { name: project.name, exact: true });
    await expect(details).toBeVisible();
    await expect(details).toContainText(project.description);
    for (const technology of project.tech) {
      await expect(details.getByRole('listitem').filter({ hasText: technology })).toBeVisible();
    }
    await expect(details.getByRole('link', { name: /Explore the source/ })).toHaveAttribute('href', project.github);
    await page.keyboard.press('Escape');
    await expect(details).toBeHidden();
  }
  await openMap(page);
  await expect(mapDialog(page).getByRole('button', { name: /^Travel to Black Jack,/ })).toHaveAttribute('aria-current', 'location');
  await capture(page, 'map');
  await page.keyboard.press('Escape');
  await expect(mapDialog(page)).toBeHidden();
  await expect(mapButton(page)).toBeFocused();
});

test('town workers react, the couple touches hands and looks over, and the cave returns', async ({ page }) => {
  test.setTimeout(180000);
  await openPixel(page);
  await quietStart(page);
  await finalCave(page);
  await expect(canvas(page)).toHaveAttribute('data-hand-holding', 'true');
  expect(await number(page, 'hand-distance'), 'sprite hand edges meet in world units').toBeLessThan(0.02);
  await capture(page, 'town');
  await page.getByText('People nearby', { exact: true }).click();
  await page.getByRole('button', { name: 'Talk to Gardener Lua', exact: true }).click();
  await expect(speech(page)).toContainText('Gardener Lua');
  await expect(speech(page)).toContainText('Hey! Watch the seedlings. I’m working here!');
  await closeSpeech(page);
  await page.getByText('People nearby', { exact: true }).click();
  const girl = await point(page, 'npc-points', (entry) => entry.id === 'town-girl');
  await page.mouse.click(girl.x, girl.y);
  await expect(canvas(page)).toHaveAttribute('data-staring', 'true');
  await expect(canvas(page)).toHaveAttribute('data-pose', 'hold-stare');
  await expect(canvas(page)).toHaveAttribute('data-hand-holding', 'true');
  await expect(speech(page)).toContainText('Lina');
  await capture(page, 'couple-desktop');
  await closeSpeech(page);
  await expect(canvas(page)).toHaveAttribute('data-staring', 'false', { timeout: 15000 });
  await expect(canvas(page)).toHaveAttribute('data-pose', 'hold');
  await page.getByRole('button', { name: 'Return through the cave', exact: true }).click();
  await expect(canvas(page)).toHaveAttribute('data-world', 'trail');
  await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(END_X, 2);
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '100');
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('touch swipe, jump, held crouch, assisted travel, and town work on a phone', async ({ page }) => {
    test.setTimeout(240000);
    await openPixel(page);
    await centeredOpening(page);
    await capture(page, 'mobile-opening');
    await quietStart(page);
    const cdp = await page.context().newCDPSession(page);
    // Real touch input, through the same browser events used by a finger.
    const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', {
      type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }],
    });
    await touch('touchStart', 300, 520);
    await touch('touchMove', 300, 310);
    await touch('touchEnd');
    await blockedAt(page, '0-jump', 30.2);
    const jump = await page.getByRole('button', { name: 'Jump', exact: true }).boundingBox();
    await page.touchscreen.tap(jump.x + jump.width / 2, jump.y + jump.height / 2);
    await expect.poll(() => number(page, 'jump-height')).toBeGreaterThan(1);
    await expect.poll(() => number(page, 'hero-x')).toBeGreaterThan(35.8);
    await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(START_X + 210 / 5500 * (END_X - START_X), 1);
    await touch('touchStart', 300, 550);
    await touch('touchMove', 300, 150);
    await touch('touchEnd');
    await blockedAt(page, '0-crouch', 86.2);
    const crouch = await page.getByRole('button', { name: 'Crouch', exact: true }).boundingBox();
    await touch('touchStart', crouch.x + crouch.width / 2, crouch.y + crouch.height / 2);
    await expect(canvas(page)).toHaveAttribute('data-crouching', 'true');
    await expect.poll(() => number(page, 'hero-x')).toBeGreaterThan(91.8);
    await touch('touchEnd');
    await expect(canvas(page)).toHaveAttribute('data-crouching', 'false');
    await page.getByRole('button', { name: 'Assisted travel off', exact: true }).tap();
    await expect(page.getByRole('button', { name: 'Assisted travel on', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await touch('touchStart', 300, 550);
    await touch('touchMove', 300, 150);
    await touch('touchEnd');
    await expect.poll(() => number(page, 'hero-x'), { timeout: 20000 }).toBeGreaterThan(155.8);
    await expect(canvas(page)).toHaveAttribute('data-blocked', '');
    await travelTo(page, 2);
    await closeSpeech(page);
    await capture(page, 'mobile-world');
    await finalCave(page);
    await expect(canvas(page)).toHaveAttribute('data-hand-holding', 'true');
    expect(await number(page, 'hand-distance')).toBeLessThan(0.02);
    await capture(page, 'mobile-town');
    await page.getByRole('button', { name: 'Return through the cave', exact: true }).tap();
    await expect(canvas(page)).toHaveAttribute('data-world', 'trail');
    await cdp.detach();
  });
});

test('reduced motion bypasses obstacle timing and keeps map and keyboard travel usable', async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openPixel(page);
  await expect(canvas(page)).toHaveAttribute('data-reduced-motion', 'true');
  await quietStart(page);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(32.35, 2); // crosses the x=30.2 collision edge
  await expect(canvas(page)).toHaveAttribute('data-blocked', '');
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect.poll(() => number(page, 'hero-x')).toBeCloseTo(113.75, 2); // also crosses the low branch
  await expect(canvas(page)).toHaveAttribute('data-blocked', '');
  await travelTo(page, 4);
  await expect(canvas(page)).toHaveAttribute('data-vehicle', 'boat');
  await finalCave(page);
  await expect(canvas(page)).toHaveAttribute('data-hand-holding', 'true');
});

test('unavailable WebGL preserves all project sources, direct map travel, and contact', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(kind)) return null;
      return original.call(this, kind, ...args);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The scenic route is unavailable.', exact: true })).toBeVisible();
  await expect(canvas(page)).toHaveCount(0);
  for (const project of PROJECTS) {
    await page.getByRole('button', { name: `${project.name} →`, exact: true }).click();
    const details = page.getByRole('dialog', { name: project.name, exact: true });
    await expect(details).toContainText(project.description);
    await expect(details.getByRole('link', { name: /Explore the source/ })).toHaveAttribute('href', project.github);
    await details.getByRole('button', { name: 'Close details', exact: true }).click();
  }
  await openMap(page);
  await mapDialog(page).getByRole('button', { name: /^Travel to DocuType,/ }).click();
  await expect(mapDialog(page)).toBeHidden();
  await expect(page.getByRole('heading', { name: 'DocuType', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Contact', exact: true }).click();
  const contact = page.getByRole('dialog', { name: 'Let’s make something.', exact: true });
  await expect(contact.getByRole('link', { name: 'abhishek.a2534@gmail.com', exact: true })).toHaveAttribute('href', 'mailto:abhishek.a2534@gmail.com');
  await expect(contact.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/mrduhlol');
  await page.keyboard.press('Escape');
  await expect(contact).toBeHidden();
});
