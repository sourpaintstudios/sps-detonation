/* Sour Paint tip bucket (reusable). Same can, clips and Square link as AZ Open Mics.
   Config (optional, set before loading): window.SPT_CFG={host:'#start',base:'tipbucket/',url:'...',pos:'left'} */
(function(){try{
var D=document,C=window.SPT_CFG||{};
var HOST=C.host||'#start',BASE=C.base||'tipbucket/',URL_=C.url||'https://square.link/u/whz7377J',KEY=C.key||'spt.tipclip';
var CLIPS=[
 ['tip-oops','9 / 16','Oops, did you mean to touch that? Here you go. Hit these buttons to leave a tip.'],
 ['tip-cholla','432 / 574','A cowgirl in the cholla at sunset points to the tip buttons.'],
 ['tip-ufo','432 / 532','A wide-eyed farmer under a UFO beam points to the tip jar.'],
 ['tip-redhead','432 / 648','A cowgirl in the desert leans in and points to the tip buttons.'],
 ['tip-saloon','432 / 574','A woman in a red dress outside a saloon points to the tip buttons.'],
 ['tip-porch','432 / 648','A man on a porch at night points to the tip jar.'],
 ['tip-harmonica','432 / 938','A harmonica player in a Sour Paint shirt points to the tip buttons.']];
var css=D.createElement('style');
css.textContent='#tipcan{position:absolute!important;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);width:76px;height:80px;min-width:44px;min-height:44px;padding:0;border:0;background:transparent;cursor:pointer;z-index:3;filter:drop-shadow(0 6px 8px rgba(3,14,7,.75));-webkit-tap-highlight-color:transparent}'
+'#tipcan::before{content:"";position:absolute;z-index:-1;inset:-3px -9px -7px -9px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(4,18,9,.96) 0%,rgba(4,18,9,.9) 48%,rgba(4,18,9,.55) 68%,rgba(4,18,9,0) 82%);pointer-events:none}'
+'#tipcan img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}'
+'@media (orientation:portrait){#start{padding-bottom:calc(env(safe-area-inset-bottom,0px) + 104px)!important}}'
+'#tipback{position:fixed;inset:0;z-index:100000;background:rgba(8,4,16,.78);display:none;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 12px) 12px calc(env(safe-area-inset-bottom,0px) + 12px)}'
+'#tipcard{background:#1b1426;color:#f4ecff;border:2px solid #7cfc00;border-radius:18px;max-width:420px;width:100%;max-height:calc(100dvh - 24px);overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px;text-align:center;font:14px/1.4 system-ui,sans-serif;box-shadow:0 0 22px rgba(124,252,0,.35)}'
+'#tipvid{display:block;width:auto;max-width:100%;max-height:36dvh;margin:0 auto 10px;border-radius:14px;background:#000;object-fit:cover}'
+'#tipcard h3{margin:0;font:700 22px/1.2 system-ui,sans-serif;color:#fff}#tipcard p{margin:8px 0 0}'
+'#tipamts{display:flex;gap:8px;margin-top:12px}'
+'#tipamts button{flex:1;min-height:48px;border:0;border-radius:999px;background:#7cfc00;color:#111;font:800 18px system-ui,sans-serif;cursor:pointer}'
+'#tipamts button[aria-pressed=true]{background:#ff4fd8;color:#fff}'
+'#tipx{margin-top:12px;min-height:44px;padding:0 22px;border:2px solid #ff4fd8;border-radius:999px;background:transparent;color:#ff4fd8;font:700 14px system-ui,sans-serif;cursor:pointer}';
D.head.appendChild(css);
var ac=null;
function tone(f,t,d,type,v){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();if(ac.state==='suspended')ac.resume();var o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime+t;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(ac.destination);o.start(n);o.stop(n+d+.02);}catch(e){}}
function chime(){tone(988,0,.05,'square',.035);tone(1319,.06,.09,'triangle',.05);tone(1976,.12,.14,'sine',.03);}
function pick(){var last=-1;try{var s=localStorage.getItem(KEY);if(s!==null&&isFinite(Number(s)))last=Number(s);}catch(e){}
 var p=Math.floor(Math.random()*CLIPS.length);if(p===last)p=(p+1+Math.floor(Math.random()*(CLIPS.length-1)))%CLIPS.length;
 try{localStorage.setItem(KEY,String(p));}catch(e){}return p;}
var back=null,vid=null,picked=0;
function build(){
 back=D.createElement('div');back.id='tipback';
 back.innerHTML='<div id="tipcard" role="dialog" aria-modal="true" aria-labelledby="tipt"><video id="tipvid" playsinline preload="auto"></video><h3 id="tipt">Toss one in the bucket.</h3><p>It goes to Sour Paint Studios through Square.</p><div id="tipamts"><button type="button" data-a="3">$3</button><button type="button" data-a="5">$5</button><button type="button" data-a="10">$10</button></div><p id="tipnote" style="opacity:.75">Three bucks, five, or ten. Square will ask you to type it.</p><button type="button" id="tipx">Not tonight</button></div>';
 D.body.appendChild(back);
 back.addEventListener('click',function(e){if(e.target===back)close();});
 D.getElementById('tipx').onclick=close;
 back.querySelectorAll('#tipamts button').forEach(function(b){b.onclick=function(){chime();picked=b.getAttribute('data-a');back.querySelectorAll('#tipamts button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});D.getElementById('tipnote').textContent='$'+picked+'. Type that amount on the Square page.';window.open(URL_,'_blank','noopener,noreferrer');};});
 vid=D.getElementById('tipvid');
 vid.addEventListener('click',function(){vid.currentTime=0;vid.muted=false;var p=vid.play();if(p&&p.catch)p.catch(function(){});});
 D.addEventListener('keydown',function(e){if(e.key==='Escape'&&back.style.display==='flex')close();});
}
function open(){
 chime();if(!back)build();var c=CLIPS[pick()];
 vid.poster=BASE+c[0]+'-poster.jpg';vid.src=BASE+c[0]+'.mp4';vid.style.aspectRatio=c[1];vid.setAttribute('aria-label',c[2]);
 picked=0;D.getElementById('tipnote').textContent='Three bucks, five, or ten. Square will ask you to type it.';
 back.querySelectorAll('#tipamts button').forEach(function(x){x.setAttribute('aria-pressed','false');});
 back.style.display='flex';vid.muted=false;
 var p=vid.play();if(p&&p.catch)p.catch(function(){vid.muted=true;var q=vid.play();if(q&&q.catch)q.catch(function(){});});
}
function close(){if(!back)return;back.style.display='none';try{vid.pause();vid.removeAttribute('src');vid.load();}catch(e){}}
var t=0,h=setInterval(function(){t++;var st=D.querySelector(HOST);if(!st&&t<80)return;clearInterval(h);if(!st||D.getElementById('tipcan'))return;
 var b=D.createElement('button');b.type='button';b.id='tipcan';b.setAttribute('aria-label','Tip bucket');b.innerHTML='<img src="'+BASE+'can.webp" alt="">';b.onclick=open;st.appendChild(b);},250);
window.SPT={open:open,close:close};
setTimeout(function(){try{var card=D.getElementById('card'),v=card&&card.querySelector('div[style*="opacity"]');if(v)v.textContent='v1.58 · Sour Paint Studios';
var ul=D.querySelector('#pA ul');if(ul){var li=D.createElement('li');li.textContent='v1.58 — Tip bucket. Tap the can in the lower left of the start screen to watch a short clip (a different one each time), then tip $3, $5 or $10 through Square. Tips help keep Sour Paint Studios making free apps.';ul.insertBefore(li,ul.firstChild);}
var ol=D.querySelector('#pH ol');if(ol){var l=D.createElement('li');l.innerHTML='<b>Tip bucket:</b> On the start screen, tap the tip can in the lower left. A clip plays. Tap the clip to replay it. Hit $3, $5 or $10 and Square opens so you can leave a tip. Tap Not tonight to close.';ol.insertBefore(l,ol.firstChild);}}catch(e){}},4200);
}catch(e){console.warn('tip',e);}})();
