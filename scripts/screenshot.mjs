// Captures screenshots of the running dev server in light + dark mode via CDP.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=' + join(tmpdir(), 'chrome-ss-' + Date.now()),
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank',
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
  throw new Error('no debugger endpoint');
}

const wsUrl = await getWsUrl();
const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
await new Promise((r) => (ws.onopen = r));

function send(method, params) {
  return new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, (msg) => {
      if (msg.error) reject(new Error(method + ': ' + JSON.stringify(msg.error)));
      else resolve(msg.result);
    });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}

async function shot(colorScheme, file) {
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: colorScheme }],
  });
  await send('Page.enable', {});
  await send('Page.navigate', { url: SITE });
  await new Promise((r) => setTimeout(r, 16000));
  const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  writeFileSync(file, Buffer.from(result.data, 'base64'));
  console.log('saved ' + file);
}

await shot('light', process.argv[2] || 'shot-light.png');
await shot('dark', process.argv[3] || 'shot-dark.png');
ws.close();
chrome.kill();
process.exit(0);
