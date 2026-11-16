(()=>{
const S=window.SPD;if(!S)return;
const {R,rr,clamp,hsl,TAU}=S;
const NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const LOOKS=['Throw','Trace','Comets','Lanes','Blend','Strings','Rain','Burst'];
let sens=1;const GM=[1,2.2,4.5],SN=['Low','Med','High'];try{const v=parseInt(localStorage.getItem('spd-sens'));if(v>=0&&v<3)sens=v;}catch(e){}window.SPD_SENS=()=>GM[sens];
let on=false,look=0,stream=null,an=null,anF=null,buf=null,fdb=null,sr=48000,cal=0,floor=0,prevR=0,lastOn=0,pend=0,onAmp=0,rms=0,fr=0;
const cur={midi:null,col:{h:0,s:80,l:50},amp:0,t:0};
const feat=[];
let auto=false,lastEmitT=0,vOn=false;const V={n:0,m:null,pk:0,t:0,r:0,act:false};const LT={x:null,y:null,a:Math.random()*6.28,lvl:0,cm:60,col:{h:200,s:80,l:60},tr:[]};
let hist=[],spk=[],ph=0,comets=[],flash=[0,0,0,0,0,0],vib=[0,0,0,0,0,0],bursts=[];
const G=window.SPD_G={notes:[],get cur(){return cur},get look(){return look},set look(v){look=v;ui2();}};
try{const v=parseInt(localStorage.getItem('spd-look'));if(v>=0&&v<LOOKS.length)look=v;}catch(e){}
const hueOf=p=>p<=11?p*27:297+(p-11)*63;
const midiOf=f=>69+12*Math.log2(f/440);
function noteCol(m){const pc=((m%12)+12)%12,c=Math.abs(m-Math.round(m))*100,cf=Math.min(1,c/50);
 try{const w=S.wild,wp=S.wildPal,ov=S.leadOv;let md=w?wp:(S.palMode==='mono'?'Mono':S.mood);if(!w&&ov&&md!=='Mono')md='Mono';
  if(md==='Mono'){const s=ov&&!w?ov.s:85;return{h:S.hueShift,s:clamp(s-30*cf,20,100),l:clamp(20+pc*4.6+(m-60)*.5,12,88)};}
  const L=(md&&md!=='Random'&&md!=='Chaos'&&S.moods)?S.moods[md]:null;
  if(L){const T=L.slice().sort((a,b)=>a[0]-b[0]),o=T[Math.min(T.length-1,Math.floor(pc/12*T.length))];return{h:o[0],s:clamp(o[1]-25*cf,15,100),l:clamp(o[2]+(m-60)*.6,10,90)};}
 }catch(e){}
 return{h:hueOf(pc),s:clamp(90-35*cf,30,95),l:clamp(28+(m-36)*1.1,26,78)};}
function mkPal(c){return Array.from({length:6},(_,i)=>({h:(c.h+rr(-7,7)+360)%360,s:clamp(c.s+rr(-8,8),20,100),l:clamp(c.l+rr(-10,10),12,88),type:i%2?'wc':'oil',mix:S.MIX[(R()*S.MIX.length)|0]}));}
function yin(b,sr){
 const N=b.length>>1,x=new Float32Array(N);for(let i=0;i<N;i++)x[i]=(b[2*i]+b[2*i+1])*.5;
 const fs=sr/2,tmin=Math.max(2,Math.floor(fs/1000)),Wn=N>>1,tmax=Math.min(Math.floor(fs/70),Wn-2),o=N-Wn-tmax-1;
 if(o<0)return 0;
 const cm=new Float32Array(tmax+2);cm[0]=1;let run=0;
 for(let t=1;t<=tmax;t++){let s=0;for(let i=0;i<Wn;i++){const d=x[o+i]-x[o+i+t];s+=d*d;}run+=s;cm[t]=run?s*t/run:1;}
 let tau=-1;
 for(let t=tmin;t<=tmax;t++){if(cm[t]<.15){while(t+1<=tmax&&cm[t+1]<cm[t])t++;tau=t;break;}}
 if(tau<1||tau>=tmax)return 0;
 const a=cm[tau-1],b2=cm[tau],c=cm[tau+1],den=a-2*b2+c,sh=den?(a-c)/(2*den):0;
 return fs/(tau+clamp(sh,-.5,.5));
}
function fftNotes(){
 anF.getFloatFrequencyData(fdb);const bw=sr/anF.fftSize,k0=Math.floor(75/bw),k1=Math.floor(1100/bw);let mx=-200;
 for(let k=k0;k<=k1;k++)if(fdb[k]>mx)mx=fdb[k];
 const pk=[];
 for(let k=k0+1;k<k1;k++){const v=fdb[k];if(v>mx-16&&v>fdb[k-1]&&v>=fdb[k+1]){const a=fdb[k-1],c=fdb[k+1],den=a-2*v+c,sh=den?.5*(a-c)/den:0;pk.push({f:(k+clamp(sh,-.5,.5))*bw,db:v});}}
 pk.sort((a,b)=>a.f-b.f);const sel=[];
 for(const p of pk){if(sel.length>=5)break;let hm=false;for(const q of sel){const r=p.f/q.f;for(let m=2;m<=6;m++)if(Math.abs(r-m)<.035*m)hm=true;}if(!hm)sel.push(p);}
 return sel.map(p=>({midi:midiOf(p.f),db:p.db}));
}
async function start(){
 const a=S.audio();if(!a)return false;if(S.micOn)S.micStop();
 try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});}
 catch(e){S.note('Mic blocked. Allow microphone access.');return false;}
 const src=a.createMediaStreamSource(stream);sr=a.sampleRate;
 an=a.createAnalyser();an.fftSize=4096;an.smoothingTimeConstant=0;src.connect(an);buf=new Float32Array(4096);
 anF=a.createAnalyser();anF.fftSize=8192;anF.smoothingTimeConstant=.1;src.connect(anF);fdb=new Float32Array(anF.frequencyBinCount);
 cal=performance.now()+1000;floor=0;prevR=0;pend=0;S.note('Guitar mode: stay quiet for 1 second…');return true;
}
function stop(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;an=anF=null;}
function listen(now){
 an.getFloatTimeDomainData(buf);let s=0;for(let i=0;i<4096;i++)s+=buf[i]*buf[i];rms=Math.sqrt(s/4096)*GM[sens];try{const ac=S.audio();if(ac&&ac.state==='suspended')ac.resume();}catch(e){}
 if(now<cal){floor=floor?floor*.9+rms*.1:rms;prevR=rms;return;}
 floor=Math.min(floor,.06);const thr=Math.max(.012,floor*2.4+.008);if(rms<thr)floor=floor*.98+rms*.02;
 cur.amp+=(clamp(rms*5,0,1)-cur.amp)*.3;
 if(rms>thr&&(rms>prevR*1.3+.005||now-lastOn>1600)&&now-lastOn>160){lastOn=now;pend=now+95;onAmp=rms;}
 if(pend&&now>=pend){pend=0;fire();}
 if(rms>thr&&++fr%3===0){const f=yin(buf,sr);if(f>70&&f<1100){const m=midiOf(f);cur.midi=(cur.midi==null||Math.abs(m-cur.midi)>.8)?m:cur.midi+(m-cur.midi)*.35;cur.col=noteCol(cur.midi);cur.t=now;vtrack(now,m,rms);}}
 if(now-V.t>700)V.act=false;
 prevR=rms;
}
function vtrack(now,m,r){
 if(V.m!=null&&now-V.t<450&&Math.abs(m-V.m)<2.2){V.n++;V.pk=Math.max(V.pk*.97,r);V.m=V.m*.6+m*.4;}else{V.n=1;V.pk=r;V.m=m;}
 V.t=now;V.r=r;if(V.n>=4&&r>=V.pk*.5&&m>=48&&m<=81)V.act=true;else if(V.n<4)V.act=V.act&&now-V.t<700;
}
function fire(){
 let notes=fftNotes();const fy=yin(buf,sr),my=(fy>70&&fy<1100)?midiOf(fy):null;
 if(my!=null){const k=notes.findIndex(n=>Math.abs(n.midi-my)<.7);if(k>=0)notes[k].midi=my;else if(notes.length<2)notes=[{midi:my,db:0}];else if(!notes.some(n=>Math.abs(((n.midi-my)%12+18)%12-6)<.7))notes.push({midi:my,db:-9});}
 if(notes.length>1){const top=Math.max(...notes.map(n=>n.db));notes=notes.filter(n=>n.db>=top-8);}
 if(!notes.length)return;
 notes.sort((a,b)=>a.midi-b.midi);
 notes=notes.filter((n,i)=>{for(let j=0;j<i;j++){const r=Math.pow(2,(n.midi-notes[j].midi)/12);for(let m=2;m<=8;m++)if(Math.abs(r-m)<.04*m)return false;}return true;});notes=notes.slice(0,5);
 const amp=clamp(onAmp*5,.15,1),down=notes.length<2||notes[0].db>=notes[notes.length-1].db,seq=down?notes:notes.slice().reverse();
 seq.forEach((n,i)=>setTimeout(()=>emit(n,amp,seq.length),i*40));
}
function lane(m){return m<45?0:m<50?1:m<55?2:m<59?3:m<64?4:5;}
function emit(n,amp,cnt){
 const m=n.midi,col=noteCol(m),w=S.W,h=S.H,lean=(clamp((m-40)/48,0,1)-.5)*.22,x=w*clamp(.5+lean+rr(-.46,.46),.05,.95),ry=()=>h*rr(.1,.88);
 feat.push({t:performance.now(),m,a:amp});
 const nowE=performance.now();if(auto){if(nowE-lastEmitT<(amp>.7?300:560))return;lastEmitT=nowE;}
 cur.midi=m;cur.col=col;cur.t=performance.now();
 G.notes.push(NN[((Math.round(m)%12)+12)%12]+' '+Math.round((m-Math.round(m))*100));if(G.notes.length>300)G.notes.shift();
 const ch=clamp(((.18+amp*.65)/Math.sqrt(cnt)+.05)*(auto?.72:1),.1,1);
 if(look===0||look===4)S.explode({x:clamp(x,20,w-20),y:ry(),charge:ch,pal:mkPal(col),sp:0,va:0,nf:Math.min(cnt,3)});
 if(look===1||look===4)spk.push(...[.35,1,-.7,.4,-.2,.08].map(v=>v*(.4+amp*.6)));
 if(look===2&&comets.length<28)comets.push({y:h*(.86-.74*clamp((m-40)/48,0,1)),x:w*(.42+rr(-.2,.2)),col,sz:5+amp*9,age:0,ph:R()*6,tr:[]});
 if(look===5){const i=lane(m);vib[i]=1;S.explode({x:w*rr(.08,.92),y:h*(.18+.1*(5-i)),charge:clamp(ch*.85,.1,1),pal:mkPal(col),sp:0,va:0,nf:1});}
 if(look===6)S.explode({x:clamp(x,20,w-20),y:h*.08,charge:ch,pal:mkPal(col),sp:1.4,va:Math.PI/2+rr(-.3,.3),nf:1});
 if(look===7){const bx=clamp(x,40,w-40),by=h*rr(.2,.8);bursts.push({x:bx/(S.K||1),y:by/(S.K||1),col,age:0,sz:amp});S.explode({x:bx,y:by,charge:ch,pal:mkPal(col),sp:0,va:0,nf:Math.min(cnt,3)});}
 if(look===3){const i=lane(m);flash[i]=1;S.explode({x:w*(.1+.16*i)+rr(-10,10),y:h*rr(.2,.45),charge:ch,pal:mkPal(col),sp:1.4,va:-Math.PI/2+rr(-.3,.3),nf:1});}
}
function drawTrace(vx,dt,W,H){
 const by=Math.max(150,Math.round(H*.3)),step=3,n=Math.ceil(W/step)+2;
 const k=Math.max(1,Math.round(dt*60));
 for(let j=0;j<k;j++){ph+=.9;const v=spk.length?spk.shift():cur.amp*.28*Math.sin(ph)*(on?1:0);hist.push({v,c:cur.col});}
 while(hist.length>n)hist.shift();
 vx.fillStyle='rgba(10,6,20,.5)';vx.fillRect(0,by-66,W,132);
 vx.lineCap='round';vx.lineJoin='round';vx.lineWidth=3;
 for(let i=1;i<hist.length;i++){const a=hist[i-1],b=hist[i],x0=W-(hist.length-i+1)*step,x1=W-(hist.length-i)*step,c=b.c;
  vx.strokeStyle=hsl(c.h,c.s,Math.min(90,c.l+18),.35+.65*i/hist.length);vx.beginPath();vx.moveTo(x0,by-a.v*H*.09);vx.lineTo(x1,by-b.v*H*.09);vx.stroke();}
}
function bgDark(){try{const c=S.bg||'#fff',n=parseInt(c.slice(1),16);return (((n>>16)&255)*.3+((n>>8)&255)*.59+(n&255)*.11)<110;}catch(e){return false;}}
function cc(col,dark,a){return dark?hsl(col.h,clamp(col.s,70,100),clamp(col.l+18,58,86),a):hsl(col.h,clamp(col.s+10,70,100),clamp(col.l-8,32,54),a);}
function drawComets(vx,dt,W,H){
 const dk=bgDark();vx.fillStyle=dk?'rgba(8,8,10,.9)':'rgba(255,255,255,.88)';vx.fillRect(0,0,W,H);
 for(let i=comets.length-1;i>=0;i--){const c=comets[i];c.age+=dt;if(c.age>6){comets.splice(i,1);continue;}
  for(const p of c.tr)p.x-=170*dt;
  const y=c.y+Math.sin(c.age*2+c.ph)*7;c.tr.push({x:c.x,y});if(c.tr.length>110)c.tr.shift();
  const fade=c.age>4.5?Math.max(0,1-(c.age-4.5)/1.5):1,col=c.col;
  vx.lineCap='round';
  for(let j=1;j<c.tr.length;j++){const t=j/c.tr.length;vx.strokeStyle=cc(col,dk,t*.8*fade);vx.lineWidth=Math.max(1,c.sz*t*.8);vx.beginPath();vx.moveTo(c.tr[j-1].x,c.tr[j-1].y);vx.lineTo(c.tr[j].x,c.tr[j].y);vx.stroke();}
  const g=vx.createRadialGradient(c.x,y,0,c.x,y,c.sz*3.2);g.addColorStop(0,dk?hsl(col.h,col.s,90,fade):hsl(col.h,clamp(col.s+10,70,100),62,fade));g.addColorStop(.35,cc(col,dk,.6*fade));g.addColorStop(1,cc(col,dk,0));
  vx.fillStyle=g;vx.beginPath();vx.arc(c.x,y,c.sz*3.2,0,TAU);vx.fill();
 }
}
function drawLanes(vx,dt,W,H){
 for(let i=0;i<6;i++){flash[i]=Math.max(0,flash[i]-dt*2.2);const x=W*(.1+.16*i);vx.strokeStyle='rgba(255,255,255,'+(.18+.6*flash[i])+')';vx.lineWidth=2+5*flash[i];vx.beginPath();vx.moveTo(x,H*.08);vx.lineTo(x,H*.9);vx.stroke();}
}
function drawStrings(vx,dt,W,H){
 for(let i=0;i<6;i++){vib[i]=Math.max(0,vib[i]-dt*1.5);const y=H*(.18+.1*(5-i)),a=2+30*vib[i]*vib[i],c=cur.col;
  vx.strokeStyle=vib[i]>.04?hsl(c.h,c.s,Math.min(88,c.l+18),.45+.5*vib[i]):'rgba(255,255,255,.4)';vx.lineWidth=2+3*vib[i];vx.lineCap='round';vx.beginPath();
  for(let x=0;x<=W;x+=8){const yy=y+Math.sin(x*.045+ph*.6+i)*a*Math.sin(Math.PI*x/W);if(x===0)vx.moveTo(x,yy);else vx.lineTo(x,yy);}vx.stroke();}
 ph+=dt*30;
}
function drawBursts(vx,dt){
 for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.age+=dt;if(b.age>1.2){bursts.splice(i,1);continue;}
  const f=1-b.age/1.2,r=b.age*(380+260*b.sz);vx.strokeStyle=hsl(b.col.h,b.col.s,Math.min(88,b.col.l+14),f*.85);vx.lineWidth=2+9*f;vx.beginPath();vx.arc(b.x,b.y,r,0,TAU);vx.stroke();}
}
function drawLight(vx,dt,W,H,k){
 if(!vOn)return;
 const PW=S.W,PH=S.H,tn=performance.now(),act=V.act&&tn-V.t<700;
 if(LT.x==null){LT.x=PW/2;LT.y=PH/2;}
 LT.lvl+=((act?clamp(V.r*5,.25,1):0)-LT.lvl)*Math.min(1,dt*5);
 if(act){LT.cm+=(V.m-LT.cm)*.15;LT.col=noteCol(LT.cm);}
 const ox=LT.x,oy=LT.y;
 if(LT.lvl>.08){
  const sp=(60+420*LT.lvl)*k,ty=PH*(.88-.76*clamp((LT.cm-45)/36,0,1));
  LT.a+=(Math.random()-.5)*dt*6;
  LT.x+=Math.cos(LT.a)*sp*dt;LT.y+=(ty-LT.y)*Math.min(1,dt*1.8)+Math.sin(LT.a)*sp*dt*.4;
 }else{LT.a+=(Math.random()-.5)*dt*2;LT.x+=Math.cos(LT.a)*14*k*dt;LT.y+=Math.sin(LT.a)*14*k*dt;}
 if(LT.x<PW*.05||LT.x>PW*.95){LT.a=Math.PI-LT.a;LT.x=clamp(LT.x,PW*.05,PW*.95);}
 LT.y=clamp(LT.y,PH*.06,PH*.94);
 if(LT.lvl>.08&&Math.hypot(LT.x-ox,LT.y-oy)>.5)try{S.smear(ox,oy,LT.x,LT.y,(22+46*LT.lvl)*k);}catch(e){}
 LT.tr.push({x:LT.x/k,y:LT.y/k,l:LT.lvl});if(LT.tr.length>26)LT.tr.shift();
 const c=LT.col,pul=.5+.5*Math.sin(tn/1000*2.4),rad=(13+5*pul)+30*LT.lvl,al=.8+.2*pul;
 vx.lineCap='round';
 if(LT.lvl>.08)for(let i=1;i<LT.tr.length;i++){const a=LT.tr[i-1],b=LT.tr[i],t=i/LT.tr.length;vx.strokeStyle=hsl(c.h,c.s,Math.min(88,c.l+20),.5*t*LT.lvl);vx.lineWidth=2+8*t*(.3+b.l);vx.beginPath();vx.moveTo(a.x,a.y);vx.lineTo(b.x,b.y);vx.stroke();}
 const x=LT.x/k,y=LT.y/k,g=vx.createRadialGradient(x,y,0,x,y,rad*1.6);
 g.addColorStop(0,'rgba(255,255,255,'+al+')');g.addColorStop(.18,'rgba(255,255,255,'+(.85*al)+')');g.addColorStop(.45,LT.lvl>.08?hsl(c.h,c.s,Math.min(90,c.l+25),.45*al):'rgba(255,255,255,'+(.3*al)+')');g.addColorStop(1,'rgba(255,255,255,0)');
 vx.strokeStyle='rgba(0,0,0,'+(.22*al)+')';vx.lineWidth=2;vx.beginPath();vx.arc(x,y,rad*.95,0,TAU);vx.stroke();
 vx.fillStyle=g;vx.beginPath();vx.arc(x,y,rad*1.6,0,TAU);vx.fill();
}
function label(vx,now,W){
 if(cur.midi==null||now-cur.t>2500)return;
 const m=cur.midi,r=Math.round(m),c=Math.round((m-r)*100),t=NN[((r%12)+12)%12]+(Math.floor(r/12)-1)+'  '+(c>0?'+':'')+c+'¢',col=cur.col;
 vx.font='700 15px system-ui,sans-serif';const w=vx.measureText(t).width+24;
 vx.fillStyle='rgba(10,6,20,.7)';vx.beginPath();vx.roundRect?vx.roundRect(W/2-w/2,86,w,28,14):vx.rect(W/2-w/2,86,w,28);vx.fill();
 vx.fillStyle=hsl(col.h,col.s,Math.min(88,col.l+22));vx.textAlign='center';vx.textBaseline='middle';vx.fillText(t,W/2,100);
}
window.SPD_draw=(vx,now,dt)=>{
 if(!on)return;
 if(an)listen(now);
 const k=S.K||1,W=S.W/k,H=S.H/k;
 vx.save();if(k!==1)vx.scale(k,k);
 if(look===2)drawComets(vx,dt,W,H);
 if(look===1||look===4)drawTrace(vx,dt,W,H);
 if(look===3)drawLanes(vx,dt,W,H);
 if(look===5)drawStrings(vx,dt,W,H);
 if(look===7)drawBursts(vx,dt);
 drawLight(vx,dt,W,H,k);
 label(vx,now,W);
 vx.restore();
};
const tg=document.querySelector('.tg'),WS=document.getElementById('wscroll');
const bg=document.createElement('button');bg.className='tl';bg.id='t-gtr';
const bl=document.createElement('button');bl.className='tl';bl.id='t-look';
const wl=document.createElement('button');wl.className='pill';wl.id='w-look';
const bs=document.createElement('button');bs.className='tl';bs.id='t-sens';const ws=document.createElement('button');ws.className='pill';ws.id='w-sens';
tg.appendChild(bg);tg.appendChild(bl);tg.appendChild(bs);WS.appendChild(wl);WS.appendChild(ws);
function ui2(){bg.textContent=on?'Guitar On':'Guitar Off';bg.classList.toggle('sel',on);bl.innerHTML='Look<br>'+LOOKS[look];wl.textContent='Look: '+LOOKS[look];bs.innerHTML='Mic<br>'+SN[sens];ws.textContent='Mic: '+SN[sens];if(window.__ui3)window.__ui3();}
async function toggle(){
 if(on){on=false;stop();S.setGtr(false);ui2();return;}
 on=true;S.setGtr(true);ui2();
 const ok=await start();if(!ok){on=false;S.setGtr(false);ui2();}
}
bg.onclick=toggle;
bs.onclick=ws.onclick=()=>{sens=(sens+1)%3;try{localStorage.setItem('spd-sens',String(sens));}catch(e){}if(on&&an){floor=0;cal=performance.now()+700;}ui2();S.note('Mic sensitivity: '+SN[sens]+(on?' - stay quiet a moment':''));};
bl.onclick=wl.onclick=()=>{look=(look+1)%LOOKS.length;comets.length=0;hist.length=0;spk.length=0;bursts.length=0;ui2();S.note('Look: '+LOOKS[look]);try{localStorage.setItem('spd-look',String(look));}catch(e){}};

