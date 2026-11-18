# ShipNow API

API de logística desarrollada con Node.js, Express y MongoDB para gestionar usuarios, pedidos y entregas.

El proyecto utiliza una arquitectura por capas, generación de datos simulados, manejo centralizado de errores, logging con Winston y documentación interactiva con Swagger/OpenAPI.

## Arquitectura

```text
Router → Controller → Service → Repository → Model
```

- **Router:** define las rutas HTTP y su documentación OpenAPI.
- **Controller:** recibe la solicitud, llama al servicio y construye la respuesta.
- **Service:** contiene las validaciones y reglas de negocio.
- **Repository:** concentra el acceso a MongoDB mediante Mongoose.
- **Model:** define los schemas persistidos en MongoDB.

## Requisitos

- Node.js 20 o superior.
- npm.
- MongoDB local o una conexión de MongoDB Atlas.

## Instalación

Cloná el repositorio e instalá las dependencias:

```bash
git clone https://github.com/Santi-coronel/shipnow-api.git
cd shipnow-api
npm install
```

Copiá el archivo de variables de entorno:

```bash
cp .env.example .env
```

En Windows PowerShell también podés usar:

```powershell
Copy-Item .env.example .env
```

Configurá como mínimo `MONGODB_URI` dentro de `.env`.

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `MONGODB_URI` | Sí | URI de MongoDB (`mongodb://` o `mongodb+srv://`) |
| `PORT` | No | Puerto HTTP (1 a 65535). Por defecto `8080` |
| `NODE_ENV` | No | `development`, `test` o `production`. Por defecto `development` |
| `LOG_LEVEL` | No | `debug`, `http`, `info`, `warning`, `error` o `fatal`. Por defecto `debug` en desarrollo e `info` en producción |
| `UPLOADS_DIR` | No | Carpeta de archivos subidos. Por defecto `uploads` |
| `PUBLIC_URL` | No | URL pública de la API, se usa en Swagger. Por defecto `http://localhost:PORT` |
| `ENABLE_DOCS` | No | Solo en producción: `true` deja Swagger disponible. Por defecto `false` |

Hay un archivo de ejemplo por entorno, ninguno con valores reales:

- `.env.example`: desarrollo (se copia como `.env`).
- `.env.test`: tests (se versiona porque no tiene secretos).
- `.env.production.example`: producción (se copia con otro nombre y se completa).

Al iniciar, la app valida todas las variables juntas. Si falta `MONGODB_URI` o algún valor es inválido, no arranca y muestra un mensaje con cada problema. La API no tiene autenticación, así que no usa `JWT_SECRET`, y tampoco consume servicios externos (la única URL es `PUBLIC_URL`).

## Ejecutar el servidor

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Cuando la conexión a MongoDB se establece correctamente, la API queda disponible en:

```text
http://localhost:8080/api
```

## Documentación con Swagger

Swagger UI está disponible en:

```text
http://localhost:8080/api/docs
```

Desde esa interfaz se pueden consultar los endpoints, revisar los schemas y ejecutar solicitudes con **Try it out**.

La configuración general está separada en:

```text
src/docs/swagger.js
```

Las operaciones se documentan junto a sus rutas mediante comentarios `@openapi`.

## Módulos documentados

### Health

Permite comprobar que el servidor está funcionando.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado, entorno, uptime, fecha y conexión a la base |

### Users

Gestiona clientes, repartidores y locales.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/users` | Lista usuarios |
| POST | `/api/users` | Crea un usuario |
| GET | `/api/users/{id}` | Obtiene un usuario |
| PUT | `/api/users/{id}` | Actualiza un usuario |
| DELETE | `/api/users/{id}` | Elimina un usuario |

El endpoint público no permite crear ni asignar el rol `admin`. Las contraseñas se almacenan cifradas con bcrypt y nunca se incluyen en las respuestas de consulta.

### Products

Gestiona los productos. El estado se calcula según el stock: `available` si es mayor a 0 y `out_of_stock` si es 0.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/products` | Lista productos disponibles (`?includeOutOfStock=true` incluye los agotados) |
| POST | `/api/products` | Crea un producto |
| GET | `/api/products/{id}` | Obtiene un producto |
| PUT | `/api/products/{id}` | Actualiza un producto |
| DELETE | `/api/products/{id}` | Elimina un producto |

