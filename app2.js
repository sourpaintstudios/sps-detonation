 const out=a.createGain();
 out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(pkv,t+D);
 out.connect(master);out.connect(delayNode);
 const m=hi?2.2+.25*(k-4):Math.pow(.8,k),oscs=[];
 [196,293.66,392].forEach(f=>{const o=a.createOscillator();o.type=hi?'triangle':'sine';
  o.frequency.setValueAtTime(f*m*.5,t);o.frequency.exponentialRampToValueAtTime(f*m,t+D);o.connect(out);o.start(t);oscs.push(o);});
 if(!hi){const o=a.createOscillator(),g=a.createGain();o.type='sine';g.gain.value=.7+.15*k;
  o.frequency.setValueAtTime(60*Math.pow(.85,k)*.8,t);o.frequency.exponentialRampToValueAtTime(60*Math.pow(.85,k),t+D);o.connect(g);g.connect(out);o.start(t);oscs.push(o);}
 const lf=a.createOscillator(),lg=a.createGain();lf.frequency.value=3+k*2.5;lg.gain.value=pkv*.25;lf.connect(lg);lg.connect(out.gain);lf.start(t);oscs.push(lf);
 if(noiseBuf){const s2=a.createBufferSource();s2.buffer=noiseBuf;s2.loop=true;const f2=a.createBiquadFilter();f2.type='lowpass';f2.frequency.value=120+k*90;const g3=a.createGain();g3.gain.value=.25+.12*k;s2.connect(f2);f2.connect(g3);g3.connect(out);s2.start(t);oscs.push(s2);}
 if(k>=1){const o=a.createOscillator(),g2=a.createGain();o.type='triangle';g2.gain.value=.12*k;o.frequency.setValueAtTime(196*(1+k*.5),t);o.frequency.exponentialRampToValueAtTime(392*(1+k*.5),t+D);o.connect(g2);g2.connect(out);o.start(t);oscs.push(o);}
 return{stop(){const n=a.currentTime;
  out.gain.cancelScheduledValues(n);
  out.gain.setValueAtTime(Math.max(.001,out.gain.value),n);
  out.gain.exponentialRampToValueAtTime(0.001,n+0.6);
  oscs.forEach(o=>{try{o.stop(n+0.7)}catch(e){}});}};
}
const SCALES={Dread:[0,1,3,5,7,8,10],Melancholy:[0,2,3,5,7,8,10],Rage:[0,1,4,5,7,8,10],Joy:[0,2,4,7,9],Serenity:[0,2,4,6,7,9,11],Nostalgia:[0,2,4,5,7,9,10],Euphoria:[0,2,4,5,7,9,11],Chaos:[0,2,4,6,8,10]};
const mtof=m=>440*Math.pow(2,(m-69)/12);
const scaleNote=(i,base)=>{const s=SCALES[mood]||SCALES.Dread,n=s.length;return base+s[((i%n)+n)%n]+12*Math.floor(i/n);};
let keyRoot=[45,48,50,52][(R()*4)|0],pIdx=7;
function nz(t,dur,type,f0,f1,vol,send,dst){const s=ac.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=ac.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(dst||master);if(send&&rvSend)g.connect(rvSend);s.start(t,R()*1.5);s.stop(t+dur+.05);}
function tn(t,f,dur,type,vol,cut,send){const o=ac.createOscillator(),fl=ac.createBiquadFilter(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);fl.type='lowpass';fl.frequency.setValueAtTime(cut,t);fl.frequency.exponentialRampToValueAtTime(Math.max(200,cut*.15),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(fl);fl.connect(g);g.connect(master);if(send&&rvSend)g.connect(rvSend);o.start(t);o.stop(t+dur+.05);}
function boomSound(c,nf){nf=nf||1;
 if(!ac||micOn||gtrOn)return;const t=ac.currentTime,sk=clamp((c-.12)/.4,0,1),B=boomBus||master;
 const D1=1.2+c*1.3;
 /* saturated sub: harmonics make the low end audible on phone speakers */
 const sub=ac.createOscillator(),sg=ac.createGain(),sd=ac.createWaveShaper(),sl=ac.createBiquadFilter();
 {const n=1024,cv=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;cv[i]=Math.tanh(x*3.2);}sd.curve=cv;}
 sub.type='sine';sub.frequency.setValueAtTime(115-c*30,t);sub.frequency.exponentialRampToValueAtTime(30,t+.5+c*.6);
 sl.type='lowpass';sl.frequency.value=420;
 sg.gain.setValueAtTime(.0001,t);sg.gain.exponentialRampToValueAtTime(.9+.5*c,t+.006);sg.gain.exponentialRampToValueAtTime(.001,t+D1);
 sub.connect(sd);sd.connect(sl);sl.connect(sg);sg.connect(B);sub.start(t);sub.stop(t+D1+.1);
 /* clean deep sub */
 const s2=ac.createOscillator(),g2=ac.createGain();s2.type='sine';
 s2.frequency.setValueAtTime(62-c*14,t);s2.frequency.exponentialRampToValueAtTime(22,t+.8+c*.8);
 g2.gain.setValueAtTime(.0001,t);g2.gain.exponentialRampToValueAtTime(.8+.5*c,t+.012);g2.gain.exponentialRampToValueAtTime(.001,t+D1+.3);
 s2.connect(g2);g2.connect(B);s2.start(t);s2.stop(t+D1+.4);
 /* body thump + rolling rumble */
 nz(t,.3+c*.5,'lowpass',1400+sk*1200,70,.9+.5*c,1,B);
 nz(t+.04,1.4+c*1.8,'lowpass',280+c*200,36,.75+.5*c,1,B);
 nz(t,.5+c*.9,'lowpass',500+sk*1700+c*3500,160,.3+.25*sk+.4*c,1);
 /* crack */
 nz(t,.045,'highpass',2500,6500,.3+.35*sk,0);
 const base=keyRoot+(c>.6?0:12),deg=c>.6?[0,2,4,7]:[0,2,4];
 deg.forEach((d,i)=>tn(t+.03+i*.03,mtof(scaleNote(d,base)),.9+c*.9,sk<.3?'sine':'sawtooth',.11*(.35+.65*sk),1500+c*2500,1));
 for(let j=1;j<Math.min(nf,5);j++){nz(t+.05*j,.4+c*.6,'bandpass',4000-j*500,300,.22,1);tn(t+.06*j,mtof(scaleNote(j*2,keyRoot+36)),.7+c*.6,'square',.05+.01*j,2400,1);}
}
function popSound(size){
 if(!ac||micOn||gtrOn)return;const t=ac.currentTime;if(t-lastPop<.05)return;lastPop=t;
 nz(t,.07+Math.min(size,20)*.004,'bandpass',rr(500,1600),rr(150,400),.22*popG,1);
 const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(70,t+.07);
 g.gain.setValueAtTime(.2*popG,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(g);g.connect(master);o.start(t);o.stop(t+.12);
 if(size>6&&R()<.45*popG*popG){pIdx=clamp(pIdx+((R()*5)|0)-2,-2,14);tn(t+.01,mtof(scaleNote(pIdx,keyRoot+24)),.5,'triangle',.07*popG,2600,1);}
}
function blendSound(){
 if(micOn||gtrOn)return null;const a=audio();if(!a)return null;const t=a.currentTime;
 const out=a.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(.2,t+.35);out.connect(master);out.connect(delayNode);if(rvSend)out.connect(rvSend);
 const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=500;fl.Q.value=3;fl.connect(out);
 const base=mtof(keyRoot+12),mul=[1,1.5,2],oscs=[];
 [['sawtooth',-7,.3],['triangle',5,.3],['sine',0,.5]].forEach((q,i)=>{const o=a.createOscillator();o.type=q[0];o.frequency.value=base*mul[i];o.detune.value=q[1];const g=a.createGain();g.gain.value=q[2];o.connect(g);g.connect(fl);o.start(t);oscs.push(o);});
 const lf=a.createOscillator(),lg=a.createGain();lf.frequency.value=3.2;lg.gain.value=.06;lf.connect(lg);lg.connect(out.gain);lf.start(t);
 const lf2=a.createOscillator(),lg2=a.createGain();lf2.frequency.value=.7;lg2.gain.value=120;lf2.connect(lg2);lg2.connect(fl.frequency);lf2.start(t);
 let sq=null,ns=null;if(noiseBuf){ns=a.createBufferSource();ns.buffer=noiseBuf;ns.loop=true;const bf=a.createBiquadFilter();bf.type='bandpass';bf.frequency.value=900;bf.Q.value=2.5;sq=a.createGain();sq.gain.value=0;ns.connect(bf);bf.connect(sq);sq.connect(out);ns.start(t);}
 return{set(sp,th){const n=a.currentTime,s=Math.min(sp,3);for(let i=0;i<3;i++)oscs[i].frequency.setTargetAtTime(base*mul[i]*(1+s*.18),n,.08);fl.frequency.setTargetAtTime(350+th*1800+s*350,n,.1);if(sq)sq.gain.setTargetAtTime(th*Math.min(s,1.5)*.16,n,.06);},
  stop(){const n=a.currentTime;out.gain.cancelScheduledValues(n);out.gain.setValueAtTime(Math.max(.001,out.gain.value),n);out.gain.exponentialRampToValueAtTime(.001,n+.35);oscs.concat([lf,lf2]).forEach(o=>{try{o.stop(n+.4)}catch(e){}});if(ns){try{ns.stop(n+.4)}catch(e){}}}};
}
function modeCue(into){
 if(!ac||micOn||gtrOn)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=into?'triangle':'sine';
 o.frequency.setValueAtTime(into?320:200,t);o.frequency.exponentialRampToValueAtTime(into?1250:48,t+(into?.2:.26));
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(into?.18:.4,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+(into?.26:.32));
 o.connect(g);g.connect(master);if(into&&rvSend)g.connect(rvSend);o.start(t);o.stop(t+.35);
 if(!into)nz(t,.12,'lowpass',400,80,.25,0);
}
const flying=[],rings=[];let GR=130*K,shake={t:0,m:0},srcN=0;
function trace(x,y,a,dist){const pts=[[x,y]],xa=4,xb=W-4,ya=4,yb=H-4;let cx=clamp(x,xa,xb),cy=clamp(y,ya,yb),dx=Math.cos(a),dy=Math.sin(a),rem=dist,b=0;
 while(rem>0&&b<3){const tx=dx>1e-6?(xb-cx)/dx:dx<-1e-6?(xa-cx)/dx:1e9,ty=dy>1e-6?(yb-cy)/dy:dy<-1e-6?(ya-cy)/dy:1e9,t=Math.min(tx,ty);
  if(t>=rem){cx+=dx*rem;cy+=dy*rem;pts.push([cx,cy]);rem=0;break;}
  cx+=dx*t;cy+=dy*t;pts.push([cx,cy]);rem=(rem-t)*.7;if(tx<ty)dx=-dx;else dy=-dy;b++;}
 if(pts.length<2)pts.push([cx,cy]);return pts;}
function fly(o){o.pts=trace(o.x,o.y,o.a,o.dist);let L=0;o.cl=[0];for(let i=1;i<o.pts.length;i++){L+=Math.hypot(o.pts[i][0]-o.pts[i-1][0],o.pts[i][1]-o.pts[i-1][1]);o.cl.push(L);}o.L=L;o.t=0;flying.push(o);}
function posAt(f,u){const s=clamp(u,0,1)*f.L,c=f.cl;let i=1;while(i<c.length-1&&c[i]<s)i++;const seg=c[i]-c[i-1]||1,k=clamp((s-c[i-1])/seg,0,1),p=f.pts[i-1],q=f.pts[i];return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k];}
const eo=t=>1-Math.pow(1-t,2.2);
function collide(){let hits=0;const big=[];for(const f of flying)if(f.src>0&&f.size>=4&&f.t>.05&&f.t<.95)big.push(f);
 for(let i=0;i<big.length&&hits<5;i++){const a=big[i];if(a.dead)continue;const pa=posAt(a,eo(a.t));
  for(let j=i+1;j<big.length;j++){const b=big[j];if(b.dead||b.src===a.src)continue;const pb=posAt(b,eo(b.t));
   if(Math.hypot(pa[0]-pb[0],pa[1]-pb[1])<(a.size+b.size)*.7){a.dead=b.dead=true;hits++;
    const mxp=(pa[0]+pb[0])/2,myp=(pa[1]+pb[1])/2,mcol=mixCol(a.col,b.col,.5),r=Math.min(60,(a.size+b.size)*1.3);
    splat(a.type,mxp,myp,r,mcol,R()*TAU,0);rings.push({x:mxp,y:myp,t:0,max:r*2.4,h:mcol.h});popSound(r);
    for(let k=0;k<5&&flying.length<320;k++)fly({x:mxp,y:myp,a:R()*TAU,dist:rr(30,90),size:rr(2,5),col:mcol,type:a.type,T:rr(.2,.4),src:-1});
    break;}}}
 if(hits){for(let i=flying.length-1;i>=0;i--)if(flying[i].dead)flying.splice(i,1);}}
