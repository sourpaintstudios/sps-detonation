/* Fluid mode: GPU fluid simulation, touch and sound push colored dye around */
(function(){try{
var D=document,$=function(i){return D.getElementById(i)};
try{var _pp=window.__popped;Object.defineProperty(window,'__popped',{configurable:true,get:function(){return window.__hover?0:_pp;},set:function(v){_pp=v;}});}catch(e){}
var cv,gl,T,P={},vel,dye,dvg,crl,prs,on=false,raf=0,last=0,ptr={},lvl=0,cen=.4,idle=0,hue0=Math.random()*360,tt=0,ready=0,fail=0,W=1,H=1,aspect=1,bgi=3,fm=0,fzOn=false,frz=0,sh=null,shx=null,snap=null,crys=null,tris=[],shards=[],shT=0,shLast=0,shOx=0,shOy=0,dpx=1,SM=null,fzm=0,look=0,flow=0,mir=0,dropOn=true,pL=0,lastDrop=0,slowT=0;
(window.SPD_OV=window.SPD_OV||[]).push(function(){return on&&cv&&(frz===0||frz===3)?cv:null;});(window.SPD_OV=window.SPD_OV||[]).push(function(){return (frz>=1&&frz<=4)&&sh?sh:null;});
var BGS=[['Black',[0,0,0],.3],['White',[1,1,1],.3],['Gray',[.48,.48,.5],.3],['Clear',[0,0,0],0]];
try{var sv=parseInt(localStorage.getItem('spd-fb'),10);if(sv>=0&&sv<4)bgi=sv;if(localStorage.getItem('spd-fm')==='1')fm=1;var z=parseInt(localStorage.getItem('spd-fz'),10);if(z>=1&&z<=3){fzm=z;fzOn=true;}look=parseInt(localStorage.getItem('spd-fp'),10)||0;flow=parseInt(localStorage.getItem('spd-fi'),10)||0;mir=parseInt(localStorage.getItem('spd-fr'),10)||0;dropOn=localStorage.getItem('spd-fd')!=='0';}catch(e){}
var VS='attribute vec2 aPosition;varying vec2 vUv,vL,vR,vT,vB;uniform vec2 texelSize;void main(){vUv=aPosition*.5+.5;vL=vUv-vec2(texelSize.x,0.);vR=vUv+vec2(texelSize.x,0.);vT=vUv+vec2(0.,texelSize.y);vB=vUv-vec2(0.,texelSize.y);gl_Position=vec4(aPosition,0.,1.);}';
var HD='precision highp float;varying vec2 vUv,vL,vR,vT,vB;';
var FS={
clear:'uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}',
splat:'uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point;p.x*=aspectRatio;vec3 s=exp(-dot(p,p)/radius)*color;gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+s,1.);}',
adv:'uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform float dt,dissipation;void main(){vec2 c=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;gl_FragColor=texture2D(uSource,c)/(1.+dissipation*dt);}',
div:'uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x,T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}',
curl:'uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y,R=texture2D(uVelocity,vR).y,T=texture2D(uVelocity,vT).x,B=texture2D(uVelocity,vB).x;gl_FragColor=vec4(.5*(R-L-T+B),0.,0.,1.);}',
vort:'uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl,dt;void main(){float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,C=texture2D(uCurl,vUv).x;vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+.0001;f*=curl*C;f.y*=-1.;vec2 v=texture2D(uVelocity,vUv).xy+f*dt;gl_FragColor=vec4(min(max(v,-1000.),1000.),0.,1.);}',
pres:'uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x,T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;float d=texture2D(uDivergence,vUv).x;gl_FragColor=vec4((L+R+B+T-d)*.25,0.,0.,1.);}',
grad:'uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x,T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;vec2 v=texture2D(uVelocity,vUv).xy-vec2(R-L,T-B);gl_FragColor=vec4(v,0.,1.);}',
disp:'uniform sampler2D uTexture;uniform vec3 bg;uniform float bgA;void main(){vec3 c=max(texture2D(uTexture,vUv).rgb,0.);float m=max(c.r,max(c.g,c.b));float a=min(1.,pow(m,.8)*.95);vec3 h=c/max(m,.0001);gl_FragColor=vec4(bg*bgA*(1.-a)+h*a,max(bgA,a));}'};
function prog(fs){var p=gl.createProgram(),a=gl.createShader(gl.VERTEX_SHADER),b=gl.createShader(gl.FRAGMENT_SHADER);
 gl.shaderSource(a,VS);gl.compileShader(a);gl.shaderSource(b,HD+fs);gl.compileShader(b);
 if(!gl.getShaderParameter(b,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(b));
 gl.attachShader(p,a);gl.attachShader(p,b);gl.bindAttribLocation(p,0,'aPosition');gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('link');
 var u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(var i=0;i<n;i++){var nm=gl.getActiveUniform(p,i).name;u[nm]=gl.getUniformLocation(p,nm);}
 return{p:p,u:u};}
function use(p){gl.useProgram(p.p);return p.u;}
function tex(loc,t,unit){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.uniform1i(loc,unit);}
function mkT(w,h,fl){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,fl);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,fl);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texImage2D(gl.TEXTURE_2D,0,T.fmt,w,h,0,gl.RGBA,T.hf,null);
 var f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
 if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('fbo');
 gl.viewport(0,0,w,h);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
 return{t:t,f:f,w:w,h:h,tx:[1/w,1/h]};}
function mk2(w,h,fl){return{r:mkT(w,h,fl),w:mkT(w,h,fl),swap:function(){var x=this.r;this.r=this.w;this.w=x;}};}
function res(r){var a=W/H;if(a<1)a=1/a;var mn=Math.round(r),mx=Math.round(r*a);return W>H?{w:mx,h:mn}:{w:mn,h:mx};}
function build(){var s=res(128),d=res(512),fl=T.lin?gl.LINEAR:gl.NEAREST;
 vel=mk2(s.w,s.h,fl);dye=mk2(d.w,d.h,fl);dvg=mkT(s.w,s.h,gl.NEAREST);crl=mkT(s.w,s.h,gl.NEAREST);prs=mk2(s.w,s.h,gl.NEAREST);}
function size(){if(!cv)return;if(frz)endShatter();var dp=Math.min(1.5,window.devicePixelRatio||1);W=Math.max(2,innerWidth);H=Math.max(2,innerHeight);cv.width=Math.round(W*dp);cv.height=Math.round(H*dp);aspect=cv.width/cv.height;if(ready){try{build();}catch(e){fail=1;}}}
function init(){
 cv=D.createElement('canvas');cv.id='flc';cv.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2;pointer-events:none';D.body.appendChild(cv);
 var o={alpha:true,premultipliedAlpha:true,depth:false,stencil:false,antialias:false,preserveDrawingBuffer:true};
 gl=cv.getContext('webgl2',o);
 if(gl){gl.getExtension('EXT_color_buffer_float');gl.getExtension('EXT_color_buffer_half_float');T={hf:gl.HALF_FLOAT,fmt:gl.RGBA16F,lin:true};}
 else{gl=cv.getContext('webgl',o)||cv.getContext('experimental-webgl',o);if(!gl)throw new Error('nogl');var e=gl.getExtension('OES_texture_half_float');if(!e)throw new Error('nohf');var l=gl.getExtension('OES_texture_half_float_linear');gl.getExtension('EXT_color_buffer_half_float');T={hf:e.HALF_FLOAT_OES,fmt:gl.RGBA,lin:!!l};}
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),gl.STATIC_DRAW);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),gl.STATIC_DRAW);
 gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(0);
 for(var k in FS)P[k]=prog(FS[k]);
 size();build();ready=1;addEventListener('resize',size);
 function ok(e){var t=e.target;return !(t&&t.closest&&t.closest('button,.pnl,#wscroll,#start,#perf,#perfbar,input,#jb,#inf'));}
 function pd(e){if(!on||!ok(e))return;if(frz){try{e.stopImmediatePropagation();e.preventDefault();}catch(_){}if(frz===1){if(fzm===3&&SM)smash(e.clientX,e.clientY);else if(fzm===2)melt();else shatter(e.clientX,e.clientY);}return;}ptr[e.pointerId]={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,ht:performance.now(),o:(Math.random()-.5)*50,h:baseH()};var p=ptr[e.pointerId];splat(p.x/W,1-p.y/H,(Math.random()-.5)*400,(Math.random()-.5)*400,col(p.h,1.6));}
 function pm(e){var p=ptr[e.pointerId];if(!on||!p)return;if(frz===1||frz===2||frz===4){p.x=e.clientX;p.y=e.clientY;return;}if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>30){p.sx=e.clientX;p.sy=e.clientY;p.ht=performance.now();}var dx=(e.clientX-p.x)/W,dy=-(e.clientY-p.y)/H;if(aspect<1)dx*=aspect;else dy/=aspect;p.o=Math.max(-35,Math.min(35,p.o+(Math.random()-.5)*8));p.h=baseH()+p.o;splat(e.clientX/W,1-e.clientY/H,dx*6000,dy*6000,col(p.h,1));if(fm===1&&window.SPD&&window.SPD.dep){try{var pk=(window.SPD.W||W)/W,sp=Math.hypot(e.clientX-p.x,e.clientY-p.y);window.SPD.dep(p.x*pk,p.y*pk,e.clientX*pk,e.clientY*pk,(9+Math.min(22,sp*.5))*pk,'hsl('+(((p.h%360)+360)%360)+',90%,55%)');}catch(_){}}p.x=e.clientX;p.y=e.clientY;}
 function pu(e){delete ptr[e.pointerId];}
 addEventListener('pointerdown',pd,true);addEventListener('pointermove',pm,true);addEventListener('pointerup',pu,true);addEventListener('pointercancel',pu,true);
 for(var i=0;i<6;i++)splat(Math.random(),Math.random(),(Math.random()-.5)*1500,(Math.random()-.5)*1500,col(baseH()+(i-2.5)*14,2));
}
function baseH(){var S=window.SPD;try{if(S&&typeof S.hueShift==='number')return S.hueShift;}catch(_){}return hue0+tt*14;}
function baseS(){try{var o=window.SPD&&window.SPD.leadOv;if(o&&typeof o.s==='number')return Math.max(.35,Math.min(1,o.s/100));}catch(_){}return 1;}
function hsv(h,s,v){h=((h%360)+360)%360/60;var i=Math.floor(h),f=h-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);switch(i%6){case 0:return[v,t,p];case 1:return[q,v,p];case 2:return[p,v,t];case 3:return[p,q,v];case 4:return[t,p,v];default:return[v,p,q];}}
function lk(h){h=((h%360)+360)%360;if(look===1)return h/360*60;if(look===2)return [320,185,95,275][Math.floor(h/90)%4];if(look===3)return 175+h/360*50;return h;}
function col(h,k){var c=hsv(lk(h),look?1:baseS(),1);return[c[0]*.11*k,c[1]*.11*k,c[2]*.11*k];}
function blit(t){if(t){gl.viewport(0,0,t.w,t.h);gl.bindFramebuffer(gl.FRAMEBUFFER,t.f);}else{gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);}
function splat(x,y,dx,dy,c){splat0(x,y,dx,dy,c);if(!mir)return;var k,a,ca,sa,u,v;if(mir===1){splat0(1-x,y,-dx,dy,c);}else if(mir===2){splat0(1-x,y,-dx,dy,c);splat0(x,1-y,dx,-dy,c);splat0(1-x,1-y,-dx,-dy,c);}else{u=(x-.5)*aspect;v=y-.5;for(k=1;k<6;k++){a=k*1.0472;ca=Math.cos(a);sa=Math.sin(a);splat0((u*ca-v*sa)/aspect+.5,u*sa+v*ca+.5,dx*ca-dy*sa,dx*sa+dy*ca,c);}}}
function splat0(x,y,dx,dy,c){var u=use(P.splat),r=.0012;if(aspect>1)r*=aspect;if(flow)r*=.5;
 tex(u.uTarget,vel.r.t,0);gl.uniform1f(u.aspectRatio,aspect);gl.uniform2f(u.point,x,y);gl.uniform3f(u.color,dx,dy,0);gl.uniform1f(u.radius,r);blit(vel.w);vel.swap();
 tex(u.uTarget,dye.r.t,0);gl.uniform3f(u.color,c[0],c[1],c[2]);blit(dye.w);dye.swap();}
