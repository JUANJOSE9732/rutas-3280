// Batería de coherencia: cientos de casos con historial, verificando reglas que nunca deben romperse
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await (await b.newContext()).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const res=await p.evaluate(()=>{const fails=[],cnt={};let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const HOY=hoy(),mod=m=>m<72?"pinf":m<144?"inf":"adol",tipo=m=>m<72?"antropoPI":"antropoNNA";
  const tallaZ=(sx,m,z)=>whoVal(m<24?"len":m<60.5?"hei":"h07",sx,Math.min(m,228),z),imcZ=(sx,m,z)=>whoVal(m<24?"bmi0":m<60.5?"bmi2":"b07",sx,Math.min(m,228),z);
  const escen=["normal","caida","recupera","talla_sube_imposible","talla_baja","peso_improbable","sin_hist","estable_bajo"];
  for(let n=0;n<1200;n++){const sx=rnd()<.5?"M":"F",mNow=Math.round(3+rnd()*210),gap=Math.round(3+rnd()*18),mPrev=mNow-gap;if(mPrev<1)continue;const esc=escen[Math.floor(rnd()*escen.length)];
    const fn=(()=>{const d=pD(HOY);d.setUTCDate(d.getUTCDate()-Math.round(mNow*30.4375));return d.toISOString().slice(0,10)})(),fPrev=(()=>{const d=pD(fn);d.setUTCDate(d.getUTCDate()+Math.round(mPrev*30.4375));return d.toISOString().slice(0,10)})();
    let z0=(rnd()-.5)*2,zi0=(rnd()-.5)*2,z1=z0,zi1=zi0;
    if(esc==="caida"){zi1=zi0-1.6}if(esc==="recupera"){z0=-2.5;z1=-2.0;zi0=-1.8;zi1=-1}if(esc==="estable_bajo"){z0=-2.4;z1=-2.45;zi0=0;zi1=0.1}
    let tPrev=tallaZ(sx,mPrev,z0),tNow=tallaZ(sx,mNow,z1);
    let pPrev=imcZ(sx,mPrev,zi0)*Math.pow(tPrev/100,2),pNow=imcZ(sx,mNow,zi1)*Math.pow(tNow/100,2);
    if(esc==="talla_sube_imposible")tNow=tallaZ(sx,mNow,z0)+20+rnd()*10;if(esc==="talla_baja")tNow=tPrev-3-rnd()*5;if(esc==="peso_improbable"&&mNow>=24&&gap<=8){pNow=pPrev*1.9}
    localStorage.clear();const I={'NOMBRE COMPLETO':'T'+n,'TIPO':'TI','DOCUMENTO ID.':String(9000+n),'FECHA NACIMIENTO':fn,'GENERO':sx};
    if(esc!=="sin_hist")pacienteAtencion(mod(mPrev),'Q',Object.assign({},I,{FECHA:fPrev,PESO:String(Math.round(pPrev*10)/10),TALLA:String(Math.round(tPrev*10)/10)}),'h'+n);
    setPac(Object.assign({},I,{__com:'Q'}));const id=mod(mNow);st.mod=id;st.view="mod";S.set(key(id,"fecha"),HOY);
    const r=cvCalc(tipo(mNow),{peso:String(Math.round(pNow*10)/10),talla:String(Math.round(tNow*10)/10)});
    const all=[r.txt,...(r.al||[]),...(r.it?r.it.dx.concat(r.it.val,r.it.acc):[])].join(" | ");cnt[esc]=(cnt[esc]||0)+1;
    const F=m=>fails.push(esc+" n="+n+" edad="+mNow+"m: "+m);
    if(/NaN|undefined|null|\[object/.test(all))F("texto con NaN/undefined");
    if(/\b1 meses|\b1 años|\b1 días|\.\.|  /.test(all))F("gramática: "+(all.match(/\b1 meses|\b1 años|\b1 días|\.\.|  /)||[])[0]);
    if(/talla para la edad[^|]{0,60}ganancia de peso/i.test(all))F("confunde talla con peso");
    if(/estable en el mismo canal/.test(all)&&/talla para la edad bajó/i.test(all))F("dice estable y deterioro a la vez");
    const imp=/imposible|no disminuye|improbable/i.test(all);
    if((esc==="talla_sube_imposible"||esc==="talla_baja")&&!imp)F("no detectó talla imposible");
    if(esc==="peso_improbable"&&mNow>=24&&gap<=8&&!imp)F("no detectó peso improbable");
    const impT=/imposible|no disminuye/i.test(all),impP=/peso improbable/i.test(all);if(impT&&/talla para la edad (bajó|subió|mejoró)|estable en el mismo canal/i.test(all))F("concluyó sobre la talla con talla dudosa");if((impT||impP)&&/(peso para la talla|IMC para la edad) (bajó|subió|mejoró)/i.test(all))F("concluyó sobre peso/IMC con medida dudosa");
    if(esc==="normal"&&imp)F("falso positivo de medida imposible: "+all.match(/[^|]*(imposible|improbable|no disminuye)[^|]*/i)[0].slice(0,140));
    if(esc==="caida"&&!/bajó|Perdió|Desnutrición|delgadez|Riesgo de/.test(all)&&mNow>=24)F("no detectó la caída de peso/IMC");
    if(esc==="recupera"&&/bajó/.test(all))F("dijo deterioro en una recuperación");
    if(/Estado nutricional adecuado/.test(all)&&((r.al&&r.al.length)||/bajó|Perdió|imposible|improbable/.test(all)))F("dice adecuado pero hay alertas o deterioro");
  }
  return {fails,cnt}});
console.log('Casos:',JSON.stringify(res.cnt));console.log('Fallos:',res.fails.length);res.fails.slice(0,40).forEach(f=>console.log(' -',f));
await b.close()})();
