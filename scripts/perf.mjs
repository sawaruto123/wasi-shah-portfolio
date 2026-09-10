/**
 * Real-Chrome scroll profiler for the portfolio.
 * Uses CDP Performance.getMetrics to break main-thread time into
 * script / layout / style during a scroll of a room's inner scroller.
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
  '--disable-features=Translate,MediaRouter',
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
  waitEvent(m, ms = 20000) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`timeout ${m}`)), ms);
      const fn = (p) => { clearTimeout(t); const a = this.handlers.get(m) || []; this.handlers.set(m, a.filter((h) => h !== fn)); resolve(p); };
      this.on(m, fn);
    });
  }
}

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
  await S('Page.reload');
  await re;
  await sleep(4000);

  const gpu = await evalJs(`(()=>{const c=document.createElement('canvas');const gl=c.getContext('webgl');const e=gl&&gl.getExtension('WEBGL_debug_renderer_info');return e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'?';})()`);

  await evalJs(`(()=>{
    window.__goto=(i)=>{const t=document.documentElement.scrollHeight-window.innerHeight;window.scrollTo(0,t*(i/(${ROOM_COUNT}-1)));};
    window.__activeScroller=()=>{const a=[...document.querySelectorAll('[data-room-scroll]')];
      return a.find((el)=>{const w=el.parentElement&&el.parentElement.parentElement;return w&&w.classList.contains('opacity-100');})||a[0]||null;};
    window.__measure=(ms)=>new Promise((resolve)=>{
      const el=window.__activeScroller(); if(!el) return resolve({error:'no scroller'});
      const max=el.scrollHeight-el.clientHeight; el.scrollTop=0;
      const frames=[]; let last=performance.now(); const start=last;
      const step=()=>{const now=performance.now(); frames.push(now-last); last=now;
        const t=Math.min((now-start)/ms,1); el.scrollTop=max*t;
        if(t<1) requestAnimationFrame(step); else resolve({frames,max});};
      requestAnimationFrame(step);});
    'ok';})()`);

  const stats = (frames) => {
    const f = frames.slice(3).sort((a, b) => a - b);
    const at = (p) => f[Math.min(f.length - 1, Math.floor(f.length * p))] || 0;
    return {
      fps: +(1000 / (f.reduce((s, x) => s + x, 0) / (f.length || 1))).toFixed(1),
      median: +at(0.5).toFixed(1), p95: +at(0.95).toFixed(1), max: +Math.max(...frames).toFixed(0),
      over24ms: frames.filter((x) => x > 24).length,
    };
  };

  const topFunctions = (profile) => {
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
    return [...self.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([k, us]) => ({ function: k, ms: +(us / 1000).toFixed(1) }));
  };

  const scenarios = [
    ['baseline', ''],
    ['baseline (again)', ''],
    ['tilt will-change off', '.tilt-3d{will-change:auto!important}'],
    ['content-visibility off', '.cv-auto{content-visibility:visible!important}'],
    ['grain+lightwash off', '.film-grain,.light-wash{display:none!important}'],
    ['baseline (final)', ''],
  ];

  const rows = [];

  // ── CPU profile of the FIRST arrival at this room (cold) ────────
  await S('Profiler.enable');
  await S('Profiler.setSamplingInterval', { interval: 150 });
  await S('Profiler.start');
  await evalJs(`window.__goto(${ROOM_INDEX});'ok'`);
  await sleep(2800);
  const cold = (await S('Profiler.stop')).profile;
  console.log('\nTOP SELF-TIME: FIRST ARRIVAL (cold):');
  console.table(topFunctions(cold));
  for (const [label, css] of scenarios) {
    await evalJs(`(()=>{let s=document.getElementById('perf-ov');if(!s){s=document.createElement('style');s.id='perf-ov';document.head.appendChild(s);}s.textContent=${JSON.stringify(css)};return 'ok';})()`);
    await evalJs(`window.__goto(${ROOM_INDEX});'ok'`);
    await sleep(3200); // let room-entry animations finish
    await evalJs(`window.__measure(900)`, true); // warm-up pass
    await sleep(500);
    const m0 = await metrics();
    const r = await evalJs(`window.__measure(2200)`, true);
    const m1 = await metrics();
    if (r.error) { rows.push({ label, error: r.error }); continue; }
    const d = (k) => +(((m1[k] || 0) - (m0[k] || 0)) * 1000).toFixed(1);
    rows.push({
      label,
      ...stats(r.frames),
      scriptMs: d('ScriptDuration'),
      styleMs: d('RecalcStyleDuration'),
      layoutMs: d('LayoutDuration'),
      layoutCount: Math.round((m1.LayoutCount || 0) - (m0.LayoutCount || 0)),
      styleCount: Math.round((m1.RecalcStyleCount || 0) - (m0.RecalcStyleCount || 0)),
      taskMs: d('TaskDuration'),
    });
  }

  console.log('\nGPU:', gpu);
  console.log('room index:', ROOM_INDEX, '| scroll window 2.2s\n');
  console.table(rows);

  // ── CPU profile of a baseline scroll ───────────────────────────
  await evalJs(`(()=>{const s=document.getElementById('perf-ov');if(s)s.textContent='';return 'ok';})()`);
  await evalJs(`window.__goto(${ROOM_INDEX});'ok'`);
  await sleep(3200);
  await evalJs(`window.__measure(900)`, true);
  await sleep(400);
  await S('Profiler.enable');
  await S('Profiler.setSamplingInterval', { interval: 150 });
  await S('Profiler.start');
  await evalJs(`window.__measure(2500)`, true);
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
  const top = [...self.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([k, us]) => ({ function: k, ms: +(us / 1000).toFixed(1) }));
  console.log('\nTOP SELF-TIME DURING SCROLL (baseline):');
  console.table(top);

  ws.close(); chrome.kill();
  try { rmSync(userDir, { recursive: true, force: true }); } catch { /* ignore */ }
}

main().catch((e) => { console.error('FAILED:', e.message); try { chrome.kill(); } catch { /* ignore */ } process.exit(1); });
