import { test, expect } from '@playwright/test';

test('action desk renders', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('action-desk.png', { fullPage: true, maxDiffPixels: 100 });
});

test('review archive renders', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Review|回顾/ }).click();
  await page.waitForTimeout(300);
  await expect(page).toHaveScreenshot('review-archive.png', { fullPage: true, maxDiffPixels: 100 });
});

test('system page renders', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /System|系统/ }).click();
  await page.waitForTimeout(300);
  await expect(page).toHaveScreenshot('system.png', { fullPage: true, maxDiffPixels: 100 });
});
