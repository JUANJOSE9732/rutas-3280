const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await (await b.newContext({viewport:{width:400,height:2400}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FALLO',m)}};
// gestante 16 años con CC, sin micronutrientes
const r=await p.evaluate(()=>{localStorage.clear();const fn=new Date();fn.setFullYear(fn.getFullYear()-16);fn.setMonth(fn.getMonth()-2);
 const P={'NOMBRE COMPLETO':'ANA LOPEZ','TIPO':'CC','DOCUMENTO ID.':'12A45','GENERO':'F','FECHA NACIMIENTO':fn.toISOString().slice(0,10),__com:'Q',__est:'ges'};setPac(P);
 const o=gexGet(P);o._egm={f:hoy(),w:20};gexSet(o,P);
 const q=ivFor('prenatal'),a={};q.forEach((z,k)=>{a[k]='Niega.'});const mi=q.findIndex(z=>z.l==='Micronutrientes');a[mi]='Ácido fólico 0,4 mg formulado hoy.';
 const sv=q.findIndex(z=>z.l==='Signos vitales');a[sv]='TA 80/120, FC 80, temperatura 36,5';
 const al=q.findIndex(z=>z.l==='Signos de alarma');a[al]='Refiere sangrado vaginal escaso.';
 S.set(key('prenatal','iv'),JSON.stringify(a));S.set(key('prenatal','ivi'),String(q.length));openMod('prenatal');st.tab='entr';renderMod();
 const R=evFinal('prenatal');return{R,html:!!document.getElementById('evf'),txt:evTexto('prenatal',R)}});
const T=g=>r.R[g].map(z=>z.t).join(' || ');
ok(r.html,'panel');ok(/letras/.test(T('mal')),'doc letras');ok(/Cédula con 16/.test(T('mal')),'cc menor');
ok(/TA 80\/120/.test(T('mal')),'ta invertida');ok(/calcio/.test(T('falta'))&&/hierro/.test(T('falta')),'micronutrientes');
ok(/semana 12/.test(T('mal')),'folico tarde');ok(r.R.alarma.length>0,'alarma sangrado');ok(/albendazol/i.test(T('pend')),'desparasitacion');
ok(/adolescente/i.test(T('rec')+T('alarma')),'adolescente');ok(!/fumar/.test(T('rec')),'fumar falso');
// niño 3 años en pinf con TI, albendazol 200
const r2=await p.evaluate(()=>{localStorage.clear();const fn=new Date();fn.setFullYear(fn.getFullYear()-3);
 setPac({'NOMBRE COMPLETO':'LUIS PEREZ GOMEZ','TIPO':'TI','DOCUMENTO ID.':'1123456789','GENERO':'M','FECHA NACIMIENTO':fn.toISOString().slice(0,10),__com:'Q'});
 const q=ivFor('pinf'),a={};q.forEach((z,k)=>a[k]='Normal.');const d=q.findIndex(z=>/^Desparasitación/.test(z.l));a[d]='Albendazol 200 mg dosis única.';
 S.set(key('pinf','iv'),JSON.stringify(a));const R=evFinal('pinf');return R});
const T2=g=>r2[g].map(z=>z.t).join(' || ');
ok(/Tarjeta de identidad con 3/.test(T2('mal')),'ti 3 años');ok(/400 mg/.test(T2('mal')),'dosis albendazol');ok(/vitamina A/.test(T2('falta')),'vit A');
// adulto ok
const r3=await p.evaluate(()=>{localStorage.clear();const fn=new Date();fn.setFullYear(fn.getFullYear()-40);
 setPac({'NOMBRE COMPLETO':'PEDRO RUIZ DIAZ','TIPO':'CC','DOCUMENTO ID.':'18765432','GENERO':'M','FECHA NACIMIENTO':fn.toISOString().slice(0,10),__com:'Q'});
 const q=ivFor('adul'),a={};q.forEach((z,k)=>a[k]='Normal.');const pr=q.findIndex(z=>/^Próstata/.test(z.l));a[pr]='PSA solicitado.';
 S.set(key('adul','iv'),JSON.stringify(a));return evFinal('adul')});
ok(/Próstata|próstata/.test(r3.mal.map(z=>z.t).join()),'prostata 40');ok(/coherente/.test(r3.ok.map(z=>z.t).join()),'doc ok');
ok(!errs.length,'errores '+errs.join(';'));
console.log(r.txt.slice(0,1500));console.log('evaluador_final: '+f+' fallos');await b.close();process.exit(f?1:0)})();
