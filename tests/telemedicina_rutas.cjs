// v186: telemedicina (urgente/prioritaria/programada), direccionamiento a rutas, reportes y mapa de obligaciones.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const ids=new Set(FMT.map(f=>f.id));
 TM_CRIT.forEach(c=>{ok(TM_GR[c[1]],'grupo '+c[0]);ok(TM_NIV[c[2]],'nivel '+c[0]);ok(DIR_RUTAS[c[4]],'ruta '+c[0]+' '+c[4]);(c[5]||[]).forEach(id=>ok(id[0]==='~'?FMT_FALTA[id.slice(1)]:ids.has(id),c[0]+': formato '+id))});
 ok(new Set(TM_CRIT.map(c=>c[0])).size===TM_CRIT.length,'ids repetidos');
 Object.values(DIR_RUTAS).forEach(r=>r.f.forEach(id=>ok(ids.has(id),'ruta formato '+id)));
 Object.keys(FMT_SOP).forEach(k=>ok(ids.has(k),'sop formato '+k));MB.forEach(m=>ok(MB_TM[m.id],'morbilidad sin telemedicina '+m.id));
 ok(tmNivDe(TM_CRIT.filter(c=>['cron','prr'].includes(c[0])))==='p','nivel máximo');
 /* pantalla */
 const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-24);setPac({'NOMBRE COMPLETO':'ANA','TIPO':'CC','DOCUMENTO ID.':'9','GENERO':'F','FECHA NACIMIENTO':d.toISOString().slice(0,10),'EAPB NOMBRE':'X','PUEBLO':'CUBEO',__com:'QUERARI',__est:'ges'});
 home();ok($('md-dir')&&$('md-obl'),'botones en Mi día');$('md-dir').click();ok(st.view==='dir','abre');
 ok(document.querySelector('[data-tmc="g_pre"]').closest('details').open,'grupo gestante abierto');
 const ck=id=>{const i=document.querySelector(`[data-tmc="${id}"]`);i.checked=true;i.dispatchEvent(new Event('change'))};
 ck('g_pre');ok(/urgente/i.test($('dir-niv').textContent),'urgente');ok($('dir-ruta').value==='rmp','ruta materno: '+$('dir-ruta').value);ok($('dir-rem').value==='si','remisión sugerida');
 ok(/Formato de remisión/.test($('dir-rep').textContent)&&/Morbilidad materna extrema/.test($('dir-rep').textContent),'formatos');
 ok(/09 Registro de interconsulta/.test($('dir-rep').textContent)&&/10 Referencias/.test($('dir-rep').textContent),'soportes');
 ck('vsex');ok(/SIVIGILA/.test($('dir-rep').textContent)&&/Ficha 875/.test($('dir-rep').textContent),'sivigila violencia');
 $('dir-med').value='Pérez';$('dir-med').dispatchEvent(new Event('input'));$('dir-hora').value='10:30';$('dir-hora').dispatchEvent(new Event('input'));
 ok(/CONSULTA URGENTE\) CON DR\(A\)\. PÉREZ A LAS 10:30/.test($('dir-nota').value)&&/RUTA MATERNO PERINATAL/.test($('dir-nota').value)&&/SIVIGILA/.test($('dir-nota').value),'nota: '+$('dir-nota').value);
 $('dir-save').click();ok(tmPer().length===1&&tmPer()[0].pac==='ANA','registro guardado');
 $('dir-obl').click();ok(st.view==='obl'&&/09 Registro de interconsulta/.test($('app').textContent),'mapa de obligaciones');$('obl-back').click();ok(st.view==='dir','vuelve');
 /* morbilidad */
 mbOpen('malaria');const mb=document.querySelector('[data-mbdir="malaria"]');ok(mb,'botón en malaria');mb.click();ok(st.view==='dir'&&$('dir-ruta').value==='inf','desde malaria');
 /* pruebas */
 pzOpen();const s=document.querySelector('[data-pzr="sif"]');s.value='REACTIVA';s.dispatchEvent(new Event('change'));$('pz-dir').click();ok(document.querySelector('[data-tmc="prr"]').checked,'desde pruebas: prr marcado');
 /* ruta */
 S.set(key('prenatal','tab'),'guia');openMod('prenatal');if(st.tab!=='guia'){st.tab='guia';renderMod()}ok($('ruta-dir'),'botón en la guía de la ruta');$('ruta-dir').click();ok(st.view==='dir'&&/Prenatal/.test($('dir-back').textContent),'desde la ruta');
 ok(/data-andir="0"/.test(anHTML({riesgo:'alto',devolucion:'x',rutas:[{ruta:'Remisión hoy: trastorno hipertensivo del embarazo',accion:'a',porque:'b',cuando:'hoy'}]})),'análisis con botón');
 ok(dirRutaDe('Ruta de riesgo cardiovascular y metabólico')==='cv','dirRutaDe');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('telemedicina_rutas: 0 fallos');
await b.close()})();
