const { test, expect } = require('@playwright/test');
const { BASE_URL, TEST_USER } = require('./helpers');

// =============================================================
//  TEST 1 — Registrazione di un nuovo utente (UI)
// =============================================================
test('T01 — Registrazione nuovo utente tramite UI', async ({ page }) => {
  await page.goto(BASE_URL);

  // Clicca su "Nuovo nel museo? Registrati qui"
  await page.getByText(/Nuovo nel museo/i).click();
  await expect(page.getByText(/Crea un nuovo account/i)).toBeVisible();

  // Compila il form
  await page.getByPlaceholder(/Scegli uno Username/i).fill(TEST_USER.username);
  await page.getByPlaceholder(/Inserisci la tua Email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/Inserisci la Password/i).fill(TEST_USER.password);

  // Intercetta l'alert di conferma
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Registrati ora/i }).click();

  // Dopo la registrazione il form deve tornare al login
  await expect(page.getByText(/Accedi al Museo/i)).toBeVisible({ timeout: 5000 });
});
