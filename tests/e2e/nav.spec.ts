import { test, expect } from '@playwright/test';

test.describe('header navigation', () => {
  test('locale toggle links to the mirror page and switches lang', async ({ page }) => {
    await page.goto('/projects');
    const toggle = page.getByLabel('Switch to Spanish');
    await expect(toggle).toHaveAttribute('href', /\/es\/projects\/?$/);
    await toggle.click();
    await expect(page).toHaveURL(/\/es\/projects\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('header nav routes resolve in both locales', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav').getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/?$/);

    await page.locator('nav').getByRole('link', { name: 'Now', exact: true }).click();
    await expect(page).toHaveURL(/\/now\/?$/);

    await page.locator('nav').getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL(/\/contact\/?$/);
  });

  test('Home nav item is exact-match active (not greedy on /es/projects)', async ({ page }) => {
    await page.goto('/projects');
    const homeOnProjects = page.locator('nav').getByRole('link', { name: 'Home', exact: true });
    // On a sub-page, Home should be the inactive class
    await expect(homeOnProjects).toHaveClass(/text-slate-400/);

    await page.goto('/');
    const homeOnRoot = page.locator('nav').getByRole('link', { name: 'Home', exact: true });
    // On / Home is active
    await expect(homeOnRoot).toHaveClass(/text-slate-100/);

    await page.goto('/es/projects');
    const inicioOnEsProjects = page.locator('nav').getByRole('link', { name: 'Inicio', exact: true });
    // On a sub-page in /es, Inicio should also be inactive (regression test for the
    // greedy-startsWith bug fixed in 1a5dd5f).
    await expect(inicioOnEsProjects).toHaveClass(/text-slate-400/);
  });
});