### Orders

Gestiona pedidos asociados a usuarios existentes.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/orders` | Lista pedidos |
| POST | `/api/orders` | Crea un pedido |
| GET | `/api/orders/{id}` | Obtiene un pedido |
| PUT | `/api/orders/{id}` | Actualiza un pedido |
| DELETE | `/api/orders/{id}` | Elimina un pedido |

El total se calcula a partir del precio y la cantidad de cada item. Si los items se actualizan, el total se calcula nuevamente.

### Deliveries

Gestiona entregas asociadas a pedidos y repartidores.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/deliveries` | Lista entregas |
| POST | `/api/deliveries` | Crea una entrega |
| GET | `/api/deliveries/{id}` | Obtiene una entrega |
| PUT | `/api/deliveries/{id}` | Actualiza una entrega |
| DELETE | `/api/deliveries/{id}` | Elimina una entrega |

Un usuario asignado como repartidor debe tener el rol `driver`.

### Files (carga de archivos)

Se usa Multer con la configuración centralizada en `src/config/upload.js` (los routers solo usan el middleware). Los archivos se guardan en disco y en MongoDB se guardan **solo los metadatos** (nombre original, nombre generado, ruta, tipo, tamaño, tipo de documento y fecha de carga).

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/users/{id}/documents` | Sube un documento de usuario (`file` + `documentType`) |
| GET | `/api/users/{id}/documents` | Lista los documentos del usuario |
| POST | `/api/orders/{id}/receipts` | Sube un comprobante de un pedido (`file`) |
| GET | `/api/orders/{id}/receipts` | Lista los comprobantes del pedido |
| POST | `/api/deliveries/{id}/receipts` | Sube un comprobante de una entrega (`file`) |
| GET | `/api/deliveries/{id}/receipts` | Lista los comprobantes de la entrega |

- **Formato:** `multipart/form-data`, con el archivo en el campo `file`.
- **Tipos aceptados:** PDF, JPG y PNG (se controla el tipo MIME y la extensión).
- **Tamaño máximo:** 2 MB.
- **`documentType` (solo documentos de usuario):** `id_card`, `license` o `invoice`. Los comprobantes se guardan como `proof_of_delivery`.
- **Carpetas** (dentro de `UPLOADS_DIR`, por defecto `uploads/`): `documents/`, `licenses/` y `receipts/`. Esa carpeta está en `.gitignore`.
- El nombre del archivo en disco lo genera el servidor, nunca se usa el original.
- Si la carga falla después de guardar el archivo (tipo de documento inválido, entidad inexistente), el archivo se borra.

| Error | Status | Código |
| --- | --- | --- |
| `FileRequired` (falta el archivo) | 400 | 700 |
| `InvalidFileType` (tipo no permitido) | 415 | 701 |
| `FileTooLarge` (supera 2 MB) | 413 | 702 |
| `InvalidFileField` (el campo no es `file`) | 400 | 703 |
| `InvalidDocumentType` | 400 | 704 |
| `FileSaveFailed` | 500 | 705 |
| `UserNotFound` / `OrderNotFound` / `DeliveryNotFound` | 404 | 200 / 300 / 400 |

Ejemplo con curl:

```bash
curl -X POST http://localhost:8080/api/users/<ID_USUARIO>/documents \
  -F "documentType=id_card" \
  -F "file=@./dni.pdf"

curl -X POST http://localhost:8080/api/orders/<ID_PEDIDO>/receipts \
  -F "file=@./comprobante.png"
