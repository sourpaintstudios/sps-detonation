(function(){var t='';['ui.js','app1.js','app2.js','app3.js','app4.js','tv.js'].forEach(function(n){var x=new XMLHttpRequest();x.open('GET',n,false);x.send();if(x.status!==200&&x.status!==0)throw new Error(n);t+=x.responseText+'\n';});
try{var p=new XMLHttpRequest();p.open('GET','patch.js',false);p.send();if(p.status===200||p.status===0){(0,eval)(p.responseText);if(window.SPO_PATCH)t=window.SPO_PATCH(t);}}catch(e){}
var s=document.createElement('script');s.textContent=t;document.head.appendChild(s);})();