function step(dt){var u;gl.disable(gl.BLEND);
 u=use(P.curl);gl.uniform2fv(u.texelSize,vel.r.tx);tex(u.uVelocity,vel.r.t,0);blit(crl);
 u=use(P.vort);gl.uniform2fv(u.texelSize,vel.r.tx);tex(u.uVelocity,vel.r.t,0);tex(u.uCurl,crl.t,1);gl.uniform1f(u.curl,flow?8:30);gl.uniform1f(u.dt,dt);blit(vel.w);vel.swap();
 u=use(P.div);gl.uniform2fv(u.texelSize,vel.r.tx);tex(u.uVelocity,vel.r.t,0);blit(dvg);
 u=use(P.clear);gl.uniform2fv(u.texelSize,vel.r.tx);tex(u.uTexture,prs.r.t,0);gl.uniform1f(u.value,.8);blit(prs.w);prs.swap();
 u=use(P.pres);gl.uniform2fv(u.texelSize,vel.r.tx);tex(u.uDivergence,dvg.t,0);for(var i=0;i<20;i++){tex(u.uPressure,prs.r.t,1);blit(prs.w);prs.swap();}
 u=use(P.grad);gl.uniform2fv(u.texelSize,vel.r.tx);tex(u.uPressure,prs.r.t,0);tex(u.uVelocity,vel.r.t,1);blit(vel.w);vel.swap();
 u=use(P.adv);gl.uniform2fv(u.texelSize,vel.r.tx);gl.uniform1f(u.dt,dt);tex(u.uVelocity,vel.r.t,0);tex(u.uSource,vel.r.t,1);gl.uniform1f(u.dissipation,flow?1.2:.2);blit(vel.w);vel.swap();
 tex(u.uVelocity,vel.r.t,0);tex(u.uSource,dye.r.t,1);gl.uniform1f(u.dissipation,flow?1.1:1.8);blit(dye.w);dye.swap();
 u=use(P.disp);gl.uniform2fv(u.texelSize,vel.r.tx);var bg=BGS[bgi];gl.uniform3f(u.bg,bg[1][0],bg[1][1],bg[1][2]);gl.uniform1f(u.bgA,bg[2]);tex(u.uTexture,dye.r.t,0);blit(null);}
