// Capa centralizada de errores (Pre-entrega 3).
// createError() + ErrorDictionary evitan tener que construir errores
// "a mano" en cada controller/service.

export const EErrors = Object.freeze({
  ROUTING_ERROR: 1,
  INVALID_TYPES_ERROR: 2,
  DATABASE_ERROR: 3,
  NOT_FOUND_ERROR: 4,
  RESOURCE_ALREADY_EXISTS: 5,
  INVALID_RESOURCE_PROPERTY: 6,
});

export const ErrorDictionary = Object.freeze({
  USER_NOT_FOUND: { name: 'UserNotFound', code: EErrors.NOT_FOUND_ERROR, status: 404, message: 'Usuario no encontrado' },
  USER_ALREADY_EXISTS: { name: 'UserAlreadyExists', code: EErrors.RESOURCE_ALREADY_EXISTS, status: 409, message: 'Ya existe un usuario con ese email' },
  ADMIN_CREATION_FORBIDDEN: { name: 'AdminCreationForbidden', code: EErrors.INVALID_RESOURCE_PROPERTY, status: 403, message: 'No se puede crear un usuario admin desde este endpoint' },
  INVALID_ROLE: { name: 'InvalidRole', code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: 'Rol de usuario invalido' },

  ORDER_NOT_FOUND: { name: 'OrderNotFound', code: EErrors.NOT_FOUND_ERROR, status: 404, message: 'Pedido no encontrado' },
  INVALID_ORDER_STATUS: { name: 'InvalidOrderStatus', code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: 'Estado de pedido invalido' },
  INVALID_ORDER_ITEMS: { name: 'InvalidOrderItems', code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: 'El pedido debe tener al menos un item valido' },

  DELIVERY_NOT_FOUND: { name: 'DeliveryNotFound', code: EErrors.NOT_FOUND_ERROR, status: 404, message: 'Entrega no encontrada' },
  INVALID_DELIVERY_STATUS: { name: 'InvalidDeliveryStatus', code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: 'Estado de entrega invalido' },
  DRIVER_NOT_VALID: { name: 'DriverNotValid', code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: 'El usuario indicado no es un repartidor (driver)' },

  INVALID_QUANTITY: { name: 'InvalidQuantity', code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: 'La cantidad (qty) debe ser un numero entero positivo dentro del rango permitido' },
  MOCK_SEED_FAILED: { name: 'MockSeedFailed', code: EErrors.DATABASE_ERROR, status: 500, message: 'Fallo la carga de datos de prueba en MongoDB' },

  INVALID_ID: { name: 'InvalidId', code: EErrors.INVALID_TYPES_ERROR, status: 400, message: 'El ID recibido no es valido' },
  INVALID_JSON: { name: 'InvalidJson', code: EErrors.INVALID_TYPES_ERROR, status: 400, message: 'El cuerpo de la peticion no es un JSON valido' },
  ROUTE_NOT_FOUND: { name: 'RouteNotFound', code: EErrors.ROUTING_ERROR, status: 404, message: 'Ruta no encontrada' },
  INTERNAL_ERROR: { name: 'InternalError', code: 0, status: 500, message: 'Error interno del servidor' },
});

export const createError = ({ name, code, status, message, cause }) => {
  const error = new Error(message, cause ? { cause } : undefined);
  error.name = name;
  error.code = code;
  error.status = status;
  return error;
};
