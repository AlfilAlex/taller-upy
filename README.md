# Guía del Backend y su integración con el Frontend

Este proyecto está dividido en dos partes principales: un **backend** implementado como un conjunto de funciones **AWS Lambda** desplegadas mediante **Serverless Framework**, y un **frontend** construido con **React** y **Vite**. Ambos componentes se comunican a través de una **API HTTP** gestionada por **API Gateway** de AWS. El objetivo del sistema es conectar empresas que donan materiales de alta calidad con artesanos, makers y carpinteros que los reutilizan.

## Arquitectura general

El backend está diseñado bajo una arquitectura _serverless_, aprovechando múltiples servicios de AWS:

| Servicio | Rol en la arquitectura |
| --- | --- |
| **AWS Lambda** | Ejecución del código del backend en funciones discretas (createLot, listLots, reserveLot) sin servidores dedicados. |
| **API Gateway HTTP** | Expone rutas HTTP para interactuar con las funciones Lambda. Se configura mediante serverless.yaml. |
| **AWS DynamoDB** | Almacena los lotes con claves partición/orden (pk, sk) y varios índices globales para consultar por material, estatus, usuario, día de creación, etc. |
| **Amazon S3** | Guarda imágenes asociadas a los lotes. Se generan URLs pre‑firmadas para la carga desde el cliente. |
| **Amazon Cognito** | Proporciona autenticación basada en tokens JWT. El frontend obtiene un id_token que se envía en la cabecera Authorization al backend para identificar al usuario. |
| **Serverless Framework** | Orquesta el despliegue de las funciones, capas, variables de entorno y roles IAM mediante el archivo serverless.yaml. |

## Estructura del backend

La carpeta backend contiene el código fuente del proyecto serverless:

backend/  
├── index.js # Expone las funciones Lambda definidas en src/handlers  
├── serverless.yaml # Configuración de Serverless Framework  
├── package.json # Dependencias del backend  
└── src/  
├── controllers/ # Lógica de negocio para cada operación  
│ ├── CreateLotFn.js  
│ ├── ListLotsFn.js  
│ └── ReserveLotFn.js  
├── handlers/ # Adaptadores HTTP: extraen parámetros y responden  
│ ├── CreteLotHandlers.js  
│ ├── ListLotsHandler.js  
│ └── ReserveLotsHandler.js  
└── utils/ # Utilidades comunes (auth, DynamoDB, validadores)

### Flujo de creación de un lote (createLot)

1. El frontend invoca POST /lots enviando un objeto con los datos del lote (material, condición, peso, esquema, precio, dirección e imágenes). Se incluye el token de Cognito en el encabezado Authorization.
2. El manejador src/handlers/CreteLotHandlers.js valida el token con getInfoFromToken, extrae el userId y llama a validateAllLotInfo para comprobar los campos obligatorios.
3. La función de negocio CreateLotFn genera la clave primaria pk = 'lot#{id}', calcula createdDay (AAAAMMDD) y llama a DynamoClient.putItem para escribir la entrada en DynamoDB.
4. La respuesta devuelve un estado **201** con el lote creado.

### Consulta de lotes abiertos (listLots)

1. El frontend de tipo _Receptor_ ejecuta GET /lots?status=OPEN&createdDay=AAAAMMDD. El parámetro createdDay se construye localmente con la fecha actual.
2. El manejador ListLotsHandler.js extrae los parámetros de la query y llama a ListLotsFn.
3. ListLotsFn utiliza DynamoClient.getItemById (que internamente usa el índice global secundario **GSI5_CreatedDay**) para obtener todos los lotes con el día de creación indicado y el estatus requerido.
4. La respuesta es un JSON con un arreglo de lotes, donde cada elemento contiene información como material, condición, peso, esquema, precio, dirección, imágenes, etc.

### Reserva de un lote (reserveLot)

