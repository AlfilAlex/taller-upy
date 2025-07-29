/*
 * Funciones compartidas para la SPA estática Re‑Crea HUB.
 * Utiliza localStorage para persistir datos de usuarios y lotes
 * entre recargas de página. Todas las claves están prefijadas
 * para evitar colisiones con otros sitios.
 */

// Genera o recupera un identificador único para el rol indicado.
// Guarda el valor en localStorage bajo la clave proporcionada.
// Encapsulamos todas las funciones dentro de una IIFE para no
// contaminar el scope global y luego las exponemos en `window`.
(() => {
  /**
   * Genera o recupera un identificador único para un rol dado.
   * @param {string} key Clave de localStorage donde se almacena.
   * @param {string} prefix Prefijo para generar el identificador.
   */
  function ensureId(key, prefix) {
    let id = localStorage.getItem(key);
    if (!id) {
      id = `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(key, id);
    }
    return id;
  }

// Devuelve todos los lotes almacenados en localStorage.
  /**
   * Devuelve un array con todos los lotes guardados en localStorage.
   */
  function getLots() {
    const raw = localStorage.getItem('lots');
    return raw ? JSON.parse(raw) : [];
  }

// Guarda la lista completa de lotes en localStorage.
  /**
   * Guarda un array de lotes en localStorage.
   * @param {Array} lots Lista de lotes a persistir.
   */
  function saveLots(lots) {
    localStorage.setItem('lots', JSON.stringify(lots));
  }

// Inserta un nuevo lote en la base de datos local.
  /**
   * Añade un lote a la lista existente y actualiza localStorage.
   * @param {Object} lot Objeto con información del lote.
   */
  function createLot(lot) {
    const lots = getLots();
    lots.push(lot);
    saveLots(lots);
  }

// Actualiza un lote existente (busca por pk) y guarda los cambios.
  /**
   * Actualiza un lote existente identificado por su pk.
   * @param {Object} updatedLot Lote modificado.
   */
  function updateLot(updatedLot) {
    const lots = getLots();
    const idx = lots.findIndex((l) => l.pk === updatedLot.pk);
    if (idx >= 0) {
      lots[idx] = updatedLot;
      saveLots(lots);
    }
  }

// Devuelve un lote por su clave primaria.
  /**
   * Obtiene un lote por su clave primaria.
   * @param {string} pk Identificador del lote.
   */
  function getLotById(pk) {
    const lots = getLots();
    return lots.find((l) => l.pk === pk);
  }

// Parseo simple de parámetros de consulta de la URL.
  /**
   * Analiza la cadena de consulta de la URL y devuelve un objeto
   * con pares clave/valor.
   */
  function parseQuery() {
    const params = {};
    const query = window.location.search.substring(1);
    if (!query) return params;
    query.split('&').forEach((part) => {
      const [key, value] = part.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
  }

  // Exponer las funciones en window para que puedan usarse sin módulos
  window.ensureId = ensureId;
  window.getLots = getLots;
  window.saveLots = saveLots;
  window.createLot = createLot;
  window.updateLot = updateLot;
  window.getLotById = getLotById;
  window.parseQuery = parseQuery;
})();