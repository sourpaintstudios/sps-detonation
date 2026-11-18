/* Tools menu as a slim scrolling strip down the left edge */
(function(){try{
var s=document.createElement('style');
s.textContent='#p-tool:not(.min){left:0!important;right:auto!important;top:calc(env(safe-area-inset-top,0px) + 62px)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 70px)!important;max-height:none!important;width:84px!important;box-sizing:border-box!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;border-radius:0 18px 18px 0!important;padding:3px 3px 6px!important;background:rgba(18,10,34,.5)!important;z-index:6}'
+'#p-tool:not(.min) .grip{position:sticky;top:0;z-index:2;font-size:10px!important}'
+'#p-tool:not(.min) .tg{grid-template-columns:1fr!important;gap:2px!important;width:100%!important}'
+'#p-tool:not(.min) .tg>*{grid-column:1/-1!important}'
+'#p-tool:not(.min) .tl{min-height:30px!important;padding:4px 2px!important;font-size:10px!important;white-space:normal!important;line-height:1.1!important;touch-action:pan-y!important}'
+'#p-tool:not(.min) #t-menu.mm{min-height:40px!important;white-space:normal!important;font-size:11px!important;letter-spacing:.02em!important}'
+'#p-tool:not(.min) .tg .gl{text-align:center!important;font-size:8px!important}'
+'body:has(#p-tool:not(.min)) #p-wet{left:92px!important}'
+'#p-tool:not(.min) .grip{padding:4px 6px!important}.pnl:not(.min) .grip{white-space:nowrap!important;display:flex;align-items:center;justify-content:center}.pnl:not(.min) .grip::after{content:"\\2715"!important;margin-left:6px!important;padding:0!important;width:22px;height:22px;line-height:22px;flex:none;text-align:center;border-radius:50%!important;background:#ff4fd8!important;color:#fff!important;font-size:14px!important;font-weight:900;vertical-align:middle;box-shadow:0 0 8px rgba(255,79,216,.7)}'
+'body:has(#start:not([style*="none"])) #p-tool{display:none!important}';
document.head.appendChild(s);
setTimeout(function(){try{var r=document.getElementById('t-rec');if(r&&r.textContent==='Record')r.textContent='● Record Video';}catch(e){}},1500);
}catch(e){console.warn('side',e);}})();
