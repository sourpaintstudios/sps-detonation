  if(bl.length>=2){const dd=Math.hypot(bl[0].x-bl[1].x,bl[0].y-bl[1].y)/K,ch0=Math.abs(dd-pd);
   if(pd>0&&ch0>.25&&ch0>.4*(d/K)){bsz=clamp(bsz*dd/pd,10,100);bl.forEach(c=>{c.br=bsz*K;});rs=true;}pd=dd;}else pd=0;
  if(!rs){smear(ch.x-dx,ch.y-dy,ch.x,ch.y,ch.br);painted=true;saveSoon();}return;}
 const step=ch.sp<.5?14:26;let g=0;while(ch.trav>=step&&g++<4){ch.trav-=step;stroke(ch);}
});
function release(e){const ch=chargers.get(e.pointerId);if(!ch)return;pd=0;
 if(ch.cand&&e.type!=='pointercancel'&&performance.now()-ch.t0<280&&Math.hypot(ch.x-ch.ox,ch.y-ch.oy)<14*K){chargers.delete(e.pointerId);ch.dead=true;if(ch.snd)ch.snd.stop();tapT=performance.now();return;}
 const cancel=e.type==='pointercancel'||ch.out||e.clientX<2||e.clientY<2||e.clientX>innerWidth-2||e.clientY>innerHeight-2,nf=chargers.size;
 chargers.delete(e.pointerId);ch.dead=true;if(ch.snd)ch.snd.stop();
 if(ch.blend)return;
 if(cancel){note('Canceled');return;}
 const mem=[ch];if(ch.near>0)chargers.forEach(o=>{if(!o.out&&!o.blend&&Math.hypot(o.x-ch.x,o.y-ch.y)<GR*1.3)mem.push(o);});
 if(mem.length>1){mem.forEach(o=>{if(o!==ch){o.dead=true;if(o.snd)o.snd.stop();}});[...chargers].forEach(([id,o])=>{if(o.dead)chargers.delete(id);});
  const gx=mem.reduce((q,o)=>q+o.x,0)/mem.length,gy=mem.reduce((q,o)=>q+o.y,0)/mem.length,per=Math.max(1,Math.floor(6/mem.length)),mp=[];
  mem.forEach(o=>o.pal.slice(0,per).forEach(q=>mp.push(q)));while(mp.length<6)mp.push(pk(mem[(R()*mem.length)|0].pal));
  explode({x:gx,y:gy,charge:Math.min(1,Math.max(...mem.map(o=>o.charge))*1.15),pal:mp,sp:0,va:0,nf:mem.length});note('Merged blast');return;}
 ch.nf=nf;explode(ch);}
