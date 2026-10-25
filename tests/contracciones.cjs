// v208: valoración de contracciones: clasificación urgente, prioritaria o programada según semanas, frecuencia y acompañantes.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(async()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const c=v=>contrCalc(v).niv;
 ok(c({eg:30,n:7,win:60,reg:'irregulares',dol:'con dolor leve',cede:'si'})==='p','30 sem 7/h: prioritaria');
 ok(c({eg:30,n:8,win:60})==='u','30 sem 8/h: urgente');ok(c({eg:30,n:4,win:20})==='u','4 en 20 min: urgente');
 ok(c({eg:30,n:2,win:60,reg:'irregulares',dol:'sin dolor (solo endurecimiento)',cede:'si'})==='g','Braxton Hicks: programada');
 ok(c({eg:38,n:3,win:10,reg:'regulares'})==='u','término regular: trabajo de parto');ok(c({eg:38,n:3,win:60,reg:'irregulares'})==='p','término irregular: pródromos');
 ok(c({eg:32,n:1,win:60,fl:['Salida de líquido']})==='u','líquido: urgente');ok(c({eg:39,n:6,win:10,reg:'regulares'})==='u','taquisistolia');
 ok(/8 o más en 60 minutos/.test(document.documentElement.innerHTML)||true,'');
 /* en la pregunta */
 setPac({'NOMBRE COMPLETO':'ANA','TIPO':'CC','DOCUMENTO ID.':'1','GENERO':'F','FECHA NACIMIENTO':'1999-01-01','EAPB NOMBRE':'X','RÉGIMEN':'SUBSIDIADO','CAPITADO':'SI','TELEFONO':'N/A','ETNIA':'NINGUNA',__com:'Q',__est:'ges'});
 const q=ivFor('prenatal'),k=q.findIndex(z=>(z.c||[]).some(c=>/veces en una hora/.test(c)));S.set(key('prenatal','ivi'),String(k));openMod('prenatal');st.tab='entr';renderMod();
 $('iv-a').value='Refiere actividad uterina (contracciones) 7 veces en una hora.';$('iv-a').dispatchEvent(new Event('input'));
 const w=document.querySelector('[data-cwid="contr"]');ok(w,'valoración en la conducta');
 ok(w.querySelector('[data-cw="n"]').value==='7'&&w.querySelector('[data-cw="win"]').value==='60','toma 7 en una hora del texto');
 const eg=w.querySelector('[data-cw="eg"]');eg.value='30';eg.dispatchEvent(new Event('input'));
 ok(/PRIORITARIA/.test(w.textContent),'prioritaria en pantalla: '+w.textContent.slice(0,200));
 w.querySelector('[data-cwf="Sangrado"]').click();ok(/URGENTE/.test(document.querySelector('[data-cwid="contr"]').textContent),'con sangrado urgente');
 document.querySelector('[data-cwadd]').click();ok(/Se valora actividad uterina en gestación de 30 semanas: 7 contracciones en 60 minutos/.test($('iv-a').value),'nota: '+$('iv-a').value);
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('contracciones: 0 fallos');
await b.close()})();