function impact(x,y,c,pal){
 const R0=16+c*58,oilC=mixAt(pal.find(p=>p.type==='oil')||pal[0],x,y,R0),wcC=mixAt(pal.find(p=>p.type==='wc')||pal[pal.length-1],x,y,R0);
 splat('wc',x,y,R0*1.5,wcC,0,0);splat('oil',x,y,R0,oilC,R()*TAU,0);
 const k=14+((c*14)|0);
 for(let i=0;i<k;i++){
  const a=R()*TAU,len=R0*rr(1.1,3.0)*(.7+c*.8),col=mixAt(pk(pal),x,y,R0),w=R0*rr(.04,.12);
  const spoke=gg=>{gg.beginPath();gg.moveTo(R0*.3,-w);gg.quadraticCurveTo(len*.5,-w*.2,len,0);gg.quadraticCurveTo(len*.5,w*.2,R0*.3,w);gg.closePath();gg.fill();gg.beginPath();gg.arc(len+w*0.5,0,w*1.4,0,TAU);gg.fill();};
  px.save();px.translate(x,y);px.rotate(a);
  px.globalCompositeOperation = col.mix || 'overlay'; 
  px.fillStyle=hsl(col.h,col.s,col.l,col.type==='wc'?.7:0.9);
  spoke(px);px.restore();
  if(hx){hx.save();hx.translate(x,y);hx.rotate(a);hx.globalCompositeOperation='lighter';hx.fillStyle=col.type==='wc'?'rgba(255,255,255,.08)':'rgba(255,255,255,.28)';spoke(hx);hx.restore();}
 }
 const nd=4+((c*8)|0);
 for(let i=0;i<nd;i++){const col=mixAt(pk(pal),x,y,R0);addDrip(col.type,x+(R()-.5)*R0*1.4,y+R0*.5,R0*rr(.25,.5),col,rr(.3,2.5));}
}
function snap(force){const now=performance.now();if(!force&&now-lastSnap<700)return;lastSnap=now;
 try{const mx_=Math.max(2,Math.min(8,Math.floor(12e6/(paint.width*paint.height))));
  const c1=document.createElement('canvas');c1.width=paint.width;c1.height=paint.height;c1.getContext('2d').drawImage(paint,0,0);
  const c2=document.createElement('canvas');c2.width=hc.width;c2.height=hc.height;c2.getContext('2d').drawImage(hc,0,0);
  undoStack.push({a:c1,b:c2});while(undoStack.length>mx_)undoStack.shift();}catch(e){}}
