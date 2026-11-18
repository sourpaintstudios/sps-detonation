/* Shuffle: timed auto-change of mood, paint look and effects, with countdown and numbered log */
(function(){try{
var D=document,$=function(i){return D.getElementById(i)},LS=window.localStorage;
var MODES=['Off','5s','10s','15s','Random'],mi=0,tick=0,nextAt=0,span=0,log=[],cnt=0,seq=0,panelOn=false,FP=['Palette','Fire','Neon','Ice'],FI=['Normal','Ink'],FR=['Off','2','4','Kaleido'];
function ld(k,d){try{var v=JSON.parse(LS.getItem(k));return v==null?d:v;}catch(e){return d;}}
function sv(k,v){try{LS.setItem(k,JSON.stringify(v));}catch(e){}}
mi=0;try{LS.removeItem('spd-shm');}catch(e){}log=ld('spd-shlog',[]);cnt=ld('spd-shcnt',0);if(!Array.isArray(log))log=[];
function R(a){return a[Math.floor(Math.random()*a.length)];}
function val(id){var e=$(id);if(!e)return '';var t=(e.textContent||'').trim(),i=t.indexOf(': ');return i<0?t:t.slice(i+2).trim();}
function pills(){var WS=$('wscroll');return WS?[].slice.call(WS.querySelectorAll('[data-n]')):[];}
function curMood(){var p=pills().filter(function(b){return b.classList.contains('sel');})[0];return p?p.dataset.n:'';}
function curLook(){return val('w-look');}
function frozen(){var s=$('flsh');return !!(s&&s.style.display!=='none');}
function cyc(id,want,max){var e=$(id);if(!e)return;for(var i=0;i<(max||10);i++){var t=(e.textContent||'').replace(/\s+/g,' ').trim();if(t.slice(-want.length)===want&&(t.length===want.length||/[: ]/.test(t.charAt(t.length-want.length-1))))return;e.click();}}
function readState(){var fo=$('t-fl')&&$('t-fl').classList.contains('sel'),ls=$('t-ls')&&$('t-ls').classList.contains('sel');return{m:curMood(),lk:curLook(),fo:fo?1:0,fp:val('t-fp'),fi:val('t-fi'),fr:val('t-fr'),ls:ls?1:0,lm:val('t-lm')};}
function apply(o){
 var p=pills().filter(function(b){return b.dataset.n===o.m;})[0];if(p&&curMood()!==o.m)p.click();
 if(o.lk&&$('w-look'))cyc('w-look',o.lk,10);
 var fo=$('t-fl')&&$('t-fl').classList.contains('sel');if($('t-fl')&&!!o.fo!==!!fo)$('t-fl').click();
 if(o.fo){if(o.fp)cyc('t-fp',o.fp,5);if(o.fi)cyc('t-fi',o.fi,3);if(o.fr)cyc('t-fr',o.fr,5);}
 var ls=$('t-ls')&&$('t-ls').classList.contains('sel');if($('t-ls')&&!!o.ls!==!!ls)$('t-ls').click();
 if(o.ls&&o.lm)cyc('t-lm',o.lm,3);}
function summary(o){var s=[o.m||'?',o.lk||'?'];if(o.fo)s.push('Fluid '+o.fp+'/'+o.fi+'/'+o.fr);if(o.ls)s.push('Lights '+o.lm);return s.join(' · ');}
function pickNew(){var c=readState(),o={m:c.m,lk:c.lk,fo:c.fo,fp:c.fp,fi:c.fi,fr:c.fr,ls:c.ls,lm:c.lm},ms=pills().map(function(b){return b.dataset.n;}).filter(function(n){return n&&n!=='Random'&&n!==c.m;});
 if(ms.length)o.m=R(ms);
 var LK=['Throw','Trace','Comets','Lanes','Blend','Strings','Rain','Burst'].filter(function(n){return n!==c.lk;});o.lk=R(LK);
 if(c.fo){o.fp=R(FP);o.fi=R(FI);o.fr=R(FR);}
 if(c.ls){o.lm=R(['Fly','Bounce']);}
 return o;}
function addLog(o){cnt++;log.push({n:cnt,o:o,k:0});var extra=log.filter(function(e){return !e.k;}).length-40;while(extra-->0){var i=0;while(log[i]&&log[i].k)i++;log.splice(i,1);}sv('spd-shlog',log);sv('spd-shcnt',cnt);renderLog();return cnt;}
function interval(){var m=MODES[mi];if(m==='Random')return 3000+Math.random()*12000;return parseInt(m,10)*1000;}
function schedule(){span=interval();nextAt=performance.now()+span;}
function doChange(){if(frozen()){nextAt=performance.now()+1500;return;}var o=pickNew();apply(o);var n=addLog(o);flash('#'+n+' '+summary(o));schedule();}
function tickFn(){var cd=$('shcd');if(!cd)return;if(mi===0){cd.style.display='none';return;}cd.style.display='';var left=Math.max(0,nextAt-performance.now());if(left<=0&&!frozen()){doChange();left=Math.max(0,nextAt-performance.now());}
 var sec=Math.ceil(left/1000);$('shcdt').textContent='Shuffle '+MODES[mi]+' · next in '+sec+'s · #'+(cnt+1);$('shcdb').style.width=(span?Math.max(0,Math.min(100,left/span*100)):0)+'%';}
var flT=0;function flash(t){var f=$('shfl');if(!f)return;f.textContent=t;f.style.opacity='1';clearTimeout(flT);flT=setTimeout(function(){f.style.opacity='0';},2600);}
function setMode(n){mi=n;if(mi){schedule();}uiBtns();tickFn();try{window.SPD&&window.SPD.note&&window.SPD.note(mi?'Shuffle '+MODES[mi]+': the look changes by itself. The countdown shows the next change.':'Shuffle off');}catch(e){}}
function nextMode(){setMode((mi+1)%MODES.length);}
function uiBtns(){var t='Shuffle: '+MODES[mi];['t-sh','w-sh'].forEach(function(id){var e=$(id);if(e){e.textContent=t;e.classList.toggle('sel',mi>0);}});['t-shl','w-shl'].forEach(function(id){var e=$(id);if(e){e.textContent=id==='w-shl'?'Log':'Shuffle Log';e.classList.toggle('sel',panelOn);}});}
function renderLog(){var box=$('shlist');if(!box)return;box.innerHTML='';if(!log.length){box.innerHTML='<div style="padding:8px;opacity:.8">No looks yet. Turn Shuffle on.</div>';return;}
 log.slice().reverse().forEach(function(e){var r=D.createElement('div');r.style.cssText='display:flex;align-items:center;gap:6px;padding:5px 4px;border-bottom:1px solid rgba(255,255,255,.12)';
  var t=D.createElement('div');t.style.cssText='flex:1;font-size:11.5px;line-height:1.2';t.innerHTML='<b style="color:#7cfc00">#'+e.n+'</b> '+summary(e.o);
  var g=D.createElement('button');g.textContent='Go';g.style.cssText='border:0;border-radius:14px;min-width:38px;height:30px;background:#7cfc00;color:#150a26;font:800 12px system-ui';g.onclick=function(ev){ev.stopPropagation();apply(e.o);flash('Back to #'+e.n+': '+summary(e.o));if(mi)schedule();};
  var s=D.createElement('button');s.textContent=e.k?'★':'☆';s.style.cssText='border:0;border-radius:14px;width:30px;height:30px;background:#2a1647;color:#ff4fd8;font:800 16px system-ui';s.onclick=function(ev){ev.stopPropagation();e.k=e.k?0:1;sv('spd-shlog',log);renderLog();};
  r.appendChild(t);r.appendChild(g);r.appendChild(s);box.appendChild(r);});}
function togglePanel(){panelOn=!panelOn;var p=$('shpan');if(p)p.style.display=panelOn?'':'none';if(panelOn)renderLog();uiBtns();}
function build(){
 var st=D.createElement('style');st.textContent='#p-tool .tg .tl{min-height:44px!important}#shcd{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:40;pointer-events:none;min-width:210px;max-width:92vw;padding:6px 14px 8px;border-radius:20px;background:rgba(21,10,38,.88);border:2px solid #7cfc00;color:#fff;font:700 13px system-ui,sans-serif;text-align:center}body.strip #shcd{bottom:calc(env(safe-area-inset-bottom,0px) + 82px)}#shcdb{height:5px;border-radius:3px;background:#ff4fd8;margin-top:5px;width:100%}#shfl{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 70px);z-index:40;pointer-events:none;padding:5px 12px;border-radius:16px;background:rgba(255,79,216,.92);color:#fff;font:700 12px system-ui;opacity:0;transition:opacity .4s;max-width:92vw;text-align:center}body.strip #shfl{bottom:calc(env(safe-area-inset-bottom,0px) + 138px)}#shpan{position:fixed;left:104px;bottom:calc(env(safe-area-inset-bottom,0px) + 76px);width:min(236px,calc(100vw - 120px));max-height:36vh;z-index:41;border-radius:16px;background:rgba(21,10,38,.95);border:2px solid #ff4fd8;color:#fff;font:12px system-ui;display:flex;flex-direction:column;overflow:hidden}body.strip #shpan{bottom:calc(env(safe-area-inset-bottom,0px) + 144px)}#shlist{overflow-y:auto;flex:1}#shpan .hd{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;font:800 12px system-ui;color:#7cfc00;background:#2a1647}#shpan .hd button{border:0;border-radius:14px;width:28px;height:28px;background:rgba(255,255,255,.2);color:#fff;font:800 14px system-ui}';D.head.appendChild(st);
 var cd=D.createElement('div');cd.id='shcd';cd.style.display='none';cd.innerHTML='<div id="shcdt"></div><div id="shcdb"></div>';D.body.appendChild(cd);
 var fl=D.createElement('div');fl.id='shfl';D.body.appendChild(fl);
 var pn=D.createElement('div');pn.id='shpan';pn.style.display='none';pn.innerHTML='<div class="hd"><span>SHUFFLE LOG</span><button id="shx">✕</button></div><div id="shlist"></div>';D.body.appendChild(pn);$('shx').onclick=togglePanel;pn.addEventListener('pointerdown',function(e){e.stopPropagation();});
 renderLog();}
var tries=0,iv=setInterval(function(){tries++;var tg=D.querySelector('#p-tool .tg'),ws=$('wscroll'),a=$('t-fd'),b=$('w-fd');if((!tg||!ws||!a||!b)&&tries<80)return;clearInterval(iv);
 build();
 if(tg&&!$('t-sh')){var x=D.createElement('button');x.className='tl';x.id='t-sh';x.style.minHeight='40px';x.onclick=nextMode;tg.insertBefore(x,a?a.nextSibling:null);var y=D.createElement('button');y.className='tl';y.id='t-shl';y.style.minHeight='40px';y.onclick=togglePanel;tg.insertBefore(y,x.nextSibling);}
 if(ws&&!$('w-sh')){var p=D.createElement('button');p.className='pill';p.id='w-sh';p.onclick=nextMode;ws.insertBefore(p,b?b.nextSibling:ws.firstChild);var q=D.createElement('button');q.className='pill';q.id='w-shl';q.onclick=togglePanel;ws.insertBefore(q,p.nextSibling);}
 uiBtns();if(mi)schedule();tick=setInterval(tickFn,200);},300);
function dlVideo(){var v=$('recvid');if(!v||!v.src)return;var n=function(m){try{window.SPD&&window.SPD.note&&window.SPD.note(m);}catch(e){}};fetch(v.src).then(function(x){return x.blob();}).then(function(b){var ext=/mp4/.test(b.type)?'mp4':'webm',d=new Date(),p=function(k){return String(k).padStart(2,'0');},fn='sour-paint-detonation-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())+'.'+ext,u=URL.createObjectURL(b),a=D.createElement('a');a.href=u;a.download=fn;D.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},8000);n('Downloading '+fn);}).catch(function(){n('Download failed. Try Share instead.');});}
(function(){var t=0,h=setInterval(function(){t++;var s=$('recsave'),row=s&&s.parentNode;if(!row&&t<50)return;clearInterval(h);if(!row||$('recdl'))return;s.textContent='Share';var b=D.createElement('button');b.className='pill';b.id='recdl';b.textContent='Download';b.onclick=dlVideo;row.insertBefore(b,s.nextSibling);},200);})();
(function(){var on=false,had=0,tk=0;function gOn(){var g=$('t-gtr');return !!((window.SPD&&window.SPD.micOn)||(g&&/On/.test(g.textContent)));}
function rb(){return $('w-rand');}
function end(){if(!on)return;on=false;var b=rb();if(b){b.textContent='Randomize';b.classList.remove('sel');}setMode(had);try{if(window.SPD.rec())window.SPD.recStop();}catch(e){}clearInterval(tk);}
D.addEventListener('click',function(e){var b=rb();if(!b||!e.target||!(e.target===b||b.contains(e.target)))return;
 if(!on&&gOn())return;
 e.stopImmediatePropagation();e.preventDefault();
 if(on){end();return;}
 on=true;had=mi;b.textContent='■ Stop';b.classList.add('sel');setMode(4);
 try{if(!window.SPD.rec())window.SPD.recStart();}catch(e2){}
 try{window.SPD.note('Randomize on: the look changes by itself and the video is recording. Music and sounds stay on. Tap Stop to finish.');}catch(e3){}
 clearInterval(tk);tk=setInterval(function(){try{if(on&&!window.SPD.rec())end();}catch(e){}},1500);},true);})();
window.SPD_SH={mode:function(){return MODES[mi];},set:setMode,log:function(){return log;}};
setTimeout(function(){try{var card=$('card'),v=card&&card.querySelector('div[style*="opacity"]');if(v)v.textContent='v1.52 · Sour Paint Studios';
var ul=D.querySelector('#pA ul');if(ul){var li=D.createElement('li');li.textContent='v1.52 — Shuffle and Randomize now always start Off when you open the app, so the look no longer changes by itself after a restart. v1.51 — Quality check pass: every Tools menu button is now at least 44 px tall for easier thumb taps, and the Fluid, Lights and Shuffle features are saved for offline use. v1.50 — Randomize no longer turns Guitar mode on, so music and explosion sounds keep working. It now changes the look by itself (Shuffle with random timing) and records the video. With Guitar already on, it still follows your playing. v1.49 — After a video, the screen now has Share, Download and Close. Download saves the video straight to your phone; Share opens the share sheet. v1.48 — New Shuffle: the look changes by itself. Tap Shuffle in the Tools menu or Cinema strip to pick 5s, 10s, 15s or Random (a random wait of 3 to 15 seconds). A countdown shows when the next change is coming. Every change gets a number in the Shuffle Log: tap Go to return to that exact look, or the star to keep it.';ul.insertBefore(li,ul.firstChild);}
var ol=D.querySelector('#pH ol');if(ol){var l1=D.createElement('li');l1.innerHTML='<b>Randomize:</b> tap it in Cinema or Wild mode. The look changes by itself and a video starts recording, with music and sounds. Tap Music first if you want a song in the video. Tap Stop to finish and get Share / Download. If Guitar mode is on, Randomize follows your playing instead, and music and explosion sounds are off in that mode.';ol.insertBefore(l1,ol.firstChild);var l0=D.createElement('li');l0.innerHTML='<b>After a video:</b> Tap Download to save the video to your phone. Tap Share to send it to an app. Tap Close when done.';ol.insertBefore(l0,ol.firstChild);var l=D.createElement('li');l.innerHTML='<b>Shuffle:</b> Tap Shuffle (Tools menu, or the Cinema strip) to cycle Off, 5s, 10s, 15s, Random. The look then changes on its own: the mood colors, the paint look, and the Fluid and Lights settings if they are on. A small countdown at the bottom shows the time to the next change (it is not recorded in videos). Random waits a surprise 3 to 15 seconds. Tap Shuffle Log (Log in Cinema) to see every change numbered. Tap Go to bring back that exact look, or the star to keep it. Tap Shuffle until it reads Off to stop. Shuffle always starts Off when you open the app.';ol.insertBefore(l,ol.firstChild);}}catch(e){}},2500);
}catch(e){console.warn('shuffle',e);}})();
