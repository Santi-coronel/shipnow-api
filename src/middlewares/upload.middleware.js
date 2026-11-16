import multer from 'multer';
import { documentsUploader, receiptsUploader } from '../config/upload.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

const handleUpload = (uploader) => (req, res, next) => {
  uploader(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        logger.warning(`Carga rechazada: archivo demasiado grande (${req.originalUrl})`);
        return next(createError(ErrorDictionary.FILE_TOO_LARGE));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        logger.warning(`Carga rechazada: campo inesperado "${err.field}" (${req.originalUrl})`);
        return next(createError(ErrorDictionary.INVALID_FILE_FIELD));
      }
      return next(createError(ErrorDictionary.INVALID_FILE_FIELD));
    }

    if (err.status) return next(err);
    logger.error(`Error al guardar archivo: ${err.message}`);
    return next(createError(ErrorDictionary.FILE_SAVE_FAILED));
  });
};

export const uploadDocument = handleUpload(documentsUploader);
export const uploadReceipt = handleUpload(receiptsUploader);
