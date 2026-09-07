import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9238;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--enable-unsafe-swiftshader',`--remote-debugging-port=${PORT}`,'--user-data-dir='+join(tmpdir(),'chrome-lang-'+Date.now()),'--no-first-run','about:blank']);
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

await send('Page.enable', {});
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 9000));

const r = await send('Runtime.evaluate', {
  expression: `(() => {
    // force night mode
    document.documentElement.classList.add('dark');
    return new Promise((res) => setTimeout(() => {
      const bar = document.querySelector('.language-bar');
      const track = bar ? bar.parentElement : null;
      const cs = bar ? getComputedStyle(bar) : null;
      const ct = track ? getComputedStyle(track) : null;
      const room = bar ? bar.closest('[class*="room"]') : null;
      res(JSON.stringify({
        found: !!bar,
        fillBackground: cs ? cs.backgroundImage : null,
        fillTransform: cs ? cs.transform : null,
        trackBackground: ct ? ct.backgroundColor : null,
        trackClass: track ? track.className : null,
        roomClass: room ? room.className.slice(0, 120) : null,
      }));
    }, 400));
  })()`,
  awaitPromise: true,
  returnByValue: true,
});
console.log(r.result.value);
ws.close(); chrome.kill(); process.exit(0);
