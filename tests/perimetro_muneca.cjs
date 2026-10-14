// v141: perímetro de muñeca y contextura corporal — solo en adultos, y sin reclasificar
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const calc=(sx,talla,mun,peso,edad)=>{
  localStorage.clear();
  const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-(edad||40));
  setPac({'NOMBRE COMPLETO':'N','TIPO':'CC','DOCUMENTO ID.':'1',
          'FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':sx,'__com':'Q'});
  st.mod='adul';S.set(key('adul','fecha'),hoy());
  const v={peso:String(peso||62),talla:String(talla).replace('.',',')};
  if(mun!=='')v.mun=String(mun).replace('.',',');
  return cvCalc('antropoA',v)};
 const mun=r=>(r.m&&r.m.mun)||'';

 /* ===== el campo existe y es opcional ===== */
 const c=CAMPOS.antropoA.find(x=>x.k==='mun');
 ok(c,'no se agregó el campo de perímetro de muñeca');
 ok(c&&/[Oo]pcional/.test(c.n||''),'el campo no se marca como opcional: '+(c?c.n:''));
 ok(c&&/m[aá]s delgada|debajo del hueso/i.test(c.n||''),'el campo no explica dónde medir');
 ok(!CAMPOS.antropoPI.some(x=>x.k==='mun'),'la muñeca no debe pedirse en primera infancia');
 ok(!CAMPOS.antropoNNA.some(x=>x.k==='mun'),'la muñeca no debe pedirse en infancia ni adolescencia');
 ok(!CAMPOS.antropoG.some(x=>x.k==='mun'),'la muñeca no debe pedirse en gestantes');

 /* ===== hombres: >10,4 pequeña · 9,6 a 10,4 mediana · <9,6 grande ===== */
 // talla 170: muñeca 16 -> 10,63 pequeña | 17 -> 10,00 mediana | 18 -> 9,44 grande
 ok(/contextura pequeña/i.test(mun(calc('M',170,16))),'hombre 170/16 debía ser pequeña: '+mun(calc('M',170,16)));
 ok(/contextura mediana/i.test(mun(calc('M',170,17))),'hombre 170/17 debía ser mediana: '+mun(calc('M',170,17)));
 ok(/contextura grande/i.test(mun(calc('M',170,18))),'hombre 170/18 debía ser grande: '+mun(calc('M',170,18)));
 // fronteras exactas: 10,4 es mediana (no pequeña); 9,6 es mediana (no grande)
 ok(/mediana/.test(mun(calc('M',104,10))),'hombre con índice 10,40 debía ser mediana, no pequeña');
 ok(/pequeña/.test(mun(calc('M',104.1,10))),'hombre con índice 10,41 debía ser pequeña');
 ok(/mediana/.test(mun(calc('M',96,10))),'hombre con índice 9,60 debía ser mediana, no grande');
 ok(/grande/.test(mun(calc('M',95.9,10))),'hombre con índice 9,59 debía ser grande');

 /* ===== mujeres: >11,0 pequeña · 10,1 a 11,0 mediana · <10,1 grande ===== */
 ok(/mediana/.test(mun(calc('F',110,10))),'mujer con índice 11,00 debía ser mediana, no pequeña');
 ok(/pequeña/.test(mun(calc('F',110.1,10))),'mujer con índice 11,01 debía ser pequeña');
 ok(/mediana/.test(mun(calc('F',101,10))),'mujer con índice 10,10 debía ser mediana, no grande');
 ok(/grande/.test(mun(calc('F',100.9,10))),'mujer con índice 10,09 debía ser grande');
 // el mismo índice se lee distinto según el sexo
 ok(/pequeña/.test(mun(calc('M',107,10)))&&/mediana/.test(mun(calc('F',107,10))),
    'el índice 10,70 debía ser pequeña en hombre y mediana en mujer');

 /* ===== acepta la talla en metros igual que en centímetros ===== */
 ok(mun(calc('M',1.70,17))===mun(calc('M',170,17)),'1,70 y 170 debían dar el mismo resultado');

 /* ===== no reclasifica el estado nutricional ===== */
 const sin=calc('F',160,''),con=calc('F',160,16);
 ok(sin.m.imc===con.m.imc,'la muñeca cambió la clasificación del IMC: "'+sin.m.imc+'" vs "'+con.m.imc+'"');
 ok(/Res\. 2465/.test(con.txt),'la nota no aclara que el estado nutricional se clasifica por IMC');
 ok(/complementario/i.test(con.txt),'la nota no dice que el dato es complementario');

 /* ===== la nota explica cómo leer el IMC con esa contextura ===== */
 const avG=(calc('F',150,16).al||[]).join(' ');
 ok(/Contextura grande/.test(avG),'no avisa de la lectura del IMC con contextura grande: '+avG);
 ok(!/contextura grande.*contextura grande/i.test(avG),'el aviso repite la contextura: '+avG);
 ok(/sobrestim/.test(avG),'el aviso de contextura grande no explica el sesgo del IMC');
 const avP=(calc('F',175,15).al||[]).join(' ');
 ok(/subestim/.test(avP),'el aviso de contextura pequeña no explica el sesgo del IMC');

 /* ===== faltantes y disparates no rompen nada ===== */
 ok(!mun(calc('M',170,'')),'sin el dato no debía aparecer nada de muñeca');
 localStorage.clear();
 setPac({'NOMBRE COMPLETO':'N','TIPO':'CC','DOCUMENTO ID.':'1','FECHA NACIMIENTO':'1980-01-01','GENERO':'M','__com':'Q'});
 st.mod='adul';S.set(key('adul','fecha'),hoy());
 const sinTalla=cvCalc('antropoA',{peso:'62',mun:'16'});
 ok(/Falta la talla/.test(sinTalla.m.mun||''),'sin talla debía avisar, dio: '+(sinTalla.m.mun||''));
 ok(!/contextura (pequeña|mediana|grande)/i.test(sinTalla.m.mun||''),'sin talla no debía clasificar');
 ok(/fuera de lo esperado/.test(mun(calc('M',170,160))),'160 cm de muñeca debía marcarse como medida rara');
 ok(/fuera de lo esperado/.test(mun(calc('M',170,2))),'2 cm de muñeca debía marcarse como medida rara');
 ok(!/contextura (pequeña|mediana|grande)/i.test(mun(calc('M',170,160))),'con una medida rara no debía clasificar');
 // sin sexo registrado
 localStorage.clear();
 setPac({'NOMBRE COMPLETO':'N','TIPO':'CC','DOCUMENTO ID.':'1','FECHA NACIMIENTO':'1980-01-01','__com':'Q'});
 st.mod='adul';S.set(key('adul','fecha'),hoy());
 const sinSx=cvCalc('antropoA',{peso:'62',talla:'170',mun:'16'});
 ok(/Falta el sexo/.test(sinSx.m.mun||''),'sin sexo debía avisar, dio: '+(sinSx.m.mun||''));
 ok(!/contextura (pequeña|mediana|grande)/i.test(sinSx.m.mun||''),'sin sexo no debía clasificar: '+(sinSx.m.mun||''));

 /* ===== el resto de la antropometría sigue intacta ===== */
 const r=calc('F',160,16,70);
 ok(r.m.imc&&!/undefined|NaN/.test(r.m.imc),'se dañó la clasificación del IMC: '+r.m.imc);
 ok(!/undefined|NaN/.test(r.txt),'la nota trae undefined o NaN: '+r.txt);
 ok(/peso 70|70 kg/.test(r.txt),'la nota perdió el peso');

 /* ===== funciona en juventud y vejez, que comparten la antropometría ===== */
 ['juv','vej'].forEach(m=>{
  localStorage.clear();
  const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-(m==='juv'?22:70));
  setPac({'NOMBRE COMPLETO':'N','TIPO':'CC','DOCUMENTO ID.':'1','FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':'F','__com':'Q'});
  st.mod=m;S.set(key(m,'fecha'),hoy());
  const rr=cvCalc('antropoA',{peso:'60',talla:'160',mun:'16'});
  ok(/contextura/i.test((rr.m&&rr.m.mun)||''),'no calcula la contextura en '+m)});

 return F});
await b.close();
if(R.length){console.log('FALLOS ('+R.length+'):');R.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('perimetro_muneca: 0 fallos');
})();
