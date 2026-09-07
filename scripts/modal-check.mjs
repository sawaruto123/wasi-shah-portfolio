import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9230;
const SITE = 'http://127.0.0.1:3000/';

const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--enable-unsafe-swiftshader',`--remote-debugging-port=${PORT}`,'--user-data-dir='+join(tmpdir(),'chrome-mdl-'+Date.now()),'--no-first-run','about:blank']);
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
  if (m.method === 'Runtime.exceptionThrown') logs.push('[exc] ' + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text || ''));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('[err] ' + (m.params.args || []).map(a => a.value ?? a.description ?? '').join(' '));
};
await new Promise((r) => (ws.onopen = r));
function send(method, params) { return new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); }); }

await send('Runtime.enable', {});
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
await send('Page.enable', {});
await send('Page.navigate', { url: SITE });
await new Promise((r) => setTimeout(r, 12000));

const result = await send('Runtime.evaluate', {
  expression: `(() => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, (2/4) * total); // Archive (room 2)
    return new Promise((res) => setTimeout(() => {
      const card = document.querySelector('#room-gallery article, [id="room-gallery"] article, article');
      const clicked = card ? (card.click(), true) : false;
      setTimeout(() => {
        const modal = document.querySelector('.modal-enter');
        res(JSON.stringify({
          clicked,
          modalExists: !!modal,
          modalText: modal ? modal.textContent.slice(0, 80) : null,
          errors: 'captured separately',
        }));
      }, 800);
    }, 600));
  })()`,
  awaitPromise: true,
  returnByValue: true,
});
console.log('result:', result.result.value);
console.log('errors:', logs.slice(0, 10));
ws.close(); chrome.kill(); process.exit(0);
