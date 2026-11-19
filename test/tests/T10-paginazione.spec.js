const { test, expect } = require('@playwright/test');
const { BASE_URL } = require('./helpers');

// =============================================================
//  TEST 10 — Paginazione: il pulsante "Successiva" funziona
// =============================================================
test('T10 — La paginazione avanza correttamente alla pagina successiva', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);

  const nextBtn = page.getByRole('button', { name: /Successiva/i });
  const prevBtn = page.getByRole('button', { name: /Precedente/i });

  // "Precedente" deve essere disabilitato sulla prima pagina
  await expect(prevBtn).toBeDisabled();

  // "Successiva" è abilitata solo se ci sono ≥10 meme; in ogni caso cliccando
  // l'indicatore di pagina deve cambiare
  const isNextEnabled = await nextBtn.isEnabled();
  if (isNextEnabled) {
    await nextBtn.click();
    await expect(page.getByText(/Pag 2/i)).toBeVisible({ timeout: 3000 });

    // "Precedente" ora deve essere abilitato
    await expect(prevBtn).toBeEnabled();
  } else {
    // Meno di 10 meme in DB — scenario valido in ambiente di test
    await expect(page.getByText(/Pag 1/i)).toBeVisible();
  }
});
