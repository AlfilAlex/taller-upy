// Funciones de ayuda para consumir la API REST del backend.  Se lee la
// variable de entorno VITE_API_BASE_URL desde import.meta.env para
// construir la URL base.  Cada función lanza un Error cuando la
// respuesta HTTP no tiene éxito.
// Base URL configurable desde las variables de entorno.  Si no se
// proporciona (por ejemplo en un entorno local sin backend) se
// activa el modo de mocks definido más abajo.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Si no se define una URL base de API (por ejemplo en un entorno local
// sin backend), activa el modo de mocks.  Esto permite que la SPA
// funcione de forma autónoma mientras se desarrolla el backend.
const useMocks = !API_BASE_URL;

// Base de datos en memoria para los mocks.  Cada lote tiene una clave
// primaria (pk) con prefijo "lot#".  Esta estructura imita el esquema
// empleado en DynamoDB.
let mockLots = [];

/**
 * Obtiene un listado de lotes desde el backend.
 * @param {Object} params Parámetros de consulta, como ownerId, status o pk.
 * @returns {Promise<Array|Object>} Devuelve un array de lotes o un objeto cuando se busca un id concreto.
 */
export async function listLots(params = {}) {
  if (useMocks) {
    // Devuelve copias de los lotes en memoria aplicando filtros básicos.
    const { ownerId, status, pk } = params;
    let result = [...mockLots];
    if (ownerId) {
      result = result.filter((l) => l.ownerId === ownerId);
    }
    if (status) {
      result = result.filter((l) => (l.status || 'OPEN') === status);
    }
    if (pk) {
      const found = result.find((l) => l.pk === pk);
      return found ? [found] : [];
    }
    return result;
  }
  // Llamada real a la API REST serverless.  El backend expone la ruta
  // GET /lots que acepta parámetros de consulta `status` y `day` (fecha
  // YYYYMMDD).  Otros parámetros como ownerId o pk se usan sólo en el
  // cliente para filtrar tras recibir la lista completa.  Construimos
  // la URL con los parámetros permitidos.
  const url = new URL(`${API_BASE_URL}/lots`);
  const { status, day, createdDay } = params;
  if (status) {
    url.searchParams.append('status', status);
  }
  // El backend espera el parámetro `day` para filtrar por fecha de
  // creación.  Permitimos usar `day` o `createdDay` como alias.
  const dayParam = day || createdDay;
  if (dayParam) {
    url.searchParams.append('day', dayParam);
  }
  const resp = await fetch(url.toString(), { method: 'GET' });
  if (!resp.ok) {
    throw new Error(`Error listing lots: ${resp.status} ${resp.statusText}`);
  }
  const text = await resp.text();
  let items;
  try {
    items = JSON.parse(text);
  } catch (e) {
    items = text;
  }
  // Si se solicitan filtros adicionales (ownerId o pk), aplicarlos
  // localmente.  Esto es necesario porque el backend actual no soporta
  // esos filtros directamente.
  if (Array.isArray(items)) {
    const { ownerId, pk } = params;
    if (ownerId) {
      items = items.filter((l) => l.ownerId === ownerId);
    }
    if (pk) {
      // Algunos lotes devueltos por el backend incluyen la clave
      // primaria `pk` y otros sólo devuelven `id`.  Comparamos ambos
      // campos para hallar el registro deseado.
      items = items.filter((l) => l.pk === pk || l.id === pk);
    }
  }
  return items;
}

/**
 * Crea un nuevo lote en el backend.
 * @param {Object} lotInfo Objeto con los campos de la tabla DynamoDB.
 * @returns {Promise<Object>} Devuelve el lote creado.
 */
