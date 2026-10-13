// Verifica la cadena completa: widget -> nota -> extraerLocal -> columnas -> cola de envío
// Simula una consulta de vejez y otra de adultez completas y revisa qué llega a cada eslabón.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const fails=[],info={};
 const ok=(c,m)=>{if(!c)fails.push(m)};

 /* --- monta una consulta de vejez con los instrumentos llenos --- */
 localStorage.clear();
 const d=new Date();d.setUTCFullYear(d.getUTCFullYear()-78);
 const FN=d.toISOString().slice(0,10),F=hoy();
 setPac({'NOMBRE COMPLETO':'MARIA YEPES','TIPO':'CC','DOCUMENTO ID.':'11223344','FECHA NACIMIENTO':FN,
         'GENERO':'F','__com':'MITÚ','ETNIA':'INDIGENA','PUEBLO':'CUBEO'});
 st.mod='vej';st.view='mod';st.tab='entr';S.set(key('vej','fecha'),F);
 const q=ivFor('vej'),a={};
 const idx=re=>q.findIndex(z=>re.test(z.l||''));

 // instrumentos nuevos
 S.set(key('vej','bar'),JSON.stringify({com:"10",tra:"10",ase:"5",ret:"5",ban:"0",des:"10",esc:"5",ves:"5",hec:"10",ori:"5"}));
 S.set(key('vej','law'),JSON.stringify({tel:"1",cmp:"0",coc:"0",cas:"1",rop:"1",tpt:"0",med:"0",din:"1"}));
 S.set(key('vej','fri'),JSON.stringify({pes:"1",ago:"1",act:"1",mar:"0",deb:"1"}));
 S.set(key('vej','tug'),JSON.stringify({seg:"18"}));
 S.set(key('vej','caf'),JSON.stringify({cai:1,med:1,cas:1}));
 S.set(key('vej','mms'),JSON.stringify({ori:"3",orl:"4",fij:"3",cal:"2",rec:"1",nom:"2",rep:"1",ord:"2",dib:"0",__esc:"17"}));
 S.set(key('vej','apg'),JSON.stringify({ada:"1",par:"1",cre:"0",afe:"1",res:"2"}));
 S.set(key('vej','zar'),JSON.stringify({z1:"3",z2:"3",z3:"2",z4:"3",z5:"3",z6:"2",z7:"3"}));
 S.set(key('vej','fdr'),JSON.stringify({edad:"4",imc:"1",cint:"4",act:"2",fru:"1",hta:"2",glu:"0",fam:"3",__oms:"20-30"}));

 // escribe en el array de respuestas lo que produciría cada widget
 const WMAP={funcional:1,caidas:1,cogvej:1,apoyo:1,findrisc:1};
 q.forEach((x,i)=>{if(x.widget&&WMAP[x.widget])a[i]=WIDGET[x.widget].txt('vej')});
 // respuestas de texto que alimentan otras columnas
 const put=(re,v)=>{const k=idx(re);if(k>=0)a[k]=v;return k};
 // los módulos de curso de vida no tienen ítem "Enfermedades": queda documentado como hueco conocido
 info.vej_tiene_enfermedades=idx(/^Enfermedades/)>=0;
 put(/Estado nutricional/, 'Peso 48 kg, talla 1,52 m, IMC 20,8: normal. TA 150/92, FC 78, FR 18, temperatura 36,4, saturación 95 %.');
 info.vej_tiene_proximo_control=idx(/Próximo control/)>=0;
 S.set(key('vej','iv'),JSON.stringify(a));
 S.set(key('vej','dict'),ivCompose('vej'));

 /* ===== 1. la nota contiene los instrumentos ===== */
 const nota=ivCompose('vej');
 info.nota_len=nota.length;
 [['Barthel','Índice de Barthel \\(Anexo 25\\): 65/100'],
  ['Lawton','Lawton-Brody \\(Anexo 26\\): 4/8'],
  ['Fried','Fried \\(Anexo 27\\): 4/5'],
  ['Levántate y anda','Levántate y anda: 18 segundos'],
  ['Minimental','Minimental \\(Anexo 28\\): 18/30'],
  ['APGAR','APGAR familiar: 5/10'],
  ['Zarit','Zarit reducida.*: 19/28'],
  ['FINDRISC','FINDRISC \\(Anexo 18\\): 17/26'],
  ['OMS','tablas de la OMS \\(Anexo 19\\)']]
 .forEach(([n,re])=>ok(new RegExp(re).test(nota),'la nota no trae '+n+' (esperaba /'+re+'/)'));
 // los bloques de la nota están presentes
 ok(/VALORACIÓN/.test(nota),'la nota no tiene el bloque VALORACIÓN');
 ok(/DETECCIÓN TEMPRANA/i.test(nota),'la nota no tiene el bloque de detección temprana');

 /* ===== 2. fuenteHC entrega la nota a la base ===== */
 const fuente=fuenteHC('vej');
 ok(fuente.includes('Barthel'),'fuenteHC no incluye la nota de los instrumentos');
 ok(fuente.length>=nota.length,'fuenteHC devolvió menos que ivCompose');

 /* ===== 3. extraerLocal: qué columnas se llenan ===== */
 const col=extraerLocal('vej',fuente,F);
 info.columnas_llenas=Object.keys(col).sort();
 // las que SÍ deben llenarse
 ok(col['T. A']==='150/92','T.A mal extraída: '+col['T. A']);
 ok(col['F.C']==='78','FC mal: '+col['F.C']);
 ok(col['F. R']==='18','FR mal: '+col['F. R']);
 ok(col['TEM']==='36.4','TEM mal: '+col['TEM']);
 ok(col['SPO2']==='95','SPO2 mal: '+col['SPO2']);
 ok(col['PESO']==='48','PESO mal: '+col['PESO']);
 ok(col['TALLA']==='1.52','TALLA mal: '+col['TALLA']);
 ok(col['ATENCION INTEGRAL ENFERMERIA']==='SI','no marca atención de enfermería');
 ok(col['ATENCION INTEGRAL ENFERMERIA FECHA ULTIMO CONTROL']===F,'fecha de atención mal');
 ok(col['FECHA']===F,'FECHA mal');
 ok(col['FECHA PROXIMO CONTROL'],'no calcula la fecha de próximo control');
 ok(col['OBSERVACION'],'no arma la observación');

 /* ===== 4. ningún falso positivo por el texto de los instrumentos ===== */
 // el FINDRISC habla de "riesgo de diabetes" y "desarrollará diabetes": no debe marcar DIABETES=SI
 ok(col['DIABETES']!=='SI','FALSO POSITIVO: marcó DIABETES=SI por el texto del FINDRISC');
 ok(col['PLANIFICACION FAMILIAR O CONTROL']!=='SI','FALSO POSITIVO: marcó planificación familiar en una persona de 78 años');
 // los crónicos solo se llenan donde hay ítem que los pregunte (precon y prenatal)
 ['HTA','DIABETES','EPOC','CANCER','HIPER O HIPOTIROIDISMO'].forEach(k=>
   ok(col[k]===undefined,k+' se llenó en vejez sin que exista ítem que lo pregunte: '+col[k]));

 /* ===== 4b. RIESGO CARDIOVASCULAR y CANALIZADO A (v137) ===== */
 ok(col['RIESGO CARDIOVASCULAR']==='SI','RCV no llega a la columna con OMS 20-30 %: '+col['RIESGO CARDIOVASCULAR']);
 const can=(col['CANALIZADO A']||'').split(', ');
 ok(can.includes('MEDICINA GENERAL'),'CANALIZADO A no incluye MEDICINA GENERAL pese a "se remite a medicina": '+col['CANALIZADO A']);
 ok(can.includes('PSICOLOGIA'),'CANALIZADO A no incluye PSICOLOGIA pese a la sobrecarga del cuidador: '+col['CANALIZADO A']);
 const OPCAN=ALLF.find(x=>x.k==='CANALIZADO A').o;
 can.forEach(v=>ok(OPCAN.includes(v),'CANALIZADO A produce "'+v+'", que no está en la lista de opciones'));
 ok(new Set(can).size===can.length,'CANALIZADO A trae valores repetidos: '+col['CANALIZADO A']);

 // la tabla de la OMS manda sobre el FINDRISC
 S.set(key('vej','fdr'),JSON.stringify({edad:"4",imc:"3",cint:"4",act:"2",fru:"1",hta:"2",glu:"5",fam:"5",__oms:"<10"}));
 ok(extraerLocal('vej',fuenteHC('vej'),F)['RIESGO CARDIOVASCULAR']==='NO','con OMS <10 % el RCV debía ser NO aunque el FINDRISC sea alto');
 // FINDRISC alto sin tabla de la OMS afirma el riesgo
 S.set(key('vej','fdr'),JSON.stringify({edad:"4",imc:"3",cint:"4",act:"2",fru:"1",hta:"0",glu:"0",fam:"0"}));
 ok(extraerLocal('vej',fuenteHC('vej'),F)['RIESGO CARDIOVASCULAR']==='SI','FINDRISC 14 sin OMS debía afirmar el riesgo');
 // FINDRISC bajo sin tabla de la OMS NO descarta el riesgo cardiovascular: la columna queda vacía
 S.set(key('vej','fdr'),JSON.stringify({edad:"0",imc:"0",cint:"0",act:"0",fru:"0",hta:"0",glu:"0",fam:"0"}));
 ok(extraerLocal('vej',fuenteHC('vej'),F)['RIESGO CARDIOVASCULAR']===undefined,'FINDRISC bajo no debía descartar por sí solo el riesgo cardiovascular');
 // sin instrumento aplicado la columna no se inventa
 S.set(key('vej','fdr'),JSON.stringify({}));
 ok(extraerLocal('vej',fuenteHC('vej'),F)['RIESGO CARDIOVASCULAR']===undefined,'sin FINDRISC ni OMS la columna RCV debía quedar vacía');
 S.set(key('vej','fdr'),JSON.stringify({edad:"4",imc:"1",cint:"4",act:"2",fru:"1",hta:"2",glu:"0",fam:"3",__oms:"20-30"}));

 // una frase negada no debe canalizar (nota limpia: solo la frase bajo prueba)
 const kpc=q.findIndex(z=>/Educación individual/.test(z.l||''));
 ok(kpc>=0,'no hay ítem donde escribir la frase de prueba de canalización');
 const soloNota=t=>{S.set(key('vej','iv'),JSON.stringify({[kpc]:t}));S.set(key('vej','dict'),ivCompose('vej'));
   return extraerLocal('vej',fuenteHC('vej'),F)};
 ok(!(soloNota('No se remite a medicina por ahora. Control en 3 meses.')['CANALIZADO A']||'').includes('MEDICINA GENERAL'),
   'FALSO POSITIVO: "No se remite a medicina" canalizó a medicina general');
 ok(!(soloNota('La familia no acepta la remisión a medicina. Control en 3 meses.')['CANALIZADO A']||'').includes('MEDICINA GENERAL'),
   'FALSO POSITIVO: "no acepta la remisión" canalizó a medicina general');
 ok(soloNota('Control en 3 meses.')['CANALIZADO A']===undefined,'sin remisiones CANALIZADO A debía quedar vacía');
 // y la frase afirmativa sí canaliza
 ok((soloNota('Se remite a medicina para valoración. Control en 3 meses.')['CANALIZADO A']||'').includes('MEDICINA GENERAL'),
   'una remisión afirmativa no canalizó a medicina general');
 S.set(key('vej','iv'),JSON.stringify(a));S.set(key('vej','dict'),ivCompose('vej'));

 /* ===== 5. columnas que EXISTEN pero quedan vacías pese a haber dato ===== */
 const COLS=colsDe();
 const huecos=[];
 const hallazgo={
  'PSICOLOGIA':/ruta de salud mental|sobrecarga intensa/i,
  'NUTRICION':/proteína|alimentación/i};
 Object.entries(hallazgo).forEach(([c,re])=>{
  ok(COLS.includes(c),'la columna '+c+' ya no existe en el Excel');
  if(COLS.includes(c)&&re.test(fuente)&&!col[c])huecos.push(c)});
 info.huecos=huecos;

 /* ===== 6. el registro se guarda y entra a la cola con TODAS las columnas ===== */
 const reg=Object.assign({},col,{'NOMBRE COMPLETO':'MARIA YEPES','DOCUMENTO ID.':'11223344','TIPO':'CC',
   'FECHA NACIMIENTO':FN,'GENERO':'F','ETNIA':'INDIGENA','PUEBLO':'CUBEO'});
 const RID='test-'+Date.now();
 setCola(cola().concat([{id:RID,comunidad:'MITÚ',datos:reg,fecha:F}]));
 const enCola=cola().find(r=>r.id===RID);
 ok(enCola,'el registro no entró a la cola');
 ok(enCola&&enCola.datos&&enCola.datos['T. A']==='150/92','la cola perdió los signos vitales');
 const todos=registrosTodos();
 ok(todos.some(r=>r.id===RID),'registrosTodos no ve el registro encolado');

 /* ===== 7. la atención queda en el historial del paciente ===== */
 pacienteAtencion('vej','MITÚ',Object.assign({},reg,{FECHA:F}),RID);
 const ps=pacientes(),pk=Object.keys(ps).find(k=>JSON.stringify(ps[k]).includes('11223344'));
 ok(pk,'el paciente no quedó en el historial');
 if(pk){const at=ps[pk].aten||[];ok(at.length>=1,'no se guardó la atención');
  const ult=at[at.length-1];
  ok(ult&&ult.fecha===F,'la atención quedó con fecha equivocada');
  info.antro_guardada=ult&&ult.antro||null;}

 /* ===== 8. ADULTEZ: el FINDRISC también llega ===== */
 localStorage.clear();
 const d2=new Date();d2.setUTCFullYear(d2.getUTCFullYear()-52);
 setPac({'NOMBRE COMPLETO':'JORGE MEJIA','TIPO':'CC','DOCUMENTO ID.':'55667788',
         'FECHA NACIMIENTO':d2.toISOString().slice(0,10),'GENERO':'M','__com':'MITÚ'});
 st.mod='adul';st.tab='entr';S.set(key('adul','fecha'),F);
 S.set(key('adul','fdr'),JSON.stringify({edad:"2",imc:"3",cint:"4",act:"2",fru:"1",hta:"2",glu:"5",fam:"5",__oms:"30+"}));
 const qa=ivFor('adul'),aa={};
 qa.forEach((x,i)=>{if(x.widget==='findrisc')aa[i]=WIDGET.findrisc.txt('adul')});
 const ke=qa.findIndex(z=>/^Enfermedades/.test(z.l||''));if(ke>=0)aa[ke]='Niega enfermedades crónicas.';
 info.adul_tiene_examenes=qa.some(z=>/Exámenes solicitados/.test(z.l||''));
 S.set(key('adul','iv'),JSON.stringify(aa));
 const nota2=ivCompose('adul');
 ok(/FINDRISC \(Anexo 18\): 24\/26/.test(nota2),'adultez: el FINDRISC no llega a la nota: '+nota2.slice(0,200));
 ok(/muy alto/.test(nota2),'adultez: no clasifica el riesgo muy alto');
 const col3=extraerLocal('adul',fuenteHC('adul'),F);
 ok(col3['DIABETES']!=='SI','FALSO POSITIVO en adultez: el FINDRISC marcó DIABETES=SI');
 ok(col3['RIESGO CARDIOVASCULAR']==='SI','adultez: el RCV no llega a la columna con OMS 30 %+');
 ok((col3['CANALIZADO A']||'').includes('MEDICINA GENERAL'),'adultez: la remisión a la ruta cardio no canaliza a medicina: '+col3['CANALIZADO A']);
 info.adultez_cols=Object.keys(col3).sort();

 /* ===== 9. toda columna producida existe realmente en el Excel ===== */
 [col,col3].forEach((c,n)=>Object.keys(c).forEach(k=>
   ok(COLS.includes(k),'extraerLocal produce la columna "'+k+'" que no existe en el Excel (caso '+(n+1)+')')));

 return {fails,info};
});
await b.close();
const {fails,info}=R;
console.log('--- columnas llenadas en vejez ('+info.columnas_llenas.length+') ---');
console.log(info.columnas_llenas.join(' | '));
if(info.huecos&&info.huecos.length){console.log('\n--- HUECOS: la columna existe y hay dato en la nota, pero queda vacía ---');
 info.huecos.forEach(h=>console.log(' *',h));}
if(info.vej_tiene_enfermedades===false)console.log(' * vejez no tiene ítem "Enfermedades": HTA, DIABETES, EPOC, CANCER y TIROIDES se llenan a mano');
if(info.adul_tiene_examenes===false)console.log(' * adultez no tiene ítem "Exámenes solicitados": SE REALIZO LABORATORIOS se llena a mano');
if(errs.length)console.log('\nERRORES DE PÁGINA:',errs.join(' | '));
if(fails.length){console.log('\nFALLOS ('+fails.length+'):');fails.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('\ne2e_base_datos: 0 fallos');
})();
