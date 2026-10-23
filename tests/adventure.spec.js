import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { PROJECTS } from '../src/data/projects.js';
import { projectProgress, routeAt } from '../src/expedition/route.js';

const review = '.impeccable/review';
const scene = page => page.locator('.expedition-scene');
const canvas = page => scene(page).locator('canvas');
const progress = page => page.getByRole('progressbar', { name: 'Journey progress' });
const mapButton = page => page.getByRole('button', { name: 'Map', exact: true });
const mapDialog = page => page.getByRole('dialog', { name: 'The expedition', exact: true });
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function recordErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (/Expedition .+ fallback:/.test(message.text())) errors.push(message.text());
  });
  return errors;
}

async function openExpedition(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ABHISHEK', exact: true })).toBeVisible();
  await expect(canvas(page)).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
}

async function assetsReady(page) {
  await expect(canvas(page)).toHaveAttribute('data-assets-ready', 'true', { timeout: 60000 });
  await expect(canvas(page)).toHaveAttribute('data-assets-state', 'loaded');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  });
}

async function capture(page, name) {
  await assetsReady(page);
  await expect(page.getByRole('status').filter({ hasText: 'Ah shit, here we go again.' })).toHaveCount(0, { timeout: 7000 });
  await mkdir(review, { recursive: true });
  await page.screenshot({ path: `${review}/expedition-${name}.png` });
  const context = await canvas(page).evaluate(element => ({
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    viewport: { width: innerWidth, height: innerHeight },
    scene: { ...element.dataset },
  }));
  await test.info().attach(`expedition-${name}-capture-context`, {
    body: JSON.stringify(context, null, 2), contentType: 'application/json',
  });
}

async function travelTo(page, index) {
  await mapButton(page).click();
  await expect(mapDialog(page)).toBeVisible();
  await mapDialog(page).getByRole('button', {
    name: new RegExp(`^Travel to ${escape(PROJECTS[index].name)},`),
  }).click();
  await expect(mapDialog(page)).toBeHidden();
  await expect(page.getByRole('heading', { name: PROJECTS[index].name, exact: true })).toBeVisible();
  await expect(progress(page)).toHaveAttribute('aria-valuenow', String(Math.round(projectProgress(index) * 100)));
  await expect(canvas(page)).toHaveAttribute('data-chapter', String(index), { timeout: 15000 });
  await expect.poll(async () => Math.abs(Number(await canvas(page).getAttribute('data-hero-x')) - routeAt(projectProgress(index)).x),
    { message: 'The guide should arrive at the selected destination', timeout: 15000 }).toBeLessThan(.12);
}


async function verifyLandmarkHover(page, project) {
  const pointForProject = () => canvas(page).evaluate((element, id) =>
    JSON.parse(element.dataset.projectPoints || '[]').find(point => point.id === id), project.id);
  await expect.poll(async () => Boolean((await pointForProject())?.visible), { timeout: 15000 }).toBe(true);
  const resting = await pointForProject();
  await capture(page, `${project.id}-rest`);
  const bounds = await canvas(page).boundingBox();
  await page.mouse.move(bounds.x + resting.x * bounds.width, bounds.y + resting.y * bounds.height);
  await expect.poll(async () => (await pointForProject())?.height ?? resting.restHeight)
    .toBeGreaterThan(resting.restHeight + .1);
  await capture(page, `${project.id}-hover`);
  // Moving onto the header leaves the canvas and must reverse the reveal.
  await mapButton(page).hover();
  await expect.poll(async () => Math.abs((await pointForProject())?.height - resting.restHeight)).toBeLessThan(.02);
  await capture(page, `${project.id}-restored`);
}

