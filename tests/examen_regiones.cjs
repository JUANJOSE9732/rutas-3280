// v173: examen físico por regiones en la valoración integral, con pruebas y hallazgos frecuentes.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};const L='Examen físico por sistemas, de cabeza a pies';
 const E={pinf:['Cabeza y fontanelas','Caderas','Columna','Extremidades y pies','Piel'],inf:['Columna (escoliosis)','Extremidades y pies','Genitales y desarrollo puberal'],adol:['Columna (escoliosis)'],juv:['Pies','Brazos y manos','Piernas'],adul:['Pies','Columna y espalda','Piel'],vej:['Pies','Piel','Piernas']};
 const T={pinf:/Ortolani/,inf:/Adams/,adul:/hallux valgus/,vej:/Lesión por presión/};
 Object.keys(E).forEach(m=>{const q=ivFor(m),x=q.find(z=>z.l===L);ok(x&&x.sistemas,m+': el examen no va por regiones');if(!x)return;
  const R=SISTEMAS[x.sistemas];ok(new Set(R.map(c=>c.k)).size===R.length,m+': claves de región repetidas');
  E[m].forEach(l=>ok(R.some(c=>c.l===l),m+': falta la región '+l));ok(!(x.c||[]).length,m+': no deben quedar las opciones viejas');
  R.forEach(c=>ok(c.n&&c.o&&c.x&&c.x.length&&c.r,m+': región incompleta '+c.l));
  if(T[m])ok(R.some(c=>(c.g||[]).some(g=>T[m].test(g))),m+': falta la guía '+T[m]);
  const t=plGenerar('MODULO',m);ok(R.every(c=>t.includes('  '+c.l+': ')),m+': la plantilla no trae las regiones')});
 /* plantilla llena → regiones */
 let t=plGenerar('MODULO','adul').replace('Nombre completo: ','Nombre completo: PEDRO RUIZ');
 const lab=s=>s;t=t.split('\n').map(l=>{if(/^\s*Tipo de documento/i.test(l))return l.replace(/:.*/,': CC');if(/^\s*Número de documento/i.test(l))return l.replace(/:.*/,': 123');if(/^\s*Sexo/i.test(l))return l.replace(/:.*/,': M');if(/^\s*Edad/i.test(l))return l.replace(/:.*/,': 45');
  if(/^  Aspecto general: $/.test(l))return l+'N';if(/^  Pies: $/.test(l))return l+'juanete en pie derecho';if(/^  Tórax: corazón y pulmones: $/.test(l))return l+'soplo sistólico';return l}).join('\n');
 const r=plAplicar(t);ok(r.ok,'no se pudo pasar la plantilla: '+JSON.stringify(r));
 if(r.ok){const q=ivFor('adul'),i=q.findIndex(z=>z.l===L),a=ivAns('adul');ok(/Aspecto general: Buen estado general/.test(a[i]||'')&&/Pies: juanete en pie derecho\./.test(a[i]||'')&&/Tórax: corazón y pulmones: soplo sistólico/.test(a[i]||''),'regiones desde la plantilla: '+a[i]);
  const sx=JSON.parse(S.get(key('adul','sx'+i))||'{}');ok(sx.pies==='juanete en pie derecho','casillas cargadas: '+JSON.stringify(sx))}
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('examen_regiones: 0 fallos');
await b.close()})();
