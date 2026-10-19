// v171: los instrumentos de PROSOFT (discapacidades, revisión por sistemas, signos con Glasgow,
// visión por ojo y genograma) también en infancia, adolescencia, juventud, adultez y vejez, sin repetir.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const persona=(anios,sx)=>{localStorage.clear();const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-anios);d.setUTCDate(d.getUTCDate()-10);
  setPac({'NOMBRE COMPLETO':'ANA','TIPO':'CC','DOCUMENTO ID.':'9','GENERO':sx,'FECHA NACIMIENTO':d.toISOString().slice(0,10),'__com':'MITU'})};
 [['inf',8],['adol',14],['juv',22],['adul',40],['vej',70]].forEach(([m,a])=>{persona(a,'F');openMod(m);
  const q=ivFor(m),L=q.map(x=>x.l),W=q.map(x=>x.widget);
  ['discap','rxsps','signosps','visionps','genograma'].forEach(w=>ok(W.filter(x=>x===w).length===1,m+': debe tener una vez el instrumento '+w));
  ok(!L.some(l=>/^Signos vitales: FC/.test(l)),m+': quedó la pregunta vieja de signos');ok(!L.includes('Agudeza visual y audición'),m+': quedó la pregunta vieja de visión');
  ok(L.filter(l=>/^Visión/.test(l)).length===1,m+': una sola pregunta de visión');
  const t=plGenerar('MODULO',m);['Glasgow motora (1 a 6): 6','Snellen OD','Sistema psiquiátrico: NORMAL','Auditiva (S/N): N','Hermano 6'].forEach(s=>ok(t.includes(s),m+': la plantilla no trae «'+s+'»'));
  if(m==='inf'){ok(t.includes('Reflejo rojo'),'inf: reflejo rojo');ok(!/Fija y sigue/i.test(t),'inf: fija y sigue es solo de primera infancia')}
  else ok(!/Reflejo rojo|Leucocoria/i.test(t),m+': reflejo rojo y leucocoria son de la niñez');
  if(['juv','adul','vej'].includes(m)){ok(!/Perímetro abdominal \(cm\):/.test(t.split('Signos vitales, Glasgow')[1]?.split('[')[0]||''),m+': la cintura ya está en Estado nutricional');
   ok(/Orientado/.test(WIDGET.signosps.html(m)),m+': Glasgow verbal de adulto')}
 });
 /* alertas por edad */
 persona(40,'M');openMod('adul');S.set(key('adul','sgn'),JSON.stringify({tas:'150',tad:'95',fc:'110',fr:'28',go:'4',gv:'5',gm:'6'}));
 let s=WIDGET.signosps.txt('adul');ok(/140\/90 o más/.test(s),'tensión alta en adulto: '+s);ok(/fuera del rango de la edad \(60 a 100\)/.test(s),'FC de adulto: '+s);ok(/límite 25/.test(s),'FR de adulto: '+s);
 S.set(key('adul','sgn'),JSON.stringify({tas:'170',tad:'100'}));ok(/remite hoy/.test(WIDGET.signosps.txt('adul')),'tensión muy alta');
 ok(/Ginecológico: NO APLICA/.test(WIDGET.rxsps.txt('adul')),'hombre: ginecológico no aplica');
 /* la plantilla llena pasa a los instrumentos */
 persona(70,'F');openMod('vej');ok(WIDGET.visionps.desdeTexto('vej',['Snellen OI (20/__): 20/60','Snellen OD (20/__): 20/30','Distancia de valoración: 6 metros']),'visión desde texto');
 const vt=WIDGET.visionps.txt('vej');ok(/OD 20\/30, OI 20\/60/.test(vt),'visión de vejez: '+vt);ok(!/reflejo rojo|leucocoria/i.test(vt),'sin reflejo rojo en vejez: '+vt);
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('prosoft_cursos: 0 fallos');
await b.close()})();
