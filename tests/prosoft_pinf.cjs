// v162: primera infancia pregunta todo lo de PROSOFT, sin preguntas repetidas.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 const d=pD(hoy());d.setUTCMonth(d.getUTCMonth()-50);
 setPac({'NOMBRE COMPLETO':'LUIS','TIPO':'RC','DOCUMENTO ID.':'5','GENERO':'M','FECHA NACIMIENTO':d.toISOString().slice(0,10),'__com':'MITU'});openMod('pinf');
 const q=ivFor('pinf'),L=q.map(x=>x.l),W=q.map(x=>x.widget);
 ['discap','rxsps','signosps','visionps','genograma','apgarfam','vale','desarrollo','enfactual','vacunas'].forEach(w=>ok(W.includes(w),'falta el instrumento '+w));
 ok(!L.includes('Signos generales de peligro AIEPI'),'los signos de peligro ya están en la enfermedad actual: no deben repetirse');
 ok(L.filter(l=>/^Visión/.test(l)).length===1,'una sola pregunta de visión');ok(L.filter(l=>/VALE/.test(l)).length===1,'un solo VALE');
 /* revisión por sistemas: 13 de órganos de los sentidos y 8 sistemas */
 const rx=WIDGET.rxsps.txt('pinf');ok((rx.match(/niega ([^.]*)\./)||[,''])[1].split(/, | y /).length===12,'deben salir los 12 síntomas de los sentidos: '+rx);
 ['Cardiopulmonar','Neurológico','Digestivo','Psiquiátrico','Dermatológico','Genitourinario','Osteoarticular','Ginecológico: NO APLICA'].forEach(s=>ok(rx.includes(s),'falta '+s));
 /* signos: presión media, Glasgow, IMC y superficie corporal */
 S.set(key('pinf','sgn'),JSON.stringify({tas:'90',tad:'60',go:'4',gv:'5',gm:'6',fr:'45',ptor:'50'}));
 const i=q.findIndex(x=>x.campos==='antropoPI');S.set(key('pinf','cv'+i),JSON.stringify({peso:'16',talla:'100'}));
 const sg=WIDGET.signosps.txt('pinf');ok(/media 70/.test(sg),'presión media: '+sg);ok(/Glasgow 15\/15/.test(sg),'Glasgow');ok(/IMC 16; superficie corporal 0,67/.test(sg),'IMC y superficie corporal: '+sg);ok(/Respiración rápida/.test(sg),'alerta de FR');ok(/torácico 50 cm/.test(sg),'perímetro torácico');
 /* agudeza visual por ojo, con Res. 202 */
 S.set(key('pinf','vis'),JSON.stringify({oi:'20/50',od:'20/20',dist:'6 metros'}));const vi=WIDGET.visionps.txt('pinf');
 ok(/OD 20\/20, OI 20\/50/.test(vi)&&/peor que 20\/40/.test(vi),'agudeza visual: '+vi);
 /* genograma */
 S.set(key('pinf','gen'),JSON.stringify({pa:'67',ma:'70',h1s:'F',h1e:'8',h1u:'A',h2s:'M',h2e:'3',h2u:'M',red:'Adecuada'}));const gn=WIDGET.genograma.txt('pinf');
 ok(/padre de 67 años, madre de 70 años; 2 hermano\(s\): hermana de 8 años, hermano de 3 meses/.test(gn),'genograma: '+gn);
 /* discapacidades */
 ok(/^Sin discapacidad/.test(WIDGET.discap.txt('pinf')),'sin discapacidad por defecto');
 /* VALE: vestibular en ítems, tabla y remisión como en PROSOFT */
 S.set(key('pinf','vale'),JSON.stringify({c8:1,e8:1,i8:1,v0:1,v0_1:0}));const va=WIDGET.vale.txt('pinf');
 ok(/vestibular \(V\) 1/.test(va),'negativas del vestibular: '+va);ok(/servicio de urgencias: N\. ¿La remisión es urgente\?: N/.test(va),'remisión como en PROSOFT: '+va);
 ok(/¿El niño\/a sabe y repite rondas, canciones, cuentos, historias cortas o fragmentos\?/.test(WIDGET.vale.html('pinf')),'redacción literal del VALE');ok(/Observación directa/.test(WIDGET.vale.html('pinf')),'observación directa');
 /* la plantilla trae los campos de PROSOFT y se cargan en los instrumentos */
 const t=plGenerar('MODULO','pinf');['Ardor ojos (S/N): N','Sistema psiquiátrico: NORMAL','Glasgow motora (1 a 6): 6','Snellen OD','Hermano 6','Parentesco: ','Auditiva (S/N): N'].forEach(s=>ok(t.includes(s),'la plantilla no trae «'+s+'»'));
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('prosoft_pinf: 0 fallos');
await b.close()})();