function frame(now){if(!on)return;raf=requestAnimationFrame(frame);var dt=Math.min((now-last)/1000,.0166667);last=now;if(!(dt>0))dt=.0166667;tt+=dt;if(now<slowT)dt*=.3;if(frz===1||frz===2||frz===4){if(frz===2)animShatter(now);else if(frz===4)animSmash(now);return;}var q=window.SPD_LVL?window.SPD_LVL():{l:0,c:.4};lvl+=(q.l-lvl)*(q.l>lvl?.5:.08);cen=q.c;if(dropOn&&q.l-pL>.22&&q.l>.35&&now-lastDrop>350){lastDrop=now;drop();}pL=q.l;
 var ids=Object.keys(ptr),i;
 if(fzOn&&ids.length===1){var fp=ptr[ids[0]];if(fp.ht&&now-fp.ht>450){fp.ht=0;if(fzm===3)doSmashFreeze();else doFreeze();return;}}
 for(i=0;i<ids.length;i++){var p=ptr[ids[i]];splat(p.x/W,1-p.y/H,(Math.random()-.5)*30,(Math.random()-.5)*30,col(p.h,.35));}
 if(lvl>.1&&Math.random()<.4+lvl*.6){var n=1+Math.floor(lvl*3);for(i=0;i<n;i++)splat(Math.random(),Math.random(),(Math.random()-.5)*2200*lvl,(Math.random()-.5)*2200*lvl,col(baseH()+(Math.random()-.5)*60,1.5+3*lvl));}
 idle-=dt;if(idle<=0&&lvl<.1&&!ids.length){idle=3.5+Math.random()*3;splat(Math.random(),Math.random(),(Math.random()-.5)*900,(Math.random()-.5)*900,col(baseH()+(Math.random()-.5)*60,1.2));}
 step(dt);}

