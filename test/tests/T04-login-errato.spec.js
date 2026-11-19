const { test, expect } = require('@playwright/test');
const { BASE_URL, TEST_USER } = require('./helpers');

// =============================================================
//  TEST 4 — Login con credenziali errate (UI)
// =============================================================
test('T04 — Login con password errata mostra messaggio di errore', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.getByPlaceholder(/Inserisci la tua Email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/Inserisci la Password/i).fill('password_sbagliata');
  await page.getByRole('button', { name: /Accedi ed Entra/i }).click();

  await expect(page.locator('p[style*="color: red"]')).toBeVisible({ timeout: 5000 });
});