function undo(){const s=undoStack.pop();if(!s){note('Nothing to undo');return;}
 flying.length=0;drips.length=0;rings.length=0;
 px.save();px.setTransform(1,0,0,1,0,0);px.globalCompositeOperation='copy';px.drawImage(s.a,0,0);px.restore();
 hx.save();hx.setTransform(1,0,0,1,0,0);hx.globalCompositeOperation='copy';hx.drawImage(s.b,0,0);hx.restore();
 mapT=0;touchGL();painted=true;saveSoon();note('Undo ('+undoStack.length+' left)');}
function explode(ch){
 snap();saveSoon();const src=++srcN;
 const nf=ch.nf||1,c=clamp(ch.charge*(1+.22*(nf-1)),.05,1),pal=ch.pal,x=ch.x,y=ch.y,maxR=110+c*Math.min(W,H)*.62,n=Math.floor(40+c*110);
 for(let i=0;i<n;i++){
  const col=pk(pal),type=R()<.15?(col.type==='oil'?'wc':'oil'):col.type,thr=ch.sp>.35,spd=Math.min(ch.sp,3),dist=(maxR*Math.pow(R(),.7)+20)*(thr?1+spd*.35:1);
  if(flying.length<320)fly({x,y,a:(thr&&R()<.8)?ch.va+rr(-.9,.9)/(1+spd):R()*TAU,dist,size:2.5+Math.pow(R(),2.6)*(9+c*24),col,type,T:(.14+dist/maxR*.34+R()*.1)*1.5,src});
 }
 impact(x,y,c,pal);rings.push({x,y,t:0,max:maxR*.7,h:pal[0].h});shake={t:.25,m:ui.shk?(3+c*9)*Math.min(nf,3):0};popG=.25+.75*clamp((c-.1)/.4,0,1);boomSound(c,nf);buzz([Math.min(30+c*140*nf,500),25,Math.min(15+c*70*nf,300)]);
}
function land(f){
 for(let i=1;i<f.pts.length-1;i++)dot(f.type,f.pts[i][0],f.pts[i][1],Math.max(1.5,f.size*.45),f.col);
 const P=f.pts[f.pts.length-1],x=P[0],y=P[1],oil=f.type==='oil',r=f.size*(oil?rr(1.1,1.7):rr(1.7,2.6)),fc=mixAt(f.col,x,y,r);
 splat(f.type,x,y,r,fc,f.a,.1+.5*Math.min(1,f.dist/300));
 const ns=R()<.6?1+((R()*3)|0):0;
 for(let i=0;i<ns;i++){const d=r*rr(1.3,2.8),a=f.a+rr(-.5,.5);dot(f.type,x+Math.cos(a)*d,y+Math.sin(a)*d,rr(.8,2.4),fc);}
 if(r>4.5&&R()<.3+r*.02)addDrip(f.type,x+(R()-.5)*r*.8,y+r*.45,r,fc,rr(.15,2));
 if(r>11&&R()<.6)addDrip(f.type,x+(R()-.5)*r*.8,y+r*.5,r,fc,rr(.3,2.5));
 if(f.size>3)popSound(f.size);
}
const tcP=document.createElement('canvas'),tcH=document.createElement('canvas');
function smearOn(src,tc,sc,S,ax,ay,bx,by,dst,al){
 const s=Math.max(2,Math.ceil(S*sc)),cx=tc.getContext('2d');if(tc.width!==s){tc.width=s;tc.height=s;}
 cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,s,s);cx.save();cx.beginPath();cx.arc(s/2,s/2,s/2-1,0,TAU);cx.clip();
 cx.drawImage(src,Math.round(ax*sc-s/2),Math.round(ay*sc-s/2),s,s,0,0,s,s);cx.restore();
 dst.save();dst.setTransform(1,0,0,1,0,0);dst.globalAlpha=al;dst.drawImage(tc,Math.round(bx*sc-s/2),Math.round(by*sc-s/2));dst.restore();
}
function smear(x0,y0,x1,y1,r){
 const d=Math.hypot(x1-x0,y1-y0);if(d<.4)return;
 const n=Math.min(14,Math.max(1,Math.ceil(d/(r*.3)))),S=Math.ceil(r*2*DPR);
 for(let i=0;i<n;i++){
  const ax=(x0+(x1-x0)*i/n)*DPR,ay=(y0+(y1-y0)*i/n)*DPR,bx=(x0+(x1-x0)*(i+1)/n)*DPR,by=(y0+(y1-y0)*(i+1)/n)*DPR;
  smearOn(paint,tcP,1,S,ax,ay,bx,by,px,.6);
  if(hc&&hx)smearOn(hc,tcH,HS,S,ax,ay,bx,by,hx,.6);
 }
}
const $=id=>document.getElementById(id);
const chargers=new Map(),motes=[],hint=document.getElementById('hint');
function blendLbl(){const b=$('t-blend');if(!b)return;b.textContent=blendDef?'Blend On':'Blend Off';b.classList.toggle('sel',blendDef);}
function setBlend(ch,on){if(!!ch.blend===on)return;ch.blend=on;ch.cand=false;pd=0;if(ch.snd)ch.snd.stop();
 if(on)ch.snd=blendSound();else{ch.charge=0;ch.snd=chargeSound(Math.max(0,chargers.size-1));}
 modeCue(on);}
