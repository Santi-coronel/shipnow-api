// Diccionario centralizado de constantes del dominio ShipNow.
// Todos los objetos estan congelados para evitar mutaciones accidentales
// y para eliminar "strings magicos" dispersos por el proyecto.

export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  STORE: 'store',
});

export const ORDER_STATUS = Object.freeze({
  CREATED: 'created',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
});

export const DELIVERY_STATUS = Object.freeze({
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
});

export const DELIVERY_PRIORITY = Object.freeze({
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
});

export const DOCUMENT_TYPES = Object.freeze({
  ID_CARD: 'id_card',
  LICENSE: 'license',
  INVOICE: 'invoice',
  PROOF_OF_DELIVERY: 'proof_of_delivery',
});

// Parametros por defecto para el modulo de mocking (Pre-entrega 2).
export const MOCKING_PARAMETERS = Object.freeze({
  DEFAULT_QTY: 5,
  MAX_QTY: 100,
  MIN_QTY: 1,
  DEFAULT_PASSWORD: 'Coderhouse123',
});

// Niveles de log usados por el logger centralizado (Pre-entrega 4).
export const LOG_LEVELS = Object.freeze({
  DEBUG: 'debug',
  HTTP: 'http',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FATAL: 'fatal',
});

// Carga de archivos (Pre-entrega 7).
export const UPLOAD_PARAMETERS = Object.freeze({
  FIELD_NAME: 'file',
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2 MB
  ALLOWED_TYPES: Object.freeze({
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  }),
  // Carpetas dentro del directorio de uploads
  FOLDERS: Object.freeze({
    DOCUMENTS: 'documents',
    LICENSES: 'licenses',
    RECEIPTS: 'receipts',
  }),
});
