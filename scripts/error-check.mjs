import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9235;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--enable-unsafe-swiftshader',`--remote-debugging-port=${PORT}`,'--user-data-dir='+join(tmpdir(),'chrome-err-'+Date.now()),'--no-first-run','about:blank']);
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
const consoleMsgs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  else if (m.method === 'Runtime.consoleAPICalled') {
    consoleMsgs.push({ type: m.params.type, args: m.params.args.map(a => a.value ?? a.description ?? '').join(' ') });
  }
  else if (m.method === 'Runtime.exceptionThrown') {
    consoleMsgs.push({ type: 'exception', args: m.params.exceptionDetails?.exception?.description ?? m.params.exceptionDetails?.text ?? JSON.stringify(m.params.exceptionDetails) });
  }
};
await new Promise((r) => (ws.onopen = r));
function send(method, params) { return new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); }); }

await send('Runtime.enable', {});
await send('Page.enable', {});
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 9000));

const r = await send('Runtime.evaluate', {
  expression: `(() => {
    const eb = document.body.innerText || '';
    return JSON.stringify({
      bodyText: eb.slice(0, 300),
      hasSomethingWrong: eb.includes('Something went wrong'),
    });
  })()`,
  returnByValue: true,
});
console.log('PAGE:', r.result.value);
console.log('CONSOLE:');
for (const m of consoleMsgs.slice(-15)) console.log('  [' + m.type + ']', String(m.args).slice(0, 500));
ws.close(); chrome.kill(); process.exit(0);
