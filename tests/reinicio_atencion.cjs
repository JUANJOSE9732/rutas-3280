// Si una nota o módulo se deja sin terminar, al volver al inicio (o al reabrir la app) se borran
// la persona y el borrador. Sin nombre, documento, edad y sexo no se puede seguir.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext();const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
const url='file://'+require('path').join(__dirname,'..','index.html');
await p.goto(url);
const F=[];const ok=(c,m)=>{if(!c)F.push(m)};
/* 1. módulo sin documento: se queda en Datos aunque toque otra pestaña */
let r=await p.evaluate(()=>{localStorage.clear();setPac({'NOMBRE COMPLETO':'ANA','GENERO':'F','FECHA NACIMIENTO':'2024-01-01','__com':'MITU'});openMod('pinf');st.tab='entr';renderMod();return{tab:st.tab,h:document.querySelector('#pane h3')?.textContent||''}});
ok(r.tab==='id','sin documento debe quedarse en Datos, está en '+r.tab);
/* 2. nota por voz sin identificación: pide nombre, documento, edad y sexo antes de la primera pregunta */
r=await p.evaluate(()=>{localStorage.clear();home();vnOpen('ccu');return{form:!!document.getElementById('vi-go'),pregunta:!!document.querySelector('.gx-lab')}});
ok(r.form&&!r.pregunta,'la nota por voz debe pedir la identificación primero');
r=await p.evaluate(()=>{$('vi-nom').value='ANA RUIZ';$('vi-go').click();return document.getElementById('vi-miss').hidden});
ok(!r,'con solo el nombre no debe dejar seguir');
r=await p.evaluate(()=>{$('vi-tip').value='CC';$('vi-doc').value='123';$('vi-fn').value='1990-01-01';$('vi-sx').value='F';$('vi-go').click();return!!document.querySelector('.gx-lab')});
ok(r,'completa la identificación, debe pasar a las preguntas');
/* 3. sale al inicio sin terminar: doble toque y se borra todo */
r=await p.evaluate(()=>{VNS.v.cuello='CON ECTROPION';vnGuardar();const bt=$('vn-back');bt.click();const pide=/toca otra vez/.test(bt.textContent);bt.click();
 return{pide,pac:localStorage.getItem('dn2_pac'),draft:localStorage.getItem('dn2_vn_ccu'),aviso:!!document.getElementById('rz-box')}});
ok(r.pide,'el primer toque en salir debe advertir');ok(!r.pac,'la persona debía borrarse');ok(!r.draft,'el borrador debía borrarse');ok(r.aviso,'debe avisar que se reinició');
/* 4. se cierra la app a mitad de un módulo: al reabrir, todo limpio */
await p.evaluate(()=>{localStorage.clear();setPac({'NOMBRE COMPLETO':'LUIS','TIPO':'RC','DOCUMENTO ID.':'5','GENERO':'M','FECHA NACIMIENTO':'2023-01-01','__com':'MITU'});openMod('pinf');S.set(key('pinf','iv'),JSON.stringify({0:'x'}))});
await p.reload();await p.waitForTimeout(300);
r=await p.evaluate(()=>({pac:localStorage.getItem('dn2_pac'),iv:localStorage.getItem(key('pinf','iv')),aviso:!!document.getElementById('rz-box')}));
ok(!r.pac&&!r.iv,'al reabrir la app la atención interrumpida debía borrarse');ok(r.aviso,'al reabrir debe avisar');
/* 5. atención terminada (registrada en la base): no se borra la persona */
r=await p.evaluate(()=>{localStorage.clear();setPac({'NOMBRE COMPLETO':'ROSA','TIPO':'CC','DOCUMENTO ID.':'77','GENERO':'F','FECHA NACIMIENTO':'1975-01-01','__com':'MITU','ETNIA':'INDIGENA','PUEBLO':'CUBEO','EAPB NOMBRE':'X','RÉGIMEN':'SUBSIDIADO','TELEFONO':'3'});
 S.set('dn2_vn_mama',JSON.stringify({mamas:'NORMAL'}));vnOpen('mama');VNS.fin=true;vnRender();vnRegistrarBase('x');document.getElementById('bform').requestSubmit();home();return{pac:localStorage.getItem('dn2_pac'),en:localStorage.getItem('dn2_encurso')}});
ok(r.pac&&!r.en,'registrada en la base, la persona se conserva');
/* 6. plantilla sin documento: no se pasa */
r=await p.evaluate(()=>{const t=plGenerar('NOTA','mama').replace('Nombre completo: ','Nombre completo: ROSA GIL');return plAplicar(t)});
ok(r.err&&/documento/.test(r.err),'la plantilla sin documento debía rechazarse');
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('reinicio_atencion: 0 fallos');
await b.close()})();