async function enterTown(page) {
  await travelTo(page, 6);
  await expect(page.getByRole('button', { name: 'Enter the cave' })).toBeHidden();
  await page.getByRole('button', { name: 'Next terrain' }).click();
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('main')).toHaveAttribute('data-world', 'trail');
  await expect(page.getByRole('heading', { name: 'Abhishek World', exact: true })).toBeHidden();
  // Reaching the end, scrolling farther, and pressing an arrow must never enter the town.
  const stage = await canvas(page).boundingBox();
  await page.mouse.move(stage.x + stage.width * .7, stage.y + stage.height * .5);
  await page.mouse.wheel(0, 2000);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main')).toHaveAttribute('data-world', 'trail');
  await page.getByRole('button', { name: 'Enter the cave', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Abhishek World', exact: true })).toBeVisible();
  await expect(canvas(page)).toHaveAttribute('data-world', 'town');
  // Let the deliberate cave crossing and its fade finish before interacting or capturing.
  await page.waitForTimeout(2000);
}


async function waitForTownArrival(page) {
  // Keep this functional check at normal motion; the runtime signals actual completed simulation.
  await expect(canvas(page)).toHaveAttribute('data-reduced-motion', 'false');
  await expect(canvas(page)).toHaveAttribute('data-town-arrived', 'true', { timeout: 90000 });
}

test('desktop entry opts into real audio, walks with the wheel, and plays the introduction once', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const errors = recordErrors(page);
  await page.addInitScript(() => {
    window.expeditionAudio = [];
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      const call = { src: this.src, muted: this.muted, volume: this.volume, ok: false, element: this };
      window.expeditionAudio.push(call);
      // Record the real browser promise. No fake media success or muted autoplay unlock.
      return original.apply(this, args).then(value => { call.ok = true; return value; }, error => {
        call.error = error.message;
        throw error;
      });
    };
  });
  await openExpedition(page);
  await capture(page, 'opening');
  expect(await page.evaluate(() => window.expeditionAudio.length)).toBe(0);
  await page.getByRole('button', { name: 'Enter with sound', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.expeditionAudio.some(call =>
    call.src.endsWith('/ambient-mountain.mp3') && call.ok && !call.muted && call.volume > 0 && call.element.currentTime > .1,
  ))).toBe(true);
  await expect.poll(() => page.evaluate(() => window.expeditionAudio.filter(call =>
    call.src.endsWith('/here-we-go-again.mp3') && call.ok && !call.muted,
  ).length)).toBe(1);
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '0');
  await page.mouse.move(900, 450);
  await page.mouse.wheel(0, 1300);
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '10');
  await page.mouse.wheel(0, -1300);
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '0');
  await page.mouse.wheel(0, 1300);
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '10');
  await travelTo(page, 1);
  await expect.poll(() => page.evaluate(() => window.expeditionAudio.some(call =>
    call.src.endsWith('/ambient-forest.mp3') && call.ok && call.element.currentTime > .1,
  ))).toBe(true);
  expect(await page.evaluate(() => window.expeditionAudio.filter(call => call.src.endsWith('/here-we-go-again.mp3')).length)).toBe(1);
  await page.getByRole('button', { name: 'Sound on', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sound off', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => page.evaluate(() => window.expeditionAudio.every(call => call.element.paused))).toBe(true);
  const recording = await page.evaluate(() => window.expeditionAudio.map(({ element, ...call }) => ({
    ...call, time: element.currentTime, paused: element.paused, readyState: element.readyState,
  })));
  await testInfo.attach('actual-audio-play-recording', { body: JSON.stringify(recording, null, 2), contentType: 'application/json' });
  expect(recording.filter(call => call.error)).toEqual([]);
  expect(errors).toEqual([]);
});