```

También se pueden probar desde Swagger en `/api/docs`, en el tag **Files**.

### Mocks

Genera datos simulados con Faker. Solo está disponible fuera de producción.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/mocks/users?qty=5` | Genera usuarios sin guardarlos |
| GET | `/api/mocks/orders?qty=5` | Genera pedidos sin guardarlos |
| GET | `/api/mocks/deliveries?qty=5` | Genera entregas sin guardarlas |
| POST | `/api/mocks/users/seed` | Genera e inserta usuarios |
| POST | `/api/mocks/orders/seed` | Genera e inserta pedidos |
| POST | `/api/mocks/deliveries/seed` | Genera e inserta entregas |
| POST | `/api/mocks/seed/all` | Inserta todos los datos en orden |

La cantidad mínima permitida es `1`, la máxima es `100` y el valor predeterminado es `5`.

Body para los seeds individuales:

```json
{
  "qty": 10
}
```

Body para insertar todas las entidades:

```json
{
  "usersQty": 10,
  "ordersQty": 8,
  "deliveriesQty": 5
}
```

Los endpoints POST también conservan compatibilidad con las cantidades enviadas como query parameters.

Los pedidos simulados requieren usuarios existentes. Las entregas simuladas requieren pedidos existentes.

### Logger

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/logger/test` | Genera un log en cada nivel configurado |

Este endpoint es una herramienta de validación del logger y no representa una funcionalidad de negocio. Solo está disponible fuera de producción.

## Schemas reutilizables

La documentación utiliza schemas OpenAPI para:

- `User`
- `Order`
- `OrderItem`
- `Delivery`
- `SuccessResponse`
- `ErrorResponse`
- Requests de creación y actualización
- Respuestas individuales y colecciones
- Requests para generación de mocks

## Paginación y filtros

Los listados (`/users`, `/orders`, `/deliveries` y `/products`) no devuelven la colección completa: están paginados, del más nuevo al más viejo.

| Parámetro | Descripción |
| --- | --- |
| `page` | Número de página, desde 1 (por defecto `1`) |
| `limit` | Resultados por página (por defecto `10`, máximo `100`) |

```json
{
  "status": "success",
  "payload": [],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
}
```

Filtros disponibles:

| Ruta | Filtros |
| --- | --- |
| `/api/users` | `role`, `isAvailable` |
| `/api/orders` | `status`, `customer` |
| `/api/deliveries` | `status`, `driver`, `order` |
| `/api/products` | `includeOutOfStock` |

Un `page`/`limit` inválido responde 400 (`InvalidPagination`, código 105) y un filtro inválido también 400 (por ejemplo `InvalidOrderStatus`). Los filtros solo aceptan strings, así que no se pueden colar operadores de Mongo. Los listados usan `lean()`, índices por los campos filtrados y un `count` aparte para el total. Los mocks leen como máximo 100 registros para relacionar los datos.

Otros límites: el body JSON acepta hasta 100 KB (si no, 413 `PayloadTooLarge`) y los archivos subidos hasta 2 MB, solo PDF, JPG y PNG.

## Formato de respuestas

Respuesta exitosa con payload:

```json
{
  "status": "success",
  "payload": {}
}
```

Respuesta exitosa con mensaje:

```json
{
  "status": "success",
  "message": "Recurso eliminado correctamente"
}
```

Respuesta de error:

```json
{
  "status": "error",
  "error": {
    "name": "UserNotFound",
    "code": 200,
    "message": "Usuario no encontrado"
  }
}
```

Los errores documentados incluyen:

- Datos inválidos.
- JSON inválido.
- ID de MongoDB inválido.
- Recurso no encontrado.
- Rol o estado inválido.
- Email duplicado.
- Cantidad inválida en mocks.
- Error interno del servidor.

## Orden recomendado para probar la API

Podés cargar datos relacionados desde Swagger ejecutando:

```text
POST /api/mocks/seed/all
```

Con este body:

```json
{
  "usersQty": 10,
  "ordersQty": 8,
  "deliveriesQty": 5
}
```

Para probar manualmente cada módulo:

1. Crear o insertar usuarios.
2. Copiar el ID de un usuario.
3. Crear un pedido usando ese ID como `customer`.
4. Copiar el ID del pedido.
5. Crear una entrega usando ese ID como `order`.
6. Consultar, actualizar y eliminar los recursos por ID.

## Tests

Los tests son funcionales (Mocha + Chai + Supertest) y pegan contra la app Express real con una base de datos MongoDB de prueba.

| Herramienta | Uso |
| --- | --- |
| Mocha | Runner de tests |
| Chai | Aserciones (`expect`) |
| Supertest | Peticiones HTTP contra `app` sin levantar el servidor |

### Cómo correrlos

```bash
npm install
npm test
```

Hace falta un MongoDB accesible (local o Atlas). Por defecto se usa `mongodb://127.0.0.1:27017/shipnow-test`, definido en `.env.test`. Para usar otra base:

