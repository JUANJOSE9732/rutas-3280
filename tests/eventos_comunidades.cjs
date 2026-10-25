// v187: rutas por evento (qué hacer en orden) y comunidades (concertación, educación, permanencia).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const ids=new Set(FMT.map(f=>f.id)),crit=new Set(TM_CRIT.map(c=>c[0]));
 ok(EV.length===14,'14 eventos');ok(new Set(EV.map(e=>e.id)).size===EV.length,'ids repetidos');
 EV.forEach(E=>{E.f.forEach(([id])=>ok(id[0]==='~'?FMT_FALTA[id.slice(1)]:ids.has(id),E.id+': formato '+id));E.tm.forEach(c=>ok(crit.has(c),E.id+': criterio '+c));
  ok(!E.ruta||DIR_RUTAS[E.ruta],E.id+': ruta');Object.keys(E.p).forEach(k=>ok(EV_FASES.some(f=>f[0]===k),E.id+': fase '+k))});
 home();ok($('md-ev')&&$('md-com'),'botones en Mi día');
 $('md-ev').click();ok(st.view==='ev'&&document.querySelectorAll('[data-ev]').length===14,'lista de eventos');
 document.querySelector('[data-ev="ofid"]').click();ok(/Accidente ofídico/.test($('app').textContent),'abre ofídico');
 ok(/Ficha 100/.test($('app').textContent)&&/n\.º/.test(document.querySelector('.fmt-box').textContent)||/Ficha 100/.test($('app').textContent),'formatos del evento');
 const c=document.querySelector('[data-evk="ac1"]');c.checked=true;c.dispatchEvent(new Event('change'));ok(/NO TORNIQUETE/.test($('ev-nota').value),'nota: '+$('ev-nota').value);
 ok(evGet('ofid').ck.ac1===1,'guardado');$('ev-dir').click();ok(st.view==='dir'&&document.querySelector('[data-tmc="ofid"]').checked&&$('dir-ruta').value==='zoo','a telemedicina');
 ok($('dir-ev'),'botón en telemedicina');$('dir-ev').click();ok(st.view==='ev','vuelve a eventos');
 document.querySelector('[data-ev="ofid"]').click();$('ev-new').click();ok(!evGet('ofid').ck,'nuevo caso');
 /* comunidades */
 home();$('md-com').click();ok(st.view==='com','abre comunidades');$('com-new').click();
 const set=(id,v)=>{const e=$(id);if(e.type==='checkbox')e.checked=v;else e.value=v;e.dispatchEvent(new Event('change'))};
 set('cv-com','querari');set('cv-ini','2026-10-20');set('cv-fin','2026-10-23');set('cv-lider','pedro');
 let v=comVis()[0];ok(v.com==='QUERARI'&&v.ini==='2026-10-20','datos guardados');
 ok(comFalta(v).map(x=>x[0]).join()==='01,11,02','faltan 3: '+comFalta(v).map(x=>x[0]));
 ok(mdTareas().some(t=>/concertación/.test(t)&&/QUERARI/.test(t)),'tarea en Mi día');
 set('cc-ok',true);$('ed-t1').value='Malaria: toldillo y consulta temprana';$('ed-as').value='23';$('ed-f').value='2026-10-21';$('ed-add').click();
 v=comVis()[0];ok(v.conc.ok&&v.edus.length===1,'concertación y educación');ok(/23 asistentes/.test($('pm-res').value),'resumen: '+$('pm-res').value);
 ok(comFalta(v).length===1&&/ya debía salir/.test(comFalta(v)[0][1]),'permanencia vencida');
 set('pm-ok',true);v=comVis()[0];ok(v.perm.ok&&v.finR,'permanencia firmada');ok(!comFalta(v).length&&!comActiva(v),'visita cerrada');
 home();ok(!/· \d+ pendientes/.test($('md-com').textContent),'sin pendientes');
 ok(respaldoObj().comv.length===1,'respaldo');localStorage.removeItem(COMV_KEY);respaldoUnir({app:'rutas3280',comv:[v]});ok(comVis().length===1,'restaura');
 ok(/Comunidades/.test(OBL_APP['02']),'mapa de obligaciones');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('eventos_comunidades: 0 fallos');
await b.close()})();
