const { test, expect } = require('@playwright/test');
const { BASE_URL, TEST_USER, registerViaAPI } = require('./helpers');

// =============================================================
//  TEST 3 — Login corretto (UI)
// =============================================================
test('T03 — Login corretto tramite UI mostra il Pannello Artista', async ({ page }) => {
  // Mi assicuro che TEST_USER esista
  await registerViaAPI(TEST_USER).catch(() => {}); // ignora se già esiste

  await page.goto(BASE_URL);
  await page.getByPlaceholder(/Inserisci la tua Email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/Inserisci la Password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /Accedi ed Entra/i }).click();

  // Il pannello artista deve mostrare il nome utente
  await expect(page.getByText(TEST_USER.username)).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Pannello Artista/i)).toBeVisible();
});
