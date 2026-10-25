const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const r=await p.evaluate(()=>{localStorage.clear();const L=rrParse('PACIENTE NUEVO NOMBRE Ana Ruiz DOCUMENTO CC 5 SEXO mujer EDAD 27 años COMUNIDAD Querari ATENCION materno DETALLE gestante 8 semanas primer control FIN PACIENTE');L.forEach(e=>rrGuardarBase(e));rrSet(L);rrAbrir(L[0]);return obsNota(hoy())});
const ok=/## Registro rápido del día \(1\)/.test(r)&&/## Gestantes: exámenes \(1\)/.test(r)&&/ANA RUIZ — 8 semanas/.test(r)&&r.indexOf('## Registro rápido')<r.indexOf('## Comunidades');
if(!ok||errs.length){console.log('FALLAS:\n'+r.slice(0,800)+errs.join('\n'));process.exitCode=1}else console.log('obsidian_registro: 0 fallos');await b.close()})();
