import { expect, test } from '@playwright/test';

test('an enquiry cannot be sent without consent', async ({ page }) => {
  await page.goto('/cars');
  await page.locator('article a').first().click();
  await page.getByRole('link', { name: /ask about this vehicle/i }).click();

  await page.getByLabel(/your name/i).fill('Amani Test');
  await page.getByLabel(/^email/i).fill('amani@example.com');
  await page.getByLabel(/phone/i).fill('0788123456');
  await page.getByLabel(/your question/i).fill('Is the battery health report available?');
  await page.getByRole('button', { name: /send enquiry/i }).click();

  // The consent checkbox is a hard gate, and the error must be announced.
  await expect(page.getByRole('alert').first()).toBeVisible();
});

test('a bad phone number is rejected before submission', async ({ page }) => {
  await page.goto('/test-drive');
  await page.getByLabel(/your name/i).fill('Amani Test');
  await page.getByLabel(/^email/i).fill('amani@example.com');
  await page.getByLabel(/phone/i).fill('12345');
  await page.getByRole('button', { name: /request this test drive/i }).click();
  await expect(page.getByText(/rwandan mobile number/i)).toBeVisible();
});

test('the seller flow states that submission is not publication', async ({ page }) => {
  await page.goto('/sell');
  await expect(page.getByText(/nothing goes live until a reviewer/i)).toBeVisible();
  await page.getByLabel(/your name/i).fill('Amani Test');
  await page.getByLabel(/^email/i).fill('amani@example.com');
  await page.getByLabel(/phone/i).fill('0788123456');
  await page.getByLabel(/where is the vehicle/i).selectOption('kigali-gasabo');
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByLabel(/^make/i)).toBeVisible();
});
