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
| `MONGODB_URI` | Sí | URI de conexión a MongoDB local o Atlas |
| `PORT` | No | Puerto HTTP. El valor por defecto es `8080` |
| `NODE_ENV` | No | Entorno: `development`, `test` o `production` |
| `LOG_LEVEL` | No | Nivel mínimo de log |

Ejemplo:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/shipnow
NODE_ENV=development
LOG_LEVEL=debug
```

La API no implementa autenticación, por lo que no requiere tokens ni secretos JWT.

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
| GET | `/api/health` | Estado general de la API |

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

### Mocks

Genera datos simulados con Faker.

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

Este endpoint es una herramienta de validación del logger y no representa una funcionalidad de negocio.

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
    "code": 4,
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

Ejecutá:

```bash
npm test
```

Los tests unitarios comprueban:

- Carga y validación de configuración.
- Constantes del dominio.
- Construcción de errores.
- Generadores de mocks.
- Validaciones de cantidades.
- Actualizaciones seguras de usuarios.
- Recálculo del total de pedidos.
- Generación del spec de Swagger.
- Existencia de tags, schemas, request bodies y respuestas documentadas.
- Configuración de los niveles del logger.

Los tests automatizados no requieren una conexión activa a MongoDB. Para probar el CRUD completo y Swagger UI se debe iniciar el servidor con una conexión válida.

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