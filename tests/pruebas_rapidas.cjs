// v185: pruebas rápidas en el puesto (VIH, sífilis, HBsAg, malaria, embarazo) con conducta, formatos y nota.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const ids=R=>R.F.map(x=>x[0]);
 let R=pzRap({g:'ges',r:{vih:'NO REACTIVA',sif:'REACTIVA',hbs:'NO REACTIVA',mal:'NEGATIVA'},l:{sif:'AB12'}});
 ok(/PENICILINA G BENZATINICA 2\.400\.000 UI IM PRIMERA DOSIS DE 3/.test(R.nota),'sífilis gestacional: '+R.nota);ok(/LOTE AB12/.test(R.nota),'lote');
 ['civih','rdmal','rimal','recet','rem'].forEach(i=>ok(ids(R).includes(i),'falta formato '+i));ok(ids(R).includes('~sif'),'ficha 750');
 R=pzRap({g:'ges',r:{sif:'REACTIVA'},alpen:true});ok(/DESENSIBILIZACION/.test(R.nota)&&!/SE APLICA PENICILINA/.test(R.nota),'alergia');
 R=pzRap({g:'mu',r:{sif:'REACTIVA'},siftx:true});ok(/ANTECEDENTE/.test(R.nota)&&!ids(R).includes('recet'),'antecedente tratado');
 R=pzRap({g:'mu',r:{vih:'REACTIVA'},vih2:'REACTIVA'});ok(/SEGUNDA PRUEBA RAPIDA DE OTRO FABRICANTE: REACTIVA/.test(R.nota)&&ids(R).includes('rem')&&ids(R).includes('~vih'),'vih reactiva');
 R=pzRap({g:'ges',r:{hbs:'REACTIVA'}});ok(ids(R).includes('f340')&&R.B[0].acc.some(a=>/12 horas/.test(a[0])),'hbsag gestante');
 R=pzRap({g:'ho',r:{mal:'P. VIVAX (NO FALCIPARUM)'},hb:'6.5'});ok(R.B[0].acc.some(a=>/complicada/.test(a[0]))&&ids(R).includes('f465')&&ids(R).includes('rem'),'malaria con hb<7');
 R=pzRap({g:'ho',r:{mal:'P. FALCIPARUM'}});ok(R.B[0].acc.some(a=>/artemeter/.test(a[0]))&&!ids(R).includes('rem'),'falciparum no complicada');
 R=pzRap({g:'mu',r:{emb:'POSITIVA'}});ok(ids(R).includes('carges'),'embarazo positivo');
 /* pantalla */
 home();$('t-pz').click();ok(st.view==='pz'&&$('pzr'),'sección pruebas rápidas');
 const sel=document.querySelector('[data-pzr="mal"]');sel.value='P. VIVAX (NO FALCIPARUM)';sel.dispatchEvent(new Event('change'));
 ok(/Malaria positiva/.test($('pzr-r-mal').textContent),'resultado malaria en pantalla');ok(/Ficha 465/.test($('pzr-fmt').textContent),'formatos en pantalla');
 ok(/PDR/.test($('pz-nota').value),'nota con malaria');ok(!$('pzr-malw').hidden,'signos de complicada visibles');
 $('pz-hb').value='10.5';$('pz-hb').dispatchEvent(new Event('input'));ok(/HEMOGLOBINA/.test($('pz-nota').value)&&/PDR/.test($('pz-nota').value),'nota combinada: '+$('pz-nota').value);
 const e=document.querySelector('[data-pzr="emb"]');e.value='POSITIVA';e.dispatchEvent(new Event('change'));ok(!$('pzr-goprenat').hidden,'botón ruta prenatal');
 $('pz-clr').click();ok(!document.querySelector('[data-pzr="mal"]').value,'nueva persona limpia');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('pruebas_rapidas: 0 fallos');
await b.close()})();