```bash
MONGODB_URI=mongodb://localhost:27017/shipnow-test npm test
```

El nombre de la base **tiene que incluir "test"**: si no, la suite aborta para no tocar datos reales. Al terminar se borra la base de prueba.

### Variables de entorno de test

Con `NODE_ENV=test` se carga `.env.test` (sin secretos, se sube al repo) en lugar de `.env`.

| Variable | Valor |
| --- | --- |
| `PORT` | `8081` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/shipnow-test` |
| `NODE_ENV` | `test` |
| `LOG_LEVEL` | `error` |
| `UPLOADS_DIR` | `uploads-test` |

El logger queda en silencio durante los tests. Los archivos que suben los tests van a `uploads-test/` (ignorada por Git) y se borran al terminar.

### Qué cubren

Los tests están en `tests/`, agrupados por recurso:

- `tests/functional/users.test.js`: GET, POST, GET por id, PUT y DELETE de usuarios.
- `tests/functional/products.test.js`: CRUD de productos y estados `available` / `out_of_stock`.
- `tests/functional/orders.test.js`: GET, POST, GET por id, cambios de estado, recálculo del total y DELETE.
- `tests/functional/deliveries.test.js`: CRUD de entregas, repartidor válido e inválido.
- `tests/functional/mocks.test.js`: endpoints GET y de seed, cantidades inválidas, dependencias faltantes.
- `tests/functional/files.test.js`: carga de documentos y comprobantes (éxito, archivo faltante, tipo no permitido, tamaño excedido, campo incorrecto, tipo de documento inválido, entidad inexistente) y listado.
- `tests/functional/pagination.test.js`: paginación, límites y filtros (válidos e inválidos).
- `tests/functional/production.test.js`: mocks, logger y Swagger apagados en producción.
- `tests/functional/system.test.js`: health, `/api/logger/test`, Swagger en `/api/docs`, ruta inexistente y JSON inválido.
- `tests/unit/units.test.js`: constantes, errores, mocks y estructura del spec de Swagger.
- `tests/unit/config.test.js`: validación de variables de entorno al iniciar.

Se prueban casos exitosos y de error (datos incompletos, recurso inexistente, estado inválido, cantidad inválida, ruta inexistente). En los errores se valida el status HTTP y el formato `{ name, code, message }` contra el `ErrorDictionary`.

### Datos y limpieza

Cada test crea sus propios datos (por ejemplo, un usuario antes de crear un pedido) y la colección se limpia antes de cada test, así que no dependen del orden ni de lo que haya en la base. Se puede correr `npm test` varias veces seguidas sin borrar nada a mano.

## Producción y Docker

### Correr la API localmente

```bash
npm install
cp .env.example .env     # completar MONGODB_URI
npm run dev              # o npm start
```

Swagger queda en `http://localhost:8080/api/docs` y el health check en `http://localhost:8080/api/health`. Los tests se corren con `npm test` (ver la sección Tests).

