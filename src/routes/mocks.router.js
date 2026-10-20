import { Router } from 'express';
import mocksController from '../controllers/mocks.controller.js';

const router = Router();

/**
 * @openapi
 * /mocks/users:
 *   get:
 *     tags: [Mocks]
 *     summary: Genera usuarios simulados
 *     description: Devuelve usuarios simulados sin guardarlos en MongoDB.
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         description: Cantidad de usuarios que se deben generar
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         example: 10
 *     responses:
 *       200:
 *         description: Usuarios simulados generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MockUsersResponse'
 *       400:
 *         description: La cantidad no es un entero válido entre 1 y 100
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/users', mocksController.getUsers);

/**
 * @openapi
 * /mocks/orders:
 *   get:
 *     tags: [Mocks]
 *     summary: Genera pedidos simulados
 *     description: Genera pedidos relacionados con usuarios existentes sin guardarlos en MongoDB.
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         description: Cantidad de pedidos que se deben generar
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         example: 10
 *     responses:
 *       200:
 *         description: Pedidos simulados generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MockOrdersResponse'
 *       400:
 *         description: Cantidad inválida o ausencia de usuarios en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno al consultar MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/orders', mocksController.getOrders);

/**
 * @openapi
 * /mocks/deliveries:
 *   get:
 *     tags: [Mocks]
 *     summary: Genera entregas simuladas
 *     description: Genera entregas relacionadas con pedidos y repartidores existentes sin guardarlas.
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         description: Cantidad de entregas que se deben generar
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         example: 10
 *     responses:
 *       200:
 *         description: Entregas simuladas generadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MockDeliveriesResponse'
 *       400:
 *         description: Cantidad inválida o ausencia de pedidos en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno al consultar MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/deliveries', mocksController.getDeliveries);

/**
 * @openapi
 * /mocks/users/seed:
 *   post:
 *     tags: [Mocks]
 *     summary: Inserta usuarios simulados
 *     description: Genera usuarios de prueba, cifra sus contraseñas y los guarda en MongoDB.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MockSeedRequest'
 *           example:
 *             qty: 10
 *     responses:
 *       200:
 *         description: Usuarios simulados insertados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: success
 *               payload:
 *                 insertados: 10
 *                 coleccion: usuarios
 *                 usuarios: []
 *       400:
 *         description: La cantidad no es un entero válido entre 1 y 100
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Falló la inserción de usuarios en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/users/seed', mocksController.seedUsers);

/**
 * @openapi
 * /mocks/orders/seed:
 *   post:
 *     tags: [Mocks]
 *     summary: Inserta pedidos simulados
 *     description: Genera pedidos asociados a usuarios existentes y los guarda en MongoDB.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MockSeedRequest'
 *           example:
 *             qty: 10
 *     responses:
 *       200:
 *         description: Pedidos simulados insertados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: success
 *               payload:
 *                 insertados: 10
 *                 coleccion: pedidos
 *                 pedidos: []
 *       400:
 *         description: Cantidad inválida o ausencia de usuarios en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Falló la inserción de pedidos en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/orders/seed', mocksController.seedOrders);

/**
 * @openapi
 * /mocks/deliveries/seed:
 *   post:
 *     tags: [Mocks]
 *     summary: Inserta entregas simuladas
 *     description: Genera entregas asociadas a pedidos existentes y las guarda en MongoDB.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MockSeedRequest'
 *           example:
 *             qty: 10
 *     responses:
 *       200:
 *         description: Entregas simuladas insertadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: success
 *               payload:
 *                 insertados: 10
 *                 coleccion: entregas
 *                 entregas: []
 *       400:
 *         description: Cantidad inválida o ausencia de pedidos en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Falló la inserción de entregas en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/deliveries/seed', mocksController.seedDeliveries);

/**
 * @openapi
 * /mocks/seed/all:
 *   post:
 *     tags: [Mocks]
 *     summary: Inserta todos los datos simulados
 *     description: Genera e inserta usuarios, pedidos y entregas en ese orden para conservar sus relaciones.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MockSeedAllRequest'
 *           example:
 *             usersQty: 10
 *             ordersQty: 8
 *             deliveriesQty: 5
 *     responses:
 *       200:
 *         description: Datos simulados insertados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: success
 *               payload:
 *                 usuarios: 10
 *                 pedidos: 8
 *                 entregas: 5
 *       400:
 *         description: Alguna cantidad es inválida o faltan datos relacionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Falló alguna inserción en MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/seed/all', mocksController.seedAll);

export default router;
