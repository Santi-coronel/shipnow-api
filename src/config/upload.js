import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import config from './index.js';
import { UPLOAD_PARAMETERS } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Toda la configuracion de Multer vive aca; los routers solo la usan.

const folderPath = (folder) => path.join(config.uploadsDir, folder);

export const ensureUploadFolders = () => {
  Object.values(UPLOAD_PARAMETERS.FOLDERS).forEach((folder) => {
    fs.mkdirSync(folderPath(folder), { recursive: true });
  });
};

// Nombre generado: nunca se usa el nombre original en el disco
const generateFileName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
};

const fileFilter = (req, file, cb) => {
  const allowedExtensions = UPLOAD_PARAMETERS.ALLOWED_TYPES[file.mimetype];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    logger.warning(`Carga rechazada: tipo no permitido (${file.mimetype}, ${file.originalname})`);
    return cb(createError(ErrorDictionary.INVALID_FILE_TYPE));
  }
  cb(null, true);
};

const buildUploader = (folder) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const dest = folderPath(folder);
        fs.mkdir(dest, { recursive: true }, (err) => cb(err, dest));
      },
      filename: (req, file, cb) => cb(null, generateFileName(file.originalname)),
    }),
    fileFilter,
    limits: { fileSize: UPLOAD_PARAMETERS.MAX_FILE_SIZE, files: 1 },
  }).single(UPLOAD_PARAMETERS.FIELD_NAME);

export const documentsUploader = buildUploader(UPLOAD_PARAMETERS.FOLDERS.DOCUMENTS);
export const receiptsUploader = buildUploader(UPLOAD_PARAMETERS.FOLDERS.RECEIPTS);

export const getFolderPath = folderPath;
