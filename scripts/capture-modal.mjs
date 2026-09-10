import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9252;
const SITE = 'https://wasi-shah-portfolio.vercel.app';
const OUT = '<home>\\Downloads';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--enable-unsafe-swiftshader','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--user-data-dir='+join(tmpdir(),'chrome-modal-'+Date.now()),'--no-first-run','--window-size=1440,900','about:blank']);
async function ws() { for (let i=0;i<60;i++){ try { const l=await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p=l.find(x=>x.type==='page'); if(p) return p.webSocketDebuggerUrl; } catch {} await sleep(200);} throw new Error('no dbg'); }
const sock = new WebSocket(await ws());
let id=0; const pend=new Map();
sock.onmessage=(e)=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result);pend.delete(m.id);}};
await new Promise(r=>(sock.onopen=r));
const send=(method,params)=>new Promise(res=>{const i=++id;pend.set(i,res);sock.send(JSON.stringify({id:i,method,params}));});
const evalJs=(expression)=>send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
const shot=async(name)=>{const s=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(OUT,name),Buffer.from(s.data,'base64'));console.log('shot',name);};

await send('Page.enable',{});
await send('Runtime.enable',{});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:2,mobile:false});
await send('Page.navigate',{url:SITE+'/'});
await sleep(4000);
await evalJs(`localStorage.setItem('ws-onboarded','1'); localStorage.setItem('ws-cookie-consent','accepted'); 'ok'`);
await send('Page.reload',{});
await sleep(9000);
// scroll to Archive (room 2/5)
await evalJs(`window.scrollTo(0,(2/4)*(document.documentElement.scrollHeight-window.innerHeight)); 'ok'`);
await sleep(3000);
// open Portfolio World
const opened = await evalJs(`(() => { const c=[...document.querySelectorAll('article')].find(el=>el.textContent.includes('Portfolio World')); if(c){c.click();return 'clicked';} return 'not found'; })()`);
console.log('open:', opened.result?.value);
await sleep(3000);
await shot('modal-top.png');
// scroll the modal to the bottom (details/diagram)
await evalJs(`(() => { const s=document.querySelector('.modal-enter .overflow-y-auto'); if(s) s.scrollTo(0, s.scrollHeight); return 'ok'; })()`);
await sleep(1500);
await shot('modal-details.png');
sock.close(); chrome.kill(); process.exit(0);
