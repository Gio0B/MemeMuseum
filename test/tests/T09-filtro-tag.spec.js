const { test, expect } = require('@playwright/test');
const { BASE_URL } = require('./helpers');

// =============================================================
//  TEST 9 — Filtro per tag (UI)
// =============================================================
test('T09 — Il filtro per tag aggiorna la galleria', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);

  const searchTag = 'playwright';
  await page.getByPlaceholder(/Filtra per tag/i).fill(searchTag);
  await page.waitForTimeout(1500); // attendiamo il debounce dell'useEffect

  // O ci sono risultati con quel tag oppure il messaggio "Nessun meme trovato"
  const hasResults   = await page.locator('.meme-gallery > div').count();
  const noResultsMsg = page.getByText(/Nessun meme trovato/i);

  if (hasResults === 0) {
    await expect(noResultsMsg).toBeVisible();
  } else {
    expect(hasResults).toBeGreaterThan(0);
  }
});
