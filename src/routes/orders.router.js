import { Router } from 'express';
import filesController from '../controllers/files.controller.js';
import { uploadReceipt } from '../middlewares/upload.middleware.js';
import ordersController from '../controllers/orders.controller.js';

const router = Router();

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lista todos los pedidos
 *     description: Devuelve los pedidos paginados (10 por pagina por defecto, maximo 100), del mas nuevo al mas viejo.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         required: false
 *         description: Filtra por estado
 *         schema:
 *           type: string
 *           enum: [created, assigned, picked_up, in_transit, delivered, cancelled]
 *       - in: query
 *         name: customer
 *         required: false
 *         description: Filtra por ID del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pedidos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdersResponse'
 *       400:
 *         description: page o limit invalidos (InvalidPagination, 105), estado invalido (InvalidOrderStatus, 301) o ID invalido (InvalidId, 102)
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
 *   post:
 *     tags: [Orders]
 *     summary: Crea un pedido
 *     description: Crea un pedido para un cliente existente y calcula su total.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: ID, items, prioridad o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cliente no encontrado
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
router.get('/', ordersController.findAll);
router.post('/', ordersController.create);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtiene un pedido por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de MongoDB del pedido
 *         schema:
 *           type: string
 *         example: 6710f3a1c2a4b5d6e7f80902
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido no encontrado
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
 *     tags: [Orders]
 *     summary: Actualiza un pedido
 *     description: Actualiza sus datos y recalcula el total cuando se modifican los items.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de MongoDB del pedido
 *         schema:
 *           type: string
 *         example: 6710f3a1c2a4b5d6e7f80902
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderRequest'
 *     responses:
 *       200:
 *         description: Pedido actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: ID, items, prioridad o estado inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido no encontrado
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
 *     tags: [Orders]
 *     summary: Elimina un pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de MongoDB del pedido
 *         schema:
 *           type: string
 *         example: 6710f3a1c2a4b5d6e7f80902
 *     responses:
 *       200:
 *         description: Pedido eliminado correctamente
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
 *         description: Pedido no encontrado
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
router.get('/:id', ordersController.findById);
router.put('/:id', ordersController.update);
router.delete('/:id', ordersController.delete);

/**
 * @openapi
 * /orders/{id}/receipts:
 *   post:
 *     tags: [Files]
 *     summary: Sube un comprobante de un pedido
 *     description: Recibe el archivo en el campo `file`. Guarda el archivo en el servidor y registra solo los metadatos en el pedido. Acepta PDF, JPG y PNG de hasta 2 MB.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pedido
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
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Falta el archivo (FileRequired, 700), el campo no se llama "file" (InvalidFileField, 703) o el ID no es valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido no encontrado
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
 * /orders/{id}/receipts:
 *   get:
 *     tags: [Files]
 *     summary: Lista los comprobantes de un pedido
 *     description: Devuelve los metadatos de los comprobantes cargados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pedido
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
 *         description: Pedido no encontrado
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
router.post('/:id/receipts', uploadReceipt, filesController.uploadOrderReceipt);
router.get('/:id/receipts', filesController.getOrderReceipts);

export default router;