function ensureSh(){if(sh)return;sh=D.createElement('canvas');sh.id='flsh';sh.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:3;pointer-events:none;display:none';D.body.appendChild(sh);shx=sh.getContext('2d');}
function rnd(a,b){return a+Math.random()*(b-a);}
function doFreeze(){if(frz||!cv)return;ensureSh();var w=cv.width,h=cv.height;dpx=w/Math.max(1,innerWidth);sh.width=w;sh.height=h;
 snap=D.createElement('canvas');snap.width=w;snap.height=h;snap.getContext('2d').drawImage(cv,0,0);
 var cell=64*dpx,nx=Math.max(3,Math.round(w/cell)),ny=Math.max(3,Math.round(h/cell)),cw=w/nx,ch2=h/ny,pts=[],i,j;
 for(j=0;j<=ny;j++)for(i=0;i<=nx;i++)pts[j*(nx+1)+i]=[i*cw+((i>0&&i<nx)?rnd(-.36,.36)*cw:0),j*ch2+((j>0&&j<ny)?rnd(-.36,.36)*ch2:0)];
 tris=[];for(j=0;j<ny;j++)for(i=0;i<nx;i++){var a=pts[j*(nx+1)+i],b=pts[j*(nx+1)+i+1],c=pts[(j+1)*(nx+1)+i],d=pts[(j+1)*(nx+1)+i+1];if(Math.random()<.5){tris.push([a,b,d]);tris.push([a,d,c]);}else{tris.push([a,b,c]);tris.push([b,d,c]);}}
 crys=D.createElement('canvas');crys.width=w;crys.height=h;var x=crys.getContext('2d'),t;
 for(var k=0;k<tris.length;k++){t=tris[k];x.save();x.beginPath();x.moveTo(t[0][0],t[0][1]);x.lineTo(t[1][0],t[1][1]);x.lineTo(t[2][0],t[2][1]);x.closePath();x.clip();
  x.drawImage(snap,rnd(-5,5)*dpx,rnd(-5,5)*dpx);x.fillStyle=Math.random()<.5?'rgba(255,255,255,'+rnd(.03,.22)+')':'rgba(120,190,255,'+rnd(.04,.2)+')';x.fill();x.restore();}
 x.lineJoin='round';for(var k2=0;k2<tris.length;k2++){t=tris[k2];x.beginPath();x.moveTo(t[0][0],t[0][1]);x.lineTo(t[1][0],t[1][1]);x.lineTo(t[2][0],t[2][1]);x.closePath();x.strokeStyle='rgba(120,200,255,.35)';x.lineWidth=3.2*dpx;x.stroke();x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1.2*dpx;x.stroke();}
 x.fillStyle='rgba(205,235,255,.10)';x.fillRect(0,0,w,h);
 for(var s=0;s<46;s++){var sx=rnd(0,w),sy=rnd(0,h),r0=rnd(3,9)*dpx;x.fillStyle='rgba(255,255,255,'+rnd(.5,.95)+')';x.beginPath();x.moveTo(sx,sy-r0);x.lineTo(sx+r0*.22,sy-r0*.22);x.lineTo(sx+r0,sy);x.lineTo(sx+r0*.22,sy+r0*.22);x.lineTo(sx,sy+r0);x.lineTo(sx-r0*.22,sy+r0*.22);x.lineTo(sx-r0,sy);x.lineTo(sx-r0*.22,sy-r0*.22);x.closePath();x.fill();}
 frz=1;cv.style.visibility='hidden';sh.style.display='';shx.clearRect(0,0,w,h);shx.drawImage(crys,0,0);
 try{if(navigator.vibrate)navigator.vibrate(18);}catch(_){}
 try{var S=window.SPD;if(S&&S.note)S.note('Frozen. Tap with another finger to shatter it');}catch(_){}}
function glassSound(){try{var S=window.SPD,ax=S&&S.audio&&S.audio();if(!ax)return;var t=ax.currentTime,g=ax.createGain();g.gain.value=.9;g.connect(ax.destination);if(window.__recDst)g.connect(window.__recDst);
 var n=Math.floor(ax.sampleRate*.9),b=ax.createBuffer(1,n,ax.sampleRate),d=b.getChannelData(0),i;for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
 var s=ax.createBufferSource();s.buffer=b;var hp=ax.createBiquadFilter();hp.type='highpass';hp.frequency.value=2200;var ng=ax.createGain();ng.gain.setValueAtTime(.9,t);ng.gain.exponentialRampToValueAtTime(.001,t+.8);s.connect(hp);hp.connect(ng);ng.connect(g);s.start(t);
 for(i=0;i<16;i++){var o=ax.createOscillator(),og=ax.createGain(),st=t+Math.random()*.3;o.type='sine';o.frequency.value=2400+Math.random()*5200;og.gain.setValueAtTime(.0001,st);og.gain.exponentialRampToValueAtTime(.12,st+.004);og.gain.exponentialRampToValueAtTime(.0001,st+.12+Math.random()*.3);o.connect(og);og.connect(g);o.start(st);o.stop(st+.5);}
 var lo=ax.createOscillator(),lg=ax.createGain();lo.type='sine';lo.frequency.setValueAtTime(140,t);lo.frequency.exponentialRampToValueAtTime(45,t+.25);lg.gain.setValueAtTime(.5,t);lg.gain.exponentialRampToValueAtTime(.001,t+.3);lo.connect(lg);lg.connect(g);lo.start(t);lo.stop(t+.35);}catch(e){}}
function shatter(x,y){if(frz!==1)return;frz=2;shT=performance.now();shLast=shT;shOx=x*dpx;shOy=y*dpx;
 shards=tris.map(function(t){var cx=(t[0][0]+t[1][0]+t[2][0])/3,cy=(t[0][1]+t[1][1]+t[2][1])/3,dx=cx-shOx,dy=cy-shOy,dd=Math.hypot(dx,dy)+1,k=(1300*dpx)/(1+dd/(150*dpx));
  return{t:t,cx:cx,cy:cy,x:0,y:0,r:0,vx:dx/dd*k*rnd(.6,1.4)+rnd(-90,90)*dpx,vy:dy/dd*k*rnd(.6,1.4)-rnd(0,260)*dpx,vr:rnd(-7,7),bb:bbox(t)};});
 glassSound();try{if(navigator.vibrate)navigator.vibrate([30,20,45]);}catch(_){}}
function bbox(t){var x0=Math.min(t[0][0],t[1][0],t[2][0])-3,y0=Math.min(t[0][1],t[1][1],t[2][1])-3,x1=Math.max(t[0][0],t[1][0],t[2][0])+3,y1=Math.max(t[0][1],t[1][1],t[2][1])+3;x0=Math.max(0,x0);y0=Math.max(0,y0);return[x0,y0,Math.min(crys.width,x1)-x0,Math.min(crys.height,y1)-y0];}
function animShatter(now){var el=(now-shT)/1000,dt=Math.min(.05,(now-shLast)/1000);shLast=now;var w=sh.width,h=sh.height,i;shx.clearRect(0,0,w,h);
 if(el<.14){shx.drawImage(crys,0,0);shx.strokeStyle='rgba(255,255,255,.95)';shx.lineWidth=2*dpx;var u=el/.14;for(i=0;i<9;i++){var an=i/9*6.283+.3,len=u*Math.max(w,h)*.5,px=shOx,py=shOy,sg=7;shx.beginPath();shx.moveTo(px,py);for(var q=1;q<=sg;q++){var f=q/sg;shx.lineTo(shOx+Math.cos(an)*len*f+rnd(-9,9)*dpx,shOy+Math.sin(an)*len*f+rnd(-9,9)*dpx);}shx.stroke();}
  shx.fillStyle='rgba(255,255,255,'+(.45*(1-u))+')';shx.fillRect(0,0,w,h);return;}
 var a=el<.7?1:Math.max(0,1-(el-.7)/.9);
 for(i=0;i<shards.length;i++){var s=shards[i];s.vy+=1900*dpx*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=s.vr*dt;
  shx.save();shx.globalAlpha=a;shx.translate(s.cx+s.x,s.cy+s.y);shx.rotate(s.r);shx.translate(-s.cx,-s.cy);shx.beginPath();shx.moveTo(s.t[0][0],s.t[0][1]);shx.lineTo(s.t[1][0],s.t[1][1]);shx.lineTo(s.t[2][0],s.t[2][1]);shx.closePath();shx.clip();
  var b=s.bb;if(b[2]>0&&b[3]>0)shx.drawImage(crys,b[0],b[1],b[2],b[3],b[0],b[1],b[2],b[3]);shx.restore();}
 if(el>1.7)endShatter();}
function clearSim(){try{var u=use(P.clear),a=[vel,dye,prs],i;gl.uniform2fv(u.texelSize,vel.r.tx);for(i=0;i<a.length;i++){tex(u.uTexture,a[i].r.t,0);gl.uniform1f(u.value,0);blit(a[i].w);a[i].swap();}}catch(e){}}

function mkTris(w,h,cell){var nx=Math.max(3,Math.round(w/cell)),ny=Math.max(3,Math.round(h/cell)),cw=w/nx,ch=h/ny,pts=[],out=[],i,j;
 for(j=0;j<=ny;j++)for(i=0;i<=nx;i++)pts[j*(nx+1)+i]=[i*cw+((i>0&&i<nx)?rnd(-.36,.36)*cw:0),j*ch+((j>0&&j<ny)?rnd(-.36,.36)*ch:0)];
 for(j=0;j<ny;j++)for(i=0;i<nx;i++){var a=pts[j*(nx+1)+i],b=pts[j*(nx+1)+i+1],c=pts[(j+1)*(nx+1)+i],d=pts[(j+1)*(nx+1)+i+1];if(Math.random()<.5){out.push([a,b,d]);out.push([a,d,c]);}else{out.push([a,b,c]);out.push([b,d,c]);}}
 return out;}
function bb2(t,w,h){var x0=Math.max(0,Math.floor(Math.min(t[0][0],t[1][0],t[2][0])-4)),y0=Math.max(0,Math.floor(Math.min(t[0][1],t[1][1],t[2][1])-4)),x1=Math.min(w,Math.ceil(Math.max(t[0][0],t[1][0],t[2][0])+4)),y1=Math.min(h,Math.ceil(Math.max(t[0][1],t[1][1],t[2][1])+4));return[x0,y0,Math.max(1,x1-x0),Math.max(1,y1-y0)];}
function triP(c,t){c.beginPath();c.moveTo(t[0][0],t[0][1]);c.lineTo(t[1][0],t[1][1]);c.lineTo(t[2][0],t[2][1]);c.closePath();}
function smOK(){var S=window.SPD;return !!(S&&S.paintCv&&S.paintCv()&&S.stampPaint&&S.wipePaint);}
function doSmashFreeze(){if(frz||!cv)return;if(!smOK()){doFreeze();return;}ensureSh();var S=window.SPD,pc=S.paintCv(),pw=pc.width,ph=pc.height,vr=D.getElementById('view').getBoundingClientRect();
 dpx=cv.width/Math.max(1,innerWidth);sh.width=cv.width;sh.height=cv.height;
 var k=pw/Math.max(1,vr.width),sn=D.createElement('canvas');sn.width=pw;sn.height=ph;var sx=sn.getContext('2d');sx.drawImage(pc,0,0);sx.drawImage(cv,-vr.left*k,-vr.top*k,innerWidth*k,innerHeight*k);
 var tr=mkTris(pw,ph,pw/6),cr=D.createElement('canvas');cr.width=pw;cr.height=ph;var x=cr.getContext('2d'),t,i;
 for(i=0;i<tr.length;i++){t=tr[i];x.save();triP(x,t);x.clip();x.drawImage(sn,rnd(-4,4)*k,rnd(-4,4)*k);x.fillStyle=Math.random()<.5?'rgba(255,255,255,'+rnd(.03,.2)+')':'rgba(120,190,255,'+rnd(.04,.18)+')';x.fill();x.restore();}
 x.lineJoin='round';for(i=0;i<tr.length;i++){triP(x,tr[i]);x.strokeStyle='rgba(120,200,255,.35)';x.lineWidth=3*k;x.stroke();x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=1.2*k;x.stroke();}
 x.fillStyle='rgba(205,235,255,.10)';x.fillRect(0,0,pw,ph);
 SM={pw:pw,ph:ph,k:k,snap:sn,crys:cr,tris:tr,a:vr.width*dpx/pw,ox:vr.left*dpx,oy:vr.top*dpx,vr:vr,shards:[],t0:0,last:0,tick:0,ix:0,iy:0};
 frz=1;cv.style.visibility='hidden';sh.style.display='';var c2=shx;c2.setTransform(1,0,0,1,0,0);c2.clearRect(0,0,sh.width,sh.height);c2.setTransform(SM.a,0,0,SM.a,SM.ox,SM.oy);c2.drawImage(cr,0,0);c2.setTransform(1,0,0,1,0,0);
 try{if(navigator.vibrate)navigator.vibrate(18);}catch(_){}
 try{if(S.note)S.note('Frozen. Tap with another finger to smash your paint into 3D chips');}catch(_){}}
function chipPlace(c,s,px,py,rot,sx,sy){c.translate(px,py);c.rotate(rot);c.scale(sx,sy);c.translate(-s.cx,-s.cy);}
function smash(x,y){if(frz!==1||!SM)return;var S=window.SPD,k=SM.k,vr=SM.vr;frz=4;SM.t0=performance.now();SM.last=SM.t0;SM.ix=(x-vr.left)*k;SM.iy=(y-vr.top)*k;
 SM.shards=SM.tris.map(function(t){var cx=(t[0][0]+t[1][0]+t[2][0])/3,cy=(t[0][1]+t[1][1]+t[2][1])/3,dx=cx-SM.ix,dy=cy-SM.iy,dd=Math.hypot(dx,dy)+1,o=rnd(140,420)*k;
  return{t:t,cx:cx,cy:cy,dx:dx/dd,dy:dy/dd,out:o,zp:rnd(1.5,3),tum:rnd(-8,8),spin:rnd(-5,5),Lx:Math.max(20*k,Math.min(SM.pw-20*k,cx+rnd(-1,1)*170*k)),Ly:Math.max(20*k,Math.min(SM.ph-20*k,cy+rnd(-1,1)*170*k)),rE:rnd(-.8,.8),tl:rnd(1.25,2.4),done:false,bb:bb2(t,SM.pw,SM.ph)};});
 try{S.wipePaint();}catch(e){}
 glassSound();try{if(navigator.vibrate)navigator.vibrate([30,20,45]);}catch(_){}}
function landTick(){try{var S=window.SPD,ax=S&&S.audio&&S.audio();if(!ax)return;var n=performance.now();if(n-SM.tick<45)return;SM.tick=n;var t=ax.currentTime,o=ax.createOscillator(),g=ax.createGain();o.type='triangle';o.frequency.value=900+Math.random()*2600;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.07,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.07);o.connect(g);g.connect(ax.destination);if(window.__recDst)g.connect(window.__recDst);o.start(t);o.stop(t+.09);}catch(e){}}
function stampChip(s){var S=window.SPD,k=SM.k,sn=SM.snap,b=s.bb;landTick();S.stampPaint(function(c){
 c.save();chipPlace(c,s,s.Lx,s.Ly,s.rE,1,1);triP(c,s.t);c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=13*k;c.shadowOffsetX=4*k;c.shadowOffsetY=7*k;c.fillStyle='#000';c.fill();c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetX=0;c.shadowOffsetY=0;
 c.save();c.clip();c.drawImage(sn,b[0],b[1],b[2],b[3],b[0],b[1],b[2],b[3]);var g=c.createLinearGradient(b[0],b[1],b[0]+b[2],b[1]+b[3]);g.addColorStop(0,'rgba(255,255,255,.3)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.22)');c.fillStyle=g;c.fillRect(b[0],b[1],b[2],b[3]);c.restore();
 triP(c,s.t);c.lineJoin='round';c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1.6*k;c.stroke();c.translate(1.4*k,1.4*k);triP(c,s.t);c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1.2*k;c.stroke();c.restore();});s.done=true;}
