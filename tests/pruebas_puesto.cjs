// v183: pruebas en el puesto (hemoglobina portátil y tira de orina).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 let r=pzHb({g:'ges',hb:'10.4'});ok(/Anemia leve/.test(r.txt)&&/HIERRO|SULFATO/.test(r.nota),'gestante 10,4: '+r.txt);
 r=pzHb({g:'ges',hb:'14.5'});ok(r.acc.some(a=>/no requiere hierro/.test(a[0])),'gestante >14');
 r=pzHb({g:'n6',hb:'6.5'});ok(/severa/.test(r.txt)&&/TELEMEDICINA/.test(r.nota),'niño severa');
 r=pzHb({g:'ho',hb:'12.5',fie:true});ok(/leve/.test(r.txt)&&r.acc.some(a=>/gota gruesa/.test(a[0])),'hombre leve con fiebre');
 r=pzHb({g:'mu',hb:'30'});ok(/fuera del rango/.test(r.txt),'fuera de rango');
 r=pzTira({g:'ges',sem:30,hta:true,tira:{pro:'++ (100 mg/dl)'}});ok(r.cls==='high'&&r.acc.some(a=>/preeclampsia/.test(a[0])),'preeclampsia');
 r=pzTira({g:'ges',tira:{nit:'POSITIVO',leu:'NEGATIVO'}});ok(r.acc.some(a=>/bacteriuria/.test(a[0])),'bacteriuria gestante');
 r=pzTira({g:'mu',suri:true,tira:{nit:'POSITIVO',leu:'++'}});ok(r.acc.some(a=>/Cistitis/.test(a[0])),'cistitis');
 r=pzTira({g:'mu',suri:true,flum:true,tira:{nit:'POSITIVO'}});ok(r.cls==='high','pielonefritis');
 r=pzTira({g:'ges',tira:{leu:'NEGATIVO',nit:'NEGATIVO',pro:'NEGATIVO'}});ok(/normal/.test(r.txt)&&/urocultivo/.test(r.txt),'normal gestante');
 /* pantalla */
 home();ok($('t-pz'),'falta el botón en el inicio');$('t-pz').click();ok(st.view==='pz','no abre');
 $('pz-g').value='ges';$('pz-g').dispatchEvent(new Event('change'));$('pz-hb').value='9.5';$('pz-hb').dispatchEvent(new Event('input'));
 ok(/Anemia moderada/.test($('pz-hb-r').textContent),'resultado en pantalla');$('pz-norm').click();ok(/UROANALISIS CON TIRA REACTIVA: LEUCOCITOS NEGATIVO/.test($('pz-nota').value),'texto de nota: '+$('pz-nota').value);
 mbOpen();$('mb-pz').click();ok(st.view==='pz'&&/Morbilidad/.test($('pz-back').textContent),'desde morbilidad');$('pz-back').click();ok(st.view==='mb','volver a morbilidad');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('pruebas_puesto: 0 fallos');
await b.close()})();
