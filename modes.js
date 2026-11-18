/* Elementary (simple) mode entry on the start screen + About/How-to notes */
(function(){try{
var D=document,$=function(i){return D.getElementById(i)};
var t=0,h=setInterval(function(){t++;var st=$('start');if(!st&&t<60)return;clearInterval(h);if(!st||$('elem'))return;
 var a=D.createElement('a');a.id='elem';a.href='simple.html';a.className='go';a.textContent='Elementary mode (simple)';a.style.cssText='background:#ffd400;color:#111;text-decoration:none;display:inline-block;text-align:center';
 var p=D.createElement('p');p.id='elemp';p.style.cssText='font-size:13px;font-weight:700;max-width:340px;margin:0';p.textContent='Elementary = the simple game. University = the full game (Play).';
 var g=$('go-f');st.insertBefore(a,g);st.insertBefore(p,g);},250);
setTimeout(function(){try{var card=$('card'),v=card&&card.querySelector('div[style*="opacity"]');if(v)v.textContent='v1.56 · Sour Paint Studios';
var ul=D.querySelector('#pA ul');if(ul){var li=D.createElement('li');li.textContent='v1.53 — Two modes. Elementary is the original simple game: pick a mood, hold to load paint, drag, let go. University is the full game with every tool. Choose on the start screen. Elementary has a University button at the top to switch back.';ul.insertBefore(li,ul.firstChild);}
var ol=D.querySelector('#pH ol');if(ol){var l=D.createElement('li');l.innerHTML='<b>Elementary and University:</b> New to the game? On the start screen tap Elementary mode (simple). It is just the basics: pick a mood, press and hold to load the brush, drag, and release to explode. When you are ready for everything else, tap University at the top of Elementary, or just open the game and tap Play.';ol.insertBefore(l,ol.firstChild);}}catch(e){}},3600);
}catch(e){console.warn('modes',e);}})();
