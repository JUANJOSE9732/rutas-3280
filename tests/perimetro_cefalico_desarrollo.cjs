// v144: el perímetro cefálico del bloque de desarrollo se toma de la antropometría
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const monta=(meses,pc,sexo)=>{
  localStorage.clear();
  const d=pD(hoy());d.setUTCMonth(d.getUTCMonth()-meses);d.setUTCDate(d.getUTCDate()-2);
  const P={'NOMBRE COMPLETO':'E','TIPO':'RC','DOCUMENTO ID.':'7',
           'FECHA NACIMIENTO':d.toISOString().slice(0,10),'__com':'Q'};
  if(sexo!==null)P.GENERO=sexo||'M';
  setPac(P);st.mod='pinf';S.set(key('pinf','fecha'),hoy());
  if(pc!=null){const q=ivFor('pinf'),i=q.findIndex(z=>/Crecimiento/.test(z.l||''));
   ok(i>=0,'no existe la pregunta de Crecimiento en primera infancia');
   S.set(key('pinf','cv'+i),JSON.stringify({peso:'7',talla:'65',pc:String(pc).replace('.',',')}))}};
 const dev=()=>{try{return JSON.parse(S.get(key('pinf','dev'))||'{}')}catch(e){return{}}};
 const pinta=()=>WIDGET.desarrollo.html('pinf');

 /* ===== 1. una medida normal deja el ítem en No ===== */
 monta(5,42);let h=pinta();
 ok(dev().pc===0,'con perímetro normal el ítem debía quedar en No, quedó '+dev().pc);
 ok(/dentro de lo normal/.test(h),'no muestra que está dentro de lo normal');
 ok(/42 cm/.test(h),'no muestra la medida tomada');
 // y la línea debe quedar JUNTO al ítem, no suelta en otra parte
 const iPC=h.indexOf('data-dv="pc"'), iLin=h.indexOf('Medido en «Crecimiento»'), iFen=h.indexOf('data-dv="fen"');
 ok(iPC>=0&&iLin>iPC,'la explicación no quedó después del ítem del perímetro cefálico');
 ok(iFen<0||iLin<iFen,'la explicación se coló después del ítem de alteraciones físicas');
 ok(iLin-iPC<600,'la explicación quedó demasiado lejos del ítem ('+(iLin-iPC)+' caracteres)');
 ok(/z −0/.test(h),'no muestra el z calculado: '+(h.match(/z [^ ]*/)||[])[0]);

 /* ===== 2. una medida baja deja el ítem en Sí ===== */
 monta(5,36);h=pinta();
 ok(dev().pc===1,'con perímetro bajo el ítem debía quedar en Sí, quedó '+dev().pc);
 ok(/por debajo de −2 DE/.test(h),'no dice que está por debajo de −2 DE');
 ok(/factor de riesgo para el neurodesarrollo/.test(h),'no nombra el riesgo');

 /* ===== 3. una medida alta también ===== */
 monta(5,48);h=pinta();
 ok(dev().pc===1,'con perímetro alto el ítem debía quedar en Sí');
 ok(/por encima de \+2 DE/.test(h),'no dice que está por encima de +2 DE');

 /* ===== 4. la clasificación del desarrollo cambia en consecuencia ===== */
 monta(5,36);pinta();
 const v=dev();['c0','c1','c2','c3','p0','p1','p2','p3'].forEach(k=>v[k]=1);
 S.set(key('pinf','dev'),JSON.stringify(v));
 let t=WIDGET.desarrollo.txt('pinf');
 ok(/probable retraso/i.test(t),'el perímetro alterado debía dar probable retraso: '+t);
 ok(/perímetro cefálico 36 cm/.test(t),'la nota no trae la medida: '+t);
 ok(/z −/.test(t),'la nota no trae el z');

 /* ===== 5. sin medida, avisa y NO responde solo ===== */
 monta(5,null);h=pinta();
 ok(dev().pc===undefined,'sin medida no debía responder el ítem');
 ok(/No has registrado el perímetro cefálico/.test(h),'sin medida no avisa: '+h.slice(0,80));
 ok(!/Medido en/.test(h),'sin medida no debía decir que lo midió');

 /* ===== 6. sin sexo no se puede calcular el z: avisa y no responde ===== */
 monta(5,42,null);h=pinta();
 ok(dev().pc===undefined,'sin sexo no debía responder el ítem');
 ok(/Falta la fecha de nacimiento o el sexo/.test(h),'sin sexo no avisa: '+h.slice(0,120));
 ok(/42 cm/.test(h),'sin sexo debía al menos mostrar la medida');

 /* ===== 7. no pisa lo que el profesional ya marcó ===== */
 monta(5,42);
 S.set(key('pinf','dev'),JSON.stringify({pc:1}));   // lo marcó a mano como alterado
 pinta();
 ok(dev().pc===1,'el autorrelleno pisó la respuesta puesta a mano');
 ok(!dev().__pcauto,'no debía marcarlo como automático si ya estaba respondido');

 /* ===== 8. el ítem sigue siendo editable y el cambio manual manda ===== */
 monta(5,36);
 const host=document.createElement('div');host.id='h';document.body.appendChild(host);
 host.innerHTML=pinta();WIDGET.desarrollo.wire('pinf',()=>{});
 ok(dev().pc===1&&dev().__pcauto,'debía quedar respondido en automático antes del clic');
 const bNo=host.querySelector('[data-dv="pc"][data-val="0"]');
 ok(bNo,'no se pintó el botón No del perímetro cefálico');
 bNo.click();
 ok(dev().pc===0,'el clic manual no cambió la respuesta');
 ok(!dev().__pcauto,'tras el cambio manual ya no debía figurar como automático');
 host.remove();

 /* ===== 9. funciona en varias edades y no rompe el widget ===== */
 [1,6,12,24,36,48].forEach(m=>{
  monta(m,44);
  let x='';try{x=pinta()}catch(e){ok(false,'html() falló a los '+m+' meses: '+e.message)}
  ok(x.length>400,'el HTML a los '+m+' meses salió corto');
  ok(!/undefined|NaN/.test(x),'el HTML a los '+m+' meses trae undefined o NaN');
  ok(dev().pc===0||dev().pc===1,'a los '+m+' meses no respondió el ítem')});

 /* ===== 10. sin tocar nada más, la nota sigue vacía ===== */
 monta(5,42);pinta();
 ok(WIDGET.desarrollo.txt('pinf')==='','responder solo el perímetro no debía producir nota por sí mismo');

 return F});
await b.close();
if(R.length){console.log('FALLOS ('+R.length+'):');R.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('perimetro_cefalico_desarrollo: 0 fallos');
})();
