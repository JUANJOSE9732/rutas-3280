// v145: cuestionario VALE — instrumento obligatorio de 0 a 12 años 11 meses
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const monta=(mod,meses)=>{localStorage.clear();
  const d=pD(hoy());d.setUTCMonth(d.getUTCMonth()-meses);d.setUTCDate(d.getUTCDate()-2);
  setPac({'NOMBRE COMPLETO':'N','TIPO':'RC','DOCUMENTO ID.':'1',
          'FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':'M','__com':'Q'});
  st.mod=mod;S.set(key(mod,'fecha'),hoy())};
 const set=o=>S.set(key(st.mod,'vale'),JSON.stringify(o));
 const H=()=>WIDGET.vale.html(st.mod);
 const T=()=>WIDGET.vale.txt(st.mod);

 /* ===== 1. el ítem está en los tres módulos que cubren 0 a 12 años ===== */
 ['pinf','inf','adol'].forEach(m=>{
  monta(m,m==='pinf'?24:m==='inf'?96:150);
  const q=ivFor(m),i=q.findIndex(z=>/VALE/.test(z.l||''));
  ok(i>=0,'el VALE no está en la lista de '+m);
  if(i>=0)ok(ivAplica(m,i),'el VALE no aplica en '+m+' a esa edad')});
 // y se apaga pasados los 12 años 11 meses
 monta('adol',170);
 const qa=ivFor('adol'),ia=qa.findIndex(z=>/VALE/.test(z.l||''));
 ok(!ivAplica('adol',ia),'a los 14 años el VALE no debía aplicar');

 /* ===== 2. el rango de edad se elige solo ===== */
 const rango=(mod,m)=>{monta(mod,m);const h=H();
  const L=(h.match(/class="cnt">([^<]*)</g)||[]).map(x=>x.replace(/^class="cnt">/,'').replace(/<$/,''));
  return {incluye:t=>L.some(x=>x===t), lista:L.join(' | ')}};
 ok(rango('pinf',1).incluye('0 a 3 meses'),'1 mes debía caer en 0 a 3 meses');
 ok(rango('pinf',5).incluye('4 a 6 meses'),'5 meses debía caer en 4 a 6 meses');
 ok(rango('pinf',8).incluye('7 a 9 meses'),'8 meses debía caer en 7 a 9 meses');
 ok(rango('pinf',20).incluye('19 a 24 meses'),'20 meses debía caer en 19 a 24 meses');
 ok(rango('pinf',40).incluye('3 años 1 mes a 4 años'),'40 meses debía caer en 3 años 1 mes a 4 años');
 ok(rango('inf',100).incluye('5 años 1 mes a 9 años'),'100 meses debía caer en 5 años 1 mes a 9 años');
 ok(rango('adol',150).incluye('9 años 1 mes a 12 años 11 meses'),'150 meses debía caer en el último rango');

 /* ===== 3. los factores de riesgo solo en menores de 2 años ===== */
 monta('pinf',12);ok(/Factores de riesgo/.test(H()),'a los 12 meses debían pedirse los factores de riesgo');
 monta('pinf',30);ok(!/Factores de riesgo/.test(H()),'a los 30 meses no debían pedirse los factores de riesgo');

 /* ===== 4. el vestibular solo desde los 3 años ===== */
 monta('pinf',30);ok(!/Vestibular/.test(H()),'a los 30 meses no debía aparecer el ítem vestibular');
 monta('pinf',40);ok(/Vestibular/.test(H()),'a los 40 meses debía aparecer el ítem vestibular');
 ok(rango('pinf',40).incluye('3 a 5 años'),'a los 40 meses el vestibular debía ser del rango 3 a 5 años');
 ok(rango('inf',100).incluye('5 años 1 mes a 12 años 11 meses'),'a los 100 meses el vestibular debía ser del rango mayor');

 /* ===== 5. sin marcar nada no hay nota ===== */
 monta('pinf',20);set({});
 ok(T()==='','sin marcar nada la nota debía quedar vacía');

 /* ===== 6. la cascada: un «no» abre la misma categoría del rango anterior ===== */
 monta('pinf',20);           // rango 19 a 24 meses, índice 6
 set({c6:0});
 let h=H();
 ok(/Rango anterior \(16 a 18 meses\)/.test(h),'un «no» en comprensión debía abrir el rango anterior: '+(h.match(/Rango anterior[^<]*/)||[''])[0]);
 ok(!/Rango anterior \(13 a 15/.test(h),'no debía saltar dos rangos de una vez');
 set({c6:0,c5:0});
 ok(/Rango anterior \(13 a 15 meses\)/.test(H()),'dos «no» seguidos debían bajar otro rango');
 set({c6:0,c5:1});
 ok(!/Rango anterior \(13 a 15/.test(H()),'al obtener un «sí» la cascada debía parar');
 // la cascada es por categoría, no arrastra a las demás
 set({c6:0});h=H();
 ok(!/Rango anterior[\s\S]*Rango anterior/.test(h),'la cascada de comprensión no debía abrir también expresión e interacción');

 /* ===== 7. criterios de remisión ===== */
 monta('pinf',20);
 // un factor de riesgo en menor de 2 años remite
 set({r1:1});
 ok(/Se remite a fonoaudiología y audiología/.test(T()),'un factor de riesgo debía remitir: '+T());
 ok(/bajo peso al nacer/i.test(T()),'no nombra el factor de riesgo');
 // una condición estructural alterada remite
 set({e0_i:0});
 ok(/Se remite a fonoaudiología/.test(T()),'una alteración estructural debía remitir: '+T());
 ok(/orejas/i.test(T()),'no nombra la estructura alterada');
 // dos negativas remiten de forma urgente
 set({c6:0,c5:1,e6:0,e5:1});
 let t=T();
 ok(/Total de respuestas negativas: 2/.test(t),'debía contar 2 negativas: '+t);
 ok(/urgente/.test(t),'dos negativas debían ser remisión urgente');
 // una sola negativa resuelta en el rango anterior no remite por sí sola
 set({c6:0,c5:1,e6:1,i6:1});
 t=T();
 ok(/Total de respuestas negativas: 1/.test(t),'debía contar 1 negativa: '+t);
 ok(/No cumple criterios de remisión/.test(t),'una sola negativa no debía remitir: '+t);
 // todo bien
 set({c6:1,e6:1,i6:1,r1:0,r2:0,r3:0,r4:0,r5:0});
 t=T();
 ok(/Sin factores de riesgo perinatales/.test(t),'no declara la ausencia de factores de riesgo');
 ok(/acordes a la edad/.test(t),'no declara que las tres categorías están acordes');
 ok(/No cumple criterios de remisión/.test(t),'sin hallazgos no debía remitir');

 /* ===== 8. el vestibular cuenta en el total ===== */
 monta('pinf',40);
 set({c8:0,c7:1,v0:0});
 t=T();
 ok(/Total de respuestas negativas: 2/.test(t),'el vestibular negativo debía sumar al total: '+t);
 ok(/[Íi]tem vestibular negativo/.test(t),'no declara el vestibular negativo');
 set({c8:1,e8:1,i8:1,v0:1});
 ok(/vestibular acorde a la edad/.test(T()),'no declara el vestibular normal');

 /* ===== 9. la nota nombra el rango y el instrumento ===== */
 monta('inf',100);set({c10:1,e10:1,i10:1});
 t=T();
 ok(/Cuestionario VALE/.test(t),'la nota no nombra el instrumento');
 ok(/5 años 1 mes a 9 años/.test(t),'la nota no nombra el rango de edad: '+t);

 /* ===== 10. la pantalla se arma sin romperse en todas las edades ===== */
 [[ 'pinf',0],['pinf',3],['pinf',6],['pinf',12],['pinf',18],['pinf',24],['pinf',36],['pinf',48],['pinf',60],
  ['inf',72],['inf',96],['inf',132],['adol',144],['adol',155]].forEach(([mod,m])=>{
  monta(mod,m);set({});
  let x='';try{x=H()}catch(e){ok(false,'html() falló en '+mod+' a los '+m+' meses: '+e.message)}
  ok(x.length>600,'HTML corto en '+mod+' a los '+m+' meses');
  ok(!/undefined|NaN|\[object/.test(x),'HTML con undefined o NaN en '+mod+' a los '+m+' meses');
  try{WIDGET.vale.txt(mod)}catch(e){ok(false,'txt() falló en '+mod+' a los '+m+' meses: '+e.message)}});

 /* ===== 11. sin fecha de nacimiento avisa en vez de romperse ===== */
 localStorage.clear();
 setPac({'NOMBRE COMPLETO':'N','TIPO':'RC','DOCUMENTO ID.':'1','GENERO':'M','__com':'Q'});
 st.mod='pinf';S.set(key('pinf','fecha'),hoy());
 ok(/Falta la fecha de nacimiento/.test(H()),'sin fecha de nacimiento debía avisar');
 ok(WIDGET.vale.txt('pinf')==='','sin fecha de nacimiento la nota debía quedar vacía');

 /* ===== 12. la pauta advierte que la redacción es aproximada ===== */
 monta('pinf',20);
 ok(/redacción es aproximada/i.test(H()),'la pantalla no advierte que la redacción es aproximada');
 const pa=(IVX['pinf::Audición y comunicación (VALE)']||{}).pauta;
 ok(pa&&/obligatorio/i.test(pa.t+' '+(pa.p||[]).join(' ')),'la pauta no dice que el instrumento es obligatorio');
 ok(pa&&(pa.p||[]).some(x=>/rango anterior/i.test(x)),'la pauta no explica la cascada');

 return F});
await b.close();
if(R.length){console.log('FALLOS ('+R.length+'):');R.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('vale: 0 fallos');
})();
