/*
 * Lógica para la pantalla del generador.  Permite crear nuevos
 * lotes y visualizar aquellos ya publicados por el usuario actual.
 */

// No utilizamos módulos ES para maximizar la compatibilidad con el esquema file://.
// Las funciones ensureId, createLot y getLots están disponibles en window
// porque se definen en js/common.js.

// Definimos una función de inicialización para la vista de generador.
// Esta función puede ser llamada tanto en el flujo SPA (tras un swap de htmx)
// como al cargar directamente la página completa.  Se asegura de que los
// manejadores de eventos y el renderizado sólo se configuren una vez.
function setupGenerator() {
  const userId = ensureId('generatorId', 'generator');

  const materialSelect = document.getElementById('material');
  const conditionSelect = document.getElementById('condition');
  const weightInput = document.getElementById('weight');
  const schemeSelect = document.getElementById('scheme');
  const priceGroup = document.getElementById('price-group');
  const priceInput = document.getElementById('price');
  const addressInput = document.getElementById('addressLine1');
  const cityInput = document.getElementById('city');
  const imagesInput = document.getElementById('images');
  const publishBtn = document.getElementById('publishBtn');
  const messageEl = document.getElementById('message');
  const myLotsContainer = document.getElementById('myLots');

  // Muestra u oculta el campo de precio según el esquema elegido
  function togglePrice() {
    if (schemeSelect.value === 'venta') {
      priceGroup.style.display = 'block';
    } else {
      priceGroup.style.display = 'none';
      priceInput.value = '';
    }
  }

  schemeSelect.addEventListener('change', togglePrice);
  togglePrice();

  // Renderiza la lista de lotes publicados por el usuario actual
  function renderMyLots() {
    myLotsContainer.innerHTML = '';
    const lots = getLots().filter((l) => l.ownerId === userId);
    if (lots.length === 0) {
      myLotsContainer.innerHTML = '<p>Aún no has publicado lotes.</p>';
      return;
    }
    lots.forEach((lote) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${lote.material}</h3>
        <p>Condición: ${lote.condition} | Peso: ${lote.weightKg} kg</p>
        <p>Esquema: ${lote.scheme}${lote.scheme === 'venta' ? ' | Precio: ' + lote.price : ''}</p>
        <p class="small">Estado: ${lote.status || 'OPEN'}</p>
      `;
      myLotsContainer.appendChild(card);
    });
  }

  // Maneja la creación de un nuevo lote
  publishBtn.addEventListener('click', () => {
    messageEl.textContent = '';
    const material = materialSelect.value;
    const condition = conditionSelect.value;
    const weight = weightInput.value;
    const scheme = schemeSelect.value;
    const price = priceInput.value;
    const addressLine1 = addressInput.value.trim();
    const city = cityInput.value.trim();
    const imagesRaw = imagesInput.value;

    // Validaciones básicas
    if (!material || !weight || !addressLine1) {
      messageEl.textContent = 'Completa los campos obligatorios: material, peso y dirección.';
      messageEl.style.color = 'red';
      return;
    }
    const images = imagesRaw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (images.length < 2) {
      messageEl.textContent = 'Debes proporcionar al menos 2 nombres de imágenes separados por coma.';
      messageEl.style.color = 'red';
      return;
    }
    // Construye el objeto de lote
    const lot = {
      pk: 'lot#' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      material,
      condition,
      weightKg: parseFloat(weight),
      scheme,
      price: scheme === 'venta' ? parseFloat(price || 0) : 0,
      ownerId: userId,
      address: {
        line1: addressLine1,
        city
      },
      images,
      status: 'OPEN'
    };
    createLot(lot);
    // Limpia el formulario
    materialSelect.value = '';
    conditionSelect.value = 'B';
    weightInput.value = '';
    schemeSelect.value = 'donacion';
    priceInput.value = '';
    addressInput.value = '';
    cityInput.value = 'Mérida';
    imagesInput.value = '';
    togglePrice();
    // Notificación de éxito
    messageEl.textContent = 'Lote publicado correctamente.';
    messageEl.style.color = 'green';
    // Actualiza la lista
    renderMyLots();
  });

  // Render inicial
  renderMyLots();
}

// Al cargar el script, comprueba si existe el botón de publicar
// para inicializar automáticamente cuando se carga como página aislada.
if (document.getElementById('publishBtn')) {
  setupGenerator();
}

// Exponemos la función en el objeto global para que index.html pueda llamarla
window.setupGenerator = setupGenerator;