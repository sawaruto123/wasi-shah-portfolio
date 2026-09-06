// Captures console messages (including WebGL shader errors) from the page.
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9225;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=' + join(tmpdir(), 'chrome-console-' + Date.now()),
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
const logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === 'Runtime.consoleAPICalled') {
    const t = m.params.type;
    const vals = (m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
    logs.push(`[${t}] ${vals}`);
  }
  if (m.method === 'Runtime.exceptionThrown') {
    logs.push('[exception] ' + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text || ''));
  }
};
await new Promise((r) => (ws.onopen = r));
function send(method, params) {
  return new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
}

await send('Runtime.enable', {});
await send('Log.enable', {});
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
await send('Page.enable', {});
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 12000));

// inspect canvas + scene state
const canvasInfo = await send('Runtime.evaluate', {
  expression: `(() => {
    const c = document.querySelector('canvas');
    const root = document.getElementById('root');
    return JSON.stringify({ canvasExists: !!c, canvasSize: c ? c.width + 'x' + c.height : null, htmlClass: document.documentElement.className, bodyBg: getComputedStyle(document.body).backgroundColor });
  })()`,
  returnByValue: true,
});
console.log('canvas info:', canvasInfo.result.value);

const errs = logs.filter((l) => /error|shader|webgl|failed|undefined|null/i.test(l));
console.log('=== console messages (errors filtered) ===');
if (errs.length === 0) console.log('(no errors logged)');
errs.slice(0, 40).forEach((l) => console.log(l.slice(0, 400)));
console.log('=== total log lines:', logs.length);

ws.close();
chrome.kill();
process.exit(0);
