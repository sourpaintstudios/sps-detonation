(function(){
var S=window.SPD,WS=document.getElementById('wscroll');if(!S||!WS)return;
var $=function(i){return document.getElementById(i);};
function mk(id,t,f){var b=document.createElement('button');b.className='pill';b.id=id;b.textContent=t;b.onclick=f;WS.insertBefore(b,WS.firstChild);return b;}
var sz=mk('w-size',$('t-size').textContent,function(){$('t-size').click();sz.textContent=$('t-size').textContent;});
mk('w-undo','↶ Undo',function(){S.undo();});
mk('w-clr','Clear',function(){$('clr').click();S.note('Canvas cleared. Undo brings it back');});
/* Cinema rename */
var tv=$('t-tv');function fixTv(){var t=tv.textContent;if(/^TV/.test(t))tv.textContent=t.replace(/^TV/,'Cinema');}
new MutationObserver(fixTv).observe(tv,{childList:true,characterData:true,subtree:true});fixTv();
/* picker mode classes */
function pk(){var lock=getComputedStyle($('p-sw')).display!=='none',wheel=getComputedStyle($('dial-container')).display!=='none';document.body.classList.toggle('pk-lock',lock);document.body.classList.toggle('pk-wheel',wheel&&!lock);}
['p-sw','dial-container','p-hue'].forEach(function(i){new MutationObserver(pk).observe($(i),{attributes:true,attributeFilter:['style']});});pk();
/* hold first */
var view=$('view'),down={},first=true;
function blend(){try{return S.dbg().some(function(c){return c.b;});}catch(e){return false;}}
view.addEventListener('pointerdown',function(e){down[e.pointerId]=performance.now();if(first){first=false;setTimeout(function(){S.note('Hold to load · let go to pop · then drag to paint');},30);}},true);
view.addEventListener('pointermove',function(e){var t=down[e.pointerId];if(t==null)return;if(performance.now()-t<250&&!blend())e.stopImmediatePropagation();},true);
['pointerup','pointercancel'].forEach(function(ev){view.addEventListener(ev,function(e){delete down[e.pointerId];},true);});
$('hint').textContent='Hold to load · let go to pop · then drag to paint';
/* brush preview */
var P=[[],[[0,.95],[-.45,-.1],[-.42,-.72],[0,-.88],[.42,-.72],[.45,-.1]],
[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.14],[.15,-.16],[.22,-.02],[.18,.12],[.27,.28],[.31,.52],[.24,.78],[.1,.95],[-.1,.95],[-.24,.78],[-.31,.52],[-.27,.3],[-.17,.14],[-.2,-.04],[-.12,-.2],[-.06,-.14],[-.06,-.78],[-.11,-.8]],
[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.15],[.13,-.1],[.26,.05],[.32,.3],[.3,.6],[.2,.88],[0,.98],[-.2,.9],[-.3,.62],[-.32,.32],[-.26,.14],[-.17,.1],[-.06,-.1],[-.06,-.78],[-.11,-.8]],
[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.08],[.18,-.04],[.21,.12],[.27,.2],[.31,.5],[.27,.8],[.14,.93],[-.14,.93],[-.27,.8],[-.31,.5],[-.27,.28],[-.2,.12],[-.14,-.08],[-.06,-.08],[-.06,-.78],[-.11,-.8]],
[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.1],[.42,.86],[.22,.99],[0,.28],[-.22,.99],[-.42,.86],[-.06,-.1],[-.06,-.78],[-.11,-.8]],
[[-.11,-1],[.11,-1],[.11,-.8],[.06,-.78],[.06,-.2],[.32,-.36],[.37,-.2],[.18,.12],[.35,.9],[.17,.96],[0,.52],[-.12,.92],[-.31,.82],[-.2,.1],[-.36,-.1],[-.3,-.3],[-.06,-.2],[-.06,-.78],[-.11,-.8]],
[[-.1,-1],[.1,-1],[.1,-.8],[.05,-.78],[.05,-.2],[.19,-.13],[.26,.04],[.2,.2],[.22,.3],[.34,.45],[.37,.7],[.27,.92],[0,.98],[-.27,.92],[-.37,.7],[-.34,.45],[-.22,.3],[-.2,.2],[-.26,.04],[-.19,-.13],[-.05,-.2],[-.05,-.78],[-.1,-.8]]];
var NM=['Splat','Pick','Strat','Les Paul','Tele','Flying V','Explorer','Acoustic'];
var bp=document.createElement('div');bp.id='bprev';document.body.appendChild(bp);var bt=0;
$('t-brush').addEventListener('click',function(){var i=S.shape,s='';
 if(i===0)s='<circle cx="75" cy="75" r="55" fill="#7cfc00" stroke="#fff" stroke-width="3"/>';
 else s='<polygon points="'+P[i].map(function(p){return (75+p[0]*70).toFixed(1)+','+(75+p[1]*70).toFixed(1);}).join(' ')+'" fill="#7cfc00" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>';
 bp.innerHTML='<svg viewBox="0 0 150 150">'+s+'</svg>BRUSH: '+NM[i].toUpperCase();bp.classList.add('on');clearTimeout(bt);bt=setTimeout(function(){bp.classList.remove('on');},1500);});
