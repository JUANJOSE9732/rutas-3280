// v136: verifica los instrumentos de medición de juventud, adultez y vejez
// Barthel, Lawton-Brody, Fried, Levántate y anda, Minimental, APGAR, Zarit, FINDRISC
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const res=await p.evaluate(()=>{
 const fails=[];
 const ok=(c,m)=>{if(!c)fails.push(m)};
 const setup=(id,edad,sx)=>{
  localStorage.clear();
  const d=new Date();d.setUTCFullYear(d.getUTCFullYear()-edad);
  setPac({'NOMBRE COMPLETO':'Prueba','TIPO':'CC','DOCUMENTO ID.':'1','FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':sx,'__com':'Q'});
  st.mod=id;st.view="mod";S.set(key(id,"fecha"),hoy());};
 const put=(id,k,o)=>S.set(key(id,k),JSON.stringify(o));

 /* ---------- 1. existencia y enganche ---------- */
 ["funcional","caidas","cogvej","apoyo","findrisc"].forEach(w=>{
  ok(WIDGET[w],"falta WIDGET."+w);
  if(WIDGET[w])["html","txt","wire"].forEach(f=>ok(typeof WIDGET[w][f]==="function",w+"."+f+" no es función"));});
 const ENG=[
  ["vej::Funcionalidad (actividades básicas e instrumentales)","funcional"],
  ["vej::Riesgo de caídas","caidas"],
  ["vej::Cognición y estado de ánimo","cogvej"],
  ["vej::Maltrato, abandono, red de apoyo","apoyo"],
  ["juv::Riesgo cardiovascular según clasificación: glicemia, perfil lipídico, creatinina, uroanálisis","findrisc"],
  ["adul::Riesgo cardiovascular y metabólico quinquenal: glicemia, perfil lipídico, creatinina, uroanálisis","findrisc"],
  ["vej::Riesgo cardiovascular: glicemia, perfil lipídico, creatinina, uroanálisis","findrisc"]];
 ENG.forEach(([k,w])=>{ok(IVX[k],"no existe el ítem "+k);if(IVX[k])ok(IVX[k].widget===w,k+" tiene widget "+IVX[k].widget+", esperado "+w);});
 // los ítems con widget no deben conservar chips (se duplicaría el texto)
 ENG.forEach(([k])=>{if(IVX[k])ok(!IVX[k].c,k+" conserva chips junto al widget")});
 // toda pauta debe traer texto
 ENG.forEach(([k])=>{const x=IVX[k];if(x&&x.pauta)ok(x.pauta.t&&x.pauta.p&&x.pauta.p.length>=3,k+" pauta incompleta")});

 /* ---------- 2. BARTHEL: puntajes y cortes ---------- */
 setup("vej",72,"F");
 const BARMAX={com:10,tra:15,ase:5,ret:10,ban:5,des:15,esc:10,ves:10,hec:10,ori:10};
 const bar=o=>{put("vej","bar",o);return WIDGET.funcional.txt("vej")};
 let t=bar(Object.fromEntries(Object.entries(BARMAX).map(([k,v])=>[k,String(v)])));
 ok(/Barthel \(Anexo 25\): 100\/100, independiente/.test(t),"Barthel 100 mal: "+t);
 ok(!/incompleto/.test(t),"Barthel completo marcado como incompleto");
 const casos=[[95,"dependencia leve"],[75,"dependencia moderada"],[40,"dependencia severa"],[10,"dependencia total"],[0,"dependencia total"]];
 casos.forEach(([meta,esp])=>{
  // construye una combinación que sume exactamente 'meta' con los ítems disponibles
  let resto=meta,o={};
  for(const [k,mx] of Object.entries(BARMAX)){const v=Math.min(mx,Math.floor(resto/5)*5);o[k]=String(v);resto-=v}
  const tot=Object.values(o).reduce((a,x)=>a+ +x,0);
  const r=bar(o);
  ok(new RegExp("Barthel \\(Anexo 25\\): "+tot+"/100").test(r),"Barthel suma mal, esperaba "+tot+": "+r);
  const esperado=tot===100?"independiente":tot>=91?"dependencia leve":tot>=61?"dependencia moderada":tot>=21?"dependencia severa":"dependencia total";
  ok(new RegExp(esperado).test(r),"Barthel "+tot+" clasificó mal (esperaba "+esperado+"): "+r);});
 // frontera exacta 91 y 61
 [[91,"dependencia leve"],[90,"dependencia moderada"],[61,"dependencia moderada"],[60,"dependencia severa"],[21,"dependencia severa"],[20,"dependencia total"]].forEach(([n,esp])=>{
  let resto=n,o={};for(const [k,mx] of Object.entries(BARMAX)){const v=Math.min(mx,resto);o[k]=String(v);resto-=v}
  const tot=Object.values(o).reduce((a,x)=>a+ +x,0);if(tot!==n)return;
  ok(new RegExp(esp).test(bar(o)),"Barthel frontera "+n+" debía ser "+esp);});
 // incompleto se marca
 ok(/incompleto/.test(bar({com:"10",tra:"15"})),"Barthel incompleto no se marca");
 // dependencia severa dispara remisión y cuidador
 ok(/sobrecarga del cuidador/.test(bar({com:"0",tra:"0",ase:"0",ret:"0",ban:"0",des:"0",esc:"0",ves:"0",hec:"0",ori:"0"})),"Barthel 0 no menciona cuidador");

 /* ---------- 3. LAWTON: lista las actividades perdidas ---------- */
 setup("vej",70,"F");
 put("vej","bar",{});
 put("vej","law",{tel:"1",cmp:"1",coc:"0",cas:"1",rop:"1",tpt:"0",med:"0",din:"1"});
 t=WIDGET.funcional.txt("vej");
 ok(/Lawton-Brody \(Anexo 26\): 5\/8/.test(t),"Lawton suma mal: "+t);
 ok(/dependencia instrumental moderada/.test(t),"Lawton 5 mal clasificado: "+t);
 ["preparar la comida","usar transporte","manejo de sus medicamentos"].forEach(x=>ok(t.toLowerCase().includes(x),"Lawton no lista '"+x+"': "+t));
 ok(!t.toLowerCase().includes("usar el teléfono"),"Lawton lista una actividad conservada");
 put("vej","law",{tel:"1",cmp:"1",coc:"1",cas:"1",rop:"1",tpt:"1",med:"1",din:"1"});
 ok(/8\/8, independiente/.test(WIDGET.funcional.txt("vej")),"Lawton 8 mal");

 /* ---------- 4. FRIED: 0 robusto, 1-2 prefrágil, 3+ frágil ---------- */
 setup("vej",68,"M");put("vej","law",{});
 const fri=o=>{put("vej","fri",o);return WIDGET.funcional.txt("vej")};
 ok(/Fried \(Anexo 27\): 0\/5, robusto/.test(fri({pes:"0",ago:"0",act:"0",mar:"0",deb:"0"})),"Fried 0 mal");
 t=fri({pes:"1",ago:"0",act:"0",mar:"0",deb:"0"});
 ok(/1\/5, prefrágil/.test(t)&&/Prefragilidad/.test(t),"Fried 1 mal: "+t);
 t=fri({pes:"1",ago:"1",act:"0",mar:"0",deb:"0"});
 ok(/2\/5, prefrágil/.test(t),"Fried 2 mal: "+t);
 t=fri({pes:"1",ago:"1",act:"1",mar:"0",deb:"0"});
 ok(/3\/5, frágil/.test(t)&&/valoración geriátrica integral/.test(t),"Fried 3 mal: "+t);
 ok(/5\/5, frágil/.test(fri({pes:"1",ago:"1",act:"1",mar:"1",deb:"1"})),"Fried 5 mal");
 ok(/pérdida de peso no intencional/i.test(fri({pes:"1",ago:"0",act:"0",mar:"0",deb:"0"})),"Fried no lista el criterio presente");

 /* ---------- 5. LEVÁNTATE Y ANDA: cortes ---------- */
 setup("vej",75,"F");
 const tug=(s,na)=>{put("vej","tug",{seg:s,na:na?1:0});put("vej","caf",{});return WIDGET.caidas.txt("vej")};
 ok(/8 segundos, normal/.test(tug("8")),"TUG 8 mal: "+tug("8"));
 ok(/sin riesgo de caídas/.test(tug("9,9")),"TUG 9,9 debía ser normal");
 ok(/en el límite/.test(tug("11")),"TUG 11 mal");
 ok(/riesgo de caídas/.test(tug("12"))&&/fisioterapia/.test(tug("12")),"TUG 12 mal");
 ok(/riesgo de caídas/.test(tug("20")),"TUG 20 mal");
 ok(/riesgo alto de caídas/.test(tug("21")),"TUG 21 mal");
 ok(/no se pudo realizar/i.test(tug("",1)),"TUG no aplicable mal");
 ok(/alto riesgo/.test(tug("",1)),"TUG no aplicable debía ser alto riesgo");
 // factores
 put("vej","tug",{seg:"9"});put("vej","caf",{med:1,pol:1,cas:1,vis:1,dos:1});
 t=WIDGET.caidas.txt("vej");
 ["revisar los medicamentos","riesgos de la vivienda","optometría","estudiar la causa"].forEach(x=>ok(t.includes(x),"Caídas no menciona '"+x+"': "+t));
 ok(/Riesgo alto de caída/.test(t),"5 factores + caída con lesión debía ser riesgo alto");
 put("vej","caf",{cas:1});t=WIDGET.caidas.txt("vej");
 ok(!/Riesgo alto de caída/.test(t),"1 factor con TUG normal no debía ser riesgo alto: "+t);
 // vacío no produce texto
 put("vej","tug",{seg:""});put("vej","caf",{});
 ok(WIDGET.caidas.txt("vej")==="","Caídas vacío debía dar texto vacío");

 /* ---------- 6. MINIMENTAL: corte según escolaridad ---------- */
 setup("vej",70,"F");
 const mm=(p,esc,na)=>{const o={ori:"5",orl:"5",fij:"3",cal:"5",rec:"3",nom:"2",rep:"1",ord:"3",lee:"1",esc:"1",dib:"1"};
  // baja el puntaje quitando de cálculo y recuerdo
  let falta=30-p,keys=["cal","ori","orl","ord","rec","nom"];
  for(const k of keys){if(falta<=0)break;const v=+o[k],q=Math.min(v,falta);o[k]=String(v-q);falta-=q}
  if(esc)o.__esc=String(esc);if(na)o.__na=1;put("vej","mms",o);return WIDGET.cogvej.txt("vej")};
 ok(/Minimental \(Anexo 28\): 30\/30/.test(mm(30,24)),"MMSE 30 mal: "+mm(30,24));
 ok(/sin sospecha de deterioro/i.test(mm(30,24)),"MMSE 30 con corte 24 debía ser normal");
 ok(/sospecha de deterioro cognitivo/.test(mm(24,24)),"MMSE 24 con corte 24 debía ser alterado (menor o igual)");
 ok(/sin sospecha/i.test(mm(25,24)),"MMSE 25 con corte 24 debía ser normal");
 ok(/sin sospecha/i.test(mm(18,17)),"MMSE 18 sin escolaridad debía ser normal");
 ok(/sospecha de deterioro cognitivo/.test(mm(17,17)),"MMSE 17 sin escolaridad debía ser alterado");
 ok(/sospecha de deterioro cognitivo/.test(mm(21,22)),"MMSE 21 con 5-8 años debía ser alterado");
 ok(/sin sospecha/i.test(mm(23,22)),"MMSE 23 con 5-8 años debía ser normal");
 // el mismo puntaje cambia de lectura según la escolaridad
 ok(/sin sospecha/i.test(mm(21,17))&&/sospecha de deterioro/.test(mm(21,24)),"MMSE 21 no cambia de lectura con la escolaridad");
 // sin escolaridad elegida no interpreta
 t=mm(20,null);
 ok(/20\/30/.test(t)&&!/sospecha/.test(t),"MMSE sin escolaridad no debía interpretar: "+t);
 // no aplicable
 ok(/No se aplica el Minimental/.test(mm(0,24,1)),"MMSE no aplicable mal");
 // causas reversibles en el texto de alterado
 ok(/vitamina B12/.test(mm(10,24)),"MMSE alterado no menciona causas reversibles");

 /* ---------- 7. APGAR y ZARIT ---------- */
 setup("vej",80,"F");
 const apg=o=>{put("vej","apg",o);put("vej","zar",{});put("vej","mal",{});return WIDGET.apoyo.txt("vej")};
 ok(/APGAR familiar: 10\/10, familia funcional/.test(apg({ada:"2",par:"2",cre:"2",afe:"2",res:"2"})),"APGAR 10 mal");
 ok(/7\/10, familia funcional/.test(apg({ada:"2",par:"2",cre:"1",afe:"1",res:"1"})),"APGAR 7 debía ser funcional");
 t=apg({ada:"1",par:"1",cre:"1",afe:"2",res:"1"});
 ok(/6\/10, disfunción familiar leve/.test(t)&&/orientación familiar/.test(t),"APGAR 6 mal: "+t);
 ok(/3\/10, disfunción familiar grave/.test(apg({ada:"1",par:"1",cre:"1",afe:"0",res:"0"})),"APGAR 3 mal");
 ok(/0\/10, disfunción familiar grave/.test(apg({ada:"0",par:"0",cre:"0",afe:"0",res:"0"})),"APGAR 0 mal");
 const zar=o=>{put("vej","apg",{});put("vej","zar",o);put("vej","mal",{});return WIDGET.apoyo.txt("vej")};
 const z=n=>{const o={};let r=n;["z1","z2","z3","z4","z5","z6","z7"].forEach(k=>{const v=Math.min(4,r);o[k]=String(v);r-=v});return o};
 ok(/Zarit reducida.*: 0\/28, sin sobrecarga/.test(zar(z(0))),"Zarit 0 mal");
 ok(/7\/28, sin sobrecarga/.test(zar(z(7))),"Zarit 7 debía ser sin sobrecarga");
 t=zar(z(8));ok(/8\/28, sobrecarga leve/.test(t)&&/descanso/.test(t),"Zarit 8 mal: "+t);
 t=zar(z(17));ok(/17\/28, sobrecarga intensa/.test(t)&&/ruta de salud mental/.test(t),"Zarit 17 mal: "+t);
 ok(/28\/28, sobrecarga intensa/.test(zar(z(28))),"Zarit 28 mal");
 // maltrato
 put("vej","apg",{});put("vej","zar",{});put("vej","mal",{l:1,e:1});
 t=WIDGET.apoyo.txt("vej");
 ok(/lesiones sin explicación/.test(t)&&/maltrato económico/.test(t),"maltrato no lista los signos: "+t);
 ok(/ruta de atención a víctimas de violencias/.test(t)&&/SIVIGILA/.test(t),"maltrato no activa ruta ni notifica");
 put("vej","mal",{});
 ok(WIDGET.apoyo.txt("vej")==="","apoyo vacío debía dar texto vacío");

 /* ---------- 8. FINDRISC: puntajes y conducta ---------- */
 const fdr=(mod,o)=>{put(mod,"fdr",o);return WIDGET.findrisc.txt(mod)};
 setup("adul",50,"M");
 ok(/FINDRISC \(Anexo 18\): 0\/26/.test(fdr("adul",{edad:"0",imc:"0",cint:"0",act:"0",fru:"0",hta:"0",glu:"0",fam:"0"})),"FINDRISC 0 mal");
 ok(/riesgo bajo/.test(fdr("adul",{edad:"0",imc:"0",cint:"0",act:"0",fru:"0",hta:"0",glu:"0",fam:"0"})),"FINDRISC 0 no es bajo");
 const F=(e,i,c,a,f,h,g,fa)=>({edad:String(e),imc:String(i),cint:String(c),act:String(a),fru:String(f),hta:String(h),glu:String(g),fam:String(fa)});
 ok(/6\/26.*riesgo bajo/.test(fdr("adul",F(2,1,0,2,1,0,0,0))),"FINDRISC 6 debía ser bajo");
 ok(/7\/26.*ligeramente elevado/.test(fdr("adul",F(2,3,0,2,0,0,0,0))),"FINDRISC 7 debía ser ligero");
 ok(/11\/26.*ligeramente elevado/.test(fdr("adul",F(2,3,4,2,0,0,0,0))),"FINDRISC 11 debía ser ligero");
 t=fdr("adul",F(2,3,4,2,1,0,0,0));
 ok(/12\/26.*riesgo moderado/.test(t)&&/glicemia basal en ayunas/.test(t),"FINDRISC 12 mal: "+t);
 ok(/14\/26.*riesgo moderado/.test(fdr("adul",F(4,3,4,2,1,0,0,0))),"FINDRISC 14 debía ser moderado");
 ok(/15\/26.*riesgo alto/.test(fdr("adul",F(4,3,4,2,0,2,0,0))),"FINDRISC 15 debía ser alto");
 ok(/20\/26.*riesgo alto/.test(fdr("adul",F(4,3,4,2,0,2,5,0))),"FINDRISC 20 debía ser alto");
 ok(/21\/26.*muy alto/.test(fdr("adul",F(4,3,4,2,1,2,5,0))),"FINDRISC 21 debía ser muy alto");
 ok(/26\/26.*muy alto/.test(fdr("adul",F(4,3,4,2,1,2,5,5))),"FINDRISC 26 (máximo) mal");
 // bajo riesgo no ordena glicemia por FINDRISC
 ok(!/glicemia basal en ayunas/.test(fdr("adul",F(0,0,0,0,0,0,0,0))),"FINDRISC bajo no debía ordenar glicemia");
 // tablas OMS
 put("adul","fdr",{__oms:"<10"});
 t=WIDGET.findrisc.txt("adul");
 ok(/bajo, menos del 10 %/.test(t),"OMS bajo mal: "+t);
 ok(!/ruta de alteraciones/.test(t),"OMS bajo no debía remitir");
 ["10-20","20-30","30+"].forEach(v=>{put("adul","fdr",{__oms:v});
  ok(/ruta de alteraciones cardio-cerebro-vasculares/.test(WIDGET.findrisc.txt("adul")),"OMS "+v+" debía remitir a la ruta")});
 put("adul","fdr",{});
 ok(WIDGET.findrisc.txt("adul")==="","FINDRISC vacío debía dar texto vacío");
 // el mismo widget funciona en juventud y vejez
 setup("juv",22,"F");ok(/FINDRISC/.test(fdr("juv",F(0,0,0,2,1,0,0,3))),"FINDRISC no funciona en juventud");
 setup("vej",65,"M");ok(/FINDRISC/.test(fdr("vej",F(4,1,3,0,0,0,0,0))),"FINDRISC no funciona en vejez");

 /* ---------- 9. el tamizaje mental de vejez sobrevive ---------- */
 setup("vej",70,"F");
 // Whooley positivo debe seguir apareciendo junto al Minimental
 S.set(key("vej","sm"),JSON.stringify({w1:1}));
 put("vej","mms",{ori:"5",orl:"5",fij:"3",cal:"5",rec:"3",nom:"2",rep:"1",ord:"3",lee:"1",esc:"1",dib:"1",__esc:"24"});
 t=WIDGET.cogvej.txt("vej");
 ok(/Minimental/.test(t),"cogvej perdió el Minimental");
 const sm=WIDGET.smental.txt("vej");
 ok(sm&&t.startsWith(sm),"cogvej no conserva íntegro el tamizaje de salud mental delante del Minimental");
 ok(t.length>sm.length+40,"cogvej no añadió el Minimental al tamizaje");

 /* ---------- 10. el HTML se genera sin excepción en todos los módulos ---------- */
 [["vej","funcional"],["vej","caidas"],["vej","cogvej"],["vej","apoyo"],["juv","findrisc"],["adul","findrisc"],["vej","findrisc"]].forEach(([m,w])=>{
  setup(m,m==="juv"?22:m==="adul"?45:70,"F");
  try{const h=WIDGET[w].html(m);ok(typeof h==="string"&&h.length>200,w+" en "+m+" generó HTML vacío");
   ok(!/undefined|NaN|\[object/.test(h),w+" en "+m+" tiene undefined/NaN en el HTML")}
  catch(e){ok(false,w+" en "+m+" lanzó excepción en html(): "+e.message)}
  try{WIDGET[w].txt(m)}catch(e){ok(false,w+" en "+m+" lanzó excepción en txt(): "+e.message)}});

 /* ---------- 11. sin datos, ningún widget inventa texto ---------- */
 setup("vej",70,"F");
 ["funcional","caidas","apoyo"].forEach(w=>ok(WIDGET[w].txt("vej")==="",w+" produce texto sin datos"));

 return fails;
});
await b.close();
if(res.length){console.log("FALLOS ("+res.length+"):");res.forEach(f=>console.log(" -",f));process.exit(1)}
console.log("instrumentos_vejez_rcv: 0 fallos");
})();