function toggleBlend(){const arr=[...chargers.values()].filter(c=>!c.dead);if(!arr.length)return;
 const on=arr.some(c=>!c.blend);arr.forEach(c=>setBlend(c,on));blendDef=on;blendLbl();
 note(on?'Blend: smear the paint, no blast. Double-tap again to load':'Load: charging, release to blast');}
const dialCtr = document.getElementById('dial-container');
const dial = document.getElementById('dial');
let dialAngle = 0;
let lastAngle = 0;
let isSpinning = false;
function updateDial(e){
  const r=dialCtr.getBoundingClientRect();
  const angle=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI;
  if(isSpinning){let d=angle-lastAngle;if(d>180)d-=360;if(d<-180)d+=360;dialAngle+=d;dial.style.transform=`rotate(${dialAngle}deg)`;ui.da=dialAngle;ui.wt=null;applyWheel();}
  lastAngle=angle;
}
dialCtr.addEventListener('pointerdown', e => {
  e.preventDefault(); e.stopPropagation();
  try{dialCtr.setPointerCapture(e.pointerId);}catch(_){}
  isSpinning = true;
  const rect = dialCtr.getBoundingClientRect();
  lastAngle = Math.atan2(e.clientY - (rect.top + rect.height/2), e.clientX - (rect.left + rect.width/2)) * 180 / Math.PI;
});
dialCtr.addEventListener('pointermove', e => {
  if(isSpinning) updateDial(e);
});
dialCtr.addEventListener('pointerup', e => {
  isSpinning = false;saveUI();
  try{dialCtr.releasePointerCapture(e.pointerId);}catch(_){}
});
dialCtr.addEventListener('pointercancel', e => {
  isSpinning = false;
  try{dialCtr.releasePointerCapture(e.pointerId);}catch(_){}
});
const hueEl=document.getElementById('hue'),hueK=document.getElementById('hueK'),swEl=document.getElementById('sw'),tw=document.getElementById('tw'),tb=document.getElementById('tb'),wetEl=document.getElementById('wet'),wetK=document.getElementById('wetK');
const SWATCH=[[0,0,97],[0,0,6],[0,85,48],[24,95,52],[52,100,55],[90,75,50],[140,70,40],[172,75,38],[190,95,55],[208,90,58],[228,85,50],[255,70,42],[282,65,52],[315,80,52],[340,85,65],[350,75,28],[24,55,30],[36,45,62],[0,0,50],[225,80,24]];
const ui={grav:1,tilt:0,vib:1,shk:1,picker:'slider',pal:'mood',sy:.705,da:0,lk:10,wt:null,cs:1,br:0,pos:{},min:{}};
try{Object.assign(ui,JSON.parse(localStorage.getItem('spd6-ui')||'{}'));}catch(e){}
ui.tilt=0;shp=((ui.br|0)%SHN+SHN)%SHN;
palMode=ui.pal==='mono'?'mono':'mood';dialAngle=ui.da||0;
function saveUI(){try{localStorage.setItem('spd6-ui',JSON.stringify(ui));}catch(e){}}
function refreshAll(){if(wild)return;let n=null;chargers.forEach(ch=>{n=ch;});if(n){n.ov=leadOv;n.hs=hueShift;refreshPal(n.pal,n.ov,n.hs);}}
function chipUpdate(){const el=$('chip');if(!el)return;const ov=leadOv,h=hueShift,L0=ov?ov.l:50,S0=ov?ov.s:85;
 const dot=(s,l)=>`<i style="background:${hsl(h,s,l)}"></i>`;
 const ms=$('mstrip');
 if(palMode==='mono'){const L1=ov&&ov.s>0?ov.l:50,S1=ov?ov.s:85;el.innerHTML=[.12,.5,.88].map(f=>dot(S1,rampL(f,L1))).join('');if(ms){ms.innerHTML=Array.from({length:20},(_,i)=>`<i style="background:${hsl(h,S1,rampL(i/19,L1))}"></i>`).join('');ms.style.display='flex';}}
 else{el.innerHTML=dot(S0,L0);if(ms)ms.style.display='none';}
 el.title=palMode==='mono'?'Monochrome shades':'Lead color';}
