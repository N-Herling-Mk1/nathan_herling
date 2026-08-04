import { CFG, OFF, TOTAL, idx, easeIO, clamp01 } from './config.js';
import * as audio  from './audio.js';
import * as sig    from './signature.js';
import * as crt    from './crt.js';
import * as etch   from './etch.js';
import * as cube   from './cube.js';
import * as shell  from './shell.js';
import * as desk   from './desktop.js';

const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

let act=1, t0=0, entered=false;
const crtEl=$('#crt');

function p(name, e){
  const i=idx(name);
  if(i<0) return 0;
  return clamp01((e-OFF[i])/CFG.beats[i].ms);
}

function enter(){
  if(entered) return;
  entered=true;
  audio.unlock();
  audio.wipe();
  crtEl.classList.add('wiping');
  crt.surge(crtEl, 120);
  setTimeout(()=>{
    act=2; t0=performance.now();
    shell.show();
    $('#enterBtn').classList.add('hidden');
    etch.clear();
  }, 260);
  try{ sessionStorage.setItem('nh_seen','1'); }catch(err){}
}

function loop(now){
  if(act===1){
    crt.frame(now);
    etch.frame(now);
  }else{
    const e=Math.min(TOTAL, now-t0);
    shell.frame(e);
    if(e>=OFF[idx('MOVE')]) shell.dock();
    if(e>=OFF[idx('MOVE')]) $('#cube-wrap').classList.add('docked');
    $('#cube-wrap').style.opacity = e>=OFF[idx('MOVE')] ? easeIO(p('MOVE',e)).toFixed(3) : '0';
    $('#placard').style.opacity   = easeIO(p('PLACARD',e)).toFixed(3);
    if(p('DESK',e)>0) $('#right').classList.add('live');
    desk.boot(p('DESK',e), p('PRINT',e), p('LIVE',e));
    desk.frame(now);
  }
  cube.frame(now);
  requestAnimationFrame(loop);
}

async function start(){
  await sig.load();
  crt.init($('#screen'));
  etch.init($('#etch'));
  cube.init($('#cube-wrap'));
  shell.init($('#term'));
  desk.init($('#right'));
  drawPlacard();

  $('#enterBtn').addEventListener('click', enter);
  addEventListener('keydown', e=>{ if(act===1 && e.key!=='Tab'){ e.preventDefault(); enter(); } });
  addEventListener('resize', ()=>{ crt.resize(); cube.resize(); drawPlacard(); });

  if(reduced){ enter(); }
  t0=performance.now();
  requestAnimationFrame(loop);
}

// bottom-left identity placard: signature over the url
function drawPlacard(){
  const c=$('#placard-canvas'); if(!c) return;
  const r=c.getBoundingClientRect();
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.round(r.width*dpr); c.height=Math.round(r.height*dpr);
  const x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);
  sig.draw(x, c.width*0.5, c.height*0.40, c.width*0.86,
    {color:'#bfeaff', width:Math.max(1.4,c.width*0.006), glow:'rgba(79,214,255,.55)', blur:12});
  x.font='500 '+Math.round(c.width*0.072)+"px 'Share Tech Mono', monospace";
  x.textAlign='center'; x.textBaseline='middle';
  x.shadowColor='rgba(255,178,74,.6)'; x.shadowBlur=14;
  x.fillStyle='#ffb24a';
  x.fillText(CFG.domain, c.width*0.5, c.height*0.80);
}

start();
