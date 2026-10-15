// v149: refuerzos de polio con tope de 6 años y plan de puesta al día en el cuadro de vacunas
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const R=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const monta=(mod,meses,vac)=>{localStorage.clear();const d=pD(hoy());d.setUTCMonth(d.getUTCMonth()-meses);
  setPac({'NOMBRE COMPLETO':'ANA','TIPO':'RC','DOCUMENTO ID.':'9','FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':'F'});st.mod=mod;S.set(key(mod,'fecha'),hoy());S.set(vacKey(),JSON.stringify(vac||{}))};
 /* 1. caso de la captura: 7 años y medio, polio 1 y 2 */
 monta('inf',90,{pol1:1,pol2:1});
 const E=vacEstado('inf'),r=k=>E.find(x=>x.k===k);
 ok(r('polr1').pas&&!r('polr1').le,'1.er refuerzo debía salir «ya no» a los 7 años');
 ok(r('polr2').pas&&!r('polr2').le,'2.º refuerzo debía salir «ya no» a los 7 años');
 ok(r('pol3').le,'la 3.ª dosis debía seguir sugerida');
 const pl=vacPlan('inf').join(' ');
 ok(/tiene 2 de 3 dosis primarias/.test(pl)&&/VIP/.test(pl)&&/falta 1 dosis/.test(pl),'plan de polio: '+pl);
 ok(/refuerzos ya no aplican/.test(pl)&&/coordinación del PAI/.test(pl),'plan sin refuerzos o sin PAI: '+pl);
 ok(/Plan de puesta al día/.test(WIDGET.vacunas.resumen('inf').txt),'el plan no pasa a la nota');
 const sug=WIDGET.vacunas.resumen('inf');ok(!sug.sd.concat(sug.noT).some(x=>/^polr/.test(x.k)),'los refuerzos no debían sugerirse');
 /* 2. componente DPT sin dato a los 7 años */
 ok(/Td/.test(pl),'debía recordar revisar DPT y Td: '+pl);
 /* 3. menor de 6: completar con VIP y luego refuerzos */
 monta('pinf',30,{pol1:1});const pl2=vacPlan('pinf').join(' ');
 ok(/1 de 3/.test(pl2)&&/nunca se reemplazan con VOP/.test(pl2)&&/antes de cumplir 6 años/.test(pl2),'plan menor de 6: '+pl2);
 ok(vacEstado('pinf').find(x=>x.k==='polr1').le,'a los 30 meses el 1.er refuerzo sí corresponde');
 /* 4. esquema completo: sin plan */
 monta('pinf',30,{pol1:1,pol2:1,pol3:1,polr1:1});ok(!vacPlan('pinf').some(t=>/Polio/.test(t)),'no debía haber plan de polio con esquema completo');
 /* 5. sin marcar nada: sin plan */
 monta('inf',90,{});ok(!vacPlan('inf').length,'sin marcar no debía haber plan');
 /* 6. el recuadro se pinta */
 monta('inf',90,{pol1:1,pol2:1});const div=document.createElement('div');div.innerHTML=WIDGET.vacunas.html('inf');document.body.append(div);WIDGET.vacunas.wire('inf',()=>{});
 ok(/Plan para ponerse al día/.test(document.getElementById('vac-res').textContent),'el recuadro no muestra el plan');
 return F});
const all=R.concat(errs.map(e=>'ERR '+e));console.log(all.length?'FALLAS:\n'+all.join('\n'):'vacunas_atraso: 0 fallos');await b.close();process.exit(all.length?1:0)})();
