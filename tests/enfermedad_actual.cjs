// v147: plantilla de Enfermedad actual en primera infancia e infancia
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const R=await p.evaluate(()=>{
 const F=[],ok=(c,m)=>{if(!c)F.push(m)};
 const monta=(mod,anos,g)=>{localStorage.clear();const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-anos);d.setUTCMonth(d.getUTCMonth()-6);
  setPac({'NOMBRE COMPLETO':'DAMIÁN RÍOS','TIPO':'RC','DOCUMENTO ID.':'7','FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':g,'__com':'ACARICUARA','ETNIA':'INDIGENA','PUEBLO':'TUYUCA',
   __mad:{rel:'HIJO(A) DE',nom:'ALFONSINA RIOS LOPEZ',tip:'CC',doc:'1'}});st.mod=mod;S.set(key(mod,'fecha'),hoy())};
 const W=WIDGET.enfactual;
 /* 1. es la primera pregunta en ambos módulos */
 ['pinf','inf'].forEach(m=>{const q=ivFor(m);ok(q[0].widget==='enfactual','primera pregunta de '+m+' no es Enfermedad actual');ok(q[0].b==='Motivo y enfermedad actual','bloque propio en '+m);
  ok(q.filter(z=>z.widget==='enfactual').length===1,'duplicada en '+m);ok(q.some(z=>z.widget==='vacunas'),'se perdió vacunas en '+m)});
 ok(!ivFor('adol').some(z=>z.widget==='enfactual'),'no debía estar en adolescencia');
 /* 2. sin tocar nada no escribe */
 monta('pinf',1,'M');ok(W.txt('pinf')==='','sin tocar no debía escribir');
 /* 3. niño sano con su mamá */
 S.set(key('pinf','ea'),JSON.stringify({par:'madre',est:'asin',p_beber:0,p_vomita:0,p_conv:0,p_letar:0,lac:'comp',ape:'bueno',sue:'ok',eli:'ok'}));
 const t=W.txt('pinf');
 ok(/sexo masculino, de 1 año y 6 meses/.test(t),'edad o sexo: '+t);
 ok(/pueblo Tuyuca/.test(t)&&/comunidad de Acaricuara/.test(t),'pueblo o comunidad: '+t);
 ok(/su madre, Alfonsina Rios Lopez,/.test(t),'acompañante: '+t);
 ok(/asintomático/.test(t)&&/Niega signos generales de peligro/.test(t),'estado o peligro: '+t);
 ok(/leche materna y alimentación complementaria, con buen apetito/.test(t),'alimentación: '+t);
 ok(!/____/.test(t),'no debía quedar en blanco: '+t);
 /* 4. signo de peligro: alerta */
 S.set(key('pinf','ea'),JSON.stringify({par:'madre',est:'sint',s_fiebre:1,s_diarrea:1,dias:'3',p_vomita:1,p_beber:0,p_conv:0,p_letar:0}));
 const t2=W.txt('pinf');ok(/3 días de evolución consistente en fiebre y deposiciones diarreicas/.test(t2),'cuadro: '+t2);
 ok(/signo general de peligro: vomita todo/.test(t2),'peligro: '+t2);
 const q=ivFor('pinf'),a={0:t2};S.set(key('pinf','iv'),JSON.stringify(a));ok(ivAlerts('pinf').some(x=>/AIEPI/.test(x)),'no generó alerta');
 /* 5. infancia: niña, escolaridad, sin peligro AIEPI */
 monta('inf',9,'F');S.set(key('inf','ea'),JSON.stringify({par:'abuela',est:'asin',esc:'si',grado:'Cuarto de primaria'}));
 const t3=W.txt('inf');ok(/sexo femenino, de 9 años/.test(t3)&&/su abuela/.test(t3)&&/Cursa cuarto de primaria/.test(t3)&&/asintomática/.test(t3),'infancia: '+t3);
 ok(!/peligro/.test(t3),'infancia no lleva signos AIEPI: '+t3);
 /* 6. exportar: dos campos separados */
 S.set(key('inf','iv'),JSON.stringify({0:t3}));const H=hcSecciones('inf');
 ok(H[1].t==='Motivo de consulta'&&H[2].t==='Enfermedad actual','orden en exportar: '+H.map(z=>z.t).join(' | '));
 ok(H[1].x.length<=200,'motivo pasa de 200 caracteres');ok(H[2].x===t3,'el texto exportado no coincide');
 ok(!H.some(z=>z.t==='Motivo y enfermedad actual'),'quedó duplicado el bloque');
 /* 7. la pantalla de la pregunta abre sin errores */
 monta('pinf',1,'M');openMod('pinf');
 return F});
// 8. interfaz: abrir la entrevista y tocar
await p.evaluate(()=>{localStorage.clear();const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-2);setPac({'NOMBRE COMPLETO':'X','FECHA NACIMIENTO':d.toISOString().slice(0,10),'GENERO':'F','__com':'MITU'});openMod('pinf');st.tab='entr';S.set(key('pinf','tab'),'entr');S.set(key('pinf','ivi'),'0');renderMod()});
await p.waitForTimeout(300);
const ui=await p.evaluate(()=>!!document.getElementById('ea-w'));
if(ui){await p.selectOption('[data-ea="est"]','asin');await p.click('#ea-pno');await p.selectOption('[data-ea="par"]','padre');}
const prev=ui?await p.textContent('#ea-prev'):'';
const F2=[];if(!ui)F2.push('no se pintó el formulario en la entrevista');if(ui&&!/su padre/.test(prev))F2.push('vista previa: '+prev);if(ui&&!/asintomática/.test(prev))F2.push('vista previa 2: '+prev);
const all=R.concat(F2).concat(errs.map(e=>'ERR '+e));
console.log(all.length?'FALLAS:\n'+all.join('\n'):'OK enfermedad_actual');
await b.close();process.exit(all.length?1:0)})();
