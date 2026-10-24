// v184: formatos y soportes por atención, ruta, morbilidad y nota por voz.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const ids=new Set(FMT.map(f=>f.id));ok(ids.size===FMT.length,'ids repetidos');ok(FMT.length===42,'formatos: '+FMT.length);
 const chk=(n,R)=>R.forEach(([id])=>ok(id[0]==='~'?FMT_FALTA[id.slice(1)]:ids.has(id),n+': formato inexistente '+id));
 Object.keys(M).forEach(k=>ok(FMT_RUTA[k],'ruta sin formatos: '+k));Object.entries(FMT_RUTA).forEach(([k,R])=>{ok(M[k],'módulo inexistente '+k);chk(k,R)});
 Object.entries(FMT_MB).forEach(([k,R])=>{ok(MB.find(x=>x.id===k),'morbilidad inexistente '+k);chk(k,R)});
 Object.entries(FMT_VN).forEach(([k,R])=>{ok(VN[k],'plantilla inexistente '+k);chk(k,R)});FMT_SIT.forEach(s=>chk(s.t,s.r));
 MB.forEach(m=>ok(FMT_MB[m.id],'morbilidad sin formatos: '+m.id));
 /* reglas del texto de la nota */
 let L=fmtUnir(fmtReglasVN('morb',{cond:'MALARIA'},'GOTA GRUESA POSITIVA P. VIVAX. SE ENTREGA CLOROQUINA. SE GESTIONA REMISION.')).map(x=>x[0]);
 ['f465','rdmal','rimal','recet','rem'].forEach(id=>ok(L.includes(id),'malaria: falta '+id));
 L=fmtUnir(fmtReglasVN('vih',{},'')).map(x=>x[0]);ok(L.includes('civih'),'vih');
 L=fmtUnir(fmtReglasVN('impl',{},'PACIENTE NO ACEPTA REMISION')).map(x=>x[0]);ok(L.includes('ciimp')&&L.includes('disrem'),'implante + disentimiento');
 L=fmtUnir(fmtReglasVN('cyd',{},'NIEGA VIOLENCIA. NO REQUIERE REMISION')).map(x=>x[0]);ok(!L.includes('f875')&&!L.includes('rem'),'falsos positivos: '+L);
 ok(/Sin existencias: pedir/.test(fmtLista([['f300','']])),'aviso sin existencias');ok(/No está en tu lista/.test(fmtLista([['~sif','x']])),'ficha que falta');
 /* ruta prenatal */
 const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-25);setPac({'NOMBRE COMPLETO':'X','TIPO':'CC','DOCUMENTO ID.':'1','GENERO':'F','FECHA NACIMIENTO':d.toISOString().slice(0,10),'EAPB NOMBRE':'X','PUEBLO':'CUBEO',__com:'QUERARI'});
 S.set(key('prenatal','tab'),'guia');openMod('prenatal');if(st.tab!=='guia'){st.tab='guia';renderMod()}
 const bx=$('ruta-fmt');ok(bx&&/Caracterización de gestantes/.test(bx.textContent)&&/Sífilis gestacional/.test(bx.textContent),'formatos en la guía prenatal');
 $('ruta-fmt-todo').click();ok(st.view==='fmt'&&/Prenatal/.test($('fmt-back').textContent),'abre formatos desde la ruta');
 ok(/Sin existencias/.test(document.querySelector('.box.miss').textContent),'caja sin existencias');
 $('fmt-q').value='implante';$('fmt-q').dispatchEvent(new Event('input'));ok(/implante subdérmico/.test($('fmt-list').textContent),'buscar implante');
 const u=document.querySelector('[data-fuse="ciimp"]');u.click();ok(fmtCant('ciimp')===29,'usé uno: '+fmtCant('ciimp'));
 $('fmt-sit').value='1';$('fmt-sit').dispatchEvent(new Event('change'));ok(/Ficha 550/.test($('fmt-sit-r').textContent),'situación muerte materna');
 $('fmt-back').click();ok(st.view==='mod'&&st.mod==='prenatal','volver a la ruta');
 /* morbilidad */
 mbOpen('malaria');ok(/Ficha 465/.test($('app').textContent),'ficha de malaria muestra formatos');
 /* inicio */
 home();ok($('md-fmt'),'botón Formatos en Mi día');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('formatos: 0 fallos');
await b.close()})();
