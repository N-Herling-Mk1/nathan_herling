// Vector signature traced from the ink scan (skeletonise -> graph trace -> RDP
// -> bundle chain). Arc-length tables let it be drawn at constant feed.
import { SIG_DATA } from './sigdata.js';

let SIG=null;

/* The data is compiled in rather than fetched. fetch() fails on a file://
   origin, which would have made the whole page require a server just to read
   one JSON file. assets/data/signature.json is still the source of truth — the
   fetch path below stays as a fallback and for anyone loading it over HTTP. */
export async function load(url='assets/data/signature.json'){
  if (SIG_DATA) { SIG = SIG_DATA; return SIG; }
  const r=await fetch(url); SIG=await r.json(); return SIG;
}
export const get = () => SIG;
export const aspect = () => SIG ? SIG.aspect : 0.34;

// draw the whole signature into ctx, mapped into a box
export function draw(ctx, cx, cy, w, opts={}){
  if(!SIG) return;
  const s=w/2;
  ctx.save();
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle=opts.color||'#9fdcf4';
  ctx.lineWidth=opts.width||Math.max(1.2, w*0.0055);
  if(opts.glow){ ctx.shadowColor=opts.glow; ctx.shadowBlur=opts.blur||14; }
  for(const st of SIG.strokes){
    ctx.beginPath();
    st.pts.forEach((p,i)=>{
      const x=cx+p[0]*s, y=cy-p[1]*s;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    });
    ctx.stroke();
  }
  ctx.restore();
}

// progressive draw: 0..1 of total arc length, for laser-etch reveals
export function drawTo(ctx, cx, cy, w, u, opts={}){
  if(!SIG) return null;
  const s=w/2, total=SIG.total||SIG.strokes.reduce((a,b)=>a+b.len,0);
  let budget=u*total, head=null;
  ctx.save();
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle=opts.color||'#9fdcf4';
  ctx.lineWidth=opts.width||Math.max(1.2, w*0.0055);
  if(opts.glow){ ctx.shadowColor=opts.glow; ctx.shadowBlur=opts.blur||14; }
  for(const st of SIG.strokes){
    if(budget<=0) break;
    const take=Math.min(budget, st.len); budget-=take;
    ctx.beginPath();
    let placed=false;
    for(let i=1;i<st.pts.length;i++){
      const c0=st.cum[i-1], c1=st.cum[i];
      const a=st.pts[i-1], b=st.pts[i];
      if(!placed){ ctx.moveTo(cx+a[0]*s, cy-a[1]*s); placed=true; }
      if(c1<=take){ ctx.lineTo(cx+b[0]*s, cy-b[1]*s); head=[b[0],b[1]]; }
      else{
        const f=(take-c0)/((c1-c0)||1);
        const px=a[0]+(b[0]-a[0])*f, py=a[1]+(b[1]-a[1])*f;
        ctx.lineTo(cx+px*s, cy-py*s); head=[px,py]; break;
      }
    }
    ctx.stroke();
  }
  ctx.restore();
  return head ? [cx+head[0]*s, cy-head[1]*s] : null;
}