1. Al pulsar “Reservar” en el frontend se invoca PUT /lots/{lotId}/reserve.
2. El manejador ReserveLotsHandler.js valida el token, extrae el receiverId y llama a ReserveLotFn.
3. ReserveLotFn actualiza el lote en DynamoDB con receiverId y cambia el status a LOCKED, pero incluye una condición para impedir que el dueño reserve su propio lote (reserverIsNotTheSender). En caso contrario se devuelve un error **403**.
4. La respuesta confirma la reserva y el frontend actualiza la lista para reflejar el nuevo estado.

## Integración con el frontend

El frontend (frontend/src) se comunica con el backend a través de la constante API_BASE_URL definida en frontend/src/config.js. Para apuntar al entorno apropiado (dev, prod, etc.) se debe configurar esta variable, por ejemplo:

// frontend/src/config.js  
export const API_BASE_URL = '<https://abc123.execute-api.us-east-1.amazonaws.com/dev>';  
export const COGNITO_DOMAIN = 'tu-dominio.auth.us-east-1.amazoncognito.com';  
export const COGNITO_CLIENT_ID = 'xxxxxxxxxxxxxxxxxxxxxxxxxx';  
export const REDIRECT_URI = '<http://localhost:5173/>';  
export const COGNITO_SCOPE = 'email openid profile';

### Flujo de autenticación

1. Al entrar por primera vez, el usuario elige un rol en Landing.jsx. Según el rol, el componente redirige al dominio de Cognito para iniciar sesión.
2. Cognito devuelve un code en la URL. El componente App.jsx detecta este código y lo intercambia por un id_token mediante la ruta /oauth2/token.
3. El token se almacena en localStorage y se añade en la cabecera Authorization de todas las solicitudes al backend.
4. En el backend, la función getInfoFromToken decodifica el token (sin validarlo contra la firma). Puedes extender esta utilidad para validar la firma con el JWKS de Cognito utilizando las funciones de la biblioteca jose.

### Prueba local

Para levantar ambos entornos de forma local:

\# 1. Backend: instalar dependencias y desplegar en AWS  
cd backend  
npm install  
npm run deploy # Crea las funciones Lambda, la tabla DynamoDB y roles  
<br/>\# 2. Frontend: instalar dependencias y arrancar Vite  
cd ../frontend  
npm install  
npm run dev  
<br/>\# 3. Configurar API_BASE_URL y datos de Cognito en frontend/src/config.js  
<br/>\# 4. Abrir <http://localhost:5173> en el navegador, autenticarse y empezar a crear/reservar lotes

### Consideraciones de seguridad

- **Validación de tokens**: el ejemplo actual decodifica el JWT sin verificar su firma. En producción debes obtener la clave pública de Cognito (JWKS) y validar la firma para evitar tokens falsificados.
- **Reglas IAM**: el archivo serverless.yaml especifica un rol para CloudFormation y un rol para las funciones Lambda (recreahub-lambda-rol). Este rol debe permitir acceso a DynamoDB, S3 y a otros servicios necesarios. Evita conceder privilegios excesivos.
- **CORS**: API Gateway habilita CORS en httpApi.cors: true, permitiendo que el frontend se comunique desde dominios distintos.
- **Manejo de errores**: cada handler captura excepciones y devuelve códigos HTTP adecuados. El frontend muestra mensajes basados en los estados devueltos.

## Ampliación y mantenimiento

El backend está preparado para escalar horizontalmente: cada solicitud es manejada por una instancia de Lambda independiente. Para añadir nuevas funcionalidades (por ejemplo, calificar transacciones o generar reportes) se recomienda:

1. Crear una nueva función de negocio en src/controllers que encapsule la lógica de acceso a datos o servicios externos.
2. Añadir un nuevo handler en src/handlers que valide la entrada y transforme la respuesta a HTTP.
3. Declarar la nueva función en serverless.yaml con su respectivo path y método HTTP.
4. Desplegar con npm run deploy para actualizar la infraestructura.

La integración del frontend se limita a conocer el API_BASE_URL y los parámetros de Cognito. Siempre que respetes el contrato de la API (estructura de endpoints y datos), la interfaz puede evolucionar de manera independiente.
