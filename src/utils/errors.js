export const EErrors = Object.freeze({
  INTERNAL_ERROR: 100,
  ROUTE_NOT_FOUND: 101,
  INVALID_ID: 102,
  INVALID_JSON: 103,
  VALIDATION_ERROR: 104,

  USER_NOT_FOUND: 200,
  USER_ALREADY_EXISTS: 201,
  ADMIN_CREATION_FORBIDDEN: 202,
  INVALID_ROLE: 203,
  INVALID_USER_DATA: 204,

  ORDER_NOT_FOUND: 300,
  INVALID_ORDER_STATUS: 301,
  INVALID_ORDER_ITEMS: 302,
  INVALID_ORDER_DATA: 303,

  DELIVERY_NOT_FOUND: 400,
  INVALID_DELIVERY_STATUS: 401,
  DRIVER_NOT_VALID: 402,

  PRODUCT_NOT_FOUND: 500,
  INVALID_PRODUCT_STATUS: 501,
  INVALID_PRODUCT_DATA: 502,

  INVALID_QUANTITY: 600,
  MOCK_SEED_FAILED: 601,
  MOCK_DEPENDENCY_MISSING: 602,
});

export const ErrorDictionary = Object.freeze({
  INTERNAL_ERROR: { name: 'InternalError', code: EErrors.INTERNAL_ERROR, status: 500, message: 'Error interno del servidor' },
  ROUTE_NOT_FOUND: { name: 'RouteNotFound', code: EErrors.ROUTE_NOT_FOUND, status: 404, message: 'Ruta no encontrada' },
  INVALID_ID: { name: 'InvalidId', code: EErrors.INVALID_ID, status: 400, message: 'El ID recibido no es valido' },
  INVALID_JSON: { name: 'InvalidJson', code: EErrors.INVALID_JSON, status: 400, message: 'El cuerpo de la peticion no es un JSON valido' },
  VALIDATION_ERROR: { name: 'ValidationError', code: EErrors.VALIDATION_ERROR, status: 400, message: 'Los datos enviados no son validos' },

  USER_NOT_FOUND: { name: 'UserNotFound', code: EErrors.USER_NOT_FOUND, status: 404, message: 'Usuario no encontrado' },
  USER_ALREADY_EXISTS: { name: 'UserAlreadyExists', code: EErrors.USER_ALREADY_EXISTS, status: 409, message: 'Ya existe un usuario con ese email' },
  ADMIN_CREATION_FORBIDDEN: { name: 'AdminCreationForbidden', code: EErrors.ADMIN_CREATION_FORBIDDEN, status: 403, message: 'No se puede asignar el rol admin desde este endpoint' },
  INVALID_ROLE: { name: 'InvalidRole', code: EErrors.INVALID_ROLE, status: 400, message: 'Rol de usuario invalido' },
  INVALID_USER_DATA: { name: 'InvalidUserData', code: EErrors.INVALID_USER_DATA, status: 400, message: 'Faltan datos obligatorios del usuario: firstName, lastName, email y password' },

  ORDER_NOT_FOUND: { name: 'OrderNotFound', code: EErrors.ORDER_NOT_FOUND, status: 404, message: 'Pedido no encontrado' },
  INVALID_ORDER_STATUS: { name: 'InvalidOrderStatus', code: EErrors.INVALID_ORDER_STATUS, status: 400, message: 'Estado de pedido invalido' },
  INVALID_ORDER_ITEMS: { name: 'InvalidOrderItems', code: EErrors.INVALID_ORDER_ITEMS, status: 400, message: 'El pedido debe tener al menos un item valido' },
  INVALID_ORDER_DATA: { name: 'InvalidOrderData', code: EErrors.INVALID_ORDER_DATA, status: 400, message: 'Faltan datos obligatorios del pedido: customer, items y deliveryAddress' },

  DELIVERY_NOT_FOUND: { name: 'DeliveryNotFound', code: EErrors.DELIVERY_NOT_FOUND, status: 404, message: 'Entrega no encontrada' },
  INVALID_DELIVERY_STATUS: { name: 'InvalidDeliveryStatus', code: EErrors.INVALID_DELIVERY_STATUS, status: 400, message: 'Estado de entrega invalido' },
  DRIVER_NOT_VALID: { name: 'DriverNotValid', code: EErrors.DRIVER_NOT_VALID, status: 400, message: 'El usuario indicado no es un repartidor (driver)' },

  PRODUCT_NOT_FOUND: { name: 'ProductNotFound', code: EErrors.PRODUCT_NOT_FOUND, status: 404, message: 'Producto no encontrado' },
  INVALID_PRODUCT_STATUS: { name: 'InvalidProductStatus', code: EErrors.INVALID_PRODUCT_STATUS, status: 400, message: 'Estado de producto invalido' },
  INVALID_PRODUCT_DATA: { name: 'InvalidProductData', code: EErrors.INVALID_PRODUCT_DATA, status: 400, message: 'Datos de producto invalidos: name, price (>= 0) y stock (entero >= 0) son obligatorios' },

  INVALID_QUANTITY: { name: 'InvalidQuantity', code: EErrors.INVALID_QUANTITY, status: 400, message: 'La cantidad (qty) debe ser un numero entero positivo dentro del rango permitido' },
  MOCK_SEED_FAILED: { name: 'MockSeedFailed', code: EErrors.MOCK_SEED_FAILED, status: 500, message: 'Fallo la carga de datos de prueba en MongoDB' },
  MOCK_DEPENDENCY_MISSING: { name: 'MockDependencyMissing', code: EErrors.MOCK_DEPENDENCY_MISSING, status: 400, message: 'Faltan datos previos para generar este mock' },
});

export const createError = ({ name, code, status, message, cause }) => {
  const error = new Error(message, cause ? { cause } : undefined);
  error.name = name;
  error.code = code;
  error.status = status;
  return error;
};
