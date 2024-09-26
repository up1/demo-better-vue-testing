import { test, expect } from '@playwright/test';

test('add item to list', async ({ page }) => {
  await page.goto('/');
  await page.fill('.item-input', 'Bread');
  await page.click('.add-item-button');
  const item = page.locator('.item:nth-child(1)');
  await expect(item).toBeVisible();
});