// Verifica que cada atención terminada llegue a la base con los campos de auditoría
// y solo las variables de la Res. 202 de 2021 que esa atención produce.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const R=await p.evaluate(()=>{
 const fails=[],ok=(c,m)=>{if(!c)fails.push(m)};
 localStorage.clear();
 const pac=(n,fn,sx,doc)=>setPac({'NOMBRE COMPLETO':n,'TIPO':'CC','DOCUMENTO ID.':doc,'FECHA NACIMIENTO':fn,'GENERO':sx,'__com':'QUERARI','ETNIA':'INDIGENA','PUEBLO':'CUBEO','EAPB NOMBRE':'MALLAMAS','RÉGIMEN':'SUBSIDIADO','TELEFONO':'3100000000'});
 const enviar=()=>{document.getElementById('bform').requestSubmit()};
 const ultimo=()=>{const c=registrosTodos();return c[c.length-1].datos};
 /* 1. asesoría VIH: dos registros distintos el mismo día para la misma persona */
 pac('ANA RUIZ','1990-03-01','F','111');
 S.set('dn2_vn_ccu',JSON.stringify({muestra:'MUESTRA PARA ADN-VPH CON CEPILLO ENDOCERVICAL'}));vnOpen('ccu');VNS.fin=true;vnRender();vnRegistrarBase('x');enviar();
 let d=ultimo();ok(d['R202 V086 TAMIZAJE CANCER DE CUELLO UTERINO']==='2','V86 ADN-VPH = 2');ok(d['CUPS']==='892901','CUPS de citología');
 S.set('dn2_vn_vih',JSON.stringify({vih:'NO REACTIVO',sif:'REACTIVO',hb:'NO SE REALIZO'}));vnOpen('vih');VNS.fin=true;vnRender();vnRegistrarBase('x');enviar();
 d=ultimo();ok(registrosTodos().length===2,'VIH no debe reemplazar el registro de la citología');
 ok(d['R202 V083 RESULTADO PRUEBA VIH']==='5'&&d['R202 V081 RESULTADO PRUEBA TAMIZAJE SIFILIS']==='4','V83=5 y V81=4');
 ok(!('R202 V079 RESULTADO ANTIGENO SUPERFICIE HEPATITIS B' in d),'hepatitis B no realizada no debe reportarse');
 ok(!('R202 V086 TAMIZAJE CANCER DE CUELLO UTERINO' in d),'la citología no se copia al registro de VIH');
 ok(/SIFILIS REACTIVA/.test(d['CONDUCTA']||''),'conducta ante sífilis reactiva');
 /* 2. planificación: método suministrado */
 pac('SOFIA PAZ','2001-03-01','F','222');
 S.set('dn2_vn_pf1',JSON.stringify({escoge:'IMPLANTE SUBDERMICO',prueba:'NO REQUIERE PRUEBA, INICIA EL METODO HOY'}));vnOpen('pf1');VNS.fin=true;vnRender();vnRegistrarBase('x');enviar();
 d=ultimo();ok(d['R202 V054 SUMINISTRO DE METODO ANTICONCEPTIVO']==='3','V54 implante = 3');ok(d['R202 V011 PERTENENCIA ETNICA']==='1','V11 indígena = 1');
 /* 3. si espera la prueba de embarazo, no hay suministro todavía */
 S.set('dn2_vn_pf1',JSON.stringify({escoge:'IMPLANTE SUBDERMICO',prueba:'SE ORDENA PRUEBA DE EMBARAZO'}));vnOpen('pf1');VNS.fin=true;vnRender();vnRegistrarBase('x');
 ok(!('R202 V054 SUMINISTRO DE METODO ANTICONCEPTIVO' in R202X),'sin prueba negativa no hay suministro');R202X=null;home();
 /* 4. módulo de primera infancia */
 pac('PEDRO RIOS','2024-01-10','M','333');openMod('pinf');
 const q=ivFor('pinf'),a={},ix=s=>q.findIndex(x=>x.l.startsWith(s));
 a[ix('Desarrollo con EAD')]='EAD-3 aplicada: desarrollo esperado para la edad en las cuatro áreas.';a[ix('Audición y comunicación')]='VALE: pasa.';a[ix('Micronutrientes dos veces')]='Entregados';a[ix('Remisiones')]='Se remite a odontología.';
 S.set(key('pinf','iv'),JSON.stringify(a));S.set(key('pinf','ivlab'),JSON.stringify(q.map(z=>z.l)));S.set(key('pinf','dict'),ivCompose('pinf'));S.set(key('pinf','fecha'),hoy());
 enviarBase('pinf');
 return new Promise(res=>setTimeout(()=>{enviar();const d=ultimo();
  ok(d['TIPO DE ATENCION']==='PRIMERA INFANCIA','tipo de atención del módulo');
  ok(d['R202 V052 FECHA CONSULTA VALORACION INTEGRAL']===hoy(),'V52 fecha de valoración integral');
  ok(['R202 V043 EAD MOTRICIDAD GRUESA','R202 V046 EAD AUDICION Y LENGUAJE'].every(k=>d[k]==='5'),'EAD = 5 en las áreas');
  ok(d['R202 V040 RESULTADO TAMIZAJE VALE']==='5','V40 VALE pasa = 5');ok(d['R202 V071 SUMINISTRO VITAMINA A 24 A 60 MESES']==='1','V71 vitamina A');
  ok(/odontolog/i.test(d['CONDUCTA']||''),'conducta con remisión');
  ok(colsDe().includes('R202 V052 FECHA CONSULTA VALORACION INTEGRAL'),'columnas de la 202 en la exportación');
  const h=r202Hoja(registrosTodos());ok(h&&h.filas.length===4,'hoja RES 202: encabezado y una fila por persona ('+(h&&h.filas.length)+')');
  res({fails})},400))});
const all=R.fails.concat(errs);
if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('res202_auditoria: 0 fallos');
await b.close()})();
