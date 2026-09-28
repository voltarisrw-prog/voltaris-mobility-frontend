import { expect, test } from '@playwright/test';

/**
 * Screens that must behave at every width. Run with playwright.visual.config.ts.
 * The first vehicle slug comes from the listing so demo data can change.
 */
async function firstVehicleSlug(page: import('@playwright/test').Page) {
  await page.goto('/cars');
  const href = await page.locator('a[href^="/cars/"]').first().getAttribute('href');
  return href?.split('/')[2]?.split('?')[0] ?? '';
}

test('vehicle page', async ({ page }) => {
  const slug = await firstVehicleSlug(page);
  await page.goto(`/cars/${slug}`);
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('vehicle-top.png', { fullPage: false });
  // No horizontal overflow at any width.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('vehicle page pinned CTA (≤1024) and touch targets', async ({ page }, testInfo) => {
  const slug = await firstVehicleSlug(page);
  await page.goto(`/cars/${slug}`);
  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(400);
  const width = page.viewportSize()?.width ?? 0;
  const bar = page.locator('div.fixed.bottom-0');
  if (width <= 1024) {
    await expect(bar).toBeVisible();
    for (const box of await bar.locator('a').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))) {
      expect(box.height).toBeGreaterThanOrEqual(48);
    }
  } else {
    await expect(bar).toBeHidden();
  }
  await expect(page).toHaveScreenshot(`vehicle-scrolled-${testInfo.project.name}.png`);
});

test('order stepper keyboard order', async ({ page }) => {
  const slug = await firstVehicleSlug(page);
  await page.goto(`/order?vehicle=${slug}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/cash or finance/i);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /^cash/i })).toBeFocused();
  await expect(page).toHaveScreenshot('order-step-2.png');
});

test('finance and garage pages', async ({ page }) => {
  await page.goto('/finance');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('finance.png', { fullPage: true });
  await page.goto('/garage');
  await expect(page).toHaveScreenshot('garage.png', { fullPage: true });
});
