import { expect, test } from '@playwright/test';

test.describe('vehicle discovery', () => {
  test('a customer can search the marketplace', async ({ page }) => {
    await page.goto('/cars');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByLabel(/search by make/i).fill('BYD');
    // The search must land in the URL, or the result set cannot be shared.
    await expect(page).toHaveURL(/q=BYD/i, { timeout: 5000 });
  });

  test('filters are shareable through the URL', async ({ page }) => {
    await page.goto('/cars?make=byd&body=suv');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/byd/i);
    await expect(heading).toContainText(/suv/i);
  });

  test('a filtered view that is not indexable says so', async ({ page }) => {
    await page.goto('/cars?minRange=300');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/);
  });

  test('the bare marketplace is indexable and canonical', async ({ page }) => {
    await page.goto('/cars');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/cars$/);
  });

  test('opening a vehicle shows specs and structured data', async ({ page }) => {
    await page.goto('/cars');
    const firstCard = page.locator('article a').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/cars\/[a-z0-9-]+/);
    await expect(page.getByText(/driving range/i).first()).toBeVisible();
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((block) => block.includes('"@type":"Car"'))).toBe(true);
  });
});

test('comparison explains rather than dumping fields', async ({ page }) => {
  await page.goto('/compare');
  await expect(page.getByRole('heading', { name: /compare electric vehicles/i })).toBeVisible();
  await expect(page.getByText(/nothing to compare yet/i)).toBeVisible();
});
