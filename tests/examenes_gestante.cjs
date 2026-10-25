// v187: exámenes de la gestante según edad gestacional y situación (hoy, remisión, pendientes, ventana pasada, más adelante).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const per=(nom,doc,a)=>{const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-a);const P={'NOMBRE COMPLETO':nom,'TIPO':'CC','DOCUMENTO ID.':doc,'GENERO':'F','FECHA NACIMIENTO':d.toISOString().slice(0,10),'EAPB NOMBRE':'X','PUEBLO':'CUBEO',__com:'QUERARI',__est:'ges'};setPac(P);return P};
 const setW=(P,w)=>{const o=gexGet(P);o._egm={f:hoy(),w};gexSet(o,P)};
 const g=(G,k)=>G.R.filter(z=>z.g===k).map(z=>z.x.id);
 /* 1. ingreso temprano, 8 semanas, 26 años */
 let P=per('ANA','1',26);setW(P,8);let G=gexCalc(P);
 ['vih','sif','hbs','mal','hbp','tira','gluc','cito'].forEach(i=>ok(g(G,'hoy').includes(i),'ingreso: hoy falta '+i));
 ['hemo','hemog','uroc','glic','toxo','rub'].forEach(i=>ok(g(G,'rem').includes(i),'ingreso: remisión falta '+i));
 ['eco1','eco2','ptog','sgb'].forEach(i=>ok(g(G,'luego').includes(i),'ingreso: luego falta '+i));
 ok(/temprano/.test(G.sit),'situación temprano: '+G.sit);ok(/PROGRAMAR: ECOGRAFIA DE 10\+6/.test(gexRemTxt(G)),'remisión programa eco1');ok(!g(G,'hoy').concat(g(G,'rem')).includes('vdrl'),'sin vdrl');
 /* 2. ingreso muy tardío, 30 semanas */
 P=per('BEA','2',22);setW(P,30);G=gexCalc(P);
 ['eco1','eco2','ptog','rub'].forEach(i=>ok(g(G,'pas').includes(i),'tardío: ventana pasada '+i));ok(g(G,'luego').includes('sgb'),'sgb luego');ok(!g(G,'hoy').includes('cito'),'22 años sin citología');
 ok(/muy tardío/.test(G.sit),'situación muy tardío');ok(/ECOGRAFIA OBSTETRICA LO ANTES POSIBLE/.test(gexRemTxt(G))&&/PTOG 75 G O GLICEMIA/.test(gexRemTxt(G)),'reemplazos en la remisión');
 ok(g(G,'rem').includes('hemog')&&G.R.find(z=>z.x.id==='hemog').txt.includes('ingreso'),'hemograma 28 sin ingreso');
 /* 3. seguimiento: VIH hecha en el primer trimestre, ahora 20 semanas */
 P=per('CIRA','3',31);let o=gexGet(P);o.vih=[{f:'2026-08-01',w:10,e:'h',r:'NO REACTIVA'}];o.hemo=[{f:'2026-08-01',w:10,e:'h',r:'O-'}];o.toxo=[{f:'2026-08-01',w:10,e:'h',r:'IGG- IGM- (SERONEGATIVA)'}];o.sif=[{f:'2026-08-01',w:10,e:'h',r:'REACTIVA'}];o.eco2=[{f:hoy(),w:20,e:'e',r:''}];o._egm={f:hoy(),w:20};gexSet(o,P);G=gexCalc(P);
 ok(g(G,'hoy').includes('vih'),'VIH del segundo trimestre');ok(g(G,'ok').includes('sif'),'sífilis reactiva no se repite');ok(g(G,'rem').includes('vdrl'),'vdrl');ok(g(G,'rem').includes('coombs'),'coombs Rh-');
 ok(g(G,'rem').includes('toxm'),'IgM mensual seronegativa');ok(g(G,'pend').includes('eco2'),'eco2 pendiente');ok(/ADN-VPH/.test(G.R.find(z=>z.x.id==='cito').txt),'31 años ADN-VPH');ok(/seguimiento/.test(G.sit),'seguimiento');
 /* pantalla en la guía prenatal */
 S.set(key('prenatal','tab'),'guia');openMod('prenatal');if(st.tab!=='guia'){st.tab='guia';renderMod()}
 ok($('ruta-gex')&&/Hacer hoy en el puesto/.test($('ruta-gex').textContent),'sección en la guía');
 $('gex').querySelector('[data-gexr="vih"]').value='NO REACTIVA';$('gex').querySelector('[data-gexh="vih"]').click();ok(gexCalc(P).R.find(z=>z.x.id==='vih').g==='ok','marcar hecho');
 $('gex').querySelector('[data-gexe="hemog"]').click();ok(gexCalc(P).R.find(z=>z.x.id==='hemog').g==='pend','enviado en remisión');
 /* pruebas en el puesto → control */
 P=per('DORA','4',27);setW(P,12);pzOpen();$('pz-g').value='ges';$('pz-g').dispatchEvent(new Event('change'));const s=document.querySelector('[data-pzr="hbs"]');s.value='NO REACTIVA';s.dispatchEvent(new Event('change'));
 $('pz-hb').value='11.5';$('pz-hb').dispatchEvent(new Event('input'));$('pz-gex').click();G=gexCalc(P);ok(g(G,'ok').includes('hbs'),'hbs guardada desde pruebas');ok(!g(G,'hoy').includes('hbp'),'hb guardada');
 /* lista de gestantes y Mi día */
 const T=gexTodas();ok(T.length===4,'todas: '+T.length);home();ok($('md-gex'),'botón en Mi día');$('md-gex').click();ok(st.view==='gexl'&&/BEA/.test($('app').textContent),'lista');
 document.querySelector('[data-gexopen]').click();ok(st.view==='mod'&&st.mod==='prenatal','abrir su control');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('examenes_gestante: 0 fallos');
await b.close()})();
