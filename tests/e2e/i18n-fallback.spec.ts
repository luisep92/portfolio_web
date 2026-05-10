import { test, expect } from '@playwright/test';

test.describe('partial-bilingual fallback', () => {
  test('EN-only article shows missing-translation notice on /es', async ({ page }) => {
    // The Claude Code workflow article exists only in EN. Hitting the ES
    // route should render the notice with a link back to the EN entry,
    // not a 404 and not a silent language fallback inside the ES shell.
    await page.goto('/es/articles/practical-workflow-claude-code');
    await expect(page.getByText(/Aún no disponible en este idioma/)).toBeVisible();
    const link = page.getByRole('link', { name: /Leer la versión disponible/ });
    await expect(link).toHaveAttribute('href', /\/articles\/practical-workflow-claude-code\/?$/);
  });

  test('EN-only article renders the entry directly on the EN route', async ({ page }) => {
    await page.goto('/articles/practical-workflow-claude-code');
    await expect(
      page.getByRole('heading', { name: 'A practical workflow for Claude Code', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText('Aún no disponible')).toHaveCount(0);
  });
});