test('the map reaches all seven real terrains and their sources (reduced-motion review captures)', async ({ page }) => {
  test.setTimeout(180000);
  const errors = recordErrors(page);
  // Deterministic composition captures avoid software-GPU damping delays; normal movement has separate coverage.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openExpedition(page);
  await page.getByRole('button', { name: 'Explore quietly', exact: true }).click();
  for (const [index, project] of PROJECTS.entries()) {
    await travelTo(page, index);
    await capture(page, project.terrain);
    if (project.id === 'inkora') await verifyLandmarkHover(page, project);
    await page.getByRole('button', { name: `Discover ${project.name}`, exact: true }).click();
    const details = page.getByRole('dialog', { name: project.name, exact: true });
    await expect(details).toBeVisible();
    await expect(details).toContainText(project.description);
    for (const technology of project.tech) await expect(details.getByRole('listitem').filter({ hasText: technology })).toBeVisible();
    await expect(details.getByRole('link', { name: 'Explore the source' })).toHaveAttribute('href', project.github);
    await expect(details.getByRole('link', { name: 'Explore the source' })).toHaveAttribute('target', '_blank');
    if (project.live) await expect(details.getByRole('link', { name: 'Explore project' })).toHaveAttribute('href', project.live);
    else await expect(details.getByRole('link', { name: 'Explore project' })).toHaveCount(0);
    const before = await progress(page).getAttribute('aria-valuenow');
    await details.getByRole('heading').hover();
    await page.mouse.wheel(0, 500);
    await expect(progress(page)).toHaveAttribute('aria-valuenow', before);
    await page.keyboard.press('Escape');
    await expect(details).toBeHidden();
  }
  await mapButton(page).click();
  await expect(mapDialog(page).getByRole('navigation', { name: 'Project destinations' }).getByRole('button')).toHaveCount(7);
  await expect(mapDialog(page).getByRole('button', { name: /^Travel to Black Jack,/ })).toHaveAttribute('aria-current', 'location');
  await capture(page, 'map');
  await page.keyboard.press('Escape');
  await expect(mapDialog(page)).toBeHidden();
  await expect(mapButton(page)).toBeFocused();
  expect(errors).toEqual([]);
});

test('the final cave needs a deliberate click; town residents support pointer and keyboard, then return preserves progress', async ({ page }) => {
  test.setTimeout(180000);
  const errors = recordErrors(page);
  await openExpedition(page);
  await page.getByRole('button', { name: 'Explore quietly', exact: true }).click();
  await enterTown(page);
  await waitForTownArrival(page);
  await assetsReady(page);
  // Runtime-projected, raycast-verified targets track camera and moving residents.
  await expect.poll(async () => {
    const points = JSON.parse(await canvas(page).getAttribute('data-npc-points') || '[]');
    return points.some(point => point.id.endsWith('gardener') && point.visible);
  }, { timeout: 45000 }).toBe(true);
  const gardener = await canvas(page).evaluate(element => JSON.parse(element.dataset.npcPoints).find(point => point.id.endsWith('gardener') && point.visible));
  const bounds = await canvas(page).boundingBox();
  await page.mouse.click(bounds.x + gardener.x * bounds.width, bounds.y + gardener.y * bounds.height);
  const speech = page.getByRole('status').filter({ has: page.getByRole('button', { name: 'Close conversation' }) });
  await expect(speech).toContainText(gardener.name);
  await expect(speech.locator('p')).not.toBeEmpty();
  await page.getByRole('button', { name: 'Close conversation' }).click();
  await expect(speech).toBeHidden();
  const people = page.getByText('People nearby', { exact: true });
  await people.focus();
  await page.keyboard.press('Enter');
  const talk = page.getByRole('button', { name: new RegExp(`^Talk to ${escape(gardener.name)}\\b`, 'i') });
  await talk.focus();
  await page.keyboard.press('Enter');
  await expect(speech).toContainText(gardener.name);
  await page.getByRole('button', { name: 'Close conversation' }).click();
  await people.click();
  await capture(page, 'town');
  await page.getByRole('button', { name: 'Return through the cave', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('data-world', 'trail');
  await expect(canvas(page)).toHaveAttribute('data-world', 'trail');
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '100');
  await expect(page.getByRole('button', { name: 'Enter the cave' })).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('quiet entry, touch travel, map, contact and town fit the phone', async ({ page, context }) => {
    test.setTimeout(180000);
    const errors = recordErrors(page);
    const noOverflow = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await openExpedition(page);
    await capture(page, 'mobile-opening');
    await noOverflow();
    await page.getByRole('button', { name: 'Explore quietly', exact: true }).click();
    await expect(progress(page)).toHaveAttribute('aria-valuenow', '0');
    const session = await context.newCDPSession(page);
    const box = await canvas(page).boundingBox();
    const x = box.x + box.width * .55, y = box.y + box.height * .6;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 5; step++) await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{ x, y: y - step * 30 }],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
    await expect.poll(async () => Number(await progress(page).getAttribute('aria-valuenow'))).toBeGreaterThan(0);
    await travelTo(page, 2);
    await capture(page, 'mobile-world');
    await noOverflow();
    await page.getByRole('button', { name: 'Contact', exact: true }).click();
    const contact = page.getByRole('dialog', { name: 'Let’s make something.', exact: true });
    await expect(contact.getByRole('link', { name: 'abhishek.a2534@gmail.com' })).toHaveAttribute('href', 'mailto:abhishek.a2534@gmail.com');
    await noOverflow();
    await contact.getByRole('button', { name: 'Close details' }).click();
    await enterTown(page);
    await waitForTownArrival(page);
    await capture(page, 'mobile-town');
    await noOverflow();
    await page.getByRole('button', { name: 'Return through the cave' }).click();
    await expect(progress(page)).toHaveAttribute('aria-valuenow', '100');
    expect(errors).toEqual([]);
  });
});

