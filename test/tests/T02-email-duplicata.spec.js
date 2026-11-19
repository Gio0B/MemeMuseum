const { test, expect } = require('@playwright/test');
const { BASE_URL, SECOND_USER, registerViaAPI } = require('./helpers');

// =============================================================
//  TEST 2 — Registrazione con email duplicata (UI)
// =============================================================
test('T02 — Registrazione con email già esistente mostra errore', async ({ page }) => {
  // Creo prima l'utente via API così siamo sicuri esista
  await registerViaAPI(SECOND_USER);

  await page.goto(BASE_URL);
  await page.getByText(/Nuovo nel museo/i).click();

  await page.getByPlaceholder(/Scegli uno Username/i).fill('altro_username');
  await page.getByPlaceholder(/Inserisci la tua Email/i).fill(SECOND_USER.email);
  await page.getByPlaceholder(/Inserisci la Password/i).fill(SECOND_USER.password);

  await page.getByRole('button', { name: /Registrati ora/i }).click();

  // Deve comparire un messaggio di errore in rosso
  await expect(page.locator('p[style*="color: red"]')).toBeVisible({ timeout: 5000 });
});
