// v172: reflejos primitivos y reacciones posturales, opcionales y según la edad (recién nacido y primera infancia).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};const RFL='Reflejos primitivos y reacciones posturales (opcional)';
 const nino=(meses,dias)=>{localStorage.clear();const d=pD(hoy());d.setUTCMonth(d.getUTCMonth()-meses);d.setUTCDate(d.getUTCDate()-(dias||0));
  setPac({'NOMBRE COMPLETO':'BEBE','TIPO':'RC','DOCUMENTO ID.':'7','GENERO':'F','FECHA NACIMIENTO':d.toISOString().slice(0,10),'__com':'MITU'})};
 /* recién nacido */
 nino(0,4);openMod('rn');let q=ivFor('rn'),i=q.findIndex(x=>x.l===RFL);ok(i>=0&&q[i].widget==='reflejos','rn: falta el ítem de reflejos');
 let h=WIDGET.reflejos.html('rn');['Moro','Succión','Cócleo-palpebral','Búsqueda','Marcha automática','Cómo hacerlo'].forEach(t=>ok(h.includes(t),'rn: falta '+t));ok(!/Paracaídas|Landau/.test(h)&&!/Landau/.test(plGenerar('MODULO','rn')),'rn: paracaídas y Landau no son del recién nacido');
 ok(WIDGET.reflejos.txt('rn')==='','opcional: sin marcar no escribe nada');
 ok(!/Reflejos primitivos/.test(ivCompose('rn')),'opcional: no aparece en la nota si no se evaluó');
 S.set(key('rn','rfx'),JSON.stringify({mor:'P',suc:'P',coc:'P'}));let t=WIDGET.reflejos.txt('rn');ok(/Moro presente/.test(t)&&/Acordes a la edad/.test(t),'rn normal: '+t);
 S.set(key('rn','rfx'),JSON.stringify({mor:'X',suc:'A'}));t=WIDGET.reflejos.txt('rn');ok(/plexo braquial/.test(t)&&/signo de peligro/.test(t),'rn alterado: '+t);
 /* 8 meses: persiste Moro, paracaídas aún no exigido */
 nino(8);openMod('pinf');q=ivFor('pinf');ok(q.findIndex(x=>x.l===RFL)===q.findIndex(x=>/^Examen físico/.test(x.l))+1,'pinf: va después del examen físico');
 h=WIDGET.reflejos.html('pinf');ok(/Paracaídas/.test(h)&&/Landau/.test(h)&&!/Marcha automática/.test(h),'8 meses: reflejos de la edad');
 S.set(key('pinf','rfx'),JSON.stringify({mor:'P',par:'A',lan:'A'}));t=WIDGET.reflejos.txt('pinf');ok(/Moro presente a los 8 meses/.test(t),'Moro persistente: '+t);ok(!/Paracaídas ausente a esta edad/.test(t),'paracaídas aún no exigido a los 8 meses');ok(/Landau ausente a esta edad/.test(t),'Landau ausente a los 8 meses');
 /* 11 meses sin paracaídas */
 nino(11);openMod('pinf');S.set(key('pinf','rfx'),JSON.stringify({par:'A'}));ok(/Paracaídas ausente a esta edad/.test(WIDGET.reflejos.txt('pinf')),'paracaídas ausente a los 11 meses');
 /* 3 años: no aplica */
 nino(36);openMod('pinf');h=WIDGET.reflejos.html('pinf');ok(/Hirschberg/.test(h)&&/fotomotor/.test(h)&&!/Moro|Babinski/.test(h),'a los 3 años solo los oculares');
 S.set(key('pinf','rfx'),JSON.stringify({fot:'X',hir:'X',con:'P'}));t=WIDGET.reflejos.txt('pinf');ok(/anisocoria/.test(t)&&/estrabismo/.test(t)&&/Pupilar consensual presente/.test(t),'oculares alterados: '+t);
 nino(0,5);openMod('rn');h=WIDGET.reflejos.html('rn');['Pupilar fotomotor','Pupilar consensual','Parpadeo a la luz','Corneal (parpadeo al tocar)','Ojos de muñeca','Reflejos oculares'].forEach(z=>ok(h.includes(z),'rn: falta '+z));
 S.set(key('rn','rfx'),JSON.stringify({hir:'X',ojm:'A',fot:'P'}));t=WIDGET.reflejos.txt('rn');ok(/antes de los 4 meses: vigila/.test(t)&&/Ojos de muñeca ausente/.test(t),'rn oculares: '+t);
 ok(WIDGET.reflejos.desdeTexto('rn',['Reflejo corneal de luz (Hirschberg) (P/X): desviado','Pupilar fotomotor (directo) (P/A/X): P'])&&JSON.parse(S.get(key('rn','rfx'))).hir==='X','plantilla ocular');
 /* plantilla */
 const pl=plGenerar('MODULO','rn');ok(/Moro \(P\/A\/X\):/.test(pl)&&/Succión \(P\/A\):/.test(pl),'plantilla del recién nacido');
 nino(0,3);openMod('rn');ok(WIDGET.reflejos.desdeTexto('rn',['Moro (P/A/X): P','Succión (P/A): a','Paracaídas (P/A/X): ']),'desde texto');const v=JSON.parse(S.get(key('rn','rfx')));ok(v.mor==='P'&&v.suc==='A'&&!v.par,'lectura de la plantilla: '+JSON.stringify(v));
 /* caso de ejemplo de adultez alineado */
 localStorage.clear();openMod('adul');cargarCaso('adul');q=ivFor('adul');const a=ivAns('adul');
 [[/^Signos vitales/,/TA 150\/95/],[/^Estado nutricional/,/Peso 82/],[/^Examen físico/,/Buen estado general/],[/^Visión/,/20\/20/],[/APGAR/,/APGAR familiar 18/],[/^Familia/,/esposa/]].forEach(([l,r])=>{const k=q.findIndex(x=>l.test(x.l));ok(k>=0&&r.test(a[k]||''),'caso de ejemplo desalineado en '+l+': '+(a[k]||''))});
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('reflejos: 0 fallos');
await b.close()})();