/* canvas color + voice light */
try{
const BGS=[['Paper','#f1e9da'],['Gray','#7a7a7e'],['Black','#08080a'],['White','#ffffff']];let bi=0;
const bT=document.createElement('button');bT.className='tl';bT.id='t-bg';const bW=document.createElement('button');bW.className='pill';bW.id='w-bg';
const vT=document.createElement('button');vT.className='tl';vT.id='t-voice';const vW=document.createElement('button');vW.className='pill';vW.id='w-voice';
tg.appendChild(bT);tg.appendChild(vT);{const z=document.getElementById('w-size');if(z){WS.insertBefore(bW,z.nextSibling);WS.insertBefore(vW,bW.nextSibling);}else{WS.appendChild(bW);WS.appendChild(vW);}}
window.__ui3=()=>{const n=BGS[bi][0];bT.innerHTML='Canvas<br>'+n;bW.textContent='Canvas: '+n;vT.innerHTML='Voice Light<br>'+(vOn?'On':'Off');vW.textContent='Voice Light: '+(vOn?'On':'Off');vT.classList.toggle('sel',vOn);vW.classList.toggle('sel',vOn);};
bT.onclick=bW.onclick=()=>{bi=(bi+1)%BGS.length;comets.length=0;S.setBG(BGS[bi][1]);window.__ui3();S.note('Canvas color: '+BGS[bi][0]+'. Undo brings the old canvas back');};
vT.onclick=vW.onclick=async()=>{vOn=!vOn;LT.tr.length=0;window.__ui3();if(vOn&&!on)await toggle();S.note(vOn?'Voice Light on: sing and a light drifts through the paint':'Voice Light off');};
window.__ui3();
}catch(e){console.warn('bgvoice',e);}
/* randomize performance + square strip buttons */
try{
const sq=document.createElement('style');sq.textContent='#wscroll{height:60px!important;gap:5px!important}#wscroll .pill{width:60px;height:60px;min-width:60px;min-height:60px;padding:2px!important;border-radius:12px!important;font-size:10px;line-height:1.1;letter-spacing:0;white-space:normal;text-align:center;overflow-wrap:anywhere}#wscroll #w-rand{background:#2e1a47;color:#7cfc00;box-shadow:inset 0 0 0 2px #7cfc00;font-weight:800}#wscroll #w-rand.sel{background:#d41;color:#fff;box-shadow:none}body.strip #p-tool{bottom:calc(env(safe-area-inset-bottom,0px) + 132px)!important}body.strip #undo{bottom:calc(env(safe-area-inset-bottom,0px) + 80px)!important}';document.head.appendChild(sq);
let gtrWas=false,lastMood=-1e9,lastLook=-1e9,cand=null,candN=0,curMood=null,curBucket=null,lastManual=-1e9,internal=false;
const LB=[[5,2,1],[0,3,4],[6,7,0]];
const RB=document.createElement('button');RB.className='pill';RB.id='w-rand';RB.textContent='Randomize';WS.insertBefore(RB,WS.firstChild);
const clickStrip=t=>{const b=[...WS.children].find(x=>x.textContent.trim()===t);if(b){internal=true;try{b.click();}finally{internal=false;}}};
WS.addEventListener('click',e=>{const p=e.target.closest&&e.target.closest('.pill');if(!internal&&p&&p!==RB)lastManual=performance.now();if(p&&p.id!=='w-rec'&&p.id!=='w-music')comets.length=0;},true);
function analyze(){const now=performance.now();while(feat.length&&now-feat[0].t>10000)feat.shift();if(feat.length<3)return null;
 const w=new Array(12).fill(0);let sa=0,sm=0;feat.forEach(f=>{w[((Math.round(f.m)%12)+12)%12]+=f.a;sa+=f.a;sm+=f.m;});
 let best=-1,mode='major';for(let r=0;r<12;r++){const mj=w[r]+w[(r+4)%12]+w[(r+7)%12],mn=w[r]+w[(r+3)%12]+w[(r+7)%12];if(mj>best){best=mj;mode='major';}if(mn>best+1e-9){best=mn;mode='minor';}}
 const el=Math.min(10,(now-feat[0].t)/1000+1),rate=feat.length/el,avgA=sa/feat.length,avgM=sm/feat.length,e=clamp(rate/2.5,0,1)*.5+clamp(avgA*1.2,0,1)*.5;
 return{mode,e,avgM,rate};}
function decide(){if(!auto)return;const r=analyze();if(!r)return;const now=performance.now(),calm=now-lastManual>20000;
 let m;if(r.mode==='minor')m=r.e<.3?'Dread':r.e<.6?'Melancholy':'Rage';else m=r.e<.3?(r.avgM<55?'Nostalgia':'Serenity'):r.e<.6?'Joy':r.e<.85?'Euphoria':'Chaos';
 if(m!==curMood){if(m===cand)candN++;else{cand=m;candN=1;}if(candN>=2&&now-lastMood>7000&&calm){clickStrip(m);curMood=m;lastMood=now;candN=0;}}else candN=0;
 const bk=r.e<.3?0:r.e<.6?1:2;
 if(bk!==curBucket&&now-lastLook>6000&&calm){const o=LB[bk].filter(v=>v!==look);G.look=o[(Math.random()*o.length)|0];curBucket=bk;lastLook=now;comets.length=0;}}
setInterval(decide,1000);
function stopAuto(){auto=false;RB.textContent='Randomize';RB.classList.remove('sel');try{if(S.rec())S.recStop();}catch(e){}if(!gtrWas&&on)toggle();}
RB.onclick=async()=>{
 if(auto){stopAuto();return;}
 auto=true;feat.length=0;curMood=null;cand=null;candN=0;curBucket=null;lastMood=lastLook=-1e9;gtrWas=on;RB.textContent='■ Stop';RB.classList.add('sel');
 if(!on)await toggle();
 if(!on){stopAuto();return;}
 try{if(!S.rec())S.recStart();}catch(e){}
 S.note('Randomize on: play, and the colors and look follow you. Tap Stop to finish.');};
}catch(e){console.warn('randomize',e);}
ui2();
})();
