// v146: el APGAR familiar en los seis momentos del curso de vida
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const MOD={pinf:3,inf:8,adol:15,juv:22,adul:40};
 const monta=(mod,anos)=>{localStorage.clear();
  const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-anos);d.setUTCDate(d.getUTCDate()-2);
  setPac({'NOMBRE COMPLETO':'N','TIPO':'CC','DOCUMENTO ID.':'1',
          'FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':'F','__com':'Q'});
  st.mod=mod;S.set(key(mod,'fecha'),hoy())};
 const set=(mod,o)=>S.set(key(mod,'apg'),JSON.stringify(o));
 const TODO={ada:'2',par:'2',cre:'2',afe:'2',res:'2'};

 /* ===== 1. el ítem existe en los cinco momentos que le faltaban ===== */
 Object.keys(MOD).forEach(mod=>{
  monta(mod,MOD[mod]);
  const q=ivFor(mod),i=q.findIndex(z=>/APGAR familiar/.test(z.l||''));
  ok(i>=0,'el APGAR familiar no está en la lista de '+mod);
  if(i>=0){
   ok(ivAplica(mod,i),'el APGAR no aplica en '+mod);
   ok(q[i].widget==='apgarfam','en '+mod+' el ítem no usa el widget apgarfam');
   ok(q[i].pauta&&/0 a 2/.test((q[i].pauta.p||[]).join(' ')),'en '+mod+' la pauta no dice la escala de 0 a 2')}});

 /* ===== 2. vejez conserva el suyo y NO se duplica ===== */
 monta('vej',70);
 const qv=ivFor('vej'),dup=qv.filter(z=>/APGAR familiar/.test(z.l||''));
 ok(dup.length===0,'en vejez no debía agregarse un segundo ítem: el APGAR vive dentro del bloque de apoyo');
 ok(qv.some(z=>z.widget==='apoyo'),'vejez perdió el bloque de apoyo que contiene su APGAR');

 /* ===== 3. es LA MISMA escala que la de vejez ===== */
 // mismo puntaje, misma clasificación en los seis módulos
 const clasif=(mod,o)=>{set(mod,o);return WIDGET[mod==='vej'?'apoyo':'apgarfam'].txt(mod)};
 const CASOS=[[TODO,'familia funcional',10],
              [{ada:'1',par:'1',cre:'1',afe:'1',res:'1'},'disfunción familiar leve',5],
              [{ada:'0',par:'0',cre:'0',afe:'1',res:'1'},'disfunción familiar grave',2]];
 CASOS.forEach(([o,esp,pts])=>{
  ['pinf','inf','adol','juv','adul','vej'].forEach(mod=>{
   monta(mod,MOD[mod]||70);
   const t=clasif(mod,o);
   ok(new RegExp(esp).test(t),mod+' con '+pts+'/10 debía decir «'+esp+'»: '+t);
   ok(new RegExp('APGAR familiar: '+pts+'/10').test(t),mod+' no reporta el puntaje '+pts+'/10: '+t)})});

 /* ===== 4. los puntos de corte exactos (7 y 4) ===== */
 monta('juv',22);
 ok(/familia funcional/.test(clasif('juv',{ada:'2',par:'2',cre:'2',afe:'1',res:'0'})),'7/10 debía ser funcional');
 ok(/disfunción familiar leve/.test(clasif('juv',{ada:'2',par:'2',cre:'1',afe:'1',res:'0'})),'6/10 debía ser disfunción leve');
 ok(/disfunción familiar leve/.test(clasif('juv',{ada:'2',par:'1',cre:'1',afe:'0',res:'0'})),'4/10 debía ser disfunción leve');
 ok(/disfunción familiar grave/.test(clasif('juv',{ada:'2',par:'1',cre:'0',afe:'0',res:'0'})),'3/10 debía ser disfunción grave');

 /* ===== 5. la conducta se deriva de la clasificación ===== */
 let t=clasif('juv',{ada:'0',par:'0',cre:'0',afe:'0',res:'0'});
 ok(/psicología y trabajo social/.test(t),'la disfunción grave debía remitir: '+t);
 ok(/violencia intrafamiliar/.test(t),'la disfunción grave debía hacer indagar violencia');
 t=clasif('juv',{ada:'1',par:'1',cre:'1',afe:'1',res:'1'});
 ok(/se orienta a la familia/.test(t),'la disfunción leve debía orientar: '+t);
 ok(!/psicología y trabajo social/.test(t),'la disfunción leve no debía remitir a psicología');
 t=clasif('juv',TODO);
 ok(!/se orienta|psicología/.test(t),'la familia funcional no debía generar conducta: '+t);

 /* ===== 6. incompleto se declara ===== */
 t=clasif('adul',{ada:'2',par:'2'});
 ok(/\(incompleto\)/.test(t),'un APGAR a medias debía declararse incompleto: '+t);
 ok(!/incompleto/.test(clasif('adul',TODO)),'con las 5 calificadas no debía decir incompleto');

 /* ===== 7. sin calificar nada no hay nota ===== */
 ok(clasif('adul',{})==='','sin calificar nada la nota debía quedar vacía');

 /* ===== 8. la pantalla dice a quién se le pregunta ===== */
 monta('pinf',3);
 ok(/cuidador/.test(WIDGET.apgarfam.html('pinf')),'en primera infancia debía decir que se le pregunta al cuidador');
 monta('adol',15);
 ok(/a solas/.test(WIDGET.apgarfam.html('adol')),'en adolescencia debía decir que se pregunta a solas');
 ok(/0 a 2 puntos cada una, total 0 a 10/.test(WIDGET.apgarfam.html('adol')),'la pantalla no deja claro cuál versión de la escala es');

 /* ===== 9. el widget se arma y se cablea sin romperse ===== */
 Object.keys(MOD).forEach(mod=>{
  monta(mod,MOD[mod]);set(mod,{});
  let h='';try{h=WIDGET.apgarfam.html(mod)}catch(e){ok(false,'html() falló en '+mod+': '+e.message)}
  ok(h.length>500,'HTML corto en '+mod);
  ok(!/undefined|NaN|\[object/.test(h),'HTML con undefined o NaN en '+mod);
  const host=document.createElement('div');host.id='h';document.body.appendChild(host);
  host.innerHTML=h;
  try{WIDGET.apgarfam.wire(mod,()=>{})}catch(e){ok(false,'wire() falló en '+mod+': '+e.message)}
  const sel=host.querySelectorAll('[data-gr^="apg."]');
  ok(sel.length===5,'en '+mod+' debían pintarse 5 preguntas, se pintaron '+sel.length);
  // calificar por la pantalla debe guardar y clasificar
  sel.forEach(s=>{s.value='0';s.dispatchEvent(new Event('change'))});
  ok(/disfunción familiar grave/.test(WIDGET.apgarfam.txt(mod)),'en '+mod+' calificar en pantalla no llegó a la nota');
  const pill=host.querySelector('[data-grp="apg"]');
  ok(pill&&/disfunción familiar grave/.test(pill.textContent),'en '+mod+' la pastilla no muestra la clasificación: '+(pill&&pill.textContent));
  host.remove()});

 /* ===== 10. la nota del módulo lo recoge ===== */
 monta('juv',22);
 const q=ivFor('juv'),i=q.findIndex(z=>/APGAR familiar/.test(z.l||''));
 set('juv',{ada:'0',par:'0',cre:'0',afe:'0',res:'0'});
 const a=ivAns('juv');a[i]=WIDGET.apgarfam.txt('juv');
 S.set(key('juv','iv'),JSON.stringify(a));
 const nota=ivCompose('juv');
 ok(/APGAR familiar: 0\/10/.test(nota),'la nota del módulo no recoge el APGAR: '+nota.slice(0,200));

 return F});
await b.close();
if(R.length){console.log('FALLOS ('+R.length+'):');R.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('apgar_familiar: 0 fallos');
})();
