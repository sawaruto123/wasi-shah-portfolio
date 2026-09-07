import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9236;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--enable-unsafe-swiftshader',`--remote-debugging-port=${PORT}`,'--user-data-dir='+join(tmpdir(),'chrome-slider-'+Date.now()),'--no-first-run','about:blank']);
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

await send('Runtime.enable', {});
await send('Page.enable', {});
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 8000));

const r = await send('Runtime.evaluate', {
  expression: `(() => {
    // open the sliders popup
    const btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label')||'').includes('背景') || (b.getAttribute('title')||'').toLowerCase().includes('opacity'));
    if (btn) btn.click();
    return new Promise((res) => setTimeout(() => {
      const input = document.querySelector('input[type="range"]');
      if (!input) return res(JSON.stringify({ found: false }));
      const cs = getComputedStyle(input);
      // test whether appearance:none is honored
      const test = document.createElement('input');
      test.type = 'range';
      document.body.appendChild(test);
      const testBg = getComputedStyle(test).background;
      test.remove();
      res(JSON.stringify({
        found: true,
        class: input.className,
        appearance: cs.appearance + ' / ' + cs.webkitAppearance,
        background: cs.background,
        backgroundImage: cs.backgroundImage,
        height: cs.height,
        borderRadius: cs.borderRadius,
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
        htmlClass: document.documentElement.className,
        nativeTestBg: testBg,
      }));
    }, 300));
  })()`,
  awaitPromise: true,
  returnByValue: true,
});
console.log(r.result.value);
ws.close(); chrome.kill(); process.exit(0);
