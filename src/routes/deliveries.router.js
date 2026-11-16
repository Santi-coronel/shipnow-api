import { Router } from 'express';
import filesController from '../controllers/files.controller.js';
import { uploadReceipt } from '../middlewares/upload.middleware.js';
import deliveriesController from '../controllers/deliveries.controller.js';

const router = Router();

/**
 * @openapi
 * /deliveries:
 *   get:
 *     tags: [Deliveries]
 *     summary: Lista todas las entregas
 *     description: Devuelve las entregas con sus pedidos y repartidores asociados.
 *     responses:
 *       200:
 *         description: Lista de entregas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveriesResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags: [Deliveries]
 *     summary: Crea una entrega
 *     description: Crea una entrega para un pedido existente y permite asignar un repartidor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeliveryRequest'
 *     responses:
 *       201:
 *         description: Entrega creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryResponse'
 *       400:
 *         description: ID, prioridad o repartidor inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido o repartidor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', deliveriesController.findAll);
router.post('/', deliveriesController.create);

/**
 * @openapi
 * /deliveries/{id}:
 *   get:
 *     tags: [Deliveries]
 *     summary: Obtiene una entrega por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de MongoDB de la entrega
 *         schema:
 *           type: string
 *         example: 6710f3a1c2a4b5d6e7f80903
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryResponse'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Deliveries]
 *     summary: Actualiza una entrega
 *     description: Permite modificar el repartidor, estado o prioridad de la entrega.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de MongoDB de la entrega
 *         schema:
 *           type: string
 *         example: 6710f3a1c2a4b5d6e7f80903
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeliveryRequest'
 *     responses:
 *       200:
 *         description: Entrega actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryResponse'
 *       400:
 *         description: ID, estado, prioridad o repartidor inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Deliveries]
 *     summary: Elimina una entrega
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de MongoDB de la entrega
 *         schema:
 *           type: string
 *         example: 6710f3a1c2a4b5d6e7f80903
 *     responses:
 *       200:
 *         description: Entrega eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', deliveriesController.findById);
router.put('/:id', deliveriesController.update);
router.delete('/:id', deliveriesController.delete);

/**
 * @openapi
 * /deliveries/{id}/receipts:
 *   post:
 *     tags: [Files]
 *     summary: Sube un comprobante de una entrega
 *     description: Recibe el archivo en el campo `file`. Guarda el archivo en el servidor y registra solo los metadatos en la entrega. Acepta PDF, JPG y PNG de hasta 2 MB.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la entrega
 *         schema:
 *           type: string
 *         example: 6710f3a1c2a4b5d6e7f80901
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UploadReceiptRequest'
 *     responses:
 *       201:
 *         description: Archivo cargado y asociado correctamente. Devuelve la entidad actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryResponse'
 *       400:
 *         description: Falta el archivo (FileRequired, 700), el campo no se llama "file" (InvalidFileField, 703) o el ID no es valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: El archivo supera los 2 MB (FileTooLarge, codigo 702)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       415:
 *         description: Tipo de archivo no permitido (InvalidFileType, codigo 701)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: No se pudo guardar el archivo (FileSaveFailed) o error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /deliveries/{id}/receipts:
 *   get:
 *     tags: [Files]
 *     summary: Lista los comprobantes de una entrega
 *     description: Devuelve los metadatos de los comprobantes cargados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la entrega
 *         schema:
 *           type: string
 *         example: 6710f3a1c2a4b5d6e7f80901
 *     responses:
 *       200:
 *         description: Lista de archivos asociados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilesResponse'
 *       400:
 *         description: El ID recibido no es valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrega no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/receipts', uploadReceipt, filesController.uploadDeliveryReceipt);
router.get('/:id/receipts', filesController.getDeliveryReceipts);

export default router;