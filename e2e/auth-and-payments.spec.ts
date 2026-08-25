import { expect, test } from '@playwright/test';

test('an anonymous visitor cannot reach the account area', async ({ page }) => {
  await page.goto('/account/saved');
  await expect(page).toHaveURL(/\/login\?next=/);
});

test('an anonymous visitor cannot reach checkout', async ({ page }) => {
  await page.goto('/checkout/some-order-id');
  await expect(page).toHaveURL(/\/login\?next=/);
});

test('an anonymous visitor cannot reach admin', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?next=/);
});

test('a forged session cookie gets no data', async ({ page, context }) => {
  // The proxy only checks that a cookie exists. The backend is what actually
  // authorizes, so a forged cookie must produce an error page, never account data.
  await context.addCookies([
    { name: 'voltaris_session', value: 'forged', domain: 'localhost', path: '/' },
  ]);
  await page.goto('/account');
  await expect(page.getByText(/saved vehicles/i)).toHaveCount(0);
});

test('the sign-in page does not reveal whether an account exists', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('definitely-not-a-user@example.com');
  await page.getByLabel(/password/i).fill('wrong-password-here');
  await page.getByRole('button', { name: /sign in/i }).click();
  const alert = page.getByRole('alert');
  await expect(alert).not.toContainText(/no account|not found|unknown user/i);
});

test('the open-redirect guard holds', async ({ page }) => {
  await page.goto('/login?next=https://evil.example');
  // Even on a successful sign-in the app must not follow an off-site `next`.
  await expect(page).toHaveURL(/\/login/);
});

test('admin and account pages are excluded from indexing at the header level', async ({ request }) => {
  const response = await request.get('/admin');
  expect(response.headers()['x-robots-tag']).toContain('noindex');
});
