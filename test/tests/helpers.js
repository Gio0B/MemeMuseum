const path = require('path');
const fs   = require('fs');
const os   = require('os');

// ── Configurazione globale ────────────────────────────────────
const BASE_URL  = 'http://localhost:5173';
const API_URL   = 'http://localhost:3000';
const TIMESTAMP = Date.now();

const TEST_USER = {
  username: `testuser_${TIMESTAMP}`,
  email:    `testuser_${TIMESTAMP}@example.com`,
  password: 'Password123!',
};

const SECOND_USER = {
  username: `seconduser_${TIMESTAMP}`,
  email:    `second_${TIMESTAMP}@example.com`,
  password: 'Password123!',
};

// Immagine di test (1×1 px PNG trasparente in base64)
const TINY_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function createTempImage(filename = 'test-meme.png') {
  const tmpPath = path.join(os.tmpdir(), filename); // compatibile Windows, Mac e Linux
  fs.writeFileSync(tmpPath, Buffer.from(TINY_PNG_B64, 'base64'));
  return tmpPath;
}

// ─────────────────────────────────────────────────────────────
//  HELPER: registra un utente tramite API diretta
// ─────────────────────────────────────────────────────────────
async function registerViaAPI(userData) {
  const res = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res;
}

// ─────────────────────────────────────────────────────────────
//  HELPER: esegui login tramite API e restituisce il token
// ─────────────────────────────────────────────────────────────
async function loginViaAPI(email, password) {
  const res  = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return { token: data.token, user: data.user };
}

// Crea un meme minimo quando i test partono da un database vuoto.
async function ensureTestMeme(token) {
  const listRes = await fetch(`${API_URL}/api/memes`);
  const list = await listRes.json();
  if (Array.isArray(list.memes) && list.memes.length > 0) return;

  const imagePath = createTempImage(`test-meme-${TIMESTAMP}.png`);
  const form = new FormData();
  form.append('title', `Meme automatico ${TIMESTAMP}`);
  form.append('tags', 'playwright, test');
  form.append('image', new Blob([fs.readFileSync(imagePath)], { type: 'image/png' }), 'test-meme.png');

  const res = await fetch(`${API_URL}/api/memes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Impossibile creare il meme di test: ${res.status} ${await res.text()}`);
  }
}

// ─────────────────────────────────────────────────────────────
//  HELPER: inietta token e user in localStorage per saltare il
//          form di login nell'UI (velocizzando i test dipendenti)
// ─────────────────────────────────────────────────────────────
async function injectAuth(page, token, user) {
  await page.goto(BASE_URL);
  await page.evaluate(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }, [token, user]);
  await page.reload();
}

module.exports = {
  BASE_URL,
  API_URL,
  TIMESTAMP,
  TEST_USER,
  SECOND_USER,
  createTempImage,
  registerViaAPI,
  loginViaAPI,
  ensureTestMeme,
  injectAuth,
};
