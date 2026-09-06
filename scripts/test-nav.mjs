// Verifies mobile navigation: emulates a phone, clicks "Connect", reports scroll state.
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=' + join(tmpdir(), 'chrome-nav-' + Date.now()),
  '--no-first-run',
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
  throw new Error('no debugger');
}

const ws = new WebSocket(await getWsUrl());
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
await new Promise((r) => (ws.onopen = r));
function send(method, params) {
  return new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)));
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
await send('Page.enable', {});
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 16000));

const click = await send('Runtime.evaluate', {
  expression: `(() => {
    const btns = [...document.querySelectorAll('button')];
    const c = btns.find(b => b.textContent.trim().toLowerCase().includes('connect'));
    if (c) { c.click(); return 'clicked'; }
    return 'NOT FOUND';
  })()`,
  returnByValue: true,
});

await new Promise((r) => setTimeout(r, 1500));

const state = await send('Runtime.evaluate', {
  expression: `(() => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? window.scrollY / total : 0;
    const idx = Math.round(progress * 4);
    const room4 = document.querySelector('[data-room-scroll="4"]');
    const active = room4 && room4.parentElement && room4.parentElement.parentElement && room4.parentElement.parentElement.classList.contains('opacity-100');
    return JSON.stringify({ scrollY: Math.round(window.scrollY), innerHeight: window.innerHeight, scrollHeight: document.documentElement.scrollHeight, total: Math.round(total), progress: +progress.toFixed(2), idx, connectActive: !!active });
  })()`,
  returnByValue: true,
});

console.log('click:', click.result.value);
console.log('state:', state.result.value);

const diag = await send('Runtime.evaluate', {
  expression: `(() => {
    const html = document.documentElement, body = document.body;
    const before = { htmlO: getComputedStyle(html).overflow, bodyO: getComputedStyle(body).overflow, bodyOX: getComputedStyle(body).overflowX, bodyOY: getComputedStyle(body).overflowY };
    body.classList.remove('overflow-x-hidden');
    const total = document.documentElement.scrollHeight - window.innerHeight;
    document.scrollingElement.scrollTop = total;
    const afterRemove = window.scrollY;
    return JSON.stringify({ before, total, afterRemove });
  })()`,
  returnByValue: true,
});
console.log('scroll-diag:', diag.result.value);

ws.close();
chrome.kill();
process.exit(0);
