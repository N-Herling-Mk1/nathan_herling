// Rotating placard desktop. Flat disc expands into 3D, a centre sphere prints
// the placards onto the surface, then the user drives it: drag to spin with
// inertia and snap, or hover a panel above to snap that face to camera.
// FIRST PASS - panel content is stubbed, see docs/panels.csv
import { CFG, easeIO, clamp01 } from './config.js';

let wrapEl=null, deskEl=null, panelsEl=null, printerEl=null, openEl=null, rightEl=null;
let cards=[], N=4, R=210;
let ang=0, vel=0, dragging=false, lastX=0, lastT=0, snapping=false, target=null;
let expanded=0, printed=0, live=false;

export function init(root){
  rightEl=root;
  wrapEl=root.querySelector('#desk-wrap');
  deskEl=root.querySelector('#desk');
  panelsEl=root.querySelector('#panels');
  printerEl=root.querySelector('#printer');
  openEl=document.querySelector('#open');
  N=CFG.panels.length;

  CFG.panels.forEach((p,i)=>{
    const c=document.createElement('div');
    c.className='placard';
    c.innerHTML='<span class="l">'+p.label+'</span><span class="b">'+p.blurb+'</span>';
    c.addEventListener('click', ()=>openPanel(i));
    deskEl.appendChild(c); cards.push(c);

    const b=document.createElement('button');
    b.className='pbtn'; b.type='button';
    b.innerHTML='<span class="l">'+p.label+'</span><span class="b">'+p.blurb+'</span>';
    b.addEventListener('mouseenter', ()=>snapTo(i));
    b.addEventListener('focus',      ()=>snapTo(i));
    b.addEventListener('click',      ()=>openPanel(i));
    panelsEl.appendChild(b);
  });

  wrapEl.addEventListener('pointerdown', e=>{
    if(!live) return;
    dragging=true; snapping=false; lastX=e.clientX; lastT=performance.now();
    wrapEl.classList.add('grabbing');
    wrapEl.setPointerCapture && wrapEl.setPointerCapture(e.pointerId);
  });
  wrapEl.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const now=performance.now(), dx=e.clientX-lastX, dt=Math.max(1,now-lastT);
    ang += dx*0.35; vel = dx*0.35/dt*16;
    lastX=e.clientX; lastT=now;
  });
  const release=()=>{ if(!dragging) return; dragging=false;
    wrapEl.classList.remove('grabbing'); snapNearest(); };
  wrapEl.addEventListener('pointerup', release);
  wrapEl.addEventListener('pointercancel', release);

  root.querySelector('#prev').addEventListener('click', ()=>step(-1));
  root.querySelector('#next').addEventListener('click', ()=>step(1));
  document.querySelector('#open-close').addEventListener('click', closePanel);
}

const stepAng = () => 360/N;
function snapTo(i){ target=-i*stepAng(); snapping=true; vel=0; markCurrent(i); }
function step(d){ snapTo(((facing()+d)%N+N)%N); }
function facing(){ return ((Math.round(-ang/stepAng())%N)+N)%N; }
function snapNearest(){ snapTo(facing()); }
function markCurrent(i){
  [].forEach.call(panelsEl.children,(b,k)=>b.setAttribute('aria-current', k===i?'true':'false'));
  cards.forEach((c,k)=>c.classList.toggle('face', k===i));
}
function openPanel(i){
  const p=CFG.panels[i];
  snapTo(i);
  openEl.querySelector('h2').textContent=p.label;
  const body=openEl.querySelector('.body');
  if(p.kind==='pdf' && p.target)
    body.innerHTML='<p>'+p.blurb+'</p><p><a href="'+p.target+'" target="_blank" rel="noopener">open pdf &rarr;</a></p>';
  else
    body.innerHTML='<p>'+p.blurb+'</p><p style="color:var(--ink-dim)">stub — content not yet defined.</p>';
  openEl.classList.add('on');
  rightEl.classList.add('minimised');
}
function closePanel(){ openEl.classList.remove('on'); rightEl.classList.remove('minimised'); }

// beat progress drives the boot: flat -> 3D, then the printer lays the cards
export function boot(pDesk, pPrint, pLive){
  expanded=easeIO(clamp01(pDesk));
  printed=clamp01(pPrint);
  R=110+120*expanded;
  printerEl.classList.toggle('on', pDesk>0.35);
  cards.forEach((c,i)=>{
    const at=i/N;
    c.classList.toggle('printed', printed>at);
  });
  if(pLive>=1 && !live){ live=true; markCurrent(facing()); }
}
export function frame(now){
  if(!deskEl) return;
  if(!dragging && !snapping){
    ang += vel; vel *= 0.94;
    if(Math.abs(vel)<0.02) vel=0;
  }
  if(snapping && target!==null){
    // shortest path to the target angle
    let d=target-ang; while(d>180) d-=360; while(d<-180) d+=360;
    ang += d*0.16;
    if(Math.abs(d)<0.15){ ang=target; snapping=false; }
  }
  deskEl.classList.toggle('snapping', snapping);
  const tilt=-52+52*expanded;      // flat disc -> raked 3D desk
  deskEl.style.transform='rotateX('+tilt.toFixed(2)+'deg) rotateY('+ang.toFixed(2)+'deg)';
  cards.forEach((c,i)=>{
    const a=i*stepAng();
    c.style.transform='rotateY('+a+'deg) translateZ('+R.toFixed(1)+'px) rotateX('+(-tilt).toFixed(2)+'deg)';
  });
  if(live) markCurrent(facing());
}
