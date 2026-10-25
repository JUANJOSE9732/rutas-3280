// v193: registro rápido por voz (PACIENTE NUEVO … FIN PACIENTE): lectura, clasificación, base y apertura.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const T=`Paciente nuevo. Nombre María Rodríguez Gómez. Documento CC 1 1 2 0 5 4 3 2 1. Nacimiento 14 de marzo de 2002. Sexo mujer. Comunidad Querarí. Atención materno. Detalle gestante 18 semanas. Nota ingreso, refiere náuseas y edad de la pareja 30. Fin paciente.
 paciente nuevo nombre Luis Pérez documento registro civil uno cero nueve ocho siete edad 3 años sexo hombre comunidad Querarí atención morbilidad detalle diarrea con vómito alarma fin del paciente
 PACIENTE NUEVO. NOMBRE Ana Ruiz. DOCUMENTO CC 555. CORRIJO DOCUMENTO CC 5 5 6. NACIMIENTO 01/02/1990. SEXO mujer. COMUNIDAD Yuruparí. ATENCION procedimiento. DETALLE inserción de implante. FIN PACIENTE.
 PACIENTE NUEVO. NOMBRE Pedro Gil. DOCUMENTO CC 777. EDAD 45 años. SEXO hombre. COMUNIDAD Querarí. ATENCION evento. DETALLE mordedura de serpiente. FIN PACIENTE
 PACIENTE NUEVO NOMBRE Rosa Díaz DOCUMENTO TI 888 EDAD 15 años SEXO mujer COMUNIDAD Querarí ATENCION ruta FIN PACIENTE
 PACIENTE NUEVO NOMBRE Sin Fin DOCUMENTO CC 999 SEXO mujer`;
 const L=rrParse(T);ok(L.length===6,'pacientes: '+L.length);
 const [a,l,i,pe,r,s]=L;
 ok(a.nom==='MARIA RODRIGUEZ GOMEZ'&&a.tipo==='CC'&&a.doc==='112054321'&&a.fn==='2002-03-14'&&a.sx==='F'&&a.com==='QUERARI','datos 1: '+JSON.stringify(a));
 ok(a.at==='mat'&&a.dest.mod==='prenatal'&&a.sem===18,'materno');ok(/PAREJA 30/.test(a.nota)&&a.edad==null,'la nota no se mezcla con EDAD');ok(!rrFalta(a).length,'completo 1');
 ok(l.tipo==='RC'&&l.doc==='10987'&&l.edad===3&&l.sx==='M'&&l.at==='morb'&&l.mb==='eda'&&l.alarma,'morbilidad con alarma: '+JSON.stringify(l));
 ok(i.doc==='556'&&i.fn==='1990-02-01'&&i.dest.vn==='impl','corrijo e implante: '+JSON.stringify(i));
 ok(pe.at==='ev'&&pe.dest.ev==='ofid','evento ofídico');
 ok(r.at==='ruta'&&r.dest.mod==='adol','ruta por edad: '+JSON.stringify(r.dest));
 ok(s.aviso.length&&rrFalta(s).includes('comunidad'),'sin fin y faltantes');
 /* pantalla */
 home();ok($('md-rr'),'botón en Mi día');$('md-rr').click();ok(st.view==='rr','abre');
 $('rr-txt').value=T;$('rr-leer').click();ok(document.querySelectorAll('.rr-card').length===6,'tarjetas');
 const ed=document.querySelector('[data-rrf="5:com"]');ed.value='Querarí';ed.dispatchEvent(new Event('change'));ok(!/comunidad/.test(document.querySelectorAll('.rr-card')[5].textContent.split('Falta:')[1]||''),'editar en la tarjeta');
 ok(/años/.test(document.querySelectorAll('.rr-card')[0].querySelector('input[readonly]')?.value||''),'edad calculada por la fecha');
 $('rr-ok').click();ok(rrGet().length===6&&Object.keys(pacientes()).length===6,'guardados: '+rrGet().length+' / '+Object.keys(pacientes()).length);
 ok($('rr-saved')&&document.querySelectorAll('[data-rrgo]').length===6&&!$('rr-inw').open,'tras guardar: caja con Atender ahora y dictado cerrado');
 ok(document.querySelector('.rr-it.rr-al')&&/LUIS/.test(document.querySelector('.rr-it').textContent),'alarma primero');
 /* abrir: gestante → prenatal con semanas */
 const ga=rrGet().find(e=>/MARIA/.test(e.nom));rrAbrir(ga);ok(st.view==='mod'&&st.mod==='prenatal','abre prenatal');ok(Math.round(gexCalc().W)===18,'semanas en exámenes: '+gexCalc().W);
 rrOpen();const lu=rrGet().find(e=>/LUIS/.test(e.nom));rrAbrir(lu);ok(st.view==='dir','alarma abre telemedicina');
 rrOpen();lu._telOk=1;rrAbrir(lu);ok(st.view==='vnota'||/morbilidad/i.test(document.body.textContent),'morbilidad abre la nota');
 rrOpen();rrAbrir(rrGet().find(e=>/PEDRO/.test(e.nom)));ok(st.view==='ev','evento');
 /* no duplica */
 rrParse('PACIENTE NUEVO NOMBRE Maria R DOCUMENTO CC 112054321 SEXO mujer COMUNIDAD Querari ATENCION ruta FIN PACIENTE').forEach(e=>ok(rrPac(e).existe,'reconoce que ya existe'));
 const pq=rrParse('PACIENTE NUEVO NOMBRE Eva Lis DOCUMENTO CC 4 4 SEXO mujer COMUNIDAD Querari PUEBLO cubeo EAPB Mallamas TELEFONO 3 1 0 5 5 5 ATENCION ruta FIN PACIENTE')[0];const PP=rrPac(pq).P;ok(PP['PUEBLO']==='CUBEO'&&PP['EAPB NOMBRE']==='MALLAMAS'&&PP['TELEFONO']==='310555'&&PP['ETNIA']==='INDIGENA','pueblo, eapb y teléfono: '+JSON.stringify(PP));
 /* Claude por copiar y pegar */
 ok(/PACIENTE NUEVO/.test(rrPrompt('x'))&&/FIN PACIENTE/.test(rrPrompt('x')),'prompt');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('registro_rapido: 0 fallos');
await b.close()})();
