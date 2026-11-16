(()=>{
const view=document.getElementById('view'),vx=view.getContext('2d');
const R=Math.random,rr=(a,b)=>a+R()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),TAU=6.2832;
const hsl=(h,s,l,a=1)=>`hsla(${(h%360)|0},${s|0}%,${clamp(l,0,100)|0}%,${a})`;
const BG='#f1e9da';
let K=(()=>{try{const v=parseFloat(JSON.parse(localStorage.getItem('spd6-ui')||'{}').cs);return [1.5,2,3,4,6].includes(v)?v:1;}catch(e){return 1;}})();
let W=0,H=0,DPR=1,paint=null,px=null;
const undoStack=[];let lastSnap=0,shp=0,rec=null;
let hc=null,hx=null;const HS=.5,GS=.8;
const glc=document.getElementById('gl');let gl=null,useGL=false,texP=null,texH=null,gU={},gd=0;
const touchGL=()=>{gd=performance.now()+700;};
const MC=8;let mc=null,mx=null,mw=0,mh=0,mapT=0,mapData=null;
function mapInit(){mw=Math.ceil(W/MC);mh=Math.ceil(H/MC);mc=document.createElement('canvas');mc.width=mw;mc.height=mh;mx=mc.getContext('2d',{willReadFrequently:true});mapData=null;mapT=0;}
function mapRefresh(now){if(!mx||now-mapT<160)return;mapT=now;try{mx.drawImage(paint,0,0,paint.width,paint.height,0,0,mw,mh);mapData=mx.getImageData(0,0,mw,mh).data;}catch(e){mapData=null;}}
const paper=(()=>{const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');
for(let i=0;i<1800;i++){g.fillStyle=`rgba(${R()<.5?'90,70,40':'255,255,255'},${rr(.02,.07)})`;g.fillRect(R()*160,R()*160,rr(1,2.2),rr(1,2.2));}return c;})();
function fillBG(){px.fillStyle=BG;px.fillRect(0,0,W,H);px.fillStyle=px.createPattern(paper,'repeat');px.fillRect(0,0,W,H);}
function resize(force){
 const w=Math.round(innerWidth*K),h=Math.round(innerHeight*K),d=Math.max(.5,Math.min(devicePixelRatio||1,2)/K);
 if(!force&&w===W&&h===H&&d===DPR)return;
 undoStack.length=0;
 const old=paint,oldH=hc,ow=W,oh=H;W=w;H=h;DPR=d;
 view.width=W*DPR;view.height=H*DPR;
 paint=document.createElement('canvas');paint.width=W*DPR;paint.height=H*DPR;
 px=paint.getContext('2d');px.setTransform(DPR,0,0,DPR,0,0);fillBG();mapInit();
 hc=document.createElement('canvas');hc.width=Math.ceil(W*DPR*HS);hc.height=Math.ceil(H*DPR*HS);hx=hc.getContext('2d');hx.setTransform(hc.width/W,0,0,hc.height/H,0,0);hx.fillStyle='#000';hx.fillRect(0,0,W,H);
 glc.width=Math.round(W*DPR*GS);glc.height=Math.round(H*DPR*GS);
 if(old){px.drawImage(old,0,0,W,H);if(oldH)hx.drawImage(oldH,0,0,W,H);}
 touchGL();
}
addEventListener('resize',()=>resize());resize();
const SKEY='spd5-paint';
function savePaint(){if(!painted)return;try{localStorage.setItem(SKEY,paint.toDataURL('image/jpeg',.82));localStorage.setItem('spd8-h',hc.toDataURL('image/jpeg',.6));}catch(e){}}
let svT=0;function saveSoon(){painted=true;clearTimeout(svT);svT=setTimeout(savePaint,4000);}
let painted=false;
function hasSaved(){try{return !!localStorage.getItem(SKEY);}catch(e){return false;}}
function resumePaint(){
 try{const d=localStorage.getItem(SKEY);if(d){const im=new Image();im.onload=()=>{px.save();px.setTransform(1,0,0,1,0,0);px.drawImage(im,0,0,paint.width,paint.height);px.restore();touchGL();};im.src=d;}
 const dh=localStorage.getItem('spd8-h');if(dh){const ih=new Image();ih.onload=()=>{hx.save();hx.setTransform(1,0,0,1,0,0);hx.drawImage(ih,0,0,hc.width,hc.height);hx.restore();touchGL();};ih.src=dh;}}catch(e){}
 painted=true;
}
addEventListener('pagehide',savePaint);
document.addEventListener('visibilitychange',()=>{if(document.hidden)savePaint();});
const MOODS={
 Dread:[[235,60,22],[260,55,30],[220,70,38],[0,0,10],[350,70,32],[150,45,30], [80,60,15], [300,50,15], [0,80,45], [200,90,10]],
 Melancholy:[[215,40,45],[230,35,60],[200,30,70],[250,30,35],[30,35,55], [190,50,20], [210,15,85], [260,20,40], [180,60,30], [0,0,25]],
 Rage:[[0,90,45],[12,95,50],[350,85,30],[28,100,55],[0,0,8], [20,100,60], [330,100,40], [0,100,20], [45,100,60], [350,100,15]],
 Joy:[[50,100,55],[330,85,62],[175,80,48],[25,95,58],[95,70,55], [190,90,60], [300,80,65], [60,100,70], [15,100,65], [140,80,50]],
 Serenity:[[185,45,60],[160,40,58],[210,50,65],[45,40,75],[270,25,68], [190,30,85], [150,30,70], [220,40,30], [30,40,80], [280,30,40]],
 Nostalgia:[[35,60,58],[15,50,50],[48,55,65],[200,30,50],[340,35,60], [25,40,30], [60,30,40], [180,25,45], [350,30,40], [40,70,75]],
 Euphoria:[[300,90,60],[190,100,55],[55,100,60],[270,90,62],[330,95,60], [160,100,50], [350,100,65], [200,100,75], [20,100,55], [280,100,40]]
};
let mood='Dread',micOn=false,gtrOn=false,wildPal='Random',blendDef=false,tapT=0,bsz=24,pd=0,ptOn=false;
const MIX_MODES = ['multiply', 'screen', 'overlay', 'hard-light', 'color-burn', 'color-dodge'];
let hueShift=270;
const WHITE={s:0,l:97},BLACK={s:0,l:6};
let leadOv=null,palMode='mood';
function rampL(f,L0){return f<.5?lerp(4,L0,f*2):lerp(L0,97,(f-.5)*2);}
function refreshPal(p,ov,hs){
 if(ov===undefined)ov=leadOv;if(hs===undefined)hs=hueShift;
 p.forEach(c=>{
  c.h=((hs+c.o)%360+360)%360;
  if(c.f!=null){c.l=rampL(c.f,ov&&ov.s>0?ov.l:50);c.s=ov?ov.s:85;}
  else{c.s=c.bs;c.l=c.bl;}
 });
 if(ov&&palMode!=='mono'){p[0].s=ov.s;p[0].l=ov.l;}
}
function makePalette(bias){
 let p;
 if(palMode==='mono'){
  const fs=[.5];for(let i=0;i<5;i++)fs.push(.04+i*.23+rr(-.03,.03));
  const rest=fs.slice(1).sort(()=>R()-.5);
  p=[.5].concat(rest).map((f,i)=>({o:i?rr(-9,9):0,f,bs:rr(55,100),bl:50,type:i%2?'wc':'oil',mix:MIX_MODES[(R()*MIX_MODES.length)|0]}));
 }else{
  const L=(mood==='Chaos'?Array.from({length:12},()=>[R()*360,rr(60,100),rr(10,90)]):MOODS[mood].slice()).sort((a,b)=>a[2]-b[2]);
  let pick;
  if(bias==null)pick=L.slice().sort(()=>R()-.5).slice(0,6);
  else{const k=Math.round(bias*(L.length-1)),s0=clamp(k-2,0,L.length-6);pick=L.slice(s0,s0+6);}
  let li=0,best=-1;pick.forEach((o,i)=>{const sc=o[1]*(1-Math.abs(o[2]-50)/50);if(sc>best){best=sc;li=i;}});
  const lead=pick[li];pick=[lead].concat(pick.filter((_,i)=>i!==li));
  p=pick.map((o,i)=>({o:(o[0]-lead[0])+rr(-8,8),bs:clamp(o[1]+rr(-6,6),5,100),bl:clamp(o[2]+rr(-5,5),4,95),type:i%2?'wc':'oil',mix:MIX_MODES[(R()*MIX_MODES.length)|0]}));
  if(R()<.5)p.forEach(q=>q.type=q.type==='oil'?'wc':'oil');p.leadH=lead[0];
  p[0].bl=clamp(p[0].bl,35,65);p[0].bs=Math.max(p[0].bs,70);
 }
 refreshPal(p);return p;
}
const pk=pal=>R()<.4?pal[0]:pal[(R()*pal.length)|0];
function underAt(x,y,r){
 if(!mapData)return null;
 let a=0,b=0,c=0;const o=[[0,0],[.5,0],[-.5,0],[0,.5],[0,-.5]];
 for(const p of o){const cx=clamp(((x+p[0]*r)/MC)|0,0,mw-1),cy=clamp(((y+p[1]*r)/MC)|0,0,mh-1),k=(cy*mw+cx)*4;a+=mapData[k];b+=mapData[k+1];c+=mapData[k+2];}
 return [a/5,b/5,c/5];
}
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const hi=Math.max(r,g,b),lo=Math.min(r,g,b),l=(hi+lo)/2,d=hi-lo;let h=0,s=0;
 if(d>1e-6){s=d/(1-Math.abs(2*l-1));if(hi===r)h=(g-b)/d+(g<b?6:0);else if(hi===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;}
 return [h,s*100,l*100];}
const hueMix=(a,b,t)=>((a+(((b-a+540)%360)-180)*t)%360+360)%360;
function mixAt(c,x,y,r){
 const u=underAt(x,y,r||10);if(!u)return c;
 const pa=clamp((Math.hypot(u[0]-241,u[1]-233,u[2]-218)-14)/110,0,1);
 if(pa<=.02)return c;
 const hs=rgb2hsl(u[0],u[1],u[2]),m=clamp(lerp(.25,.8,runny)*(c.type==='wc'?1.25:1),0,.92)*pa*(1-clamp((r||10)/70,0,.6));
 let h=c.h;if(c.s<8)h=hs[0];else if(hs[1]>=10)h=hueMix(c.h,hs[0],m);
 return Object.assign({},c,{h,s:lerp(c.s,hs[1],m*.6),l:lerp(c.l,hs[2],m*.7)});
}
function underHSL(x,y,r){const u=underAt(x,y,r);if(!u)return null;
 const pa=clamp((Math.hypot(u[0]-241,u[1]-233,u[2]-218)-14)/110,0,1);if(pa<.06)return null;
 const h=rgb2hsl(u[0],u[1],u[2]);return{h:h[0],s:h[1],l:h[2],pa};}
function mixCol(a,b,t){let h=a.h;if(a.s<8)h=b.h;else if(b.s>=10)h=hueMix(a.h,b.h,t);
 return Object.assign({},a,{h,s:lerp(a.s,b.s,t),l:lerp(a.l,b.l,t)});}
function pts(r,irr,n){n=n||12;const p=[];for(let i=0;i<n;i++){const a=i/n*TAU,k=r*(1+(R()-.5)*irr);p.push([Math.cos(a)*k,Math.sin(a)*k]);}return p;}
function path(g,p){const n=p.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
 let s=m(p[n-1],p[0]);g.beginPath();g.moveTo(s[0],s[1]);
 for(let i=0;i<n;i++){const e=m(p[i],p[(i+1)%n]);g.quadraticCurveTo(p[i][0],p[i][1],e[0],e[1]);}g.closePath();}
const SHP=[{n:'Splat'},
{n:'Pick',sm:1,p:[[0,.95],[-.45,-.1],[-.42,-.72],[0,-.88],[.42,-.72],[.45,-.1]]},
{n:'Strat',sm:1,p:[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.14],[.15,-.16],[.22,-.02],[.18,.12],[.27,.28],[.31,.52],[.24,.78],[.1,.95],[-.1,.95],[-.24,.78],[-.31,.52],[-.27,.3],[-.17,.14],[-.2,-.04],[-.12,-.2],[-.06,-.14],[-.06,-.78],[-.11,-.8]]},
{n:'Les Paul',sm:1,p:[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.15],[.13,-.1],[.26,.05],[.32,.3],[.3,.6],[.2,.88],[0,.98],[-.2,.9],[-.3,.62],[-.32,.32],[-.26,.14],[-.17,.1],[-.06,-.1],[-.06,-.78],[-.11,-.8]]},
{n:'Tele',sm:1,p:[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.08],[.18,-.04],[.21,.12],[.27,.2],[.31,.5],[.27,.8],[.14,.93],[-.14,.93],[-.27,.8],[-.31,.5],[-.27,.28],[-.2,.12],[-.14,-.08],[-.06,-.08],[-.06,-.78],[-.11,-.8]]},
{n:'Flying V',sm:0,p:[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.1],[.42,.86],[.22,.99],[0,.28],[-.22,.99],[-.42,.86],[-.06,-.1],[-.06,-.78],[-.11,-.8]]},
{n:'Explorer',sm:0,p:[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.2],[.32,-.36],[.37,-.2],[.18,.12],[.35,.9],[.17,.96],[0,.52],[-.12,.92],[-.31,.82],[-.2,.1],[-.36,-.1],[-.3,-.3],[-.06,-.2],[-.06,-.78],[-.11,-.8]]},
{n:'Acoustic',sm:1,p:[[-.1,-1],[.1,-1],[.1,-.8],[.05,-.78],[.05,-.2],[.19,-.13],[.26,.04],[.2,.2],[.22,.3],[.34,.45],[.37,.7],[.27,.92],[0,.98],[-.27,.92],[-.37,.7],[-.34,.45],[-.22,.3],[-.2,.2],[-.26,.04],[-.19,-.13],[-.05,-.2],[-.05,-.78],[-.1,-.8]]}];
const SHN=SHP.length;
function shapePath(g,id,r){const q=SHP[id],s=r*1.15,p=q.p.map(v=>[v[0]*s,v[1]*s]);
 if(q.sm){path(g,p);return;}
 g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();}
