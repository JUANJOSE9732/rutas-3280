// v179: botiquín del puesto combinado con morbilidad (inventario del 27/9/2026).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 /* datos completos */
 const ids=new Set();BQ.forEach(m=>{ok(!ids.has(m.id),'id repetido '+m.id);ids.add(m.id);
  if(m.ne)return;['n','c','p','u','ef','ci','it','em','op','g'].forEach(k=>ok(m[k],m.id+': falta '+k));ok(m.pa||m.pn,m.id+': sin posología');
  ok(m.f&&MBF[m.f[0]],m.id+': fuente desconocida');ok(!m.v||/^\d{4}-\d{2}$/.test(m.v),m.id+': fecha mal');
  (m.kg||[]).forEach((e,i)=>ok(bqCalc(m,i,10,{a:5})!=='',m.id+': calculadora vacía'))});
 ok(BQ.filter(m=>!m.ne).length>=85,'faltan medicamentos entregados: '+BQ.filter(m=>!m.ne).length);
 ['aciclo','nista','fluco','tini','adren','peni','sertra','lope'].forEach(id=>ok(bqGet(id),'falta '+id));
 /* mapeo: todo id existe y todo medicamento entregado aparece en alguna morbilidad */
 Object.entries(MB_BQ).forEach(([k,x])=>{ok(MB.find(z=>z.id===k),'morbilidad inexistente '+k);(x.m||[]).concat((x.no||[]).map(z=>[z])).forEach(([id])=>ok(bqGet(id),k+': medicamento inexistente '+id))});
 const usados=new Set(Object.values(MB_BQ).flatMap(x=>(x.m||[]).map(z=>z[0])));
 const sueltos=BQ.filter(m=>!m.ne&&!usados.has(m.id)&&!bqRutas(m.id).length).map(m=>m.id);
 /* semáforo */
 const e=id=>bqEstado(bqGet(id)).k;ok(e('peni')==='rojo','penicilina 12/2026 en rojo: '+e('peni'));ok(e('medroxi')==='verde'&&e('omep')==='verde','medroxi y omeprazol entregados');
 ok(['rojo','venc'].includes(e('adren')),'adrenalina en rojo: '+e('adren'));ok(e('acet_t')==='verde','acetaminofén verde');ok(e('bisaco')==='sinf','bisacodilo sin fecha');ok(e('ibu')==='sin','ibuprofeno no entregado');
 /* corrección del inventario */
 S.set(BQ_KEY,JSON.stringify({peni:{ent:3,lote:'263012005',v:'2026-02'}}));ok(e('peni')==='venc','la corrección no se aplica');localStorage.clear();
 /* calculadora */
 ok(/45 mg = 0,9 ml/.test(bqCalc(bqGet('adren'),0,10,{a:2}).replace(/0,1 mg = 0,1 ml/,'x'))||/0,1 mg = 0,1 ml/.test(bqCalc(bqGet('adren'),0,10,{a:2})),'adrenalina 10 kg: '+bqCalc(bqGet('adren'),0,10,{a:2}));
 ok(/0,3 mg = 0,3 ml/.test(bqCalc(bqGet('adren'),0,40,{a:10})),'adrenalina niño 40 kg tope 0,3: '+bqCalc(bqGet('adren'),0,40,{a:10}));
 ok(/0,5 mg/.test(bqCalc(bqGet('adren'),0,70,{a:30})),'adrenalina adulto tope 0,5');
 ok(/450 mg = 9 ml/.test(bqCalc(bqGet('amox_s'),0,10,{a:2})),'amoxicilina 10 kg: '+bqCalc(bqGet('amox_s'),0,10,{a:2}));
 ok(/No usar/.test(bqCalc(bqGet('iver'),0,12,{a:3})),'ivermectina < 15 kg');ok(/20 gotas/.test(bqCalc(bqGet('iver'),0,20,{a:6})),'ivermectina 20 kg');
 /* avisos por persona */
 const pers=(sx,a,es)=>{localStorage.clear();const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-a);setPac({'NOMBRE COMPLETO':'X','TIPO':'CC','DOCUMENTO ID.':'1','GENERO':sx,'FECHA NACIMIENTO':d.toISOString().slice(0,10)});if(es){const P=pac();P.__est=es;S.set('dn2_pac',JSON.stringify(P))}};
 pers('F',25,'ges');let c=ctxPer();ok(c.es==='ges','no quedó gestante');ok(bqAvisos(bqGet('enala'),c).some(t=>/contraindicado/.test(t)),'enalapril en gestante');ok(bqAvisos(bqGet('cipro'),c).length,'cipro en gestante');ok(!bqAvisos(bqGet('acet_t'),c).length,'acetaminofén sin aviso');
 pers('M',4);c=ctxPer();ok(bqAvisos(bqGet('doxi'),c).some(t=>/8 años/.test(t)),'doxiciclina en niño de 4');
 /* pantallas */
 home();ok($('t-bq'),'falta el botón del botiquín en el inicio');$('t-bq').click();ok(st.view==='bq','no abre el botiquín');ok(document.querySelectorAll('details[data-bqd]').length>=BQ.length-1,'lista incompleta');
 const d=document.querySelector('details[data-bqd="amox_s"]');d.open=true;const w=d.querySelector('.bq-w');w.value='10';w.dispatchEvent(new Event('input'));ok(/9 ml/.test(d.textContent),'calculadora en pantalla');
 document.querySelector('[data-bqf="alerta"]').click();ok(document.querySelector('details[data-bqd="peni"]')&&!document.querySelector('details[data-bqd="acet_t"]'),'filtro de alertas');
 mbOpen('eda');let x=document.querySelector('details[data-mb="eda"]');ok(x.open&&/Del botiquín del puesto/.test(x.textContent)&&/Sulfato de zinc/.test(x.textContent),'botiquín dentro de EDA');ok(/No usar en esta condición:.*Metoclopramida/.test(x.textContent)&&/nunca en niños/.test(x.textContent),'EDA: metoclopramida no, loperamida solo adultos');
 x.querySelector('[data-bqgo="zinc"]').click();ok(st.view==='bq'&&document.querySelector('details[data-bqd="zinc"]').open,'ir a la ficha');$('bq-back').click();ok(st.view==='mb','volver a morbilidad');
 ['itu','parasitos','garganta','asma','vaginal','alergia','dolor','herida','hta','dm','gastritis'].forEach(id=>ok(MB.find(z=>z.id===id)&&MB_BQ[id],'falta morbilidad '+id));
 ok(VN.morb.qs[0].o.includes('INFECCIÓN URINARIA'),'la nota no tiene las nuevas opciones');
 $('mb-q').value='amoxicilina';$('mb-q').dispatchEvent(new Event('input'));ok(document.querySelector('details[data-mb="ira"]'),'buscar por medicamento');
 return F.concat(sueltos.length?['medicamentos sin morbilidad: '+sueltos.join(', ')]:[])});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('botiquin: 0 fallos');
await b.close()})();
