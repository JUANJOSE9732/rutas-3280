// v203: datos de la persona en blanco quedan como pendientes y se avisan en las demás pestañas.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 setPac({'NOMBRE COMPLETO':'MARIA','TIPO':'CC','DOCUMENTO ID.':'1','GENERO':'F','FECHA NACIMIENTO':'1999-02-23',__com:'TUCUNARE',__est:'ges'});
 ok(idPend('prenatal').join()==='EAPB,Régimen (subsidiado, contributivo…),Capitado,Teléfono,Pertenencia étnica','pendientes: '+idPend('prenatal'));
 S.set(key('prenatal','tab'),'id');openMod('prenatal');st.tab='id';renderMod();
 ok(document.querySelectorAll('#id-f .idp').length===5,'chips en Datos: '+document.querySelectorAll('#id-f .idp').length);
 ok(document.querySelectorAll('#eb-w').length===1,'caja de edad una sola vez');
 const et=document.querySelector('[data-f="ETNIA"]');et.value='INDIGENA';et.dispatchEvent(new Event('change',{bubbles:true}));
 ok(document.querySelectorAll('#id-f .idp').length===5,'al escoger indígena: sale pueblo pendiente y se quita étnica');
 $('id-go').click();ok(st.tab==='entr','sigue a preguntas con pendientes');ok($('idp-box')&&/EAPB/.test($('idp-box').textContent)&&/Pueblo/.test($('idp-box').textContent),'aviso en preguntas');
 st.tab='guia';renderMod();ok($('idp-box'),'aviso en guía');$('idp-go').click();ok(st.tab==='id','completar ahora vuelve a datos');
 const o=pac();Object.assign(o,{'EAPB NOMBRE':'MALLAMAS','RÉGIMEN':'SUBSIDIADO','CAPITADO':'SI','TELEFONO':'N/A','PUEBLO':'CUBEO'});setPac(o);ok(!idPend('prenatal').length,'completo (N/A cuenta)');
 st.tab='guia';renderMod();ok(!$('idp-box'),'sin aviso si está completo');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('datos_pendientes: 0 fallos');
await b.close()})();
