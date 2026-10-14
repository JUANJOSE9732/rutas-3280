// Prueba de ida y vuelta contra un receptor que imita al Apps Script:
// llena el formulario base, guarda, y comprueba qué llega "a la hoja",
// incluidos el modo sin señal, el reintento y la actualización sin duplicar.
const { chromium } = require('playwright');
const http = require('http');

const COL_SEM = 'SEMAFORO PROXIMO CONTROL';
const CLAVE = 'clave-de-prueba';
// hoja simulada: una pestaña por comunidad, con encabezados que crecen solos
const HOJA = {};
let caidas = 0;          // cuántas respuestas deben fallar antes de aceptar
const recibido = [];

function escribir(reg) {
  const nombre = String(reg.comunidad || 'SIN COMUNIDAD').toUpperCase();
  const h = HOJA[nombre] || (HOJA[nombre] = { enc: [], filas: [] });
  const campos = reg.datos || {};
  const claves = Object.keys(campos);
  if (campos['FECHA PROXIMO CONTROL'] !== undefined && claves.indexOf(COL_SEM) < 0) claves.push(COL_SEM);
  claves.forEach(k => { if (h.enc.indexOf(k) < 0) h.enc.push(k); });
  const fila = {}; h.enc.forEach(k => fila[k] = campos[k] === undefined || campos[k] === null ? '' : campos[k]);
  const i = h.filas.findIndex(f => f.ID_REGISTRO && f.ID_REGISTRO === campos.ID_REGISTRO);
  if (i >= 0) h.filas[i] = fila; else h.filas.push(fila);
  return campos.ID_REGISTRO;
}

const srv = http.createServer((req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  if (req.method === 'GET') { res.writeHead(200, cors); return res.end(JSON.stringify({ ok: true, app: 'rutas-3280' })); }
  let body = ''; req.on('data', c => body += c);
  req.on('end', () => {
    if (caidas > 0) { caidas--; res.writeHead(500, cors); return res.end('fallo simulado'); }
    let d; try { d = JSON.parse(body) } catch (e) { res.writeHead(200, cors); return res.end(JSON.stringify({ ok: false, error: 'json' })) }
    recibido.push(d);
    if (d.clave !== CLAVE) { res.writeHead(200, cors); return res.end(JSON.stringify({ ok: false, error: 'clave' })) }
    const ids = (d.registros || []).map(escribir);
    res.writeHead(200, cors); res.end(JSON.stringify({ ok: true, ids }));
  });
});

(async () => {
const PORT = await new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv.address().port)));
const URL = 'http://127.0.0.1:' + PORT + '/exec';
const fails = []; const ok = (c, m) => { if (!c) fails.push(m) };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext();
const p = await ctx.newPage();
p.on('pageerror', e => fails.push('PAGE: ' + e.message));
await p.goto('file://' + require('path').join(__dirname, '..', 'index.html'));

// --- monta una consulta de vejez completa y abre el formulario base ---
const F = await p.evaluate(([url, clave]) => {
  localStorage.clear();
  const d = pD(hoy()); d.setUTCFullYear(d.getUTCFullYear() - 78);
  const F = hoy();
  S.set('dn2_conf', JSON.stringify({ url, key: clave, who: 'JUAN JOSE' }));
  setPac({ 'NOMBRE COMPLETO': 'MARIA YEPES', 'TIPO': 'CC', 'DOCUMENTO ID.': '11223344',
           'FECHA NACIMIENTO': d.toISOString().slice(0, 10), 'GENERO': 'F', '__com': 'MITÚ',
           'ETNIA': 'INDIGENA', 'PUEBLO': 'CUBEO' });
  st.mod = 'vej'; st.view = 'mod'; S.set(key('vej', 'fecha'), F);
  S.set(key('vej', 'bar'), JSON.stringify({ com:"10",tra:"10",ase:"5",ret:"5",ban:"0",des:"10",esc:"5",ves:"5",hec:"10",ori:"5" }));
  S.set(key('vej', 'fri'), JSON.stringify({ pes:"1",ago:"1",act:"1",mar:"0",deb:"1" }));
  S.set(key('vej', 'tug'), JSON.stringify({ seg: "18" }));
  S.set(key('vej', 'zar'), JSON.stringify({ z1:"3",z2:"3",z3:"2",z4:"3",z5:"3",z6:"2",z7:"3" }));
  S.set(key('vej', 'fdr'), JSON.stringify({ edad:"4",imc:"1",cint:"4",act:"2",fru:"1",hta:"2",glu:"0",fam:"3",__oms:"20-30" }));
  const q = ivFor('vej'), a = {};
  q.forEach((x, i) => { if (x.widget && ['funcional','caidas','cogvej','apoyo','findrisc'].includes(x.widget)) a[i] = WIDGET[x.widget].txt('vej') });
  const kn = q.findIndex(z => /Estado nutricional/.test(z.l || ''));
  if (kn >= 0) a[kn] = 'Peso 48 kg, talla 1,52 m. TA 150/92, FC 78, FR 18, temperatura 36,4, saturación 95 %.';
  S.set(key('vej', 'iv'), JSON.stringify(a)); S.set(key('vej', 'dict'), ivCompose('vej'));
  return F;
}, [URL, CLAVE]);

