const { test, expect } = require('@playwright/test');
const { API_URL } = require('./helpers');

// =============================================================
//  TEST 5 — Endpoint pubblico GET /api/memes restituisce dati
// =============================================================
test('T05 — API pubblica /api/memes risponde con lista meme', async ({ request }) => {
  const res = await request.get(`${API_URL}/api/memes`);
  expect(res.ok()).toBeTruthy();

  const body = await res.json();
  expect(body).toHaveProperty('memes');
  expect(Array.isArray(body.memes)).toBe(true);
  expect(body).toHaveProperty('page');
});
