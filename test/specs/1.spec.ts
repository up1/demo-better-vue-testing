import { test, expect } from '@playwright/test';

test('add item to list', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.fill('#title', 'Bread');
  await page.click('#add-button');
  const item = page.locator('.item:nth-child(1)');
  await expect(item).toBeVisible();
});