export async function createLot(lotInfo) {
  if (useMocks) {
    // Inserta el lote en la base de datos en memoria y devuelve una copia
    mockLots.push({ ...lotInfo });
    return lotInfo;
  }
  // El backend expone la ruta POST /lots para crear un nuevo lote.
  // El cuerpo debe contener el objeto del lote plano, sin envolver
  // dentro de una propiedad lotInfo.  Los encabezados de
  // autenticación deben añadirse desde el llamador (por ejemplo
  // mediante el hook useApi).
  const resp = await fetch(`${API_BASE_URL}/lots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lotInfo)
  });
  if (!resp.ok) {
    throw new Error(`Error creating lot: ${resp.status} ${resp.statusText}`);
  }
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

/**
 * Reserva un lote para un usuario.
 * @param {string} lotId Clave primaria del lote (pk).
 * @param {string} userId Identificador del receptor que reserva.
 * @returns {Promise<Object>} Devuelve el lote actualizado.
 */
export async function reserveLot(lotId, userId) {
  if (useMocks) {
    // Busca el lote y marca su estado como LOCKED, asignando receiverId
    const lote = mockLots.find((l) => l.pk === lotId);
    if (!lote) {
      throw new Error('Lote no encontrado');
    }
    lote.status = 'LOCKED';
    lote.receiverId = userId;
    // Para simplificar no implementamos TTL ni bloqueo temporal
    return lote;
  }
  // Para reservar un lote se utiliza la ruta PUT /lots/{lotId}/reserve.
  // El identificador del receptor se extrae en el backend a partir del
  // token de autorización; por compatibilidad opcionalmente se puede
  // enviar en el cuerpo.  La cabecera Authorization debe ser
  // establecida por la función llamadora (p.ej. useApi).
  const resp = await fetch(`${API_BASE_URL}/lots/${lotId}/reserve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    // Enviamos userId sólo si se proporciona para backends que lo
    // requieran; si no, el backend extraerá el sub del token.
    body: userId ? JSON.stringify({ receiverId: userId }) : undefined
  });
  if (!resp.ok) {
    throw new Error(`Error reserving lot: ${resp.status} ${resp.statusText}`);
  }
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

/**
 * Solicita al backend URLs firmadas para subir imágenes a S3.  Actualmente
 * esta función no se utiliza en el MVP, pero se deja preparada para
 * futuras iteraciones.
 * @param {File[]} files Array de objetos File seleccionados por el usuario.
 * @param {string} userId Identificador del usuario.
 * @returns {Promise<Array>} Array con las URLs firmadas devuelto por el backend.
 */
export async function generatePresignedUrls(files, userId) {
  if (useMocks) {
    // Devuelve un array con URLs ficticias para cada archivo
    return files.map((file, index) => ({ presignedUrl: `mock-url-${index}` }));
  }
  const payload = await Promise.all(
    files.map(async (file) => {
      return {
        mimeType: file.type,
        fileSize: file.size,
        sha256: '',
        userId
      };
    })
  );
  const resp = await fetch(`${API_BASE_URL}/generate-presigned-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    throw new Error(
      `Error generating presigned urls: ${resp.status} ${resp.statusText}`
    );
  }
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}


// // Todas las funciones reciben apiFetch ya configurado con el token.
// export const createLot = (apiFetch) => async (lotInfo) =>
//   apiFetch("/lots", { method: "POST", body: { lotInfo } });

// export const listLots = (apiFetch) => async (filter) => {
//   const qs = new URLSearchParams(filter).toString();
//   return apiFetch(`/lots?${qs}`);
// };
// export const reserveLot = (apiFetch) => async (lotId, userId) =>
//   apiFetch(`/lots/${lotId}/reserve`, {
//     method: "POST",
//     body: { userId }
//   });
// export const generatePresignedUrls = (apiFetch) => async (files, userId) => {
//   const payload = await Promise.all(
//     files.map(async (file) => {
//       return {
//         mimeType: file.type,
//         fileSize: file.size,
//         sha256: '', // Aquí se podría calcular el hash si fuera necesario
//         userId
//       };
//     })
//   );
//   return apiFetch("/presigned-urls", {
//     method: "POST",
//     body: payload
//   });
// }

