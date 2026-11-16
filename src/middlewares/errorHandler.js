import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') {
    error = createError(ErrorDictionary.INVALID_ID);
  } else if (err.type === 'entity.parse.failed') {
    error = createError(ErrorDictionary.INVALID_JSON);
  } else if (err.name === 'ValidationError' && !err.status) {
    error = createError({ ...ErrorDictionary.VALIDATION_ERROR, message: err.message });
  }

  const status = error.status || 500;
  const isUnexpected = status >= 500;
  const responseError = error.status
    ? error
    : ErrorDictionary.INTERNAL_ERROR;

  const logMessage = `${req.method} ${req.originalUrl} -> ${error.name || 'Error'}: ${error.message}`;

  if (isUnexpected) {
    logger.error(logMessage);
  } else {
    logger.warning(logMessage);
  }

  res.status(status).json({
    status: 'error',
    error: {
      name: responseError.name,
      code: responseError.code,
      message: responseError.message,
    },
  });
};
