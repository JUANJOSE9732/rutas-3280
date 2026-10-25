// v194: enlace #rr= desde el chat de Claude abre el registro rápido con los pacientes leídos.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
const txt='PACIENTE NUEVO. NOMBRE María Ñúñez. DOCUMENTO CC 1 2 3. EDAD 30 años. SEXO mujer. COMUNIDAD Querarí. ATENCIÓN procedimiento. DETALLE citología. FIN PACIENTE.';
const enc=Buffer.from(txt,'utf8').toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const url='file://'+require('path').join(__dirname,'..','index.html');
await p.goto(url);await p.evaluate(()=>localStorage.clear());
await p.goto('about:blank');await p.goto(url+'#rr='+enc);await p.waitForTimeout(400);
const r=await p.evaluate(()=>({v:st.view,n:document.querySelectorAll('.rr-card').length,t:document.querySelector('.rr-card')?.textContent||'',h:location.hash,st:$('rr-st')?.textContent}));
const F=[];if(r.v!=='rr')F.push('no abrió el registro: '+r.v);if(r.n!==1)F.push('tarjetas '+r.n);if(!/MARIA ÑUÑEZ|MARIA NUNEZ/.test(r.t))F.push('nombre con tildes: '+r.t.slice(0,80));if(r.h)F.push('no limpió el enlace');if(!/Claude/.test(r.st))F.push('aviso');
await p.reload();await p.waitForTimeout(300);const v2=await p.evaluate(()=>st.view);if(v2==='rr')F.push('al recargar no debe volver a abrir');
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('registro_enlace: 0 fallos');
await b.close()})();
