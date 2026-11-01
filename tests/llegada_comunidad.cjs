// v215: llegada a la comunidad el 2/11/2026, formatos de ingreso y horario real (mañana atención, tarde administrativo y urgencias).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 ok(calConf().salida==='2026-11-02','llegada por defecto');
 const d0=calPlanDia('2026-11-02').map(e=>e.t);
 ok(d0.includes('Llegada a la comunidad'),'evento llegada');ok(d0.some(t=>/concertación/.test(t)),'acta de concertación el día 0');
 ok(d0.some(t=>/Inventario de elementos/.test(t))&&d0.some(t=>/malaria/.test(t))&&d0.some(t=>/formato 27/.test(t)),'formatos de ingreso');
 ok(!d0.some(t=>/Apertura del punto/.test(t)),'día de llegada sin horario regular');
 ok(calPlanDia('2026-10-31').some(e=>/kardex/.test(e.t)),'formatos faltantes antes de salir');
 const d1=calPlanDia('2026-11-03').map(e=>e.t);ok(d1.some(t=>/Caracterización de gestantes/.test(t)),'caracterización día 1');
 ok(d1.includes('Atención de pacientes')&&d1.some(t=>/administrativo/.test(t)),'horario real');
 ok(!JSON.stringify(MD_PLAN).match(/Adultez|Adolescencia|curso de vida/),'sin cursos de vida');
 ok(!(()=>{hoy=()=>'2026-11-02';return obSemCuenta()})(),'el lunes de llegada no cuenta SIVIGILA');ok((()=>{hoy=()=>'2026-11-09';return obSemCuenta()})(),'el lunes siguiente sí');
 const x=calConf();x.salida='';S.set('dn2_cal_conf',JSON.stringify(x));ok(calConf().salida==='','cambiar fecha borra la llegada');
 return F});
console.log(F.length||errs.length?'FALLAS: '+F.concat(errs).join(' | '):'OK llegada_comunidad');await b.close();process.exit(F.length||errs.length?1:0)})();
