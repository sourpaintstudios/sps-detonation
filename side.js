/* Tools menu as a slim scrolling strip down the left edge */
(function(){try{
var s=document.createElement('style');
s.textContent='#p-tool:not(.min){left:0!important;right:auto!important;top:calc(env(safe-area-inset-top,0px) + 62px)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 70px)!important;max-height:none!important;width:92px!important;box-sizing:border-box!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;border-radius:0 18px 18px 0!important;padding:4px 4px 8px!important;background:rgba(18,10,34,.5)!important;z-index:6}'
+'#p-tool:not(.min) .grip{position:sticky;top:0;z-index:2;font-size:10px!important}'
+'#p-tool:not(.min) .tg{grid-template-columns:1fr!important;gap:4px!important;width:100%!important}'
+'#p-tool:not(.min) .tg>*{grid-column:1/-1!important}'
+'#p-tool:not(.min) .tl{min-height:36px!important;padding:6px 2px!important;font-size:10px!important;white-space:normal!important;line-height:1.1!important;touch-action:pan-y!important}'
+'#p-tool:not(.min) #t-menu.mm{white-space:normal!important;font-size:11px!important;letter-spacing:.02em!important}'
+'#p-tool:not(.min) .tg .gl{text-align:center!important;font-size:8px!important}'
+'body:has(#p-tool:not(.min)) #p-wet{left:100px!important}'
+'body:has(#start:not([style*="none"])) #p-tool{display:none!important}';
document.head.appendChild(s);
setTimeout(function(){try{var r=document.getElementById('t-rec');if(r&&r.textContent==='Record')r.textContent='\u25CF Record Video';}catch(e){}},1500);
}catch(e){console.warn('side',e);}})();
