/*
 * Lógica para la página de detalle de un lote.  Muestra toda
 * la información almacenada del lote y permite reservarlo si
 * todavía está disponible.
 */

// Las funciones ensureId, parseQuery, getLotById y updateLot están disponibles
// globalmente desde common.js.

function setupLot() {
  // Asegurarse de que existe receptorId para reservas
  const receptorId = ensureId('receptorId', 'receptor');
  const params = parseQuery();
  const id = params.id;
  const container = document.getElementById('lotDetails');
  if (!container) return;
  if (!id) {
    container.innerHTML = '<p>No se ha proporcionado un identificador de lote.</p>';
    return;
  }
  const lot = getLotById(id);
  if (!lot) {
    container.innerHTML = '<p>No se encontró el lote solicitado.</p>';
    return;
  }
  // Comprueba si está disponible
  const available = !lot.status || lot.status === 'OPEN';
  container.innerHTML = `
    <h2>${lot.material}</h2>
    <p><strong>Condición:</strong> ${lot.condition}</p>
    <p><strong>Peso:</strong> ${lot.weightKg} kg</p>
    <p><strong>Esquema:</strong> ${lot.scheme}${lot.scheme === 'venta' ? ' | Precio: ' + lot.price : ''}</p>
    <p><strong>Dirección:</strong> ${lot.address.line1}, ${lot.address.city}</p>
    <p><strong>Estado:</strong> ${lot.status || 'OPEN'}</p>
  `;
  const btn = document.createElement('button');
  btn.className = 'button';
  btn.textContent = available ? 'Reservar Lote' : 'Lote no disponible';
  btn.disabled = !available;
  // Configurar htmx para navegar a la confirmación dentro del SPA
  const confirmUrl = `partials/confirmation.html?id=${encodeURIComponent(lot.pk)}`;
  btn.setAttribute('hx-get', confirmUrl);
  btn.setAttribute('hx-target', '#content');
  btn.setAttribute('hx-swap', 'innerHTML');
  btn.addEventListener('click', () => {
    if (!available) return;
    // Marcar el lote como reservado
    lot.status = 'LOCKED';
    lot.receiverId = receptorId;
    updateLot(lot);
    // htmx se encargará de la navegación al confirmUrl
  });
  container.appendChild(btn);
}

// Inicializa automáticamente si el contenedor existe (para modo no SPA)
if (document.getElementById('lotDetails')) {
  setupLot();
}

window.setupLot = setupLot;