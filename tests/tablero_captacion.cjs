// v139: el tablero de captación — agrupa por comunidad, clasifica y no inventa gente
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));

const R=await p.evaluate(()=>{
 const fails=[],ok=(c,m)=>{if(!c)fails.push(m)};
 const dIso=n=>{const d=pD(hoy());d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const nac=anos=>{const d=pD(hoy());d.setUTCFullYear(d.getUTCFullYear()-anos);return d.toISOString().slice(0,10)};

 /* --- siembra: 7 personas en 3 comunidades, en todos los estados --- */
 const sembrar=()=>{
  localStorage.clear();
  const P={},A=[];
  const añadir=(doc,nom,com,edad,prox,mot,pend)=>{
   const ident={'NOMBRE COMPLETO':nom,'TIPO':'CC','DOCUMENTO ID.':doc,'FECHA NACIMIENTO':nac(edad),'GENERO':'F',__com:com};
   P[(ident.TIPO)+':'+doc]={n:Object.keys(P).length+1,creado:hoy(),ident,aten:[{fecha:hoy(),cons:'X',regid:'r'+doc}],
     pend:(pend||[]).map((t,i)=>({id:'p'+doc+i,t,desde:hoy(),ok:''}))};
   if(prox!==null)A.push({id:'a'+doc,doc,nom,tel:'300'+doc,com,fecha:hoy(),prox:dIso(prox),mot:mot||'CONTROL',ok:''});};
  añadir('1','ANA VENCIDA','QUERARÍ',70,-30,'VEJEZ: VALORACIÓN',[]);
  añadir('2','BETO VENCIDO','QUERARÍ',8,-90,'INFANCIA: VALORACIÓN',['Tomar los exámenes pendientes']);
  añadir('3','CARLA SEMANA','QUERARÍ',25,3,'JUVENTUD: VALORACIÓN',[]);
  añadir('4','DORA VENCIDA','BERLIN',40,-5,'ADULTEZ: VALORACIÓN',[]);
  añadir('5','ELI ALDIA','BERLIN',3,60,'PRIMERA INFANCIA: VALORACIÓN',[]);
  añadir('6','FELIX PENDIENTE','MITÚ',55,null,'',['Verificar que asistió a medicina general','Seguir resultado reactivo']);
  añadir('7','GINA ALDIA','MITÚ',15,45,'ADOLESCENCIA: VALORACIÓN',[]);
  localStorage.setItem('dn2_pacientes',JSON.stringify(P));
  localStorage.setItem('dn2_agenda',JSON.stringify(A));};

 /* ===== 1. las filas salen completas y bien clasificadas ===== */
 sembrar();
 const F=capFilas();
 ok(F.length===7,'esperaba 7 personas, salieron '+F.length);
 const byNom=n=>F.find(f=>f.nom===n);
 const cls=f=>f.dd==null?(f.pend.length?'pen':'ok'):f.dd<0?'ven':f.dd<=7?'sem':'ok';
 ok(cls(byNom('ANA VENCIDA'))==='ven','ANA debía salir vencida');
 ok(cls(byNom('CARLA SEMANA'))==='sem','CARLA debía salir de esta semana');
 ok(cls(byNom('ELI ALDIA'))==='ok','ELI debía salir al día');
 ok(cls(byNom('FELIX PENDIENTE'))==='pen','FELIX debía salir como solo pendientes');
 ok(byNom('ANA VENCIDA').dd===-30,'los días de ANA están mal: '+byNom('ANA VENCIDA').dd);

 /* ===== 2. el grupo de curso de vida se deduce de la edad ===== */
 const G={'ANA VENCIDA':'Vejez','BETO VENCIDO':'Infancia','CARLA SEMANA':'Juventud',
          'DORA VENCIDA':'Adultez','ELI ALDIA':'Primera infancia','FELIX PENDIENTE':'Adultez','GINA ALDIA':'Adolescencia'};
 Object.entries(G).forEach(([n,g])=>ok(byNom(n).grupo===g,n+' quedó en el grupo "'+byNom(n).grupo+'", esperaba "'+g+'"'));

 /* ===== 3. comunidad, teléfono y pendientes llegan ===== */
 ok(byNom('ANA VENCIDA').com==='QUERARÍ','la comunidad de ANA no llegó: '+byNom('ANA VENCIDA').com);
 ok(byNom('ANA VENCIDA').tel==='3001','el teléfono no llegó: '+byNom('ANA VENCIDA').tel);
 ok(byNom('BETO VENCIDO').pend.length===1,'BETO debía traer 1 pendiente');
 ok(byNom('FELIX PENDIENTE').pend.length===2,'FELIX debía traer 2 pendientes');
 ok(byNom('ELI ALDIA').pend.length===0,'ELI no debía traer pendientes');

 /* ===== 4. una persona con control Y pendientes es UNA sola fila ===== */
 ok(F.filter(f=>f.nom==='BETO VENCIDO').length===1,'BETO se duplicó: sale en agenda y en pendientes');
 ok(byNom('BETO VENCIDO').dd===-90&&byNom('BETO VENCIDO').pend.length===1,'BETO perdió el control o el pendiente al unirse');

 /* ===== 5. el HTML agrupa por comunidad y ordena por vencidos ===== */
 const h=capHTML();
 ['QUERARÍ','BERLIN','MITÚ'].forEach(c=>ok(h.includes(c),'el tablero no muestra la comunidad '+c));
 ok(h.indexOf('QUERARÍ')<h.indexOf('BERLIN'),'QUERARÍ (2 vencidos) debía ir antes que BERLIN (1)');
 ok(h.indexOf('BERLIN')<h.indexOf('MITÚ'),'BERLIN (1 vencido) debía ir antes que MITÚ (0)');
 ok(/3 vencidos/.test(h),'el resumen no cuenta los 3 vencidos: '+(h.match(/\d+ vencidos?/g)||[]).join(','));
 ok(/1 esta semana/.test(h),'el resumen no cuenta el de esta semana');
 ok(/1 solo pendientes/.test(h),'el resumen no cuenta el de solo pendientes');
 ok(/Vencido hace 30 días/.test(h),'no muestra hace cuánto venció');
 ok(/Primera infancia|primera infancia/.test(h),'no muestra el desglose por grupo');

 /* ===== 6. sin datos no inventa nada ===== */
 localStorage.clear();
 ok(capFilas().length===0,'sin datos el tablero devolvió filas');
 const vacio=capHTML();
 ok(/Todav[ií]a no hay a qui[eé]n buscar/.test(vacio),'sin datos no muestra el mensaje de vacío');
 ok(!/vencido/i.test(vacio),'sin datos habla de vencidos');

 /* ===== 7. un control ya cumplido sale de la lista ===== */
 sembrar();
 const ag=JSON.parse(localStorage.getItem('dn2_agenda'));
 ag.find(x=>x.doc==='1').ok=hoy();
 localStorage.setItem('dn2_agenda',JSON.stringify(ag));
 const F2=capFilas(),ana=F2.find(f=>f.nom==='ANA VENCIDA');
 ok(!ana||ana.dd==null,'ANA ya vino: no debía seguir contando como vencida');

 /* ===== 8. un pendiente cerrado desaparece ===== */
 sembrar();
 const ps=JSON.parse(localStorage.getItem('dn2_pacientes'));
 ps['CC:6'].pend.forEach(z=>z.ok=hoy());
 localStorage.setItem('dn2_pacientes',JSON.stringify(ps));
 const felix=capFilas().find(f=>f.nom==='FELIX PENDIENTE');
 ok(!felix,'FELIX sin pendientes ni control no debía aparecer');

 /* ===== 9. persona sin fecha de nacimiento no rompe nada ===== */
 sembrar();
 const ps2=JSON.parse(localStorage.getItem('dn2_pacientes'));
 delete ps2['CC:1'].ident['FECHA NACIMIENTO'];
 localStorage.setItem('dn2_pacientes',JSON.stringify(ps2));
 let h2='';try{h2=capHTML()}catch(e){ok(false,'sin fecha de nacimiento lanzó excepción: '+e.message)}
 ok(h2.length>200,'sin fecha de nacimiento el tablero quedó vacío');
 ok(!/undefined|NaN|null/.test(h2),'el tablero muestra undefined/NaN/null: '+(h2.match(/.{0,40}(undefined|NaN|null).{0,40}/)||[])[0]);

 /* ===== 10. la pantalla se abre sin romperse ===== */
 sembrar();
 try{verCaptacion()}catch(e){ok(false,'verCaptacion lanzó excepción: '+e.message)}
 ok(st.view==='cap','la vista no quedó en cap');
 ok(document.getElementById('cap-l'),'no se pintó el tablero');
 ok(document.querySelectorAll('[data-cap-pk]').length===7,'faltan botones para abrir pacientes: '+document.querySelectorAll('[data-cap-pk]').length);

 /* ===== 11. el botón aparece en el inicio con su conteo ===== */
 sembrar();
 try{home()}catch(e){ok(false,'home() lanzó excepción tras el tablero: '+e.message)}
 const t=document.getElementById('t-cap');
 ok(t,'no se agregó el botón «A quién buscar» al inicio');
 ok(t&&/3 vencidos/.test(t.textContent),'el botón no muestra el conteo: '+(t?t.textContent:''));
 ok(document.getElementById('t-pacs'),'el botón de pacientes desapareció del inicio');
 // y home() dos veces no lo duplica
 home();
 ok(document.querySelectorAll('#t-cap').length===1,'el botón se duplicó al volver al inicio');
 // sin datos el botón sigue, con otro texto
 localStorage.clear();home();
 const t2=document.getElementById('t-cap');
 ok(t2&&!/vencido/.test(t2.textContent),'sin datos el botón habla de vencidos: '+(t2?t2.textContent:''));

 return fails;
});
await b.close();
if(R.length){console.log('FALLOS ('+R.length+'):');R.forEach(f=>console.log(' -',f));process.exit(1)}
console.log('tablero_captacion: 0 fallos');
})();
