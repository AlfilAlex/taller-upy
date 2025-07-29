/*
 * Muestra el código de confirmación de la reserva generada.
 */

// La función parseQuery se define globalmente en common.js.

function setupConfirmation() {
  const params = parseQuery();
  const id = params.id || '';
  const code = `RESERVA-${id}-${Date.now()}`;
  const codeEl = document.getElementById('code');
  if (codeEl) {
    codeEl.textContent = code;
  }
}

// Ejecutar al cargar directamente la página
if (document.getElementById('code')) {
  setupConfirmation();
}

window.setupConfirmation = setupConfirmation;