function animSmash(now){if(!SM)return;var el=(now-SM.t0)/1000,w=sh.width,h=sh.height,k=SM.k,i,s,pw=SM.pw,ph=SM.ph;shx.setTransform(1,0,0,1,0,0);shx.clearRect(0,0,w,h);shx.setTransform(SM.a,0,0,SM.a,SM.ox,SM.oy);
 if(el<.14){shx.drawImage(SM.crys,0,0);shx.strokeStyle='rgba(255,255,255,.95)';shx.lineWidth=2*k;var u=el/.14,an,len,q,f;for(i=0;i<9;i++){an=i/9*6.283+.3;len=u*Math.max(pw,ph)*.5;shx.beginPath();shx.moveTo(SM.ix,SM.iy);for(q=1;q<=7;q++){f=q/7;shx.lineTo(SM.ix+Math.cos(an)*len*f+rnd(-9,9)*k,SM.iy+Math.sin(an)*len*f+rnd(-9,9)*k);}shx.stroke();}shx.fillStyle='rgba(255,255,255,'+(.4*(1-u))+')';shx.fillRect(0,0,pw,ph);return;}
 var tA=.7,left=0;
 for(i=0;i<SM.shards.length;i++){s=SM.shards[i];if(s.done)continue;
  var u2=Math.max(0,Math.min(1,(el-.14)/.56)),eu=1-(1-u2)*(1-u2),ex=s.cx+s.dx*s.out,ey=s.cy+s.dy*s.out,px,py,sc,rot,tf;
  if(el<tA){px=s.cx+s.dx*s.out*eu;py=s.cy+s.dy*s.out*eu;sc=1+(s.zp-1)*eu;rot=s.spin*eu;tf=Math.cos(s.tum*eu);}
  else{var ub=Math.min(1,(el-tA)/Math.max(.2,s.tl-tA)),eb=ub*ub*(3-2*ub);px=ex+(s.Lx-ex)*eb;py=ey+(s.Ly-ey)*eb;sc=s.zp+(1-s.zp)*eb;rot=s.spin+(s.rE-s.spin)*eb;tf=Math.cos(s.tum)+(1-Math.cos(s.tum))*eb;if(ub>=1){stampChip(s);continue;}}
  left++;var so=((sc-1)*24+3)*k;if(Math.abs(tf)<.12)tf=.12*(tf<0?-1:1);
  shx.save();chipPlace(shx,s,px+so,py+so*1.4,rot,sc*tf,sc);triP(shx,s.t);shx.fillStyle='rgba(0,0,0,'+Math.min(.3,.08+(sc-1)*.12)+')';shx.fill();shx.restore();
  shx.save();chipPlace(shx,s,px,py,rot,sc*tf,sc);triP(shx,s.t);shx.clip();shx.drawImage(SM.snap,s.bb[0],s.bb[1],s.bb[2],s.bb[3],s.bb[0],s.bb[1],s.bb[2],s.bb[3]);shx.fillStyle='rgba(255,255,255,'+(.06+.1*Math.abs(Math.sin(s.tum*eu)))+')';shx.fillRect(s.bb[0],s.bb[1],s.bb[2],s.bb[3]);shx.restore();
  shx.save();chipPlace(shx,s,px,py,rot,sc*tf,sc);triP(shx,s.t);shx.strokeStyle='rgba(255,255,255,.55)';shx.lineWidth=1.4*k/sc;shx.stroke();shx.restore();}
 if(!left||el>4.5)endSmash();}
