const { test, expect } = require('@playwright/test');
const { TIMESTAMP, TEST_USER, registerViaAPI, loginViaAPI, ensureTestMeme, injectAuth } = require('./helpers');

// =============================================================
//  TEST 7 — Aggiunta di un commento (UI)
// =============================================================
test('T07 — Utente autenticato può aggiungere un commento', async ({ page }) => {
  await registerViaAPI(TEST_USER).catch(() => {});
  const { token, user } = await loginViaAPI(TEST_USER.email, TEST_USER.password);
  await ensureTestMeme(token);
  await injectAuth(page, token, user);

  const commentText = `Commento automatico ${TIMESTAMP}`;

  // Apri i commenti del primo meme
  const firstMeme = page.locator('.meme-gallery > div').first();
  await firstMeme.getByRole('button', { name: /Mostra Commenti/i }).click();
  await page.waitForTimeout(500);

  // Inserisci un commento
  await firstMeme.getByPlaceholder(/Commenta.../i).fill(commentText);
  await firstMeme.getByRole('button', { name: '➡️' }).click();

  // Il commento deve comparire nella lista
  await expect(firstMeme.getByText(commentText)).toBeVisible({ timeout: 5000 });
});
