// v175: cada signo vital con su rango por edad; en rojo o ámbar con comentario si está fuera.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const per=(meses,sx,mod)=>{localStorage.clear();const d=pD(hoy());d.setUTCMonth(d.getUTCMonth()-meses);d.setUTCDate(d.getUTCDate()-3);setPac({'NOMBRE COMPLETO':'X','TIPO':'RC','DOCUMENTO ID.':'1','GENERO':sx,'FECHA NACIMIENTO':d.toISOString().slice(0,10)});openMod(mod)};
 const ev=(mod,v)=>{S.set(key(mod,'sgn'),JSON.stringify(v));return WIDGET.signosps.txt(mod)};
 per(1,'F','pinf');let t=ev('pinf',{t:'37.6'});ok(/menor de 2 meses/.test(t)&&/AIEPI/.test(t),'fiebre en menor de 2 meses: '+t);
 t=ev('pinf',{t:'36.2'});ok(/hipotermia/.test(t),'hipotermia del menor de 2 meses: '+t);
 per(30,'M','pinf');t=ev('pinf',{t:'37.7',fc:'95',fr:'18',spo2:'93'});ok(/Febrícula/.test(t),'febrícula');ok(!/Frecuencia cardiaca/.test(t),'FC normal no alerta');ok(/baja para la edad \(menos de 20\)/.test(t),'FR baja: '+t);ok(/algo baja/.test(t),'saturación 93');
 t=ev('pinf',{tas:'110',tad:'70'});ok(/elevada para la edad \(desde 100\/55\)/.test(t),'TA elevada a los 2 años: '+t);
 t=ev('pinf',{tas:'65',tad:'40'});ok(/Sístole 65 baja para la edad \(menos de 74\)/.test(t),'hipotensión: '+t);
 per(15*12,'F','adol');t=ev('adol',{tas:'132',tad:'78',fr:'22'});ok(/130\/80 o más/.test(t),'TA adolescente');ok(/algo alta/.test(t),'FR 22 adolescente');
 per(40*12,'M','adul');t=ev('adul',{tas:'118',tad:'76',fc:'72',fr:'16',t:'36.6',spo2:'97'});ok(!/fuera|alta|baja|Fiebre/.test(t),'adulto normal sin alertas: '+t);
 /* perímetros e imposibles */
 per(1,'F','pinf');t=ev('pinf',{t:'36.5',ptor:'300',pabd:'500',pmun:'50'});ok(/torácico de 300 cm no es posible/.test(t)&&/abdominal de 500 cm no es posible/.test(t)&&/muñeca de 50 cm no es posible/.test(t),'perímetros imposibles: '+t);
 t=ev('pinf',{t:'365',fc:'1100',tas:'60',tad:'80'});ok(/Temperatura de 365 °C no es posible/.test(t)&&/Frecuencia cardiaca de 1100/.test(t)&&/diástole \(80\) no puede/.test(t),'signos imposibles: '+t);
 per(10*12,'M','inf');{const q=ivFor('inf'),i=q.findIndex(x=>x.campos==='antropoNNA');S.set(key('inf','cv'+i),JSON.stringify({peso:'40',talla:'140'}))}
 t=ev('inf',{pabd:'75'});ok(/índice cintura\/talla 0,54/.test(t),'cintura/talla: '+t);t=ev('inf',{pabd:'60',ptor:'70',pmun:'15'});ok(!/no es posible|riesgo/.test(t),'perímetros normales sin alerta: '+t);
 per(8,'F','pinf');{const q=ivFor('pinf'),i=q.findIndex(x=>x.campos==='antropoPI');S.set(key('pinf','cv'+i),JSON.stringify({peso:'8',talla:'68',pc:'42'}))}
 t=ev('pinf',{ptor:'48'});ok(/mucho mayor que el cefálico/.test(t),'tórax mucho mayor que cabeza en lactante: '+t);
 /* adulto: estado nutricional con valores imposibles */
 per(40*12,'M','adul');{const r=cvCalc('antropoA',{peso:'700',talla:'300',cint:'500',mun:'50'});ok(r.flag.peso&&r.flag.talla&&r.flag.cint&&r.flag.mun&&r.al.length===4&&!r.imc,'antropoA imposibles: '+JSON.stringify(r.al));
  const r2=cvCalc('antropoA',{peso:'82',talla:'1.68',cint:'98'});ok(!/no es posible/.test(r2.al.join(' '))&&r2.imc,'antropoA normal sin falsos positivos')}
 ['inf','adol','juv','adul','vej'].forEach(m=>{const q=ivFor(m);ok(q.some(x=>x.widget==='signosps')&&q.some(x=>/^ex_/.test(x.sistemas||'')),m+': falta signos o examen por regiones')});
 /* en pantalla: borde y comentario */
 per(40*12,'M','adul');
 S.set(key('adul','sgn'),JSON.stringify({fc:'130',spo2:'89'}));document.body.innerHTML='<div id="w">'+WIDGET.signosps.html('adul')+'</div>';WIDGET.signosps.wire('adul',()=>{});
 const fcI=document.querySelector('input[data-sgn="fc"]'),fcM=document.querySelector('[data-sgm="fc"]');ok(/fuera del rango/.test(fcM.textContent)&&fcI.style.borderWidth==='2px','FC marcada en rojo con comentario');
 ok(/urgencia/.test(document.querySelector('[data-sgm="spo2"]').textContent),'saturación 89 con comentario');
 ok(/Normal 36 a 37,4/.test(document.querySelector('[data-sgm="t"]').textContent),'referencia visible sin dato');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('signos_rangos: 0 fallos');
await b.close()})();
