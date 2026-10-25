// v210: la pregunta de exámenes prenatal muestra puesto (resultado inmediato), remisión, pendientes, más adelante y ventana pasada.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const P={'NOMBRE COMPLETO':'ANA','TIPO':'CC','DOCUMENTO ID.':'1','GENERO':'F','FECHA NACIMIENTO':'1999-01-01','EAPB NOMBRE':'X','RÉGIMEN':'SUBSIDIADO','CAPITADO':'SI','TELEFONO':'N/A','ETNIA':'NINGUNA',__com:'Q',__est:'ges'};setPac(P);
 const o=gexGet(P);o._egm={f:hoy(),w:6.4};gexSet(o,P);
 const q=ivFor('prenatal'),k=q.findIndex(z=>z.sugEx);ok(k>=0,'pregunta de exámenes');S.set(key('prenatal','ivi'),String(k));openMod('prenatal');st.tab='entr';renderMod();
 const box=$('exs');ok(/En el puesto · resultado inmediato/.test(box.textContent)&&/Se remiten/.test(box.textContent)&&/Más adelante/.test(box.textContent),'grupos');
 const s=box.querySelector('[data-exr="vih"]');s.value='NO REACTIVA';box.querySelector('[data-exh="vih"]').click();
 ok(/Pruebas en el puesto hoy: Prueba rápida de VIH: no reactiva\./.test($('iv-a').value),'texto del puesto: '+$('iv-a').value);
 $('exs-eall').click();ok(/Se solicitan en orden de remisión \(no disponibles en la zona\): Hemoclasificación/.test($('iv-a').value),'texto de remisión: '+$('iv-a').value);
 ok(gexCalc(P).R.filter(z=>z.g==='rem').length===0&&gexCalc(P).R.some(z=>z.g==='pend'),'quedan pendientes en el control');
 ok(($('iv-a').value.match(/Pruebas en el puesto hoy/g)||[]).length===1,'no repite el bloque');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('examenes_pregunta: 0 fallos');
await b.close()})();
