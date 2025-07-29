/*
 * Lógica para la pantalla del marketplace (receptor).  Muestra
 * todos los lotes disponibles (estado OPEN) y permite filtrarlos
 * por material o dirección.  Al hacer clic en "Ver detalles" se
 * navega a la página de detalle de ese lote.
 */

// Las funciones ensureId y getLots son proporcionadas globalmente por common.js.

function setupMarketplace() {
  // Asegúrate de tener un receptorId único para el usuario
  ensureId('receptorId', 'receptor');

  const filterInput = document.getElementById('filter');
  const lotsContainer = document.getElementById('lots');

  function render() {
    const query = (filterInput.value || '').trim().toLowerCase();
    // Filtra a los lotes abiertos
    const lots = getLots().filter((l) => !l.status || l.status === 'OPEN');
    const visible = lots.filter((l) => {
      const materialMatch = l.material && l.material.toLowerCase().includes(query);
      const addressMatch = l.address && l.address.line1 && l.address.line1.toLowerCase().includes(query);
      return !query || materialMatch || addressMatch;
    });
    lotsContainer.innerHTML = '';
    if (visible.length === 0) {
      lotsContainer.innerHTML = '<p>No hay lotes disponibles.</p>';
      return;
    }
    visible.forEach((lote) => {
      const card = document.createElement('div');
      card.className = 'card';
      // Construimos el enlace de detalles utilizando atributos de htmx
      const detailHref = `partials/lot.html?id=${encodeURIComponent(lote.pk)}`;
      card.innerHTML = `
        <h3>${lote.material}</h3>
        <p>Condición: ${lote.condition} | Peso: ${lote.weightKg} kg</p>
        <p class="small">Publicado por: ${lote.ownerId}</p>
        <a href="#" class="button secondary" hx-get="${detailHref}" hx-target="#content" hx-swap="innerHTML">Ver detalles</a>
      `;
      lotsContainer.appendChild(card);
    });
  }

  filterInput.addEventListener('input', render);
  render();
}

// Inicializa automáticamente cuando la página completa incluye el filtro
if (document.getElementById('filter')) {
  setupMarketplace();
}

// Expón la función para que index.html pueda llamarla tras un swap
window.setupMarketplace = setupMarketplace;