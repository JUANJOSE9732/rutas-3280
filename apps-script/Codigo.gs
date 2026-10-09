/**
 * Rutas 3280 – receptor de registros para Google Sheets.
 *
 * Recibe los registros que envía la aplicación y los escribe en esta hoja de cálculo,
 * una pestaña por comunidad. Si llega una columna nueva, la agrega al final.
 * Si llega un registro que ya existe (mismo ID_REGISTRO), actualiza su fila en vez de duplicarla.
 * Semáforo: si el registro trae FECHA PROXIMO CONTROL, la columna SEMAFORO PROXIMO CONTROL se calcula sola
 * cada día (AL DÍA, PRÓXIMO ≤7 días, VENCIDO, CUMPLIDO si hay una consulta posterior con el mismo documento).
 *
 * Instalación (una sola vez):
 *  1. Abre la hoja de cálculo → Extensiones → Apps Script. Pega este código y guarda.
 *  2. Configuración del proyecto (engranaje) → Propiedades del script → agrega CLAVE con la palabra secreta que tú escojas.
 *  3. Implementar → Nueva implementación → tipo "Aplicación web" →
 *     Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario → Implementar → autoriza con tu cuenta.
 *  4. Copia la URL que termina en /exec y pégala en la app (Base de datos → Conexión), junto con tu CLAVE.
 */

const COLUMNAS_TEXTO = ['DOCUMENTO ID.', 'TELEFONO'];
const COL_SEM = 'SEMAFORO PROXIMO CONTROL';

function letra(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

function aFecha(v) {
  const m = typeof v === 'string' && v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : v;
}

function reglasSemaforo(hoja, col) {
  const rango = hoja.getRange(2, col, hoja.getMaxRows() - 1, 1);
  const ya = hoja.getConditionalFormatRules().some(function (r) {
    return r.getRanges().some(function (g) { return g.getColumn() === col; });
  });
  if (ya) return;
  const colores = [['VENCIDO', '#f4c7c3'], ['PRÓXIMO', '#fce8b2'], ['AL DÍA', '#b7e1cd'], ['CUMPLIDO', '#e0e0e0']];
  const nuevas = colores.map(function (c) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(c[0]).setBackground(c[1]).setRanges([rango]).build();
  });
  hoja.setConditionalFormatRules(hoja.getConditionalFormatRules().concat(nuevas));
}

function doPost(e) {
  try {
    const clave = PropertiesService.getScriptProperties().getProperty('CLAVE');
    const datos = JSON.parse(e.postData.contents);
    if (!clave || datos.clave !== clave) return salida({ ok: false, error: 'clave' });

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const libro = SpreadsheetApp.getActiveSpreadsheet();
      const guardados = [];
      (datos.registros || []).forEach(function (reg) {
        const nombre = String(reg.comunidad || 'SIN COMUNIDAD').trim().toUpperCase().slice(0, 90);
        const hoja = libro.getSheetByName(nombre) || libro.insertSheet(nombre);
        const campos = reg.datos || {};

        let encabezados = hoja.getLastColumn() ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0] : [];
        const claves = Object.keys(campos);
        if (campos['FECHA PROXIMO CONTROL'] !== undefined && claves.indexOf(COL_SEM) < 0) claves.push(COL_SEM);
        const nuevos = claves.filter(function (k) { return encabezados.indexOf(k) < 0; });
        if (nuevos.length) {
          hoja.getRange(1, encabezados.length + 1, 1, nuevos.length).setValues([nuevos]).setFontWeight('bold');
          encabezados = encabezados.concat(nuevos);
          hoja.setFrozenRows(1);
        }

        const fila = encabezados.map(function (h) {
          let v = campos[h];
          if (v === undefined || v === null) return '';
          if (COLUMNAS_TEXTO.indexOf(h) >= 0 && v !== '') v = "'" + v;
          return aFecha(v);
        });

        let destino = 0;
        const colId = encabezados.indexOf('ID_REGISTRO') + 1;
        if (colId && hoja.getLastRow() > 1) {
          const ids = hoja.getRange(2, colId, hoja.getLastRow() - 1, 1).getValues().map(function (r) { return r[0]; });
          const i = ids.indexOf(campos.ID_REGISTRO);
          if (i >= 0) destino = i + 2;
        }
        if (destino) hoja.getRange(destino, 1, 1, fila.length).setValues([fila]);
        else { hoja.appendRow(fila); destino = hoja.getLastRow(); }

        const cS = encabezados.indexOf(COL_SEM) + 1, cP = encabezados.indexOf('FECHA PROXIMO CONTROL') + 1,
              cD = encabezados.indexOf('DOCUMENTO ID.') + 1, cF = encabezados.indexOf('FECHA') + 1;
        if (cS && cP && cD && cF) {
          const P = letra(cP), D = letra(cD), F = letra(cF), r = destino;
          hoja.getRange(r, cS).setFormula(
            '=IF(ISNUMBER($' + P + r + '),IF(AND($' + D + r + '<>"",COUNTIFS($' + D + ':$' + D + ',$' + D + r + ',$' + F + ':$' + F + ',">"&$' + F + r + ')>0),"CUMPLIDO",' +
            'IF($' + P + r + '<TODAY(),"VENCIDO",IF($' + P + r + '-TODAY()<=7,"PRÓXIMO","AL DÍA"))),"")');
          reglasSemaforo(hoja, cS);
        }
        guardados.push(campos.ID_REGISTRO);
      });
      return salida({ ok: true, ids: guardados });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  }
}

function doGet() {
  return salida({ ok: true, app: 'rutas-3280' });
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
