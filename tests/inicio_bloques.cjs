// El inicio se organiza en cajones; todo apartado queda dentro de uno y solo uno se abre a la vez.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:400,height:860}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const R=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();home();
 const sueltos=[...document.querySelectorAll('#app > section')].filter(s=>!s.classList.contains('finder')&&!s.querySelector('.drafts'));
 ok(!sueltos.length,'apartados fuera de los cajones: '+sueltos.map(s=>(s.querySelector('h2')||{}).textContent).join(', '));
 const k=[...document.querySelectorAll('#bloques details.blq')].map(d=>d.dataset.blq).join(',');ok(k==='dia,pym,morb,voz,proc,datos','cajones: '+k);
 ['t-pinf','t-prenatal','t-mb','t-sx','vn-home','t-proc','t-pacs','t-vbase','t-base','t-plant','md-cal','t-cap'].forEach(id=>{const e=document.getElementById(id);ok(e&&e.closest('details.blq'),id+' no está en un cajón')});
 const d=q=>document.querySelector('details.blq[data-blq='+q+']');d('pym').open=true;d('pym').dispatchEvent(new Event('toggle'));d('morb').open=true;d('morb').dispatchEvent(new Event('toggle'));
 ok(!d('pym').open&&d('morb').open,'solo uno abierto a la vez');ok(localStorage.getItem('dn2_blq')==='morb','recuerda el cajón abierto');
 home();ok(document.querySelector('details.blq[data-blq=morb]').open,'al volver al inicio sigue abierto');
 ok(document.querySelector('#app > details.cab h1'),'el título «Dictado de Notas» debe ser desplegable');
 const fd=document.getElementById('blq-fdr');ok(fd&&fd.querySelector('section.finder #f-edad'),'«¿A quién vas a atender?» debe contener el panel');
 localStorage.setItem('dn2_blq_fdr','0');home();ok(!document.getElementById('blq-fdr').open,'cerrado por defecto');
 document.getElementById('pac-det').open=true;
 return new Promise(r=>setTimeout(()=>{ok(document.getElementById('blq-fdr').open,'abrir los datos de la persona abre el panel');r(F)},50))});
const all=R.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('inicio_bloques: 0 fallos');
await b.close()})();
