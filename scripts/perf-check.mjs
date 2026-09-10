import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9255;
const SITE = 'https://wasi-shah-portfolio.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--enable-unsafe-swiftshader','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--user-data-dir='+join(tmpdir(),'chrome-perf-'+Date.now()),'--no-first-run','--window-size=1440,900','about:blank']);
async function ws(){for(let i=0;i<60;i++){try{const l=await(await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();const p=l.find(x=>x.type==='page');if(p)return p.webSocketDebuggerUrl;}catch{}await sleep(200);}throw new Error('nd');}
const sock=new WebSocket(await ws());let id=0;const pend=new Map();
sock.onmessage=(e)=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result);pend.delete(m.id);}};
await new Promise(r=>(sock.onopen=r));
const send=(m,p)=>new Promise(res=>{const i=++id;pend.set(i,res);sock.send(JSON.stringify({id:i,method:m,params:p}));});
const ev=(expression)=>send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
await send('Page.enable',{});await send('Runtime.enable',{});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:SITE+'/'});await sleep(4000);
await ev(`localStorage.setItem('ws-onboarded','1');localStorage.setItem('ws-cookie-consent','accepted');'ok'`);
await send('Page.reload',{});await sleep(9000);

async function fps(label, scrollFrac){
  await ev(`window.scrollTo(0,(${scrollFrac})*(document.documentElement.scrollHeight-window.innerHeight));'ok'`);
  await sleep(3500);
  const r = await ev(`new Promise((res)=>{let n=0;const t0=performance.now();function f(){n++;const dt=performance.now()-t0;if(dt<3000)requestAnimationFrame(f);else res(JSON.stringify({fps:+(n/(dt/1000)).toFixed(1), imgs:document.querySelectorAll('img').length, canvases:document.querySelectorAll('canvas').length}));}requestAnimationFrame(f);})`);
  console.log(label, r.result.value);
}
await fps('Studio(1) ', 0.25);
await fps('Gallery(2)', 0.5);
await fps('Cinema(3) ', 0.75);
sock.close();chrome.kill();process.exit(0);