// --- SIN SEÑAL: guarda y encola, no pierde nada ---
await ctx.setOffline(true);
await p.evaluate(() => { Object.defineProperty(navigator, 'onLine', { get: () => false, configurable: true }); });
await p.evaluate(() => enviarBase('vej'));
await p.waitForTimeout(400);
const guardado = await p.evaluate(() => {
  const btn = document.getElementById('b-save'); if (!btn) return { err: 'no se abrió el formulario base' };
  const form = btn.closest('form'); if (!form) return { err: 'el botón guardar no está dentro de un formulario' };
  form.requestSubmit ? form.requestSubmit(btn) : btn.click();
  return { ok: true };
});
ok(!guardado.err, 'no se pudo guardar: ' + guardado.err);
await p.waitForTimeout(600);
const trasOffline = await p.evaluate(() => ({ cola: cola().length, arch: archivo().length, txt: (document.getElementById('syncTxt') || {}).textContent || '' }));
ok(trasOffline.cola === 1, 'sin señal el registro debía quedar en la cola, hay ' + trasOffline.cola);
ok(trasOffline.arch === 1, 'sin señal el registro debía quedar en el archivo local, hay ' + trasOffline.arch);
ok(recibido.length === 0, 'se intentó enviar estando sin señal');
ok(/sin señal|pendiente|Enviando/i.test(trasOffline.txt), 'el mensaje al usuario no explica que quedó pendiente: "' + trasOffline.txt + '"');

// --- VUELVE LA SEÑAL pero el servidor falla una vez: no debe perder el registro ---
caidas = 1;
await ctx.setOffline(false);
await p.evaluate(() => { Object.defineProperty(navigator, 'onLine', { get: () => true, configurable: true }); });
await p.evaluate(() => sync(true));
await p.waitForTimeout(800);
const trasFallo = await p.evaluate(() => ({ cola: cola().length, txt: (document.getElementById('syncTxt') || {}).textContent || '' }));
ok(trasFallo.cola === 1, 'tras un fallo del servidor el registro debía seguir en la cola, hay ' + trasFallo.cola);
ok(/no se pudo enviar|pendiente/i.test(trasFallo.txt), 'no avisa del fallo de envío: "' + trasFallo.txt + '"');

// --- REINTENTO BUENO ---
await p.evaluate(() => sync(true));
await p.waitForTimeout(900);
const trasEnvio = await p.evaluate(() => ({ cola: cola().length, arch: archivo().length }));
ok(trasEnvio.cola === 0, 'tras enviar bien la cola debía quedar vacía, hay ' + trasEnvio.cola);
ok(trasEnvio.arch === 1, 'el archivo local no debe vaciarse al enviar');

// --- QUÉ LLEGÓ A LA HOJA ---
const hoja = HOJA['MITÚ'];
ok(hoja, 'no se creó la pestaña MITÚ en la hoja');
const fila = hoja && hoja.filas[0];
ok(hoja && hoja.filas.length === 1, 'la hoja debía tener una fila, tiene ' + (hoja ? hoja.filas.length : 0));

