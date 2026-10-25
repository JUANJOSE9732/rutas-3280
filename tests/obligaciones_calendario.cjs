// v188: semana epidemiológica, obligaciones rutinarias, SIVIGILA semanal y envío de Prosoft.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const t=(d,n,i,f)=>{const x=seDe(d);ok(x.n===n&&x.ini===i&&x.fin===f,d+' → '+JSON.stringify(x))};
 t('2026-01-04',1,'2026-01-04','2026-01-10');t('2026-10-24',42,'2026-10-18','2026-10-24');t('2026-10-25',43,'2026-10-25','2026-10-31');
 t('2026-10-04',40,'2026-10-04','2026-10-10');t('2026-11-01',44,'2026-11-01','2026-11-07');t('2026-11-29',48,'2026-11-29','2026-12-05');
 t('2027-01-01',52,'2026-12-27','2027-01-02');t('2026-01-01',53,'2025-12-28','2026-01-03');t('2027-01-03',1,'2027-01-03','2027-01-09');
 ok(seDe('2026-10-24').per===11,'periodo 11');ok(seAnt('2026-10-26').n===42,'semana anterior');
 ok(new Set(OB.map(x=>x[0])).size===OB.length,'ids');OB.forEach(x=>ok(OB_FR[x[1]],'frecuencia '+x[0]));
 calConf=()=>({salida:'2026-01-01'});
 home();ok($('md-obc')&&/SE \d+/.test($('md-obc').textContent),'botón en Mi día');$('md-obc').click();ok(st.view==='obc','abre');
 ok(/SIVIGILA/.test($('ob-rep').value),'reporte');
 const c=document.querySelector('[data-ob="d_pro"]');c.checked=true;c.dispatchEvent(new Event('change'));ok(obChk('d').d_pro===1,'diaria guardada');
 const s=document.querySelector('[data-ob="s_siv"]');s.checked=true;s.dispatchEvent(new Event('change'));ok(obChk('s',seAnt(hoy()).ini).s_siv===1,'sivigila va a la semana cerrada');
 ok(!obPendAnt().P.some(x=>x[0]==='s_siv'),'sin pendiente sivigila');ok(obPendAnt().P.some(x=>x[0]==='s_pro'),'prosoft pendiente');
 const T=mdTareas();ok(T.some(x=>/Pendiente: Envío de Prosoft/.test(x)),'tarea pendiente en Mi día');
 $('ob-pd').value=String(new Date().getDay());$('ob-pd').dispatchEvent(new Event('change'));ok(mdTareas().some(x=>/Enviar por internet las notas de Prosoft/.test(x)),'día de envío');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('obligaciones_calendario: 0 fallos');
await b.close()})();
