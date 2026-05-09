import { test, expect } from '@playwright/test';

test.describe('articles', () => {
  test('EN index lists the practical-workflow article and the link goes to the detail page', async ({
    page,
  }) => {
    await page.goto('/articles');
    const link = page.getByRole('link', { name: /A practical workflow for Claude Code/ });
    await expect(link).toBeVisible();
    await link.first().click();
    await expect(page).toHaveURL(/\/articles\/practical-workflow-claude-code\/?$/);
    await expect(
      page.getByRole('heading', { name: 'A practical workflow for Claude Code', level: 1 }),
    ).toBeVisible();
  });

  test('detail page renders the CommitFlowDiagram component', async ({ page }) => {
    await page.goto('/articles/practical-workflow-claude-code');
    // CommitFlowDiagram exposes itself via the role+aria-label on its <svg>.
    await expect(
      page.getByRole('img', {
        name: /Code generated.*Review.*Atomic commit.*Push.*Code review/,
      }),
    ).toBeVisible();
  });

  test('detail page links to the referenced own-project pages', async ({ page }) => {
    await page.goto('/articles/practical-workflow-claude-code');
    await expect(
      page
        .locator('article a[href="/projects/unity-mcp-port"]')
        .first(),
    ).toBeVisible();
    await expect(
      page.locator('article a[href="/projects/fmodel-mcp"]').first(),
    ).toBeVisible();
  });

  test('detail page renders share links with correct intent URLs and a copy-link button', async ({
    page,
  }) => {
    await page.goto('/articles/practical-workflow-claude-code');
    const share = page.getByRole('complementary').filter({ has: page.locator('#share-heading') });
    await expect(share).toBeVisible();
    await expect(share.getByRole('link', { name: 'Twitter' })).toHaveAttribute(
      'href',
      /twitter\.com\/intent\/tweet\?text=.*&url=.*practical-workflow-claude-code/,
    );
    await expect(share.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      /linkedin\.com\/sharing\/share-offsite\/\?url=.*practical-workflow-claude-code/,
    );
    await expect(share.getByRole('link', { name: 'Hacker News' })).toHaveAttribute(
      'href',
      /news\.ycombinator\.com\/submitlink\?u=.*practical-workflow-claude-code/,
    );
    await expect(share.getByRole('button', { name: 'Copy link' })).toBeVisible();
  });

  test('ES route shows the missing-translation notice (article not yet translated)', async ({
    page,
  }) => {
    await page.goto('/es/articles/practical-workflow-claude-code');
    await expect(page.getByText(/Aún no disponible en este idioma/)).toBeVisible();
    const link = page.getByRole('link', { name: /Leer la versión disponible/ });
    await expect(link).toHaveAttribute(
      'href',
      /\/articles\/practical-workflow-claude-code\/?$/,
    );
  });
});
