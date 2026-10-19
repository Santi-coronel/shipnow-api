# ShipNow API

API de logística (usuarios, pedidos y entregas) hecha con Node.js, Express y MongoDB — Backend III, Coderhouse.

Este repositorio es la evolución acumulativa de las **5 pre-entregas** del módulo: arquitectura por capas, mocking, manejo de errores, logging y documentación con Swagger, todo en el mismo proyecto.

## Arquitectura

```
Router → Controller → Service → Repository → Model
```

- **Router**: solo conecta el path HTTP con el método del Controller.
- **Controller**: única puerta de entrada HTTP. Lee `req`, llama al Service, devuelve el `res` o hace `next(error)`. No conoce Mongoose.
- **Service**: concentra la lógica de negocio (cálculo de totales, validación de roles/estados, reglas como "no se puede crear un admin desde el endpoint público"). Llama al Repository.
- **Repository**: único lugar que conoce Mongoose/MongoDB. Encapsula proyecciones por defecto (ej. nunca devuelve `password`) y populate. No contiene lógica de negocio.

### ¿Por qué esta separación entre Service y Repository?

El Repository se mantiene "tonto" a propósito: solo sabe hacer `find`, `create`, `update`, `delete` contra Mongoose. Cualquier decisión de negocio (¿puede este usuario ser admin?, ¿cuánto suma este pedido?, ¿este driver es válido?) vive en el Service. Esto permite testear la lógica de negocio sin depender de una base real, y cambiar el motor de persistencia sin tocar una sola línea de Service o Controller.

## Instalación y arranque

```bash
npm install
cp .env.example .env   # completar MONGODB_URI y JWT_SECRET
npm run dev             # desarrollo, con nodemon
npm start                # producción
```

Si falta `MONGODB_URI` o `JWT_SECRET`, la app lanza un error descriptivo y no arranca (ver `src/config/index.js`).

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `PORT` | No (default 8080) | Puerto del servidor |
| `MONGODB_URI` | **Sí** | Conexión a MongoDB |
| `JWT_SECRET` | **Sí** | Secreto usado como API key interna |
| `NODE_ENV` | No | `development` \| `test` \| `production` |
| `LOG_LEVEL` | No | Nivel mínimo de log (`debug` en dev, `info` en prod) |

## Pre-entrega 1 — Estructura profesional

- `src/config/index.js`: valida `MONGODB_URI` y `JWT_SECRET` al arranque.
- `src/constants/index.js`: `USER_ROLES`, `ORDER_STATUS`, `DELIVERY_STATUS`, `DELIVERY_PRIORITY`, todos con `Object.freeze`.
- Entidades **Users**, **Orders** y **Deliveries** refactorizadas en las 3 capas.

## Pre-entrega 2 — Mocking

Router `/api/mocks`, respeta la arquitectura por capas (mocks → service → repository):

| Endpoint | Qué hace |
| --- | --- |
| `GET /api/mocks/users?qty=5` | Usuarios simulados, **no se guardan** |
| `GET /api/mocks/orders?qty=5` | Pedidos simulados, relacionados a usuarios **ya existentes** en la base |
| `GET /api/mocks/deliveries?qty=5` | Entregas simuladas, relacionadas a pedidos/drivers existentes |
| `POST /api/mocks/users/seed?qty=10` | Inserta usuarios de prueba en MongoDB |
| `POST /api/mocks/orders/seed?qty=10` | Inserta pedidos de prueba (requiere usuarios cargados) |
| `POST /api/mocks/deliveries/seed?qty=10` | Inserta entregas de prueba (requiere pedidos cargados) |
| `POST /api/mocks/seed/all?usersQty=10&ordersQty=8&deliveriesQty=5` | Siembra todo en cascada, relaciones incluidas |

Ejemplo de respuesta de `POST /api/mocks/users/seed?qty=10`:

```json
{ "status": "success", "payload": { "insertados": 10, "coleccion": "usuarios" } }
```

## Pre-entrega 3 — Manejo profesional de errores

- `src/utils/errors.js`: `createError()` + `ErrorDictionary` con errores de dominio (`UserNotFound`, `OrderNotFound`, `InvalidQuantity`, etc.).
- `src/middlewares/errorHandler.js`: único punto que arma la respuesta de error final. Formato uniforme:

```json
{ "status": "error", "error": { "name": "UserNotFound", "code": 4, "message": "Usuario no encontrado" } }
```

- Los Services detectan el error (`throw createError(...)`), los Controllers solo hacen `next(error)`, y el middleware global responde. Se aplica también al módulo de mocks (cantidades inválidas, negativas, o si falta data relacionada).

## Pre-entrega 4 — Logging con Winston

- `src/utils/logger.js`: configuración centralizada, niveles `debug`, `http`, `info`, `warning`, `error`, `fatal`.
- En `development` se loguea desde `debug`; en `production`, desde `info`.
- Integrado en: arranque del servidor, conexión a MongoDB, `errorHandler` (negocio → `warning`, inesperado → `error`, falla de arranque → `fatal`), módulo de mocks, creación de pedidos/entregas.
- Persistencia: `logs/error-YYYY-MM-DD.log` (solo `error` y `fatal`), con rotación diaria y retención de 14 días vía `winston-daily-rotate-file`. La carpeta `logs/` está en `.gitignore`.
- Endpoint de prueba (no es lógica de negocio): `GET /api/logger/test` dispara un log en cada uno de los 6 niveles.

## Pre-entrega 5 — Documentación con Swagger

- Swagger UI en **`/api/docs`**, configuración separada de las rutas (`src/docs/swagger.js`).
- Agrupado por tags: `Users`, `Orders`, `Deliveries`, `Mocks`, `Logger`, `Health`.
- Schemas reutilizables: `User`, `Order`, `OrderItem`, `Delivery`, `SuccessResponse`, `ErrorResponse`.
- Cada endpoint documenta método, ruta, body esperado, respuesta exitosa y los errores reales que puede devolver.

Con el server corriendo: `http://localhost:8080/api/docs`

## Tests

```bash
npm test
```

Corre tests unitarios (sin DB) sobre config, constantes, `createError`, generadores de mocks y el spec de Swagger. El sandbox de desarrollo no tiene salida de red para bajar un binario de MongoDB en memoria, así que el flujo completo (CRUD real contra Mongo) se validó corriendo el servidor localmente contra una base real.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| CRUD | `/api/users` | Usuarios |
| CRUD | `/api/orders` | Pedidos |
| CRUD | `/api/deliveries` | Entregas |
| GET/POST | `/api/mocks/*` | Mocking (ver Pre-entrega 2) |
| GET | `/api/logger/test` | Prueba de niveles de log |
| GET | `/api/docs` | Documentación Swagger |

Formato de éxito: `{ "status": "success", "payload": ... }`
Formato de error: `{ "status": "error", "error": { "name", "code", "message" } }`
