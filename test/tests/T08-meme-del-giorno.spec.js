const { test, expect } = require('@playwright/test');
const { BASE_URL, API_URL } = require('./helpers');

// =============================================================
//  TEST 8 — Meme del Giorno è visibile (UI)
// =============================================================
test('T08 — La sezione "Meme del Giorno" è visibile se esistono meme', async ({ page }) => {
  await page.goto(BASE_URL);
  const motd = page.getByText(/Meme del Giorno/i);

  // Aspettiamo che la chiamata API risponda
  await page.waitForTimeout(2000);

  // Il componente è visibile solo se l'API restituisce un meme
  const apiRes = await fetch(`${API_URL}/api/meme-of-the-day`);
  if (apiRes.ok) {
    const data = await apiRes.json();
    if (data.memeOfTheDay) {
      await expect(motd).toBeVisible();
    }
  }

  // Se non ci sono meme nel DB il test passa comunque (condizione attesa)
  test.info().annotations.push({ type: 'note', description: 'Dipende dalla presenza di meme nel DB' });
});
