# Guía del Backend (Mejores prácticas y tutorial de ListLots)

Como desarrollador experimentado en arquitecturas serverless de AWS, este README profundiza en el backend del proyecto recreahub. Se abordan las mejores prácticas para su implementación y se presenta un tutorial guiado para añadir la funcionalidad de **Listar lotes** (listLots) desde cero. El objetivo es que puedas replicar o extender la solución siguiendo patrones recomendados.

## Diseño del backend

### Organización del código

El backend sigue el principio **separación de responsabilidades**:

| Carpeta/Archivo | Responsabilidad |
| --- | --- |
| src/controllers | Contiene funciones puras que encapsulan la lógica de negocio (crear, listar, reservar lotes). No conocen los detalles de la entrada HTTP. |
| src/handlers | Adaptadores entre API Gateway y las funciones de negocio: extraen parámetros, validan tokens, gestionan códigos HTTP y serializan las respuestas. |
| src/utils | Utilidades compartidas: cliente DynamoDB (dynamoClient.js), modelo LotModel con dynamoose, validadores y generación de URLs pre‑firmadas. |
| serverless.yaml | Define funciones Lambda, sus rutas HTTP, roles IAM, capas y variables de entorno. |
| index.js | Mapea las funciones exportadas a los manejadores declarados en serverless.yaml. |

Este enfoque facilita las pruebas unitarias y permite reusar la lógica de negocio en otros contextos (por ejemplo, ejecución por eventos de SQS o Step Functions).

### Buenas prácticas de implementación

1. **Uso de capas (layers) para dependencias**. El proyecto empaqueta los módulos de node_modules en una capa CommonModules. Esto reduce el tamaño de cada función y acelera los despliegues. Para actualizar dependencias se puede ejecutar npm run build-layer.
2. **Variables de entorno**. Evita valores codificados directamente; usa variables como DYNAMO_TABLE_NAME, MUST_CREATE_TABLE y BUCKET definidas en serverless.yaml o en Parameter Store/SSM. Utiliza process.env.VARIABLE en tu código.
3. **Manejo de errores y validaciones**. Siempre valida la entrada antes de procesarla (por ejemplo, verificar que lot.material exista). Atrapa excepciones inesperadas y devuelve códigos HTTP coherentes (400 para errores de cliente, 500 para fallos del servidor).
4. **Modelo de datos sólido**. La definición del esquema DynamoDB (dynamoModel.js) utiliza índices globales secundarios para distintos patrones de consulta. Ajusta los índices según las consultas que necesites y no olvides establecer claves de partición y orden adecuadas.
5. **Pruebas unitarias**. Se recomienda probar las funciones de negocio (CreateLotFn, etc.) con eventos simulados, utilizando librerías como jest. Para testear DynamoDB localmente puedes usar dynamoose-local o dynamodb-local.
6. **Seguridad y autenticación**. Usa jose para validar completamente los JWT contra el JWKS de Cognito. Protege tu API activando el authorizer en API Gateway, como se muestra en serverless.yaml.
7. **Observabilidad**. Agrega mensajes de log con suficiente contexto (IDs de lote, usuarios) y usa servicios como **AWS CloudWatch Logs** y **X‑Ray** para seguimiento de trazas.
8. **Despliegue automatizado**. Integra Serverless Framework en pipelines CI/CD. Usa entornos (dev, staging, prod) con nombres de pila y tablas parametrizados mediante ${opt:stage}.

## Tutorial: Construcción de ListLots desde cero

Imagina que el backend inicial carece de la funcionalidad para listar lotes. A continuación se explica cómo diseñar e implementar la ruta **GET /lots** siguiendo buenas prácticas.

### 1\. Definir el modelo de datos

Queremos consultar los lotes que están abiertos (status = 'OPEN') en el día actual. En DynamoDB utilizaremos un índice global secundario sobre el atributo createdDay para consultar por fecha y filtrar por estatus. En dynamoModel.js añadimos el índice GSI5_CreatedDay:
```javascript
const LotSchema = new dynamoose.Schema({  
pk: { type: String, hashKey: true },  
sk: { type: String, rangeKey: true, default: 'meta' },  
// … otros atributos …  
createdDay: {  
type: String,  
default: () => new Date().toISOString().slice(0, 10).replace(/-/g, ''),  
index: {  
name: 'GSI5_CreatedDay',  
global: true,  
rangeKey: 'status',  
project: true  
}  
}  
});  
```
export const LotModel = dynamoose.model(process.env.DYNAMO_TABLE_NAME, LotSchema, {  
throughput: 'ON_DEMAND',  
create: process.env.MUST_CREATE_TABLE || false  
});

