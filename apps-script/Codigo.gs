/**
 * Rutas 3280 – receptor de registros para Google Sheets.
 *
 * Recibe los registros que envía la aplicación y los escribe en esta hoja de cálculo,
 * una pestaña por comunidad. Si llega una columna nueva, la agrega al final.
 * Si llega un registro que ya existe (mismo ID_REGISTRO), actualiza su fila en vez de duplicarla.
 *
 * Instalación (una sola vez):
 *  1. Abre la hoja de cálculo → Extensiones → Apps Script. Pega este código y guarda.
 *  2. Configuración del proyecto (engranaje) → Propiedades del script → agrega CLAVE con la palabra secreta que tú escojas.
 *  3. Implementar → Nueva implementación → tipo "Aplicación web" →
 *     Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario → Implementar → autoriza con tu cuenta.
 *  4. Copia la URL que termina en /exec y pégala en la app (Base de datos → Conexión), junto con tu CLAVE.
 */

const COLUMNAS_TEXTO = ['DOCUMENTO ID.', 'TELEFONO'];

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
        const nuevos = Object.keys(campos).filter(function (k) { return encabezados.indexOf(k) < 0; });
        if (nuevos.length) {
          hoja.getRange(1, encabezados.length + 1, 1, nuevos.length).setValues([nuevos]).setFontWeight('bold');
          encabezados = encabezados.concat(nuevos);
          hoja.setFrozenRows(1);
        }

        const fila = encabezados.map(function (h) {
          let v = campos[h];
          if (v === undefined || v === null) return '';
          if (COLUMNAS_TEXTO.indexOf(h) >= 0 && v !== '') v = "'" + v;
          return v;
        });

        let destino = 0;
        const colId = encabezados.indexOf('ID_REGISTRO') + 1;
        if (colId && hoja.getLastRow() > 1) {
          const ids = hoja.getRange(2, colId, hoja.getLastRow() - 1, 1).getValues().map(function (r) { return r[0]; });
          const i = ids.indexOf(campos.ID_REGISTRO);
          if (i >= 0) destino = i + 2;
        }
        if (destino) hoja.getRange(destino, 1, 1, fila.length).setValues([fila]);
        else hoja.appendRow(fila);
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
