import { Router } from 'express';
import deliveriesController from '../controllers/deliveries.controller.js';

const router = Router();

/**
 * @openapi
 * /deliveries:
 *   get:
 *     tags: [Deliveries]
 *     summary: Lista todas las entregas
 *     responses:
 *       200:
 *         description: Lista de entregas
 *   post:
 *     tags: [Deliveries]
 *     summary: Crea una entrega para un pedido existente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order: { type: string }
 *               driver: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Entrega creada
 *       400:
 *         description: El usuario indicado no es un repartidor (driver)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Pedido o repartidor no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', deliveriesController.findAll);
router.post('/', deliveriesController.create);

/**
 * @openapi
 * /deliveries/{id}:
 *   get:
 *     tags: [Deliveries]
 *     summary: Obtiene una entrega por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *       404:
 *         description: Entrega no encontrada
 *   put:
 *     tags: [Deliveries]
 *     summary: Actualiza una entrega (ej. cambiar status a delivered)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Entrega actualizada
 *       400:
 *         description: Estado invalido
 *       404:
 *         description: Entrega no encontrada
 *   delete:
 *     tags: [Deliveries]
 *     summary: Elimina una entrega
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Entrega eliminada
 *       404:
 *         description: Entrega no encontrada
 */
router.get('/:id', deliveriesController.findById);
router.put('/:id', deliveriesController.update);
router.delete('/:id', deliveriesController.delete);

export default router;
