 tw.style.display=tb.style.display=p==='wheel'?'block':'none';$('p-sw').style.display=p==='lock'?'flex':'none';
 document.querySelectorAll('#p-tool [data-p]').forEach(b=>b.classList.toggle('sel',b.dataset.p===p));$('t-mono').textContent=palMode==='mono'?'Mono On':'Mono Off';$('t-mono').classList.toggle('sel',palMode==='mono');$('t-grav').textContent=ui.grav?'Gravity On':'Gravity Off';$('t-tilt').textContent=ui.tilt?'Tilt On':'Tilt Off';$('t-tilt').classList.toggle('sel',!!ui.tilt);$('t-vib').textContent=ui.vib?'Vibe On':'Vibe Off';$('t-shk').textContent=ui.shk?'Shake On':'Shake Off';blendLbl();sizeLbl();tvLbl();brushLbl();
 if(p==='slider'){knob();applySlider();}
 else if(p==='wheel'){dialAngle=ui.da;dial.style.transform=`rotate(${dialAngle}deg)`;applyWheel();}
 else applyLock();
 saveUI();clampPanels();
}

let hDrag=false;
function hueAt(e){const r=hueEl.getBoundingClientRect();ui.sy=clamp((e.clientY-r.top)/r.height,0,1);knob();applySlider();}
hueEl.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{hueEl.setPointerCapture(e.pointerId);}catch(_){}hDrag=true;hueAt(e);});
hueEl.addEventListener('pointermove',e=>{if(hDrag)hueAt(e);});
['pointerup','pointercancel'].forEach(t=>hueEl.addEventListener(t,()=>{hDrag=false;saveUI();}));
tw.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();ui.wt='w';applyWheel();saveUI();});
tb.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();ui.wt='b';applyWheel();saveUI();});
let wDrag=false;
function wetAt(e){const r=wetEl.getBoundingClientRect();runny=1-clamp((e.clientY-r.top)/r.height,0,1);knob();}
wetEl.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{wetEl.setPointerCapture(e.pointerId);}catch(_){}wDrag=true;wetAt(e);});
wetEl.addEventListener('pointermove',e=>{if(wDrag)wetAt(e);});
['pointerup','pointercancel'].forEach(t=>wetEl.addEventListener(t,()=>{wDrag=false;try{localStorage.setItem('spd6-run',String(runny));}catch(_){}}));
addEventListener('resize',knob);
document.querySelectorAll('#p-tool [data-p]').forEach(b=>b.onclick=()=>{ui.picker=b.dataset.p;applyPicker();});
$('t-grav').onclick=()=>{ui.grav=ui.grav?0:1;if(!ui.grav)drips.length=0;applyPicker();};
$('t-mono').onclick=()=>{palMode=palMode==='mono'?'mood':'mono';ui.pal=palMode;applyPicker();chipUpdate();note(palMode==='mono'?'Mono on: every paint is a shade of your chosen color':'Mono off: mood colors');};
function tm(e){const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;const sg=/iPhone|iPad/.test(navigator.userAgent)?-1:1;tilt.x=clamp(-sg*a.x/9.81,-1,1);tilt.y=clamp(sg*a.y/9.81,-1,1);}
let tmOn=false;function tiltStart(){const go=()=>{if(!tmOn){tmOn=true;addEventListener('devicemotion',tm);}};
 try{if(typeof DeviceMotionEvent!=='undefined'&&DeviceMotionEvent.requestPermission){DeviceMotionEvent.requestPermission().then(r=>{if(r==='granted')go();else{ui.tilt=0;applyPicker();}}).catch(()=>{ui.tilt=0;applyPicker();});}else go();}catch(e){go();}}