/* About / How-to */
try{
var card=$('card'),h2=card.querySelector('h2');if(h2)h2.textContent='Sour Paint Squeeze Pop Overdrive';
var v=card.querySelector('div[style*="opacity"]');if(v)v.textContent='v1.15 · Sour Paint Studios';
var ul=document.querySelector('#pA ul');if(ul){var li=document.createElement('li');li.textContent='v1.15 — Locked 20 is now a slim two-column strip where the color slider sits. The Runny/Paste and color sliders are thinner. Menus are see-through from the start and fade more while you paint, colors stay visible so you can switch with a second finger. Start new blank canvas is always on the opening screen. Guitar brush shapes removed. Huge blasts get a crowd cheer. Menus no longer get stuck after a multi-finger release.';ul.insertBefore(li,ul.firstChild);var li=document.createElement('li');li.textContent='v1.14 — Back to the round buttons. While you paint, every menu fades to see-through glass so the paint shows through; lift your finger and they come back. Renamed Sour Paint Squeeze Pop Overdrive. Hold first: nothing paints until you hold about a quarter second. TV mode is now Cinema mode with Clear, Undo and Canvas size. Brush shows a big preview of the shape you picked. Explosion is deeper, bassier and louder. New intro video and Bonus: Extras when installed from the full package.';ul.insertBefore(li,ul.firstChild);}
var ol=document.querySelector('#pH ol');if(ol){
 var w=document.createTreeWalker(ol,NodeFilter.SHOW_TEXT),n,L=[];while(n=w.nextNode())L.push(n);
 L.forEach(function(t){t.nodeValue=t.nodeValue.replace(/TV mode/g,'Cinema mode').replace(/TV On/g,'Cinema On');});
 [['Hold first:','hold your finger down for a quarter second before dragging paints. A quick tap or swipe is just a small pop. The squeeze, then the pop, is the game.'],['Cinema mode Clear / Undo / Canvas:','in Cinema or Wild mode the bottom strip starts with a red Clear, Undo and Canvas size. Clear can be undone. Look shows only when Guitar is on. Brush shows a big preview of the shape you pick.']].forEach(function(a){var l=document.createElement('li');l.innerHTML='<b>'+a[0]+'</b> '+a[1];ol.appendChild(l);});}
}catch(e){}

/* v1.12: intro video + extras */
var sp=$('splash'),iv=document.createElement('video'),iok=false,iplayed=false;
iv.src='intro.mp4';iv.preload='auto';iv.playsInline=true;iv.setAttribute('playsinline','');iv.setAttribute('webkit-playsinline','');
iv.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;object-fit:cover;z-index:31;display:none;background:#0b0714;opacity:1;transition:opacity .7s';
document.body.appendChild(iv);
iv.addEventListener('canplaythrough',function(){iok=true;});iv.addEventListener('error',function(){iok=false;});
function idone(){if(iv.style.opacity==='0')return;try{iv.pause();}catch(e){}iv.style.opacity='0';setTimeout(function(){iv.style.display='none';},750);sp.click();}
sp.addEventListener('click',function(e){if(iok&&!iplayed){e.stopImmediatePropagation();iplayed=true;iv.style.display='block';iv.currentTime=0;var p=iv.play();if(p&&p.catch)p.catch(idone);}},true);
iv.addEventListener('ended',idone);iv.addEventListener('click',idone);
var xb=document.createElement('button');xb.className='go';xb.id='xbtn';xb.textContent='Bonus: Extras';xb.style.cssText='background:rgba(255,255,255,.85)';
var st0=$('start');st0.insertBefore(xb,st0.querySelector('p'));
var xo=document.createElement('div');xo.id='xov';xo.innerHTML='<h3>BONUS · EXTRAS</h3><div id="xg"></div><button class="xc" id="xcl">Close</button>';document.body.appendChild(xo);
var xp=document.createElement('div');xp.id='xp';xp.innerHTML='<video id="xpv" controls playsinline></video><button class="xc" id="xpc">Close</button>';document.body.appendChild(xp);
var xv=$('xpv');
function xclose(){try{xv.pause();}catch(e){}xv.removeAttribute('src');xv.load();xp.classList.remove('show');}
$('xpc').onclick=xclose;$('xcl').onclick=function(){xo.classList.remove('show');};
xb.onclick=function(){xo.classList.add('show');};
try{fetch('extras.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():[];}).then(function(L){
 if(!L||!L.length)return;var g=$('xg');
 L.forEach(function(x){var b=document.createElement('button');if(x.poster)b.style.backgroundImage='url('+x.poster+')';b.innerHTML='<span>'+(x.title||'Extra')+'</span>';b.onclick=function(){xv.src=x.file;xp.classList.add('show');var q=xv.play();if(q&&q.catch)q.catch(function(){});};g.appendChild(b);});
 xb.classList.add('on');}).catch(function(){});}catch(e){}
try{var ul2=document.querySelector('#pA ul');if(ul2){var l3=document.createElement('li');l3.textContent='v1.12 — Intro video (tap the opening screen, tap again to skip) and a Bonus: Extras button with bonus clips, shown only when the clips are installed.';ul2.insertBefore(l3,ul2.firstChild);}
var ol2=document.querySelector('#pH ol');if(ol2){var l4=document.createElement('li');l4.innerHTML='<b>Intro and Extras:</b> tap the opening screen to play the intro (tap again to skip). On the start screen, Bonus: Extras opens the bonus clips; tap one to play it. Extras load only when you open them.';ol2.appendChild(l4);}
var vv=card.querySelector('div[style*="opacity"]');if(vv)vv.textContent='v1.15 · Sour Paint Studios';}catch(e){}
window.dispatchEvent(new Event('resize'));
})();
