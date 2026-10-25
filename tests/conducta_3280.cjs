// v205: «Conducta según la Res. 3280» en todas las rutas, con página y sin dispararse cuando la persona lo niega.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 Object.keys(CDT).forEach(k=>{ok(M[k],'módulo inexistente '+k);CDT[k].forEach(r=>{ok(r.c&&r.c.length&&r.c.every(c=>/^\d+$/.test(c.pg)&&c.q.length>20),k+': cita sin página '+r.t)})});
 ['pinf','inf','adol','juv','adul','vej','precon','parto','rn','prenatal'].forEach(k=>ok(CDT[k]&&CDT[k].length,'ruta sin conducta '+k));
 const hit=(k,t)=>CDT[k].filter(r=>cdtMatch(r,t)).map(r=>r.t);
 ok(hit('adol','Refiere consumo de alcohol los fines de semana.').includes('Consumo de sustancias'),'adol alcohol');
 ok(!hit('adol','Niega consumo de alcohol y sustancias.').length,'negación no dispara');
 ok(hit('pinf','EAD-3 con alerta en motricidad gruesa.').includes('Alteración del desarrollo'),'desarrollo');
 ok(hit('vej','Refiere caídas en el último año.').includes('Riesgo de caídas'),'caídas');
 ok(hit('parto','Loquios con mal olor.').length,'puerperio');
 ok(hit('prenatal','Niega sangrado, salida de líquido y cefalea.').includes('Sin signos de alarma'),'prenatal niega');
 ok(!hit('prenatal','Niega sangrado, salida de líquido y cefalea.').includes('Sangrado o salida de líquido en la gestación'),'prenatal negado no dispara sangrado');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('conducta_3280: 0 fallos');
await b.close()})();
