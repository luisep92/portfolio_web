import { test, expect } from '@playwright/test';

test('contact page lists the three real handles with correct hrefs', async ({ page }) => {
  await page.goto('/contact');
  await expect(
    page.getByRole('link', { name: 'luis@escolano.es' }),
  ).toHaveAttribute('href', 'mailto:luis@escolano.es');
  await expect(
    page.getByRole('link', { name: 'luisep92' }),
  ).toHaveAttribute('href', 'https://github.com/luisep92');
  await expect(
    page.getByRole('link', { name: /luis-escolano-piquer/ }),
  ).toHaveAttribute('href', /linkedin\.com\/in\/luis-escolano-piquer/);
});
