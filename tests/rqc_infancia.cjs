// v142: en infancia el RQC es sugerido y condicionado a los riesgos, no una tarea fija
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const monta=()=>{localStorage.clear();
  const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-9);
  setPac({'NOMBRE COMPLETO':'JOSÉ LARA','TIPO':'RC','DOCUMENTO ID.':'5',
          'FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':'M','__com':'QUERARÍ'});
  st.mod='inf';S.set(key('inf','fecha'),hoy())};
 const set=o=>{monta();S.set(key('inf','rqc'),JSON.stringify(o))};
 const txt=()=>WIDGET.rqc.txt('inf');
 const html=()=>WIDGET.rqc.html('inf');

 /* ===== 1. sin tocar nada no produce nota ===== */
 monta();
 ok(txt()==='','sin marcar nada no debía producir texto: "'+txt()+'"');

 /* ===== 2. los riesgos van primero y el RQC queda cerrado ===== */
 monta();
 const h0=html();
 ok(h0.indexOf('Riesgos psicosociales')<h0.indexOf('Cuestionario de Reporte'),
    'los riesgos deben ir antes del RQC');
 const sec=h0.match(/<details class="sec"[^>]*>/g)||[];
 ok(sec.length>=2,'faltan las dos secciones');
 ok(/open/.test(sec[0]),'la sección de riesgos debía venir abierta');
 ok(!/open/.test(sec[1]),'sin riesgos, el RQC NO debía venir abierto');
 ok(/sugerido/i.test(h0),'no dice que el RQC es un instrumento sugerido');
 ok(/solo si hay riesgo/i.test(h0),'el encabezado del RQC no dice que es condicional');

 /* ===== 3. al marcar un riesgo, el RQC se abre y se sugiere ===== */
 set({v:1});
 const h1=html(),sec1=h1.match(/<details class="sec"[^>]*>/g)||[];
 ok(/open/.test(sec1[1]),'con un riesgo marcado el RQC debía abrirse');
 ok(/se sugiere aplicarlo/i.test(h1),'no sugiere aplicar el RQC cuando hay riesgo');

 /* ===== 4. los riesgos nuevos del protocolo existen ===== */
 const ks=RQC_X.map(x=>x[0]);
 ['v','a','s','d','p','e','c'].forEach(k=>ok(ks.includes(k),'falta el riesgo "'+k+'" en la lista'));
 ok(RQC_X.length===7,'la lista de riesgos debía tener 7 ítems, tiene '+RQC_X.length);
 // y los antiguos conservan su clave, para no perder registros ya guardados
 ok(/violencia o maltrato/i.test(RQC_X.find(x=>x[0]==='v')[1]),'la clave v cambió de significado');
 ok(/[Aa]coso escolar/.test(RQC_X.find(x=>x[0]==='a')[1]),'la clave a cambió de significado');

 /* ===== 5. sin riesgos y declarado así: nota cerrada, sin instrumento ===== */
 set({__sr:1});
 let t=txt();
 ok(/sin señales de violencia/i.test(t),'no redacta la valoración sin hallazgos: '+t);
 ok(/No se aplica el RQC/.test(t),'no deja constancia de por qué no se aplicó: '+t);
 ok(/sugerido/i.test(t),'la nota no explica que el instrumento es sugerido');
 ok(!/positivo|negativo, 0 de 10/.test(t),'sin aplicarlo no debía hablar de resultado');

 /* ===== 6. con riesgo pero sin aplicar el RQC, queda pendiente ===== */
 set({a:1});
 t=txt();
 ok(/acoso escolar/i.test(t),'no lista el riesgo marcado: '+t);
 ok(/pendiente aplicar el RQC/i.test(t),'con riesgo y sin RQC debía quedar pendiente: '+t);
 ok(/informar al colegio/i.test(t),'no trae la conducta del acoso escolar');

 /* ===== 7. RQC aplicado y negativo ===== */
 const todas0={};for(let i=0;i<10;i++)todas0['q'+i]=0;
 set(Object.assign({v:1},todas0));
 t=txt();
 ok(/negativo, 0 de 10/.test(t),'RQC todo en no debía ser negativo: '+t);
 ok(!/quedaron .* sin marcar/.test(t),'con las 10 marcadas no debía decir que faltan');
 ok(/ruta de atención a víctimas/i.test(t),'con violencia marcada debe activar la ruta');

 /* ===== 8. RQC positivo remite ===== */
 set(Object.assign({e:1},todas0,{q7:1}));
 t=txt();
 ok(/positivo, 1 de 10/.test(t),'una afirmativa debía dar positivo 1 de 10: '+t);
 ok(/retardado o lento para aprender/i.test(t),'no cita la pregunta afirmativa');
 ok(/ruta de problemas y trastornos mentales/i.test(t),'el RQC positivo debe remitir');
 ok(/Goodenough/.test(t),'con dificultades escolares debía sugerir el test de Goodenough');

 /* ===== 9. convulsiones: prioridad médica ===== */
 set(Object.assign({v:1},todas0,{q2:1}));
 t=txt();
 ok(/epilepsia/i.test(t),'las convulsiones debían mencionar posible epilepsia: '+t);
 ok(/prioritaria/i.test(t),'las convulsiones debían pedir valoración prioritaria');

 /* ===== 10. RQC incompleto se declara ===== */
 set({v:1,q0:0,q1:0});
 t=txt();
 ok(/quedaron 8 preguntas sin marcar/.test(t),'no avisa de las preguntas sin marcar: '+t);

 /* ===== 11. marcar un riesgo anula el "sin riesgos" ===== */
 set({__sr:1,s:1});
 t=txt();
 ok(/consumo/i.test(t),'el riesgo marcado debía aparecer aunque esté el "sin riesgos"');
 ok(!/No se aplica el RQC/.test(t),'con un riesgo no debía decir que no se aplica');

 /* ===== 12. la pauta ya no ordena el RQC como tarea fija ===== */
 const pa=(IVX['inf::Salud mental, violencias, acoso']||{}).pauta;
 ok(pa,'desapareció la pauta del ítem');
 const pt=(pa.p||[]).join(' ');
 ok(/sugerido/.test(pt),'la pauta no dice que el RQC es sugerido');
 ok(!/^Aplica el RQC/.test((pa.p||[])[0]||''),'la pauta sigue ordenando aplicar el RQC de entrada');
 ok(/Primero pregunta los riesgos/.test(pt),'la pauta no pone los riesgos primero');

 /* ===== 13. el HTML se genera limpio ===== */
 [{},{v:1},Object.assign({v:1},todas0),{__sr:1}].forEach((o,i)=>{
  set(o);let h='';try{h=html()}catch(e){ok(false,'html() lanzó excepción en el caso '+i+': '+e.message)}
  ok(h.length>500,'el caso '+i+' generó HTML corto');
  ok(!/undefined|NaN|\[object/.test(h),'el caso '+i+' tiene undefined/NaN en el HTML')});

 /* ===== 14. adolescencia sigue con su propio widget ===== */
 ok((IVX['adol::Salud mental, consumo de sustancias, violencias']||{}).widget==='smental',
    'adolescencia debe seguir usando el widget de salud mental, no el RQC suelto');

 /* ===== 15. al tocar los botones de verdad (no escribiendo en el almacenamiento) ===== */
 monta();
 const host=document.createElement('div');host.id='iv-host';document.body.appendChild(host);
 const pintar=()=>{host.innerHTML=WIDGET.rqc.html('inf');WIDGET.rqc.wire('inf',()=>{})};
 pintar();
 // marcar "sin riesgos" y luego un riesgo: el "sin riesgos" debe quedar anulado
 const sr=host.querySelector('[data-rqsr]');
 ok(sr,'no se pintó la casilla de «sin riesgos»');
 sr.checked=true;sr.dispatchEvent(new Event('change'));
 ok(JSON.parse(S.get(key('inf','rqc'))||'{}').__sr===1,'la casilla no guardó el «sin riesgos»');
 const bV=host.querySelector('[data-rq="v"][data-val="1"]');
 ok(bV,'no se pintó el botón del riesgo de violencia');
 bV.click();
 const g=JSON.parse(S.get(key('inf','rqc'))||'{}');
 ok(g.v===1,'el clic no guardó el riesgo');
 ok(g.__sr===undefined,'marcar un riesgo debía anular el «sin riesgos»');
 ok(!/No se aplica el RQC/.test(WIDGET.rqc.txt('inf')),'tras marcar el riesgo la nota seguía diciendo que no se aplica');
 // tocar dos veces el mismo botón lo desmarca
 bV.click();
 ok(JSON.parse(S.get(key('inf','rqc'))||'{}').v===undefined,'tocar dos veces debía desmarcar el riesgo');
 // la pastilla de resultado se actualiza
 pintar();
 host.querySelector('[data-rq="a"][data-val="1"]').click();
 const pill=host.querySelector('#rq-p');
 ok(pill&&/riesgo/i.test(pill.textContent),'la pastilla no refleja el riesgo marcado: '+(pill?pill.textContent:''));
 ok(pill&&/high/.test(pill.className),'la pastilla con riesgo debía ir resaltada');
 host.remove();

 return F});
await b.close();
if(R.length){console.log('FALLOS ('+R.length+'):');R.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('rqc_infancia: 0 fallos');
})();