view.addEventListener('pointerup',release);view.addEventListener('pointercancel',release);
document.getElementById('clr').addEventListener('click',()=>{snap(true);painted=false;fillBG();mapT=0;if(hx){hx.save();hx.setTransform(1,0,0,1,0,0);hx.fillStyle='#000';hx.fillRect(0,0,hc.width,hc.height);hx.restore();}touchGL();try{localStorage.removeItem('spd8-h');}catch(e){}drips.length=0;flying.length=0;try{localStorage.removeItem(SKEY);}catch(e){}});
const grid=$('moods'),start=$('start'),shot=$('shot');
let micCal=0,micFloor=0,an=null,micBuf=null,micStream=null,lastOn=0,onsets=[],prevR=0,lastDrip=0,lastPitch=0,mf=0,nt=0;
Object.keys(MOODS).concat(['Chaos']).forEach(n=>{
 const b=document.createElement('button'),cols=MOODS[n]||[[0,90,55],[60,90,55],[120,80,50],[200,90,55],[290,85,58]];
 b.className='mb'+(n===mood?' sel':'');
 b.innerHTML='<span>'+n+'</span><em>'+cols.slice(0,5).map(o=>`<i style="background:hsl(${o[0]},${o[1]}%,${o[2]}%)"></i>`).join('')+'</em>';
 b.dataset.n=n;b.onclick=()=>{mood=n;palMode='mood';ui.pal='mood';applyPicker();chipUpdate();pickSel();$('pick').classList.remove('show');note('Palette: '+n);};grid.appendChild(b);
});
{const b=document.createElement('button');b.className='mb';b.dataset.n='Mono';b.innerHTML='<span>Mono</span><em>'+[8,25,42,58,75,92].map(l=>`<i style="background:hsl(0,0%,${l}%)"></i>`).join('')+'</em>';b.onclick=()=>{palMode='mono';ui.pal='mono';applyPicker();chipUpdate();pickSel();$('pick').classList.remove('show');note('Mono: 20 shades of your color');};grid.appendChild(b);}
function pickSel(){[...grid.children].forEach(b=>b.classList.toggle('sel',b.dataset.n===(palMode==='mono'?'Mono':mood)));}
$('pickx').onclick=()=>$('pick').classList.remove('show');
$('pick').addEventListener('pointerdown',e=>{if(e.target===$('pick'))$('pick').classList.remove('show');});
function note(t){hint.textContent=t;hint.style.opacity=1;clearTimeout(nt);nt=setTimeout(()=>hint.style.opacity=0,4500);}
function setMic(){$('mic').textContent=micOn?'🎤 On':'🎤 Off';}
function detectPitch(b,sr){
 const maxL=Math.floor(sr/70),minL=Math.floor(sr/1000),M=b.length-maxL-1;let e=0;
 for(let i=0;i<M;i+=2)e+=b[i]*b[i];if(e<1e-3)return 0;
 const c=new Float32Array(maxL+2);
 for(let L=minL;L<=maxL;L++){let s=0;for(let i=0;i<M;i+=2)s+=b[i]*b[i+L];c[L]=s;}
 let fell=false;
 for(let L=minL+1;L<maxL;L++){if(c[L]<.25*e)fell=true;if(fell&&c[L]>c[L-1]&&c[L]>=c[L+1]&&c[L]>.45*e)return sr/L;}
 return 0;
}
async function micStart(){
 try{const a=audio();if(!a)throw 0;
  micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
  const src=a.createMediaStreamSource(micStream);an=a.createAnalyser();an.fftSize=2048;src.connect(an);micBuf=new Float32Array(an.fftSize);micOn=true;micCal=performance.now()+1200;micFloor=0;note('Measuring room noise… stay quiet for 1 second');
 }catch(e){micOn=false;note('Mic blocked here. Open this page in its own tab or allow microphone access.');}
 setMic();
}
function micStop(){micOn=false;if(micStream)micStream.getTracks().forEach(t=>t.stop());micStream=null;an=null;setMic();}
function micTick(now){
 an.getFloatTimeDomainData(micBuf);let s=0;for(let i=0;i<micBuf.length;i++)s+=micBuf[i]*micBuf[i];const rms=Math.sqrt(s/micBuf.length);
 if(now<micCal){micFloor=micFloor?micFloor*.9+rms*.1:rms;prevR=rms;return;}
 const thr=Math.max(.02,micFloor*2.6+.012);if(rms<thr)micFloor=micFloor*.995+rms*.005;
 if(++mf%3===0){const f=detectPitch(micBuf,ac.sampleRate);if(f)lastPitch=f;}
 const bias=lastPitch?clamp(Math.log2(lastPitch/80)/3.65,0,1):.5;
 if(rms>thr&&rms>prevR*1.3+.008&&now-lastOn>110){
  lastOn=now;onsets.push(now);while(onsets.length&&now-onsets[0]>2000)onsets.shift();
  const rate=onsets.length/2;let c=clamp(clamp(rms*7,.15,1)*(rate>4?.45:rate>2?.75:1.15),.1,1);
  for(let i=0;i<(rate>4?2:1);i++)explode({x:rr(.12,.88)*W,y:rr(.12,.6)*H,charge:c,pal:makePalette(bias),sp:0,va:0});
 }else if(rms>thr&&now-lastOn>500&&now-lastDrip>350){lastDrip=now;addDrip(R()<.5?'oil':'wc',rr(.08,.92)*W,rr(0,.3)*H,rr(6,12),makePalette(bias)[0],0);}
 prevR=rms;
}
const rb=$('resume');const showResume=()=>{rb.style.display=hasSaved()&&!painted?'':'none';$('newb').style.display=painted?'':'none';$('go-f').textContent=painted?'Continue':'Play';};showResume();
$('newb').onclick=()=>{$('clr').click();start.style.display='none';};
rb.onclick=()=>{resumePaint();rb.style.display='none';start.style.display='none';};
$('go-f').onclick=()=>{audio();if(micOn)micStop();start.style.display='none';};
$('mood').onclick=()=>{pickSel();$('pick').classList.add('show');};
$('mic').onclick=()=>{audio();micOn?micStop():micStart();};
$('sv').onclick=()=>{let u;if(useGL){renderGL();try{u=glc.toDataURL('image/png');}catch(e){u=null;}}if(!u)u=paint.toDataURL('image/png');$('shotimg').src=u;shot.style.display='flex';};
$('shotx').onclick=()=>{shot.style.display='none';};
function sampleUnder(ch,now){
 if(now-ch.st<90)return;ch.st=now;
 const half=34,sw=Math.round(half*2*DPR);
 const x0=clamp(Math.round((ch.x-half)*DPR),0,Math.max(0,paint.width-sw)),y0=clamp(Math.round((ch.y-half)*DPR),0,Math.max(0,paint.height-sw));
 let d;try{d=px.getImageData(x0,y0,sw,sw).data;}catch(e){return;}
 const t=now/1000,c=ch.charge,N=ch.pal.length,out=[];
 for(let i=0;i<N;i++){
  const a=t*(2+c*5)*(i%2?1:-1)+i*TAU/N+ch.ph;
  const ix=clamp(Math.round(((ch.x+Math.cos(a)*half*.5)-(x0/DPR))*DPR),1,sw-2),iy=clamp(Math.round(((ch.y+Math.sin(a)*half*.5)-(y0/DPR))*DPR),1,sw-2);
  let r=0,g=0,b=0;for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++){const k=((iy+yy)*sw+(ix+xx))*4;r+=d[k];g+=d[k+1];b+=d[k+2];}
  out.push([r/9,g/9,b/9]);
 }
 ch.tgt=out;if(!ch.samp)ch.samp=out.map(o=>o.slice());
}
function drawCharger(ch,now){
 if(ch.blend){drawBlend(ch,now);return;}
 vx.save();kz(ch);if(ch.out)vx.globalAlpha=.25;
 const c=ch.charge,t=now/1000,rad=14+Math.pow(c,.85)*72,jit=c>.6?(c-.6)*5:0,x=ch.x+(R()-.5)*jit,y=ch.y+(R()-.5)*jit,p0=ch.pal[0];
 sampleUnder(ch,now);
 const gr=vx.createRadialGradient(x,y,rad*.3,x,y,rad*2.6);gr.addColorStop(0,hsl(p0.h,p0.s,p0.l,.38));gr.addColorStop(1,hsl(p0.h,p0.s,p0.l,0));
 vx.fillStyle=gr;vx.beginPath();vx.arc(x,y,rad*2.6,0,TAU);vx.fill();
 ch.pal.forEach((p,i)=>{const a=t*(2+c*5)*(i%2?1:-1)+i*TAU/ch.pal.length+ch.ph,o=rad*.38;
  let fill=hsl(p.h,p.s,p.l);
  if(ch.samp&&ch.tgt){const sm=ch.samp[i],tg=ch.tgt[i];for(let k=0;k<3;k++)sm[k]+=(tg[k]-sm[k])*.3;fill=`rgb(${sm[0]|0},${sm[1]|0},${sm[2]|0})`;}
  vx.fillStyle=fill;vx.beginPath();vx.arc(x+Math.cos(a)*o,y+Math.sin(a)*o,rad*(.62+.08*Math.sin(t*9+i)),0,TAU);vx.fill();
  vx.strokeStyle='rgba(255,255,255,.28)';vx.lineWidth=1.5;vx.stroke();});
 vx.fillStyle='rgba(255,255,255,.3)';vx.beginPath();vx.ellipse(x-rad*.3,y-rad*.35,rad*.3,rad*.15,-.6,0,TAU);vx.fill();
 vx.save();vx.lineWidth=3+c*4;const rrad=rad*1.55+Math.sin(t*(6+c*14))*3*(.5+c);vx.strokeStyle=p0.l>55?'rgba(0,0,0,.55)':'rgba(255,255,255,.85)';vx.lineWidth=3+c*4+4;vx.beginPath();vx.arc(x,y,rrad,0,TAU);vx.stroke();vx.lineWidth=3+c*4;vx.strokeStyle=hsl(p0.h,p0.s,p0.l,1);vx.setLineDash([10,8]);vx.lineDashOffset=-t*40;

 vx.beginPath();vx.arc(x,y,rrad,0,TAU);vx.stroke();vx.restore();tag(x,y+rrad+16,'LOAD','#b6ff2a');vx.restore();
}
function kz(ch){if(K!==1){vx.translate(ch.x,ch.y);vx.scale(K,K);vx.translate(-ch.x,-ch.y);}}
function tag(x,y,txt,col){vx.save();vx.font='700 11px system-ui,sans-serif';const w=vx.measureText(txt).width+16;vx.fillStyle='rgba(10,6,20,.72)';vx.beginPath();if(vx.roundRect)vx.roundRect(x-w/2,y-10,w,20,10);else vx.rect(x-w/2,y-10,w,20);vx.fill();vx.fillStyle=col;vx.textAlign='center';vx.textBaseline='middle';vx.fillText(txt,x,y);vx.restore();}
function drawBlend(ch,now){
 const t=now/1000,x=ch.x,y=ch.y,r=(ch.br||24*K)/K;
 vx.save();kz(ch);if(ch.out)vx.globalAlpha=.25;
 const gr=vx.createRadialGradient(x,y,r*.2,x,y,r*1.9);gr.addColorStop(0,'rgba(120,230,255,.35)');gr.addColorStop(1,'rgba(120,230,255,0)');
 vx.fillStyle=gr;vx.beginPath();vx.arc(x,y,r*1.9,0,TAU);vx.fill();
 vx.lineWidth=5;vx.strokeStyle='rgba(0,0,0,.45)';vx.beginPath();vx.arc(x,y,r,0,TAU);vx.stroke();
 vx.lineWidth=3;vx.strokeStyle='rgba(150,240,255,.95)';vx.setLineDash([4,7]);vx.lineDashOffset=-t*30;vx.beginPath();vx.arc(x,y,r,0,TAU);vx.stroke();vx.setLineDash([]);
 for(let i=0;i<3;i++){const a=t*2+i*2.094;vx.fillStyle='rgba(180,250,255,.9)';vx.beginPath();vx.arc(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5,3,0,TAU);vx.fill();}
 tag(x,y+r+16,'BLEND','#7fe9ff');vx.restore();
}
function initGL(){
 try{gl=glc.getContext('webgl',{preserveDrawingBuffer:true,antialias:false,alpha:false})||glc.getContext('experimental-webgl',{preserveDrawingBuffer:true,antialias:false,alpha:false});}catch(e){gl=null;}
 if(!gl){useGL=false;return;}
 try{
 const mk=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
 const vs=mk(gl.VERTEX_SHADER,'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}');
 const fs=mk(gl.FRAGMENT_SHADER,`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;uniform sampler2D P,Hh;uniform vec2 t;
float H(vec2 p){return texture2D(Hh,p).r;}
void main(){
 vec4 c=texture2D(P,v);
 vec2 e1=t*1.5,e2=t*4.0;
 float dx=(H(v-vec2(e1.x,0.))-H(v+vec2(e1.x,0.)))*.65+(H(v-vec2(e2.x,0.))-H(v+vec2(e2.x,0.)))*.35;
 float dy=(H(v-vec2(0.,e1.y))-H(v+vec2(0.,e1.y)))*.65+(H(v-vec2(0.,e2.y))-H(v+vec2(0.,e2.y)))*.35;
 vec3 n=normalize(vec3(dx*3.2,dy*3.2,1.));
 vec3 L=normalize(vec3(-.5,-.6,.65));
 float m=smoothstep(.03,.22,H(v));
 float d=dot(n,L)-L.z;
 vec3 col=c.rgb*(1.+clamp(d*.8,-.3,.4)*m);
 vec3 Hv=normalize(L+vec3(0.,0.,1.));
 float sp=pow(max(dot(n,Hv),0.),36.)*m;
 col+=vec3(sp*.28);
 gl_FragColor=vec4(col,1.);
}`);
 const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');
 gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const al=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
 gU={t:gl.getUniformLocation(pr,'t')};gl.uniform1i(gl.getUniformLocation(pr,'P'),0);gl.uniform1i(gl.getUniformLocation(pr,'Hh'),1);
 const tx=u=>{const o=gl.createTexture();gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,o);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return o;};
 texP=tx(0);texH=tx(1);
 useGL=true;touchGL();
 }catch(err){console.warn('GL off',err);useGL=false;}
}
function renderGL(){
 if(!useGL||!gl||gl.isContextLost())return;
 try{
 gl.viewport(0,0,glc.width,glc.height);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texP);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,paint);
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,texH);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,hc);
 gl.uniform2f(gU.t,1/hc.width,1/hc.height);
 gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 }catch(e){useGL=false;}
}
glc.addEventListener('webglcontextlost',e=>{e.preventDefault();useGL=false;});
glc.addEventListener('webglcontextrestored',()=>{initGL();});
initGL();
let hSettle=0;
let last=performance.now();
function frame(now){try{tick(now);}catch(err){console.error(err);}try{if(rec)recFrame();}catch(err){console.error(err);}requestAnimationFrame(frame);}
function tick(now){
 if(paused){last=performance.now();if(last<gd){if(useGL)renderGL();else{vx.setTransform(1,0,0,1,0,0);vx.drawImage(paint,0,0,view.width,view.height);}}return;}
 now=Math.max(now,performance.now());const dt=clamp((now-last)/1000,0,.05);last=now;
 if(micOn&&an)micTick(now);
 {const pt=chargers.size>0;if(pt!==ptOn){ptOn=pt;document.body.classList.toggle('pt',pt);}}
 chargers.forEach(a=>{a.near=0;});
 {const arr=[...chargers.values()].filter(c=>!c.blend);for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){if(Math.hypot(arr[i].x-arr[j].x,arr[i].y-arr[j].y)<GR){arr[i].near++;arr[j].near++;}}}
 chargers.forEach(ch=>{if(ch.blend){const u=underHSL(ch.x,ch.y,12);if(ch.snd&&ch.snd.set)ch.snd.set(ch.sp,u?u.pa:0);ch.sp*=Math.max(0,1-dt*4);return;}ch.charge=clamp(ch.charge+dt/3.6*(1+.9*Math.min(ch.near,3)),0,1);ch.sp*=Math.max(0,1-dt*4);
  if(now-ch.vb>180-120*ch.charge){ch.vb=now;buzz((8+ch.charge*22)*Math.min(chargers.size,4));}
  if(ch.sp<.3){ch.dep+=dt;if(ch.dep>.07){ch.dep=0;const pr=4+ch.charge*ch.charge*30;pool(ch.x+rr(-1,1)*pr*.2,ch.y+rr(-1,1)*pr*.2,pr,mixAt(pk(ch.pal),ch.x,ch.y,pr));
    if(ch.charge>.35&&R()<.12+ch.charge*.3){const col=mixAt(pk(ch.pal),ch.x,ch.y,pr);addDrip(col.type,ch.x+rr(-pr,pr)*.5,ch.y+pr*.5,3+pr*.28,col,.05);}}}
  const k=1+((ch.charge*5+R()*1.5)|0);
  for(let i=0;i<k;i++)motes.push({ch,a:R()*TAU,r:rr(90,260)*K,w:rr(1.5,3.5)*(R()<.5?1:-1),v:rr(120,220)*K,s:rr(1.5,4)*K,col:pk(ch.pal)});});
 for(let i=flying.length-1,n=0;i>=0;i--){const f=flying[i];f.t+=dt/f.T;if(f.t>=1&&n<30){land(f);flying.splice(i,1);n++;}}
 collide();
 stepDrips(dt);mapRefresh(now);
 if(hx&&now-hSettle>1000){hSettle=now;hx.save();hx.setTransform(1,0,0,1,0,0);hx.fillStyle='rgba(0,0,0,.015)';hx.fillRect(0,0,hc.width,hc.height);hx.restore();}
 vx.setTransform(DPR,0,0,DPR,0,0);vx.clearRect(0,0,W,H);
 vx.save();
 if(shake.t>0){shake.t-=dt;const m=shake.m*Math.max(0,shake.t/.25);vx.translate((R()-.5)*m,(R()-.5)*m);}
 if(useGL){const act=drips.length||flying.length||chargers.size||rings.length;if(act)gd=Math.max(gd,now+700);if(now<gd)renderGL();glc.style.transform=shake.t>0?`translate(${(R()-.5)*shake.m*Math.max(0,shake.t/.25)}px,${(R()-.5)*shake.m*Math.max(0,shake.t/.25)}px)`:'';}
 else vx.drawImage(paint,0,0,W,H);
 for(const d of drips)if(d.t>=0)head(vx,d);
 vx.lineCap='round';
 for(const f of flying){
  const P=posAt(f,eo(Math.min(1,f.t))),Q=posAt(f,eo(Math.max(0,f.t-.2)));
  vx.strokeStyle=hsl(f.col.h,f.col.s,f.col.l,f.type==='oil'?.95:.6);vx.lineWidth=f.size*(.9+.5*f.t)*1.1;
  vx.beginPath();vx.moveTo(Q[0],Q[1]);vx.lineTo(P[0],P[1]);vx.stroke();
  if(f.size>3){vx.fillStyle=hsl(f.col.h,f.col.s,f.col.l+10,f.type==='oil'?.95:.7);vx.beginPath();vx.arc(P[0],P[1],f.size*.62,0,TAU);vx.fill();}
 }
 for(let i=rings.length-1;i>=0;i--){const g=rings[i];g.t+=dt;const p=g.t/.5;if(p>=1){rings.splice(i,1);continue;}
  const rad=g.max*(1-Math.pow(1-p,3));
  if(p<.35){const fl=vx.createRadialGradient(g.x,g.y,0,g.x,g.y,g.max*.5);fl.addColorStop(0,`rgba(255,255,255,${.6*(1-p/.35)})`);fl.addColorStop(1,'rgba(255,255,255,0)');
   vx.fillStyle=fl;vx.beginPath();vx.arc(g.x,g.y,g.max*.5,0,TAU);vx.fill();}
  vx.strokeStyle=hsl(g.h,90,55,(1-p)*.7);vx.lineWidth=6*(1-p)+1;vx.beginPath();vx.arc(g.x,g.y,rad,0,TAU);vx.stroke();}
 for(let i=motes.length-1;i>=0;i--){const m=motes[i];
  if(m.ch.dead||m.r<6){motes.splice(i,1);continue;}
  m.v*=1+dt*1.4;m.r-=m.v*dt;m.a+=m.w*dt;
  const x=m.ch.x+Math.cos(m.a)*m.r,y=m.ch.y+Math.sin(m.a)*m.r,pr=m.r+m.v*.03,pa=m.a-m.w*.03;
  vx.strokeStyle=hsl(m.col.h,m.col.s,m.col.l,.85);vx.lineWidth=m.s;
  vx.beginPath();vx.moveTo(m.ch.x+Math.cos(pa)*pr,m.ch.y+Math.sin(pa)*pr);vx.lineTo(x,y);vx.stroke();}
 chargers.forEach(ch=>drawCharger(ch,now));
 try{if(window.SPD_draw)window.SPD_draw(vx,now,dt);}catch(e){console.error(e);}
 {const arr=[...chargers.values()].filter(c=>!c.blend);if(arr.length>1){vx.save();vx.lineWidth=2;for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){const d=Math.hypot(arr[i].x-arr[j].x,arr[i].y-arr[j].y);if(d<GR){vx.strokeStyle=`rgba(255,255,255,${.6*(1-d/GR)})`;vx.beginPath();vx.moveTo(arr[i].x,arr[i].y);vx.lineTo(arr[j].x,arr[j].y);vx.stroke();}}vx.restore();}}
 vx.restore();
}
requestAnimationFrame(frame);
window.SPD={get K(){return K},setSize,get tv(){return tvOn},get W(){return W},get H(){return H},explode,undo,get uc(){return undoStack.length},get shape(){return shp},rec:()=>!!rec,recStart,recStop,rr,R,hsl,clamp,TAU,note,audio,MIX:MIX_MODES,get micOn(){return micOn},micStop,dbg:()=>[...chargers.values()].map(c=>({b:!!c.blend,c:c.charge,br:c.br,x:c.x,y:c.y})),snap:()=>paint.toDataURL('image/png'),setGtr:v=>{gtrOn=v;stripUpdate();wsSel();}};
})();
