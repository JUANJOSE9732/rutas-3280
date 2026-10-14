// v140: el perímetro braquial solo se interpreta de 6 a 59 meses (Res. 2465 de 2016)
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 // los 2 días de más evitan que la aritmética de meses deje la edad justo por debajo del corte
 const calc=(meses,pb,campos)=>{
  localStorage.clear();
  const d=pD(hoy());d.setUTCMonth(d.getUTCMonth()-meses);d.setUTCDate(d.getUTCDate()-2);
  setPac({'NOMBRE COMPLETO':'N','TIPO':'RC','DOCUMENTO ID.':'1',
          'FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':'F','__com':'Q'});
  st.mod=meses<72?'pinf':'inf';S.set(key(st.mod,'fecha'),hoy());
  const v={peso:meses<60?'10':'18',talla:meses<60?'80':'110'};
  if(pb!=='')v.pb=String(pb).replace('.',',');
  return cvCalc(campos||'antropoPI',v)};
 const pbDe=r=>(r.m&&r.m.pb)||'';
 const avisoDe=r=>(r.al||[]).filter(x=>/braquial/i.test(x)).join(' ');

 /* ===== dentro del rango: clasifica con los cortes de la OMS ===== */
 ok(/severa/i.test(pbDe(calc(24,11.0))),'24 meses y PB 11,0 debía ser severa: '+pbDe(calc(24,11.0)));
 ok(/moderada/i.test(pbDe(calc(24,12.0))),'24 meses y PB 12,0 debía ser moderada');
 ok(/adecuado/i.test(pbDe(calc(24,14.0))),'24 meses y PB 14,0 debía ser adecuado');
 ok(/severa/i.test(pbDe(calc(6,11.0))),'a los 6 meses exactos debía clasificar');
 ok(/moderada/i.test(pbDe(calc(59,12.0))),'a los 59 meses debía clasificar');

 /* ===== fronteras exactas de los puntos de corte ===== */
 ok(/severa/i.test(pbDe(calc(24,11.4))),'11,4 debía ser severa');
 ok(/moderada/i.test(pbDe(calc(24,11.5))),'11,5 debía ser moderada, no severa');
 ok(/moderada/i.test(pbDe(calc(24,12.4))),'12,4 debía ser moderada');
 ok(/adecuado/i.test(pbDe(calc(24,12.5))),'12,5 debía ser adecuado');

 /* ===== la severa dispara remisión el mismo día ===== */
 const av=avisoDe(calc(24,11.0));
 ok(/mismo día/i.test(av),'la desnutrición severa por PB no pide remisión el mismo día: '+av);
 ok(/2350/.test(av),'el aviso no cita la ruta de desnutrición aguda: '+av);

 /* ===== fuera del rango: avisa y NO clasifica ===== */
 [0,3,5].forEach(m=>{const t=pbDe(calc(m,11.0));
  ok(/No se interpreta a esta edad/.test(t),m+' meses debía avisar que no aplica, dio: "'+t+'"');
  ok(!/severa|moderada|adecuado/i.test(t),m+' meses no debía clasificar: "'+t+'"')});
 [60,65,71].forEach(m=>{const t=pbDe(calc(m,11.0));
  ok(/No se interpreta a esta edad/.test(t),m+' meses debía avisar que no aplica, dio: "'+t+'"');
  ok(!/severa|moderada|adecuado/i.test(t),m+' meses no debía clasificar: "'+t+'"')});
 // y el aviso dice con qué clasificar en su lugar
 ok(/peso para la talla/i.test(pbDe(calc(65,11.0))),'el aviso no dice con qué clasificar en su lugar');
 ok(/2465/.test(pbDe(calc(65,11.0))),'el aviso no cita la norma');

 /* ===== sin el dato, el braquial no se menciona ===== */
 ok(!pbDe(calc(24,'')),'sin perímetro braquial no debía aparecer la línea');
 ok(!pbDe(calc(65,'')),'sin perímetro braquial no debía aparecer la línea fuera de rango');

 /* ===== el resto de la antropometría sigue intacta a los 65 meses ===== */
 const r65=calc(65,11.0);
 ok(r65.m&&(r65.m.talla||r65.m.imc),'a los 65 meses se perdió la clasificación de talla o IMC');
 ok(!/undefined|NaN/.test(JSON.stringify(r65.m||{})),'la clasificación trae undefined o NaN');

 /* ===== infancia (6 a 11 años) no pide perímetro braquial ===== */
 ok(!CAMPOS.antropoNNA.some(c=>c.k==='pb'),'el módulo de infancia no debería pedir perímetro braquial (Res. 2465: de 5 a 17 años van IMC/E y T/E)');
 ok(CAMPOS.antropoPI.some(c=>c.k==='pb'),'primera infancia debería pedir perímetro braquial');
 const c=CAMPOS.antropoPI.find(x=>x.k==='pb');
 ok(/6\s*a\s*59\s*meses/i.test(c.n||''),'la etiqueta del campo no dice el rango de edad: '+(c.n||''));

 return F});
await b.close();
if(R.length){console.log('FALLOS ('+R.length+'):');R.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('perimetro_braquial: 0 fallos');
})();
