/* Light Show: a fleet of glowing lights that fly through the paint */
(function(){try{
var D=document,S=window.SPD||{},$=function(i){return D.getElementById(i)};
var ANS=[];try{var AC0=window.AudioContext||window.webkitAudioContext,oca=AC0.prototype.createAnalyser;AC0.prototype.createAnalyser=function(){var a=oca.apply(this,arguments);ANS.push(a);if(ANS.length>12)ANS.shift();return a;};}catch(e){}
var LV={l:0,c:.4,t:0};
window.SPD_LVL=function(){var n=performance.now();if(n-LV.t<8)return LV;LV.t=n;var bl=0,bc=LV.c;
 for(var k=0;k<ANS.length;k++){try{var an=ANS[k];if(!an._b||an._b.length!==an.frequencyBinCount)an._b=new Uint8Array(an.frequencyBinCount);an.getByteFrequencyData(an._b);var b=an._b,m=Math.floor(b.length*.23),s=0,w=0;
  for(var i=2;i<m;i++){var v=b[i]/255;s+=v;w+=v*i;}var g=Math.min(1,Math.max(0,(s/(m-2)-.04)*5));if(g>bl){bl=g;if(s>.5)bc=w/s/m;}}catch(e){}}
 LV.l=bl;LV.c=bc;return LV;};
var cv=null,cx=null,on=false,raf=0,L=[],N=9,last=0,lvl=0,cen=.4,ptr={},fly=true,vx=0,vy=0;
try{if(localStorage.getItem('spd-lm')==='b')fly=false;}catch(e){}
var DPR=Math.min(2,window.devicePixelRatio||1);
function mkF(i,near){return{ang:Math.random()*6.283,rad:.08+Math.random()*.5,z:near?.2+Math.random()*.8:1,sp:.16+Math.random()*.14,h:(i*40+Math.random()*30)%360,tr:[],w:.7+Math.random()*.6,sw:(Math.random()-.5)*.7,ph:Math.random()*100,x:vx,y:vy};}
function mkB(i){var a=Math.random()*6.283;return{x:innerWidth*(.15+.7*Math.random()),y:innerHeight*(.15+.7*Math.random()),a:a,sp:90+Math.random()*80,h:(i*40+Math.random()*30)%360,tr:[],ph:Math.random()*100,w:.6+Math.random()*.8};}
function build(){L=[];for(var i=0;i<N;i++)L.push(fly?mkF(i,true):mkB(i));}
function size(){if(!cv)return;cv.width=Math.round(innerWidth*DPR);cv.height=Math.round(innerHeight*DPR);}
function ui(){var b=$('t-ls'),w=$('w-ls'),m=$('t-lm'),p=$('w-lm');
 if(b){b.classList.toggle('sel',on);b.textContent=on?'Lights On':'Lights Off';}if(w){w.classList.toggle('sel',on);w.textContent=on?'Lights: On':'Lights: Off';}
 var t='Lights: '+(fly?'Fly':'Bounce');if(m)m.textContent=t;if(p)p.textContent=t;}
function start(){
 if(on)return;on=true;
 if(!cv){cv=D.createElement('canvas');cv.id='lsc';cv.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2';D.body.appendChild(cv);cx=cv.getContext('2d');(window.SPD_OV=window.SPD_OV||[]).push(function(){return on&&cv?cv:null;});addEventListener('resize',size);
  ['pointerdown','pointermove'].forEach(function(n){addEventListener(n,function(e){if(e.pointerType==='mouse'&&!(e.buttons))return;ptr[e.pointerId]={x:e.clientX,y:e.clientY};},true);});
  ['pointerup','pointercancel'].forEach(function(n){addEventListener(n,function(e){delete ptr[e.pointerId];},true);});}
 size();cv.style.display='';vx=innerWidth/2;vy=innerHeight*.45;build();
 last=performance.now();raf=requestAnimationFrame(frame);ui();
}
function stop(){on=false;cancelAnimationFrame(raf);if(cv)cv.style.display='none';ui();}
function frame(now){
 if(!on)return;raf=requestAnimationFrame(frame);
 var dt=Math.min(.05,(now-last)/1000);last=now;
 var q=window.SPD_LVL();lvl+=(q.l-lvl)*(q.l>lvl?.5:.08);cen=q.c;
 var W=innerWidth,H=innerHeight,pk=(S.W||W)/W,t=now/1000,ids=Object.keys(ptr);
 cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);cx.lineCap='round';cx.lineJoin='round';
 var boost=1+3.2*lvl;
 var tx=W/2,ty=H*.45;if(ids.length){var pp=ptr[ids[0]];tx=pp.x;ty=pp.y;}vx+=(tx-vx)*Math.min(1,dt*3);vy+=(ty-vy)*Math.min(1,dt*3);
 for(var i=0;i<L.length;i++){
  var o=L[i],ox=o.x,oy=o.y,sz=1,al=1,jump=false;
  if(fly){
   o.z-=o.sp*boost*dt;o.ang+=o.sw*dt;
   var k=Math.max(W,H)*.5*o.rad/Math.max(o.z,.02);
   o.x=vx+Math.cos(o.ang)*k;o.y=vy+Math.sin(o.ang)*k;
   if(o.z<.06||o.x<-90||o.x>W+90||o.y<-90||o.y>H+90){var n0=mkF(i,false);for(var kk in n0)o[kk]=n0[kk];o.x=vx;o.y=vy;o.tr=[];ox=o.x;oy=o.y;jump=true;}
   sz=.3+1.6*(1-o.z);al=Math.min(1,Math.max(0,(1-o.z)*5));
  }else{
   var fa=Math.sin(o.x*.004+t*.35+o.ph)*2.2+Math.cos(o.y*.005-t*.28+o.ph*.7)*2.2;
   var da=fa-o.a;da=Math.atan2(Math.sin(da),Math.cos(da));o.a+=da*dt*1.6;
   if(ids.length){var p=ptr[ids[i%ids.length]],ta=Math.atan2(p.y-o.y,p.x-o.x),d2=Math.atan2(Math.sin(ta-o.a),Math.cos(ta-o.a));o.a+=d2*dt*2.2;}
   var sp=o.sp*o.w*boost;o.x+=Math.cos(o.a)*sp*dt;o.y+=Math.sin(o.a)*sp*dt;
   if(o.x<10){o.x=10;o.a=Math.PI-o.a;}if(o.x>W-10){o.x=W-10;o.a=Math.PI-o.a;}
   if(o.y<10){o.y=10;o.a=-o.a;}if(o.y>H-10){o.y=H-10;o.a=-o.a;}
  }
  o.h=(o.h+dt*(14+60*lvl))%360;
  o.tr.push({x:o.x,y:o.y});if(o.tr.length>46)o.tr.shift();
  if(S.smear&&!jump&&al>.3&&(lvl>.12||ids.length||i%2===0)){try{S.smear(ox*pk,oy*pk,o.x*pk,o.y*pk,(10+22*lvl)*pk*o.w*sz*(fly?.7:1));}catch(e){}}
  var n=o.tr.length;
  for(var j=1;j<n;j++){var qq=j/n,a0=o.tr[j-1],a1=o.tr[j];cx.strokeStyle='hsla('+o.h+',100%,52%,'+(.75*qq*al)+')';cx.lineWidth=1.5+(5+9*lvl)*qq*o.w*sz;cx.beginPath();cx.moveTo(a0.x,a0.y);cx.lineTo(a1.x,a1.y);cx.stroke();}
  var rad=(9+8*lvl+3*Math.sin(t*3+o.ph))*sz,g=cx.createRadialGradient(o.x,o.y,0,o.x,o.y,rad*2.6);
  g.addColorStop(0,'rgba(255,255,255,'+al+')');g.addColorStop(.18,'rgba(255,255,255,'+(.95*al)+')');g.addColorStop(.4,'hsla('+o.h+',100%,60%,'+(.85*al)+')');g.addColorStop(1,'hsla('+o.h+',100%,50%,0)');
  cx.fillStyle=g;cx.beginPath();cx.arc(o.x,o.y,rad*2.6,0,6.283);cx.fill();
 }
}
function toggle(){on?stop():start();}
function mode(){fly=!fly;try{localStorage.setItem('spd-lm',fly?'f':'b');}catch(e){}if(on){vx=innerWidth/2;vy=innerHeight*.45;build();}ui();}
window.SPD_LS={start:start,stop:stop,toggle:toggle,mode:mode,on:function(){return on;}};
try{var fj=D.createElement('script');fj.src='fluid.js';D.head.appendChild(fj);var sj=D.createElement('script');sj.src='side.js';D.head.appendChild(sj);var sj2=D.createElement('script');sj2.src='shuffle.js';D.head.appendChild(sj2);var sj3=D.createElement('script');sj3.src='modes.js';D.head.appendChild(sj3);}catch(e){}
var tries=0,iv=setInterval(function(){tries++;var tg=D.querySelector('#p-tool .tg'),ws=$('wscroll'),mm=$('t-menu');
 if((!tg||!mm||mm.className!=='mm')&&tries<40)return;clearInterval(iv);
 if(tg&&!$('t-ls')){var b=D.createElement('button');b.className='tl';b.id='t-ls';b.textContent='Lights Off';b.onclick=toggle;b.style.gridColumn='4';b.style.minHeight='40px';if(mm&&mm.className==='mm'){mm.style.gridColumn='1/4';tg.insertBefore(b,mm.nextSibling);}else tg.insertBefore(b,tg.firstChild);
  var m=D.createElement('button');m.className='tl';m.id='t-lm';m.onclick=mode;m.style.minHeight='40px';tg.insertBefore(m,b.nextSibling);}
 if(ws&&!$('w-ls')){var p=D.createElement('button');p.className='pill';p.id='w-ls';p.onclick=toggle;var v=$('w-voice');ws.insertBefore(p,v?v.nextSibling:ws.firstChild);
  var p2=D.createElement('button');p2.className='pill';p2.id='w-lm';p2.onclick=mode;ws.insertBefore(p2,p.nextSibling);}
 ui();
},300);
}catch(e){console.warn('lights',e);}})();
