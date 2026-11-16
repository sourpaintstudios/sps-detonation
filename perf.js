(function(){
try{
try{var AC=window.AudioContext||window.webkitAudioContext,omes=AC.prototype.createMediaElementSource;AC.prototype.createMediaElementSource=function(el){var n=omes.call(this,el),g=this.createGain(),cp=this.createDynamicsCompressor();g.gain.value=2.4;cp.threshold.value=-10;cp.knee.value=6;cp.ratio.value=12;cp.attack.value=.003;cp.release.value=.15;n.connect(g);g.connect(cp);var oc=cp.connect.bind(cp),od=cp.disconnect.bind(cp);n.connect=function(d){return oc(d);};n.disconnect=function(d){try{d?od(d):od();}catch(e){}};return n;};}catch(e){}
var D=document,$=function(i){return D.getElementById(i)},S=window.SPD||{};
(function(){
var st=$('start');if(!st)return;
var BGC=[['Paper','#f1e9da'],['Gray','#7a7a7e'],['Black','#08080a'],['White','#ffffff']],pick=null;
var cs=D.createElement('style');cs.textContent='#bgrow{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap}#bgrow label{width:100%;text-align:center;font:700 13px system-ui,sans-serif;color:#fff;text-shadow:0 1px 4px #000,0 0 8px #000}#bgrow button,.pdot{width:48px;height:48px;border-radius:50%;border:3px solid rgba(255,255,255,.7);padding:0;cursor:pointer;font:700 9px system-ui,sans-serif;color:#222;display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px}#bgrow button.sel,.pdot.sel{border-color:#7cfc00;box-shadow:0 0 0 3px #7cfc00}'
+'#perf{position:fixed;inset:0;z-index:30;display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px;background:rgba(10,6,20,.93);color:#fff;font:700 15px system-ui,sans-serif;overflow:auto;text-align:center}#perf.show{display:flex}#perf .opts{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:460px}'
+'#perf button.o{width:88px;height:88px;border-radius:50%;border:0;background:#2e1a47;color:#fff;font:700 13px system-ui,sans-serif;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35);cursor:pointer;padding:4px}#perf button.o{position:relative}#perf button.o.sel{outline:4px solid #7cfc00;outline-offset:3px}#perf button.o.sel::after{content:"\\2713";position:absolute;top:-6px;right:-6px;width:28px;height:28px;border-radius:50%;background:#7cfc00;color:#111;font:900 17px/28px system-ui,sans-serif}#perf button.o.sel:not([data-sw]){background:#7cfc00;color:#111}#perf button.nav{min-width:88px;height:48px;border-radius:999px;border:0;font:700 14px system-ui,sans-serif;background:#ffb347;color:#111;cursor:pointer;padding:0 18px}#perf button.nav.g{background:rgba(255,255,255,.85)}'
+'#perfbar{position:fixed;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:31;display:none;justify-content:space-between;padding:0 14px;pointer-events:none}body.perf #perfbar{display:flex}#perfbar button{pointer-events:auto;width:64px;height:64px;border-radius:50%;border:0;font:800 12px system-ui,sans-serif;background:rgba(30,20,50,.8);color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.5);cursor:pointer;opacity:.75}#perfbar #pfin{background:rgba(212,17,17,.85)}'
+'#perfblk{position:fixed;inset:0;z-index:29;display:none}body.perfp #perfblk{display:block}'
+'body.perf>*:not(canvas):not(#perf):not(#perfbar):not(#perfblk):not(#recv):not(#shot){display:none!important}body.perf #recv,body.perf #shot{z-index:40}';
D.head.appendChild(cs);
/* canvas color on start */
var row=D.createElement('div');row.id='bgrow';row.innerHTML='<label>Canvas color (new canvas)</label>';
BGC.forEach(function(c,i){var b=D.createElement('button');b.type='button';b.style.background=c[1];b.style.color=(i==2?'#ddd':'#222');b.textContent=c[0];b.onclick=function(){pick=c;[].forEach.call(row.querySelectorAll('button'),function(x){x.classList.remove('sel');});b.classList.add('sel');};row.appendChild(b);});
var anchor=$('go-f');st.insertBefore(row,anchor);
var applyBG=function(){if(pick&&S.setBG)setTimeout(function(){try{S.setBG(pick[1]);}catch(e){}},30);};
$('go-f').addEventListener('click',function(){if($('go-f').textContent==='Play')applyBG();});
$('newb').addEventListener('click',applyBG);
/* Performance */
var pb=D.createElement('button');pb.className='go';pb.id='perfgo';pb.textContent='Performance';pb.style.background='#7cfc00';pb.style.color='#111';st.insertBefore(pb,anchor);
var P=D.createElement('div');P.id='perf';D.body.appendChild(P);
var bar=D.createElement('div');bar.id='perfbar';bar.innerHTML='<button id="pfp">Pause</button><button id="pfin">Finish</button>';D.body.appendChild(bar);
var blk=D.createElement('div');blk.id='perfblk';D.body.appendChild(blk);
var LK=['Throw','Trace','Comets','Lanes','Blend','Strings','Rain','Burst','Light Show','Fluid'];
var ch={bg:BGC[0],mood:'Random',look:0,src:'music',rec:'full'},step=0,paused=false,run=false;
var MN=['Dread','Melancholy','Rage','Joy','Serenity','Nostalgia','Euphoria','Chaos','Mono'];
var steps=[
 {t:'Canvas color',o:BGC.map(function(c){return[c[0],c]}),k:'bg',sw:1},
 {t:'Palette',o:[['Auto (follows playing)','Auto']].concat(MN.map(function(m){return[m,m]})),k:'mood'},
 {t:'Paint style',o:LK.map(function(l,i){return[l,i]}),k:'look'},
 {t:'Sound',o:[['Music + touch sounds','music'],['Touch sounds only','touch'],['Guitar / mic (no touch sounds)','guitar']],k:'src'},
 {t:'Record it?',o:[['Full (with sound)','full'],['Paint only','paint'],['No','none']],k:'rec'}];
function render(){var s=steps[step];P.innerHTML='<div>Performance · step '+(step+1)+' of '+steps.length+'</div><div style="font-size:20px">'+s.t+'</div><div class="opts"></div><div class="opts"><button class="nav g" id="pfb">'+(step?'Back':'Cancel')+'</button><button class="nav" id="pfn">'+(step==steps.length-1?'Begin':'Next')+'</button></div>';
 var oc=P.querySelector('.opts');s.o.forEach(function(o){var b=D.createElement('button');b.className='o';b.textContent=o[0];if(s.sw){b.setAttribute('data-sw','1');b.style.background=o[1][1];b.style.color=o[0]=='Black'?'#ddd':'#222';}if(ch[s.k]===o[1])b.classList.add('sel');b.onclick=function(){ch[s.k]=o[1];[].forEach.call(oc.children,function(x){x.classList.remove('sel');});b.classList.add('sel');};oc.appendChild(b);});
 $('pfb').onclick=function(){if(step){step--;render();}else P.classList.remove('show');};
 $('pfn').onclick=function(){if(step<steps.length-1){step++;render();}else begin();};}
pb.onclick=function(){step=0;if(pick)ch.bg=pick;render();P.classList.add('show');};
var click=function(sel,txt){var n=[].filter.call(D.querySelectorAll(sel),function(b){return !txt||b.textContent.trim()===txt;})[0];if(n)n.click();return n;};
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
async function begin(){
 P.classList.remove('show');st.style.display='none';
 try{S.setBG(ch.bg[1]);}catch(e){}
 await sleep(150);
 try{window.__recClean=(ch.rec==='paint');}catch(e){}
 D.body.classList.add('perf');run=true;paused=false;D.body.classList.remove('perfp');$('pfp').textContent='Pause';
 try{if(window.SPD_G)window.SPD_G.look=ch.look;}catch(e){}
 try{if(ch.look===8&&window.SPD_LS&&!window.SPD_LS.on())window.SPD_LS.start();}catch(e){}
  try{if(ch.look===9&&window.SPD_FL){if(!window.SPD_FL.on())window.SPD_FL.start();window.SPD_FL.freeze(true);}}catch(e){}
 if(ch.src==='guitar'){
  if(ch.mood==='Auto'){var r=$('w-rand');if(r&&!r.classList.contains('sel'))r.click();await sleep(1200);}
  else{if(ch.mood!=='Random')click('#moods .mb',ch.mood);if(!/On/.test($('t-gtr').textContent))$('t-gtr').click();await sleep(1200);}
 }else{
  if(ch.mood!=='Auto'&&ch.mood!=='Random')click('#moods .mb',ch.mood);
  if(ch.src==='music'){var jp=$('jbpl');if(jp)jp.click();}
 }
 try{if(ch.rec==='none'){if(S.rec())S.recStop();}else if(!S.rec())S.recStart();}catch(e){}
}
$('pfp').onclick=function(){paused=!paused;D.body.classList.toggle('perfp',paused);$('pfp').textContent=paused?'Resume':'Pause';
 if(ch.src==='guitar'){var gOn=/On/.test($('t-gtr').textContent);if(paused&&gOn)$('t-gtr').click();else if(!paused&&!gOn)$('t-gtr').click();}
 else if(ch.src==='music'){var jp=$('jbpl');if(jp)jp.click();}};
$('pfin').onclick=async function(){
 var rec=false;try{rec=S.rec();}catch(e){}
 var r=$('w-rand');if(r&&r.classList.contains('sel'))r.click();
 try{if(S.rec())S.recStop();}catch(e){}
 if(ch.src==='guitar'){if(/On/.test($('t-gtr').textContent))$('t-gtr').click();}
 else{var jq=$('jbpl');if(jq&&jq.textContent.trim()!=='▶')jq.click();}
 try{if(window.SPD_LS&&window.SPD_LS.on())window.SPD_LS.stop();}catch(e){}
 try{if(ch.look===9&&window.SPD_FL){window.SPD_FL.freeze(false);if(window.SPD_FL.on())window.SPD_FL.stop();}}catch(e){}
 D.body.classList.remove('perf','perfp');run=false;
 if(!rec)$('sv').click();};
})();

/* tools menu: grouped rows, Main Menu on top, Sour Paint glass edge */
try{(function(){
var st2=D.createElement('style');st2.textContent='.pnl{border-radius:18px;box-shadow:0 0 0 1.5px rgba(124,252,0,.55),0 0 14px rgba(124,252,0,.22),inset 0 0 16px rgba(255,79,216,.2)}#p-tool{padding:6px 6px 8px;background:rgba(18,10,34,.38);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}#p-tool .grip{color:#7cfc00;text-shadow:0 0 6px rgba(124,252,0,.6)}'
+'#p-tool .tg .gl{grid-column:1/-1;font:800 9px system-ui,sans-serif;letter-spacing:.14em;color:#7cfc00;text-transform:uppercase;text-align:left;padding:3px 4px 0;line-height:10px;border-bottom:1px solid rgba(255,79,216,.45);margin-bottom:0}@media (orientation:portrait){#wet{height:max(64px,calc(100vh - 660px))!important}}#p-tool .tg{gap:3px}#p-tool .tg .tl{min-height:38px}#p-tool .tg .gl:first-child{padding-top:0}'
+'#t-menu.mm{width:100%;min-height:40px;background:#7cfc00;color:#111;font:900 13px system-ui,sans-serif;letter-spacing:.08em;box-shadow:0 0 12px rgba(124,252,0,.6),inset 0 0 0 2px #ff4fd8;white-space:nowrap;padding:8px 6px;border-radius:999px;border:0;cursor:pointer}';
D.head.appendChild(st2);
var tries=0,iv=setInterval(function(){
 tries++;var tg=D.querySelector('#p-tool .tg');
 var need=['t-menu','t-voice','t-bg','t-recmode','t-hover','t-gtr'];
 if(!tg||(need.some(function(i){return !$(i);})&&tries<40))return;
 clearInterval(iv);
 try{
  var G=[['Colors',['[data-p=slider]','[data-p=wheel]','[data-p=lock]','#t-mono']],
   ['Paint & motion',['#t-brush','#t-grav','#t-wild','#t-blend','#t-hover','#t-tilt','#t-vib','#t-shk']],
   ['Guitar & voice',['#t-gtr','#t-look','#t-sens','#t-voice']],
   ['Canvas',['#t-size','#t-bg','#t-undo','#t-tv']],
   ['Record & view',['#t-rec','#t-recmode','#t-view','#t-hide']]];
  var all=[].slice.call(tg.querySelectorAll('.tl')),used=[];
  var frag=D.createDocumentFragment();
  G.forEach(function(g){var l=D.createElement('div');l.className='gl';l.textContent=g[0];frag.appendChild(l);g[1].forEach(function(q){var e=tg.querySelector(q);if(e){frag.appendChild(e);used.push(e);}});});
  all.forEach(function(e){if(used.indexOf(e)<0&&e.id!=='t-menu'){frag.appendChild(e);}});
  var mm=$('t-menu');if(mm){mm.className='mm';mm.textContent='☰ MAIN MENU';mm.style.gridColumn='1/-1';var l0=D.createElement('div');l0.className='gl';l0.style.display='none';tg.insertBefore(mm,tg.firstChild);}
  tg.appendChild(frag);
  if(mm){var pn=$('p-tool'),gp=pn.querySelector('.grip');mm.style.marginBottom='4px';tg.insertBefore(mm,tg.firstChild);}
 }catch(e){console.warn('menu',e);}
},250);
})();}catch(e){}
/* keep Tools panel sized to the real screen after cinema/rotation */
try{(function(){
function fit(){try{var el=$('p-tool');if(!el)return;var strip=D.body.classList.contains('strip')?58:0;var h=Math.max(140,(window.innerHeight||600)-120-strip);el.style.maxHeight=h+'px';
 if(el.style.top){var r=el.getBoundingClientRect();var lim=(window.innerHeight||600)-8-strip;if(r.bottom>lim){el.style.top=Math.max(4,r.top-(r.bottom-lim))+'px';}}}catch(e){}}
['resize','orientationchange','fullscreenchange','pageshow','focus'].forEach(function(n){addEventListener(n,function(){fit();setTimeout(fit,300);setTimeout(fit,1200);});});
D.addEventListener('fullscreenchange',function(){setTimeout(fit,300);setTimeout(fit,1200);});
try{window.visualViewport&&window.visualViewport.addEventListener('resize',function(){setTimeout(fit,100);});}catch(e){}
new MutationObserver(function(){setTimeout(fit,50);}).observe(D.body,{attributes:true,attributeFilter:['class']});
setTimeout(fit,1500);
})();}catch(e){}

setTimeout(function(){try{var card=$('card'),v=card&&card.querySelector('div[style*="opacity"]');if(v)v.textContent='v1.36 · Sour Paint Studios';
var ul=D.querySelector('#pA ul');if(ul){var li=D.createElement('li');li.textContent='v1.36 — New Performance button on the start screen: pick canvas color, palette, paint style, music or guitar, and recording, then play on a blank full-screen canvas with just Pause and Finish. You can also pick the canvas color (Paper, Gray, Black, White) before a new canvas. Explosions are now deeper, bassier and much louder, and the music is lifted so you can hear it and the booms together. With Hover On, the charging orbs no longer pick up colors from the paint underneath. The Tools menu is now grouped into rows, with Main Menu at the top. New Lights button: a fleet of glowing lights flies through the paint and speeds up with your voice or guitar. Cinema Random now picks a different palette every touch.';ul.insertBefore(li,ul.firstChild);}
var ol=D.querySelector('#pH ol');if(ol){[['Canvas color:','On the start screen pick Paper, Gray, Black or White before tapping Play or Start new blank canvas. Continue and Resume keep the painting you had.'],['Lights:','Tap Lights next to Main Menu (or Lights in the Cinema strip) to launch nine glowing lights that fly through the paint. Sing or play and they speed up and brighten. Hold your finger down and they swarm toward it. In Performance, pick Light Show as the paint style for a page of just lights.'],['Performance:','On the start screen tap Performance. Choose canvas color, palette (or Auto to follow your playing), paint style, Guitar or Jukebox music, and whether to record. It then opens a clean full canvas with only Pause and Finish buttons. Finish stops the recording and lets you save or share it.']].forEach(function(r){var l=D.createElement('li');l.innerHTML='<b>'+r[0]+'</b> '+r[1];ol.insertBefore(l,ol.firstChild);});}}catch(e){}},1500);
setTimeout(function(){try{var card=$('card'),v=card&&card.querySelector('div[style*="opacity"]');if(v)v.textContent='v1.52 · Sour Paint Studios';
var ul=D.querySelector('#pA ul');if(ul){var li=D.createElement('li');li.textContent='v1.52 — Performance now has a Sound step with Music + touch sounds (the new default), Touch sounds only, or Guitar / mic. Before, Guitar / mic was the default and it turns off the explosion sounds, so a touch-only performance was silent.';ul.insertBefore(li,ul.firstChild);}
var ol=D.querySelector('#pH ol');if(ol){var l=D.createElement('li');l.innerHTML='<b>Performance sound:</b> In the Sound step pick Music + touch sounds (song plus explosion sounds), Touch sounds only, or Guitar / mic (plays from your guitar or mic; explosion sounds are off in that mode). The screen shows only Pause and Finish while it runs.';ol.insertBefore(l,ol.firstChild);}}catch(e){}},3300);
}catch(e){console.warn('perf',e);}
})();