function bp(g,p,r){if(shp)shapePath(g,shp,r);else path(g,p);}
function splat(type,x,y,r,c,ang,st){
 const g=px;g.save();g.translate(x,y);g.rotate(ang);g.scale(1+st,1/(1+st*.45));
 if(hx){hx.save();hx.translate(x,y);hx.rotate(ang);hx.scale(1+st,1/(1+st*.45));hx.globalCompositeOperation='lighter';}
 const blendMode = c.mix || 'overlay';
 if(type==='oil'){
  const p=pts(r,.65,18);
  g.globalCompositeOperation='multiply';
  g.fillStyle='rgba(30,10,30,.22)';g.save();g.translate(r*.1,r*.16);bp(g,p,r);g.fill();g.restore();
  g.globalCompositeOperation = blendMode;
  g.fillStyle = hsl(c.h, c.s, c.l, 0.85);
  bp(g,pts(r*1.15,.7,18),r*1.15); g.fill();
  g.globalCompositeOperation = 'source-over';
  g.fillStyle=hsl(c.h,c.s,c.l, 0.95);
  bp(g,p,r);g.fill();
  g.save();g.scale(.62,.62);g.translate(-r*.1,-r*.12);g.fillStyle=hsl(c.h,c.s-5,c.l+12,.55);bp(g,pts(r,.6,14),r);g.fill();g.restore();
 }else{
  g.globalCompositeOperation = blendMode;
  for(let i=0;i<4;i++){g.fillStyle=hsl(c.h,c.s,Math.min(c.l+8,72),.28);{const rq=r*(1.55-i*.2);bp(g,pts(rq,.65,18),rq);}g.fill();}
 }
 if(hx){const a=type==='oil'?.3:.06;
  hx.fillStyle=`rgba(255,255,255,${a})`;bp(hx,pts(r,.65,18),r);hx.fill();
  hx.fillStyle=`rgba(255,255,255,${a*.9})`;bp(hx,pts(r*.72,.5,14),r*.72);hx.fill();
  hx.fillStyle=`rgba(255,255,255,${a*.8})`;bp(hx,pts(r*.42,.4,12),r*.42);hx.fill();}
 g.globalCompositeOperation = 'source-over'; 
 const sprayCount = Math.floor(r * rr(0.8, 1.8));
 for(let i=0; i<sprayCount; i++){
  const sr = r * rr(0.04, 0.2); 
  const dist = r * rr(0.8, 2.8); 
  const angleOffset = rr(-Math.PI/2, Math.PI/2);
  const sx = Math.cos(angleOffset) * dist;
  const sy = Math.sin(angleOffset) * dist;
  g.globalCompositeOperation = R() > 0.5 ? blendMode : 'source-over';
  g.fillStyle = type==='oil' ? hsl(c.h,c.s,c.l,0.9) : hsl(c.h,c.s,Math.min(c.l+8,72),.6);
  g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill();
  if(hx){hx.fillStyle=type==='oil'?'rgba(255,255,255,.3)':'rgba(255,255,255,.07)';hx.beginPath();hx.arc(sx,sy,sr,0,TAU);hx.fill();}
 }
 if(hx)hx.restore();
 g.restore();
}
function dot(type,x,y,r,c){px.save();
 px.globalCompositeOperation = type==='oil' ? (c.mix || 'source-over') : (c.mix || 'multiply');
 px.fillStyle=hsl(c.h,c.s,c.l,type==='oil'?0.9:.5);px.beginPath();px.arc(x,y,r,0,TAU);px.fill();
 px.restore();
 if(hx){hx.save();hx.globalCompositeOperation='lighter';hx.fillStyle=type==='oil'?'rgba(255,255,255,.3)':'rgba(255,255,255,.07)';hx.beginPath();hx.arc(x,y,r,0,TAU);hx.fill();hx.restore();}
}
const drips=[];let wild=false;const tilt={x:0,y:1};
const lerp=(a,b,t)=>a+(b-a)*t;
let runny=(()=>{try{const v=parseFloat(localStorage.getItem('spd6-run'));return isNaN(v)?.42:clamp(v,0,1);}catch(e){return .42;}})();
function addDrip(type,x,y,r,c,delay){
 if(!ui.grav||wild)return;
 const wt=runny<.04?0:clamp(.2+runny*.95,0,1);
 if(R()>wt||drips.length>140||y>H)return;
 const oil=type==='oil';
 drips.push({type,col:c,x,y,x0:x,br:clamp(r*(oil?.3:.22),1.8,9)*rr(.8,1.25),m:1,
  reach:Math.min(520,lerp(26,260,runny)*rr(.4,1.3)*(.55+Math.min(r,36)/45)),
  d:0,ph:R()*6.28,vx:0,vmax:lerp(12,90,runny)*(oil?1:1.35)*rr(.7,1.3),
  gather:lerp(1.3,.22,runny)*rr(.6,1.4),t:-delay,st:0,rt:0,run:0,stall:0,nextStall:rr(18,50),
  lx:x,ly:y,lw:.5,w:.5});
}
const runCol=(c,type,a)=>hsl(c.h,c.s*(type==='oil'?1:.9),c.l,a);
function dripW(d){
 const m=Math.max(0,1-d.d/d.reach),n=.5+.25*Math.sin(d.d*.11+d.ph)+.25*Math.sin(d.d*.037+d.ph*2),ramp=Math.min(1,.15+d.d/22);
 return Math.max(.5,d.br*(.2+.62*Math.pow(m,.55))*(.75+.5*n)*ramp);
}
function runSeg(d,x0,y0,w0,x1,y1,w1,a){
 const g=px,c=d.col,oil=d.type==='oil';
 if(Math.abs(x1-x0)>Math.abs(y1-y0)*1.2){const lw=Math.max(.8,(w0+w1)/2);g.save();g.globalCompositeOperation='source-over';g.strokeStyle=runCol(c,d.type,Math.min(1,a));g.lineCap='round';g.lineWidth=lw;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.restore();
  if(hx){hx.save();hx.globalCompositeOperation='lighter';hx.strokeStyle='rgba(255,255,255,'+((oil?.2:.07)*a)+')';hx.lineCap='round';hx.lineWidth=lw;hx.beginPath();hx.moveTo(x0,y0);hx.lineTo(x1,y1);hx.stroke();hx.restore();}return;}
 const poly=(gg,k,xo)=>{gg.beginPath();gg.moveTo(x0-w0*k/2+xo,y0-.3);gg.lineTo(x0+w0*k/2+xo,y0-.3);gg.lineTo(x1+w1*k/2+xo,y1+.15);gg.lineTo(x1-w1*k/2+xo,y1+.15);gg.closePath();gg.fill();};
 g.save();
 if(!oil&&w1>2.4){g.globalCompositeOperation='multiply';g.fillStyle=hsl(c.h,c.s,c.l,a*.07);poly(g,2.4,0);}
 g.globalCompositeOperation='source-over';g.fillStyle=runCol(c,d.type,Math.min(1,a));poly(g,1,0);
 g.restore();
 if(hx){hx.save();hx.globalCompositeOperation='lighter';const h=oil?.2:.07;
  for(const k of [1,.66,.33]){hx.fillStyle=`rgba(255,255,255,${h*a})`;poly(hx,k,0);}
  hx.restore();}
}
function head(g,d){
 const c=d.col,oil=d.type==='oil';
 const m=d.run?Math.max(0,1-d.d/d.reach):1;if(d.run&&m<.015)return;
 const shape=gg=>{
  if(!d.run){const k=Math.min(1,d.st/d.gather),r=d.br*(.3+.45*k*k);gg.beginPath();gg.ellipse(d.x,d.y+r*.3,r*.8,r*(1+.4*k),0,0,TAU);gg.fill();}
  else{const hw=Math.max(.5,d.lw*.5+.25),len=hw*(1.6+.9*m),x=d.x,y=d.y;
   gg.beginPath();gg.arc(x,y,hw,Math.PI,0,false);gg.quadraticCurveTo(x+hw*.9,y+len*.6,x,y+len);gg.quadraticCurveTo(x-hw*.9,y+len*.6,x-hw,y);gg.closePath();gg.fill();}
 };
 g.save();g.globalCompositeOperation='source-over';g.fillStyle=runCol(c,d.type,1);shape(g);g.restore();
 if(g===px&&hx){hx.save();hx.globalCompositeOperation='lighter';hx.fillStyle=oil?'rgba(255,255,255,.35)':'rgba(255,255,255,.1)';shape(hx);hx.restore();}
}
function stepDrips(dt){
 for(let i=drips.length-1;i>=0;i--){
  const d=drips[i];d.t+=dt;if(d.t<0)continue;
  if(!d.run){d.st+=dt;if(d.st>=d.gather)d.run=1;continue;}
  if(d.stall>0){d.stall-=dt;if(d.stall<=0){
    const w=Math.max(.6,d.lw);px.save();px.fillStyle=runCol(d.col,d.type,1);px.beginPath();
    px.ellipse(d.x,d.y,w*rr(.62,.8),w*rr(.9,1.35),0,0,TAU);px.fill();px.restore();
    if(hx){hx.save();hx.globalCompositeOperation='lighter';hx.fillStyle=d.type==='oil'?'rgba(255,255,255,.3)':'rgba(255,255,255,.08)';hx.beginPath();hx.ellipse(d.x,d.y,w*.7,w*1.1,0,0,TAU);hx.fill();hx.restore();}}
   continue;}
  d.rt+=dt;d.age=(d.age||0)+dt;
  const m=Math.max(0,1-d.d/d.reach),v=d.vmax*(.2+.8*Math.pow(m,.45))*(.35+.65*Math.min(1,d.rt/.5)),dy=v*dt;
  d.vx=d.vx*.93+(R()-.5)*dt*30;
  if(ui.tilt){const gx=tilt.x,gy=tilt.y,k2=v*1.3*dt;d.x+=gx*k2+d.vx*dt*.3;d.y+=gy*k2;d.d+=Math.hypot(gx,gy)*k2;}
  else{d.x+=d.vx*dt+(d.x0-d.x)*dt*.4;d.x=clamp(d.x,d.x0-(3+d.br),d.x0+(3+d.br));d.y+=dy;d.d+=dy;}
  if(Math.hypot(d.x-d.lx,d.y-d.ly)>=3){
   const w=dripW(d);runSeg(d,d.lx,d.ly,d.lw,d.x,d.y,w,Math.min(1,.25+d.d/24));
   d.lx=d.x;d.ly=d.y;d.lw=w;
  }
  if(d.d>=d.nextStall&&m>.15){if(R()<.35)d.stall=rr(.12,.7)*(1.4-runny);d.nextStall=d.d+rr(25,70);}
  if(d.d>=d.reach||d.y>H+10||d.y<-10||d.x<-10||d.x>W+10||d.age>14){head(px,{col:d.col,type:d.type,run:1,d:0,reach:1,lw:Math.max(d.lw,1.2)*1.5,x:d.x,y:d.y});drips.splice(i,1);}
 }
}
let reverb=null,rvSend=null,ac=null,master=null,delayNode=null,feedback=null,noiseBuf=null,boomBus=null,lastPop=0,popG=1;
function audio(){
 if(!ac){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;
  try{ac=new A();}catch(e){return null;}
  master=ac.createGain();master.gain.value=0.75;
  const comp=ac.createDynamicsCompressor();
  comp.threshold.value=-16;comp.knee.value=10;comp.ratio.value=8;comp.attack.value=.002;comp.release.value=.2;
  const ws=ac.createWaveShaper(),post=ac.createGain();{const n=2048,cv=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;cv[i]=Math.tanh(x*1.5)/Math.tanh(1.5);}ws.curve=cv;ws.oversample='2x';}
  post.gain.value=.95;
  master.connect(comp);comp.connect(ws);ws.connect(post);post.connect(ac.destination);
  boomBus=ac.createGain();boomBus.gain.value=2.3;boomBus.connect(master);
  delayNode = ac.createDelay();
  delayNode.delayTime.value = 0.35;
  feedback = ac.createGain();
  feedback.gain.value = 0.35;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 1400;
  delayNode.connect(feedback);
  feedback.connect(filter);
  filter.connect(delayNode);
  delayNode.connect(master);
  reverb=ac.createConvolver();{const L=Math.floor(ac.sampleRate*2.2),ib=ac.createBuffer(2,L,ac.sampleRate);for(let k=0;k<2;k++){const d=ib.getChannelData(k);for(let i=0;i<L;i++)d[i]=(R()*2-1)*Math.pow(1-i/L,2.6);}reverb.buffer=ib;}
  rvSend=ac.createGain();rvSend.gain.value=.5;rvSend.connect(reverb);{const ro=ac.createGain();ro.gain.value=.55;reverb.connect(ro);ro.connect(master);}
  noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;}
 if(ac.state==='suspended')ac.resume();return ac;
}
function chargeSound(k){
 if(micOn||gtrOn)return null;const a=audio();if(!a)return null;const t=a.currentTime,D=3.6;
 k=k|0;const hi=k>=4,pkv=Math.min(.2+.09*k,.62);
