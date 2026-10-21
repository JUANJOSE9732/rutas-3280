// v180: el botiquín dentro de cada ruta (pestaña Guía).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 Object.keys(M).forEach(k=>ok(RUTA_BQ[k],'ruta sin botiquín: '+k));
 Object.entries(RUTA_BQ).forEach(([k,x])=>{ok(M[k],'módulo inexistente '+k);(x.m||[]).concat((x.no||[]).map(z=>[z])).forEach(([id])=>ok(bqGet(id),k+': medicamento inexistente '+id))});
 const pers=(sx,a)=>{const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-a);setPac({'NOMBRE COMPLETO':'X','TIPO':'CC','DOCUMENTO ID.':'1','GENERO':sx,'FECHA NACIMIENTO':d.toISOString().slice(0,10),'EAPB NOMBRE':'X','PUEBLO':'CUBEO',__com:'QUERARI'})};
 Object.keys(RUTA_BQ).forEach(k=>{localStorage.clear();pers(k==='vej'?'M':'F',k==='pinf'?2:k==='inf'?8:k==='adol'?15:k==='vej'?70:k==='rn'?0:k==='adul'?40:25);
  S.set(key(k,'tab'),'guia');openMod(k);if(st.tab!=='guia'){st.tab='guia';renderMod()}
  const box=$('ruta-bq');ok(box,k+': no aparece el botiquín en la Guía (pestaña '+st.tab+')');if(!box)return;
  ok(box.querySelectorAll('li').length===RUTA_BQ[k].m.length,k+': lista incompleta')});
 /* prenatal: avisos de gestante aunque no esté marcada */
 localStorage.clear();pers('F',25);ok(rutaCtx('prenatal').es==='ges','prenatal no se toma como gestante');
 ok(/Gestante: contraindicado/.test(bqListaHTML({m:[['enala','x']]},rutaCtx('prenatal'))),'aviso de enalapril en prenatal');
 /* ir a la ficha y volver a la ruta */
 S.set(key('prenatal','tab'),'guia');openMod('prenatal');if(st.tab!=='guia'){st.tab='guia';renderMod()}
 $('ruta-bq').querySelector('[data-bqgo="calcio"]').click();ok(st.view==='bq'&&document.querySelector('details[data-bqd="calcio"]').open,'ficha del calcio');
 ok(/Prenatal/.test($('bq-back').textContent),'botón volver a la ruta');ok(document.querySelector('details[data-bqd="calcio"] [data-modgo="prenatal"]'),'la ficha muestra la ruta');
 $('bq-back').click();ok(st.view==='mod'&&st.mod==='prenatal'&&st.tab==='guia','vuelve a la guía prenatal: '+st.view+' '+st.mod+' '+st.tab);
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('botiquin_rutas: 0 fallos');
await b.close()})();
