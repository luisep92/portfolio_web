import { test, expect } from '@playwright/test';

test.describe('partial-bilingual fallback', () => {
  test('EN-only project shows missing-translation notice on /es', async ({ page }) => {
    // unity-mcp-port exists only in EN. Hitting the ES route should render the
    // notice with a link back to the EN entry, not a 404 and not a silent
    // language fallback inside the ES shell.
    await page.goto('/es/projects/unity-mcp-port');
    await expect(page.getByText(/Aún no disponible en este idioma/)).toBeVisible();
    const link = page.getByRole('link', { name: /Leer la versión disponible/ });
    await expect(link).toHaveAttribute('href', /\/projects\/unity-mcp-port\/?$/);
  });

  test('EN-only project renders the entry directly on the EN route', async ({ page }) => {
    await page.goto('/projects/unity-mcp-port');
    await expect(page.getByRole('heading', { name: 'unity-mcp port', level: 1 })).toBeVisible();
    await expect(page.getByText('Aún no disponible')).toHaveCount(0);
  });
});
