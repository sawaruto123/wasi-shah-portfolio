/**
 * Temp: verify the still zoom view shows a proper loading skeleton.
 * Throttles the network + disables cache so the loading state is observable.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9488;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const userDir = mkdtempSync(join(tmpdir(), 'ws-skel-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  '--window-size=1440,900', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
  '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.h = new Map();
    ws.addEventListener('message', (e) => { const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) { const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); }
      else if (m.method) (this.h.get(m.method) || []).forEach((f) => f(m.params)); }); }
  send(method, params = {}, sessionId) { const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { resolve: res, reject: rej });
      this.ws.send(JSON.stringify({ id, method, params, sessionId })); }); }
  on(m, f) { const a = this.h.get(m) || []; a.push(f); this.h.set(m, a); }
  waitEvent(m, ms = 30000) { return new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout ' + m)), ms);
    const f = (p) => { clearTimeout(t); const a = this.h.get(m) || []; this.h.set(m, a.filter((x) => x !== f)); res(p); };
    this.on(m, f); }); }
}

const PROBE = `(()=>{
  const modal=[...document.querySelectorAll('div')].find(d=>d.className && String(d.className).includes('modal-enter'));
  if(!modal) return {err:'no modal'};
  const box=modal.querySelector('[style*="aspect-ratio"], [style*="aspectRatio"]');
  const skel=modal.querySelector('.animate-pulse');
  const lqip=[...modal.querySelectorAll('div')].filter(d=>d.style && d.style.backgroundImage.includes('url'));
  const imgs=[...modal.querySelectorAll('img')].map(i=>({loaded:i.complete && i.naturalWidth>0, op:getComputedStyle(i).opacity}));
  return {
    boxSize: box ? Math.round(box.getBoundingClientRect().width)+'x'+Math.round(box.getBoundingClientRect().height) : null,
    hasSkeleton: !!skel,
    hasBlurPreview: lqip.length>0,
    imgStates: imgs,
  };
})()`;

async function main() {
  let v;
  for (let i = 0; i < 80; i++) { try { v = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(250); } }
  const ws = new WebSocket(v.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }); });
  const cdp = new CDP(ws);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => cdp.send(m, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable'); await S('Network.enable');
  const js = async (e) => (await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value;

  const loaded = cdp.waitEvent('Page.loadEventFired');
  await S('Page.navigate', { url: 'https://wasi-shah-portfolio.vercel.app/' }); await loaded;
  await js(`localStorage.setItem('ws-onboarded','1');localStorage.setItem('ws-cookie-consent','1');'ok'`);
  const re = cdp.waitEvent('Page.loadEventFired');
  await S('Page.reload'); await re;
  await sleep(6500);
  await js(`(()=>{const t=document.documentElement.scrollHeight-window.innerHeight;window.scrollTo(0,t*0.75);return 1;})()`);
  await sleep(2600);

  // now make the network crawl, and drop the cache, so loading is visible
  await S('Network.setCacheDisabled', { cacheDisabled: true });
  await S('Network.emulateNetworkConditions', { offline: false, latency: 300, downloadThroughput: 60 * 1024, uploadThroughput: 30 * 1024 });

  await js(`(()=>{
    const s=[...document.querySelectorAll('[data-room-scroll]')]
      .find(el=>{const w=el.parentElement&&el.parentElement.parentElement;return w&&w.classList.contains('opacity-100');});
    const h=s && [...s.querySelectorAll('h3')].find(x=>/^Daily$/i.test(x.textContent.trim()));
    if(h) h.scrollIntoView({block:'start'});
    const b=s && [...s.querySelectorAll('button')].filter(x=>x.querySelector('img'))[0];
    if(b) b.click();
    return 1;
  })()`);

  await sleep(900);
  console.log('--- WHILE LOADING (throttled) ---');
  console.log(JSON.stringify(await js(PROBE), null, 2));
  writeFileSync('C:/Users/syedw/Downloads/skeleton-loading.jpg', Buffer.from((await S('Page.captureScreenshot', { format: 'jpeg', quality: 90 })).data, 'base64'));

  await S('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await sleep(6000);
  console.log('\n--- AFTER LOADING ---');
  console.log(JSON.stringify(await js(PROBE), null, 2));
  writeFileSync('C:/Users/syedw/Downloads/skeleton-loaded.jpg', Buffer.from((await S('Page.captureScreenshot', { format: 'jpeg', quality: 88 })).data, 'base64'));

  ws.close(); chrome.kill();
  try { rmSync(userDir, { recursive: true, force: true }); } catch { /* ignore */ }
}
main().catch((e) => { console.error('FAILED', e.message); try { chrome.kill(); } catch { /* ignore */ } process.exit(1); });
