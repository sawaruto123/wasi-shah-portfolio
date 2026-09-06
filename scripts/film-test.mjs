import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9228;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=' + join(tmpdir(), 'chrome-film-' + Date.now()),
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
const evalJS = (expr) => send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });

await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
await send('Page.enable', {});
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 12000));

const r1 = await evalJS(`(() => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const target = (3/4) * total;
  const samples = [];
  window.scrollTo(0, target);
  samples.push(['t0', window.scrollY]);
  return new Promise((res) => {
    [30, 120, 250, 500].forEach((ms) => setTimeout(() => {
      samples.push(['t'+ms, window.scrollY]);
      if (ms === 500) res(JSON.stringify({ total, target, samples }));
    }, ms));
  });
})()`);
console.log('scrollY over time:', r1.result.value);

const r2 = await evalJS(`(() => {
  const films = document.querySelector('[data-room-scroll="3"]');
  films.scrollTop = films.scrollHeight; // scroll inner to bottom
  return new Promise((res) => setTimeout(() => {
    const active = [...document.querySelectorAll('[data-room-scroll]')].map(el => ({ room: el.dataset.roomScroll, active: el.parentElement.parentElement.classList.contains('opacity-100'), top: el.scrollTop }));
    res(JSON.stringify({ scrollY: window.scrollY, filmsTop: films.scrollTop, active }));
  }, 400));
})()`);
console.log('after scroll films to bottom:', r2.result.value);

const r3 = await evalJS(`(() => {
  // simulate the wheel handler switch: window.scrollTo next room (Connect)
  const total = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo(0, total);
  return new Promise((res) => setTimeout(() => {
    const films = document.querySelector('[data-room-scroll="3"]');
    const active = [...document.querySelectorAll('[data-room-scroll]')].map(el => ({ room: el.dataset.roomScroll, active: el.parentElement.parentElement.classList.contains('opacity-100'), top: el.scrollTop }));
    res(JSON.stringify({ scrollY: window.scrollY, filmsTop: films.scrollTop, active }));
  }, 600));
})()`);
console.log('after switch to connect:', r3.result.value);

ws.close(); chrome.kill(); process.exit(0);
