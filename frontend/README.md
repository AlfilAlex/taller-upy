# Re‑Crea HUB – Frontend

Este proyecto corresponde al frontend de la plataforma **Re‑Crea HUB**. Está construido como una SPA utilizando **React**, **Vite** y **Material UI** para proporcionar una experiencia de usuario fluida. Su objetivo es permitir que los usuarios con rol **Generador** publiquen lotes de materiales y que los usuarios con rol **Receptor** consulten y reserven estos lotes.

## Características principales

- **Selección de rol**: pantalla inicial para elegir entre Generador y Receptor.
- **Panel del Generador**: formulario para publicar nuevos lotes y listado de los lotes ya publicados por el usuario.
- **Marketplace del Receptor**: catálogo filtrable de todos los lotes disponibles.
- **Detalle de lote**: vista con información completa del lote y opción para reservarlo.
- **Confirmación de reserva**: pantalla con un código QR que confirma la reserva.

## Estructura del proyecto

```
re-crea-hub/
├── package.json        # Definición de dependencias y scripts NPM
├── vite.config.js      # Configuración de Vite
├── index.html          # Plantilla HTML principal
├── .env.example        # Ejemplo de archivo de variables de entorno
├── src/
│   ├── main.jsx        # Punto de entrada de la aplicación
│   ├── App.jsx         # Definición de rutas con React Router
│   ├── utils/
│   │   └── api.js      # Funciones para interactuar con el backend
│   └── components/
│       ├── RoleSelect.jsx       # Pantalla inicial de selección de rol
│       ├── GeneratorDashboard.jsx   # Panel del Generador
│       ├── Marketplace.jsx      # Catálogo para Receptores
│       ├── LotDetail.jsx        # Vista de detalles de un lote
│       └── Confirmation.jsx     # Pantalla de confirmación de reserva
└── README.md          # Este archivo
```

## Prerequisitos

Antes de ejecutar la aplicación necesitas tener instalado [Node.js](https://nodejs.org/) (se recomienda la versión 18 o superior) y `npm` o `yarn`. También debes contar con un backend que exponga las rutas necesarias para manejar los lotes (ver la sección _Notas sobre el backend_ más abajo).

## Instalación

1. Navega al directorio del frontend:

   ```bash
   cd re-crea-hub
   ```

2. Copia el archivo `.env.example` a `.env` y edita la variable `VITE_API_BASE_URL` con la URL de tu backend. Por ejemplo:

   ```
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. Instala las dependencias del proyecto:

   ```bash
   npm install
   ```

   > Este comando descargará React, Vite, Material UI y otras librerías necesarias.

## Ejecución en desarrollo

Para lanzar un servidor de desarrollo con recarga en caliente ejecuta:

```bash
npm run dev
```

Vite iniciará la aplicación en `http://localhost:5173` (o el puerto configurado) y recargará la página automáticamente cuando realices cambios en el código.

## Construcción para producción

Para generar una versión optimizada lista para desplegar en producción utiliza el script de build:

```bash
npm run build
```

El resultado se almacena en la carpeta `dist/`, que contiene todos los archivos estáticos. Estos archivos pueden servirse desde cualquier servidor HTTP o subirse a un bucket S3 servido por CloudFront.

## Notas sobre el backend

La SPA se comunica con un backend mediante solicitudes HTTP. Asegúrate de que tu backend implemente las siguientes rutas:

- `POST /create-lot` – Crea un nuevo lote. El cuerpo debe tener la estructura:

  ```json
  {
    "lotInfo": {
      "pk": "lot#<uuid>",
      "material": "madera",
      "condition": "A",
      "weightKg": 12,
      "scheme": "donacion",
      "price": 0,
      "ownerId": "generator-xyz",
      "address": {
        "line1": "Dirección 123",
        "city": "Mérida"
      },
      "images": ["imagen1.jpg", "imagen2.jpg"]
    }
  }
  ```

- `GET /list-lots` – Devuelve una lista de lotes. Puede recibir parámetros de consulta como `ownerId`, `status` o `pk` para filtrar la respuesta.
- `POST /reserve-lot` – Reserva un lote. Debe recibir un cuerpo con `lotId` (clave primaria del lote) y `userId` (identificador del receptor). Devuelve el lote actualizado.
- `POST /generate-presigned-url` – (Opcional en el MVP) Devuelve URLs firmadas para subir imágenes a un bucket S3. La SPA incluye la función `generatePresignedUrls()` para interactuar con esta ruta, aunque el flujo actual simplifica el manejo de imágenes.

### Errores observados en el backend actual

Durante la revisión del código proporcionado se identificaron algunos aspectos que podrían causar fallos:

1. **Importación de `uuid` en el presigner**. En `utils/presigner.js` se utiliza la función `uuid()` para generar nombres de objetos S3, pero no se está importando. Para solucionarlo, añade:

   ```js
   import { v4 as uuid } from 'uuid';
   ```

   al inicio del archivo y cambia `uuid()` por `uuid()`.

2. **Operación asincrónica en `CreateLotFn`**. El método `client.putItem()` devuelve una promesa pero no se espera su resolución. Para garantizar que el registro se guarde antes de devolver la respuesta, modifica:

   ```js
   client.putItem(lot.lotInfo);
   ```

   por:

   ```js
   await client.putItem(lot.lotInfo);
   ```

   y marca la función `CreateLotFn` como `async`.

3. **Uso de `client.getItem()`**. La implementación actual de `ListLotsFn` llama a `client.getItem(searchParams)`, lo que parece estar pensado para obtener un único registro por su clave. Para listar lotes filtrados se debería utilizar un scan o query con un índice secundario global adecuado.

4. **Persistencia del estado de reserva**. La función `reserveLotsHandler` simplemente actualiza los atributos `reserved` y `userId`. Para que el lote quede bloqueado durante 24 horas, considera añadir un campo `lockUntil` y un TTL con la fecha actual más 24 horas.

Estas observaciones no impiden que el frontend funcione en modo prototipo, pero conviene atenderlas para un despliegue real.

---

Con esta guía y los archivos incluidos podrás ejecutar y compilar la SPA de Re‑Crea HUB. ¡Esperamos que te resulte útil para validar tu MVP y seguir iterando sobre la plataforma!