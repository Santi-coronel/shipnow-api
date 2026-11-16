import fs from 'node:fs/promises';
import path from 'node:path';
import config from '../../src/config/index.js';
import { UPLOAD_PARAMETERS } from '../../src/constants/index.js';

export const clearUploads = async () => {
  await fs.rm(config.uploadsDir, { recursive: true, force: true });
};

// nombres de los archivos que hay hoy en una carpeta de uploads
export const listUploaded = async (folder) => {
  try {
    return await fs.readdir(path.join(config.uploadsDir, folder));
  } catch {
    return [];
  }
};

export const listAllUploaded = async () => {
  const lists = await Promise.all(Object.values(UPLOAD_PARAMETERS.FOLDERS).map(listUploaded));
  return lists.flat();
};

export const fileExists = async (relativePath) => {
  try {
    await fs.access(path.resolve(relativePath));
    return true;
  } catch {
    return false;
  }
};

// archivos de prueba en memoria, no hace falta tener nada en disco
export const samplePdf = () => ({
  buffer: Buffer.from('%PDF-1.4 archivo de prueba'),
  filename: 'dni-frente.pdf',
  contentType: 'application/pdf',
});

export const samplePng = () => ({
  buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  filename: 'foto.png',
  contentType: 'image/png',
});
