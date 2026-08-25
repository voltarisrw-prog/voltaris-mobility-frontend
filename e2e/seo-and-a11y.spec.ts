import { expect, test } from '@playwright/test';

const PUBLIC_PAGES = ['/', '/cars', '/compare', '/dealers', '/brands', '/charging', '/guides', '/sell', '/electric-cars-rwanda'];

for (const path of PUBLIC_PAGES) {
  test(`${path} has exactly one h1, a canonical, and a unique description`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length ?? 0).toBeGreaterThan(50);
  });
}

test('the skip link is the first thing a keyboard user reaches', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused();
});

test('robots.txt points at the sitemap and blocks private areas', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('sitemap');
  expect(body).toMatch(/Disallow: \/admin/);
  expect(body).toMatch(/Disallow: \/account/);
});

test('the sitemap is valid XML and excludes admin routes', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  expect(body).toContain('<urlset');
  expect(body).not.toContain('/admin');
  expect(body).not.toContain('/account');
});

test('an unknown vehicle returns a real 404, not an empty page', async ({ page }) => {
  const response = await page.goto('/cars/this-vehicle-does-not-exist-2099-nowhere');
  expect(response?.status()).toBe(404);
});
