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
 /* en pantalla: borde y comentario */
 S.set(key('adul','sgn'),JSON.stringify({fc:'130',spo2:'89'}));document.body.innerHTML='<div id="w">'+WIDGET.signosps.html('adul')+'</div>';WIDGET.signosps.wire('adul',()=>{});
 const fcI=document.querySelector('input[data-sgn="fc"]'),fcM=document.querySelector('[data-sgm="fc"]');ok(/fuera del rango/.test(fcM.textContent)&&fcI.style.borderWidth==='2px','FC marcada en rojo con comentario');
 ok(/urgencia/.test(document.querySelector('[data-sgm="spo2"]').textContent),'saturación 89 con comentario');
 ok(/Normal 36 a 37,4/.test(document.querySelector('[data-sgm="t"]').textContent),'referencia visible sin dato');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('signos_rangos: 0 fallos');
await b.close()})();
