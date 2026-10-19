import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Middleware global de errores: unico punto que construye la respuesta
// HTTP final. Rutas y controllers nunca responden errores por su cuenta,
// solo hacen next(error).
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Errores conocidos de Mongoose/Express que no vienen de nuestro
  // diccionario pero que queremos responder de forma controlada.
  if (err.name === 'CastError') {
    error = createError(ErrorDictionary.INVALID_ID);
  } else if (err.type === 'entity.parse.failed') {
    error = createError(ErrorDictionary.INVALID_JSON);
  } else if (err.name === 'ValidationError' && !err.status) {
    error = createError({ ...ErrorDictionary.INVALID_ID, message: err.message, name: 'ValidationError', status: 400 });
  }

  const status = error.status || 500;
  const isUnexpected = status >= 500;

  const logMessage = `${req.method} ${req.originalUrl} -> ${error.name || 'Error'}: ${error.message}`;

  if (isUnexpected) {
    // Error inesperado del servidor.
    logger.error(logMessage);
  } else {
    // Error esperado / de negocio (404, 400, 403, 409, etc).
    logger.warning(logMessage);
  }

  res.status(status).json({
    status: 'error',
    error: {
      name: error.name || 'InternalError',
      code: error.code ?? 0,
      message: error.message || ErrorDictionary.INTERNAL_ERROR.message,
    },
  });
};