function stampRest(){if(!SM)return;SM.shards.forEach(function(s){if(!s.done)stampChip(s);});}
function endSmash(){stampRest();frz=0;if(shx){shx.setTransform(1,0,0,1,0,0);shx.clearRect(0,0,sh.width,sh.height);}if(sh)sh.style.display='none';if(cv)cv.style.visibility='';SM=null;slowT=0;clearSim();ptr={};last=performance.now();}
function drop(){var cx=.3+Math.random()*.4,cy=.3+Math.random()*.4,n=12,k,a,h=baseH()+Math.random()*120;for(k=0;k<n;k++){a=k/n*6.283;splat(cx+Math.cos(a)*.015,cy+Math.sin(a)*.015,Math.cos(a)*3200,Math.sin(a)*3200,col(h+k*20,3));}}
function melt(){if(frz!==1)return;frz=3;slowT=0;cv.style.visibility='';sh.style.transition='opacity 1.4s';sh.style.opacity='0';var i;for(i=0;i<40;i++)splat(Math.random(),.45+Math.random()*.55,rnd(-80,80),-rnd(1500,3500),col(baseH()+rnd(-40,40),.9));try{if(navigator.vibrate)navigator.vibrate(25);}catch(_){}last=performance.now();setTimeout(function(){if(frz===3)endMelt();},1500);}
function endMelt(){frz=0;if(sh){sh.style.display='none';sh.style.transition='';sh.style.opacity='';}if(shx)shx.clearRect(0,0,sh.width,sh.height);shards=[];snap=null;crys=null;ptr={};last=performance.now();}
function seedAfter(){var i,a,ox=shOx/Math.max(1,dpx)/W,oy=1-shOy/Math.max(1,dpx)/H;for(i=0;i<14;i++){a=i/14*6.283;splat(ox+Math.cos(a)*.03,oy+Math.sin(a)*.03,Math.cos(a)*1800,Math.sin(a)*1800,col(baseH()+i*25,2.2));}}
function endShatter(){if(frz===4){endSmash();return;}var was=frz===2;frz=0;if(shx)shx.clearRect(0,0,sh.width,sh.height);if(sh)sh.style.display='none';if(cv)cv.style.visibility='';shards=[];snap=null;crys=null;clearSim();ptr={};last=performance.now();if(was){seedAfter();slowT=performance.now()+3000;}}
function nextFZ(){fzm=(fzm+1)%4;fzOn=fzm>0;try{localStorage.setItem('spd-fz',fzm);}catch(e){}setUI();try{var S=window.SPD;if(fzOn&&S&&S.note)S.note('Freeze '+['','Shatter','Melt','Smash'][fzm]+': hold one finger still on the fluid to freeze it, then tap with another finger to '+['','shatter it','melt it','smash your paint into 3D chips'][fzm]);}catch(e){}}
function freezeNow(){if(frz)return;if(!fzm){fzm=1;fzOn=true;svk('spd-fz',1);}var go=function(){if(frz||!cv)return;if(fzm===3)doSmashFreeze();else doFreeze();setUI();};if(!on){start();setTimeout(go,350);}else go();setUI();}
function svk(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function nextFP(){look=(look+1)%4;svk('spd-fp',look);setUI();}
function nextFI(){flow=flow?0:1;svk('spd-fi',flow);setUI();}
function nextFR(){mir=(mir+1)%4;svk('spd-fr',mir);setUI();}
function nextFD(){dropOn=!dropOn;svk('spd-fd',dropOn?'1':'0');setUI();}
function setUI(){var b=$('t-fl'),w=$('w-fl'),k=$('t-fb'),j=$('w-fb'),m=$('t-fm'),q=$('w-fm'),mt='Fluid: '+(fm?'Paint':'Smoke');if(m)m.textContent=mt;if(q)q.textContent=mt;var zt='Freeze: '+['Off','Shatter','Melt','Smash'][fzm],zb=$('t-fz'),zp=$('w-fz');var TX={fn:'❄ Freeze Now',fp:'Fluid Look: '+['Palette','Fire','Neon','Ice'][look],fi:'Fluid Flow: '+(flow?'Ink':'Normal'),fr:'Mirror: '+['Off','2','4','Kaleido'][mir],fd:'Music Drops: '+(dropOn?'On':'Off')},tk;for(tk in TX){var e1=$('t-'+tk),e2=$('w-'+tk);if(e1)e1.textContent=TX[tk];if(e2)e2.textContent=TX[tk];}if(zb){zb.textContent=zt;zb.classList.toggle('sel',fzOn);}if(zp){zp.textContent=zt;zp.classList.toggle('sel',fzOn);}if(k)k.textContent='Fluid BG: '+BGS[bgi][0];if(j)j.textContent='Fluid BG: '+BGS[bgi][0];if(b){b.classList.toggle('sel',on);b.textContent=on?'Fluid On':'Fluid Off';}if(w){w.classList.toggle('sel',on);w.textContent=on?'Fluid: On':'Fluid: Off';}}
function start(){if(on||fail)return;try{if(!cv)init();}catch(e){fail=1;console.warn('fluid',e);try{if(cv)cv.remove();}catch(_){}var n=$('t-fl');if(n)n.textContent='Fluid n/a';return;}
 on=true;cv.style.display='';ptr={};last=performance.now();raf=requestAnimationFrame(frame);setUI();}
function stop(){if(frz)endShatter();on=false;cancelAnimationFrame(raf);if(cv)cv.style.display='none';ptr={};setUI();}
function toggle(){on?stop():start();}
function nextFM(){fm=fm?0:1;try{localStorage.setItem('spd-fm',fm);}catch(e){}setUI();}
function nextBG(){bgi=(bgi+1)%4;try{localStorage.setItem('spd-fb',bgi);}catch(e){}setUI();}
window.SPD_FL={start:start,stop:stop,toggle:toggle,bg:nextBG,mode:nextFM,freeze:function(v){fzm=v?(fzm||1):0;fzOn=!!v;setUI();},on:function(){return on;}};
var tries=0,iv=setInterval(function(){tries++;var ls=$('t-ls'),tg=D.querySelector('#p-tool .tg'),ws=$('wscroll'),wl=$('w-ls');
 if((!tg||!ls||!ws||!wl)&&tries<60)return;clearInterval(iv);
 if(tg&&!$('t-fl')){var b=D.createElement('button');b.className='tl';b.id='t-fl';b.textContent='Fluid Off';b.onclick=toggle;b.style.minHeight='40px';var an0=$('t-lm')||ls;if(an0)tg.insertBefore(b,an0.nextSibling);else tg.insertBefore(b,tg.firstChild);var kb=D.createElement('button');kb.className='tl';kb.id='t-fb';kb.onclick=nextBG;kb.style.minHeight='40px';tg.insertBefore(kb,b.nextSibling);var km=D.createElement('button');km.className='tl';km.id='t-fm';km.onclick=nextFM;km.style.minHeight='40px';tg.insertBefore(km,kb.nextSibling);var kz=D.createElement('button');kz.className='tl';kz.id='t-fz';kz.onclick=nextFZ;kz.style.minHeight='40px';tg.insertBefore(kz,km.nextSibling);var an2=kz;[['fn',freezeNow],['fp',nextFP],['fi',nextFI],['fr',nextFR],['fd',nextFD]].forEach(function(q){var e=D.createElement('button');e.className='tl';e.id='t-'+q[0];e.onclick=q[1];e.style.minHeight='40px';tg.insertBefore(e,an2.nextSibling);an2=e;});}
 if(ws&&!$('w-fl')){var p=D.createElement('button');p.className='pill';p.id='w-fl';p.textContent='Fluid: Off';p.onclick=toggle;var an1=$('w-lm')||wl;ws.insertBefore(p,an1?an1.nextSibling:ws.firstChild);var p3=D.createElement('button');p3.className='pill';p3.id='w-fb';p3.onclick=nextBG;ws.insertBefore(p3,p.nextSibling);var p4=D.createElement('button');p4.className='pill';p4.id='w-fm';p4.onclick=nextFM;ws.insertBefore(p4,p3.nextSibling);var p5=D.createElement('button');p5.className='pill';p5.id='w-fz';p5.onclick=nextFZ;ws.insertBefore(p5,p4.nextSibling);var an3=p5;[['fn',freezeNow],['fp',nextFP],['fi',nextFI],['fr',nextFR],['fd',nextFD]].forEach(function(q){var e=D.createElement('button');e.className='pill';e.id='w-'+q[0];e.onclick=q[1];ws.insertBefore(e,an3.nextSibling);an3=e;});}
 setUI();
},300);
setTimeout(function(){try{var card=$('card'),v=card&&card.querySelector('div[style*="opacity"]');if(v)v.textContent='v1.47 · Sour Paint Studios';
var ul=D.querySelector('#pA ul');if(ul){var li=D.createElement('li');li.textContent='v1.47 — Fluid Flow: Ink is smaller and fades sooner, so it no longer covers the whole canvas. v1.46 — Hover now means just throw paint: with Hover on, dragging a charged orb no longer paints trails or touches the paint under it. Blend still works when you start it yourself. v1.45 — New Freeze Now button: tap it, the screen freezes right away, then tap anywhere to break it. No more hold-and-tap guessing. The hold gesture is also easier (about half a second, a little finger wobble is fine) and the second tap no longer triggers Blend. v1.44 — New Freeze: Smash. Hold one finger still to freeze your whole painting into glass, tap with another finger and it breaks into chips that fly at you, then land back on a blank canvas stuck on like glass tiles with shadows. Paint over them. Undo brings your painting back. v1.43 — More Fluid: Music Drops (bass hits fire bursts of color), Mirror (2, 4 or Kaleido), Fluid Flow: Ink (slow heavy swirls), Fluid Look (Palette, Fire, Neon, Ice), Freeze: Melt (frozen glass runs down like paint), and after a shatter the fluid re-forms in slow motion. v1.42 — New Fluid Freeze: turn on Freeze, hold one finger still on the fluid and it freezes into glass, then tap with another finger to crack and shatter it. Performance has a new Fluid paint style. Recordings now include the Fluid and Lights effects. v1.41 — Recording is clearer: the button now reads Record Video, the red Stop button shows the time and whether jukebox music is on, and the old Rec: setting is now Video look (Full or Paint only). v1.40 — Fluid now follows the color you select on the palette, slider or wheel. v1.39 — Fluid is lighter and thinner so your paint shows through. New Fluid: Smoke / Paint switch: Smoke only floats over the paint, Paint also leaves real paint where you drag. The Tools menu is now a slim scrolling strip down the left edge so you can switch tools while you paint. Earlier in v1.38: Fluid mode with Fluid BG (Black, White, Gray, Clear), and Lights that fly toward you (switch to Bounce with Lights: Fly).';ul.insertBefore(li,ul.firstChild);}
var ol=D.querySelector('#pH ol');if(ol){var l2=D.createElement('li');l2.innerHTML='<b>Fluid:</b> Tap Fluid in the Tools menu (or Fluid in the Cinema strip). Drag a finger to stir glowing color. Hold to keep pouring color. Fluid: Smoke only floats over your paint. Fluid: Paint also leaves real paint where you drag. Fluid follows the color you pick. Fluid BG picks a Black, White or Gray tint, or Clear. Your paint always shows through underneath, so you can still hold to charge and pop. The Tools menu is a scrolling strip on the left: swipe it up and down. Turn the Voice or Guitar mic on and it swirls with your sound. Freeze: tap Freeze to turn it On, then hold one finger still on the fluid for a moment: it freezes into cracked glass. Tap anywhere with another finger and it shatters. In Performance, pick Fluid as the paint style for a page of only fluid, with music if you like. Easiest way to freeze: tap Freeze Now in the Tools strip (or the Cinema strip), then tap anywhere to break it. Or turn Freeze on and hold one finger still for half a second with Fluid On. More Fluid options in the Tools strip: Freeze cycles Off, Shatter, Melt or Smash. Smash breaks your painting into 3D glass chips that land back on the canvas; paint on top, or Undo to get your painting back. Fluid Look cycles Palette, Fire, Neon, Ice. Fluid Flow: Ink makes slow heavy swirls that fade sooner so your paint still shows. Mirror cycles Off, 2, 4, Kaleido. Music Drops fires bursts on bass hits when music or your mic is on. Hover On (Tools menu) means your finger only throws paint: dragging a charged orb leaves no trail and touches nothing under it. Blend still works when you start it yourself. Tap Fluid again to turn it off.';ol.insertBefore(l2,ol.firstChild);var l3=D.createElement('li');l3.innerHTML='<b>Record a video:</b> Tap Record Video (Tools menu). Start the jukebox first if you want its music in the video. The red Stop button shows the time and whether music is on. Video look: Full records everything you see, Paint only hides the hold and charge visuals. Tap Stop when done, then Save.';ol.insertBefore(l3,ol.firstChild);}}catch(e){}},2200);
}catch(e){console.warn('fluid',e);}})();