const esperado = {
  'ID_REGISTRO': v => !!v, 'FECHA_REGISTRO': v => !!v, 'REGISTRADO_POR': v => v === 'JUAN JOSE',
  'NOMBRE COMPLETO': v => v === 'MARIA YEPES', 'DOCUMENTO ID.': v => v === '11223344',
  'GENERO': v => v === 'F', 'ETNIA': v => v === 'INDIGENA', 'PUEBLO': v => v === 'CUBEO',
  'FECHA': v => v === F, 'EDAD': v => String(v) === '78', 'CURSO DE VIDA': v => v === 'VEJEZ',
  'T. A': v => v === '150/92', 'F.C': v => String(v) === '78', 'SPO2': v => String(v) === '95',
  'PESO': v => String(v) === '48', 'TALLA': v => String(v) === '1.52', 'IMC': v => !!v,
  'ATENCION INTEGRAL ENFERMERIA': v => v === 'SI',
  'RIESGO CARDIOVASCULAR': v => v === 'SI',
  'CANALIZADO A': v => String(v).includes('MEDICINA GENERAL'),
  'OBSERVACION': v => !!v, 'FECHA PROXIMO CONTROL': v => !!v, [COL_SEM]: v => v === '' || !!v };
Object.entries(esperado).forEach(([k, f]) => {
  if (!fila) return;
  ok(hoja.enc.includes(k), 'la columna ' + k + ' no llegó a la hoja');
  ok(f(fila[k]), 'la columna ' + k + ' llegó con valor inesperado: ' + JSON.stringify(fila[k]));
});

// toda columna enviada debe ser una columna real del Excel
const COLS = await p.evaluate(() => colsDe());
(hoja ? hoja.enc : []).forEach(k => ok(COLS.includes(k), 'se envió la columna "' + k + '", que no existe en el Excel'));

// --- CORRECCIÓN: reenviar el mismo registro actualiza la fila, no duplica ---
await p.evaluate(() => {
  const r = archivo()[0]; r.datos['TELEFONO'] = '3001234567'; r.datos['OBSERVACION DE CANALIZACION'] = 'Corrección de prueba';
  setCola([r]);
});
await p.evaluate(() => sync(true));
await p.waitForTimeout(900);
ok(hoja && hoja.filas.length === 1, 'al corregir se duplicó la fila: hay ' + (hoja ? hoja.filas.length : 0));
ok(hoja && hoja.filas[0]['TELEFONO'] === '3001234567', 'la corrección no llegó a la hoja');
ok(hoja && hoja.filas[0]['NOMBRE COMPLETO'] === 'MARIA YEPES', 'la corrección borró datos de la fila');
ok(hoja && hoja.enc.includes('OBSERVACION DE CANALIZACION'), 'la hoja no agregó la columna nueva al corregir');

// --- CLAVE EQUIVOCADA: avisa y no pierde el registro ---
await p.evaluate(() => {
  const c = conf(); S.set('dn2_conf', JSON.stringify(Object.assign({}, c, { key: 'clave-mala' })));
  const r = archivo()[0]; r.id = 'otro-' + Date.now(); r.datos.ID_REGISTRO = r.id; setCola([r]);
});
await p.evaluate(() => sync(true));
await p.waitForTimeout(900);
const trasClave = await p.evaluate(() => ({ cola: cola().length, txt: (document.getElementById('syncTxt') || {}).textContent || '' }));
ok(trasClave.cola === 1, 'con la clave equivocada el registro debía quedar en la cola');
ok(/clave/i.test(trasClave.txt), 'con la clave equivocada no se avisa al usuario: "' + trasClave.txt + '"');

// --- EXPORTACIÓN LOCAL A EXCEL ---
const exp = await p.evaluate(async () => { try { const r = await exportarExcel(); return String(r) } catch (e) { return 'ERROR: ' + e.message } });
ok(exp !== 'vacio', 'la exportación a Excel no encontró registros');
ok(!/^ERROR/.test(exp), 'la exportación a Excel falló: ' + exp);

await b.close(); srv.close();
console.log('columnas que llegaron a la hoja (' + (hoja ? hoja.enc.length : 0) + '):');
console.log((hoja ? hoja.enc : []).join(' | '));
if (fails.length) { console.log('\nFALLOS (' + fails.length + '):'); fails.forEach(f => console.log(' -', f)); process.exit(1) }
console.log('\nsync_google_sheet: 0 fallos');
})();