function setLead(ov,h){leadOv=ov;if(h!=null)hueShift=((h%360)+360)%360;refreshAll();chipUpdate();}
function applySlider(){const y=ui.sy;if(y<.05)setLead(WHITE);else if(y>.95)setLead(BLACK);else setLead(null,clamp((y-.09)/.82,0,1)*360);}
function applyWheel(){if(ui.wt==='w')setLead(WHITE);else if(ui.wt==='b')setLead(BLACK);else setLead(null,270-ui.da);tw.classList.toggle('sel',ui.wt==='w');tb.classList.toggle('sel',ui.wt==='b');}
function applyLock(){const s=SWATCH[ui.lk]||SWATCH[10];setLead({s:s[1],l:s[2]},s[0]);[...swEl.children].forEach((b,i)=>b.classList.toggle('sel',i===ui.lk));}
SWATCH.forEach((s,i)=>{const b=document.createElement('button');b.style.background=`hsl(${s[0]},${s[1]}%,${s[2]}%)`;
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();ui.lk=i;applyLock();saveUI();});swEl.appendChild(b);});
function knob(){const r=hueEl.getBoundingClientRect();hueK.style.top=(ui.sy*Math.max(0,r.height-10))+'px';const w=wetEl.getBoundingClientRect();wetK.style.top=((1-runny)*Math.max(0,w.height-10))+'px';}
function applyPicker(){
 const p=ui.picker;
 $('p-hue').style.display=p==='slider'?'flex':'none';dialCtr.style.display=p==='wheel'?'flex':'none';
