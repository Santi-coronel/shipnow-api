import fs from 'node:fs/promises';
import path from 'node:path';
import usersRepo from '../repositories/users.repo.js';
import ordersRepo from '../repositories/orders.repo.js';
import deliveriesRepo from '../repositories/deliveries.repo.js';
import { DOCUMENT_TYPES, UPLOAD_PARAMETERS } from '../constants/index.js';
import { getFolderPath } from '../config/upload.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

const USER_DOCUMENT_TYPES = [DOCUMENT_TYPES.ID_CARD, DOCUMENT_TYPES.LICENSE, DOCUMENT_TYPES.INVOICE];

// ruta relativa al proyecto, asi no se expone la ruta real del servidor
const toRelativePath = (absolutePath) => path.relative(process.cwd(), absolutePath).split(path.sep).join('/');

const removeFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // si ya no esta, no hay nada que borrar
  }
};

class FilesService {
  // Si algo falla despues de que Multer guardo el archivo, se borra para no dejar huerfanos.
  async #withCleanup(file, action) {
    let currentPath = file?.path;
    try {
      return await action((newPath) => {
        currentPath = newPath;
      });
    } catch (error) {
      await removeFile(currentPath);
      throw error;
    }
  }

  #buildMetadata(file, filePath, documentType) {
    return {
      originalName: file.originalname,
      fileName: path.basename(filePath),
      path: toRelativePath(filePath),
      mimeType: file.mimetype,
      size: file.size,
      documentType,
      uploadedAt: new Date(),
    };
  }

  async uploadUserDocument(userId, file, documentType) {
    return this.#withCleanup(file, async (setPath) => {
      if (!file) throw createError(ErrorDictionary.FILE_REQUIRED);

      if (!USER_DOCUMENT_TYPES.includes(documentType)) {
        logger.warning(`Documento rechazado: tipo de documento invalido "${documentType}"`);
        throw createError(ErrorDictionary.INVALID_DOCUMENT_TYPE);
      }

      const user = await usersRepo.findById(userId);
      if (!user) throw createError(ErrorDictionary.USER_NOT_FOUND);

      let finalPath = file.path;
      try {
        // las licencias van a su propia carpeta
        if (documentType === DOCUMENT_TYPES.LICENSE) {
          finalPath = path.join(getFolderPath(UPLOAD_PARAMETERS.FOLDERS.LICENSES), file.filename);
          await fs.mkdir(path.dirname(finalPath), { recursive: true });
          await fs.rename(file.path, finalPath);
          setPath(finalPath);
        }
      } catch (error) {
        logger.error(`Error al guardar documento del usuario ${userId}: ${error.message}`);
        throw createError(ErrorDictionary.FILE_SAVE_FAILED);
      }

      const updatedUser = await usersRepo.addDocument(userId, this.#buildMetadata(file, finalPath, documentType));
      logger.info(`Documento "${documentType}" cargado para el usuario ${userId} (${file.filename})`);
      return updatedUser;
    });
  }

  async getUserDocuments(userId) {
    const user = await usersRepo.findById(userId);
    if (!user) throw createError(ErrorDictionary.USER_NOT_FOUND);
    return user.documents;
  }

  async #uploadReceipt({ id, file, repo, notFound, entityName }) {
    return this.#withCleanup(file, async () => {
      if (!file) throw createError(ErrorDictionary.FILE_REQUIRED);

      const entity = await repo.findById(id);
      if (!entity) throw createError(notFound);

      const metadata = this.#buildMetadata(file, file.path, DOCUMENT_TYPES.PROOF_OF_DELIVERY);
      const updated = await repo.addReceipt(id, metadata);
      logger.info(`Comprobante ${file.filename} asociado a ${entityName} ${id}`);
      return updated;
    });
  }

  uploadOrderReceipt(orderId, file) {
    return this.#uploadReceipt({
      id: orderId,
      file,
      repo: ordersRepo,
      notFound: ErrorDictionary.ORDER_NOT_FOUND,
      entityName: 'el pedido',
    });
  }

  uploadDeliveryReceipt(deliveryId, file) {
    return this.#uploadReceipt({
      id: deliveryId,
      file,
      repo: deliveriesRepo,
      notFound: ErrorDictionary.DELIVERY_NOT_FOUND,
      entityName: 'la entrega',
    });
  }

  async getOrderReceipts(orderId) {
    const order = await ordersRepo.findById(orderId);
    if (!order) throw createError(ErrorDictionary.ORDER_NOT_FOUND);
    return order.receipts;
  }

  async getDeliveryReceipts(deliveryId) {
    const delivery = await deliveriesRepo.findById(deliveryId);
    if (!delivery) throw createError(ErrorDictionary.DELIVERY_NOT_FOUND);
    return delivery.receipts;
  }
}

export default new FilesService();
