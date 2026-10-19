import { Router } from 'express';
import mocksController from '../controllers/mocks.controller.js';

const router = Router();

/**
 * @openapi
 * /mocks/users:
 *   get:
 *     tags: [Mocks]
 *     summary: Devuelve usuarios simulados sin guardarlos en la base
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Usuarios simulados
 *       400:
 *         description: qty invalido (no entero, negativo o excede el maximo)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/users', mocksController.getUsers);

/**
 * @openapi
 * /mocks/orders:
 *   get:
 *     tags: [Mocks]
 *     summary: Devuelve pedidos simulados (relacionados a usuarios existentes) sin guardarlos
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Pedidos simulados
 *       400:
 *         description: qty invalido o no hay usuarios cargados
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/orders', mocksController.getOrders);

/**
 * @openapi
 * /mocks/deliveries:
 *   get:
 *     tags: [Mocks]
 *     summary: Devuelve entregas simuladas (relacionadas a pedidos/repartidores existentes) sin guardarlas
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Entregas simuladas
 *       400:
 *         description: qty invalido o no hay pedidos cargados
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/deliveries', mocksController.getDeliveries);

/**
 * @openapi
 * /mocks/users/seed:
 *   post:
 *     tags: [Mocks]
 *     summary: Genera e inserta usuarios de prueba en MongoDB
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: "Ejemplo: { insertados: 10, coleccion: 'usuarios' }"
 *       400:
 *         description: qty invalido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       500:
 *         description: Fallo la carga en MongoDB
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/users/seed', mocksController.seedUsers);

/**
 * @openapi
 * /mocks/orders/seed:
 *   post:
 *     tags: [Mocks]
 *     summary: Genera e inserta pedidos de prueba en MongoDB (requiere usuarios existentes)
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Pedidos insertados
 *       400:
 *         description: qty invalido o no hay usuarios cargados
 */
router.post('/orders/seed', mocksController.seedOrders);

/**
 * @openapi
 * /mocks/deliveries/seed:
 *   post:
 *     tags: [Mocks]
 *     summary: Genera e inserta entregas de prueba en MongoDB (requiere pedidos existentes)
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Entregas insertadas
 *       400:
 *         description: qty invalido o no hay pedidos cargados
 */
router.post('/deliveries/seed', mocksController.seedDeliveries);

/**
 * @openapi
 * /mocks/seed/all:
 *   post:
 *     tags: [Mocks]
 *     summary: Siembra usuarios, pedidos y entregas en cascada, respetando relaciones
 *     parameters:
 *       - in: query
 *         name: usersQty
 *         schema: { type: integer, default: 5 }
 *       - in: query
 *         name: ordersQty
 *         schema: { type: integer, default: 5 }
 *       - in: query
 *         name: deliveriesQty
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: "Ejemplo: { usuarios: 5, pedidos: 5, entregas: 5 }"
 *       400:
 *         description: Alguna cantidad invalida
 */
router.post('/seed/all', mocksController.seedAll);

export default router;