### Health check

`GET /api/health` devuelve el estado de la API, el entorno, el uptime en segundos, la fecha y si hay conexión con la base. No expone URIs, variables ni datos de usuarios.

```json
{
  "status": "success",
  "message": "ShipNow API funcionando correctamente",
  "environment": "production",
  "uptime": 3600,
  "timestamp": "2026-11-18T21:30:00.000Z",
  "database": "connected"
}
```

### Endpoints internos en producción

| Endpoint | Desarrollo y test | Producción |
| --- | --- | --- |
| `/api/mocks/*` | Habilitado | **No existe** (404) |
| `/api/logger/test` | Habilitado | **No existe** (404) |
| `/api/docs` (Swagger) | Habilitado | Apagado, salvo `ENABLE_DOCS=true` |

Criterio: los mocks escriben datos falsos en la base y el logger de prueba genera ruido en los logs, así que en producción directamente no se montan las rutas. Swagger no modifica nada, pero muestra toda la estructura de la API, por eso viene apagado y se prende a propósito con `ENABLE_DOCS=true` (si se prende, no lista mocks ni logger). El health check y los endpoints de negocio siempre están disponibles. Esto se decide en `src/config/index.js` y se aplica en `src/app.js`.

### Docker

Archivos: `Dockerfile`, `.dockerignore` y `docker-compose.yml`. La imagen usa `node:22-slim`, instala solo las dependencias de producción (`npm ci --omit=dev`), corre con un usuario sin privilegios, expone el puerto **8080** y tiene un `HEALTHCHECK` sobre `/api/health`.

Construir la imagen:

```bash
docker build -t shipnow-api .
```

Ejecutarla con las variables desde un archivo externo (copiar `.env.production.example` como `.env.production` y completarlo):

```bash
docker run -d --name shipnow-api -p 8080:8080 --env-file .env.production shipnow-api
```

Si MongoDB corre en tu máquina y no en Atlas, dentro del contenedor no sirve `localhost`: usá `mongodb://host.docker.internal:27017/shipnow` en `MONGODB_URI`.

Para probar todo junto (API + MongoDB) con un solo comando:

```bash
docker compose up --build
```

Con eso se puede probar:

- Health: `http://localhost:8080/api/health`
- Swagger: `http://localhost:8080/api/docs` (el compose pone `ENABLE_DOCS=true`)
- Un endpoint principal: `http://localhost:8080/api/users`

### Qué no se sube al repo ni a la imagen

`node_modules/`, `.env` y cualquier `.env.*` con valores reales (solo se versionan `.env.example`, `.env.test` y `.env.production.example`), `logs/`, `uploads/`, `uploads-test/` y `coverage/`. El `.dockerignore` deja afuera todo eso, además de `.git`, `tests/` y los archivos de Docker.

### Logs y uploads

- **Logs:** en producción la consola muestra desde `info`. Los errores (`error` y `fatal`) se guardan en `logs/` con rotación diaria y 14 días de retención. Los tests no escriben logs.
- **Uploads:** se guardan en `UPLOADS_DIR`. Dentro del contenedor el disco es temporal, así que para no perder los archivos hay que montar un volumen en `/app/uploads` (el compose ya lo hace). Lo mismo con `/app/logs` si se quieren conservar los logs. En un despliegue real convendría un almacenamiento externo; acá solo se guardan metadatos en MongoDB.

## Logging

El proyecto utiliza los siguientes niveles:

```text
debug
http
info
warning
error
fatal
```

En desarrollo se muestran mensajes desde `debug`. En producción se muestran desde `info`.

Los errores se guardan en archivos diarios dentro de `logs/`, con una retención de 14 días. Esa carpeta está excluida de Git.

## Estructura principal

```text
src/
├── config/
├── constants/
├── controllers/
├── docs/
├── middlewares/
├── mocks/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
├── app.js
└── server.js
```