### 2\. Crear la función de negocio

En src/controllers definimos una función pura que reciba los parámetros de búsqueda (status y createdDay) y devuelva la lista de lotes utilizando dynamoose:
```javascript
// src/controllers/ListLotsFn.js  
import { DynamoClient } from '../utils/dynamoClient.js';  
<br/>export const ListLotsFn = async (status, createdDay) => {  
const client = new DynamoClient();  
try {  
// Si no se pasa fecha, consulta por estatus usando un escaneo  
if (!createdDay) {  
const result = await client.lotModel.scan('status').eq(status).exec();  
return { statusCode: 200, body: JSON.stringify(result) };  
}  
// Consulta por fecha y estatus usando el índice GSI5_CreatedDay  
let query = client.lotModel.query('createdDay').eq(createdDay).using('GSI5_CreatedDay');  
if (status) {  
query = query.where('status').eq(status);  
}  
const items = await query.exec();  
return { statusCode: 200, body: JSON.stringify(items) };  
} catch (error) {  
console.error('Error listing lots:', error);  
return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };  
}  
};
```
Observaciones:

- Se aísla la consulta en un solo lugar. Si mañana se requieren filtros por ciudad o material, se pueden agregar parámetros a esta función sin tocar el handler.
- Retorna objetos con statusCode y body para que el handler decida cómo serializar.

### 3\. Crear el handler HTTP

En src/handlers, creamos el adaptador que invoca la función de negocio. Extrae status y createdDay desde la query string, invoca ListLotsFn y arma la respuesta HTTP:
```javascript
// src/handlers/ListLotsHandler.js  
import { ListLotsFn } from '../controllers/ListLotsFn.js';  
export const ListLotHandler = async (event) => {  
// Extraemos parámetros de la query; podrían venir como undefined  
const { status, createdDay } = event.queryStringParameters || {};  
try {  
const result = await ListLotsFn(status, createdDay);  
return {  
statusCode: result.statusCode,  
body: result.body,  
headers: { 'Content-Type': 'application/json' }  
};  
} catch (error) {  
console.error('Error in ListLotHandler:', error);  
return { statusCode: 500, body: 'Internal Server Error' };  
}  
};
```
### 4\. Registrar la función en Serverless

Ahora debemos exponer esta lógica mediante API Gateway. En serverless.yaml declaramos la nueva función, su handler y la ruta HTTP:

functions:  
listLots:  
handler: index.listLots  
memorySize: 128  
timeout: 5  
events:  
\- httpApi:  
method: GET  
path: /lots  
layers:  
\- { Ref: CommonModulesLambdaLayer }

Asegúrate de exportar la función desde index.js:
```javascript
// index.js  
import { ListLotHandler } from './src/handlers/ListLotsHandler.js';  
export const listLots = ListLotHandler;
```
Desplega con npm run deploy. API Gateway asignará el path /lots al método GET que invocará a tu handler.

### 5\. Consumir la API desde el frontend

En el cliente, construye la URL con la fecha actual y el estatus deseado. Un ejemplo simple en JavaScript:
```javascript
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');  
const query = \`?status=OPEN&createdDay=${today}\`;  
const res = await fetch(\`${API_BASE_URL}/lots${query}\`, {  
headers: { Authorization: token }  
});  
const items = await res.json();  
// items es un arreglo de lotes o un objeto indexado por PK
```
El rol receptor en el frontend (Receptor.jsx) utiliza exactamente este patrón. Filtra el arreglo por material en el cliente y ofrece un botón **Reservar** por cada lote.

### 6\. Validar y mejorar

- **Validar parámetros**: el handler podría comprobar que status pertenezca a la enumeración permitida (OPEN, LOCKED, PAID, etc.) y que createdDay tenga el formato YYYYMMDD.
- **Paginación**: para colecciones grandes, considera paginar usando startAt y limit, o bien los tokens de LastEvaluatedKey de DynamoDB. Expone estos parámetros en la API para que el frontend pida más registros.
- **Índices adicionales**: si más adelante necesitas filtrar por material, crea un índice (GSI1_MaterialStatus) con material como clave de partición y status como clave de orden.

Con esta guía, puedes reproducir la funcionalidad de listados en cualquier proyecto similar. Recuerda seguir la separación de responsabilidades (controlador – handler – configuración) para mantener el código modular y mantenible.
