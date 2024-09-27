import { test, expect } from '@playwright/test';

test.skip('add item to list', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.fill('#title', '2x4 DIPA Melvin');
  await page.click('#add-button');
  const item = page.locator('.item:nth-child(1)');
  await expect(item).toBeVisible();
});
