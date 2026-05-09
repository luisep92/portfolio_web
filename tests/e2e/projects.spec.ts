import { test, expect } from '@playwright/test';

test.describe('projects index', () => {
  test('EN index lists fmodel-mcp under Featured and link goes to the detail page', async ({
    page,
  }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Featured' })).toBeVisible();
    const link = page.getByRole('link', { name: /fmodel-mcp/ });
    await expect(link).toBeVisible();
    await link.first().click();
    await expect(page).toHaveURL(/\/projects\/fmodel-mcp\/?$/);
    await expect(page.getByRole('heading', { name: 'fmodel-mcp', level: 1 })).toBeVisible();
  });

  test('ES index lists fmodel-mcp under Destacados', async ({ page }) => {
    await page.goto('/es/projects');
    await expect(page.getByRole('heading', { name: 'Destacados' })).toBeVisible();
    await expect(page.getByRole('link', { name: /fmodel-mcp/ })).toBeVisible();
  });

  test('detail page renders MDX Callout from the entry body', async ({ page }) => {
    await page.goto('/projects/fmodel-mcp');
    // The fmodel-mcp entry wraps its closing meta-paragraph in <Callout kind="aside">.
    // The aside variant renders with border-slate-800 + bg-transparent + text-slate-300.
    const callout = page.locator('div.border-l-2').filter({ hasText: /Repo is public/ });
    await expect(callout).toBeVisible();
    await expect(callout).toHaveClass(/border-slate-800/);
  });
});
