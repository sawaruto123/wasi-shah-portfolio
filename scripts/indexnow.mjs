/**
 * Submit the site's URLs to IndexNow — instant indexing on Bing, Yandex,
 * Seznam and Naver. No account required: ownership is proven by the key file
 * served from the site root (`public/<key>.txt`).
 *
 * Bing's index also feeds Microsoft Copilot and ChatGPT search, so this is
 * how new content gets picked up without waiting for a crawl.
 *
 * Usage: node scripts/indexnow.mjs [host]
 */
import { readdirSync, readFileSync } from 'node:fs';

const HOST = (process.argv[2] || 'wasi-shah-portfolio.vercel.app')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');

const keyFile = readdirSync('public').find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error('No IndexNow key file found — expected public/<32-hex>.txt');
  process.exit(1);
}
const key = readFileSync(`public/${keyFile}`, 'utf8').trim();

const urlList = [`https://${HOST}/`];
const body = { host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList };

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

// 200 = accepted, 202 = accepted (key pending validation), 403 = key file not reachable
console.log(`IndexNow -> ${res.status} ${res.statusText}`);
console.log('submitted:', urlList.join(', '));
if (res.status === 403) {
  console.log('(403 usually means the key file is not live yet — deploy first, then re-run.)');
}