test('reduced motion keeps keyboard navigation, immediate scene positioning and project details usable', async ({ page }) => {
  test.setTimeout(90000);
  const errors = recordErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openExpedition(page);
  await assetsReady(page);
  await page.getByRole('button', { name: 'Explore quietly', exact: true }).click();
  await expect(canvas(page)).toHaveAttribute('data-reduced-motion', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '3');
  await expect.poll(async () => Math.abs(Number(await canvas(page).getAttribute('data-hero-x')) - routeAt(.025).x)).toBeLessThan(.01);
  await page.keyboard.press('ArrowLeft');
  await expect(progress(page)).toHaveAttribute('aria-valuenow', '0');
  await travelTo(page, 4);
  await page.getByRole('button', { name: 'Discover DocuType', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'DocuType', exact: true }).getByRole('link', { name: 'Explore the source' })).toHaveAttribute('href', PROJECTS[4].github);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(canvas(page)).toHaveAttribute('data-reduced-motion', 'false');
  expect(errors).toEqual([]);
});

test('unavailable WebGL preserves every project source, the map and contact', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(kind)) return null;
      return original.call(this, kind, ...args);
    };
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The scenic route is unavailable.', exact: true })).toBeVisible();
  for (const project of PROJECTS) {
    await page.getByRole('button', { name: `${project.name} →`, exact: true }).click();
    const details = page.getByRole('dialog', { name: project.name, exact: true });
    await expect(details).toContainText(project.description);
    await expect(details.getByRole('link', { name: 'Explore the source' })).toHaveAttribute('href', project.github);
    await details.getByRole('button', { name: 'Close details' }).click();
  }
  await mapButton(page).click();
  await expect(mapDialog(page).getByRole('navigation', { name: 'Project destinations' }).getByRole('button')).toHaveCount(7);
  await mapDialog(page).getByRole('button', { name: /^Travel to Inkora,/ }).click();
  await expect(page.getByRole('heading', { name: 'Inkora', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Contact', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Let’s make something.', exact: true }).getByRole('link', { name: 'abhishek.a2534@gmail.com' })).toHaveAttribute('href', 'mailto:abhishek.a2534@gmail.com');
  expect(errors).toEqual([]);
});
