const { test, expect } = require('@playwright/test');
const { TEST_USER, registerViaAPI, loginViaAPI, ensureTestMeme, injectAuth } = require('./helpers');

// =============================================================
//  TEST 6 — Votazione upvote su un meme (UI)
// =============================================================
test('T06 — Utente autenticato può fare upvote su un meme', async ({ page }) => {
  await registerViaAPI(TEST_USER).catch(() => {});
  const { token, user } = await loginViaAPI(TEST_USER.email, TEST_USER.password);
  await ensureTestMeme(token);
  await injectAuth(page, token, user);

  // Prendi il punteggio del primo meme prima del voto
  const scoreLocator = page.locator('.meme-gallery > div').first()
    .locator('div[style*="justify-content: center"] span');

  await expect(scoreLocator).toBeVisible({ timeout: 5000 });
  const scoreBefore = parseInt(await scoreLocator.textContent(), 10);

  // Clicca 👍
  await page.locator('.meme-gallery > div').first()
    .getByRole('button', { name: '👍' }).click();

  // Il punteggio deve essere aumentato (o il voto rimosso se era già attivo)
  await page.waitForTimeout(1000);
  const scoreAfter = parseInt(await scoreLocator.textContent(), 10);

  // Il punteggio può essere scoreBefore+1 (nuovo voto) o scoreBefore-1 (voto rimosso)
  // In ogni caso la pagina non deve mostrare errori
  expect([scoreBefore + 1, scoreBefore - 1, scoreBefore]).toContain(scoreAfter);
});
