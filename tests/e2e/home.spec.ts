import { test, expect } from '@playwright/test';

test.describe('home page', () => {
  test('EN home renders bio and projects link', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Luis Escolano');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByText(/EEBUS protocol/)).toBeVisible();
    await expect(
      page.locator('main').getByRole('link', { name: 'projects' }),
    ).toHaveAttribute('href', '/projects');
  });

  test('ES home renders bio in Spanish with locale-correct link', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByText(/protocolo EEBUS/)).toBeVisible();
    await expect(
      page.locator('main').getByRole('link', { name: 'proyectos' }),
    ).toHaveAttribute('href', '/es/projects');
  });
});
