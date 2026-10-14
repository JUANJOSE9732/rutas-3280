// v143: la vigilancia del desarrollo con AIEPI, sin la EAD-3
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const monta=meses=>{localStorage.clear();
  const d=pD(hoy());d.setUTCMonth(d.getUTCMonth()-meses);d.setUTCDate(d.getUTCDate()-2);
  setPac({'NOMBRE COMPLETO':'E','TIPO':'RC','DOCUMENTO ID.':'7',
          'FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':'M','__com':'Q'});
  st.mod='pinf';S.set(key('pinf','fecha'),hoy())};
 const caso=(meses,o)=>{monta(meses);S.set(key('pinf','dev'),JSON.stringify(o));return WIDGET.desarrollo.txt('pinf')};
 const TODO={c0:1,c1:1,c2:1,c3:1,p0:1,p1:1,p2:1,p3:1};

 /* ===== 1. a los 5 meses usa el grupo de 4 y el anterior de 2 ===== */
 monta(5);
 const g=devGrupo(edadMesesMod('pinf'));
 ok(g.cur&&g.cur[1]==='4 meses','a los 5 meses el grupo debía ser «4 meses», es '+(g.cur&&g.cur[1]));
 ok(g.prev&&g.prev[1]==='2 meses','el grupo anterior debía ser «2 meses», es '+(g.prev&&g.prev[1]));
 ok(g.cur[2].length===4&&g.prev[2].length===4,'cada grupo debía traer 4 hitos, uno por área');

 /* ===== 2. las cuatro clasificaciones de AIEPI ===== */
 let t=caso(5,TODO);
 ok(/desarrollo normal\b/i.test(t)&&/Desarrollo esperado para la edad/.test(t),'todo cumplido debía ser normal: '+t);
 ok(!/factores de riesgo/.test(t),'sin factores no debía mencionarlos');

 t=caso(5,Object.assign({},TODO,{f2:1}));
 ok(/normal con factores de riesgo/i.test(t),'un factor de riesgo debía cambiar la clasificación: '+t);
 ok(/prematuro/i.test(t),'no nombra el factor de riesgo marcado');
 ok(/control en 30 días/.test(t),'no indica el control a 30 días');

 t=caso(5,Object.assign({},TODO,{c1:0}));
 ok(/riesgo de problema en el desarrollo/i.test(t),'fallar un hito de su edad debía ser riesgo: '+t);
 ok(/agarra objetos/i.test(t),'no nombra el hito que falló');
 ok(!/probable retraso/i.test(t),'un hito de su edad no debía ser probable retraso');

 t=caso(5,Object.assign({},TODO,{p1:0}));
 ok(/probable retraso/i.test(t),'fallar un hito de la edad anterior debía ser probable retraso: '+t);
 ok(/edad anterior/i.test(t),'no aclara que el hito fallado es de la edad anterior');
 ok(/[Rr]emitir/.test(t),'el probable retraso debe remitir');

 /* ===== 3. perímetro cefálico y alteraciones físicas pesan solos ===== */
 ok(/probable retraso/i.test(caso(5,Object.assign({},TODO,{pc:1}))),'el perímetro cefálico alterado debía dar probable retraso');
 ok(/probable retraso/i.test(caso(5,Object.assign({},TODO,{fen:1}))),'3 o más alteraciones físicas debían dar probable retraso');

 /* ===== 4. la valoración incompleta se declara en la NOTA ===== */
 t=caso(5,{c0:1,c1:1});
 ok(/Valoración incompleta/.test(t),'una valoración a medias debía declararse incompleta: '+t);
 ok(/6 hitos sin verificar/.test(t),'no dice cuántos hitos faltan: '+t);
 ok(/provisional/.test(t),'no advierte que la clasificación es provisional');
 // con todo marcado no sobra el aviso
 ok(!/incompleta/.test(caso(5,TODO)),'con los 8 hitos marcados no debía decir incompleta');
 // singular
 const falta1={};Object.keys(TODO).forEach(k=>falta1[k]=1);delete falta1.p3;
 ok(/quedó 1 hito sin verificar|quedaron 1 hito sin verificar/.test(caso(5,falta1)),'con un solo hito faltante debía ir en singular: '+caso(5,falta1));

 /* ===== 5. sin EAD-3, la nota no la menciona ===== */
 t=caso(5,TODO);
 ok(!/EAD-3/.test(t),'sin aplicar la EAD-3 la nota no debía nombrarla: '+t);
 // y con la EAD-3 sí
 t=caso(5,Object.assign({},TODO,{e_mg:'e',e_mf:'e',e_al:'e',e_ps:'e'}));
 ok(/EAD-3/.test(t),'con la EAD-3 llena la nota debía incluirla');
 ok(/motricidad gruesa/i.test(t),'la nota de la EAD-3 no detalla las áreas');

 /* ===== 6. si las dos fuentes discrepan, manda la peor ===== */
 t=caso(5,Object.assign({},TODO,{e_mg:'s',e_mf:'e',e_al:'e',e_ps:'e'}));
 ok(/Sospecha de problema o probable retraso/.test(t),'EAD-3 con sospecha debía mandar sobre un AIEPI normal: '+t);
 t=caso(5,Object.assign({},TODO,{c1:0,e_mg:'e',e_mf:'e',e_al:'e',e_ps:'e'}));
 ok(/Riesgo de problemas/.test(t),'AIEPI en riesgo debía mandar sobre una EAD-3 normal: '+t);

 /* ===== 7. sin datos no inventa nota ===== */
 ok(caso(5,{})==='','sin marcar nada la nota debía quedar vacía');

 /* ===== 8. funciona en todas las edades de primera infancia ===== */
 [1,2,4,6,9,12,15,18,24,30,36,42,48,54,60,71].forEach(m=>{
  monta(m);
  const gg=devGrupo(edadMesesMod('pinf'));
  ok(gg.cur&&gg.cur[2].length===4,'a los '+m+' meses no hay 4 hitos');
  let x='';try{x=WIDGET.desarrollo.html('pinf')}catch(e){ok(false,'html() falló a los '+m+' meses: '+e.message)}
  ok(x.length>400&&!/undefined|NaN/.test(x),'el HTML a los '+m+' meses salió mal');
  const o={};gg.cur[2].forEach((_,i)=>o['c'+i]=1);if(gg.prev)gg.prev[2].forEach((_,i)=>o['p'+i]=1);
  S.set(key('pinf','dev'),JSON.stringify(o));
  const n=WIDGET.desarrollo.txt('pinf');
  ok(/desarrollo normal/i.test(n),'a los '+m+' meses con todo cumplido debía ser normal: '+n);
  ok(!/incompleta/.test(n),'a los '+m+' meses con todo marcado no debía decir incompleta')});

 return F});
await b.close();
if(R.length){console.log('FALLOS ('+R.length+'):');R.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('desarrollo_aiepi: 0 fallos');
})();
