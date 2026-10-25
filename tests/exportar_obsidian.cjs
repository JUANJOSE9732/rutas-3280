// v191: exportar la nota del día a Obsidian (markdown con pacientes, telemedicina, comunidades y obligaciones).
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(async()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();const h=hoy();
 S.set('dn2_archivo',JSON.stringify([{id:'r1',comunidad:'QUERARI',datos:{FECHA:h,FECHA_REGISTRO:h+' 08:00','NOMBRE COMPLETO':'MARIA | PRUEBA','DOCUMENTO ID.':'123','EDAD':'25 AÑOS','TIPO DE ATENCION':'CONTROL PRENATAL'}},{id:'r2',comunidad:'QUERARI',datos:{FECHA:'2026-01-02',FECHA_REGISTRO:'2026-01-02 08:00','NOMBRE COMPLETO':'OTRO DIA'}}]));
 S.set(TM_KEY,JSON.stringify([{id:'t',fecha:h,hora:'09:00',pac:'MARIA PRUEBA',doc:'123',com:'QUERARI',niv:'u',med:'PEREZ',mot:'Sangrado',cond:'Remitir',ruta:Object.keys(DIR_RUTAS)[0],rem:'si'}]));
 comSet([{id:'v1',com:'QUERARI',zona:'VAUPES MEDIO',ini:h,fin:h,conc:{ok:true},edus:[{id:'e',fecha:h,temas:['Lactancia materna'],asist:9}],perm:{ok:false}}]);
 obSetChk('d','d_pro',1);
 const n=obsNota(h);
 ok(/^---\ntags: \[yurupari, diario\]\nfecha: /.test(n),'frontmatter');
 ok(n.includes('semana_epidemiologica: '+seDe(h).n),'semana');
 ok(n.includes('MARIA / PRUEBA')&&n.includes('| 123 |')&&n.includes('CONTROL PRENATAL'),'paciente en tabla sin romperla');
 ok(!n.includes('OTRO DIA'),'solo el día pedido');
 ok(/atenciones: 1/.test(n)&&/telemedicinas: 1/.test(n),'conteos');
 ok(/MARIA PRUEBA · .*Dr\(a\)\. PEREZ.*Remitido/.test(n),'telemedicina');
 ok(n.includes('### QUERARI')&&n.includes('[x] Acta de concertación (01)')&&n.includes('[ ] Certificado de permanencia (02)')&&n.includes('Lactancia materna · 9 asistentes'),'comunidad');
 ok(n.includes('- [x] Registrar en Prosoft'),'obligación marcada');
 ok(n.includes('[[00 Inicio Yurupari]]')&&n.includes('Cuenta de cobro del'),'enlaces y entrega');
 home();ok($('md-obs'),'botón en Mi día');obsOpen();ok(st.view==='obs'&&$('obs-md').value===n.replace(/exportado: .*/,m=>$('obs-md').value.match(/exportado: .*/)[0]),'vista');
 $('obs-f').value='2026-01-02';$('obs-f').dispatchEvent(new Event('change'));ok($('obs-md').value.includes('OTRO DIA'),'cambia de día');
 return F});
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null),p.click('#obs-dl')]);
if(!dl||dl.suggestedFilename()!=='2026-01-02.md')F.push('descarga: '+(dl&&dl.suggestedFilename()));
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('exportar_obsidian: 0 fallos');
await b.close()})();
