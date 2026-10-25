// v189: soportes y evidencias (fotos en IndexedDB, ZIP), relación de actividades y medicamentos por vencer.
const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE: '+e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html'));
const F=await p.evaluate(async()=>{const F=[],ok=(c,m)=>{if(!c)F.push(m)};localStorage.clear();
 Object.keys(MD_SOP).forEach(()=>{});MD_SOP.forEach(s=>ok(EVI_REQ[s.slice(0,2)],'requisito '+s.slice(0,2)));
 /* medicamento vencido y uno por vencer */
 const ed={};ed[BQ[0].id]={v:'2026-01'};const d=new Date();d.setMonth(d.getMonth()+2);ed[BQ[1].id]={v:d.toISOString().slice(0,7)};S.set(BQ_KEY,JSON.stringify(ed));
 const mv=medVence();ok(mv.length>=2&&mv[0].e.k==='venc','vencimientos: '+mv.length);
 ok(mdTareas().some(t=>/devolver \d+ medicamento/.test(t)),'tarea de vencidos');
 const bl=medXlsx();ok(bl instanceof Blob&&bl.size>500,'excel');
 /* datos del periodo */
 const e=mdPeriodo();comSet([{id:'v1',com:'QUERARI',ini:e[1],fin:e[1],conc:{ok:true},edus:[{id:'e',fecha:e[1],temas:['x'],asist:12}],perm:{ok:false}}]);
 const A=sopAuto();ok(/1 de 1 comunidades con acta/.test(A['01'])&&/12 asistentes/.test(A['11']),'auto: '+A['01']+' / '+A['11']);
 home();ok($('md-sop'),'botón en Mi día');await sopOpen();ok(st.view==='sop'&&$('sop-xls'),'abre');
 ok(/RELACION DE ACTIVIDADES/.test($('sop-rel').value)&&/01 ACTA/.test($('sop-rel').value),'relación');
 /* foto */
 const c=document.createElement('canvas');c.width=2400;c.height=1200;c.getContext('2d').fillRect(0,0,10,10);const png=await new Promise(r=>c.toBlob(r,'image/png'));
 const red=await eviReducir(new File([png],'a.png',{type:'image/png'}));ok(red.type==='image/jpeg','reduce a jpg');
 await eviPut({id:'f1',per:e[0],sop:'02',fecha:hoy(),nota:'QUERARI certificado',nom:'a.png',blob:red});
 const L=await eviLista(e[0]);ok(L.length===1&&L[0].blob.size>0,'guardada en IndexedDB');
 await sopOpen();ok(document.querySelector('[data-evf="f1"]')&&$('sop-zip')&&document.querySelector('[data-evdl="02"]'),'galería y zip');ok(/1 evidencia/.test($('sop-rel').value),'relación con evidencias');
 const ck=document.querySelector('[data-sopok="02"]');ck.checked=true;ck.dispatchEvent(new Event('change'));ok(mdGet('dn2_sop_'+e[0])['02']===1,'soporte listo compartido con Mi día');
 const z=zipStore([['a/b.bin',new Uint8Array([1,2,3])]]);ok(z.size>100,'zip binario');
 await eviDel('f1');ok((await eviLista(e[0])).length===0,'borrar');
 calConf=()=>({salida:'2026-01-01'});obOpen();ok($('ob-med')&&/vencidos/.test($('ob-med').textContent),'aviso en obligaciones');ok(OB.some(x=>x[0]==='m_venc'),'obligación mensual');
 return F});
const all=F.concat(errs);if(all.length){console.log('FALLAS:\n'+all.join('\n'));process.exitCode=1}else console.log('soportes_evidencias: 0 fallos');
await b.close()})();
