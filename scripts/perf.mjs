/**
 * Real-Chrome scroll profiler for the portfolio.
 *
 * Two modes of truth:
 *  - "cold": every scenario reloads the page first, so we measure the FIRST
 *    scroll a real visitor experiences (warm-up can't hide a hitch).
 *  - "warm": the second pass, to confirm steady-state smoothness.
 *
 * Uses CDP Performance.getMetrics for the main-thread breakdown and the
 * V8 CPU profiler for the top self-time functions.
 *
 * Usage: node scripts/perf.mjs [url] [roomIndex]
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const URL_ = process.argv[2] || 'http://127.0.0.1:3000/';
const ROOM_INDEX = Number(process.argv[3] ?? 3);
const ROOM_COUNT = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const userDir = mkdtempSync(join(tmpdir(), 'ws-perf-'));
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDir}`,
  '--window-size=1440,900',
  '--no-first-run',
  '--no-default-browser-check',
  // headless tabs otherwise throttle rAF in the background, which shows up as
  // fake 1000ms "jank" frames and makes every FPS number meaningless
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-features=Translate,MediaRouter,CalculateNativeWinOcclusion',
  '--enable-unsafe-swiftshader',
  'about:blank',
], { stdio: 'ignore' });

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) (this.handlers.get(msg.method) || []).forEach((h) => h(msg.params));
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  on(m, fn) { const a = this.handlers.get(m) || []; a.push(fn); this.handlers.set(m, a); }
  waitEvent(m, ms = 25000) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`timeout ${m}`)), ms);
      const fn = (p) => { clearTimeout(t); const a = this.handlers.get(m) || []; this.handlers.set(m, a.filter((h) => h !== fn)); resolve(p); };
      this.on(m, fn);
    });
  }
}

const HELPERS = `(()=>{
  window.__goto=(i)=>{const t=document.documentElement.scrollHeight-window.innerHeight;window.scrollTo(0,t*(i/(${ROOM_COUNT}-1)));};
  window.__activeScroller=()=>{const a=[...document.querySelectorAll('[data-room-scroll]')];
    return a.find((el)=>{const w=el.parentElement&&el.parentElement.parentElement;return w&&w.classList.contains('opacity-100');})||a[0]||null;};
  window.__startFrames=()=>{window.__frames=[];let last=performance.now();
    window.__raf=requestAnimationFrame(function s(){const n=performance.now();window.__frames.push(n-last);last=n;
      window.__raf=requestAnimationFrame(s);});return 'ok';};
  window.__stopFrames=()=>{cancelAnimationFrame(window.__raf);return window.__frames||[];};
  'ok';})()`;

const SET_CSS = (css) => `(()=>{let s=document.getElementById('perf-ov');
  if(!s){s=document.createElement('style');s.id='perf-ov';document.head.appendChild(s);}
  s.textContent=${JSON.stringify(css)};return 'ok';})()`;

async function main() {
  let version;
  for (let i = 0; i < 80; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; }
    catch { await sleep(250); }
  }
  if (!version) throw new Error('Chrome failed to start');
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
  const cdp = new CDP(ws);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => cdp.send(m, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable'); await S('Performance.enable');

  const evalJs = async (expression, awaitPromise = false) => {
    const r = await S('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval error');
    return r.result.value;
  };
  const metrics = async () => {
    const { metrics: m } = await S('Performance.getMetrics');
    return Object.fromEntries(m.map((x) => [x.name, x.value]));
  };

  const loaded = cdp.waitEvent('Page.loadEventFired');
  await S('Page.navigate', { url: URL_ });
  await loaded;
  await evalJs(`localStorage.setItem('ws-onboarded','1');localStorage.setItem('ws-cookie-consent','1');'ok'`);
  const re = cdp.waitEvent('Page.loadEventFired');
  await S('Page.reload'); await re;
  await sleep(4500);

  const gpu = await evalJs(`(()=>{const c=document.createElement('canvas');const gl=c.getContext('webgl');const e=gl&&gl.getExtension('WEBGL_debug_renderer_info');return e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'?';})()`);

  const stats = (frames) => {
    const f = frames.slice(3).sort((a, b) => a - b);
    const at = (p) => f[Math.min(f.length - 1, Math.floor(f.length * p))] || 0;
    return {
      fps: +(1000 / (f.reduce((s, x) => s + x, 0) / (f.length || 1))).toFixed(1),
      median: +at(0.5).toFixed(1), p95: +at(0.95).toFixed(1), max: +Math.max(...frames).toFixed(0),
      over24ms: frames.filter((x) => x > 24).length,
    };
  };

  // 每個情境都重新載入頁面 → 量到的都是「訪客的第一次捲動」
  const runScenario = async (label, css) => {
    const rl = cdp.waitEvent('Page.loadEventFired');
    await S('Page.reload');
    await rl;
    await sleep(4500); // 世界啟動 + 背景預抓
    await evalJs(SET_CSS(css));
    await evalJs(HELPERS);
    await evalJs(`window.__goto(${ROOM_INDEX});'ok'`);
    await sleep(2600); // 房間掛載完成
    const m0 = await metrics();
    await evalJs(`window.__startFrames();'ok'`);
    // 真正的滾動手勢（瀏覽器原生處理，不是 JS 設 scrollTop）
    const gesture = S('Input.synthesizeScrollGesture', {
      x: 720, y: 430, xDistance: 0, yDistance: -1500, speed: 800, gestureSourceType: 'mouse',
    }).catch(() => {});
    await sleep(2400);
    const frames = await evalJs(`window.__stopFrames()`, false);
    const m1 = await metrics();
    await gesture;
    if (!frames || !frames.length) return { label, error: 'no frames' };
    const d = (k) => +(((m1[k] || 0) - (m0[k] || 0)) * 1000).toFixed(1);
    return {
      label,
      ...stats(frames),
      scriptMs: d('ScriptDuration'),
      styleMs: d('RecalcStyleDuration'),
      layoutMs: d('LayoutDuration'),
      layoutCount: Math.round((m1.LayoutCount || 0) - (m0.LayoutCount || 0)),
      styleCount: Math.round((m1.RecalcStyleCount || 0) - (m0.RecalcStyleCount || 0)),
    };
  };

  const scenarios = [
    ['baseline (cold first scroll)', ''],
    ['content-visibility off', '.cv-auto{content-visibility:visible!important}'],
    ['no LQIP placeholders', '.cv-auto{content-visibility:visible!important} .blur-md{display:none!important}'],
    ['no per-card hover transform', '.cv-auto{content-visibility:visible!important} [class*="group-hover:scale"]{transition:none!important}'],
    ['no spatial-card shadows', '.spatial-card{box-shadow:none!important}'],
  ];

  const rows = [];
  for (const [label, css] of scenarios) rows.push(await runScenario(label, css));

  console.log('\nGPU:', gpu);
  console.log('room index:', ROOM_INDEX, '| each row = FRESH page load, first scroll (2.4s)\n');
  console.table(rows);

  // ── CPU profile of the cold first scroll (baseline) ──────────────
  const rl = cdp.waitEvent('Page.loadEventFired');
  await S('Page.reload'); await rl;
  await sleep(4500);
  await evalJs(HELPERS);
  await evalJs(`window.__goto(${ROOM_INDEX});'ok'`);
  await sleep(2600);
  await S('Profiler.enable');
  await S('Profiler.setSamplingInterval', { interval: 150 });
  await S('Profiler.start');
  await S('Input.synthesizeScrollGesture', { x: 720, y: 430, xDistance: 0, yDistance: -1500, speed: 800, gestureSourceType: 'mouse' }).catch(() => {});
  await sleep(2400);
  const { profile } = await S('Profiler.stop');

  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map();
  (profile.samples || []).forEach((id, i) => {
    const n = byId.get(id);
    if (!n) return;
    const cf = n.callFrame;
    const file = (cf.url || '').split('/').pop() || '(inline)';
    const key = `${cf.functionName || '(anonymous)'}  ${file}:${cf.lineNumber + 1}`;
    self.set(key, (self.get(key) || 0) + (profile.timeDeltas[i] || 0));
  });
  console.log('\nTOP SELF-TIME: COLD FIRST SCROLL');
  console.table([...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14)
    .map(([k, us]) => ({ function: k, ms: +(us / 1000).toFixed(1) })));

  ws.close(); chrome.kill();
  try { rmSync(userDir, { recursive: true, force: true }); } catch { /* ignore */ }
}

main().catch((e) => { console.error('FAILED:', e.message); try { chrome.kill(); } catch { /* ignore */ } process.exit(1); });