$('t-tilt').onclick=()=>{ui.tilt=ui.tilt?0:1;if(ui.tilt){ui.grav=1;tiltStart();note('Tilt on: paint runs toward the low side');}applyPicker();};
$('t-vib').onclick=()=>{ui.vib=ui.vib?0:1;applyPicker();if(ui.vib)buzz(60);};
$('t-shk').onclick=()=>{ui.shk=ui.shk?0:1;applyPicker();};
$('t-blend').onclick=()=>{blendDef=!blendDef;chargers.forEach(c=>setBlend(c,blendDef));blendLbl();note(blendDef?'Blend on: fingers smear paint, no blast':'Blend off: fingers load and blast');};
const SIZES=[[1,'Canvas 1x','Normal'],[1.5,'Canvas 1.5x','Large'],[2,'Canvas 2x','Huge'],[3,'Canvas 3x','Giant'],[4,'Canvas 4x','Massive'],[6,'Canvas 6x','Epic']];
function sizeLbl(){const b=$('t-size');if(!b)return;const s=SIZES.find(q=>q[0]===K)||SIZES[0];b.textContent=s[1];b.classList.toggle('sel',K!==1);}
function setSize(k){if(k===K)return;if(painted)savePaint();K=k;GR=130*K;ui.cs=k;saveUI();flying.length=0;motes.length=0;drips.length=0;
 chargers.forEach(c=>{c.dead=true;if(c.snd)c.snd.stop();});chargers.clear();resize(true);sizeLbl();touchGL();}
$('t-size').onclick=()=>{const i=SIZES.findIndex(q=>q[0]===K),n=SIZES[(i+1)%SIZES.length];setSize(n[0]);note('Canvas '+n[2]+(n[0]===1?': normal brush size':': smaller brushes, more room to paint'));};
let tvOn=false,wl=null;
function tvLbl(){const b=$('t-tv');if(!b)return;b.textContent=tvOn?'TV On':'TV Off';b.classList.toggle('sel',tvOn);}
async function wake(){try{if(tvOn&&navigator.wakeLock&&!wl){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null;});}}catch(e){wl=null;}}
function lockLand(){try{if(screen.orientation&&screen.orientation.lock){const p=screen.orientation.lock('landscape');if(p&&p.catch)p.catch(()=>{});}}catch(e){}}
function tvMode(on){tvOn=on;wildMode(on);tvLbl();
 if(on){wake();lockLand();setTimeout(lockLand,400);}
 else{try{if(wl){wl.release();wl=null;}if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock();}catch(e){}}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&tvOn)wake();});
