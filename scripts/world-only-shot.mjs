// Clicks "World Only" to hide HTML, then screenshots the pure 3D world.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9226;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=' + join(tmpdir(), 'chrome-wo-' + Date.now()),
  '--no-first-run', 'about:blank',
]);
async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((p) => p.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('no debugger');
}
const ws = new WebSocket(await getWsUrl());
let id = 0;
const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
await new Promise((r) => (ws.onopen = r));
function send(method, params) { return new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); }); }

await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
await send('Page.enable', {});
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 14000));

const click = await send('Runtime.evaluate', {
  expression: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('World Only')); if (b) { b.click(); return 'clicked'; } return 'not found'; })()`,
  returnByValue: true,
});
await new Promise((r) => setTimeout(r, 1500));
const r = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
writeFileSync(process.argv[2] || 'world-only.png', Buffer.from(r.data, 'base64'));
console.log('click:', click.result.value, 'saved');
ws.close(); chrome.kill(); process.exit(0);
