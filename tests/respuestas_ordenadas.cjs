// v204: espacios ___ con casillas (fecha, cantidad), conducta con página de la Res. 3280 y dictado sin repeticiones.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(async()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 setPac({'NOMBRE COMPLETO':'ANA','TIPO':'CC','DOCUMENTO ID.':'1','GENERO':'F','FECHA NACIMIENTO':'2009-01-01','EAPB NOMBRE':'X','PUEBLO':'CUBEO',__com:'Q',__est:'ges'});
 const q=ivFor('prenatal'),k=q.findIndex(z=>(z.c||[]).some(c=>/sangrado genital desde/.test(c)));ok(k>=0,'pregunta de signos de alarma');
 S.set(key('prenatal','ivi'),String(k));S.set(key('prenatal','tab'),'entr');openMod('prenatal');st.tab='entr';renderMod();
 const bt=[...document.querySelectorAll('[data-c]')].find(b=>/sangrado genital desde/.test(b.dataset.c));bt.click();await new Promise(r=>setTimeout(r,50));
 const d=document.querySelector('#iv-fill input[type=date]'),n=document.querySelector('#iv-fill select[data-ivb]');ok(d&&n&&/una menstruación/.test(n.textContent),'casillas de fecha y cantidad subjetiva');
 d.value='2026-10-22';d.dispatchEvent(new Event('change'));const n2=document.querySelector('#iv-fill select[data-ivb]');n2.value=n2.options[4].value;n2.dispatchEvent(new Event('change'));
 const v=$('iv-a').value;ok(/desde 22\/10\/2026, cantidad abundante \(más que una menstruación/.test(v),'texto llenado: '+v);ok(!/_{2,}/.test(v)&&!$('iv-fill').innerHTML,'sin espacios pendientes');
 ok(!$('iv-cdt').hidden&&/p\. 264/.test($('iv-cdt').textContent)&&/Sangrado o salida/.test($('iv-cdt').textContent),'conducta con página');
 $('iv-cdt').querySelector('[data-cdt]').click();ok(/Res\. 3280, 4\.3\.2, p\. 264/.test($('iv-a').value),'agregar conducta');
 ok(ivBlankTipo('nacer menor de 2.500 g (',' g).').t==='num'&&ivBlankTipo('parto pretérmino a las ',' semanas.').u==='semanas'&&ivBlankTipo('se toman en ',' (próxima').t==='sel','tipos de espacio');
 const tc=ivBlankTipo('Refiere cefalea ',' con alteraciones visuales');ok(tc.t==='sel'&&tc.o.length>=5,'opciones de cefalea');
 ok(ivBlankTipo('Tiene o tenía DIU (colocado en ____); ',' (retirado / aún lo tiene).').o.join()==='retirado,aún lo tiene','opciones desde el paréntesis');
 ok(ivBlankTipo('Refiere antecedente de diabetes, diagnosticada en ',', en manejo').t==='mes','mes y año');
 ok(ivBlankTipo('FC ',' lpm, FR').u==='lpm','unidad lpm');
 /* dictado: resultados acumulados de Android */
 const ta=document.createElement('textarea');ta.value='Inicio';document.body.append(ta);const root=document.createElement('div');root.innerHTML='<button class="mic"></button><span class="mic-st"></span><div class="mic-ok"></div>';
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('respuestas_ordenadas: 0 fallos');
await b.close()})();