$('t-tv').onclick=()=>tvMode(!tvOn);
$('t-hide').onclick=()=>{['p-hue','p-sw','p-wet','p-tool'].forEach(id=>{$(id).classList.add('min');ui.min[id]=true;});saveUI();knob();note('Menus hidden. Tap a tab (TOOLS, COLOR, RUNNY) to open it again');};
function brushLbl(){const b=$('t-brush');if(!b)return;b.innerHTML='Brush<br>'+SHP[shp].n;b.classList.toggle('sel',shp>0);}
$('t-brush').onclick=()=>{shp=(shp+1)%SHN;ui.br=shp;saveUI();brushLbl();note('Brush: '+SHP[shp].n+(shp?' (blasts and splats become this shape)':''));};
$('t-undo').onclick=$('undo').onclick=undo;
const REC_T=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
function recMime(){if(!window.MediaRecorder)return '';for(const m of REC_T){try{if(MediaRecorder.isTypeSupported(m))return m;}catch(e){}}return '';}
let recBlob=null,recUrl=null,recTick=0;
function recLbl(){const b=$('t-rec');if(b){b.textContent=rec?'Stop Rec':'Record';b.classList.toggle('sel',!!rec);}const p=$('recstop');if(p)p.style.display=rec?'inline-flex':'none';}
async function recStart(){
 if(rec)return;
 if(!window.MediaRecorder||!glc.captureStream){note('Recording is not supported in this browser');return;}
 const mt=recMime(),sc=Math.min(1,1280/Math.max(glc.width,glc.height)),rw=Math.max(2,Math.round(glc.width*sc/2)*2),rh=Math.max(2,Math.round(glc.height*sc/2)*2);
 const rc=document.createElement('canvas');rc.width=rw;rc.height=rh;const rx=rc.getContext('2d');rx.fillStyle=BG;rx.fillRect(0,0,rw,rh);
 const vs=rc.captureStream(30);let dst=null,mic=null,msrc=null;
 try{const ax=audio();if(ax&&master){dst=ax.createMediaStreamDestination();master.connect(dst);
   if(gtrOn||micOn){try{mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});msrc=ax.createMediaStreamSource(mic);msrc.connect(dst);}catch(e){}}
   dst.stream.getAudioTracks().forEach(t=>vs.addTrack(t));}}catch(e){}
 let mr;try{mr=new MediaRecorder(vs,mt?{mimeType:mt,videoBitsPerSecond:5e6}:{videoBitsPerSecond:5e6});}catch(e){try{mr=new MediaRecorder(vs);}catch(e2){note('Recording could not start');return;}}
 const ch=[];mr.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data);};
 const r={mr,rc,rx,t0:performance.now(),dst,mic,msrc,gw:W,gh:H,mt};
 mr.onstop=()=>{
  try{if(r.dst&&master)master.disconnect(r.dst);if(r.msrc)r.msrc.disconnect();if(r.mic)r.mic.getTracks().forEach(t=>t.stop());}catch(e){}
  if(rec===r)rec=null;recLbl();
  const type=(mr.mimeType||mt||'video/webm').split(';')[0];recBlob=new Blob(ch,{type});
  if(recUrl)URL.revokeObjectURL(recUrl);recUrl=URL.createObjectURL(recBlob);
  const v=$('recvid');v.src=recUrl;$('recv').classList.add('show');try{v.load();}catch(e){}};
 rec=r;mr.start(1000);recLbl();note('Recording. Tap the red Stop button when done');
}
function recStop(){if(!rec)return;try{if(rec.mr.state!=='inactive')rec.mr.stop();}catch(e){rec=null;recLbl();}}
function recFrame(){const r=rec;if(!r)return;
 if(r.gw!==W||r.gh!==H){recStop();return;}
 r.rx.drawImage(glc,0,0,r.rc.width,r.rc.height);r.rx.drawImage(view,0,0,r.rc.width,r.rc.height);
 const now=performance.now();if(now-recTick>500){recTick=now;const s=Math.floor((now-r.t0)/1000);$('recstop').textContent='● Stop '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0');if(s>=600)recStop();}}
$('t-rec').onclick=()=>rec?recStop():recStart();
$('recstop').onclick=recStop;
async function recDeliver(){
 if(!recBlob)return;const ext=/mp4/.test(recBlob.type)?'mp4':'webm',d=new Date(),p2=n=>String(n).padStart(2,'0'),fn='sour-paint-detonation-'+d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'-'+p2(d.getHours())+p2(d.getMinutes())+p2(d.getSeconds())+'.'+ext;
 try{const f=new File([recBlob],fn,{type:recBlob.type});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Sour Paint Detonation'});return;}}catch(e){if(e&&e.name==='AbortError')return;}
 const l=document.createElement('a');l.href=recUrl;l.download=fn;document.body.appendChild(l);l.click();l.remove();}
$('recsave').onclick=recDeliver;
$('recx').onclick=()=>{$('recv').classList.remove('show');const v=$('recvid');try{v.pause();}catch(e){}};
function wildMode(on){wild=on;document.body.classList.toggle('wild',on);chargers.forEach(c=>{if(c.snd)c.snd.stop();});chargers.clear();
 try{const d=document.documentElement;if(on){if(d.requestFullscreen&&!document.fullscreenElement)d.requestFullscreen().catch(()=>{});}else if(document.fullscreenElement)document.exitFullscreen();}catch(e){}touchGL();stripUpdate();wsSel();}
function stripUpdate(){document.body.classList.toggle('strip',wild||gtrOn);document.body.classList.toggle('gtr',gtrOn&&!wild);['p-hue','p-sw','p-wet','p-tool'].forEach(placePanel);clampPanels();}
const WS=$('wscroll');
function wsSel(){[...WS.querySelectorAll('[data-n]')].forEach(b=>b.classList.toggle('sel',b.dataset.n===(wild?wildPal:(palMode==='mono'?'Mono':mood))));}
['Random'].concat(Object.keys(MOODS),['Chaos','Mono']).forEach(n=>{const b=document.createElement('button');b.className='pill';b.dataset.n=n;b.textContent=n;
 b.onclick=()=>{if(wild){wildPal=n;}else if(n!=='Random'){if(n==='Mono'){palMode='mono';ui.pal='mono';}else{mood=n;palMode='mood';ui.pal='mood';}applyPicker();chipUpdate();}wsSel();};WS.appendChild(b);});
wsSel();
$('t-wild').onclick=()=>wildMode(true);
$('wback').addEventListener('pointerdown',e=>{e.stopPropagation();});
$('wback').onclick=()=>{if(tvOn)tvMode(false);else wildMode(false);};
const pkey=id=>id+(innerWidth>innerHeight&&innerHeight<=520?'L':'');
function placePanel(id){const el=$(id),ps=ui.pos[pkey(id)];if(ps){el.style.left=ps[0]+'px';el.style.top=ps[1]+'px';el.style.right='auto';el.style.bottom='auto';}else{el.style.left=el.style.top=el.style.right=el.style.bottom='';}}
function panel(id){const el=$(id),g=el.querySelector('.grip');
 placePanel(id);
 if(ui.min[id])el.classList.add('min');
 let st=null;
 g.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{g.setPointerCapture(e.pointerId);}catch(_){}const r=el.getBoundingClientRect();st={dx:e.clientX-r.left,dy:e.clientY-r.top,x:e.clientX,y:e.clientY,mv:false};});
 g.addEventListener('pointermove',e=>{if(!st)return;if(Math.hypot(e.clientX-st.x,e.clientY-st.y)>6)st.mv=true;if(!st.mv)return;
  const r=el.getBoundingClientRect(),x=clamp(e.clientX-st.dx,0,Math.max(0,innerWidth-r.width)),y=clamp(e.clientY-st.dy,0,Math.max(0,innerHeight-r.height));
  el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto';el.style.bottom='auto';ui.pos[pkey(id)]=[x,y];});
 g.addEventListener('pointerup',()=>{if(!st)return;if(!st.mv){el.classList.toggle('min');ui.min[id]=el.classList.contains('min');knob();}st=null;saveUI();});
 g.addEventListener('pointercancel',()=>{st=null;});
}
['p-hue','p-sw','p-wet','p-tool'].forEach(panel);
function clampPanels(){['p-hue','p-sw','p-wet','p-tool'].forEach(id=>{const el=$(id),ps=ui.pos[pkey(id)];if(!ps)return;const r=el.getBoundingClientRect();if(!r.width)return;el.style.left=clamp(ps[0],0,Math.max(0,innerWidth-r.width))+'px';el.style.top=clamp(ps[1],0,Math.max(0,innerHeight-r.height-(document.body.classList.contains('strip')?58:0)))+'px';});}
addEventListener('resize',()=>{['p-hue','p-sw','p-wet','p-tool'].forEach(placePanel);clampPanels();});
applyPicker();knob();chipUpdate();
const info=document.getElementById('info'),itab=w=>{document.getElementById('pA').style.display=w?'none':'';document.getElementById('pH').style.display=w?'':'none';document.getElementById('iA').classList.toggle('sel',!w);document.getElementById('iH').classList.toggle('sel',!!w);};
document.getElementById('inf').onclick=()=>{itab(1);info.classList.add('show');};
document.getElementById('iA').onclick=()=>itab(0);document.getElementById('iH').onclick=()=>itab(1);
document.getElementById('iX').onclick=()=>info.classList.remove('show');
info.addEventListener('pointerdown',e=>{if(e.target===info)info.classList.remove('show');});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
let paused=false,ahT=0;
function artMode(on){
 paused=on;document.body.classList.toggle('art',on);
 if(on){flying.length=0;motes.length=0;chargers.forEach(c=>{if(c.snd)c.snd.stop();});chargers.clear();vx.setTransform(1,0,0,1,0,0);vx.clearRect(0,0,view.width,view.height);
  if(useGL)renderGL();else vx.drawImage(paint,0,0,view.width,view.height);
  const ah=$('arthint');ah.style.opacity=1;clearTimeout(ahT);ahT=setTimeout(()=>ah.style.opacity=0,2600);
  try{const d=document.documentElement;if(d.requestFullscreen&&!document.fullscreenElement)d.requestFullscreen().catch(()=>{});}catch(e){}}
 else{$('arthint').style.opacity=0;try{if(document.fullscreenElement)document.exitFullscreen();}catch(e){}touchGL();}
}
$('t-view').onclick=()=>artMode(true);
document.addEventListener('fullscreenchange',()=>{if(tvOn)setTimeout(lockLand,200);touchGL();setTimeout(touchGL,400);setTimeout(touchGL,900);});
$('splash').onclick=()=>{const sp=$('splash');sp.style.opacity=0;sp.style.pointerEvents='none';setTimeout(()=>sp.style.display='none',750);};
view.addEventListener('contextmenu',e=>e.preventDefault());
view.addEventListener('pointerdown',e=>{
 e.preventDefault();if(paused){artMode(false);return;}try{view.setPointerCapture(e.pointerId);}catch(_){}
 if(chargers.size>=1&&performance.now()-tapT<420){tapT=0;toggleBlend();return;}
 if(!chargers.size)snap();
 const nfn=chargers.size;let pl,hs0,ov0=wild?null:leadOv;
 if(wild&&wildPal!=='Random'){const sm=mood,sp=palMode;if(wildPal==='Mono')palMode='mono';else{mood=wildPal;palMode='mood';}pl=makePalette();mood=sm;palMode=sp;hs0=wildPal==='Mono'?R()*360:(pl.leadH==null?R()*360:pl.leadH);}
 else{pl=makePalette();hs0=wild?R()*360:(nfn?(hueShift+nfn*97)%360:hueShift);}
 refreshPal(pl,ov0,hs0);
 chargers.set(e.pointerId,{x:e.clientX*K,y:e.clientY*K,t0:performance.now(),charge:0,pal:pl,snd:blendDef?blendSound():chargeSound(nfn),blend:blendDef,cand:nfn>=1,ox:e.clientX*K,oy:e.clientY*K,br:bsz*K,ov:ov0,hs:hs0,ph:R()*6,dead:false,lt:performance.now(),sp:0,va:0,trav:0,vb:0,lx:e.clientX*K,ly:e.clientY*K,dep:0,samp:null,st:0});
 hint.style.opacity=0;
});
function buzz(p){try{if(ui.vib&&navigator.vibrate)navigator.vibrate(p);}catch(e){}}
function ribbon(x0,y0,x1,y1,w,c){
 const g=px,a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0),n=Math.min(40,Math.max(1,Math.ceil(L/(w*.22))));
 for(let i=1;i<=n;i++){
  const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,r=w*rr(.5,.56),sx=1.7;
  g.save();g.translate(x,y);g.rotate(a);g.scale(sx,1);
  g.globalCompositeOperation='source-over';g.fillStyle=hsl(c.h,c.s,c.l,.3);path(g,pts(r*1.2,.15,12));g.fill();
  g.fillStyle=hsl(c.h,c.s,c.l,c.type==='wc'?.55:.92);path(g,pts(r,.15,12));g.fill();
  if(c.type!=='wc'){g.save();g.scale(.6,.5);g.translate(-r*.2,-r*.4);g.fillStyle=hsl(c.h,c.s-5,c.l+14,.28);path(g,pts(r,.5,10));g.fill();g.restore();}
  g.restore();
  if(hx){hx.save();hx.translate(x,y);hx.rotate(a);hx.scale(sx,1);hx.globalCompositeOperation='lighter';const ha=(c.type==='wc'?.06:.24)*.45;
   hx.fillStyle=`rgba(255,255,255,${ha})`;path(hx,pts(r,.15,12));hx.fill();hx.fillStyle=`rgba(255,255,255,${ha*.8})`;path(hx,pts(r*.55,.15,10));hx.fill();hx.restore();}
 }
 if(R()<.5){const d=w*rr(.6,1.3),aa=a+(R()<.5?1.57:-1.57);dot(c.type,x1+Math.cos(aa)*d,y1+Math.sin(aa)*d,rr(.8,2.2),c);}
}
function pool(x,y,r,c){const g=px;g.save();g.translate(x,y);
 g.globalCompositeOperation=R()<.5?(c.mix||'source-over'):'source-over';
 g.fillStyle=hsl(c.h,c.s,c.l,.16);path(g,pts(r,.6,14));g.fill();g.restore();
 if(hx){hx.save();hx.translate(x,y);hx.globalCompositeOperation='lighter';hx.fillStyle=c.type==='wc'?'rgba(255,255,255,.015)':'rgba(255,255,255,.06)';path(hx,pts(r,.6,14));hx.fill();hx.restore();}}
function stroke(ch){
 const sp=ch.sp,x=ch.x,y=ch.y,x0=ch.lx,y0=ch.ly;ch.lx=x;ch.ly=y;painted=true;
 if(sp<.5){const lead=ch.pal[0];if(!ch.car)ch.car=Object.assign({},lead);
  const u=underHSL(x,y,10);if(u)ch.car=mixCol(ch.car,u,.34*u.pa+.06);
  const col=Object.assign({},ch.car);ch.car=mixCol(Object.assign({},lead,{type:lead.type}),ch.car,.9);
  const w=3+ch.charge*14+(.5-sp)*12;ribbon(x0,y0,x,y,w,col);
  if(R()<.1+w*.012)addDrip(col.type,x+rr(-w,w)*.3,y+w*.4,w,col,rr(.1,1.2));buzz(5);}
 else{const col=mixAt(pk(ch.pal),x,y,10);const n=2+((R()*3)|0)+((ch.charge*4)|0);for(let i=0;i<n&&flying.length<320;i++)fly({src:0,x,y,a:ch.va+rr(-.45,.45),dist:rr(40,120)+sp*40,size:rr(1.5,4)+ch.charge*3,col,type:col.type,t:0,T:rr(.1,.22)});}
}
view.addEventListener('pointermove',e=>{const ch=chargers.get(e.pointerId);if(!ch)return;
 ch.out=e.clientX<2||e.clientY<2||e.clientX>innerWidth-2||e.clientY>innerHeight-2;if(ch.out){ch.x=e.clientX*K;ch.y=e.clientY*K;return;}
 const now=performance.now(),dt=Math.max(1,now-ch.lt),dx=e.clientX*K-ch.x,dy=e.clientY*K-ch.y,d=Math.hypot(dx,dy);
 ch.lt=now;ch.sp=ch.sp*.6+(d/K/dt)*.4;if(d>.5)ch.va=Math.atan2(dy,dx);
 ch.x=e.clientX*K;ch.y=e.clientY*K;ch.trav+=d;if(ch.blend){const bl=[...chargers.values()].filter(c=>c.blend&&!c.dead&&!c.out);let rs=false;
