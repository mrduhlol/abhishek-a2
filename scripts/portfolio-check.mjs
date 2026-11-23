import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173')
  await page.evaluate(() => document.fonts.ready)
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}px`)
    await page.screenshot({ path: `/tmp/portfolio-${width}.png`, fullPage: true })
  }
  assert.equal(await page.locator('article').count(), 8)
  assert.equal(await page.getByRole('heading', { name: 'Pulp', exact: true }).count(), 1)
  assert.equal(await page.getByRole('heading', { name: 'Orbit', exact: true }).count(), 0)
  for (const [name, count] of [['Desktop', 1], ['Android', 3], ['Web', 4], ['All projects', 8]]) {
    await page.getByRole('button', { name, exact: true }).click()
    assert.equal(await page.locator('article').count(), count, name)
    assert.equal(await page.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true')
  }
  for (const image of await page.locator('img:visible').all()) {
    await image.scrollIntoViewIfNeeded()
    await image.evaluate(element => element.decode())
    assert.equal(await image.evaluate(element => element.naturalWidth > 0), true)
  }
  for (const row of await page.locator('.project-row').all()) {
    const disclosure = row.getByRole('button')
    const screenshot = row.locator('.project-screenshot img')
    assert.equal(await disclosure.getAttribute('aria-expanded'), 'false')
    assert.equal(await screenshot.count(), 0)
    await disclosure.click()
    assert.equal(await disclosure.getAttribute('aria-expanded'), 'true')
    await screenshot.evaluate(image => image.decode())
    await disclosure.press('Enter')
    assert.equal(await screenshot.count(), 0)
    assert.equal(await disclosure.getAttribute('aria-expanded'), 'false')
  }
  await page.getByRole('link', { name: 'Contact', exact: true }).click()
  assert.ok(page.url().endsWith('#contact'))
  assert.deepEqual(errors, [])
  console.log('PASS: responsive layout at four sizes, project filters, images, contact navigation, runtime errors')
} finally {
  await browser.close()
}
