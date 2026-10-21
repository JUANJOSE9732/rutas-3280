// v181: casos para practicar (morbilidad).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 ok(CASOS.length>=20,'menos de 20 casos: '+CASOS.length);
 const ids=new Set();
 CASOS.forEach(c=>{ok(!ids.has(c.id),'id repetido '+c.id);ids.add(c.id);
  ok(MB.find(z=>z.id===c.mb),c.id+': ficha inexistente '+c.mb);ok(c.p&&c.t,c.id+': sin presentación');ok(c.q.length>=2,c.id+': menos de 2 preguntas');
  c.q.forEach((q,i)=>{ok(q.o.length>=3,c.id+' p'+(i+1)+': pocas opciones');ok(new Set(q.o).size===q.o.length,c.id+' p'+(i+1)+': opciones repetidas');
   ok(q.e&&q.q,c.id+' p'+(i+1)+': sin pregunta o explicación');ok(!q.f||q.f==='puesto'||MBF[q.f],c.id+' p'+(i+1)+': fuente inexistente '+q.f)})});
 /* inicio: mosaico */
 home();const t=$('t-ca');ok(t,'no aparece el mosaico de casos');if(!t)return F;t.click();ok(st.view==='casos','no abre la lista');
 ok(document.querySelectorAll('[data-cago]').length===CASOS.length,'lista incompleta');
 /* resolver un caso: 1.ª bien, 2.ª mal */
 const c=CASOS[0];document.querySelector(`[data-cago="${c.id}"]`).click();ok(st.view==='caso','no abre el caso');
 ok(document.querySelectorAll('[data-caop]').length===c.q[0].o.length,'opciones incompletas');
 document.querySelector('[data-caop="0"]').click();ok(/Correcto/.test($('ca-fb').textContent),'no marca correcta');
 ok($('ca-fb').textContent.includes(MBF[c.q[0].f]),'no cita la fuente');
 /* ver la ficha y volver */
 $('ca-fic').click();ok(st.view==='mb'&&document.querySelector(`details[data-mb="${c.mb}"]`).open,'no abre la ficha');
 $('mb-back').click();ok(st.view==='caso'&&/Pregunta 2/.test(document.querySelector('.tag').textContent),'no vuelve a la pregunta 2: '+document.querySelector('.tag').textContent);
 document.querySelector('[data-caop="1"]').click();ok(/No es esa/.test($('ca-fb').textContent),'no marca incorrecta');
 for(let i=2;i<c.q.length;i++){$('ca-next').click();document.querySelector('[data-caop="0"]').click()}
 $('ca-next').click();ok(/correctas/.test(document.body.textContent),'sin resultado');
 const P=caProg()[c.id];ok(P&&P.u===c.q.length-1&&P.n===c.q.length,'progreso mal guardado '+JSON.stringify(P));
 $('ca-lista').click();ok(document.querySelector('[data-caf="rep"]').textContent.includes('(1)'),'no cuenta el caso para repasar');
 /* botón en Morbilidad frecuente */
 mbOpen();ok($('mb-ca'),'falta el botón en Morbilidad frecuente');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('casos: 0 fallos');
await b.close()})();
