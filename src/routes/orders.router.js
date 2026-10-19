import { Router } from 'express';
import ordersController from '../controllers/orders.controller.js';

const router = Router();

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lista todos los pedidos
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *   post:
 *     tags: [Orders]
 *     summary: Crea un pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer, items, deliveryAddress]
 *             properties:
 *               customer: { type: string }
 *               items:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/OrderItem' }
 *               deliveryAddress: { type: string }
 *               priority: { type: string, enum: [low, normal, high] }
 *     responses:
 *       201:
 *         description: Pedido creado
 *       400:
 *         description: Items invalidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', ordersController.findAll);
router.post('/', ordersController.create);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtiene un pedido por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   put:
 *     tags: [Orders]
 *     summary: Actualiza un pedido (ej. cambiar status)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pedido actualizado
 *       400:
 *         description: Estado invalido
 *       404:
 *         description: Pedido no encontrado
 *   delete:
 *     tags: [Orders]
 *     summary: Elimina un pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pedido eliminado
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id', ordersController.findById);
router.put('/:id', ordersController.update);
router.delete('/:id', ordersController.delete);

export default router;
