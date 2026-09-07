import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9231;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--enable-unsafe-swiftshader',`--remote-debugging-port=${PORT}`,'--user-data-dir='+join(tmpdir(),'chrome-asc2-'+Date.now()),'--no-first-run','about:blank']);
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

await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
await send('Page.enable', {});
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 12000));

const r = await send('Runtime.evaluate', {
  expression: `(() => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, (1/4) * total);
    return new Promise((res) => setTimeout(() => {
      const box = document.querySelector('.ascii-bob');
      const grid = box ? box.querySelector('div') : null;
      const row = box ? box.querySelector('div > div') : null;
      const info = {
        boxSize: box ? box.clientWidth + 'x' + box.clientHeight : null,
        boxRect: box ? Math.round(box.getBoundingClientRect().width) + 'x' + Math.round(box.getBoundingClientRect().height) : null,
        gridScroll: grid ? grid.scrollWidth + 'x' + grid.scrollHeight : null,
        gridRect: grid ? Math.round(grid.getBoundingClientRect().width) + 'x' + Math.round(grid.getBoundingClientRect().height) : null,
        fontSize: row ? getComputedStyle(row).fontSize : null,
        fontFamily: row ? getComputedStyle(row).fontFamily : null,
        rows: box ? box.querySelectorAll('div > div').length : 0,
        cols: (box && box.querySelector('div > div')) ? box.querySelector('div > div').children.length : 0,
        // count colored pixels inside the box
      };
      res(JSON.stringify(info));
    }, 1000));
  })()`,
  awaitPromise: true,
  returnByValue: true,
});
console.log(r.result.value);
ws.close(); chrome.kill(); process.exit(0);
